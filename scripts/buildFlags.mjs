// Descarga las 48 banderas circulares (circle-flags) a public/flags/<iso>.svg.
// Ejecutar: node scripts/buildFlags.mjs   (requiere red)
import { writeFileSync, mkdirSync } from 'node:fs'

const BASE = 'https://cdn.jsdelivr.net/gh/HatScripts/circle-flags/flags'
const ISOS = [
  'mx', 'kr', 'za', 'cz', 'ca', 'ch', 'qa', 'ba',
  'br', 'ma', 'gb-sct', 'ht', 'us', 'au', 'py', 'tr',
  'de', 'ec', 'ci', 'cw', 'nl', 'jp', 'tn', 'se',
  'be', 'ir', 'eg', 'nz', 'es', 'uy', 'sa', 'cv',
  'fr', 'sn', 'no', 'iq', 'ar', 'at', 'dz', 'jo',
  'pt', 'co', 'uz', 'cd', 'gb-eng', 'hr', 'pa', 'gh',
]

mkdirSync(new URL('../public/flags/', import.meta.url), { recursive: true })

let ok = 0
for (const iso of ISOS) {
  const res = await fetch(`${BASE}/${iso}.svg`)
  if (!res.ok) {
    console.error(`FALLO ${iso}: HTTP ${res.status}`)
    process.exit(1)
  }
  const svg = await res.text()
  if (!svg.includes('<svg')) {
    console.error(`FALLO ${iso}: la respuesta no parece SVG`)
    process.exit(1)
  }
  writeFileSync(new URL(`../public/flags/${iso}.svg`, import.meta.url), svg)
  ok++
}
console.log(`OK — ${ok} banderas en public/flags/`)
