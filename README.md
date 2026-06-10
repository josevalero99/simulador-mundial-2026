# Simulador Mundial 2026

Simulador interactivo del Mundial 2026 (estilo "Pedro el Ingeniero"): mete resultados
de la fase de grupos y el simulador aplica en vivo los criterios de desempate de la FIFA,
calcula los mejores terceros, arma el cuadro de eliminatorias y estima probabilidades.

Datos reales del sorteo oficial de Washington (5 dic. 2025): 48 selecciones, 12 grupos (A–L),
incluidos los ganadores de repesca de marzo 2026.

## Stack

- **Next.js 14** (App Router) + **TypeScript** + **Tailwind CSS**
- Todo en cliente, estado en `useReducer` + Context, persistido en `localStorage`
- Motor de simulación en funciones puras (`lib/engine/`), testeado con **Vitest**

## Puesta en marcha

```bash
npm install
npm run dev      # http://localhost:3000
```

```bash
npm test         # tests del motor (Vitest)
npm run build    # build de producción
```

## Funcionalidad (4 pestañas)

1. **Fase de grupos** — 12 grupos con marcadores editables y tabla en vivo; desempates FIFA
   aplicados en tiempo real (Pts → DG → GF → enfrentamiento directo → ranking FIFA), con el
   indicador `i` que explica qué criterio decidió cada empate. Vistas "Por grupos" / "Por fecha".
2. **Mejores terceros** — ranking de los 12 terceros; los 8 mejores clasifican a dieciseisavos.
3. **Eliminatorias** — cuadro oficial desde 16avos; elige ganadores y se propaga hasta la final.
4. **Probabilidades** — % de cada selección por fase vía simulación Monte Carlo del escenario actual.

Además, la pestaña **Porra** permite gestionar **varias porras independientes** (cada una reparte las
48 selecciones), con desglose en vivo de la posición de cada selección en el cuadro más probable y una
vista para comparar el líder actual de cada porra.

### Acciones

- **Simular por ranking** — rellena todos los partidos con un marcador determinista según el ranking FIFA.
- **Rellenar escenario** — rellena con resultados aleatorios plausibles.
- **Limpiar** — vacía todos los marcadores.

## Arquitectura

```
app/                  # layout, página, estilos (tema oscuro)
components/            # UI: shell, pestañas, tarjetas de grupo, bracket, etc.
lib/
  data/               # teams, groups, fixtures, R32 + tabla oficial de terceros
  engine/             # standings, tiebreakers, bestThirds, bracket, montecarlo (funciones puras, TDD)
  store.tsx           # reducer + Context + persistencia localStorage
scripts/
  buildThirdsAllocation.mjs   # regenera la tabla oficial de 495 combinaciones desde Wikipedia
```

## Datos

- **Cruces de eliminatorias** y **asignación de los 8 mejores terceros**: tabla oficial FIFA
  de 495 combinaciones (Anexo C del reglamento), obtenida vía
  `node scripts/buildThirdsAllocation.mjs`.
- `fifaRank` por selección es aproximado al ranking de nov-2025; solo importa el orden relativo
  (desempate final y ponderación de la simulación).

### Fuera de alcance (v1)

- Horas exactas de cada partido oficial (el calendario usa las ventanas de fecha oficiales).
- Cuentas de usuario / compartir escenarios por URL.

## Fuentes

- [2026 FIFA World Cup draw — Wikipedia](https://en.wikipedia.org/wiki/2026_FIFA_World_Cup_draw)
- [2026 FIFA World Cup knockout stage — Wikipedia](https://en.wikipedia.org/wiki/2026_FIFA_World_Cup_knockout_stage)
- [FIFA.com — Final Draw results](https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/articles/final-draw-results)
