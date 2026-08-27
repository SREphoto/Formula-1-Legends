import * as THREE from 'three'
import {
  F1_STEERING_WHEEL_CONTROLS,
  type WheelControlMetadata,
} from './steeringWheelData'

export interface WheelTelemetryData {
  gear: number | string
  speedKmh: number
  rpm: number
  maxRpm: number
  deltaSeconds: number
  ersSocPercent: number
  ersMode: 'BALANCED' | 'DEPLOY' | 'HARVEST' | 'OVERTAKE'
  brakeBiasPercent: number
  engineBrakeLevel: number
  diffEntryPercent: number
  diffExitPercent: number
  stratMode: number
  tyreCompound: string
  tireTemps: { fl: number; fr: number; rl: number; rr: number }
  tirePressures: { fl: number; fr: number; rl: number; rr: number }
  drsActive: boolean
  pitLimiterActive: boolean
  flagStatus: 'GREEN' | 'YELLOW' | 'VSC' | 'SC' | 'RED' | 'BLUE'
  lapTimeStr?: string
  lastLapStr?: string
  fuelRemainingKg: number
}

export interface F1SteeringWheelController {
  root: THREE.Group
  interactiveMeshes: THREE.Mesh[]
  getControlById: (id: string) => WheelControlMetadata | undefined
  pressButton: (id: string) => void
  turnRotary: (id: string, deltaSteps?: number) => void
  pullPaddle: (id: string) => void
  highlightControl: (id: string | null) => void
  setTelemetry: (data: Partial<WheelTelemetryData>) => void
  setLcdPage: (page: number) => void
  getActiveLcdPage: () => number
  update: (deltaSeconds: number) => void
  dispose: () => void
}

interface AnimatedPart {
  mesh: THREE.Object3D
  type: 'BUTTON' | 'ROTARY' | 'PADDLE'
  initialPos: THREE.Vector3
  initialRot: THREE.Euler
  currentOffset: number
  targetOffset: number
  rotAngle: number
}

// Generate procedural carbon fiber texture
function createCarbonTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 128
  canvas.height = 128
  const ctx = canvas.getContext('2d')!

  ctx.fillStyle = '#121417'
  ctx.fillRect(0, 0, 128, 128)

  const size = 8
  for (let y = 0; y < 128; y += size) {
    for (let x = 0; x < 128; x += size) {
      const isAlt = ((x / size) + (y / size)) % 2 === 0
      ctx.fillStyle = isAlt ? '#1d2127' : '#0c0e10'
      ctx.fillRect(x, y, size, size)

      // Micro weave lines
      ctx.strokeStyle = isAlt ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.4)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineTo(x + size, y + size)
      ctx.stroke()
    }
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(16, 12)
  return texture
}

// Generate grip stippled texture
function createGripTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 128
  canvas.height = 128
  const ctx = canvas.getContext('2d')!

  ctx.fillStyle = '#18191c'
  ctx.fillRect(0, 0, 128, 128)

  for (let i = 0; i < 600; i++) {
    const x = Math.random() * 128
    const y = Math.random() * 128
    const r = Math.random() * 1.5 + 0.5
    ctx.fillStyle = Math.random() > 0.5 ? 'rgba(40,42,48,0.7)' : 'rgba(10,11,14,0.8)'
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fill()
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(6, 6)
  return texture
}

// Generate laser-etched button cap face decal
function createButtonDecalTexture(label: string, borderColorHex: string, textColor = '#ffffff'): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 256
  const ctx = canvas.getContext('2d')!

  // Tactile concave dish background
  const grad = ctx.createRadialGradient(128, 128, 12, 128, 128, 124)
  grad.addColorStop(0, '#242a34')
  grad.addColorStop(0.65, '#14171d')
  grad.addColorStop(1, '#080a0d')
  ctx.fillStyle = grad
  ctx.beginPath()
  ctx.arc(128, 128, 124, 0, Math.PI * 2)
  ctx.fill()

  // High-contrast outer color ring
  ctx.strokeStyle = borderColorHex
  ctx.lineWidth = 16
  ctx.beginPath()
  ctx.arc(128, 128, 112, 0, Math.PI * 2)
  ctx.stroke()

  // Inner subtle metallic chamfer
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.32)'
  ctx.lineWidth = 3.5
  ctx.beginPath()
  ctx.arc(128, 128, 98, 0, Math.PI * 2)
  ctx.stroke()

  // Laser-etched typography
  ctx.fillStyle = textColor
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  const fontSize = label.length >= 4 ? 54 : label.length === 3 ? 66 : 82
  ctx.font = `900 ${fontSize}px "Barlow Condensed", Inter, sans-serif`

  // Glow / shadow
  ctx.shadowColor = 'rgba(0,0,0,0.85)'
  ctx.shadowBlur = 6
  ctx.shadowOffsetY = 2
  ctx.fillText(label, 128, 128)

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

// Generate laser-etched paddle decal (+ / -)
function createPaddleDecalTexture(symbol: string, color: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 256
  const ctx = canvas.getContext('2d')!

  ctx.fillStyle = 'rgba(0, 0, 0, 0)'
  ctx.fillRect(0, 0, 256, 256)

  ctx.fillStyle = color
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.font = '900 140px "Barlow Condensed", Inter, sans-serif'
  ctx.shadowColor = 'rgba(0,0,0,0.9)'
  ctx.shadowBlur = 8
  ctx.fillText(symbol, 128, 128)

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

// Generate rotary dial scale index
function createDialScaleTexture(options: string[], color: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 256
  const ctx = canvas.getContext('2d')!

  ctx.fillStyle = 'rgba(0, 0, 0, 0)'
  ctx.fillRect(0, 0, 256, 256)

  // Outer scale ring
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.arc(128, 128, 114, 0, Math.PI * 2)
  ctx.stroke()

  const count = options.length
  options.forEach((opt, idx) => {
    const angle = (idx / count) * Math.PI * 1.6 + Math.PI * 0.7
    const rx = 128 + Math.cos(angle) * 88
    const ry = 128 + Math.sin(angle) * 88

    ctx.fillStyle = color
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.font = 'bold 24px "Barlow Condensed", Inter, sans-serif'
    ctx.fillText(opt, rx, ry)

    const tx1 = 128 + Math.cos(angle) * 106
    const ty1 = 128 + Math.sin(angle) * 106
    const tx2 = 128 + Math.cos(angle) * 118
    const ty2 = 128 + Math.sin(angle) * 118
    ctx.strokeStyle = color
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(tx1, ty1)
    ctx.lineTo(tx2, ty2)
    ctx.stroke()
  })

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

export function createF1SteeringWheel(): F1SteeringWheelController {
  const root = new THREE.Group()
  root.name = 'F1_SteeringWheel_Root'

  const disposables: (THREE.BufferGeometry | THREE.Material | THREE.Texture)[] = []
  const interactiveMeshes: THREE.Mesh[] = []
  const controlMeshMap = new Map<string, THREE.Mesh>()
  const animatedParts = new Map<string, AnimatedPart>()
  const shiftLedMeshes: THREE.Mesh[] = []
  const flagLeftLeds: THREE.Mesh[] = []
  const flagRightLeds: THREE.Mesh[] = []

  let activeLcdPage = 1

  // Telemetry state
  const telemetry: WheelTelemetryData = {
    gear: 6,
    speedKmh: 284,
    rpm: 12400,
    maxRpm: 15000,
    deltaSeconds: -0.185,
    ersSocPercent: 78,
    ersMode: 'BALANCED',
    brakeBiasPercent: 56.5,
    engineBrakeLevel: 3,
    diffEntryPercent: 54,
    diffExitPercent: 58,
    stratMode: 3,
    tyreCompound: 'MED',
    tireTemps: { fl: 101, fr: 104, rl: 99, rr: 102 },
    tirePressures: { fl: 22.8, fr: 22.9, rl: 20.6, rr: 20.7 },
    drsActive: false,
    pitLimiterActive: false,
    flagStatus: 'GREEN',
    lapTimeStr: '1:18.420',
    lastLapStr: '1:18.605',
    fuelRemainingKg: 42.8,
  }

  // ==========================================
  // 1. MATERIALS PALETTE
  // ==========================================
  const carbonTex = createCarbonTexture()
  disposables.push(carbonTex)

  const gripTex = createGripTexture()
  disposables.push(gripTex)

  // Matte Carbon Chassis
  const carbonMat = new THREE.MeshStandardMaterial({
    map: carbonTex,
    color: 0x22262c,
    roughness: 0.45,
    metalness: 0.25,
  })
  disposables.push(carbonMat)

  // Gloss Carbon Clearcoat
  const carbonGlossMat = new THREE.MeshStandardMaterial({
    map: carbonTex,
    color: 0x181a1f,
    roughness: 0.15,
    metalness: 0.55,
  })
  disposables.push(carbonGlossMat)

  // Molded Polyurethane / Alcantara Handgrips
  const gripMat = new THREE.MeshStandardMaterial({
    map: gripTex,
    color: 0x1e2024,
    roughness: 0.88,
    metalness: 0.05,
  })
  disposables.push(gripMat)

  // Titanium / CNC Aluminum
  const titaniumMat = new THREE.MeshStandardMaterial({
    color: 0x9fa4aa,
    roughness: 0.25,
    metalness: 0.9,
  })
  disposables.push(titaniumMat)

  // Anodized Bezel Material
  const anodizedBlackMat = new THREE.MeshStandardMaterial({
    color: 0x151618,
    roughness: 0.35,
    metalness: 0.8,
  })
  disposables.push(anodizedBlackMat)

  // Highlight Outline Material
  const highlightMat = new THREE.MeshBasicMaterial({
    color: 0x00f0ff,
    wireframe: true,
  })
  disposables.push(highlightMat)

  // ==========================================
  // 2. DYNAMIC LCD CANVAS & SCREEN
  // ==========================================
  const lcdCanvas = document.createElement('canvas')
  lcdCanvas.width = 1024
  lcdCanvas.height = 640
  const lcdCtx = lcdCanvas.getContext('2d')!
  const lcdTexture = new THREE.CanvasTexture(lcdCanvas)
  lcdTexture.generateMipmaps = true
  lcdTexture.minFilter = THREE.LinearMipmapLinearFilter
  disposables.push(lcdTexture)

  const lcdMaterial = new THREE.MeshBasicMaterial({
    map: lcdTexture,
  })
  disposables.push(lcdMaterial)

  function renderLcdCanvas() {
    const ctx = lcdCtx
    const w = 1024
    const h = 640

    // High-tech dark OLED display background
    ctx.fillStyle = '#06080b'
    ctx.fillRect(0, 0, w, h)

    // Carbon fiber subtle grid on display header
    ctx.fillStyle = '#0c1015'
    ctx.fillRect(0, 0, w, 68)

    // Top Status Header
    ctx.fillStyle = '#00f0ff'
    ctx.font = 'bold 24px "Barlow Condensed", Inter, sans-serif'
    ctx.fillText('F1-2026 PCF / DDU v4.2', 24, 44)

    // Top Right Flags / Status
    const flagColor =
      telemetry.flagStatus === 'GREEN'
        ? '#00ff66'
        : telemetry.flagStatus === 'YELLOW'
        ? '#ffd700'
        : telemetry.flagStatus === 'VSC' || telemetry.flagStatus === 'SC'
        ? '#ff9900'
        : telemetry.flagStatus === 'RED'
        ? '#ff2222'
        : '#00ccff'

    ctx.fillStyle = flagColor
    ctx.fillRect(w - 180, 16, 156, 36)
    ctx.fillStyle = '#000000'
    ctx.font = 'bold 22px "Barlow Condensed", sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(`STATUS: ${telemetry.flagStatus}`, w - 102, 42)
    ctx.textAlign = 'left'

    // ==========================================
    // LCD PAGE 1: RACE MAIN TELEMETRY
    // ==========================================
    if (activeLcdPage === 1) {
      // Large Gear Display (Center)
      ctx.fillStyle = '#0d131a'
      ctx.fillRect(360, 90, 304, 300)
      ctx.strokeStyle = '#1e293b'
      ctx.lineWidth = 4
      ctx.strokeRect(360, 90, 304, 300)

      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 190px "Barlow Condensed", Inter, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(String(telemetry.gear), 512, 330)

      ctx.fillStyle = '#64748b'
      ctx.font = 'bold 22px Inter, sans-serif'
      ctx.fillText('GEAR', 512, 130)

      // Speed (Left of Gear)
      ctx.fillStyle = '#0d131a'
      ctx.fillRect(36, 90, 290, 180)
      ctx.strokeStyle = '#1e293b'
      ctx.strokeRect(36, 90, 290, 180)

      ctx.fillStyle = '#00f0ff'
      ctx.font = 'bold 88px "Barlow Condensed", sans-serif'
      ctx.fillText(String(Math.round(telemetry.speedKmh)), 181, 210)
      ctx.fillStyle = '#94a3b8'
      ctx.font = 'bold 20px Inter, sans-serif'
      ctx.fillText('SPEED KM/H', 181, 250)

      // Lap Delta (Right of Gear)
      const delta = telemetry.deltaSeconds
      const deltaStr = (delta > 0 ? `+${delta.toFixed(3)}` : delta.toFixed(3)) + 's'
      const deltaColor = delta <= 0 ? '#00ff66' : '#ff3344'

      ctx.fillStyle = '#0d131a'
      ctx.fillRect(698, 90, 290, 180)
      ctx.strokeStyle = '#1e293b'
      ctx.strokeRect(698, 90, 290, 180)

      ctx.fillStyle = deltaColor
      ctx.font = 'bold 64px "Barlow Condensed", sans-serif'
      ctx.fillText(deltaStr, 843, 205)
      ctx.fillStyle = '#94a3b8'
      ctx.font = 'bold 20px Inter, sans-serif'
      ctx.fillText('LAP DELTA (REF)', 843, 250)

      // RPM Numerical & Bar Gauge
      ctx.fillStyle = '#0d131a'
      ctx.fillRect(36, 290, 290, 100)
      ctx.strokeStyle = '#1e293b'
      ctx.strokeRect(36, 290, 290, 100)

      ctx.fillStyle = '#ffaa00'
      ctx.font = 'bold 48px "Barlow Condensed", sans-serif'
      ctx.fillText(String(Math.round(telemetry.rpm)), 181, 355)
      ctx.fillStyle = '#64748b'
      ctx.font = 'bold 18px Inter, sans-serif'
      ctx.fillText('ENGINE RPM', 181, 380)

      // ERS State of Charge & Mode (Right Lower)
      ctx.fillStyle = '#0d131a'
      ctx.fillRect(698, 290, 290, 100)
      ctx.strokeStyle = '#1e293b'
      ctx.strokeRect(698, 290, 290, 100)

      ctx.fillStyle = '#b026ff'
      ctx.font = 'bold 44px "Barlow Condensed", sans-serif'
      ctx.fillText(`${telemetry.ersSocPercent}% ${telemetry.ersMode}`, 843, 355)
      ctx.fillStyle = '#64748b'
      ctx.font = 'bold 18px Inter, sans-serif'
      ctx.fillText('MGU-K ERS DEPLOY', 843, 380)

      // Bottom Row: Brake Bias, Diff, Strat, Pit Limiter
      ctx.fillStyle = '#111722'
      ctx.fillRect(36, 420, 952, 190)
      ctx.strokeStyle = '#223046'
      ctx.strokeRect(36, 420, 952, 190)

      const colW = 952 / 4
      // Brake Bias
      ctx.fillStyle = '#f43f5e'
      ctx.font = 'bold 36px "Barlow Condensed", sans-serif'
      ctx.fillText(`${telemetry.brakeBiasPercent.toFixed(1)}%`, 36 + colW * 0.5, 500)
      ctx.fillStyle = '#94a3b8'
      ctx.font = '16px Inter, sans-serif'
      ctx.fillText('BRAKE BIAS', 36 + colW * 0.5, 540)

      // Diff Entry / Exit
      ctx.fillStyle = '#fbbf24'
      ctx.font = 'bold 36px "Barlow Condensed", sans-serif'
      ctx.fillText(`${telemetry.diffEntryPercent}% / ${telemetry.diffExitPercent}%`, 36 + colW * 1.5, 500)
      ctx.fillStyle = '#94a3b8'
      ctx.font = '16px Inter, sans-serif'
      ctx.fillText('DIFF (IN / OUT)', 36 + colW * 1.5, 540)

      // Strat Mode
      ctx.fillStyle = '#38bdf8'
      ctx.font = 'bold 36px "Barlow Condensed", sans-serif'
      ctx.fillText(`STRAT ${telemetry.stratMode}`, 36 + colW * 2.5, 500)
      ctx.fillStyle = '#94a3b8'
      ctx.font = '16px Inter, sans-serif'
      ctx.fillText(`ENGINE MAP (${telemetry.tyreCompound})`, 36 + colW * 2.5, 540)

      // Active Indicators: DRS & Pit Limiter
      const drsBoxColor = telemetry.drsActive ? '#00ff66' : '#27272a'
      const plBoxColor = telemetry.pitLimiterActive ? '#ff2222' : '#27272a'

      ctx.fillStyle = drsBoxColor
      ctx.fillRect(36 + colW * 3 + 15, 445, 95, 45)
      ctx.fillStyle = telemetry.drsActive ? '#000000' : '#71717a'
      ctx.font = 'bold 22px Inter, sans-serif'
      ctx.fillText('DRS', 36 + colW * 3 + 62, 475)

      ctx.fillStyle = plBoxColor
      ctx.fillRect(36 + colW * 3 + 125, 445, 95, 45)
      ctx.fillStyle = telemetry.pitLimiterActive ? '#ffffff' : '#71717a'
      ctx.font = 'bold 22px Inter, sans-serif'
      ctx.fillText('PIT', 36 + colW * 3 + 172, 475)

      ctx.fillStyle = '#64748b'
      ctx.font = '16px Inter, sans-serif'
      ctx.fillText('ACTIVE AERO & LIMITER', 36 + colW * 3.5, 540)
    }

    // ==========================================
    // LCD PAGE 2: TIRE THERMALS & PRESSURES
    // ==========================================
    else if (activeLcdPage === 2) {
      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 32px "Barlow Condensed", sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('TIRE SURFACE / CORE THERMALS & PRESSURES', 512, 110)

      const tires = [
        { name: 'FRONT LEFT', temp: telemetry.tireTemps.fl, press: telemetry.tirePressures.fl, x: 260, y: 150 },
        { name: 'FRONT RIGHT', temp: telemetry.tireTemps.fr, press: telemetry.tirePressures.fr, x: 760, y: 150 },
        { name: 'REAR LEFT', temp: telemetry.tireTemps.rl, press: telemetry.tirePressures.rl, x: 260, y: 380 },
        { name: 'REAR RIGHT', temp: telemetry.tireTemps.rr, press: telemetry.tirePressures.rr, x: 760, y: 380 },
      ]

      tires.forEach((t) => {
        const tempColor =
          t.temp < 90 ? '#38bdf8' : t.temp <= 106 ? '#00ff66' : t.temp <= 114 ? '#fbbf24' : '#ef4444'

        ctx.fillStyle = '#0d131a'
        ctx.fillRect(t.x - 180, t.y, 360, 190)
        ctx.strokeStyle = tempColor
        ctx.lineWidth = 3
        ctx.strokeRect(t.x - 180, t.y, 360, 190)

        ctx.fillStyle = tempColor
        ctx.font = 'bold 54px "Barlow Condensed", sans-serif'
        ctx.fillText(`${t.temp}°C`, t.x, t.y + 75)

        ctx.fillStyle = '#cbd5e1'
        ctx.font = 'bold 24px Inter, sans-serif'
        ctx.fillText(`${t.press.toFixed(1)} PSI`, t.x, t.y + 125)

        ctx.fillStyle = '#64748b'
        ctx.font = '16px Inter, sans-serif'
        ctx.fillText(t.name, t.x, t.y + 165)
      })

      // Center car silhouette icon
      ctx.fillStyle = '#1e293b'
      ctx.fillRect(492, 180, 40, 360)
    }

    // ==========================================
    // LCD PAGE 3: ERS ENERGY & POWERTRAIN
    // ==========================================
    else if (activeLcdPage === 3) {
      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 32px "Barlow Condensed", sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('2026 350kW MGU-K & HYBRID ENERGY BALANCE', 512, 110)

      // Large Battery State of Charge Bar
      ctx.fillStyle = '#0d131a'
      ctx.fillRect(100, 160, 824, 100)
      ctx.strokeStyle = '#3b82f6'
      ctx.lineWidth = 3
      ctx.strokeRect(100, 160, 824, 100)

      const fillW = (telemetry.ersSocPercent / 100) * 816
      ctx.fillStyle = telemetry.ersMode === 'HARVEST' ? '#00e5ff' : telemetry.ersMode === 'DEPLOY' ? '#b026ff' : '#00ff66'
      ctx.fillRect(104, 164, fillW, 92)

      ctx.fillStyle = '#000000'
      ctx.font = 'bold 48px "Barlow Condensed", sans-serif'
      ctx.fillText(`BATTERY SOC: ${telemetry.ersSocPercent}% (${telemetry.ersMode})`, 512, 228)

      // Powertrain details
      const cards = [
        { label: 'MGU-K POWER OUTPUT', val: telemetry.ersMode === 'DEPLOY' ? '350 kW (PEAK)' : '180 kW', color: '#b026ff', x: 260, y: 310 },
        { label: 'ENERGY PER LAP LIMIT', val: '4.00 MJ / 3.42 MJ', color: '#00e5ff', x: 760, y: 310 },
        { label: 'FUEL MASS REMAINING', val: `${telemetry.fuelRemainingKg.toFixed(1)} KG`, color: '#fbbf24', x: 260, y: 460 },
        { label: 'ENGINE BRAKING LEVEL', val: `EB MAP: ${telemetry.engineBrakeLevel}`, color: '#38bdf8', x: 760, y: 460 },
      ]

      cards.forEach((c) => {
        ctx.fillStyle = '#0d131a'
        ctx.fillRect(c.x - 190, c.y, 380, 120)
        ctx.strokeStyle = '#1e293b'
        ctx.lineWidth = 2
        ctx.strokeRect(c.x - 190, c.y, 380, 120)

        ctx.fillStyle = c.color
        ctx.font = 'bold 36px "Barlow Condensed", sans-serif'
        ctx.fillText(c.val, c.x, c.y + 60)

        ctx.fillStyle = '#64748b'
        ctx.font = '16px Inter, sans-serif'
        ctx.fillText(c.label, c.x, c.y + 98)
      })
    }

    // ==========================================
    // LCD PAGE 4: ACTIVE AERO & DIAGNOSTICS
    // ==========================================
    else {
      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 32px "Barlow Condensed", sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('2026 ACTIVE AERO & STEERING DIAGNOSTICS', 512, 110)

      const diagCards = [
        { label: 'FRONT WING FLAP ANGLE', val: telemetry.drsActive ? '12.0° (LOW DRAG)' : '32.5° (HIGH DF)', color: '#00ff66', x: 260, y: 170 },
        { label: 'REAR WING BEAM FLAP', val: telemetry.drsActive ? 'ACTIVE X-MODE' : 'CORNER Z-MODE', color: '#00f0ff', x: 760, y: 170 },
        { label: 'STEERING RACK FORCE', val: '24.2 Nm', color: '#fbbf24', x: 260, y: 340 },
        { label: 'CLUTCH BITE POINT CAL', val: '48.0% OFFSET', color: '#e879f9', x: 760, y: 340 },
      ]

      diagCards.forEach((c) => {
        ctx.fillStyle = '#0d131a'
        ctx.fillRect(c.x - 190, c.y, 380, 130)
        ctx.strokeStyle = '#1e293b'
        ctx.lineWidth = 2
        ctx.strokeRect(c.x - 190, c.y, 380, 130)

        ctx.fillStyle = c.color
        ctx.font = 'bold 32px "Barlow Condensed", sans-serif'
        ctx.fillText(c.val, c.x, c.y + 65)

        ctx.fillStyle = '#64748b'
        ctx.font = '16px Inter, sans-serif'
        ctx.fillText(c.label, c.x, c.y + 105)
      })

      // Page footer guide
      ctx.fillStyle = '#00f0ff'
      ctx.font = 'bold 20px Inter, sans-serif'
      ctx.fillText('PAGE 4 OF 4 — PRESS PAGE +/- TO CYCLE', 512, 560)
    }

    ctx.textAlign = 'left'
    lcdTexture.needsUpdate = true
  }

  // Initial LCD render
  renderLcdCanvas()

  // ==========================================
  // 3. 3D GEOMETRY CONSTRUCTION
  // ==========================================

  // --- 3.1 Main Carbon Monocoque Faceplate ---
  // Approximate standard F1 wheel dimensions: 28cm wide, 17cm tall, 2.5cm thick body
  const bodyShape = new THREE.Shape()
  // Ergonomic outer contour with cutouts
  bodyShape.moveTo(-0.11, -0.075)
  bodyShape.lineTo(-0.13, -0.04)
  bodyShape.lineTo(-0.135, 0.05)
  bodyShape.lineTo(-0.115, 0.082)
  bodyShape.lineTo(-0.05, 0.088)
  bodyShape.lineTo(0.05, 0.088)
  bodyShape.lineTo(0.115, 0.082)
  bodyShape.lineTo(0.135, 0.05)
  bodyShape.lineTo(0.13, -0.04)
  bodyShape.lineTo(0.11, -0.075)
  bodyShape.lineTo(0.045, -0.082)
  bodyShape.lineTo(-0.045, -0.082)
  bodyShape.closePath()

  const extrudeSettings: THREE.ExtrudeGeometryOptions = {
    steps: 2,
    depth: 0.024,
    bevelEnabled: true,
    bevelThickness: 0.004,
    bevelSize: 0.004,
    bevelSegments: 3,
  }
  const bodyGeom = new THREE.ExtrudeGeometry(bodyShape, extrudeSettings)
  bodyGeom.center()
  disposables.push(bodyGeom)

  const bodyMesh = new THREE.Mesh(bodyGeom, carbonGlossMat)
  bodyMesh.name = 'Wheel_MainBody'
  root.add(bodyMesh)

  // --- 3.2 Sculpted Molded Ergonomic Handgrips ---
  // Left & Right silicone/Alcantara grips with thumb shelves
  function makeGrip(isRight: boolean): THREE.Group {
    const gripGroup = new THREE.Group()
    const sign = isRight ? 1 : -1

    // Main grip spine
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(sign * 0.125, -0.068, 0.005),
      new THREE.Vector3(sign * 0.138, -0.02, 0.008),
      new THREE.Vector3(sign * 0.14, 0.025, 0.008),
      new THREE.Vector3(sign * 0.125, 0.065, 0.005),
    ])
    const tubeGeom = new THREE.TubeGeometry(curve, 24, 0.016, 12, false)
    disposables.push(tubeGeom)

    const tubeMesh = new THREE.Mesh(tubeGeom, gripMat)
    gripGroup.add(tubeMesh)

    // Thumb groove / rest
    const thumbGeom = new THREE.CapsuleGeometry(0.014, 0.035, 8, 12)
    thumbGeom.rotateZ(sign * 0.35)
    thumbGeom.rotateX(0.2)
    disposables.push(thumbGeom)

    const thumbMesh = new THREE.Mesh(thumbGeom, gripMat)
    thumbMesh.position.set(sign * 0.118, 0.035, 0.012)
    gripGroup.add(thumbMesh)

    // Lower palm swell
    const palmGeom = new THREE.CapsuleGeometry(0.015, 0.04, 8, 12)
    palmGeom.rotateZ(sign * -0.2)
    disposables.push(palmGeom)

    const palmMesh = new THREE.Mesh(palmGeom, gripMat)
    palmMesh.position.set(sign * 0.128, -0.04, 0.01)
    gripGroup.add(palmMesh)

    return gripGroup
  }

  const leftGrip = makeGrip(false)
  leftGrip.name = 'Wheel_LeftGrip'
  root.add(leftGrip)

  const rightGrip = makeGrip(true)
  rightGrip.name = 'Wheel_RightGrip'
  root.add(rightGrip)

  // --- 3.3 Central LCD Screen Mesh & Screen Bezel ---
  const screenBezelGeom = new THREE.BoxGeometry(0.108, 0.07, 0.006)
  disposables.push(screenBezelGeom)
  const screenBezel = new THREE.Mesh(screenBezelGeom, anodizedBlackMat)
  screenBezel.position.set(0, 0.026, 0.015)
  root.add(screenBezel)

  const screenGeom = new THREE.PlaneGeometry(0.102, 0.064)
  disposables.push(screenGeom)
  const screenMesh = new THREE.Mesh(screenGeom, lcdMaterial)
  screenMesh.position.set(0, 0.026, 0.0182)
  screenMesh.name = 'disp_lcd_43'
  screenMesh.userData = { controlId: 'disp_lcd_43' }
  interactiveMeshes.push(screenMesh)
  controlMeshMap.set('disp_lcd_43', screenMesh)
  root.add(screenMesh)

  // Top Screen Sun Hood / Protective Brow
  const browGeom = new THREE.BoxGeometry(0.112, 0.008, 0.012)
  disposables.push(browGeom)
  const browMesh = new THREE.Mesh(browGeom, carbonMat)
  browMesh.position.set(0, 0.064, 0.02)
  root.add(browMesh)

  // --- 3.4 15x Shift Light LEDs & 6x Flag Status LEDs ---
  const shiftLedGroup = new THREE.Group()
  shiftLedGroup.name = 'ShiftLedArray'
  shiftLedGroup.position.set(0, 0.072, 0.016)
  root.add(shiftLedGroup)

  const ledRadius = 0.0028
  const ledGeom = new THREE.CylinderGeometry(ledRadius, ledRadius, 0.004, 12)
  ledGeom.rotateX(Math.PI / 2)
  disposables.push(ledGeom)

  // 15 Shift LEDs (5 Green -> 5 Red -> 5 Blue)
  for (let i = 0; i < 15; i++) {
    const xPos = -0.045 + (i / 14) * 0.09
    const baseColor = i < 5 ? 0x00ff00 : i < 10 ? 0xff0000 : 0x0066ff
    const ledMat = new THREE.MeshStandardMaterial({
      color: 0x222222,
      emissive: baseColor,
      emissiveIntensity: 0.15,
      roughness: 0.2,
      metalness: 0.5,
    })
    disposables.push(ledMat)

    const ledMesh = new THREE.Mesh(ledGeom, ledMat)
    ledMesh.position.set(xPos, 0, 0)
    ledMesh.userData = { index: i, baseColor }
    shiftLedGroup.add(ledMesh)
    shiftLedMeshes.push(ledMesh)
  }

  // 3x Left & 3x Right FIA Flag Status LEDs
  for (let side = 0; side < 2; side++) {
    const isRight = side === 1
    const xPos = isRight ? 0.058 : -0.058
    const flagArray = isRight ? flagRightLeds : flagLeftLeds

    for (let j = 0; j < 3; j++) {
      const yPos = 0.045 - j * 0.016
      const flagLedMat = new THREE.MeshStandardMaterial({
        color: 0x333333,
        emissive: 0xffff00,
        emissiveIntensity: 0.2,
        roughness: 0.2,
      })
      disposables.push(flagLedMat)

      const flagLedMesh = new THREE.Mesh(ledGeom, flagLedMat)
      flagLedMesh.position.set(xPos, yPos, 0.017)
      root.add(flagLedMesh)
      flagArray.push(flagLedMesh)
    }
  }

  // --- 3.5 Decorative Titanium Faceplate Fasteners ---
  const boltGeom = new THREE.CylinderGeometry(0.002, 0.002, 0.002, 6)
  boltGeom.rotateX(Math.PI / 2)
  disposables.push(boltGeom)

  const boltPositions = [
    [-0.1, 0.07],
    [0.1, 0.07],
    [-0.095, -0.065],
    [0.095, -0.065],
    [-0.035, -0.075],
    [0.035, -0.075],
  ]
  boltPositions.forEach(([bx, by]) => {
    const bolt = new THREE.Mesh(boltGeom, titaniumMat)
    bolt.position.set(bx, by, 0.015)
    root.add(bolt)
  })

  // --- 3.6 Push Buttons with Raised Protective Collars & Silkscreen Decals ---
  const buttonConfigs: { id: string; x: number; y: number; colorHex: string; colorNum: number; label: string }[] = [
    // Top Row
    { id: 'btn_drs', x: -0.092, y: 0.056, colorHex: '#00ff66', colorNum: 0x00ff66, label: 'DRS' },
    { id: 'btn_radio', x: -0.072, y: 0.068, colorHex: '#ffd000', colorNum: 0xffd000, label: 'RAD' },
    { id: 'btn_marshal_ack', x: 0, y: 0.076, colorHex: '#ffffff', colorNum: 0xffffff, label: 'ACK' },
    { id: 'btn_pit_limiter', x: 0.072, y: 0.068, colorHex: '#ff2222', colorNum: 0xff2222, label: 'PL' },
    { id: 'btn_overtake', x: 0.092, y: 0.056, colorHex: '#c026d3', colorNum: 0xc026d3, label: 'OT' },

    // Middle Row / Thumb Clusters
    { id: 'btn_neutral', x: -0.088, y: 0.032, colorHex: '#00dd55', colorNum: 0x00dd55, label: 'N' },
    { id: 'btn_reverse', x: 0.088, y: 0.032, colorHex: '#ff9900', colorNum: 0xff9900, label: 'R' },
    { id: 'btn_soc_harvest', x: -0.092, y: 0.008, colorHex: '#00e5ff', colorNum: 0x00e5ff, label: 'SOC' },
    { id: 'btn_pass_pace', x: 0.092, y: 0.008, colorHex: '#ff5500', colorNum: 0xff5500, label: 'PASS' },

    // Brake Balance & Engine Braking Rockers
    { id: 'btn_eb_plus', x: -0.078, y: -0.016, colorHex: '#3b82f6', colorNum: 0x3b82f6, label: 'EB+' },
    { id: 'btn_eb_minus', x: -0.078, y: -0.038, colorHex: '#3b82f6', colorNum: 0x3b82f6, label: 'EB-' },
    { id: 'btn_bb_plus', x: 0.078, y: -0.016, colorHex: '#f43f5e', colorNum: 0xf43f5e, label: 'BB+' },
    { id: 'btn_bb_minus', x: 0.078, y: -0.038, colorHex: '#f43f5e', colorNum: 0xf43f5e, label: 'BB-' },

    // Lower Buttons
    { id: 'btn_drink', x: -0.092, y: -0.06, colorHex: '#0088ff', colorNum: 0x0088ff, label: 'DRK' },
    { id: 'btn_page_next', x: -0.048, y: -0.024, colorHex: '#ffffff', colorNum: 0xffffff, label: 'P+' },
    { id: 'btn_page_prev', x: 0.048, y: -0.024, colorHex: '#ffffff', colorNum: 0xffffff, label: 'P-' },
  ]

  // Shared Geometries for Buttons
  const outerCollarGeom = new THREE.CylinderGeometry(0.0082, 0.0088, 0.006, 20)
  outerCollarGeom.rotateX(Math.PI / 2)
  disposables.push(outerCollarGeom)

  const innerBezelGeom = new THREE.TorusGeometry(0.0078, 0.0007, 6, 20)
  disposables.push(innerBezelGeom)

  const buttonPlungerGeom = new THREE.CylinderGeometry(0.0062, 0.0062, 0.0075, 20)
  buttonPlungerGeom.rotateX(Math.PI / 2)
  disposables.push(buttonPlungerGeom)

  const buttonDecalGeom = new THREE.PlaneGeometry(0.0122, 0.0122)
  disposables.push(buttonDecalGeom)

  buttonConfigs.forEach((cfg) => {
    // 1. Raised CNC Anodized Aluminum Safety Collar
    const collar = new THREE.Mesh(outerCollarGeom, anodizedBlackMat)
    collar.position.set(cfg.x, cfg.y, 0.014)
    root.add(collar)

    // 2. Titanium Chamfer Accent Ring
    const bezel = new THREE.Mesh(innerBezelGeom, titaniumMat)
    bezel.position.set(cfg.x, cfg.y, 0.017)
    root.add(bezel)

    // 3. Moving Button Assembly (Group)
    const buttonGroup = new THREE.Group()
    buttonGroup.position.set(cfg.x, cfg.y, 0.0185)

    // Tactile Plunger Body
    const capMat = new THREE.MeshStandardMaterial({
      color: 0x141820,
      roughness: 0.35,
      metalness: 0.4,
      emissive: cfg.colorNum,
      emissiveIntensity: 0.08,
    })
    disposables.push(capMat)

    const plungerMesh = new THREE.Mesh(buttonPlungerGeom, capMat)
    buttonGroup.add(plungerMesh)

    // High-Resolution Laser-Etched Decal Face
    const decalTex = createButtonDecalTexture(cfg.label, cfg.colorHex)
    disposables.push(decalTex)

    const decalMat = new THREE.MeshBasicMaterial({
      map: decalTex,
      transparent: true,
      depthWrite: true,
    })
    disposables.push(decalMat)

    const decalMesh = new THREE.Mesh(buttonDecalGeom, decalMat)
    decalMesh.position.set(0, 0, 0.0039)
    buttonGroup.add(decalMesh)

    buttonGroup.name = cfg.id
    buttonGroup.userData = { controlId: cfg.id, type: 'BUTTON' }
    plungerMesh.userData = { controlId: cfg.id, type: 'BUTTON' }
    decalMesh.userData = { controlId: cfg.id, type: 'BUTTON' }

    interactiveMeshes.push(plungerMesh, decalMesh)
    controlMeshMap.set(cfg.id, plungerMesh)
    root.add(buttonGroup)

    animatedParts.set(cfg.id, {
      mesh: buttonGroup,
      type: 'BUTTON',
      initialPos: buttonGroup.position.clone(),
      initialRot: buttonGroup.rotation.clone(),
      currentOffset: 0,
      targetOffset: 0,
      rotAngle: 0,
    })
  })

  // --- 3.7 Rotary Dials & Thumb Wheels with Laser-Etched Scales ---
  const rotaryConfigs: {
    id: string
    x: number
    y: number
    colorHex: string
    colorNum: number
    label: string
    options: string[]
    isThumb?: boolean
  }[] = [
    // Left & Right Thumb Wheels on grips
    {
      id: 'rot_diff_entry',
      x: -0.114,
      y: 0.038,
      colorHex: '#ffcc00',
      colorNum: 0xffcc00,
      label: 'DIFF IN',
      options: ['48%', '50%', '52%', '54%', '56%', '58%', '60%'],
      isThumb: true,
    },
    {
      id: 'rot_diff_exit',
      x: 0.114,
      y: 0.038,
      colorHex: '#ff9900',
      colorNum: 0xff9900,
      label: 'DIFF OUT',
      options: ['52%', '54%', '56%', '58%', '60%', '62%', '64%'],
      isThumb: true,
    },

    // Lower Center 4 Rotary Dials
    {
      id: 'rot_strat_mode',
      x: -0.052,
      y: -0.056,
      colorHex: '#ef4444',
      colorNum: 0xef4444,
      label: 'STRAT',
      options: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
    },
    {
      id: 'rot_tire_selector',
      x: -0.018,
      y: -0.056,
      colorHex: '#ffffff',
      colorNum: 0xffffff,
      label: 'TYRE',
      options: ['SFT', 'MED', 'HRD', 'INT', 'WET'],
    },
    {
      id: 'rot_multifunction',
      x: 0.018,
      y: -0.056,
      colorHex: '#06b6d4',
      colorNum: 0x06b6d4,
      label: 'MF',
      options: ['ENG', 'MGU', 'BRK', 'AERO', 'RADIO', 'SYS'],
    },
    {
      id: 'rot_bite_point',
      x: 0.052,
      y: -0.056,
      colorHex: '#a855f7',
      colorNum: 0xa855f7,
      label: 'CLUTCH',
      options: ['1', '2', '3', '4', '5', '6', '7', '8'],
    },
  ]

  const dialKnobGeom = new THREE.CylinderGeometry(0.0112, 0.0118, 0.012, 28)
  dialKnobGeom.rotateX(Math.PI / 2)
  disposables.push(dialKnobGeom)

  const thumbDialGeom = new THREE.CylinderGeometry(0.0092, 0.0092, 0.018, 20)
  thumbDialGeom.rotateZ(Math.PI / 2)
  disposables.push(thumbDialGeom)

  const dialPointerGeom = new THREE.BoxGeometry(0.0022, 0.009, 0.0035)
  disposables.push(dialPointerGeom)

  const dialScaleGeom = new THREE.PlaneGeometry(0.026, 0.026)
  disposables.push(dialScaleGeom)

  rotaryConfigs.forEach((rc) => {
    // 1. Dial Base Scale Plate (for faceplate rotaries)
    if (!rc.isThumb) {
      const scaleTex = createDialScaleTexture(rc.options, rc.colorHex)
      disposables.push(scaleTex)

      const scaleMat = new THREE.MeshBasicMaterial({ map: scaleTex, transparent: true, depthWrite: false })
      disposables.push(scaleMat)

      const scaleMesh = new THREE.Mesh(dialScaleGeom, scaleMat)
      scaleMesh.position.set(rc.x, rc.y, 0.0145)
      root.add(scaleMesh)
    }

    // 2. Rotary Knob Group
    const dialGroup = new THREE.Group()
    dialGroup.position.set(rc.x, rc.y, rc.isThumb ? 0.012 : 0.019)

    const dialMat = new THREE.MeshStandardMaterial({
      color: 0x1e2229,
      metalness: 0.9,
      roughness: 0.25,
    })
    disposables.push(dialMat)

    const geom = rc.isThumb ? thumbDialGeom : dialKnobGeom
    const knobMesh = new THREE.Mesh(geom, dialMat)
    dialGroup.add(knobMesh)

    // Pointer notch / laser-etched indicator line
    const pointerMat = new THREE.MeshBasicMaterial({ color: rc.colorNum })
    disposables.push(pointerMat)

    const pointerMesh = new THREE.Mesh(dialPointerGeom, pointerMat)
    pointerMesh.position.set(0, 0.006, 0.0062)
    dialGroup.add(pointerMesh)

    dialGroup.name = rc.id
    dialGroup.userData = { controlId: rc.id, type: 'ROTARY' }

    // Hit box for raycasting
    const hitBoxGeom = new THREE.BoxGeometry(0.028, 0.028, 0.022)
    const hitBoxMat = new THREE.MeshBasicMaterial({ visible: false })
    disposables.push(hitBoxGeom, hitBoxMat)
    const hitBox = new THREE.Mesh(hitBoxGeom, hitBoxMat)
    hitBox.userData = { controlId: rc.id, type: 'ROTARY' }
    dialGroup.add(hitBox)
    interactiveMeshes.push(hitBox)

    controlMeshMap.set(rc.id, hitBox)
    root.add(dialGroup)

    animatedParts.set(rc.id, {
      mesh: dialGroup,
      type: 'ROTARY',
      initialPos: dialGroup.position.clone(),
      initialRot: dialGroup.rotation.clone(),
      currentOffset: 0,
      targetOffset: 0,
      rotAngle: 0,
    })
  })

  // --- 3.8 Rear Assembly: Quick Release Boss & High-Contrast Paddle Shifters ---
  // Rear Quick Release Hub Boss
  const qrHubGeom = new THREE.CylinderGeometry(0.032, 0.038, 0.045, 24)
  qrHubGeom.rotateX(Math.PI / 2)
  disposables.push(qrHubGeom)

  const qrHubMesh = new THREE.Mesh(qrHubGeom, anodizedBlackMat)
  qrHubMesh.position.set(0, 0.01, -0.035)
  root.add(qrHubMesh)

  // Splined aluminum quick-release locking collar with red safety accents
  const qrRingGeom = new THREE.TorusGeometry(0.035, 0.006, 8, 24)
  disposables.push(qrRingGeom)
  const qrRingMat = new THREE.MeshStandardMaterial({ color: 0xef4444, metalness: 0.8, roughness: 0.25 })
  disposables.push(qrRingMat)
  const qrRingMesh = new THREE.Mesh(qrRingGeom, qrRingMat)
  qrRingMesh.position.set(0, 0.01, -0.048)
  root.add(qrRingMesh)

  // High-Contrast Paddle Material (glossy clearcoat carbon weave)
  const paddleCarbonMat = new THREE.MeshStandardMaterial({
    map: carbonTex,
    color: 0x3a424e,
    roughness: 0.22,
    metalness: 0.5,
  })
  disposables.push(paddleCarbonMat)

  // Carbon Paddle Shifters (Upshift & Downshift)
  function makePaddle(isUpshift: boolean): THREE.Group {
    const paddleGroup = new THREE.Group()
    const sign = isUpshift ? 1 : -1
    const symbol = isUpshift ? '+' : '−'
    const symColor = isUpshift ? '#00ff66' : '#ff2222'

    // Carbon lever blade
    const paddleShape = new THREE.Shape()
    paddleShape.moveTo(0, -0.048)
    paddleShape.lineTo(sign * 0.042, -0.038)
    paddleShape.lineTo(sign * 0.048, 0.038)
    paddleShape.lineTo(0, 0.048)
    paddleShape.closePath()

    const paddleGeom = new THREE.ExtrudeGeometry(paddleShape, { depth: 0.0032, bevelEnabled: true, bevelThickness: 0.0012, bevelSize: 0.0012 })
    disposables.push(paddleGeom)

    const paddleMesh = new THREE.Mesh(paddleGeom, paddleCarbonMat)
    paddleGroup.add(paddleMesh)

    // Laser-etched + / − decal on paddle face
    const paddleDecalTex = createPaddleDecalTexture(symbol, symColor)
    disposables.push(paddleDecalTex)

    const pDecalMat = new THREE.MeshBasicMaterial({ map: paddleDecalTex, transparent: true, depthWrite: false })
    disposables.push(pDecalMat)

    const pDecalGeom = new THREE.PlaneGeometry(0.028, 0.028)
    disposables.push(pDecalGeom)

    const pDecalMesh = new THREE.Mesh(pDecalGeom, pDecalMat)
    pDecalMesh.position.set(sign * 0.022, 0, -0.001)
    pDecalMesh.rotation.y = Math.PI // Facing back toward camera
    paddleGroup.add(pDecalMesh)

    // Pivot mount bracket & bright titanium hinge
    const pivotGeom = new THREE.BoxGeometry(0.014, 0.02, 0.024)
    disposables.push(pivotGeom)
    const pivotMesh = new THREE.Mesh(pivotGeom, titaniumMat)
    pivotMesh.position.set(sign * -0.008, 0, 0.01)
    paddleGroup.add(pivotMesh)

    // Neodymium magnetic switch cylinder
    const magnetGeom = new THREE.CylinderGeometry(0.0042, 0.0042, 0.012, 16)
    magnetGeom.rotateX(Math.PI / 2)
    disposables.push(magnetGeom)
    const magnetMesh = new THREE.Mesh(magnetGeom, titaniumMat)
    magnetMesh.position.set(sign * 0.006, 0.012, 0.008)
    paddleGroup.add(magnetMesh)

    const id = isUpshift ? 'paddle_upshift' : 'paddle_downshift'
    paddleGroup.name = id
    paddleGroup.userData = { controlId: id, type: 'PADDLE' }
    paddleGroup.position.set(sign * 0.092, 0.02, -0.022)

    // Hit box for raycasting
    const hitBoxGeom = new THREE.BoxGeometry(0.065, 0.095, 0.024)
    const hitBoxMat = new THREE.MeshBasicMaterial({ visible: false })
    disposables.push(hitBoxGeom, hitBoxMat)
    const hitBox = new THREE.Mesh(hitBoxGeom, hitBoxMat)
    hitBox.position.set(sign * 0.02, 0, 0)
    hitBox.userData = { controlId: id, type: 'PADDLE' }
    paddleGroup.add(hitBox)
    interactiveMeshes.push(hitBox)

    controlMeshMap.set(id, hitBox)
    root.add(paddleGroup)

    animatedParts.set(id, {
      mesh: paddleGroup,
      type: 'PADDLE',
      initialPos: paddleGroup.position.clone(),
      initialRot: paddleGroup.rotation.clone(),
      currentOffset: 0,
      targetOffset: 0,
      rotAngle: 0,
    })

    return paddleGroup
  }

  makePaddle(false) // Downshift (Left)
  makePaddle(true)  // Upshift (Right)

  // Lower Dual Launch Clutch Paddles with Aluminum Finish
  function makeClutchPaddle(isRight: boolean) {
    const sign = isRight ? 1 : -1
    const id = isRight ? 'paddle_clutch_right' : 'paddle_clutch_left'

    const clutchGroup = new THREE.Group()
    const clutchGeom = new THREE.BoxGeometry(0.046, 0.024, 0.0035)
    disposables.push(clutchGeom)

    const clutchMesh = new THREE.Mesh(clutchGeom, titaniumMat)
    clutchGroup.add(clutchMesh)

    // Grip ridges on clutch lever
    for (let r = -2; r <= 2; r++) {
      const ridgeGeom = new THREE.BoxGeometry(0.003, 0.018, 0.001)
      disposables.push(ridgeGeom)
      const ridge = new THREE.Mesh(ridgeGeom, anodizedBlackMat)
      ridge.position.set(r * 0.008, 0, -0.002)
      clutchGroup.add(ridge)
    }

    clutchGroup.position.set(sign * 0.075, -0.05, -0.02)
    clutchGroup.name = id
    clutchGroup.userData = { controlId: id, type: 'PADDLE' }

    const hitBoxGeom = new THREE.BoxGeometry(0.055, 0.038, 0.022)
    const hitBoxMat = new THREE.MeshBasicMaterial({ visible: false })
    disposables.push(hitBoxGeom, hitBoxMat)
    const hitBox = new THREE.Mesh(hitBoxGeom, hitBoxMat)
    hitBox.userData = { controlId: id, type: 'PADDLE' }
    clutchGroup.add(hitBox)
    interactiveMeshes.push(hitBox)

    controlMeshMap.set(id, hitBox)
    root.add(clutchGroup)

    animatedParts.set(id, {
      mesh: clutchGroup,
      type: 'PADDLE',
      initialPos: clutchGroup.position.clone(),
      initialRot: clutchGroup.rotation.clone(),
      currentOffset: 0,
      targetOffset: 0,
      rotAngle: 0,
    })
  }

  makeClutchPaddle(false)
  makeClutchPaddle(true)

  // ==========================================
  // 4. INTERACTION METHODS & CONTROLLER API
  // ==========================================

  function pressButton(id: string) {
    const part = animatedParts.get(id)
    if (part && part.type === 'BUTTON') {
      part.targetOffset = -0.0035 // Depress 3.5mm along Z
    }
  }

  function turnRotary(id: string, deltaSteps = 1) {
    const part = animatedParts.get(id)
    if (part && part.type === 'ROTARY') {
      part.rotAngle += (Math.PI / 6) * deltaSteps // 30-degree detent step
    }
  }

  function pullPaddle(id: string) {
    const part = animatedParts.get(id)
    if (part && part.type === 'PADDLE') {
      part.targetOffset = -0.22 // Pull angle in radians
    }
  }

  function highlightControl(id: string | null) {
    interactiveMeshes.forEach((mesh) => {
      const mat = mesh.material as THREE.MeshStandardMaterial
      if (mat && mat.emissive) {
        mat.emissive.setHex(mesh.name === id ? 0x223344 : 0x000000)
      }
    })
  }

  function setTelemetry(data: Partial<WheelTelemetryData>) {
    Object.assign(telemetry, data)
    renderLcdCanvas()
  }

  function setLcdPage(page: number) {
    activeLcdPage = Math.max(1, Math.min(4, page))
    renderLcdCanvas()
  }

  function getActiveLcdPage(): number {
    return activeLcdPage
  }

  function getControlById(id: string): WheelControlMetadata | undefined {
    return F1_STEERING_WHEEL_CONTROLS.find((c) => c.id === id)
  }

  // Update loop for spring animations, shift LEDs, and flag flashing
  let elapsed = 0
  function update(deltaSeconds: number) {
    elapsed += deltaSeconds

    // 1. Animate Buttons & Paddles Spring Return
    animatedParts.forEach((part) => {
      if (part.type === 'BUTTON') {
        // Fast push, smooth spring return
        part.currentOffset += (part.targetOffset - part.currentOffset) * Math.min(1, deltaSeconds * 28)
        part.mesh.position.z = part.initialPos.z + part.currentOffset
        part.targetOffset += (0 - part.targetOffset) * Math.min(1, deltaSeconds * 12)
      } else if (part.type === 'ROTARY') {
        // Smooth rotation to target detent angle
        part.mesh.rotation.z += (part.rotAngle - part.mesh.rotation.z) * Math.min(1, deltaSeconds * 16)
      } else if (part.type === 'PADDLE') {
        // Pull and snap back
        part.currentOffset += (part.targetOffset - part.currentOffset) * Math.min(1, deltaSeconds * 24)
        part.mesh.rotation.y = part.initialRot.y + part.currentOffset
        part.targetOffset += (0 - part.targetOffset) * Math.min(1, deltaSeconds * 14)
      }
    })

    // 2. Animate 15x Shift LEDs based on RPM ratio
    const rpmRatio = Math.max(0, Math.min(1, (telemetry.rpm - 8500) / (telemetry.maxRpm - 8500)))
    const activeLedsCount = Math.floor(rpmRatio * 15)
    const isOverRev = telemetry.rpm >= telemetry.maxRpm - 300
    const flashState = isOverRev ? Math.sin(elapsed * 35) > 0 : true

    shiftLedMeshes.forEach((mesh, index) => {
      const mat = mesh.material as THREE.MeshStandardMaterial
      const isActive = index < activeLedsCount && flashState
      mat.emissiveIntensity = isActive ? 1.2 : 0.1
      mat.color.setHex(isActive ? (mesh.userData.baseColor as number) : 0x222222)
    })

    // 3. Animate Flag LEDs
    const isFlashingFlag =
      telemetry.flagStatus === 'YELLOW' || telemetry.flagStatus === 'VSC' || telemetry.flagStatus === 'SC' || telemetry.flagStatus === 'RED'
    const flagFlash = isFlashingFlag ? Math.sin(elapsed * 12) > 0 : true
    const flagColorHex =
      telemetry.flagStatus === 'GREEN'
        ? 0x00ff00
        : telemetry.flagStatus === 'YELLOW'
        ? 0xffff00
        : telemetry.flagStatus === 'VSC' || telemetry.flagStatus === 'SC'
        ? 0xff9900
        : telemetry.flagStatus === 'RED'
        ? 0xff0000
        : 0x00ccff

    flagLeftLeds.concat(flagRightLeds).forEach((mesh) => {
      const mat = mesh.material as THREE.MeshStandardMaterial
      mat.emissive.setHex(flagColorHex)
      mat.emissiveIntensity = flagFlash ? 1.0 : 0.1
    })
  }

  function dispose() {
    disposables.forEach((item) => item.dispose())
  }

  return {
    root,
    interactiveMeshes,
    getControlById,
    pressButton,
    turnRotary,
    pullPaddle,
    highlightControl,
    setTelemetry,
    setLcdPage,
    getActiveLcdPage,
    update,
    dispose,
  }
}
