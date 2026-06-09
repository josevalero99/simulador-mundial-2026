'use client'

import { createContext, useContext, useEffect, useState } from 'react'

const STORAGE_KEY = 'wc2026-fav'

interface FavoriteValue {
  favorite: string | null
  setFavorite: (id: string | null) => void
}

const FavoriteContext = createContext<FavoriteValue | null>(null)

export function FavoriteProvider({ children }: { children: React.ReactNode }) {
  const [favorite, setFav] = useState<string | null>(null)

  // Hydrate from localStorage on mount.
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY)
      if (stored) setFav(stored)
    } catch {
      // ignore unavailable / blocked storage
    }
  }, [])

  const setFavorite = (id: string | null) => {
    setFav(id)
    if (typeof window === 'undefined') return
    try {
      if (id === null) window.localStorage.removeItem(STORAGE_KEY)
      else window.localStorage.setItem(STORAGE_KEY, id)
    } catch {
      // ignore quota / blocked storage errors
    }
  }

  return (
    <FavoriteContext.Provider value={{ favorite, setFavorite }}>
      {children}
    </FavoriteContext.Provider>
  )
}

/** Favorite-team hook. Safe no-provider fallback (no-op setter). */
export function useFavorite(): FavoriteValue {
  const ctx = useContext(FavoriteContext)
  if (!ctx) return { favorite: null, setFavorite() {} }
  return ctx
}
