# Simulador Mundial 2026 — Diseño

**Fecha:** 2026-06-09
**Estado:** Aprobado (pendiente revisión de spec por el usuario)

## Objetivo

Aplicación web que reproduce el "Simulador Mundial 2026" estilo Pedro el Ingeniero:
el usuario mete resultados de la fase de grupos y el simulador aplica en vivo los
criterios de desempate de la FIFA, calcula los mejores terceros, arma el cuadro de
eliminatorias y estima probabilidades. Datos reales del sorteo oficial de Washington
(5 dic. 2025).

## Stack

- **Next.js 14** (App Router) + **TypeScript** + **Tailwind CSS**.
- Sin backend: todo en cliente. Estado con `useReducer` + Context, persistido en `localStorage`.
- Despliegue objetivo: Vercel.
- Tests: **Vitest** para todo `lib/engine/`.

## Datos reales (verificados)

48 selecciones, 12 grupos (A–L), incluidos los ganadores de repesca de marzo 2026.

| Grupo | Pot 1 | Pot 2 | Pot 3 | Pot 4 |
|---|---|---|---|---|
| A | México | Corea del Sur | Sudáfrica | Chequia (UEFA-D) |
| B | Canadá | Suiza | Catar | Bosnia y H. (UEFA-A) |
| C | Brasil | Marruecos | Escocia | Haití |
| D | EE. UU. | Australia | Paraguay | Turquía (UEFA-C) |
| E | Alemania | Ecuador | Costa de Marfil | Curazao |
| F | Países Bajos | Japón | Túnez | Suecia (UEFA-B) |
| G | Bélgica | Irán | Egipto | Nueva Zelanda |
| H | España | Uruguay | Arabia Saudí | Cabo Verde |
| I | Francia | Senegal | Noruega | Irak (IC-2) |
| J | Argentina | Austria | Argelia | Jordania |
| K | Portugal | Colombia | Uzbekistán | RD Congo (IC-1) |
| L | Inglaterra | Croacia | Panamá | Ghana |

> Nota: el orden de pots es informativo. La tabla de cada grupo se ordena por los criterios de desempate.

**Calendario:** se genera el round-robin de cada grupo (3 jornadas, 6 partidos) dentro de
la ventana oficial de fase de grupos (11–27 jun 2026). Las horas exactas de cada fixture
oficial quedan fuera de alcance v1 (se pueden cablear después con la lista oficial completa).

## Modelo de datos

```ts
type Team = { id: string; name: string; flag: string; confederation: Confed; pot: 1|2|3|4; fifaRank: number }
type GroupId = 'A'|...|'L'
type Match = { id: string; group: GroupId; matchday: 1|2|3; home: string; away: string;
               date: string; homeGoals: number|null; awayGoals: number|null }
type StandingRow = { teamId; played; won; drawn; lost; gf; ga; gd; points;
                     rank: number; tiebreakApplied?: string }  // 'i' explicable
```

## Motor de simulación (`lib/engine/`) — TDD

- **`standings.ts`** — calcula la tabla de un grupo a partir de los resultados.
- **`tiebreakers.ts`** — criterios FIFA en orden:
  1. Puntos
  2. Diferencia de goles (todos los partidos del grupo)
  3. Goles a favor (todos los partidos)
  4. *(entre empatados)* Puntos en enfrentamientos directos
  5. Diferencia de goles en directos
  6. Goles a favor en directos
  7. Puntos de juego limpio (conducta)
  8. Ranking FIFA / sorteo
  Marca en `tiebreakApplied` qué criterio decidió cada posición (la "i" de la referencia).
- **`bestThirds.ts`** — rankea los 12 terceros (Pts → DG → GF → conducta → ranking FIFA),
  toma los 8 mejores y los asigna a sus huecos del cuadro según la **tabla oficial FIFA de
  495 combinaciones** (C(12,8)). La tabla se importa como dato (`lib/data/thirdsAllocation.ts`),
  parseada desde la fuente oficial.
- **`bracket.ts`** — progresión R32 → 8vos → 4tos → semis → final con los cruces oficiales.
- **`montecarlo.ts`** — corre N simulaciones (resultados ponderados por ranking FIFA) para
  estimar probabilidad de cada selección de superar cada fase y de ganar el torneo.

### Cruces oficiales de 16avos (Round of 32)

```
2A-2B · 1C-2F · 1E-3º(A/B/C/D/F) · 1F-2C · 2E-2I · 1I-3º(C/D/F/G/H) ·
1A-3º(C/E/F/H/I) · 1L-3º(E/H/I/J/K) · 1G-3º(A/E/H/I/J) · 1D-3º(B/E/F/I/J) ·
1H-2J · 2K-2L · 1B-3º(E/F/G/I/J) · 2D-2G · 1J-2H · 1K-3º(D/E/I/J/L)
```

## UI — 4 pestañas (tema oscuro, fiel a la referencia)

1. **Fase de grupos** — tarjetas por grupo con marcadores editables y tabla en vivo
   (PTS, PJ, G, E, P, DG). Vistas "Por grupos" / "Por fecha". Acciones globales:
   *Simular por ranking* · *Rellenar escenario* · *Limpiar*. Leyenda de clasificación
   (1º/2º directos, 3º a tabla de terceros, 4º eliminado, `i` = desempate aplicado).
2. **Mejores terceros** — tabla de los 12 terceros con los 8 mejores resaltados.
3. **Eliminatorias** — cuadro interactivo desde 16avos hasta la final.
4. **Probabilidades** — % por selección (Monte Carlo).

## Estructura de archivos

```
app/page.tsx                      # layout + navegación de pestañas
app/globals.css
components/
  TabNav.tsx
  group-stage/{GroupCard,StandingsTable,ScoreInput,FixtureList}.tsx
  thirds/ThirdsTable.tsx
  bracket/{Bracket,BracketMatch}.tsx
  probabilities/ProbsPanel.tsx
  ui/{Flag,Badge}.tsx
lib/
  data/{teams,groups,fixtures,thirdsAllocation}.ts
  engine/{standings,tiebreakers,bestThirds,bracket,montecarlo}.ts
  store.tsx                       # reducer + Context + persistencia localStorage
  types.ts
lib/engine/__tests__/*.test.ts    # Vitest
```

## Flujo de datos

`store` (resultados de partidos) → `standings`+`tiebreakers` por grupo → clasificados
(1º/2º) + `bestThirds` (8 mejores) → `bracket` (cruces oficiales) → render. La pestaña
de Probabilidades clona el estado y lo pasa por `montecarlo` sin mutar la sesión.

## Manejo de errores / validación

- Marcadores: enteros ≥ 0; campos vacíos = partido no jugado (no cuenta).
- El bracket solo se rellena cuando los 12 grupos están completos; si no, muestra estado parcial.
- Persistencia tolerante: si el `localStorage` está corrupto, se reinicia a estado limpio.

## Testing

- TDD en todo `lib/engine/`: casos de cada criterio de desempate (incluido head-to-head
  entre 2 y entre 3 equipos), ranking de terceros, asignación de terceros al cuadro
  (varias combinaciones de la tabla oficial), y propagación del bracket.
- UI validada visualmente (sin tests automáticos en v1).

## Fuera de alcance (v1 / YAGNI)

- Horas oficiales exactas de cada fixture.
- Cuentas de usuario / compartir escenarios por URL.
- Animaciones avanzadas.

## Fuentes

- 2026 FIFA World Cup draw — Wikipedia
- 2026 FIFA World Cup knockout stage — Wikipedia (cruces R32 + tabla 495 combinaciones)
- FIFA.com Final Draw results
