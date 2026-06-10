'use client'

import { useState } from 'react'
import { useStore } from '@/lib/store'
import { encodeScenario, decodeScenario } from '@/lib/share'

const SAVES_KEY = 'wc2026-saves'
const MAX_SAVES = 20

export interface SavedPrediction {
  name: string
  e: string
  savedAt: string
}

export function readSaves(): SavedPrediction[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(SAVES_KEY)
    if (!raw) return []
    const data = JSON.parse(raw)
    if (!Array.isArray(data)) return []
    return data.filter(
      (x): x is SavedPrediction =>
        x &&
        typeof x.name === 'string' &&
        typeof x.e === 'string' &&
        typeof x.savedAt === 'string',
    )
  } catch {
    return []
  }
}

export function writeSaves(saves: SavedPrediction[]): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(SAVES_KEY, JSON.stringify(saves))
  } catch {
    // ignore quota errors
  }
}

export function formatDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
}

export interface SaveShare {
  copied: boolean
  saves: SavedPrediction[]
  refresh: () => void
  handleShare: () => Promise<void>
  handleSave: () => void
  handleLoad: (e: string) => void
  handleDelete: (savedAt: string) => void
}

/** Lógica compartida de guardar/compartir, reusada por el dropdown desktop y la hoja móvil. */
export function useSaveShare(): SaveShare {
  const { state, dispatch } = useStore()
  const [copied, setCopied] = useState(false)
  const [saves, setSaves] = useState<SavedPrediction[]>([])

  const refresh = () => setSaves(readSaves())

  const handleShare = async () => {
    if (typeof window === 'undefined') return
    const url = `${window.location.origin}${window.location.pathname}?e=${encodeScenario(state.matches)}`
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      try {
        window.prompt('Copia el enlace:', url)
      } catch {
        // ignore
      }
    }
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2000)
  }

  const handleSave = () => {
    if (typeof window === 'undefined') return
    const name = window.prompt('Nombre de la predicción')
    if (!name || !name.trim()) return
    const entry: SavedPrediction = {
      name: name.trim(),
      e: encodeScenario(state.matches),
      savedAt: new Date().toISOString(),
    }
    const next = [entry, ...readSaves()].slice(0, MAX_SAVES)
    writeSaves(next)
    setSaves(next)
  }

  const handleLoad = (e: string) => {
    const scores = decodeScenario(e)
    if (scores) dispatch({ type: 'APPLY_SCENARIO', scores })
  }

  const handleDelete = (savedAt: string) => {
    const next = readSaves().filter((s) => s.savedAt !== savedAt)
    writeSaves(next)
    setSaves(next)
  }

  return { copied, saves, refresh, handleShare, handleSave, handleLoad, handleDelete }
}
