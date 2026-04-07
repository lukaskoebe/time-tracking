import { useEffect, useRef } from 'react'

type FlowerType = 'simple' | 'daisy' | 'rose' | 'anemone' | 'peony' | 'leaves'

interface FlowerDef {
  xFrac: number
  yFrac: number
  type: FlowerType
  petals: number
  radius: number
  color: readonly [number, number, number]
  phase: number
  speed: number
  rotSpeed: number
  initRot: number
}

const FLOWER_DEFS: FlowerDef[] = [
  // Top edge
  { xFrac: 0.08, yFrac: 0.02, type: 'daisy',   petals: 14, radius: 38, color: [210, 168, 130], phase: 0.0, speed: 0.36, rotSpeed:  0.010, initRot: 0.0 },
  { xFrac: 0.22, yFrac: 0.04, type: 'simple',  petals: 5,  radius: 28, color: [198, 138, 138], phase: 1.2, speed: 0.40, rotSpeed: -0.008, initRot: 0.5 },
  { xFrac: 0.38, yFrac: 0.02, type: 'leaves',  petals: 7,  radius: 42, color: [148, 185, 145], phase: 2.1, speed: 0.28, rotSpeed:  0.006, initRot: 1.1 },
  { xFrac: 0.53, yFrac: 0.03, type: 'rose',    petals: 6,  radius: 35, color: [200, 138, 148], phase: 3.4, speed: 0.44, rotSpeed:  0.012, initRot: 0.3 },
  { xFrac: 0.67, yFrac: 0.01, type: 'anemone', petals: 8,  radius: 44, color: [172, 148, 195], phase: 0.7, speed: 0.32, rotSpeed: -0.009, initRot: 0.8 },
  { xFrac: 0.82, yFrac: 0.04, type: 'peony',   petals: 9,  radius: 50, color: [215, 172, 158], phase: 4.5, speed: 0.38, rotSpeed:  0.007, initRot: 1.4 },
  { xFrac: 0.94, yFrac: 0.02, type: 'daisy',   petals: 16, radius: 32, color: [190, 155, 170], phase: 2.9, speed: 0.42, rotSpeed: -0.011, initRot: 0.2 },

  // Bottom edge
  { xFrac: 0.05, yFrac: 0.96, type: 'rose',    petals: 5,  radius: 45, color: [215, 172, 140], phase: 1.6, speed: 0.34, rotSpeed:  0.009, initRot: 0.6 },
  { xFrac: 0.18, yFrac: 0.98, type: 'leaves',  petals: 6,  radius: 38, color: [140, 180, 140], phase: 3.0, speed: 0.30, rotSpeed: -0.007, initRot: 1.0 },
  { xFrac: 0.32, yFrac: 0.97, type: 'simple',  petals: 6,  radius: 30, color: [200, 140, 148], phase: 5.2, speed: 0.45, rotSpeed:  0.013, initRot: 0.4 },
  { xFrac: 0.47, yFrac: 0.99, type: 'daisy',   petals: 13, radius: 36, color: [218, 178, 148], phase: 0.4, speed: 0.37, rotSpeed:  0.008, initRot: 1.8 },
  { xFrac: 0.61, yFrac: 0.96, type: 'peony',   petals: 8,  radius: 48, color: [188, 148, 188], phase: 2.3, speed: 0.31, rotSpeed: -0.010, initRot: 0.9 },
  { xFrac: 0.75, yFrac: 0.98, type: 'anemone', petals: 7,  radius: 40, color: [210, 162, 132], phase: 4.1, speed: 0.39, rotSpeed:  0.011, initRot: 0.1 },
  { xFrac: 0.88, yFrac: 0.95, type: 'leaves',  petals: 8,  radius: 46, color: [150, 188, 152], phase: 1.8, speed: 0.33, rotSpeed: -0.008, initRot: 1.3 },
  { xFrac: 0.97, yFrac: 0.97, type: 'simple',  petals: 5,  radius: 26, color: [198, 138, 138], phase: 3.7, speed: 0.41, rotSpeed:  0.010, initRot: 0.7 },

  // Left edge
  { xFrac: 0.01, yFrac: 0.14, type: 'peony',   petals: 7,  radius: 42, color: [172, 148, 195], phase: 5.5, speed: 0.29, rotSpeed:  0.007, initRot: 0.2 },
  { xFrac: 0.03, yFrac: 0.29, type: 'daisy',   petals: 15, radius: 34, color: [215, 180, 150], phase: 0.9, speed: 0.38, rotSpeed: -0.012, initRot: 1.5 },
  { xFrac: 0.01, yFrac: 0.44, type: 'simple',  petals: 6,  radius: 28, color: [195, 140, 145], phase: 2.5, speed: 0.43, rotSpeed:  0.009, initRot: 0.6 },
  { xFrac: 0.04, yFrac: 0.60, type: 'leaves',  petals: 9,  radius: 50, color: [145, 185, 145], phase: 4.2, speed: 0.27, rotSpeed: -0.006, initRot: 1.2 },
  { xFrac: 0.02, yFrac: 0.75, type: 'anemone', petals: 8,  radius: 44, color: [210, 165, 135], phase: 1.1, speed: 0.35, rotSpeed:  0.011, initRot: 0.4 },

  // Right edge
  { xFrac: 0.97, yFrac: 0.12, type: 'leaves',  petals: 7,  radius: 46, color: [148, 188, 148], phase: 3.8, speed: 0.31, rotSpeed: -0.009, initRot: 0.8 },
  { xFrac: 0.99, yFrac: 0.27, type: 'simple',  petals: 5,  radius: 27, color: [200, 140, 148], phase: 0.3, speed: 0.44, rotSpeed:  0.013, initRot: 0.3 },
  { xFrac: 0.97, yFrac: 0.43, type: 'daisy',   petals: 12, radius: 32, color: [218, 175, 145], phase: 2.0, speed: 0.36, rotSpeed: -0.008, initRot: 1.7 },
  { xFrac: 0.99, yFrac: 0.58, type: 'rose',    petals: 6,  radius: 40, color: [188, 145, 188], phase: 4.8, speed: 0.40, rotSpeed:  0.010, initRot: 0.5 },
  { xFrac: 0.97, yFrac: 0.73, type: 'peony',   petals: 9,  radius: 52, color: [210, 170, 135], phase: 1.5, speed: 0.28, rotSpeed: -0.007, initRot: 1.0 },
  { xFrac: 0.99, yFrac: 0.88, type: 'anemone', petals: 7,  radius: 38, color: [172, 148, 192], phase: 3.2, speed: 0.37, rotSpeed:  0.009, initRot: 0.2 },

  // Corners (slightly inset)
  { xFrac: 0.04, yFrac: 0.06, type: 'rose',    petals: 5,  radius: 55, color: [200, 155, 165], phase: 0.6, speed: 0.33, rotSpeed: -0.010, initRot: 0.9 },
  { xFrac: 0.96, yFrac: 0.06, type: 'peony',   petals: 8,  radius: 60, color: [215, 175, 145], phase: 2.8, speed: 0.36, rotSpeed:  0.008, initRot: 0.4 },
  { xFrac: 0.04, yFrac: 0.92, type: 'anemone', petals: 6,  radius: 58, color: [148, 185, 150], phase: 1.4, speed: 0.30, rotSpeed:  0.011, initRot: 1.6 },
  { xFrac: 0.96, yFrac: 0.92, type: 'daisy',   petals: 18, radius: 45, color: [190, 145, 185], phase: 4.6, speed: 0.39, rotSpeed: -0.009, initRot: 0.7 },
]

// Fill and stroke opacities — sketch style: solid fill + visible outline
const FILL_ALPHA  = 0.07  // flat-ish fill
const STROKE_ALPHA = 0.18  // pen-line edge
const TIP_FADE = 0.5       // how much the fill fades at the tip (1 = no fade, 0 = full fade)

function petalPath(
  ctx: CanvasRenderingContext2D,
  pr: number,
  pw: number,
) {
  ctx.beginPath()
  ctx.moveTo(0, 0)
  ctx.bezierCurveTo( pw * 0.75, pr * 0.22,  pw,        pr * 0.68, 0, pr)
  ctx.bezierCurveTo(-pw,        pr * 0.68, -pw * 0.75, pr * 0.22, 0, 0)
}

function sketchPetal(
  ctx: CanvasRenderingContext2D,
  r: number, g: number, b: number,
  pr: number,
  pw: number,
) {
  // Soft fill — slight tip fade but stays opaque on the sides
  const grad = ctx.createLinearGradient(0, 0, 0, pr)
  grad.addColorStop(0,   `rgba(${r},${g},${b},${FILL_ALPHA})`)
  grad.addColorStop(0.6, `rgba(${r},${g},${b},${FILL_ALPHA * 0.85})`)
  grad.addColorStop(1,   `rgba(${r},${g},${b},${FILL_ALPHA * TIP_FADE})`)

  petalPath(ctx, pr, pw)
  ctx.fillStyle = grad
  ctx.fill()

  // Sketch outline
  petalPath(ctx, pr, pw)
  ctx.strokeStyle = `rgba(${r},${g},${b},${STROKE_ALPHA})`
  ctx.lineWidth = 0.7
  ctx.stroke()

  // Centre vein
  ctx.beginPath()
  ctx.moveTo(0, 2)
  ctx.lineTo(0, pr * 0.82)
  ctx.strokeStyle = `rgba(${r},${g},${b},${STROKE_ALPHA * 0.55})`
  ctx.lineWidth = 0.5
  ctx.stroke()
}

function sketchCenter(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number,
  r: number, g: number, b: number,
  cr: number,
  alphaMult = 1,
) {
  const cGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, cr)
  cGrad.addColorStop(0,   `rgba(${r},${g},${b},${0.18 * alphaMult})`)
  cGrad.addColorStop(0.6, `rgba(${r},${g},${b},${0.10 * alphaMult})`)
  cGrad.addColorStop(1,   `rgba(${r},${g},${b},0)`)
  ctx.beginPath()
  ctx.arc(cx, cy, cr, 0, Math.PI * 2)
  ctx.fillStyle = cGrad
  ctx.fill()
  ctx.strokeStyle = `rgba(${r},${g},${b},${STROKE_ALPHA * 0.5 * alphaMult})`
  ctx.lineWidth = 0.6
  ctx.stroke()
}

function drawSimple(ctx: CanvasRenderingContext2D, def: FlowerDef, t: number, w: number, h: number) {
  const cx = def.xFrac * w
  const cy = def.yFrac * h
  const breathe = 1 + Math.sin(t * def.speed + def.phase) * 0.07
  const rotation = def.initRot + t * def.rotSpeed
  const [r, g, b] = def.color

  for (let i = 0; i < def.petals; i++) {
    const angle = ((Math.PI * 2) / def.petals) * i + rotation
    const pr = def.radius * breathe * (1 + Math.sin(t * def.speed * 1.3 + def.phase + i * 1.4) * 0.09)
    ctx.save()
    ctx.translate(cx, cy)
    ctx.rotate(angle - Math.PI / 2)
    sketchPetal(ctx, r, g, b, pr, pr * 0.38)
    ctx.restore()
  }
  sketchCenter(ctx, cx, cy, r, g, b, def.radius * 0.13 * breathe)
}

function drawDaisy(ctx: CanvasRenderingContext2D, def: FlowerDef, t: number, w: number, h: number) {
  const cx = def.xFrac * w
  const cy = def.yFrac * h
  const breathe = 1 + Math.sin(t * def.speed + def.phase) * 0.05
  const rotation = def.initRot + t * def.rotSpeed
  const [r, g, b] = def.color

  for (let i = 0; i < def.petals; i++) {
    const angle = ((Math.PI * 2) / def.petals) * i + rotation
    const pr = def.radius * breathe * (1 + Math.sin(t * def.speed * 1.1 + i * 0.9) * 0.06)
    ctx.save()
    ctx.translate(cx, cy)
    ctx.rotate(angle - Math.PI / 2)
    sketchPetal(ctx, r, g, b, pr, pr * 0.18)
    ctx.restore()
  }
  sketchCenter(ctx, cx, cy, r, g, b, def.radius * 0.22 * breathe, 1.3)
}

function drawRose(ctx: CanvasRenderingContext2D, def: FlowerDef, t: number, w: number, h: number) {
  const cx = def.xFrac * w
  const cy = def.yFrac * h
  const breathe = 1 + Math.sin(t * def.speed + def.phase) * 0.06
  const rotation = def.initRot + t * def.rotSpeed
  const [r, g, b] = def.color

  for (let layer = 0; layer < 2; layer++) {
    const layerR = def.radius * breathe * (layer === 0 ? 1.0 : 0.60)
    const layerPetals = def.petals + layer * 3
    const layerOffset = layer * (Math.PI / layerPetals)

    for (let i = 0; i < layerPetals; i++) {
      const angle = ((Math.PI * 2) / layerPetals) * i + rotation + layerOffset
      const pr = layerR * (1 + Math.sin(t * def.speed * 1.2 + def.phase + i * 1.1 + layer * 2.3) * 0.08)
      ctx.save()
      ctx.translate(cx, cy)
      ctx.rotate(angle - Math.PI / 2)
      sketchPetal(ctx, r, g, b, pr, pr * 0.44)
      ctx.restore()
    }
  }
  sketchCenter(ctx, cx, cy, r, g, b, def.radius * 0.18 * breathe)
}

function drawAnemone(ctx: CanvasRenderingContext2D, def: FlowerDef, t: number, w: number, h: number) {
  const cx = def.xFrac * w
  const cy = def.yFrac * h
  const breathe = 1 + Math.sin(t * def.speed + def.phase) * 0.06
  const rotation = def.initRot + t * def.rotSpeed
  const [r, g, b] = def.color

  for (let i = 0; i < def.petals; i++) {
    const angle = ((Math.PI * 2) / def.petals) * i + rotation
    const pr = def.radius * breathe * (1 + Math.sin(t * def.speed * 1.05 + def.phase + i * 1.2) * 0.07)
    ctx.save()
    ctx.translate(cx, cy)
    ctx.rotate(angle - Math.PI / 2)
    sketchPetal(ctx, r, g, b, pr, pr * 0.56)
    ctx.restore()
  }

  // Large center
  const cr = def.radius * 0.28 * breathe
  sketchCenter(ctx, cx, cy, r, g, b, cr, 1.4)

  // Stamen ring
  const dotCount = 10
  const dotR = cr * 0.55
  const rot = rotation
  for (let i = 0; i < dotCount; i++) {
    const da = ((Math.PI * 2) / dotCount) * i + rot
    ctx.beginPath()
    ctx.arc(cx + Math.cos(da) * dotR, cy + Math.sin(da) * dotR, 1.8, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(${r},${g},${b},${STROKE_ALPHA * 0.9})`
    ctx.fill()
  }
}

function drawPeony(ctx: CanvasRenderingContext2D, def: FlowerDef, t: number, w: number, h: number) {
  const cx = def.xFrac * w
  const cy = def.yFrac * h
  const breathe = 1 + Math.sin(t * def.speed + def.phase) * 0.05
  const rotation = def.initRot + t * def.rotSpeed
  const [r, g, b] = def.color

  for (let layer = 0; layer < 3; layer++) {
    const layerScale = 1.0 - layer * 0.28
    const layerPetals = def.petals + layer
    const layerOffset = layer * (Math.PI / (layerPetals * 0.9))

    for (let i = 0; i < layerPetals; i++) {
      const angle = ((Math.PI * 2) / layerPetals) * i + rotation + layerOffset
      const pr = def.radius * breathe * layerScale * (1 + Math.sin(t * def.speed * 1.15 + def.phase + i * 0.9 + layer * 1.7) * 0.07)
      ctx.save()
      ctx.translate(cx, cy)
      ctx.rotate(angle - Math.PI / 2)
      sketchPetal(ctx, r, g, b, pr, pr * 0.50)
      ctx.restore()
    }
  }
  sketchCenter(ctx, cx, cy, r, g, b, def.radius * 0.15 * breathe)
}

function drawLeaves(ctx: CanvasRenderingContext2D, def: FlowerDef, t: number, w: number, h: number) {
  const cx = def.xFrac * w
  const cy = def.yFrac * h
  const breathe = 1 + Math.sin(t * def.speed + def.phase) * 0.04
  const rotation = def.initRot + t * def.rotSpeed * 0.5
  const [r, g, b] = def.color

  for (let i = 0; i < def.petals; i++) {
    const angle = ((Math.PI * 2) / def.petals) * i + rotation
    const pr = def.radius * breathe * (0.7 + Math.sin(t * def.speed * 0.8 + def.phase + i * 1.6) * 0.15)
    const pw = pr * 0.30

    ctx.save()
    ctx.translate(cx, cy)
    ctx.rotate(angle - Math.PI / 2)

    // Leaf fill
    const grad = ctx.createLinearGradient(0, 0, 0, pr)
    grad.addColorStop(0,   `rgba(${r},${g},${b},${FILL_ALPHA * 1.1})`)
    grad.addColorStop(0.5, `rgba(${r},${g},${b},${FILL_ALPHA})`)
    grad.addColorStop(1,   `rgba(${r},${g},${b},${FILL_ALPHA * TIP_FADE})`)

    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.bezierCurveTo( pw * 0.9, pr * 0.28,  pw * 0.7, pr * 0.72, 0, pr)
    ctx.bezierCurveTo(-pw * 0.5, pr * 0.72, -pw * 0.7, pr * 0.28, 0, 0)
    ctx.fillStyle = grad
    ctx.fill()

    // Leaf outline
    ctx.strokeStyle = `rgba(${r},${g},${b},${STROKE_ALPHA})`
    ctx.lineWidth = 0.7
    ctx.stroke()

    // Midrib
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.lineTo(0, pr * 0.88)
    ctx.strokeStyle = `rgba(${r},${g},${b},${STROKE_ALPHA * 0.65})`
    ctx.lineWidth = 0.55
    ctx.stroke()

    // Side veins
    for (let v = 1; v <= 3; v++) {
      const vy = pr * v * 0.22
      const vx = pw * 0.55 * (1 - v * 0.25)
      ctx.beginPath()
      ctx.moveTo(0, vy)
      ctx.lineTo( vx, vy - pr * 0.05)
      ctx.moveTo(0, vy)
      ctx.lineTo(-vx, vy - pr * 0.05)
      ctx.strokeStyle = `rgba(${r},${g},${b},${STROKE_ALPHA * 0.35})`
      ctx.lineWidth = 0.4
      ctx.stroke()
    }

    ctx.restore()
  }
}

function drawFlower(
  ctx: CanvasRenderingContext2D,
  def: FlowerDef,
  t: number,
  w: number,
  h: number,
) {
  switch (def.type) {
    case 'simple':  drawSimple(ctx, def, t, w, h);  break
    case 'daisy':   drawDaisy(ctx, def, t, w, h);   break
    case 'rose':    drawRose(ctx, def, t, w, h);    break
    case 'anemone': drawAnemone(ctx, def, t, w, h); break
    case 'peony':   drawPeony(ctx, def, t, w, h);   break
    case 'leaves':  drawLeaves(ctx, def, t, w, h);  break
  }
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

    ctx.filter = 'blur(1px)'

    let animId: number
    let t = 0
    let lastTs = 0

    function loop(ts: number) {
      if (!canvas || !ctx) return
      const dt = lastTs === 0 ? 0 : (ts - lastTs) / 1000
      lastTs = ts
      t += dt * 0.10

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
      className="pointer-events-none fixed inset-0 z-[2]"
    />
  )
}
