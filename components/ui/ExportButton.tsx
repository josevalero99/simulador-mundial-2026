'use client'

import { useState } from 'react'
import { ImageDown } from 'lucide-react'
import { exportElementToPng } from '@/lib/exportImage'

interface ExportButtonProps {
  targetRef: React.RefObject<HTMLElement>
  filename: string
  label?: string
}

type Status = 'idle' | 'exporting' | 'error'

/** Secondary glass button that exports a referenced element to a PNG download. */
export default function ExportButton({
  targetRef,
  filename,
  label = 'Exportar imagen',
}: ExportButtonProps) {
  const [status, setStatus] = useState<Status>('idle')

  const handleClick = async () => {
    if (!targetRef.current || status === 'exporting') return
    setStatus('exporting')
    try {
      await exportElementToPng(targetRef.current, filename)
      setStatus('idle')
    } catch {
      setStatus('error')
      setTimeout(() => setStatus('idle'), 2000)
    }
  }

  const text = status === 'exporting' ? 'Exportando…' : status === 'error' ? 'Error' : label

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={status === 'exporting'}
      className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-[#f5f5f5] backdrop-blur-md transition-colors hover:bg-white/10 disabled:opacity-60"
    >
      <ImageDown size={14} strokeWidth={2} aria-hidden="true" />
      {text}
    </button>
  )
}
