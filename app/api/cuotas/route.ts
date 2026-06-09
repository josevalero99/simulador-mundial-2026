import { NextResponse } from 'next/server'
import { normalizeH2H, normalizeOutrights } from '@/lib/data/oddsParse'

export const revalidate = 3600

const BASE = 'https://api.the-odds-api.com/v4/sports'

export async function GET() {
  const key = process.env.ODDS_API_KEY
  if (!key) return NextResponse.json({ configured: false })
  try {
    const q = `regions=eu&oddsFormat=decimal&apiKey=${key}`
    const [h2hRes, outRes] = await Promise.all([
      fetch(`${BASE}/soccer_fifa_world_cup/odds/?markets=h2h&${q}`, {
        next: { revalidate: 3600 },
      }),
      fetch(`${BASE}/soccer_fifa_world_cup_winner/odds/?markets=outrights&${q}`, {
        next: { revalidate: 3600 },
      }),
    ])
    const h2hRaw = h2hRes.ok ? await h2hRes.json() : []
    const outRaw = outRes.ok ? await outRes.json() : []
    return NextResponse.json({
      configured: true,
      fetchedAt: new Date().toISOString(),
      matches: normalizeH2H(h2hRaw),
      outrights: normalizeOutrights(outRaw),
    })
  } catch {
    return NextResponse.json(
      { configured: true, error: 'fetch-failed', matches: [], outrights: [] },
      { status: 502 },
    )
  }
}
