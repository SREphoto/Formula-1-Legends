import * as THREE from 'three'
import { F1_2026_CAR_PARTS, type CarPartMetadata, type SubsystemCategory } from './carPartsData'

export type CarbonFinish = 'gloss' | 'matte' | 'forged' | 'satin'

export interface LiveryConfig {
  primaryColor: string
  accentColor: string
  carbonFinish: CarbonFinish
  sponsorNose: string
  sponsorSidepods: string
  sponsorSharkFin: string
  sponsorRearWing: string
  driverNumber: number
}

export interface F1Car2026Controller {
  root: THREE.Group
  setAeroMode: (mode: 'CORNER' | 'STRAIGHT') => void
  setExplodedRatio: (ratio: number, targetCategory?: 'ALL' | SubsystemCategory) => void
  setSubsystemFilter: (category: 'ALL' | SubsystemCategory) => void
  setWireframeMode: (wireframe: boolean) => void
  setClippingPlane: (axis: 'NONE' | 'X' | 'Y' | 'Z', offset: number) => void
  setCfdHeatmapMode: (enabled: boolean, mode?: 'CORNER' | 'STRAIGHT') => void
  setFlirMode: (enabled: boolean, tireCoreC?: number, brakeTempC?: number) => void
  setEnergyFlow: (mode: 'DEPLOY' | 'HARVEST' | 'NEUTRAL', powerKw?: number) => void
  setSuspensionCompression: (heaveFrontM: number, heaveRearM: number) => void
  spinWheels: (radDelta: number) => void
  setAeroRakeMode: (enabled: boolean) => void
  updateLivery: (config: LiveryConfig) => void
  update: (deltaSeconds: number) => void
  dispose: () => void
  partMeshes: Map<string, THREE.Mesh | THREE.Group>
  getPartById: (id: string) => CarPartMetadata | undefined
}

interface ComponentNode {
  mesh: THREE.Mesh | THREE.Group
  basePos: THREE.Vector3
  baseRot: THREE.Euler
  explodeVector: THREE.Vector3
  category: SubsystemCategory
  id: string
}

function makePrism(radiusFront: number, radiusRear: number, length: number, flatten = 1): THREE.BufferGeometry {
  const geom = new THREE.CylinderGeometry(radiusFront, radiusRear, length, 4, 1, false, Math.PI / 4)
  geom.rotateX(Math.PI / 2)
  geom.scale(1, flatten, 1)
  return geom
}

function makeStrut(from: THREE.Vector3, to: THREE.Vector3, radius = 0.016): THREE.BufferGeometry {
  const direction = to.clone().sub(from)
  const length = direction.length()
  const geom = new THREE.CylinderGeometry(radius, radius, length, 8)
  geom.translate(0, length / 2, 0)
  geom.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize()))
  geom.translate(from.x, from.y, from.z)
  return geom
}

function createCarbonTexture(finish: CarbonFinish): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 128
  canvas.height = 128
  const ctx = canvas.getContext('2d')!

  if (finish === 'forged') {
    ctx.fillStyle = '#111418'
    ctx.fillRect(0, 0, 128, 128)
    const flakeColors = ['#1a1f26', '#222933', '#151920', '#2a323d', '#0e1115']
    for (let i = 0; i < 90; i++) {
      ctx.fillStyle = flakeColors[i % flakeColors.length]
      ctx.beginPath()
      const x = Math.random() * 128
      const y = Math.random() * 128
      const size = 6 + Math.random() * 14
      ctx.moveTo(x, y)
      ctx.lineTo(x + size * (Math.random() - 0.5) * 2, y + size)
      ctx.lineTo(x + size, y + size * 0.5)
      ctx.closePath()
      ctx.fill()
    }
  } else if (finish === 'matte') {
    ctx.fillStyle = '#14171b'
    ctx.fillRect(0, 0, 128, 128)
    ctx.fillStyle = 'rgba(255,255,255,0.03)'
    for (let x = 0; x < 128; x += 2) {
      for (let y = 0; y < 128; y += 2) {
        if ((x + y) % 4 === 0) ctx.fillRect(x, y, 1, 1)
      }
    }
  } else {
    ctx.fillStyle = '#0f1115'
    ctx.fillRect(0, 0, 128, 128)
    ctx.fillStyle = '#222831'
    const step = 8
    for (let x = 0; x < 128; x += step) {
      for (let y = 0; y < 128; y += step) {
        if ((Math.floor(x / step) + Math.floor(y / step)) % 2 === 0) {
          ctx.fillRect(x, y, step, step / 2)
          ctx.fillRect(x + step / 2, y + step / 2, step / 2, step / 2)
        }
      }
    }
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(8, 8)
  return texture
}

function createSponsorCanvasTexture(
  type: 'sidepod' | 'nose' | 'shark_fin' | 'rear_wing',
  config: LiveryConfig,
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 1024
  canvas.height = 512
  const ctx = canvas.getContext('2d')!

  ctx.fillStyle = config.primaryColor
  ctx.fillRect(0, 0, 1024, 512)

  ctx.fillStyle = config.accentColor
  if (type === 'sidepod') {
    ctx.beginPath()
    ctx.moveTo(0, 420)
    ctx.lineTo(580, 100)
    ctx.lineTo(660, 100)
    ctx.lineTo(80, 420)
    ctx.closePath()
    ctx.fill()

    ctx.beginPath()
    ctx.moveTo(150, 480)
    ctx.lineTo(780, 160)
    ctx.lineTo(820, 160)
    ctx.lineTo(190, 480)
    ctx.closePath()
    ctx.fill()

    const sponsor = (config.sponsorSidepods || 'PIRELLI').toUpperCase()
    ctx.save()
    ctx.translate(460, 280)
    ctx.rotate(-0.06)
    ctx.font = '900 italic 74px "Barlow Condensed", "Arial Black", sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = 'rgba(0,0,0,0.6)'
    ctx.fillText(sponsor, 4, 4)
    ctx.fillStyle = '#ffffff'
    ctx.fillText(sponsor, 0, 0)

    ctx.font = '800 22px "Inter", sans-serif'
    ctx.fillStyle = 'rgba(255,255,255,0.85)'
    ctx.fillText('FIA 2026 AERODYNAMIC PARTNER', 0, 58)
    ctx.restore()
  } else if (type === 'nose') {
    ctx.fillStyle = '#ffffff'
    ctx.beginPath()
    ctx.arc(512, 170, 110, 0, Math.PI * 2)
    ctx.fill()
    ctx.lineWidth = 12
    ctx.strokeStyle = config.accentColor
    ctx.stroke()

    ctx.font = '900 130px "Barlow Condensed", sans-serif'
    ctx.fillStyle = '#0a0d14'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(String(config.driverNumber || 1), 512, 170)

    const sponsor = (config.sponsorNose || 'ORACLE').toUpperCase()
    ctx.font = '900 52px "Barlow Condensed", sans-serif'
    ctx.fillStyle = '#ffffff'
    ctx.fillText(sponsor, 512, 360)

    ctx.fillStyle = config.accentColor
    ctx.fillRect(360, 420, 304, 12)
  } else if (type === 'shark_fin') {
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.lineTo(1024, 0)
    ctx.lineTo(512, 512)
    ctx.closePath()
    ctx.fillStyle = config.accentColor
    ctx.fill()

    const sponsor = (config.sponsorSharkFin || 'TAG HEUER').toUpperCase()
    ctx.font = '900 italic 68px "Barlow Condensed", sans-serif'
    ctx.fillStyle = '#ffffff'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(sponsor, 512, 210)

    ctx.font = '800 26px "Inter", sans-serif'
    ctx.fillStyle = 'rgba(255,255,255,0.8)'
    ctx.fillText('350kW MGU-K · SUSTAINABLE E-FUEL', 512, 290)
  } else if (type === 'rear_wing') {
    ctx.fillStyle = '#0a0c10'
    ctx.fillRect(0, 0, 1024, 512)

    ctx.fillStyle = config.accentColor
    ctx.fillRect(0, 0, 1024, 40)
    ctx.fillRect(0, 472, 1024, 40)

    const sponsor = (config.sponsorRearWing || 'MOBIL 1').toUpperCase()
    ctx.font = '900 84px "Barlow Condensed", sans-serif'
    ctx.fillStyle = '#ffffff'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(sponsor, 512, 256)
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

export function createF1Car2026(
  primaryColor = '#ff1801',
  secondaryColor = '#f4f6f8',
  initialLivery?: Partial<LiveryConfig>,
): F1Car2026Controller {
  const root = new THREE.Group()
  root.name = 'F1_2026_Racecar_Root'

  const disposables: (THREE.BufferGeometry | THREE.Material | THREE.Texture)[] = []
  const componentNodes: ComponentNode[] = []
  const partMeshes = new Map<string, THREE.Mesh | THREE.Group>()
  const standardMaterials: THREE.Material[] = []
  const cfdMaterials: THREE.Material[] = []
  const flirMaterials: THREE.Material[] = []
  const wheelGroups: THREE.Group[] = []

  // ==========================================
  // 1. STANDARD MATERIALS PALETTE
  // ==========================================
  const paintMat = new THREE.MeshStandardMaterial({
    color: primaryColor,
    metalness: 0.65,
    roughness: 0.28,
    side: THREE.DoubleSide,
  })
  const secondaryPaintMat = new THREE.MeshStandardMaterial({
    color: secondaryColor,
    metalness: 0.6,
    roughness: 0.32,
    side: THREE.DoubleSide,
  })
  const carbonMat = new THREE.MeshStandardMaterial({
    color: '#16191d',
    roughness: 0.55,
    metalness: 0.3,
    side: THREE.DoubleSide,
  })
  const carbonGlossMat = new THREE.MeshStandardMaterial({
    color: '#0d0f12',
    roughness: 0.2,
    metalness: 0.45,
    side: THREE.DoubleSide,
  })
  const titaniumMat = new THREE.MeshStandardMaterial({
    color: '#9aa0a6',
    roughness: 0.25,
    metalness: 0.88,
    side: THREE.DoubleSide,
  })
  const goldHeatShieldMat = new THREE.MeshStandardMaterial({
    color: '#d4af37',
    metalness: 0.95,
    roughness: 0.18,
    emissive: '#473600',
    emissiveIntensity: 0.2,
    side: THREE.DoubleSide,
  })
  const copperMat = new THREE.MeshStandardMaterial({
    color: '#b87333',
    metalness: 0.9,
    roughness: 0.35,
    side: THREE.DoubleSide,
  })
  const batteryCellMat = new THREE.MeshStandardMaterial({
    color: '#00d26a',
    metalness: 0.4,
    roughness: 0.4,
    side: THREE.DoubleSide,
  })
  const brakeDiscMat = new THREE.MeshStandardMaterial({
    color: '#2a2b2e',
    metalness: 0.4,
    roughness: 0.6,
    side: THREE.DoubleSide,
  })
  const tireRubberMat = new THREE.MeshStandardMaterial({
    color: '#121417',
    roughness: 0.92,
    metalness: 0.05,
  })
  const rimMat = new THREE.MeshStandardMaterial({
    color: '#34383e',
    metalness: 0.85,
    roughness: 0.25,
  })
  const rainLedMat = new THREE.MeshStandardMaterial({
    color: '#ff1e27',
    emissive: '#ff1e27',
    emissiveIntensity: 3.2,
    roughness: 0.2,
  })

  // Dynamic High-Voltage Conduit Glow Material (350kW MGU-K Flow)
  const hvConduitGlowMat = new THREE.MeshStandardMaterial({
    color: '#00ff99',
    emissive: '#00ff88',
    emissiveIntensity: 1.5,
    metalness: 0.8,
    roughness: 0.2,
  })

  standardMaterials.push(
    paintMat,
    secondaryPaintMat,
    carbonMat,
    carbonGlossMat,
    titaniumMat,
    goldHeatShieldMat,
    copperMat,
    batteryCellMat,
    brakeDiscMat,
    tireRubberMat,
    rimMat,
    rainLedMat,
    hvConduitGlowMat,
  )

  // ==========================================
  // 2. CFD SURFACE PRESSURE HEATMAP MATERIALS
  // ==========================================
  const cfdHighPressureMat = new THREE.MeshStandardMaterial({
    color: '#ff1b1b',
    emissive: '#7a0505',
    emissiveIntensity: 0.5,
    roughness: 0.3,
    metalness: 0.2,
    side: THREE.DoubleSide,
  })
  const cfdMediumPressureMat = new THREE.MeshStandardMaterial({
    color: '#ffd60a',
    emissive: '#665200',
    emissiveIntensity: 0.35,
    roughness: 0.3,
    metalness: 0.2,
    side: THREE.DoubleSide,
  })
  const cfdNeutralMat = new THREE.MeshStandardMaterial({
    color: '#30d158',
    emissive: '#094717',
    emissiveIntensity: 0.3,
    roughness: 0.3,
    metalness: 0.2,
    side: THREE.DoubleSide,
  })
  const cfdLowPressureMat = new THREE.MeshStandardMaterial({
    color: '#0a84ff',
    emissive: '#002a66',
    emissiveIntensity: 0.4,
    roughness: 0.3,
    metalness: 0.2,
    side: THREE.DoubleSide,
  })
  const cfdSuctionPeakMat = new THREE.MeshStandardMaterial({
    color: '#bf5af2',
    emissive: '#3e0959',
    emissiveIntensity: 0.6,
    roughness: 0.3,
    metalness: 0.2,
    side: THREE.DoubleSide,
  })

  cfdMaterials.push(
    cfdHighPressureMat,
    cfdMediumPressureMat,
    cfdNeutralMat,
    cfdLowPressureMat,
    cfdSuctionPeakMat,
  )

  // ==========================================
  // 3. FLIR THERMAL INFRARED MATERIALS
  // ==========================================
  const flirColdBodyMat = new THREE.MeshStandardMaterial({
    color: '#0d152e',
    emissive: '#050a17',
    emissiveIntensity: 0.2,
    roughness: 0.4,
    side: THREE.DoubleSide,
  })
  const flirTireOptimalMat = new THREE.MeshStandardMaterial({
    color: '#ff6200',
    emissive: '#701e00',
    emissiveIntensity: 0.6,
    roughness: 0.5,
  })
  const flirTireHotMat = new THREE.MeshStandardMaterial({
    color: '#ffea00',
    emissive: '#8c7d00',
    emissiveIntensity: 0.85,
    roughness: 0.4,
  })
  const flirBrakeExtremeMat = new THREE.MeshStandardMaterial({
    color: '#ffffff',
    emissive: '#ff4400',
    emissiveIntensity: 2.8,
    roughness: 0.2,
  })
  const flirEngineHotMat = new THREE.MeshStandardMaterial({
    color: '#ff2a00',
    emissive: '#8c0e00',
    emissiveIntensity: 0.9,
    roughness: 0.3,
    side: THREE.DoubleSide,
  })

  flirMaterials.push(
    flirColdBodyMat,
    flirTireOptimalMat,
    flirTireHotMat,
    flirBrakeExtremeMat,
    flirEngineHotMat,
  )

  disposables.push(...standardMaterials, ...cfdMaterials, ...flirMaterials)

  const registerPart = (
    partId: string,
    mesh: THREE.Mesh | THREE.Group,
    category: SubsystemCategory,
    explodeVector: THREE.Vector3,
  ) => {
    mesh.name = partId
    mesh.userData = {
      partId,
      category,
      metadata: F1_2026_CAR_PARTS.find((p) => p.id === partId),
    }
    mesh.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true
        child.receiveShadow = true
        child.userData = mesh.userData
        if (child.geometry) disposables.push(child.geometry)
        child.userData.originalMaterial = child.material
      }
    })

    const node: ComponentNode = {
      mesh,
      basePos: mesh.position.clone(),
      baseRot: mesh.rotation.clone(),
      explodeVector: explodeVector.clone(),
      category,
      id: partId,
    }
    componentNodes.push(node)
    partMeshes.set(partId, mesh)
    root.add(mesh)
  }

  // ==========================================
  // 1. AERODYNAMICS & BODYWORK (2026 SPECS)
  // ==========================================
  const fwGroup = new THREE.Group()
  const fwMain = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.035, 0.48), carbonGlossMat)
  fwMain.position.set(0, 0.12, 1.95)
  fwMain.userData.cfdMat = cfdHighPressureMat
  fwMain.userData.flirMat = flirColdBodyMat
  fwGroup.add(fwMain)

  const fwLplate = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.22, 0.54), paintMat)
  fwLplate.position.set(-0.95, 0.2, 1.95)
  fwLplate.rotation.y = 0.08
  fwLplate.userData.cfdMat = cfdMediumPressureMat
  fwLplate.userData.flirMat = flirColdBodyMat
  const fwRplate = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.22, 0.54), paintMat)
  fwRplate.position.set(0.95, 0.2, 1.95)
  fwRplate.rotation.y = -0.08
  fwRplate.userData.cfdMat = cfdMediumPressureMat
  fwRplate.userData.flirMat = flirColdBodyMat
  fwGroup.add(fwLplate, fwRplate)
  registerPart('front_wing_mainplane', fwGroup, 'AERO', new THREE.Vector3(0, 0.2, 1.6))

  // Active Front Wing Flaps
  const fwActiveGroup = new THREE.Group()
  const fwFlapL = new THREE.Mesh(new THREE.BoxGeometry(0.84, 0.025, 0.24), secondaryPaintMat)
  fwFlapL.position.set(-0.48, 0.21, 1.88)
  fwFlapL.rotation.x = -0.22
  fwFlapL.userData.cfdMat = cfdHighPressureMat
  fwFlapL.userData.flirMat = flirColdBodyMat
  const fwFlapR = new THREE.Mesh(new THREE.BoxGeometry(0.84, 0.025, 0.24), secondaryPaintMat)
  fwFlapR.position.set(0.48, 0.21, 1.88)
  fwFlapR.rotation.x = -0.22
  fwFlapR.userData.cfdMat = cfdHighPressureMat
  fwFlapR.userData.flirMat = flirColdBodyMat
  fwActiveGroup.add(fwFlapL, fwFlapR)
  registerPart('front_wing_active_flaps', fwActiveGroup, 'AERO', new THREE.Vector3(0, 0.45, 1.8))

  // Front Wheel Deflectors
  const deflectorGroup = new THREE.Group()
  const defL = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.32, 0.24), carbonMat)
  defL.position.set(-0.76, 0.28, 0.95)
  defL.rotation.y = -0.15
  defL.userData.cfdMat = cfdNeutralMat
  defL.userData.flirMat = flirColdBodyMat
  const defR = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.32, 0.24), carbonMat)
  defR.position.set(0.76, 0.28, 0.95)
  defR.rotation.y = 0.15
  defR.userData.cfdMat = cfdNeutralMat
  defR.userData.flirMat = flirColdBodyMat
  deflectorGroup.add(defL, defR)
  registerPart('front_wheel_deflectors', deflectorGroup, 'AERO', new THREE.Vector3(0, 0.1, 0.6))

  // Underfloor & Stepped Diffuser
  const floorGroup = new THREE.Group()
  const floorPlank = new THREE.Mesh(new THREE.BoxGeometry(1.45, 0.045, 3.1), carbonMat)
  floorPlank.position.set(0, 0.09, -0.05)
  floorPlank.userData.cfdMat = cfdSuctionPeakMat
  floorPlank.userData.flirMat = flirColdBodyMat
  const diffuserMesh = new THREE.Mesh(new THREE.BoxGeometry(1.22, 0.04, 0.55), carbonGlossMat)
  diffuserMesh.position.set(0, 0.14, -1.72)
  diffuserMesh.rotation.x = 0.24
  diffuserMesh.userData.cfdMat = cfdSuctionPeakMat
  diffuserMesh.userData.flirMat = flirColdBodyMat
  const skidMesh = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.015, 1.8), titaniumMat)
  skidMesh.position.set(0, 0.065, 0.1)
  skidMesh.userData.cfdMat = cfdLowPressureMat
  skidMesh.userData.flirMat = flirColdBodyMat
  floorGroup.add(floorPlank, diffuserMesh, skidMesh)
  registerPart('underfloor_diffuser', floorGroup, 'AERO', new THREE.Vector3(0, -0.85, 0))

  // Sidepods with Louvres
  const sidepodGroup = new THREE.Group()
  const spL = new THREE.Mesh(makePrism(0.24, 0.15, 1.35, 0.58), paintMat)
  spL.position.set(-0.46, 0.29, -0.25)
  spL.userData.cfdMat = cfdLowPressureMat
  spL.userData.flirMat = flirColdBodyMat
  const spR = new THREE.Mesh(makePrism(0.24, 0.15, 1.35, 0.58), paintMat)
  spR.position.set(0.46, 0.29, -0.25)
  spR.userData.cfdMat = cfdLowPressureMat
  spR.userData.flirMat = flirColdBodyMat
  const inletL = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.14, 0.08), carbonMat)
  inletL.position.set(-0.46, 0.32, 0.44)
  inletL.userData.cfdMat = cfdHighPressureMat
  inletL.userData.flirMat = flirColdBodyMat
  const inletR = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.14, 0.08), carbonMat)
  inletR.position.set(0.46, 0.32, 0.44)
  inletR.userData.cfdMat = cfdHighPressureMat
  inletR.userData.flirMat = flirColdBodyMat
  sidepodGroup.add(spL, spR, inletL, inletR)
  registerPart('sidepods_cooling_louvres', sidepodGroup, 'AERO', new THREE.Vector3(0, 0.35, -0.2))

  // Engine Cover & Shark Fin
  const engineCoverGroup = new THREE.Group()
  const spineMesh = new THREE.Mesh(makePrism(0.24, 0.08, 1.55, 0.55), paintMat)
  spineMesh.position.set(0, 0.52, -0.68)
  spineMesh.userData.cfdMat = cfdNeutralMat
  spineMesh.userData.flirMat = flirColdBodyMat
  const sharkFin = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.34, 0.88), secondaryPaintMat)
  sharkFin.position.set(0, 0.74, -1.24)
  sharkFin.userData.cfdMat = cfdNeutralMat
  sharkFin.userData.flirMat = flirColdBodyMat
  engineCoverGroup.add(spineMesh, sharkFin)
  registerPart('engine_cover_shark_fin', engineCoverGroup, 'AERO', new THREE.Vector3(0, 0.9, -0.5))

  // 3-Element Active Rear Wing
  const rwGroup = new THREE.Group()
  const rwMain = new THREE.Mesh(new THREE.BoxGeometry(1.08, 0.04, 0.38), carbonGlossMat)
  rwMain.position.set(0, 0.88, -1.95)
  rwMain.userData.cfdMat = cfdSuctionPeakMat
  rwMain.userData.flirMat = flirColdBodyMat
  const rwActiveFlap = new THREE.Mesh(new THREE.BoxGeometry(1.04, 0.035, 0.22), secondaryPaintMat)
  rwActiveFlap.position.set(0, 0.99, -1.98)
  rwActiveFlap.rotation.x = 0.24
  rwActiveFlap.name = 'rw_active_flap'
  rwActiveFlap.userData.cfdMat = cfdHighPressureMat
  rwActiveFlap.userData.flirMat = flirColdBodyMat
  const rwActuator = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.18, 8), titaniumMat)
  rwActuator.rotation.x = Math.PI / 2
  rwActuator.position.set(0, 0.94, -1.86)
  rwActuator.userData.cfdMat = cfdNeutralMat
  rwActuator.userData.flirMat = flirColdBodyMat
  const rwEndL = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.44, 0.58), paintMat)
  rwEndL.position.set(-0.54, 0.86, -1.95)
  rwEndL.userData.cfdMat = cfdLowPressureMat
  rwEndL.userData.flirMat = flirColdBodyMat
  const rwEndR = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.44, 0.58), paintMat)
  rwEndR.position.set(0.54, 0.86, -1.95)
  rwEndR.userData.cfdMat = cfdLowPressureMat
  rwEndR.userData.flirMat = flirColdBodyMat
  const endLedL = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.26, 0.02), rainLedMat)
  endLedL.position.set(-0.56, 0.86, -2.22)
  const endLedR = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.26, 0.02), rainLedMat)
  endLedR.position.set(0.56, 0.86, -2.22)
  rwGroup.add(rwMain, rwActiveFlap, rwActuator, rwEndL, rwEndR, endLedL, endLedR)
  registerPart('rear_wing_3element_active', rwGroup, 'AERO', new THREE.Vector3(0, 0.75, -1.7))

  // ==========================================
  // 3D PITOT-TUBE KIEL PROBE AERO-RAKE RIG
  // ==========================================
  const aeroRakeGroup = new THREE.Group()
  aeroRakeGroup.name = 'part_aero_rake_pitot_rig'

  interface ProbeNode {
    mesh: THREE.Mesh
    row: number
    col: number
    isLeft: boolean
    basePos: THREE.Vector3
  }
  const probeNodes: ProbeNode[] = []

  const rakePositions: [number, boolean][] = [
    [-0.78, true],
    [0.78, false],
  ]

  const rakeFrameMat = titaniumMat
  const rakeMountMat = carbonGlossMat

  rakePositions.forEach(([xCenter, isLeft]) => {
    const singleRake = new THREE.Group()
    singleRake.position.set(xCenter, 0.32, 0.98)

    // Structural Carbon Mounting Arm to Chassis & Upright
    const mountArm1 = makeStrut(
      new THREE.Vector3(isLeft ? 0.35 : -0.35, 0.12, -0.3),
      new THREE.Vector3(0, 0, 0),
      0.016,
    )
    const mountArm2 = makeStrut(
      new THREE.Vector3(isLeft ? 0.35 : -0.35, -0.15, -0.15),
      new THREE.Vector3(0, -0.12, 0),
      0.014,
    )
    const mMesh1 = new THREE.Mesh(mountArm1, rakeMountMat)
    const mMesh2 = new THREE.Mesh(mountArm2, rakeMountMat)
    singleRake.add(mMesh1, mMesh2)

    // Titanium Perimeter Frame (0.34m wide x 0.36m high)
    const frameW = 0.34
    const frameH = 0.36
    const fTop = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, frameW, 8), rakeFrameMat)
    fTop.rotation.z = Math.PI / 2
    fTop.position.set(0, frameH / 2, 0)
    const fBottom = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, frameW, 8), rakeFrameMat)
    fBottom.rotation.z = Math.PI / 2
    fBottom.position.set(0, -frameH / 2, 0)
    const fLeft = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, frameH, 8), rakeFrameMat)
    fLeft.position.set(-frameW / 2, 0, 0)
    const fRight = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, frameH, 8), rakeFrameMat)
    fRight.position.set(frameW / 2, 0, 0)
    singleRake.add(fTop, fBottom, fLeft, fRight)

    // 4 Horizontal Lattice Wire Struts
    for (let r = 1; r <= 3; r++) {
      const y = -frameH / 2 + (r * frameH) / 4
      const hStrut = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, frameW, 6), rakeFrameMat)
      hStrut.rotation.z = Math.PI / 2
      hStrut.position.set(0, y, 0)
      singleRake.add(hStrut)
    }

    // 5 Vertical Lattice Wire Struts
    for (let c = 1; c <= 4; c++) {
      const x = -frameW / 2 + (c * frameW) / 5
      const vStrut = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, frameH, 6), rakeFrameMat)
      vStrut.position.set(x, 0, 0)
      singleRake.add(vStrut)
    }

    // 4x5 Array of Forward-Facing Kiel Probes (20 Probes per side = 40 total)
    const rows = 4
    const cols = 5
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const px = -frameW / 2 + 0.035 + (c * (frameW - 0.07)) / (cols - 1)
        const py = -frameH / 2 + 0.035 + (r * (frameH - 0.07)) / (rows - 1)

        const probeGroup = new THREE.Group()
        probeGroup.position.set(px, py, 0)

        // Forward stem tube
        const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.0035, 0.0035, 0.055, 6), rakeFrameMat)
        stem.rotation.x = Math.PI / 2
        stem.position.set(0, 0, 0.028)

        // Kiel probe flared aerodynamic shroud
        const shroud = new THREE.Mesh(new THREE.ConeGeometry(0.009, 0.018, 8, 1, true), rakeFrameMat)
        shroud.rotation.x = -Math.PI / 2
        shroud.position.set(0, 0, 0.055)

        // Pressure Sensor Tip with Dynamic Emissive Shading
        const tipGeo = new THREE.SphereGeometry(0.0055, 8, 6)
        const tipMat = new THREE.MeshStandardMaterial({
          color: '#38bdf8',
          emissive: '#0284c7',
          emissiveIntensity: 1.2,
          roughness: 0.2,
          metalness: 0.8,
        })
        disposables.push(tipGeo, tipMat)
        const tip = new THREE.Mesh(tipGeo, tipMat)
        tip.position.set(0, 0, 0.062)

        probeGroup.add(stem, shroud, tip)
        singleRake.add(probeGroup)

        probeNodes.push({
          mesh: tip,
          row: r,
          col: c,
          isLeft,
          basePos: new THREE.Vector3(xCenter + px, 0.32 + py, 0.98 + 0.062),
        })
      }
    }

    aeroRakeGroup.add(singleRake)
  })

  // Start with Aero-Rake hidden unless toggled
  aeroRakeGroup.visible = false
  registerPart('aero_rake_pitot_rig', aeroRakeGroup, 'AERO', new THREE.Vector3(0, 0.2, 0.4))


  // ==========================================
  // 2. POWERTRAIN & HYBRID ENERGY STORE
  // ==========================================
  const iceGroup = new THREE.Group()
  const iceBlock = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.32, 0.46), titaniumMat)
  iceBlock.position.set(0, 0.32, -0.58)
  iceBlock.userData.flirMat = flirEngineHotMat // Engine block is hot on FLIR
  const plenum = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.38, 12), carbonMat)
  plenum.rotation.z = Math.PI / 2
  plenum.position.set(0, 0.51, -0.58)
  plenum.userData.flirMat = flirEngineHotMat
  iceGroup.add(iceBlock, plenum)
  registerPart('ice_16l_v6_turbo', iceGroup, 'POWERTRAIN', new THREE.Vector3(0, 0.6, -0.4))

  // 350 kW MGU-K Generator
  const mgukGroup = new THREE.Group()
  const mgukMotor = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.24, 16), titaniumMat)
  mgukMotor.rotation.x = Math.PI / 2
  mgukMotor.position.set(0, 0.2, -0.34)
  mgukMotor.userData.flirMat = flirEngineHotMat
  const mgukWiring = new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.02, 8, 16), copperMat)
  mgukWiring.position.set(0, 0.2, -0.34)
  mgukWiring.userData.flirMat = flirEngineHotMat
  mgukGroup.add(mgukMotor, mgukWiring)
  registerPart('mguk_350kw_generator', mgukGroup, 'POWERTRAIN', new THREE.Vector3(0, 0.25, -0.1))

  // Turbocharger
  const turboGroup = new THREE.Group()
  const turboCompressor = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.04, 12, 24), titaniumMat)
  turboCompressor.position.set(-0.12, 0.52, -0.85)
  turboCompressor.userData.flirMat = flirEngineHotMat
  const turboTurbine = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.04, 12, 24), goldHeatShieldMat)
  turboTurbine.position.set(0.12, 0.52, -0.85)
  turboTurbine.userData.flirMat = flirBrakeExtremeMat // Turbo turbine reaches 950°C
  const wastegate = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.16, 8), titaniumMat)
  wastegate.position.set(0, 0.6, -0.85)
  wastegate.userData.flirMat = flirEngineHotMat
  turboGroup.add(turboCompressor, turboTurbine, wastegate)
  registerPart('turbocharger_wastegate', turboGroup, 'POWERTRAIN', new THREE.Vector3(0, 0.8, -0.7))

  // Inconel Exhaust
  const exhaustGroup = new THREE.Group()
  const exhaustLeft = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.04, 0.44, 8), goldHeatShieldMat)
  exhaustLeft.position.set(-0.22, 0.38, -0.78)
  exhaustLeft.rotation.x = 0.4
  exhaustLeft.userData.flirMat = flirBrakeExtremeMat
  const exhaustRight = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.04, 0.44, 8), goldHeatShieldMat)
  exhaustRight.position.set(0.22, 0.38, -0.78)
  exhaustRight.rotation.x = 0.4
  exhaustRight.userData.flirMat = flirBrakeExtremeMat
  const tailpipe = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.36, 12), titaniumMat)
  tailpipe.rotation.x = Math.PI / 2
  tailpipe.position.set(0, 0.44, -1.55)
  tailpipe.userData.flirMat = flirBrakeExtremeMat
  exhaustGroup.add(exhaustLeft, exhaustRight, tailpipe)
  registerPart('exhaust_manifold_inconel', exhaustGroup, 'POWERTRAIN', new THREE.Vector3(0, 0.4, -1.1))

  // 800V Energy Store Battery
  const batteryGroup = new THREE.Group()
  const battBox = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.12, 0.65), carbonMat)
  battBox.position.set(0, 0.16, -0.05)
  battBox.userData.flirMat = flirColdBodyMat
  for (let x = -0.2; x <= 0.2; x += 0.1) {
    const cell = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.1, 8), batteryCellMat)
    cell.position.set(x, 0.16, -0.05)
    cell.userData.flirMat = flirEngineHotMat
    batteryGroup.add(cell)
  }
  batteryGroup.add(battBox)
  registerPart('energy_store_800v_battery', batteryGroup, 'POWERTRAIN', new THREE.Vector3(0, -0.4, 0))

  // Dual SiC Inverters
  const inverterGroup = new THREE.Group()
  const inverterBox = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.14, 0.22), titaniumMat)
  inverterBox.position.set(0, 0.35, -0.15)
  inverterBox.userData.flirMat = flirEngineHotMat
  const hvCables = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.04, 0.28), hvConduitGlowMat)
  hvCables.position.set(0, 0.3, -0.26)
  hvCables.name = 'hv_conduit_cables'
  inverterGroup.add(inverterBox, hvCables)
  registerPart('power_electronics_inverter', inverterGroup, 'POWERTRAIN', new THREE.Vector3(0, 0.6, 0.1))

  // Gearbox Casing
  const gearboxGroup = new THREE.Group()
  const gbCase = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.28, 0.44), carbonMat)
  gbCase.position.set(0, 0.28, -1.25)
  gbCase.userData.flirMat = flirColdBodyMat
  gearboxGroup.add(gbCase)
  registerPart('gearbox_8speed_seamless', gearboxGroup, 'POWERTRAIN', new THREE.Vector3(0, 0.3, -1.3))

  // ==========================================
  // 3. CHASSIS, COCKPIT & DRIVER SAFETY
  // ==========================================
  const monoGroup = new THREE.Group()
  const monoMesh = new THREE.Mesh(makePrism(0.18, 0.3, 1.75, 0.55), paintMat)
  monoMesh.position.set(0, 0.3, 0.3)
  monoMesh.userData.cfdMat = cfdNeutralMat
  monoMesh.userData.flirMat = flirColdBodyMat
  monoGroup.add(monoMesh)
  registerPart('monocoque_survival_tub', monoGroup, 'CHASSIS', new THREE.Vector3(0, 0.25, 0.2))

  const haloGroup = new THREE.Group()
  const haloHoop = new THREE.Mesh(new THREE.TorusGeometry(0.29, 0.038, 10, 24, Math.PI * 1.9), titaniumMat)
  haloHoop.rotateX(Math.PI / 2)
  haloHoop.scale.set(1, 1, 1.2)
  haloHoop.position.set(0, 0.58, 0.28)
  haloHoop.userData.cfdMat = cfdNeutralMat
  haloHoop.userData.flirMat = flirColdBodyMat
  const haloPillar = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.045, 0.26, 8), titaniumMat)
  haloPillar.position.set(0, 0.47, 0.58)
  haloPillar.userData.cfdMat = cfdMediumPressureMat
  haloPillar.userData.flirMat = flirColdBodyMat
  haloGroup.add(haloHoop, haloPillar)
  registerPart('halo_safety_titanium', haloGroup, 'CHASSIS', new THREE.Vector3(0, 0.95, 0.3))

  const fisGroup = new THREE.Group()
  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.155, 1.25, 4, 1, false, Math.PI / 4), paintMat)
  nose.rotateX(Math.PI / 2)
  nose.position.set(0, 0.3, 1.55)
  nose.userData.cfdMat = cfdHighPressureMat
  nose.userData.flirMat = flirColdBodyMat
  fisGroup.add(nose)
  registerPart('front_impact_structure_fis', fisGroup, 'CHASSIS', new THREE.Vector3(0, 0.3, 1.3))

  const zylonGroup = new THREE.Group()
  const zylonL = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.26, 1.4), carbonMat)
  zylonL.position.set(-0.35, 0.3, 0.25)
  zylonL.userData.flirMat = flirColdBodyMat
  const zylonR = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.26, 1.4), carbonMat)
  zylonR.position.set(0.35, 0.3, 0.25)
  zylonR.userData.flirMat = flirColdBodyMat
  zylonGroup.add(zylonL, zylonR)
  registerPart('side_intrusion_panels_zylon', zylonGroup, 'CHASSIS', new THREE.Vector3(0, 0.2, 0.2))

  const risGroup = new THREE.Group()
  const risCone = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.16, 0.38), carbonMat)
  risCone.position.set(0, 0.22, -1.92)
  risCone.userData.flirMat = flirColdBodyMat
  const rainLight = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.05), rainLedMat)
  rainLight.position.set(0, 0.26, -2.12)
  risGroup.add(risCone, rainLight)
  registerPart('rear_impact_structure_ris', risGroup, 'CHASSIS', new THREE.Vector3(0, 0.1, -1.9))

  const seatGroup = new THREE.Group()
  const seatMesh = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.38, 0.55), carbonMat)
  seatMesh.position.set(0, 0.32, 0.18)
  seatMesh.userData.flirMat = flirColdBodyMat
  const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.14, 16, 12), secondaryPaintMat)
  helmet.position.set(0, 0.52, 0.18)
  helmet.userData.cfdMat = cfdMediumPressureMat
  helmet.userData.flirMat = flirColdBodyMat
  seatGroup.add(seatMesh, helmet)
  registerPart('cockpit_seat_harness', seatGroup, 'CHASSIS', new THREE.Vector3(0, 0.7, 0.2))

  const wheelUiGroup = new THREE.Group()
  const stWheel = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.15, 0.04), carbonMat)
  stWheel.position.set(0, 0.44, 0.54)
  stWheel.userData.flirMat = flirColdBodyMat
  const oledScreen = new THREE.Mesh(
    new THREE.PlaneGeometry(0.09, 0.05),
    new THREE.MeshBasicMaterial({ color: '#4ce2c2' }),
  )
  oledScreen.position.set(0, 0.45, 0.565)
  wheelUiGroup.add(stWheel, oledScreen)
  registerPart('steering_wheel_oled_controls', wheelUiGroup, 'CHASSIS', new THREE.Vector3(0, 0.8, 0.7))

  // ==========================================
  // 4. SUSPENSION, BRAKES & RUNNING GEAR
  // ==========================================
  const frontSuspGroup = new THREE.Group()
  const fPoints: [number, number][] = [[-1, 1.34], [1, 1.34]]
  for (const [xSign, z] of fPoints) {
    const w1 = makeStrut(new THREE.Vector3(0.2 * xSign, 0.38, z - 0.08), new THREE.Vector3(0.74 * xSign, 0.42, z), 0.018)
    const w2 = makeStrut(new THREE.Vector3(0.2 * xSign, 0.24, z - 0.08), new THREE.Vector3(0.74 * xSign, 0.26, z), 0.018)
    const pushRod = makeStrut(new THREE.Vector3(0.22 * xSign, 0.48, z - 0.15), new THREE.Vector3(0.72 * xSign, 0.25, z), 0.014)
    const m1 = new THREE.Mesh(w1, titaniumMat)
    const m2 = new THREE.Mesh(w2, titaniumMat)
    const m3 = new THREE.Mesh(pushRod, carbonGlossMat)
    m1.userData.flirMat = flirColdBodyMat
    m2.userData.flirMat = flirColdBodyMat
    m3.userData.flirMat = flirColdBodyMat
    frontSuspGroup.add(m1, m2, m3)
  }
  registerPart('front_suspension_wishbones', frontSuspGroup, 'SUSPENSION', new THREE.Vector3(0, 0.3, 1.0))

  const rearSuspGroup = new THREE.Group()
  const rPoints: [number, number][] = [[-1, -1.26], [1, -1.26]]
  for (const [xSign, z] of rPoints) {
    const rw1 = makeStrut(new THREE.Vector3(0.18 * xSign, 0.38, z - 0.1), new THREE.Vector3(0.74 * xSign, 0.42, z), 0.02)
    const rw2 = makeStrut(new THREE.Vector3(0.18 * xSign, 0.24, z - 0.1), new THREE.Vector3(0.74 * xSign, 0.26, z), 0.02)
    const driveShaft = makeStrut(new THREE.Vector3(0.16 * xSign, 0.3, z), new THREE.Vector3(0.74 * xSign, 0.34, z), 0.028)
    const rm1 = new THREE.Mesh(rw1, titaniumMat)
    const rm2 = new THREE.Mesh(rw2, titaniumMat)
    const rm3 = new THREE.Mesh(driveShaft, titaniumMat)
    rm1.userData.flirMat = flirColdBodyMat
    rm2.userData.flirMat = flirColdBodyMat
    rm3.userData.flirMat = flirColdBodyMat
    rearSuspGroup.add(rm1, rm2, rm3)
  }
  registerPart('rear_suspension_multilink', rearSuspGroup, 'SUSPENSION', new THREE.Vector3(0, 0.3, -1.0))

  // 18-Inch BBS Rims with Aero Covers
  const wheelsGroup = new THREE.Group()
  const wheelPositions: [number, number, number, boolean][] = [
    [-0.82, 0.35, 1.34, false],
    [0.82, 0.35, 1.34, false],
    [-0.82, 0.36, -1.26, true],
    [0.82, 0.36, -1.26, true],
  ]

  wheelPositions.forEach(([x, y, z, isRear]) => {
    const hubGroup = new THREE.Group()
    hubGroup.position.set(x, y, z)
    const rimGeom = new THREE.CylinderGeometry(0.228, 0.228, isRear ? 0.375 : 0.28, 20)
    rimGeom.rotateZ(Math.PI / 2)
    const rim = new THREE.Mesh(rimGeom, rimMat)
    rim.userData.flirMat = flirColdBodyMat
    const coverGeom = new THREE.CircleGeometry(0.22, 16)
    coverGeom.rotateY(x > 0 ? Math.PI / 2 : -Math.PI / 2)
    const cover = new THREE.Mesh(coverGeom, carbonGlossMat)
    cover.position.x = x > 0 ? 0.14 : -0.14
    cover.userData.cfdMat = cfdNeutralMat
    cover.userData.flirMat = flirColdBodyMat
    hubGroup.add(rim, cover)
    wheelsGroup.add(hubGroup)
    wheelGroups.push(hubGroup)
  })
  registerPart('bbs_18inch_forged_wheels', wheelsGroup, 'SUSPENSION', new THREE.Vector3(0, 0, 0))

  // 2026 Narrower Pirelli Tyres
  const tyresGroup = new THREE.Group()
  wheelPositions.forEach(([x, y, z, isRear]) => {
    const tireGeom = new THREE.CylinderGeometry(0.352, 0.352, isRear ? 0.375 : 0.28, 24)
    tireGeom.rotateZ(Math.PI / 2)
    const tire = new THREE.Mesh(tireGeom, tireRubberMat)
    tire.position.set(x, y, z)
    tire.userData.cfdMat = cfdMediumPressureMat
    tire.userData.flirMat = flirTireOptimalMat // FLIR warm/optimal tyre tread
    tyresGroup.add(tire)
  })
  registerPart('pirelli_2026_spec_tyres', tyresGroup, 'SUSPENSION', new THREE.Vector3(0, 0, 0))

  // Carbon-Carbon Brake Discs
  const brakesGroup = new THREE.Group()
  wheelPositions.forEach(([x, y, z, isRear]) => {
    const discGeom = new THREE.CylinderGeometry(isRear ? 0.14 : 0.164, isRear ? 0.14 : 0.164, 0.032, 16)
    discGeom.rotateZ(Math.PI / 2)
    const disc = new THREE.Mesh(discGeom, brakeDiscMat)
    disc.position.set(x > 0 ? x - 0.08 : x + 0.08, y, z)
    disc.userData.flirMat = flirBrakeExtremeMat // Glowing white-hot brake disc
    const caliper = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.1, 0.09), titaniumMat)
    caliper.position.set(x > 0 ? x - 0.08 : x + 0.08, y + 0.1, z)
    caliper.userData.flirMat = flirEngineHotMat
    brakesGroup.add(disc, caliper)
  })
  registerPart('carbon_carbon_brake_system', brakesGroup, 'SUSPENSION', new THREE.Vector3(0, 0.1, 0))

  // Rear Electronic BBW Actuator
  const bbwGroup = new THREE.Group()
  const bbwUnit = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.12, 0.14), titaniumMat)
  bbwUnit.position.set(0, 0.24, -1.0)
  bbwUnit.userData.flirMat = flirColdBodyMat
  bbwGroup.add(bbwUnit)
  registerPart('brake_by_wire_bbw_actuator', bbwGroup, 'SUSPENSION', new THREE.Vector3(0, 0.2, -0.8))

  // ==========================================
  // LIVERY & DECAL ENGINE
  // ==========================================
  let currentLiveryConfig: LiveryConfig = {
    primaryColor,
    accentColor: secondaryColor,
    carbonFinish: 'gloss',
    sponsorNose: 'ORACLE',
    sponsorSidepods: 'PIRELLI',
    sponsorSharkFin: 'TAG HEUER',
    sponsorRearWing: 'MOBIL 1',
    driverNumber: 1,
    ...initialLivery,
  }

  let sidepodDecalTex: THREE.CanvasTexture | null = null
  let noseDecalTex: THREE.CanvasTexture | null = null
  let sharkFinDecalTex: THREE.CanvasTexture | null = null
  let rearWingDecalTex: THREE.CanvasTexture | null = null
  let carbonTexture: THREE.CanvasTexture | null = null

  const updateLivery = (config: LiveryConfig) => {
    currentLiveryConfig = { ...config }
    paintMat.color.set(config.primaryColor)
    secondaryPaintMat.color.set(config.accentColor)

    // Update carbon weave finish
    if (carbonTexture) carbonTexture.dispose()
    carbonTexture = createCarbonTexture(config.carbonFinish)
    disposables.push(carbonTexture)

    if (config.carbonFinish === 'gloss') {
      carbonMat.roughness = 0.45
      carbonMat.metalness = 0.35
      carbonGlossMat.roughness = 0.14
      carbonGlossMat.metalness = 0.55
      carbonMat.map = carbonTexture
      carbonGlossMat.map = carbonTexture
    } else if (config.carbonFinish === 'matte') {
      carbonMat.roughness = 0.85
      carbonMat.metalness = 0.08
      carbonGlossMat.roughness = 0.72
      carbonGlossMat.metalness = 0.12
      carbonMat.map = carbonTexture
      carbonGlossMat.map = carbonTexture
    } else if (config.carbonFinish === 'forged') {
      carbonMat.roughness = 0.38
      carbonMat.metalness = 0.45
      carbonGlossMat.roughness = 0.22
      carbonGlossMat.metalness = 0.65
      carbonMat.map = carbonTexture
      carbonGlossMat.map = carbonTexture
    } else {
      // Satin
      carbonMat.roughness = 0.55
      carbonMat.metalness = 0.28
      carbonGlossMat.roughness = 0.32
      carbonGlossMat.metalness = 0.4
      carbonMat.map = carbonTexture
      carbonGlossMat.map = carbonTexture
    }
    carbonMat.needsUpdate = true
    carbonGlossMat.needsUpdate = true

    // Generate custom decal textures
    if (sidepodDecalTex) sidepodDecalTex.dispose()
    if (noseDecalTex) noseDecalTex.dispose()
    if (sharkFinDecalTex) sharkFinDecalTex.dispose()
    if (rearWingDecalTex) rearWingDecalTex.dispose()

    sidepodDecalTex = createSponsorCanvasTexture('sidepod', config)
    noseDecalTex = createSponsorCanvasTexture('nose', config)
    sharkFinDecalTex = createSponsorCanvasTexture('shark_fin', config)
    rearWingDecalTex = createSponsorCanvasTexture('rear_wing', config)
    disposables.push(sidepodDecalTex, noseDecalTex, sharkFinDecalTex, rearWingDecalTex)

    const sidepodDecalMat = new THREE.MeshStandardMaterial({
      map: sidepodDecalTex,
      roughness: 0.28,
      metalness: 0.65,
      side: THREE.DoubleSide,
    })
    const noseDecalMat = new THREE.MeshStandardMaterial({
      map: noseDecalTex,
      roughness: 0.28,
      metalness: 0.65,
      side: THREE.DoubleSide,
    })
    const sharkFinDecalMat = new THREE.MeshStandardMaterial({
      map: sharkFinDecalTex,
      roughness: 0.28,
      metalness: 0.65,
      side: THREE.DoubleSide,
    })
    const rearWingDecalMat = new THREE.MeshStandardMaterial({
      map: rearWingDecalTex,
      roughness: 0.28,
      metalness: 0.65,
      side: THREE.DoubleSide,
    })

    disposables.push(sidepodDecalMat, noseDecalMat, sharkFinDecalMat, rearWingDecalMat)

    spL.material = sidepodDecalMat
    spR.material = sidepodDecalMat
    nose.material = noseDecalMat
    sharkFin.material = sharkFinDecalMat
    rwActiveFlap.material = rearWingDecalMat
    rwEndL.material = rearWingDecalMat
    rwEndR.material = rearWingDecalMat

    spL.userData.originalMaterial = sidepodDecalMat
    spR.userData.originalMaterial = sidepodDecalMat
    nose.userData.originalMaterial = noseDecalMat
    sharkFin.userData.originalMaterial = sharkFinDecalMat
    rwActiveFlap.userData.originalMaterial = rearWingDecalMat
    rwEndL.userData.originalMaterial = rearWingDecalMat
    rwEndR.userData.originalMaterial = rearWingDecalMat
  }

  // Initialize livery materials with decals
  updateLivery(currentLiveryConfig)

  // ==========================================
  // CONTROLLER LOGIC & TRANSFORMS
  // ==========================================
  let targetFlapFront = 0
  let targetFlapRear = 0
  let activeAeroState: 'CORNER' | 'STRAIGHT' = 'CORNER'
  let isCfdHeatmapActive = false

  const updateAeroRakePressures = (speedKmh = 180, frontWingAngle = 32, aeroMode = activeAeroState) => {
    if (!aeroRakeGroup.visible) return

    probeNodes.forEach((node) => {
      const isOutboard = node.isLeft ? node.col > 2 : node.col < 2
      const heightFactor = node.row / 3

      let cp = 0.65
      if (heightFactor > 0.5 && isOutboard) {
        cp = -0.65 - (frontWingAngle / 50) * 0.3
      } else if (!isOutboard && heightFactor < 0.4) {
        cp = 0.85 + (aeroMode === 'STRAIGHT' ? 0.15 : 0.0)
      } else {
        cp = 0.15 + Math.sin(node.row * 1.5 + node.col * 2.1) * 0.25
      }

      const tipMat = node.mesh.material as THREE.MeshStandardMaterial
      if (cp > 0.6) {
        tipMat.color.set('#ff3b30')
        tipMat.emissive.set('#991100')
      } else if (cp >= 0.1) {
        tipMat.color.set('#ffd60a')
        tipMat.emissive.set('#886600')
      } else if (cp >= -0.4) {
        tipMat.color.set('#38bdf8')
        tipMat.emissive.set('#0369a1')
      } else {
        tipMat.color.set('#bf5af2')
        tipMat.emissive.set('#6b21a8')
      }
      tipMat.emissiveIntensity = 1.0 + Math.abs(cp) * 0.8
    })
  }

  const setAeroRakeMode = (enabled: boolean) => {
    aeroRakeGroup.visible = enabled
    if (enabled) {
      updateAeroRakePressures(180, 32, activeAeroState)
    }
  }

  const setAeroMode = (mode: 'CORNER' | 'STRAIGHT') => {
    activeAeroState = mode
    if (mode === 'STRAIGHT') {
      targetFlapFront = 0.25
      targetFlapRear = -0.48
    } else {
      targetFlapFront = 0
      targetFlapRear = 0
    }
    if (isCfdHeatmapActive) {
      setCfdHeatmapMode(true, mode)
    }
    if (aeroRakeGroup.visible) {
      updateAeroRakePressures(180, 32, mode)
    }
  }

  const setExplodedRatio = (ratio: number, targetCategory: 'ALL' | SubsystemCategory = 'ALL') => {
    const clamped = THREE.MathUtils.clamp(ratio, 0, 1)
    componentNodes.forEach((node) => {
      const match = targetCategory === 'ALL' || node.category === targetCategory
      if (match) {
        const offset = node.explodeVector.clone().multiplyScalar(clamped)
        node.mesh.position.copy(node.basePos).add(offset)
      } else {
        node.mesh.position.copy(node.basePos)
      }
    })
  }

  const setSubsystemFilter = (category: 'ALL' | SubsystemCategory) => {
    componentNodes.forEach((node) => {
      const match = category === 'ALL' || node.category === category
      node.mesh.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          if (match) {
            child.visible = true
            if (Array.isArray(child.material)) {
              child.material.forEach((m) => (m.opacity = 1))
            } else {
              child.material.opacity = 1
              child.material.transparent = false
            }
          } else {
            child.visible = true
            if (Array.isArray(child.material)) {
              child.material.forEach((m) => {
                m.transparent = true
                m.opacity = 0.12
              })
            } else {
              child.material.transparent = true
              child.material.opacity = 0.12
            }
          }
        }
      })
    })
  }

  const setWireframeMode = (wireframe: boolean) => {
    disposables.forEach((item) => {
      if (item instanceof THREE.Material) {
        // @ts-expect-error standard material property
        item.wireframe = wireframe
      }
    })
  }

  // Cross-Section CAD Clipping Plane
  const setClippingPlane = (axis: 'NONE' | 'X' | 'Y' | 'Z', offset: number) => {
    let planes: THREE.Plane[] = []
    if (axis === 'X') {
      planes = [new THREE.Plane(new THREE.Vector3(1, 0, 0), -offset)]
    } else if (axis === 'Y') {
      planes = [new THREE.Plane(new THREE.Vector3(0, 1, 0), -offset)]
    } else if (axis === 'Z') {
      planes = [new THREE.Plane(new THREE.Vector3(0, 0, 1), -offset)]
    }

    const allMaterials = [...standardMaterials, ...cfdMaterials, ...flirMaterials]
    allMaterials.forEach((mat) => {
      mat.clippingPlanes = planes
      mat.clipShadows = true
      mat.needsUpdate = true
    })
  }

  // CFD Surface Pressure Heatmap Mode
  const setCfdHeatmapMode = (enabled: boolean, mode: 'CORNER' | 'STRAIGHT' = activeAeroState) => {
    isCfdHeatmapActive = enabled
    componentNodes.forEach((node) => {
      node.mesh.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          if (enabled) {
            let cfdMat: THREE.Material = (child.userData.cfdMat as THREE.Material) || cfdNeutralMat
            if (mode === 'STRAIGHT') {
              if (child.name === 'rw_active_flap' || node.id === 'front_wing_active_flaps') {
                cfdMat = cfdNeutralMat
              } else if (node.id === 'rear_wing_3element_active') {
                cfdMat = cfdLowPressureMat
              }
            }
            child.material = cfdMat
          } else {
            child.material = (child.userData.originalMaterial as THREE.Material) || paintMat
          }
        }
      })
    })
  }

  // FLIR Thermal Infrared Imaging Mode
  const setFlirMode = (enabled: boolean) => {
    isCfdHeatmapActive = false
    componentNodes.forEach((node) => {
      node.mesh.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          if (enabled) {
            const flirMat = (child.userData.flirMat as THREE.Material) || flirColdBodyMat
            child.material = flirMat
          } else {
            child.material = (child.userData.originalMaterial as THREE.Material) || paintMat
          }
        }
      })
    })
  }

  // High-Voltage 350kW MGU-K Energy Flow Conduit Indicator
  const setEnergyFlow = (mode: 'DEPLOY' | 'HARVEST' | 'NEUTRAL', powerKw = 350) => {
    if (mode === 'DEPLOY') {
      hvConduitGlowMat.color.set('#00ff88')
      hvConduitGlowMat.emissive.set('#00ff66')
      hvConduitGlowMat.emissiveIntensity = 1.2 + (powerKw / 350) * 2.2
    } else if (mode === 'HARVEST') {
      hvConduitGlowMat.color.set('#ff9500')
      hvConduitGlowMat.emissive.set('#ff6600')
      hvConduitGlowMat.emissiveIntensity = 1.8
    } else {
      hvConduitGlowMat.color.set('#b87333')
      hvConduitGlowMat.emissive.set('#472200')
      hvConduitGlowMat.emissiveIntensity = 0.2
    }
  }

  // Dynamic Suspension Heave / Aerodynamic Squish
  const setSuspensionCompression = (heaveFrontM: number, heaveRearM: number) => {
    componentNodes.forEach((node) => {
      if (node.category !== 'SUSPENSION' || node.id.includes('suspension_wishbones')) {
        const isFront = node.basePos.z > 0
        const heave = isFront ? heaveFrontM : heaveRearM
        node.mesh.position.y = node.basePos.y - heave
      }
    })
  }

  // Wheel Rotation
  const spinWheels = (radDelta: number) => {
    wheelGroups.forEach((hub) => {
      hub.rotation.x += radDelta
    })
    const tyresMesh = root.getObjectByName('pirelli_2026_spec_tyres') as THREE.Group | undefined
    if (tyresMesh) {
      tyresMesh.children.forEach((child) => {
        child.rotation.x += radDelta
      })
    }
  }

  const update = (deltaSeconds: number) => {
    const rwActiveFlap = root.getObjectByName('rw_active_flap') as THREE.Mesh | undefined
    if (rwActiveFlap) {
      rwActiveFlap.rotation.x = THREE.MathUtils.lerp(rwActiveFlap.rotation.x, 0.24 + targetFlapRear, deltaSeconds * 8)
    }
    const fwFlaps = root.getObjectByName('part_front_wing_active_flaps') as THREE.Group | undefined
    if (fwFlaps) {
      fwFlaps.children.forEach((child) => {
        child.rotation.x = THREE.MathUtils.lerp(child.rotation.x, -0.22 + targetFlapFront, deltaSeconds * 8)
      })
    }
  }

  const dispose = () => {
    disposables.forEach((item) => item.dispose())
  }

  const getPartById = (id: string): CarPartMetadata | undefined => {
    return F1_2026_CAR_PARTS.find((part) => part.id === id)
  }

  return {
    root,
    setAeroMode,
    setExplodedRatio,
    setSubsystemFilter,
    setWireframeMode,
    setClippingPlane,
    setCfdHeatmapMode,
    setFlirMode,
    setEnergyFlow,
    setSuspensionCompression,
    spinWheels,
    setAeroRakeMode,
    updateLivery,
    update,
    dispose,
    partMeshes,
    getPartById,
  }
}

