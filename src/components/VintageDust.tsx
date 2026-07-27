import { useEffect, useRef } from 'react'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  opacity: number
  speed: number
  hue: number
}

const GOLD_PALETTE = [
  { h: 42, s: 55, b: 82 },  // gold
  { h: 40, s: 35, b: 92 },  // light gold
  { h: 38, s: 25, b: 96 },  // cream gold
  { h: 44, s: 45, b: 75 },  // dark gold
  { h: 35, s: 15, b: 98 },  // warm cream
]

export default function VintageDust({
  density = 60,
  className = '',
}: {
  density?: number
  className?: string
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const animIdRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let w = 0
    let h = 0

    function resize() {
      w = window.innerWidth
      h = window.innerHeight
      canvas!.width = w
      canvas!.height = h
    }

    function createParticles(count: number): Particle[] {
      const particles: Particle[] = []
      for (let i = 0; i < count; i++) {
        const c = GOLD_PALETTE[Math.floor(Math.random() * GOLD_PALETTE.length)]
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: 0,
          vy: 0,
          size: Math.random() * 3 + 0.5,
          opacity: Math.random() * 0.5 + 0.05,
          speed: Math.random() * 0.15 + 0.03,
          hue: c.h,
        })
      }
      return particles
    }

    resize()
    particlesRef.current = createParticles(density)

    let time = 0

    function draw() {
      ctx!.clearRect(0, 0, w, h)
      time += 0.003

      for (const p of particlesRef.current) {
        // Gentle floating motion using sine waves
        p.x += Math.sin(time * p.speed + p.y * 0.002) * 0.2
        p.y += Math.cos(time * p.speed * 0.7 + p.x * 0.002) * 0.15

        // Slow drift upward
        p.y -= p.speed * 0.15

        // Wrap around edges
        if (p.x < -10) p.x = w + 10
        if (p.x > w + 10) p.x = -10
        if (p.y < -10) p.y = h + 10
        if (p.y > h + 10) p.y = -10

        // Gentle opacity pulse
        const pulse = Math.sin(time * 0.5 + p.x * 0.01) * 0.15

        ctx!.save()
        ctx!.globalAlpha = Math.max(0, Math.min(0.6, p.opacity + pulse))
        // Glow effect
        ctx!.shadowColor = `hsla(${p.hue}, 50%, 70%, ${p.opacity * 0.3})`
        ctx!.shadowBlur = p.size * 4
        ctx!.fillStyle = `hsla(${p.hue}, 50%, 75%, 1)`
        ctx!.beginPath()
        ctx!.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx!.fill()
        ctx!.restore()
      }

      animIdRef.current = requestAnimationFrame(draw)
    }

    draw()

    window.addEventListener('resize', resize)

    return () => {
      cancelAnimationFrame(animIdRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [density])

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 2,
      }}
    />
  )
}
