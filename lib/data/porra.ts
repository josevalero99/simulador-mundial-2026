import { TEAMS } from '@/lib/data/teams'

/** A porra participant and the 4 national teams they own. */
export interface PorraEntry {
  name: string
  teams: string[]
}

/** A named porra: a set of participants that partition the 48 teams. */
export interface Porra {
  id: string
  name: string
  entries: PorraEntry[]
}

/** The full persisted state: all porras plus which one is active. */
export interface PorrasState {
  porras: Porra[]
  activeId: string
}

let _idCounter = 0

/** Unique id: crypto.randomUUID when available, else a monotonic fallback. */
export function genId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  _idCounter += 1
  return `porra-${_idCounter}-${Math.floor(performance.now?.() ?? _idCounter)}`
}

/**
 * The default porra: 12 participants, 4 teams each, partitioning all 48 teams.
 * (Best-effort decode of a screenshot; what matters is a valid partition.)
 */
export const DEFAULT_PORRA: PorraEntry[] = [
  { name: 'JUANCAR', teams: ['POR', 'SWE', 'CZE', 'BIH'] },
  { name: 'HERNAN', teams: ['BRA', 'MAR', 'SEN', 'HAI'] },
  { name: 'RAFA', teams: ['ESP', 'CAN', 'CIV', 'CUW'] },
  { name: 'JOSE', teams: ['FRA', 'NOR', 'KSA', 'JOR'] },
  { name: 'MARIO', teams: ['ARG', 'RSA', 'AUS', 'EGY'] },
  { name: 'ALVARO', teams: ['GER', 'JPN', 'KOR', 'NZL'] },
  { name: 'ROBER', teams: ['ENG', 'TUR', 'AUT', 'QAT'] },
  { name: 'JOHN', teams: ['NED', 'USA', 'IRN', 'UZB'] },
  { name: 'JULIO', teams: ['COL', 'URU', 'PAR', 'TUN'] },
  { name: 'JUANBA', teams: ['BEL', 'ECU', 'ALG', 'GHA'] },
  { name: 'PABLO', teams: ['CPV', 'CRO', 'IRQ', 'COD'] },
  { name: 'JAIME', teams: ['SUI', 'MEX', 'SCO', 'PAN'] },
]

/** Deep-clones DEFAULT_PORRA into a fresh named porra with a unique id. */
export function newPorra(name: string): Porra {
  return {
    id: genId(),
    name,
    entries: DEFAULT_PORRA.map(e => ({ name: e.name, teams: [...e.teams] })),
  }
}

function isValidEntry(e: unknown): e is PorraEntry {
  return (
    !!e &&
    typeof e === 'object' &&
    typeof (e as PorraEntry).name === 'string' &&
    Array.isArray((e as PorraEntry).teams) &&
    (e as PorraEntry).teams.length > 0 &&
    (e as PorraEntry).teams.every(t => typeof t === 'string')
  )
}

/** Shape check only (not a partition check): a non-empty array of valid entries. */
export function isValidPorra(value: unknown): value is PorraEntry[] {
  return Array.isArray(value) && value.length > 0 && value.every(isValidEntry)
}

export function isValidPorrasState(value: unknown): value is PorrasState {
  if (!value || typeof value !== 'object') return false
  const v = value as PorrasState
  return (
    Array.isArray(v.porras) &&
    v.porras.length > 0 &&
    v.porras.every(
      p =>
        !!p &&
        typeof p.id === 'string' &&
        typeof p.name === 'string' &&
        isValidPorra(p.entries),
    ) &&
    typeof v.activeId === 'string'
  )
}

/** Result of checking whether entries form a valid partition of all 48 teams. */
export interface PartitionCheck {
  valid: boolean
  duplicated: string[]
  unassigned: string[]
}

export function checkPartition(entries: PorraEntry[]): PartitionCheck {
  const counts: Record<string, number> = {}
  for (const e of entries) {
    for (const id of e.teams) {
      counts[id] = (counts[id] ?? 0) + 1
    }
  }
  const duplicated = Object.keys(counts).filter(id => counts[id] > 1)
  const unassigned = Object.keys(TEAMS).filter(id => !counts[id])
  return {
    valid: duplicated.length === 0 && unassigned.length === 0,
    duplicated,
    unassigned,
  }
}

/**
 * Produces a valid PorrasState from the raw values of the new (`v2Raw`) and the
 * legacy single-porra (`oldRaw`) storage keys. Idempotent on a valid state;
 * repairs a dangling activeId; falls back to a fresh default porra.
 */
export function migrate(v2Raw: unknown, oldRaw: unknown): PorrasState {
  if (isValidPorrasState(v2Raw)) {
    const exists = v2Raw.porras.some(p => p.id === v2Raw.activeId)
    return exists ? v2Raw : { porras: v2Raw.porras, activeId: v2Raw.porras[0].id }
  }
  if (isValidPorra(oldRaw)) {
    const p: Porra = { id: genId(), name: 'Porra', entries: oldRaw }
    return { porras: [p], activeId: p.id }
  }
  const p = newPorra('Porra')
  return { porras: [p], activeId: p.id }
}
