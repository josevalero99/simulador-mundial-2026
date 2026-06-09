'use client'

import { useEffect } from 'react'

/** Registers the PWA service worker once on the client. */
export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // registration failures are non-fatal
    })
  }, [])
  return null
}
