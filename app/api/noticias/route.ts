import { NextResponse } from 'next/server'

// Aggregated World Cup 2026 headlines via Google News RSS (Spanish). No API key.
// We return only headline + source + date + link to the original article.
export const revalidate = 1800 // 30 min

const FEED_GENERAL =
  'https://news.google.com/rss/search?q=Mundial+2026+f%C3%BAtbol&hl=es&gl=ES&ceid=ES:es'
const FEED_ESPANA =
  'https://news.google.com/rss/search?q=selecci%C3%B3n+espa%C3%B1ola+Mundial+2026&hl=es&gl=ES&ceid=ES:es'

// Heuristic: does a headline concern the Spain national team?
function isSpain(title: string): boolean {
  const t = title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
  return /espan|la roja/.test(t)
}

function decode(s: string): string {
  return s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16)))
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .trim()
}

const pick = (block: string, tag: string): string => {
  const m = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`).exec(block)
  return m ? decode(m[1]) : ''
}

export interface NewsItem {
  title: string
  link: string
  source: string
  pubDate: string
  spain: boolean // concerns the Spain national team
}

function parseItems(xml: string): NewsItem[] {
  return [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)]
    .map((m) => {
      const block = m[1]
      const source = pick(block, 'source')
      let title = pick(block, 'title')
      // Google News titles are "Headline - Source"; drop the trailing source.
      if (source && title.endsWith(` - ${source}`)) {
        title = title.slice(0, -(` - ${source}`.length))
      }
      return {
        title,
        link: pick(block, 'link'),
        source,
        pubDate: pick(block, 'pubDate'),
        spain: isSpain(title),
      }
    })
    .filter((i) => i.title && i.link)
}

const dedupeKey = (t: string) =>
  t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '').slice(0, 60)

export async function GET() {
  try {
    const opts = {
      next: { revalidate: 1800 },
      headers: { 'User-Agent': 'simulador-mundial-2026/1.0' },
    }
    const [gRes, eRes] = await Promise.all([fetch(FEED_GENERAL, opts), fetch(FEED_ESPANA, opts)])
    if (!gRes.ok && !eRes.ok) {
      return NextResponse.json({ items: [], error: 'upstream' }, { status: 502 })
    }
    const general = gRes.ok ? parseItems(await gRes.text()) : []
    const espana = eRes.ok ? parseItems(await eRes.text()) : []

    // Merge + dedupe (Spain-tagged wins so the España filter keeps good coverage).
    const byKey = new Map<string, NewsItem>()
    for (const it of [...general, ...espana]) {
      const k = dedupeKey(it.title)
      const prev = byKey.get(k)
      if (!prev) byKey.set(k, it)
      else if (it.spain && !prev.spain) byKey.set(k, { ...prev, spain: true })
    }
    const items = [...byKey.values()]
      .sort((a, b) => (Date.parse(b.pubDate) || 0) - (Date.parse(a.pubDate) || 0))
      .slice(0, 50)

    return NextResponse.json({ items, fetchedAt: new Date().toISOString() })
  } catch {
    return NextResponse.json({ items: [], error: 'fetch-failed' }, { status: 502 })
  }
}
