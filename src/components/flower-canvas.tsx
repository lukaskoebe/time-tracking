import { useEffect, useRef } from 'react'

interface FlowerDef {
  xFrac: number
  yFrac: number
  petals: number
  radius: number
  color: readonly [number, number, number]
  phase: number
  speed: number
  rotSpeed: number
  initRot: number
}

// Framing flowers around the edges — never in the content area
const FLOWER_DEFS: FlowerDef[] = [
  { xFrac: 0.88, yFrac: 0.06, petals: 6, radius: 170, color: [198, 138, 138], phase: 0.0, speed: 0.38, rotSpeed:  0.012, initRot: 0.0 },
  { xFrac: 0.07, yFrac: 0.88, petals: 5, radius: 140, color: [210, 168, 130], phase: 2.0, speed: 0.32, rotSpeed: -0.009, initRot: 0.6 },
  { xFrac: 0.93, yFrac: 0.80, petals: 7, radius: 155, color: [140, 178, 140], phase: 1.3, speed: 0.41, rotSpeed:  0.010, initRot: 1.0 },
  { xFrac: 0.06, yFrac: 0.10, petals: 5, radius: 115, color: [172, 148, 195], phase: 3.5, speed: 0.29, rotSpeed: -0.007, initRot: 0.4 },
  { xFrac: 0.48, yFrac: 0.96, petals: 6, radius: 145, color: [218, 172, 142], phase: 0.9, speed: 0.35, rotSpeed:  0.008, initRot: 2.1 },
  { xFrac: 0.66, yFrac: 0.03, petals: 5, radius: 105, color: [200, 138, 148], phase: 4.0, speed: 0.44, rotSpeed:  0.013, initRot: 1.6 },
  { xFrac: 0.02, yFrac: 0.50, petals: 7, radius: 120, color: [148, 188, 148], phase: 1.7, speed: 0.37, rotSpeed: -0.011, initRot: 0.9 },
  { xFrac: 0.97, yFrac: 0.45, petals: 5, radius: 130, color: [215, 188, 158], phase: 2.6, speed: 0.33, rotSpeed:  0.009, initRot: 0.3 },
  { xFrac: 0.23, yFrac: 0.02, petals: 6, radius:  95, color: [190, 152, 170], phase: 5.1, speed: 0.40, rotSpeed: -0.010, initRot: 1.2 },
]

function drawFlower(
  ctx: CanvasRenderingContext2D,
  def: FlowerDef,
  t: number,
  w: number,
  h: number,
) {
  const cx = def.xFrac * w
  const cy = def.yFrac * h

  // Global "breathing" — whole flower gently expands and contracts
  const breathe = 1 + Math.sin(t * def.speed + def.phase) * 0.07
  const rotation = def.initRot + t * def.rotSpeed
  const [r, g, b] = def.color

  for (let i = 0; i < def.petals; i++) {
    const angle = ((Math.PI * 2) / def.petals) * i + rotation
    // Each petal morphs independently
    const petalMorph =
      1 + Math.sin(t * def.speed * 1.3 + def.phase + i * 1.4) * 0.09
    const pr = def.radius * breathe * petalMorph
    const pw = pr * 0.40

    ctx.save()
    ctx.translate(cx, cy)
    ctx.rotate(angle - Math.PI / 2) // petals point "up" in rotated space

    // Gradient: opaque at base, transparent at tip
    const grad = ctx.createLinearGradient(0, 0, 0, pr)
    grad.addColorStop(0,   `rgba(${r},${g},${b},0.13)`)
    grad.addColorStop(0.4, `rgba(${r},${g},${b},0.09)`)
    grad.addColorStop(1,   `rgba(${r},${g},${b},0.01)`)

    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.bezierCurveTo( pw * 0.75, pr * 0.22,  pw,        pr * 0.68, 0, pr)
    ctx.bezierCurveTo(-pw,        pr * 0.68, -pw * 0.75, pr * 0.22, 0, 0)
    ctx.fillStyle = grad
    ctx.fill()

    ctx.restore()
  }

  // Soft center
  const cr = def.radius * 0.13 * breathe
  const cGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, cr)
  cGrad.addColorStop(0, `rgba(${r},${g},${b},0.18)`)
  cGrad.addColorStop(1, `rgba(${r},${g},${b},0.04)`)
  ctx.beginPath()
  ctx.arc(cx, cy, cr, 0, Math.PI * 2)
  ctx.fillStyle = cGrad
  ctx.fill()
}

export function FlowerCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    function resize() {
      if (!canvas) return
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()

    const ro = new ResizeObserver(resize)
    ro.observe(document.documentElement)

    // Soft blur so petals look painted rather than crisp
    ctx.filter = 'blur(2px)'

    let animId: number
    let t = 0
    let lastTs = 0

    function loop(ts: number) {
      if (!canvas || !ctx) return
      const dt = lastTs === 0 ? 0 : (ts - lastTs) / 1000
      lastTs = ts
      t += dt * 0.12 // time scale — full sine cycle ≈ 52 s

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      for (const def of FLOWER_DEFS) {
        drawFlower(ctx, def, t, canvas.width, canvas.height)
      }

      animId = requestAnimationFrame(loop)
    }

    animId = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(animId)
      ro.disconnect()
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
