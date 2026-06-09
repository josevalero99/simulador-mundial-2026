import { NextResponse } from 'next/server'

// Aggregated World Cup 2026 headlines via Google News RSS (Spanish). No API key.
// We return only headline + source + date + link to the original article.
export const revalidate = 1800 // 30 min

const FEED =
  'https://news.google.com/rss/search?q=Mundial+2026+f%C3%BAtbol&hl=es&gl=ES&ceid=ES:es'

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
}

export async function GET() {
  try {
    const res = await fetch(FEED, {
      next: { revalidate: 1800 },
      headers: { 'User-Agent': 'simulador-mundial-2026/1.0' },
    })
    if (!res.ok) {
      return NextResponse.json({ items: [], error: `upstream ${res.status}` }, { status: 502 })
    }
    const xml = await res.text()
    const items: NewsItem[] = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)]
      .slice(0, 30)
      .map((m) => {
        const block = m[1]
        const source = pick(block, 'source')
        let title = pick(block, 'title')
        // Google News titles are "Headline - Source"; drop the trailing source.
        if (source && title.endsWith(` - ${source}`)) {
          title = title.slice(0, -(` - ${source}`.length))
        }
        return { title, link: pick(block, 'link'), source, pubDate: pick(block, 'pubDate') }
      })
      .filter((i) => i.title && i.link)
    return NextResponse.json({ items, fetchedAt: new Date().toISOString() })
  } catch {
    return NextResponse.json({ items: [], error: 'fetch-failed' }, { status: 502 })
  }
}
