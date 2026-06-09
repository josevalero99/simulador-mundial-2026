'use client'

import { useEffect, useRef } from 'react'

interface P {
  x: number
  y: number
  vx: number
  vy: number
  r: number
}

/**
 * Lightweight "constellation" backdrop: dots drift slowly and link with faint
 * lines when near, evoking a dynamic network. Canvas-based, sits behind all
 * content (z-index -1, pointer-events none), DPR-aware, and pauses entirely
 * when the user prefers reduced motion.
 */
export default function ParticlesBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    // Non-null: the effect runs after the <canvas> mounts. Asserted so the
    // nested animation closures keep non-null types.
    const cv = canvasRef.current
    if (!cv) return
    const ctx2d = cv.getContext('2d')
    if (!ctx2d) return
    const el: HTMLCanvasElement = cv
    const c: CanvasRenderingContext2D = ctx2d

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let w = 0
    let h = 0
    let dpr = 1
    let particles: P[] = []
    let raf = 0

    const LINK_DIST = 130 // px in CSS units
    const COLOR = '232, 184, 75' // brand gold (World Cup 2026)

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = window.innerWidth
      h = window.innerHeight
      el.width = w * dpr
      el.height = h * dpr
      el.style.width = `${w}px`
      el.style.height = `${h}px`
      c.setTransform(dpr, 0, 0, dpr, 0, 0)
      // particle count scales with area, capped for performance
      const count = Math.min(80, Math.round((w * h) / 22000))
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        r: Math.random() * 1.6 + 0.8,
      }))
    }

    function draw() {
      c.clearRect(0, 0, w, h)

      // links
      for (let i = 0; i < particles.length; i++) {
        const a = particles[i]
        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j]
          const dx = a.x - b.x
          const dy = a.y - b.y
          const dist = Math.hypot(dx, dy)
          if (dist < LINK_DIST) {
            const alpha = (1 - dist / LINK_DIST) * 0.18
            c.strokeStyle = `rgba(${COLOR}, ${alpha})`
            c.lineWidth = 1
            c.beginPath()
            c.moveTo(a.x, a.y)
            c.lineTo(b.x, b.y)
            c.stroke()
          }
        }
      }

      // dots
      for (const p of particles) {
        c.fillStyle = `rgba(${COLOR}, 0.45)`
        c.beginPath()
        c.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        c.fill()
      }
    }

    function step() {
      for (const p of particles) {
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0 || p.x > w) p.vx *= -1
        if (p.y < 0 || p.y > h) p.vy *= -1
      }
      draw()
      raf = requestAnimationFrame(step)
    }

    resize()
    window.addEventListener('resize', resize)

    if (reduce) {
      draw() // single static frame
    } else {
      raf = requestAnimationFrame(step)
    }

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10"
    />
  )
}
