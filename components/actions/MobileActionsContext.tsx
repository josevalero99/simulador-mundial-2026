'use client'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'

export interface ContextualAction {
  label: string
  run: () => void
}

interface MobileActionsValue {
  exportAction: ContextualAction | null
  setExportAction: (a: ContextualAction | null) => void
}

const Ctx = createContext<MobileActionsValue | null>(null)

export function MobileActionsProvider({ children }: { children: React.ReactNode }) {
  const [exportAction, setExportAction] = useState<ContextualAction | null>(null)
  const value = useMemo(() => ({ exportAction, setExportAction }), [exportAction])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useMobileActions(): MobileActionsValue {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useMobileActions must be used within MobileActionsProvider')
  return ctx
}

/**
 * Registra una acción de exportar mientras el componente que llama esté montado.
 * Pasa `run` memoizado (useCallback) para evitar re-registros en cada render.
 */
export function useRegisterExport(label: string | null, run: (() => void) | null) {
  const { setExportAction } = useMobileActions()
  useEffect(() => {
    if (label && run) setExportAction({ label, run })
    else setExportAction(null)
    return () => setExportAction(null)
  }, [label, run, setExportAction])
}
