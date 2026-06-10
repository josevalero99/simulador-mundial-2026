# Banderas circulares (SVG) — Diseño

**Fecha:** 2026-06-10
**Estado:** Diseño aprobado, pendiente de plan de implementación

## Problema / Objetivo

Las banderas son **emojis** (`team.flag`). En Windows y algunos navegadores no renderizan como bandera (muestran "ES") y el estilo varía por dispositivo. Sustituirlas por **banderas SVG circulares** (circle-flags, HatScripts), **empaquetadas** en el propio origen para que funcionen **offline** (la app es PWA) y se vean consistentes en todas partes. Aplicar a **toda** la app (componente `Flag` + los sitios que hoy pintan el emoji directo).

## Diseño aprobado

### 1. Banderas empaquetadas (offline)
- `scripts/buildFlags.mjs` (patrón de los `scripts/build*.mjs`): descarga las 48 banderas circulares de circle-flags a `public/flags/<iso>.svg`.
  - Fuente: `https://cdn.jsdelivr.net/gh/HatScripts/circle-flags/flags/<iso>.svg` (o el raw de GitHub como respaldo).
  - Lista de ISO a descargar = los valores del mapa `isoOf` (incluye `gb-eng`, `gb-sct`).
  - Falla ruidosamente (no escribe un SVG vacío) si alguna descarga no es 200 / no parece SVG.
- Servidas desde nuestro origen (`/flags/...`), así que el service worker de la PWA las cachea (vs. un CDN externo que rompería offline).

### 2. Mapa id→ISO (lógica pura)
`lib/data/flags.ts`:
```ts
/** Código ISO alpha-2 (minúsculas) de circle-flags para un teamId; undefined si no se conoce. */
export function isoOf(teamId: string): string | undefined
```
Mapa de las 48 selecciones (de `GROUPS`):
```
MEX→mx KOR→kr RSA→za CZE→cz   CAN→ca SUI→ch QAT→qa BIH→ba
BRA→br MAR→ma SCO→gb-sct HAI→ht   USA→us AUS→au PAR→py TUR→tr
GER→de ECU→ec CIV→ci CUW→cw   NED→nl JPN→jp TUN→tn SWE→se
BEL→be IRN→ir EGY→eg NZL→nz   ESP→es URU→uy KSA→sa CPV→cv
FRA→fr SEN→sn NOR→no IRQ→iq   ARG→ar AUT→at ALG→dz JOR→jo
POR→pt COL→co UZB→uz COD→cd   ENG→gb-eng CRO→hr PAN→pa GHA→gh
```

### 3. Componente `Flag` (reescrito)
`components/ui/Flag.tsx` — misma API `{ teamId, className }`:
```tsx
import { TEAMS } from '@/lib/data/teams'
import { isoOf } from '@/lib/data/flags'

interface FlagProps { teamId: string; className?: string }

export default function Flag({ teamId, className }: FlagProps) {
  const team = TEAMS[teamId]
  const label = team?.name ?? teamId
  const iso = isoOf(teamId)
  if (!iso) {
    return <span role="img" aria-label={label} className={className}>{team?.flag ?? '🏳️'}</span>
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/flags/${iso}.svg`}
      alt={label}
      className={`inline-block h-[1em] w-[1em] shrink-0 rounded-full align-[-0.125em] ${className ?? ''}`}
    />
  )
}
```
- **Tamaño = `1em`**: la bandera escala con el `font-size` del contexto, igual que el emoji. Así los sitios que ya pasan `text-base`/`text-4xl` siguen funcionando sin cambios de tamaño.
- **`rounded-full`**: por seguridad (las SVG de circle-flags ya son circulares).
- **Fallback al emoji** si `isoOf` devuelve `undefined` → la app nunca se rompe.

### 4. Convertir los emoji directos
Reemplazar `{x.flag}` (o `<span>{flag}</span>`) por `<Flag teamId={x.id} className=… />`, conservando el tamaño que tenían:
- `components/favorite/FavoritePicker.tsx` (item de lista, 1).
- `components/comparador/TeamSelect.tsx` (botón + items, 2) — el botón usa el `value`.
- `components/porra/PorraEditor.tsx` (1, inline con el nombre).
- `components/comparador/ComparadorTab.tsx` (~10): hero (`text-4xl`), filas de forma, h2h, marcador, % campeón. Los inline (`{flag} {name}`) heredan el font-size → tamaño correcto.

Los **19 usos de `<Flag>`** existentes (StandingsTable, FixtureList, BracketMatch, etc.) no requieren cambios: se actualizan al reescribir `Flag`.

## Arquitectura / unidades
- `lib/data/flags.ts` — dato puro (id→ISO). Una responsabilidad, testeable.
- `components/ui/Flag.tsx` — presentación de una bandera. Única fuente de verdad para renderizar banderas.
- `scripts/buildFlags.mjs` — preparación de assets (build-time).
- `public/flags/*.svg` — assets servidos.

## Errores / casos límite
- **id no mapeado** o **SVG ausente**: `Flag` cae al emoji (`team.flag`), con `🏳️` como último recurso.
- **Selección placeholder** (sin equipo en TEAMS): `alt`/fallback usan el id.
- El script aborta si una descarga falla (no deja archivos corruptos).

## Testing
- `lib/data/flags.test.ts` (vitest, node): las 48 selecciones de `GROUPS` tienen `isoOf` definido; casos concretos `ESP→es`, `ENG→gb-eng`, `SCO→gb-sct`; un id desconocido → `undefined`.
- **Sanidad de assets**: test que, para cada id de `GROUPS`, exista `public/flags/${isoOf(id)}.svg` (lee fs). Ata el mapa a los archivos descargados.
- Componentes: sin infra de test de componentes → `npm run lint` + `npm run build` + checklist manual:
  - Banderas circulares en standings, fixtures, bracket, probabilidades, cuotas, porra, comparador, picker, banner.
  - Tamaño coherente con el texto (si se ven pequeñas, subir a `1.1em`).
  - **Offline**: tras la primera carga, en modo avión las banderas siguen apareciendo (cacheadas por el SW). Si no, añadir regla de runtime-cache para `/flags/` en el service worker.

## Fuera de alcance (futuro)
- Anillo/borde decorativo alrededor de las banderas.
- `next/image` (se usa `<img>` con `eslint-disable`, lo idóneo para SVG pequeños locales).
- Sincronización automática del mapa con la lista del script (se mantienen a mano; el test de sanidad detecta desajustes).
