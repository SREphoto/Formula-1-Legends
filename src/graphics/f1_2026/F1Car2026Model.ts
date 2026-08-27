import * as THREE from 'three'
import { F1_2026_CAR_PARTS, type CarPartMetadata, type SubsystemCategory } from './carPartsData'

export interface F1Car2026Controller {
  root: THREE.Group
  setAeroMode: (mode: 'CORNER' | 'STRAIGHT') => void
  setExplodedRatio: (ratio: number, targetCategory?: 'ALL' | SubsystemCategory) => void
  setSubsystemFilter: (category: 'ALL' | SubsystemCategory) => void
  setWireframeMode: (wireframe: boolean) => void
  setClippingPlane: (axis: 'NONE' | 'X' | 'Y' | 'Z', offset: number) => void
  setCfdHeatmapMode: (enabled: boolean, mode?: 'CORNER' | 'STRAIGHT') => void
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

export function createF1Car2026(primaryColor = '#ff1801', secondaryColor = '#f4f6f8'): F1Car2026Controller {
  const root = new THREE.Group()
  root.name = 'F1_2026_Racecar_Root'

  const disposables: (THREE.BufferGeometry | THREE.Material | THREE.Texture)[] = []
  const componentNodes: ComponentNode[] = []
  const partMeshes = new Map<string, THREE.Mesh | THREE.Group>()
  const standardMaterials: THREE.Material[] = []
  const cfdMaterials: THREE.Material[] = []

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
  )

  // ==========================================
  // 2. CFD SURFACE PRESSURE HEATMAP MATERIALS
  // ==========================================
  // High Pressure Stagnation (+Cp: Red / Orange)
  const cfdHighPressureMat = new THREE.MeshStandardMaterial({
    color: '#ff1b1b',
    emissive: '#7a0505',
    emissiveIntensity: 0.5,
    roughness: 0.3,
    metalness: 0.2,
    side: THREE.DoubleSide,
  })
  // Moderate Positive Pressure (+Cp: Yellow)
  const cfdMediumPressureMat = new THREE.MeshStandardMaterial({
    color: '#ffd60a',
    emissive: '#665200',
    emissiveIntensity: 0.35,
    roughness: 0.3,
    metalness: 0.2,
    side: THREE.DoubleSide,
  })
  // Neutral / Free Stream (Cp ~ 0: Green / Cyan)
  const cfdNeutralMat = new THREE.MeshStandardMaterial({
    color: '#30d158',
    emissive: '#094717',
    emissiveIntensity: 0.3,
    roughness: 0.3,
    metalness: 0.2,
    side: THREE.DoubleSide,
  })
  // Low Pressure / Accelerated Boundary Layer (-Cp: Cyan / Blue)
  const cfdLowPressureMat = new THREE.MeshStandardMaterial({
    color: '#0a84ff',
    emissive: '#002a66',
    emissiveIntensity: 0.4,
    roughness: 0.3,
    metalness: 0.2,
    side: THREE.DoubleSide,
  })
  // Deep Suction / High-Downforce Vortex Core (-Cp: Deep Purple / Indigo)
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

  disposables.push(...standardMaterials, ...cfdMaterials)

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
        // Store original standard material reference
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

  // Front Wing Mainplane & Inwash Endplates (1900mm width)
  const fwGroup = new THREE.Group()
  const fwMain = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.035, 0.48), carbonGlossMat)
  fwMain.position.set(0, 0.12, 1.95)
  fwMain.userData.cfdMat = cfdHighPressureMat // Stagnation leading edge
  fwGroup.add(fwMain)
  // Inwash Endplates
  const fwLplate = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.22, 0.54), paintMat)
  fwLplate.position.set(-0.95, 0.2, 1.95)
  fwLplate.rotation.y = 0.08
  fwLplate.userData.cfdMat = cfdMediumPressureMat
  const fwRplate = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.22, 0.54), paintMat)
  fwRplate.position.set(0.95, 0.2, 1.95)
  fwRplate.rotation.y = -0.08
  fwRplate.userData.cfdMat = cfdMediumPressureMat
  fwGroup.add(fwLplate, fwRplate)
  registerPart('front_wing_mainplane', fwGroup, 'AERO', new THREE.Vector3(0, 0.2, 1.6))

  // Active Front Wing Flaps (Z/X-mode movable)
  const fwActiveGroup = new THREE.Group()
  const fwFlapL = new THREE.Mesh(new THREE.BoxGeometry(0.84, 0.025, 0.24), secondaryPaintMat)
  fwFlapL.position.set(-0.48, 0.21, 1.88)
  fwFlapL.rotation.x = -0.22
  fwFlapL.userData.cfdMat = cfdHighPressureMat
  const fwFlapR = new THREE.Mesh(new THREE.BoxGeometry(0.84, 0.025, 0.24), secondaryPaintMat)
  fwFlapR.position.set(0.48, 0.21, 1.88)
  fwFlapR.rotation.x = -0.22
  fwFlapR.userData.cfdMat = cfdHighPressureMat
  fwActiveGroup.add(fwFlapL, fwFlapR)
  registerPart('front_wing_active_flaps', fwActiveGroup, 'AERO', new THREE.Vector3(0, 0.45, 1.8))

  // Front Wheel Deflectors & Inwash Vanes
  const deflectorGroup = new THREE.Group()
  const defL = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.32, 0.24), carbonMat)
  defL.position.set(-0.76, 0.28, 0.95)
  defL.rotation.y = -0.15
  defL.userData.cfdMat = cfdNeutralMat
  const defR = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.32, 0.24), carbonMat)
  defR.position.set(0.76, 0.28, 0.95)
  defR.rotation.y = 0.15
  defR.userData.cfdMat = cfdNeutralMat
  deflectorGroup.add(defL, defR)
  registerPart('front_wheel_deflectors', deflectorGroup, 'AERO', new THREE.Vector3(0, 0.1, 0.6))

  // Underfloor & Stepped Diffuser (1450mm width)
  const floorGroup = new THREE.Group()
  const floorPlank = new THREE.Mesh(new THREE.BoxGeometry(1.45, 0.045, 3.1), carbonMat)
  floorPlank.position.set(0, 0.09, -0.05)
  floorPlank.userData.cfdMat = cfdSuctionPeakMat // Intense underfloor ground suction
  // Stepped Diffuser
  const diffuserMesh = new THREE.Mesh(new THREE.BoxGeometry(1.22, 0.04, 0.55), carbonGlossMat)
  diffuserMesh.position.set(0, 0.14, -1.72)
  diffuserMesh.rotation.x = 0.24
  diffuserMesh.userData.cfdMat = cfdSuctionPeakMat
  // Titanium skid blocks
  const skidMesh = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.015, 1.8), titaniumMat)
  skidMesh.position.set(0, 0.065, 0.1)
  skidMesh.userData.cfdMat = cfdLowPressureMat
  floorGroup.add(floorPlank, diffuserMesh, skidMesh)
  registerPart('underfloor_diffuser', floorGroup, 'AERO', new THREE.Vector3(0, -0.85, 0))

  // Sidepods with Undercuts & Cooling Louvres
  const sidepodGroup = new THREE.Group()
  const spL = new THREE.Mesh(makePrism(0.24, 0.15, 1.35, 0.58), paintMat)
  spL.position.set(-0.46, 0.29, -0.25)
  spL.userData.cfdMat = cfdLowPressureMat // Undercut accelerated flow
  const spR = new THREE.Mesh(makePrism(0.24, 0.15, 1.35, 0.58), paintMat)
  spR.position.set(0.46, 0.29, -0.25)
  spR.userData.cfdMat = cfdLowPressureMat
  // Radiator Intake Inlets
  const inletL = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.14, 0.08), carbonMat)
  inletL.position.set(-0.46, 0.32, 0.44)
  inletL.userData.cfdMat = cfdHighPressureMat
  const inletR = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.14, 0.08), carbonMat)
  inletR.position.set(0.46, 0.32, 0.44)
  inletR.userData.cfdMat = cfdHighPressureMat
  sidepodGroup.add(spL, spR, inletL, inletR)
  registerPart('sidepods_cooling_louvres', sidepodGroup, 'AERO', new THREE.Vector3(0, 0.35, -0.2))

  // Engine Cover & Shark Fin Stabilizer
  const engineCoverGroup = new THREE.Group()
  const spineMesh = new THREE.Mesh(makePrism(0.24, 0.08, 1.55, 0.55), paintMat)
  spineMesh.position.set(0, 0.52, -0.68)
  spineMesh.userData.cfdMat = cfdNeutralMat
  const sharkFin = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.34, 0.88), secondaryPaintMat)
  sharkFin.position.set(0, 0.74, -1.24)
  sharkFin.userData.cfdMat = cfdNeutralMat
  engineCoverGroup.add(spineMesh, sharkFin)
  registerPart('engine_cover_shark_fin', engineCoverGroup, 'AERO', new THREE.Vector3(0, 0.9, -0.5))

  // 3-Element Active Rear Wing & Actuator Pod (No lower beam wing in 2026)
  const rwGroup = new THREE.Group()
  const rwMain = new THREE.Mesh(new THREE.BoxGeometry(1.08, 0.04, 0.38), carbonGlossMat)
  rwMain.position.set(0, 0.88, -1.95)
  rwMain.userData.cfdMat = cfdSuctionPeakMat
  // Upper Active Movable Flap
  const rwActiveFlap = new THREE.Mesh(new THREE.BoxGeometry(1.04, 0.035, 0.22), secondaryPaintMat)
  rwActiveFlap.position.set(0, 0.99, -1.98)
  rwActiveFlap.rotation.x = 0.24
  rwActiveFlap.name = 'rw_active_flap'
  rwActiveFlap.userData.cfdMat = cfdHighPressureMat
  // Actuator Pod
  const rwActuator = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.18, 8), titaniumMat)
  rwActuator.rotation.x = Math.PI / 2
  rwActuator.position.set(0, 0.94, -1.86)
  rwActuator.userData.cfdMat = cfdNeutralMat
  // 2026 Simplified Endplates & Lateral Safety Lights
  const rwEndL = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.44, 0.58), paintMat)
  rwEndL.position.set(-0.54, 0.86, -1.95)
  rwEndL.userData.cfdMat = cfdLowPressureMat
  const rwEndR = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.44, 0.58), paintMat)
  rwEndR.position.set(0.54, 0.86, -1.95)
  rwEndR.userData.cfdMat = cfdLowPressureMat
  // Endplate vertical LED strips
  const endLedL = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.26, 0.02), rainLedMat)
  endLedL.position.set(-0.56, 0.86, -2.22)
  const endLedR = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.26, 0.02), rainLedMat)
  endLedR.position.set(0.56, 0.86, -2.22)
  rwGroup.add(rwMain, rwActiveFlap, rwActuator, rwEndL, rwEndR, endLedL, endLedR)
  registerPart('rear_wing_3element_active', rwGroup, 'AERO', new THREE.Vector3(0, 0.75, -1.7))

  // ==========================================
  // 2. POWERTRAIN & HYBRID ENERGY STORE
  // ==========================================

  // 1.6L 90° V6 ICE
  const iceGroup = new THREE.Group()
  const iceBlock = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.32, 0.46), titaniumMat)
  iceBlock.position.set(0, 0.32, -0.58)
  const plenum = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.38, 12), carbonMat)
  plenum.rotation.z = Math.PI / 2
  plenum.position.set(0, 0.51, -0.58)
  iceGroup.add(iceBlock, plenum)
  registerPart('ice_16l_v6_turbo', iceGroup, 'POWERTRAIN', new THREE.Vector3(0, 0.6, -0.4))

  // 350 kW MGU-K Generator (Crank-mounted)
  const mgukGroup = new THREE.Group()
  const mgukMotor = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.24, 16), titaniumMat)
  mgukMotor.rotation.x = Math.PI / 2
  mgukMotor.position.set(0, 0.2, -0.34)
  const mgukWiring = new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.02, 8, 16), copperMat)
  mgukWiring.position.set(0, 0.2, -0.34)
  mgukGroup.add(mgukMotor, mgukWiring)
  registerPart('mguk_350kw_generator', mgukGroup, 'POWERTRAIN', new THREE.Vector3(0, 0.25, -0.1))

  // Turbocharger & Wastegate
  const turboGroup = new THREE.Group()
  const turboCompressor = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.04, 12, 24), titaniumMat)
  turboCompressor.position.set(-0.12, 0.52, -0.85)
  const turboTurbine = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.04, 12, 24), goldHeatShieldMat)
  turboTurbine.position.set(0.12, 0.52, -0.85)
  const wastegate = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.16, 8), titaniumMat)
  wastegate.position.set(0, 0.6, -0.85)
  turboGroup.add(turboCompressor, turboTurbine, wastegate)
  registerPart('turbocharger_wastegate', turboGroup, 'POWERTRAIN', new THREE.Vector3(0, 0.8, -0.7))

  // Inconel 718 Exhaust Manifold & Tailpipe
  const exhaustGroup = new THREE.Group()
  const exhaustLeft = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.04, 0.44, 8), goldHeatShieldMat)
  exhaustLeft.position.set(-0.22, 0.38, -0.78)
  exhaustLeft.rotation.x = 0.4
  const exhaustRight = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.04, 0.44, 8), goldHeatShieldMat)
  exhaustRight.position.set(0.22, 0.38, -0.78)
  exhaustRight.rotation.x = 0.4
  const tailpipe = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.36, 12), titaniumMat)
  tailpipe.rotation.x = Math.PI / 2
  tailpipe.position.set(0, 0.44, -1.55)
  exhaustGroup.add(exhaustLeft, exhaustRight, tailpipe)
  registerPart('exhaust_manifold_inconel', exhaustGroup, 'POWERTRAIN', new THREE.Vector3(0, 0.4, -1.1))

  // 800V Lithium-NMC Energy Store Battery
  const batteryGroup = new THREE.Group()
  const battBox = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.12, 0.65), carbonMat)
  battBox.position.set(0, 0.16, -0.05)
  for (let x = -0.2; x <= 0.2; x += 0.1) {
    const cell = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.1, 8), batteryCellMat)
    cell.position.set(x, 0.16, -0.05)
    batteryGroup.add(cell)
  }
  batteryGroup.add(battBox)
  registerPart('energy_store_800v_battery', batteryGroup, 'POWERTRAIN', new THREE.Vector3(0, -0.4, 0))

  // Dual SiC Power Electronics Inverter
  const inverterGroup = new THREE.Group()
  const inverterBox = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.14, 0.22), titaniumMat)
  inverterBox.position.set(0, 0.35, -0.15)
  const hvCables = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.04, 0.28), copperMat)
  hvCables.position.set(0, 0.3, -0.26)
  inverterGroup.add(inverterBox, hvCables)
  registerPart('power_electronics_inverter', inverterGroup, 'POWERTRAIN', new THREE.Vector3(0, 0.6, 0.1))

  // 8-Speed Seamless Sequential Carbon Gearbox
  const gearboxGroup = new THREE.Group()
  const gbCase = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.28, 0.44), carbonMat)
  gbCase.position.set(0, 0.28, -1.25)
  gearboxGroup.add(gbCase)
  registerPart('gearbox_8speed_seamless', gearboxGroup, 'POWERTRAIN', new THREE.Vector3(0, 0.3, -1.3))

  // ==========================================
  // 3. CHASSIS, COCKPIT & DRIVER SAFETY
  // ==========================================

  // Carbon Monocoque Survival Tub
  const monoGroup = new THREE.Group()
  const monoMesh = new THREE.Mesh(makePrism(0.18, 0.3, 1.75, 0.55), paintMat)
  monoMesh.position.set(0, 0.3, 0.3)
  monoMesh.userData.cfdMat = cfdNeutralMat
  monoGroup.add(monoMesh)
  registerPart('monocoque_survival_tub', monoGroup, 'CHASSIS', new THREE.Vector3(0, 0.25, 0.2))

  // Titanium Halo & Fairing
  const haloGroup = new THREE.Group()
  const haloHoop = new THREE.Mesh(new THREE.TorusGeometry(0.29, 0.038, 10, 24, Math.PI * 1.9), titaniumMat)
  haloHoop.rotateX(Math.PI / 2)
  haloHoop.scale.set(1, 1, 1.2)
  haloHoop.position.set(0, 0.58, 0.28)
  haloHoop.userData.cfdMat = cfdNeutralMat
  const haloPillar = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.045, 0.26, 8), titaniumMat)
  haloPillar.position.set(0, 0.47, 0.58)
  haloPillar.userData.cfdMat = cfdMediumPressureMat
  haloGroup.add(haloHoop, haloPillar)
  registerPart('halo_safety_titanium', haloGroup, 'CHASSIS', new THREE.Vector3(0, 0.95, 0.3))

  // Two-Stage Front Impact Structure (FIS) & Nose Cone
  const fisGroup = new THREE.Group()
  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.155, 1.25, 4, 1, false, Math.PI / 4), paintMat)
  nose.rotateX(Math.PI / 2)
  nose.position.set(0, 0.3, 1.55)
  nose.userData.cfdMat = cfdHighPressureMat // Nose stagnation zone
  fisGroup.add(nose)
  registerPart('front_impact_structure_fis', fisGroup, 'CHASSIS', new THREE.Vector3(0, 0.3, 1.3))

  // Side Intrusion Panels (Zylon)
  const zylonGroup = new THREE.Group()
  const zylonL = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.26, 1.4), carbonMat)
  zylonL.position.set(-0.35, 0.3, 0.25)
  const zylonR = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.26, 1.4), carbonMat)
  zylonR.position.set(0.35, 0.3, 0.25)
  zylonGroup.add(zylonL, zylonR)
  registerPart('side_intrusion_panels_zylon', zylonGroup, 'CHASSIS', new THREE.Vector3(0, 0.2, 0.2))

  // Rear Impact Structure (RIS) & Rain LEDs
  const risGroup = new THREE.Group()
  const risCone = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.16, 0.38), carbonMat)
  risCone.position.set(0, 0.22, -1.92)
  const rainLight = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.05), rainLedMat)
  rainLight.position.set(0, 0.26, -2.12)
  risGroup.add(risCone, rainLight)
  registerPart('rear_impact_structure_ris', risGroup, 'CHASSIS', new THREE.Vector3(0, 0.1, -1.9))

  // Cockpit Seat & Harness
  const seatGroup = new THREE.Group()
  const seatMesh = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.38, 0.55), carbonMat)
  seatMesh.position.set(0, 0.32, 0.18)
  const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.14, 16, 12), secondaryPaintMat)
  helmet.position.set(0, 0.52, 0.18)
  helmet.userData.cfdMat = cfdMediumPressureMat
  seatGroup.add(seatMesh, helmet)
  registerPart('cockpit_seat_harness', seatGroup, 'CHASSIS', new THREE.Vector3(0, 0.7, 0.2))

  // 2026 Carbon Steering Wheel with OLED
  const wheelUiGroup = new THREE.Group()
  const stWheel = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.15, 0.04), carbonMat)
  stWheel.position.set(0, 0.44, 0.54)
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

  // Front Suspension Wishbones
  const frontSuspGroup = new THREE.Group()
  const fPoints: [number, number][] = [[-1, 1.34], [1, 1.34]]
  for (const [xSign, z] of fPoints) {
    const w1 = makeStrut(new THREE.Vector3(0.2 * xSign, 0.38, z - 0.08), new THREE.Vector3(0.74 * xSign, 0.42, z), 0.018)
    const w2 = makeStrut(new THREE.Vector3(0.2 * xSign, 0.24, z - 0.08), new THREE.Vector3(0.74 * xSign, 0.26, z), 0.018)
    const pushRod = makeStrut(new THREE.Vector3(0.22 * xSign, 0.48, z - 0.15), new THREE.Vector3(0.72 * xSign, 0.25, z), 0.014)
    frontSuspGroup.add(
      new THREE.Mesh(w1, titaniumMat),
      new THREE.Mesh(w2, titaniumMat),
      new THREE.Mesh(pushRod, carbonGlossMat),
    )
  }
  registerPart('front_suspension_wishbones', frontSuspGroup, 'SUSPENSION', new THREE.Vector3(0, 0.3, 1.0))

  // Rear Multi-Link Suspension
  const rearSuspGroup = new THREE.Group()
  const rPoints: [number, number][] = [[-1, -1.26], [1, -1.26]]
  for (const [xSign, z] of rPoints) {
    const rw1 = makeStrut(new THREE.Vector3(0.18 * xSign, 0.38, z - 0.1), new THREE.Vector3(0.74 * xSign, 0.42, z), 0.02)
    const rw2 = makeStrut(new THREE.Vector3(0.18 * xSign, 0.24, z - 0.1), new THREE.Vector3(0.74 * xSign, 0.26, z), 0.02)
    const driveShaft = makeStrut(new THREE.Vector3(0.16 * xSign, 0.3, z), new THREE.Vector3(0.74 * xSign, 0.34, z), 0.028)
    rearSuspGroup.add(
      new THREE.Mesh(rw1, titaniumMat),
      new THREE.Mesh(rw2, titaniumMat),
      new THREE.Mesh(driveShaft, titaniumMat),
    )
  }
  registerPart('rear_suspension_multilink', rearSuspGroup, 'SUSPENSION', new THREE.Vector3(0, 0.3, -1.0))

  // 18-Inch BBS Rims & 2026 Aero Covers
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
    const coverGeom = new THREE.CircleGeometry(0.22, 16)
    coverGeom.rotateY(x > 0 ? Math.PI / 2 : -Math.PI / 2)
    const cover = new THREE.Mesh(coverGeom, carbonGlossMat)
    cover.position.x = x > 0 ? 0.14 : -0.14
    cover.userData.cfdMat = cfdNeutralMat
    hubGroup.add(rim, cover)
    wheelsGroup.add(hubGroup)
  })
  registerPart('bbs_18inch_forged_wheels', wheelsGroup, 'SUSPENSION', new THREE.Vector3(0, 0, 0))

  // 2026 Specification Pirelli Tyres (280mm front / 375mm rear)
  const tyresGroup = new THREE.Group()
  wheelPositions.forEach(([x, y, z, isRear]) => {
    const tireGeom = new THREE.CylinderGeometry(0.352, 0.352, isRear ? 0.375 : 0.28, 24)
    tireGeom.rotateZ(Math.PI / 2)
    const tire = new THREE.Mesh(tireGeom, tireRubberMat)
    tire.position.set(x, y, z)
    tire.userData.cfdMat = cfdMediumPressureMat
    tyresGroup.add(tire)
  })
  registerPart('pirelli_2026_spec_tyres', tyresGroup, 'SUSPENSION', new THREE.Vector3(0, 0, 0))

  // Carbon-Carbon Brake Discs & Calipers
  const brakesGroup = new THREE.Group()
  wheelPositions.forEach(([x, y, z, isRear]) => {
    const discGeom = new THREE.CylinderGeometry(isRear ? 0.14 : 0.164, isRear ? 0.14 : 0.164, 0.032, 16)
    discGeom.rotateZ(Math.PI / 2)
    const disc = new THREE.Mesh(discGeom, brakeDiscMat)
    disc.position.set(x > 0 ? x - 0.08 : x + 0.08, y, z)
    const caliper = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.1, 0.09), titaniumMat)
    caliper.position.set(x > 0 ? x - 0.08 : x + 0.08, y + 0.1, z)
    brakesGroup.add(disc, caliper)
  })
  registerPart('carbon_carbon_brake_system', brakesGroup, 'SUSPENSION', new THREE.Vector3(0, 0.1, 0))

  // Rear Electronic Brake-by-Wire (BBW) Actuator
  const bbwGroup = new THREE.Group()
  const bbwUnit = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.12, 0.14), titaniumMat)
  bbwUnit.position.set(0, 0.24, -1.0)
  bbwGroup.add(bbwUnit)
  registerPart('brake_by_wire_bbw_actuator', bbwGroup, 'SUSPENSION', new THREE.Vector3(0, 0.2, -0.8))

  // ==========================================
  // CONTROLLER LOGIC & TRANSFORMS
  // ==========================================
  let targetFlapFront = 0
  let targetFlapRear = 0
  let activeAeroState: 'CORNER' | 'STRAIGHT' = 'CORNER'
  let isCfdHeatmapActive = false

  const setAeroMode = (mode: 'CORNER' | 'STRAIGHT') => {
    activeAeroState = mode
    if (mode === 'STRAIGHT') {
      targetFlapFront = 0.25 // Rotate down (low alpha)
      targetFlapRear = -0.48 // Rotate open (low drag)
    } else {
      targetFlapFront = 0 // Closed (high downforce)
      targetFlapRear = 0
    }
    if (isCfdHeatmapActive) {
      setCfdHeatmapMode(true, mode)
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
        // Keep non-targeted assemblies in base assembled positions
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

    const allMaterials = [...standardMaterials, ...cfdMaterials]
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
            // Apply CFD pressure distribution
            let cfdMat: THREE.Material = (child.userData.cfdMat as THREE.Material) || cfdNeutralMat
            // In Straight Mode, shed high-drag rear wing pressure to neutral green/cyan
            if (mode === 'STRAIGHT') {
              if (child.name === 'rw_active_flap' || node.id === 'front_wing_active_flaps') {
                cfdMat = cfdNeutralMat
              } else if (node.id === 'rear_wing_3element_active') {
                cfdMat = cfdLowPressureMat
              }
            }
            child.material = cfdMat
          } else {
            // Restore original standard livery/carbon material
            child.material = (child.userData.originalMaterial as THREE.Material) || paintMat
          }
        }
      })
    })
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
    update,
    dispose,
    partMeshes,
    getPartById,
  }
}
