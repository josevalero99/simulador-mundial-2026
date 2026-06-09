import { NextResponse } from 'next/server'
import { parseOpenfootball } from '@/lib/data/liveResults'

export const revalidate = 60

const SOURCE_URL =
  'https://raw.githubusercontent.com/openfootball/worldcup.json/master/2026/worldcup.json'

export async function GET() {
  try {
    const res = await fetch(SOURCE_URL, { next: { revalidate: 60 } })
    if (!res.ok) {
      return NextResponse.json({ matches: [], error: `upstream ${res.status}` }, { status: 502 })
    }
    const raw = await res.json()
    return NextResponse.json({
      matches: parseOpenfootball(raw),
      fetchedAt: new Date().toISOString(),
    })
  } catch {
    return NextResponse.json({ matches: [], error: 'fetch failed' }, { status: 502 })
  }
}
