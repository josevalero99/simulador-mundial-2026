'use client'

import { useEffect, useRef } from 'react'

interface P {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  angle: number
  va: number // angular velocity
}

const GOLD = '232, 184, 75'

/** Pre-render a small soccer-ball sprite (gold outline + pentagon + seams) once. */
function buildBall(px: number): HTMLCanvasElement {
  const c = document.createElement('canvas')
  c.width = px
  c.height = px
  const g = c.getContext('2d')!
  const r = px / 2
  const cx = r
  const cy = r
  const rr = r * 0.82

  // ball body
  g.beginPath()
  g.arc(cx, cy, rr, 0, Math.PI * 2)
  g.fillStyle = `rgba(${GOLD}, 0.08)`
  g.fill()
  g.lineWidth = px * 0.05
  g.strokeStyle = `rgba(${GOLD}, 0.65)`
  g.stroke()

  // central pentagon
  const pent: [number, number][] = []
  const pr = rr * 0.42
  for (let i = 0; i < 5; i++) {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / 5
    pent.push([cx + pr * Math.cos(a), cy + pr * Math.sin(a)])
  }
  g.beginPath()
  pent.forEach(([x, y], i) => (i === 0 ? g.moveTo(x, y) : g.lineTo(x, y)))
  g.closePath()
  g.fillStyle = `rgba(${GOLD}, 0.55)`
  g.fill()

  // seams from pentagon vertices to the rim
  g.lineWidth = px * 0.04
  g.strokeStyle = `rgba(${GOLD}, 0.45)`
  pent.forEach(([x, y]) => {
    const a = Math.atan2(y - cy, x - cx)
    g.beginPath()
    g.moveTo(x, y)
    g.lineTo(cx + rr * Math.cos(a), cy + rr * Math.sin(a))
    g.stroke()
  })
  return c
}

/**
 * Football-flavoured backdrop: small soccer balls drift and rotate slowly,
 * linked by faint "pass" lines when near. Canvas-based, behind all content
 * (z-index -1, pointer-events none), DPR-aware, paused on reduced motion.
 */
export default function ParticlesBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const cv = canvasRef.current
    if (!cv) return
    const ctx2d = cv.getContext('2d')
    if (!ctx2d) return
    const el: HTMLCanvasElement = cv
    const c: CanvasRenderingContext2D = ctx2d

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const sprite = buildBall(64)
    let w = 0
    let h = 0
    let dpr = 1
    let balls: P[] = []
    let raf = 0

    const LINK_DIST = 160

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = window.innerWidth
      h = window.innerHeight
      el.width = w * dpr
      el.height = h * dpr
      el.style.width = `${w}px`
      el.style.height = `${h}px`
      c.setTransform(dpr, 0, 0, dpr, 0, 0)
      const count = Math.min(26, Math.max(6, Math.round((w * h) / 38000)))
      balls = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.22,
        vy: (Math.random() - 0.5) * 0.22,
        size: Math.random() * 9 + 11, // 11–20px
        angle: Math.random() * Math.PI * 2,
        va: (Math.random() - 0.5) * 0.004,
      }))
    }

    function draw() {
      c.clearRect(0, 0, w, h)

      // pass lines
      for (let i = 0; i < balls.length; i++) {
        for (let j = i + 1; j < balls.length; j++) {
          const dx = balls[i].x - balls[j].x
          const dy = balls[i].y - balls[j].y
          const dist = Math.hypot(dx, dy)
          if (dist < LINK_DIST) {
            c.strokeStyle = `rgba(${GOLD}, ${(1 - dist / LINK_DIST) * 0.16})`
            c.lineWidth = 1
            c.beginPath()
            c.moveTo(balls[i].x, balls[i].y)
            c.lineTo(balls[j].x, balls[j].y)
            c.stroke()
          }
        }
      }

      // balls
      for (const b of balls) {
        c.save()
        c.translate(b.x, b.y)
        c.rotate(b.angle)
        c.drawImage(sprite, -b.size / 2, -b.size / 2, b.size, b.size)
        c.restore()
      }
    }

    function step() {
      for (const b of balls) {
        b.x += b.vx
        b.y += b.vy
        b.angle += b.va
        if (b.x < -20) b.x = w + 20
        else if (b.x > w + 20) b.x = -20
        if (b.y < -20) b.y = h + 20
        else if (b.y > h + 20) b.y = -20
      }
      draw()
      raf = requestAnimationFrame(step)
    }

    resize()
    window.addEventListener('resize', resize)

    if (reduce) {
      draw()
    } else {
      raf = requestAnimationFrame(step)
    }

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none fixed inset-0 -z-[1]" />
  )
}
