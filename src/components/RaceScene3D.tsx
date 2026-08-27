import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import type { CameraMode, DriverState } from '../types'
import { createF1Car, disposeF1Car } from '../graphics/createF1Car'
import { createPitCrew, disposePitCrew, type PitCrewRig } from '../graphics/createPitCrew'

interface RaceScene3DProps {
  drivers: DriverState[]
  selectedDriverId: string
  cameraMode: CameraMode
  onSelectDriver: (driverId: string) => void
  rainfall?: number
  showDopplerRadar?: boolean
  showGhostCar?: boolean
}

/**
 * Authentic Silverstone Grand Prix Circuit (18 Turns)
 * Accurate real-world track coordinate spline
 */
const TRACK_POINTS = [
  // Hamilton Straight (Start / Finish)
  new THREE.Vector3(-18, 0, 18),
  new THREE.Vector3(-8, 0, 18),
  new THREE.Vector3(2, 0, 18),
  // Turn 1 (Abbey) & Turn 2 (Farm Curve)
  new THREE.Vector3(12, 0, 15),
  new THREE.Vector3(18, 0, 9),
  // Turn 3 (Village) & Turn 4 (The Loop) & Turn 5 (Aintree) - Arena Complex
  new THREE.Vector3(22, 0, 3),
  new THREE.Vector3(24, 0, -3),
  new THREE.Vector3(21, 0, -8),
  new THREE.Vector3(15, 0, -10),
  new THREE.Vector3(11, 0, -5),
  new THREE.Vector3(9, 0, 1),
  // Wellington Straight (DRS Zone 1)
  new THREE.Vector3(3, 0, 7),
  new THREE.Vector3(-6, 0, 12),
  new THREE.Vector3(-16, 0, 14),
  // Turn 6 (Brooklands) & Turn 7 (Luffield) & Turn 8 (Woodcote)
  new THREE.Vector3(-24, 0, 11),
  new THREE.Vector3(-28, 0, 4),
  new THREE.Vector3(-31, 0, -4),
  new THREE.Vector3(-29, 0, -12),
  new THREE.Vector3(-23, 0, -16),
  // National Pits Straight (old start)
  new THREE.Vector3(-14, 0, -16),
  new THREE.Vector3(-5, 0, -16),
  // Turn 9 (Copse Corner - Fast 285 km/h right)
  new THREE.Vector3(3, 0, -18),
  new THREE.Vector3(10, 0, -22),
  new THREE.Vector3(16, 0, -25),
  // Turns 10-13 (Maggotts & Becketts) & Turn 14 (Chapel)
  new THREE.Vector3(23, 0, -26),
  new THREE.Vector3(28, 0, -23),
  new THREE.Vector3(33, 0, -18),
  new THREE.Vector3(35, 0, -12),
  new THREE.Vector3(33, 0, -6),
  // Hangar Straight (DRS Zone 2 - Top speed 325 km/h)
  new THREE.Vector3(28, 0, 3),
  new THREE.Vector3(21, 0, 14),
  new THREE.Vector3(14, 0, 24),
  // Turn 15 (Stowe Corner)
  new THREE.Vector3(6, 0, 31),
  new THREE.Vector3(-4, 0, 34),
  new THREE.Vector3(-14, 0, 32),
  // Turns 16-17 (Vale Chicane) & Turn 18 (Club Corner)
  new THREE.Vector3(-22, 0, 29),
  new THREE.Vector3(-26, 0, 24),
  new THREE.Vector3(-27, 0, 19),
]

/**
 * Authentic Silverstone Pit Lane (Runs south of Hamilton Straight)
 */
const PIT_LANE_POINTS = [
  new THREE.Vector3(-25, 0, 18.2),
  new THREE.Vector3(-22, 0, 22.2),
  new THREE.Vector3(-14, 0, 22.5),
  new THREE.Vector3(-4, 0, 22.5),
  new THREE.Vector3(4, 0, 21.0),
  new THREE.Vector3(8, 0, 17.5),
]

/**
 * Creates a watertight, cleanly indexed ribbon mesh along a 3D spline.
 */
function createRibbon(curve: THREE.CatmullRomCurve3, width: number, y: number, centerOffset = 0, segments = 400) {
  const positions: number[] = []
  const normals: number[] = []
  const uvs: number[] = []
  const indices: number[] = []
  const up = new THREE.Vector3(0, 1, 0)

  for (let index = 0; index <= segments; index += 1) {
    const t = index / segments
    const point = curve.getPointAt(t)
    const tangent = curve.getTangentAt(t).normalize()
    const side = new THREE.Vector3().crossVectors(up, tangent).normalize()
    const offset = side.clone().multiplyScalar(centerOffset)
    const edge = side.clone().multiplyScalar(width / 2)
    const left = point.clone().add(offset).add(edge)
    const right = point.clone().add(offset).sub(edge)

    positions.push(left.x, y, left.z, right.x, y, right.z)
    normals.push(0, 1, 0, 0, 1, 0)
    uvs.push(t * 38, 0, t * 38, 1)

    if (index < segments) {
      const base = index * 2
      indices.push(base, base + 2, base + 1)
      indices.push(base + 1, base + 2, base + 3)
    }
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3))
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
  geometry.setIndex(indices)
  return geometry
}

function canvasTexture(width: number, height: number, draw: (context: CanvasRenderingContext2D) => void) {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  draw(canvas.getContext('2d')!)
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

function grassTexture() {
  const texture = canvasTexture(256, 256, (context) => {
    context.fillStyle = '#2f6d3a'
    context.fillRect(0, 0, 256, 256)
    context.fillStyle = '#2b6335'
    for (let index = 0; index < 256; index += 32) context.fillRect(0, index, 256, 16)
    context.fillStyle = '#367c43'
    for (let index = 0; index < 256; index += 64) context.fillRect(index, 0, 32, 256)
  })
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(32, 32)
  return texture
}

function curbTexture() {
  const texture = canvasTexture(256, 32, (context) => {
    for (let index = 0; index < 8; index += 1) {
      context.fillStyle = index % 2 === 0 ? '#ffffff' : '#e10600'
      context.fillRect(index * 32, 0, 32, 32)
    }
  })
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.ClampToEdgeWrapping
  return texture
}

function checkerTexture() {
  return canvasTexture(288, 32, (context) => {
    for (let column = 0; column < 18; column += 1) {
      for (let row = 0; row < 2; row += 1) {
        context.fillStyle = (column + row) % 2 === 0 ? '#ffffff' : '#11151c'
        context.fillRect(column * 16, row * 16, 16, 16)
      }
    }
  })
}

function addScenery(scene: THREE.Scene) {
  const materials: THREE.Material[] = []
  const textures: THREE.Texture[] = []
  const geometries: THREE.BufferGeometry[] = []

  // Grandstand 1: Hamilton Straight Infield (facing South towards starting grid)
  const stand1Geo = new THREE.BoxGeometry(26, 6, 6)
  const standMat = new THREE.MeshStandardMaterial({ color: '#252d38', roughness: 0.85 })
  const stand1 = new THREE.Mesh(stand1Geo, standMat)
  stand1.position.set(-10, 3, 10.5)
  stand1.castShadow = true
  stand1.receiveShadow = true
  scene.add(stand1)

  // Grandstand 2: Becketts Stadium Complex (elevated outside)
  const stand2Geo = new THREE.BoxGeometry(24, 7, 7)
  const stand2 = new THREE.Mesh(stand2Geo, standMat)
  stand2.position.set(41, 3.5, -16)
  stand2.rotation.y = -0.7
  stand2.castShadow = true
  stand2.receiveShadow = true
  scene.add(stand2)

  // Grandstand 3: Stowe Outside Runoff
  const stand3Geo = new THREE.BoxGeometry(22, 6.5, 6)
  const stand3 = new THREE.Mesh(stand3Geo, standMat)
  stand3.position.set(-2, 3.25, 42)
  stand3.rotation.y = 0.15
  stand3.castShadow = true
  stand3.receiveShadow = true
  scene.add(stand3)

  // Grandstand 4: Luffield Stadium Infield
  const stand4Geo = new THREE.BoxGeometry(20, 6, 6)
  const stand4 = new THREE.Mesh(stand4Geo, standMat)
  stand4.position.set(-37, 3, -6)
  stand4.rotation.y = 1.4
  stand4.castShadow = true
  stand4.receiveShadow = true
  scene.add(stand4)

  // Start/Finish Overhead Gantry with FIA Starting Lights
  const gantryPillarGeo = new THREE.BoxGeometry(0.6, 6.5, 0.6)
  const gantryBeamGeo = new THREE.BoxGeometry(16, 0.8, 1.2)
  const gantryMat = new THREE.MeshStandardMaterial({ color: '#1e242d', metalness: 0.6, roughness: 0.4 })
  const gantryLeft = new THREE.Mesh(gantryPillarGeo, gantryMat)
  gantryLeft.position.set(-18, 3.25, 11.5)
  const gantryRight = new THREE.Mesh(gantryPillarGeo, gantryMat)
  gantryRight.position.set(-18, 3.25, 24.5)
  const gantryBeam = new THREE.Mesh(gantryBeamGeo, gantryMat)
  gantryBeam.position.set(-18, 6.2, 18)
  gantryBeam.rotation.y = Math.PI / 2
  scene.add(gantryLeft, gantryRight, gantryBeam)

  // 5 FIA Start Light Pods
  const lightGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.2, 12)
  const redLightMat = new THREE.MeshBasicMaterial({ color: '#ff1e00' })
  const greenLightMat = new THREE.MeshBasicMaterial({ color: '#00e676' })
  for (let i = -2; i <= 2; i += 1) {
    const light = new THREE.Mesh(lightGeo, redLightMat)
    light.rotation.x = Math.PI / 2
    light.position.set(-18, 5.7, 18 + i * 1.6)
    scene.add(light)
  }

  materials.push(standMat, gantryMat, redLightMat, greenLightMat)
  geometries.push(stand1Geo, stand2Geo, stand3Geo, stand4Geo, gantryPillarGeo, gantryBeamGeo, lightGeo)

  // Trackside Tire Safety Barriers (Runoff zones)
  const tireBarrierGeo = new THREE.BoxGeometry(1.2, 1.1, 14)
  const tireBarrierMat = new THREE.MeshStandardMaterial({ color: '#16191f', roughness: 0.85 })
  const barrierPositions: [number, number, number][] = [
    [43, -12, 0.45], // Becketts runoff
    [-1, 40, -0.6],  // Stowe runoff
    [-35, -4, 1.2],  // Luffield runoff
    [32, 28, -0.8],  // Abbey runoff
  ]
  barrierPositions.forEach(([bx, bz, rotY]) => {
    const barrier = new THREE.Mesh(tireBarrierGeo, tireBarrierMat)
    barrier.position.set(bx, 0.55, bz)
    barrier.rotation.y = rotY
    barrier.castShadow = true
    barrier.receiveShadow = true
    scene.add(barrier)
  })

  // Brake Distance Marker Boards (150m / 100m / 50m approaching heavy braking)
  const boardGeo = new THREE.BoxGeometry(0.1, 1.4, 0.9)
  const boardMat = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.4 })
  const boardStandGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.2, 6)
  const boardStandMat = new THREE.MeshStandardMaterial({ color: '#2b323c' })

  const brakeBoards: [number, number, number][] = [
    [2, 38, -0.6],  // Stowe 150m
    [0, 36, -0.6],  // Stowe 100m
    [-2, 34, -0.6], // Stowe 50m
    [-22, 24, 0],   // Village 100m
    [-25, 24, 0],   // Village 50m
  ]
  brakeBoards.forEach(([px, pz, rotY]) => {
    const boardGroup = new THREE.Group()
    const board = new THREE.Mesh(boardGeo, boardMat)
    board.position.y = 1.1
    const stand = new THREE.Mesh(boardStandGeo, boardStandMat)
    stand.position.y = 0.6
    boardGroup.add(board, stand)
    boardGroup.position.set(px, 0, pz)
    boardGroup.rotation.y = rotY
    boardGroup.castShadow = true
    scene.add(boardGroup)
  })

  materials.push(tireBarrierMat, boardMat, boardStandMat)
  geometries.push(tireBarrierGeo, boardGeo, boardStandGeo)

  // Verified safe tree placements (strictly outside circuit envelope)
  const trunkGeo = new THREE.CylinderGeometry(0.2, 0.35, 2.8, 6)
  const foliageGeo = new THREE.ConeGeometry(1.8, 4.5, 6)
  const trunkMat = new THREE.MeshStandardMaterial({ color: '#453526', roughness: 0.9 })
  const foliageMat = new THREE.MeshStandardMaterial({ color: '#1f5f2e', roughness: 0.8 })
  materials.push(trunkMat, foliageMat)
  geometries.push(trunkGeo, foliageGeo)

  const safeTreePositions = [
    [-42, 20], [-44, 0], [-42, -22], [-22, -32], [0, -32], [24, -36],
    [46, -26], [48, 8], [38, 26], [22, 38], [-18, 45], [-35, 38],
    [5, -2], [8, -7], [-5, 0],
  ]

  safeTreePositions.forEach(([x, z]) => {
    const tree = new THREE.Group()
    const trunk = new THREE.Mesh(trunkGeo, trunkMat)
    trunk.position.y = 1.4
    const foliage = new THREE.Mesh(foliageGeo, foliageMat)
    foliage.position.y = 4.2
    tree.add(trunk, foliage)
    tree.position.set(x, 0, z)
    tree.castShadow = true
    scene.add(tree)
  })

  return { materials, textures, geometries }
}

export function RaceScene3D({
  drivers,
  selectedDriverId,
  cameraMode,
  onSelectDriver,
  rainfall = 0,
  showDopplerRadar = false,
  showGhostCar = true,
}: RaceScene3DProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [webglFailed, setWebglFailed] = useState(false)
  const driversRef = useRef(drivers)
  const selectedRef = useRef(selectedDriverId)
  const cameraModeRef = useRef<CameraMode>(cameraMode)
  const selectRef = useRef(onSelectDriver)
  const rainfallRef = useRef(rainfall)
  const showRadarRef = useRef(showDopplerRadar)
  const showGhostRef = useRef(showGhostCar)

  useEffect(() => {
    driversRef.current = drivers
  }, [drivers])

  useEffect(() => {
    selectedRef.current = selectedDriverId
  }, [selectedDriverId])

  useEffect(() => {
    cameraModeRef.current = cameraMode
  }, [cameraMode])

  useEffect(() => {
    selectRef.current = onSelectDriver
  }, [onSelectDriver])

  useEffect(() => {
    rainfallRef.current = rainfall
  }, [rainfall])

  useEffect(() => {
    showRadarRef.current = showDopplerRadar
  }, [showDopplerRadar])

  useEffect(() => {
    showGhostRef.current = showGhostCar
  }, [showGhostCar])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' })
    } catch {
      setWebglFailed(true)
      return
    }

    const initW = container.clientWidth || 800
    const initH = container.clientHeight || 500

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75))
    renderer.setSize(initW, initH)
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.12
    renderer.shadowMap.enabled = window.innerWidth > 760
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.domElement.className = 'race-3d-canvas'
    renderer.domElement.style.touchAction = 'none'
    container.appendChild(renderer.domElement)

    // Broadcast daylight atmosphere
    const scene = new THREE.Scene()
    scene.background = new THREE.Color('#94bcdb')
    scene.fog = new THREE.FogExp2('#a8cbfa', 0.0025)

    const camera = new THREE.PerspectiveCamera(46, initW / Math.max(1, initH), 0.1, 360)
    camera.position.set(0, 48, 66)

    const hemisphere = new THREE.HemisphereLight('#f0f7ff', '#3d6c44', 1.15)
    scene.add(hemisphere)

    const sun = new THREE.DirectionalLight('#fff9f0', 2.8)
    sun.position.set(-34, 60, 26)
    sun.castShadow = true
    sun.shadow.mapSize.set(1024, 1024)
    sun.shadow.camera.left = -80
    sun.shadow.camera.right = 80
    sun.shadow.camera.top = 80
    sun.shadow.camera.bottom = -80
    sun.shadow.bias = 0.0008
    sun.shadow.normalBias = 0.02
    scene.add(sun)

    const rimLight = new THREE.DirectionalLight('#d6e8ff', 0.65)
    rimLight.position.set(40, 22, -40)
    scene.add(rimLight)

    // Ground infield
    const grassMap = grassTexture()
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(280, 240),
      new THREE.MeshStandardMaterial({ map: grassMap, roughness: 1, metalness: 0 }),
    )
    ground.rotation.x = -Math.PI / 2
    ground.position.y = -0.3
    ground.receiveShadow = true
    scene.add(ground)

    // Main circuit spline & ribbons (Silverstone Grand Prix Circuit)
    const curve = new THREE.CatmullRomCurve3(TRACK_POINTS, true, 'centripetal', 0.35)
    const runoffGeometry = createRibbon(curve, 14.8, -0.02)
    const curbGeometry = createRibbon(curve, 12.4, 0.02)
    const roadGeometry = createRibbon(curve, 9.6, 0.06)
    const leftLineGeometry = createRibbon(curve, 0.22, 0.085, -4.4)
    const rightLineGeometry = createRibbon(curve, 0.22, 0.085, 4.4)
    const rubberGeometry = createRibbon(curve, 3.8, 0.09)

    const runoffMaterial = new THREE.MeshStandardMaterial({ color: '#88939e', roughness: 0.95, side: THREE.DoubleSide })
    const curbMap = curbTexture()
    curbMap.repeat.set(12, 1)
    const curbMaterial = new THREE.MeshStandardMaterial({ map: curbMap, roughness: 0.7, side: THREE.DoubleSide })
    const roadMaterial = new THREE.MeshStandardMaterial({ color: '#444b54', roughness: 0.92, side: THREE.DoubleSide })
    const lineMaterial = new THREE.MeshBasicMaterial({ color: '#f5f7fa', side: THREE.DoubleSide })
    const rubberMaterial = new THREE.MeshStandardMaterial({ color: '#2b3138', roughness: 1, side: THREE.DoubleSide })

    const runoff = new THREE.Mesh(runoffGeometry, runoffMaterial)
    runoff.receiveShadow = true
    const curbs = new THREE.Mesh(curbGeometry, curbMaterial)
    const road = new THREE.Mesh(roadGeometry, roadMaterial)
    road.receiveShadow = true
    const leftLine = new THREE.Mesh(leftLineGeometry, lineMaterial)
    const rightLine = new THREE.Mesh(rightLineGeometry, lineMaterial)
    const rubber = new THREE.Mesh(rubberGeometry, rubberMaterial)
    scene.add(runoff, curbs, road, leftLine, rightLine, rubber)

    // Checkered start/finish line
    const startPoint = curve.getPointAt(0)
    const startTangent = curve.getTangentAt(0)
    const startMap = checkerTexture()
    const startLine = new THREE.Mesh(
      new THREE.PlaneGeometry(9.4, 1.1),
      new THREE.MeshBasicMaterial({ map: startMap }),
    )
    startLine.rotation.x = -Math.PI / 2
    startLine.rotation.z = -Math.atan2(startTangent.z, startTangent.x)
    startLine.position.set(startPoint.x, 0.11, startPoint.z)
    scene.add(startLine)

    // --- Pit Lane & Silverstone Wing Architecture ---
    const pitCurve = new THREE.CatmullRomCurve3(PIT_LANE_POINTS, false, 'centripetal', 0.4)
    const pitRoadGeometry = createRibbon(pitCurve, 4.8, 0.065, 0, 100)
    const pitLineGeo = createRibbon(pitCurve, 0.18, 0.088, -2.2, 100)
    const pitSpeedLimitGeo = createRibbon(pitCurve, 0.18, 0.088, 2.2, 100)
    const pitRoadMat = new THREE.MeshStandardMaterial({ color: '#383e47', roughness: 0.94, side: THREE.DoubleSide })
    const pitLineMat = new THREE.MeshBasicMaterial({ color: '#ffcc00', side: THREE.DoubleSide })

    const pitRoad = new THREE.Mesh(pitRoadGeometry, pitRoadMat)
    pitRoad.receiveShadow = true
    const pitLine = new THREE.Mesh(pitLineGeo, pitLineMat)
    const pitSpeedLimitLine = new THREE.Mesh(pitSpeedLimitGeo, lineMaterial)
    scene.add(pitRoad, pitLine, pitSpeedLimitLine)

    // Pit Wall barrier dividing track from pit lane (Hamilton Straight)
    const pitWallGeo = new THREE.BoxGeometry(22, 1.1, 0.6)
    const pitWallMat = new THREE.MeshStandardMaterial({ color: '#222830', roughness: 0.8 })
    const pitWall = new THREE.Mesh(pitWallGeo, pitWallMat)
    pitWall.position.set(-11, 0.55, 20.2)
    pitWall.castShadow = true
    pitWall.receiveShadow = true
    scene.add(pitWall)

    // The Silverstone Wing (Paddock Complex & Team Garages)
    const pitBuildingGeo = new THREE.BoxGeometry(34, 6.2, 8.0)
    const pitBuildingMat = new THREE.MeshStandardMaterial({ color: '#14181f', roughness: 0.8, metalness: 0.3 })
    const pitBuilding = new THREE.Mesh(pitBuildingGeo, pitBuildingMat)
    pitBuilding.position.set(-10, 3.1, 28.5)
    pitBuilding.castShadow = true
    pitBuilding.receiveShadow = true
    scene.add(pitBuilding)

    // Pit Crew Rig instantiated for Primary Pit Box
    const pitCrewRig: PitCrewRig = createPitCrew('#ff8000', '#00e5ff')
    pitCrewRig.group.position.set(-14, 0, 22.5)
    scene.add(pitCrewRig.group)

    // --- 3D Rain Particle System ---
    const rainCount = 2800
    const rainGeo = new THREE.BufferGeometry()
    const rainPositions = new Float32Array(rainCount * 3)
    for (let i = 0; i < rainCount; i += 1) {
      rainPositions[i * 3] = (Math.random() - 0.5) * 160
      rainPositions[i * 3 + 1] = Math.random() * 45
      rainPositions[i * 3 + 2] = (Math.random() - 0.5) * 160
    }
    rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPositions, 3))
    const rainMat = new THREE.PointsMaterial({
      color: '#cce4ff',
      size: 0.28,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
    })
    const rainParticles = new THREE.Points(rainGeo, rainMat)
    scene.add(rainParticles)

    // --- 3D Atmospheric Doppler Radar Scanning Dome & Sweep ---
    const radarGeo = new THREE.RingGeometry(2, 68, 64)
    const radarCanvas = document.createElement('canvas')
    radarCanvas.width = 512
    radarCanvas.height = 512
    const radarCtx = radarCanvas.getContext('2d')!
    const radarTex = new THREE.CanvasTexture(radarCanvas)

    const radarMat = new THREE.MeshBasicMaterial({
      map: radarTex,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      depthWrite: false,
    })
    const radarSweepMesh = new THREE.Mesh(radarGeo, radarMat)
    radarSweepMesh.rotation.x = -Math.PI / 2
    radarSweepMesh.position.set(0, 6.5, 0)
    scene.add(radarSweepMesh)

    const scenery = addScenery(scene)

    const carGroups = new Map<string, THREE.Group>()
    driversRef.current.forEach((driver, index) => {
      const car = createF1Car(driver.teamColor, driver.secondaryColor)
      car.scale.setScalar(0.6)
      car.userData.driverId = driver.id
      car.userData.progress = driver.progress
      car.userData.gridIndex = index
      car.traverse((child) => { child.userData.driverId = driver.id })
      scene.add(car)
      carGroups.set(driver.id, car)
    })

    // --- Holographic Ghost Car (Pole Reference) ---
    const ghostCar = createF1Car('#00f0ff', '#ffffff')
    ghostCar.traverse((child: THREE.Object3D) => {
      if (child instanceof THREE.Mesh) {
        child.material = new THREE.MeshBasicMaterial({
          color: '#00f0ff',
          transparent: true,
          opacity: 0.35,
          wireframe: true,
        })
      }
    })
    scene.add(ghostCar)

    // --- Wet Tire Spray Roost Particles ---
    const sprayCount = 1200
    const sprayGeo = new THREE.BufferGeometry()
    const sprayPositions = new Float32Array(sprayCount * 3)
    for (let i = 0; i < sprayCount; i += 1) {
      sprayPositions[i * 3] = 0
      sprayPositions[i * 3 + 1] = -100
      sprayPositions[i * 3 + 2] = 0
    }
    sprayGeo.setAttribute('position', new THREE.BufferAttribute(sprayPositions, 3))
    const sprayMat = new THREE.PointsMaterial({
      color: '#e0f2fe',
      size: 0.45,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
    const sprayParticles = new THREE.Points(sprayGeo, sprayMat)
    scene.add(sprayParticles)

    const selectionRing = new THREE.Mesh(
      new THREE.RingGeometry(1.35, 1.6, 40),
      new THREE.MeshBasicMaterial({ color: '#ff8000', transparent: true, opacity: 0.95, side: THREE.DoubleSide }),
    )
    selectionRing.rotation.x = -Math.PI / 2
    selectionRing.position.y = 0.12
    scene.add(selectionRing)

    let orbitOffset = 0
    let dragging = false
    let moved = false
    let lastPointerX = 0
    const pointer = new THREE.Vector2()
    const raycaster = new THREE.Raycaster()
    const lookTarget = new THREE.Vector3()
    const desiredCamera = new THREE.Vector3()
    const side = new THREE.Vector3()
    const clock = new THREE.Clock()
    let animationFrame = 0

    const pointerDown = (event: PointerEvent) => {
      dragging = true
      moved = false
      lastPointerX = event.clientX
      renderer.domElement.setPointerCapture(event.pointerId)
    }
    const pointerMove = (event: PointerEvent) => {
      if (!dragging) return
      const deltaX = event.clientX - lastPointerX
      if (Math.abs(deltaX) > 2) moved = true
      orbitOffset += deltaX * 0.007
      lastPointerX = event.clientX
    }
    const pointerUp = (event: PointerEvent) => {
      if (dragging) {
        renderer.domElement.releasePointerCapture(event.pointerId)
        dragging = false
      }
      if (!moved) {
        const bounds = renderer.domElement.getBoundingClientRect()
        pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1
        pointer.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1
        raycaster.setFromCamera(pointer, camera)
        const intersects = raycaster.intersectObjects(scene.children, true)
        for (const hit of intersects) {
          let node: THREE.Object3D | null = hit.object
          while (node && !node.userData.driverId) node = node.parent
          if (node?.userData.driverId) {
            selectRef.current(node.userData.driverId)
            break
          }
        }
      }
    }

    renderer.domElement.addEventListener('pointerdown', pointerDown)
    renderer.domElement.addEventListener('pointermove', pointerMove)
    renderer.domElement.addEventListener('pointerup', pointerUp)

    const handleResize = () => {
      if (!container) return
      const w = container.clientWidth || 800
      const h = container.clientHeight || 500
      camera.aspect = w / Math.max(1, h)
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    window.addEventListener('resize', handleResize)

    const resizeObserver = new ResizeObserver(handleResize)
    resizeObserver.observe(container)

    const animate = () => {
      animationFrame = requestAnimationFrame(animate)
      const deltaTime = clock.getDelta()
      const elapsed = clock.getElapsedTime()

      const currentRain = rainfallRef.current
      const currentRadar = showRadarRef.current

      // 1. Dynamic Rain Effects
      if (currentRain > 0) {
        rainParticles.visible = true
        rainMat.opacity = Math.min(0.85, (currentRain / 100) * 0.9)
        const positions = rainGeo.attributes.position.array as Float32Array
        for (let i = 1; i < rainCount * 3; i += 3) {
          positions[i] -= deltaTime * (32 + (currentRain / 100) * 24)
          if (positions[i] < 0) positions[i] = 45
        }
        rainGeo.attributes.position.needsUpdate = true

        roadMaterial.roughness = Math.max(0.18, 0.92 - (currentRain / 100) * 0.74)
        roadMaterial.color.set(currentRain > 50 ? '#26292e' : '#3c4149')
        scene.fog = new THREE.FogExp2('#718294', 0.0028 + (currentRain / 100) * 0.005)
        sun.intensity = Math.max(1.1, 2.8 - (currentRain / 100) * 1.5)
      } else {
        rainParticles.visible = false
        rainMat.opacity = 0
        roadMaterial.roughness = 0.92
        roadMaterial.color.set('#444b54')
        scene.fog = new THREE.FogExp2('#a8cbfa', 0.0025)
        sun.intensity = 2.8
      }

      // 2. 3D Doppler Radar Scan
      if (currentRadar || currentRain > 5) {
        radarSweepMesh.visible = true
        radarMat.opacity = currentRadar ? 0.68 : Math.min(0.5, (currentRain / 100) * 0.5)

        radarCtx.clearRect(0, 0, 512, 512)
        const sweepRad = ((elapsed % 3) / 3) * Math.PI * 2
        const cx = 256
        const cy = 256

        radarCtx.strokeStyle = 'rgba(56, 189, 248, 0.35)'
        radarCtx.lineWidth = 2
        ;[64, 128, 192, 240].forEach((r) => {
          radarCtx.beginPath()
          radarCtx.arc(cx, cy, r, 0, Math.PI * 2)
          radarCtx.stroke()
        })

        if (currentRain > 5) {
          const rFactor = currentRain / 100
          const rainGrad = radarCtx.createRadialGradient(cx - 30, cy + 20, 0, cx - 30, cy + 20, 180 * rFactor)
          if (currentRain > 60) {
            rainGrad.addColorStop(0, 'rgba(239, 68, 68, 0.6)')
            rainGrad.addColorStop(0.5, 'rgba(234, 179, 8, 0.4)')
            rainGrad.addColorStop(1, 'rgba(34, 197, 94, 0)')
          } else {
            rainGrad.addColorStop(0, 'rgba(234, 179, 8, 0.5)')
            rainGrad.addColorStop(0.6, 'rgba(34, 197, 94, 0.35)')
            rainGrad.addColorStop(1, 'rgba(56, 189, 248, 0)')
          }
          radarCtx.fillStyle = rainGrad
          radarCtx.beginPath()
          radarCtx.arc(cx - 30, cy + 20, 180 * rFactor, 0, Math.PI * 2)
          radarCtx.fill()
        }

        const fanGrad = radarCtx.createRadialGradient(cx, cy, 0, cx, cy, 240)
        fanGrad.addColorStop(0, 'rgba(0, 242, 170, 0.4)')
        fanGrad.addColorStop(0.8, 'rgba(56, 189, 248, 0.2)')
        fanGrad.addColorStop(1, 'rgba(0, 242, 170, 0)')
        radarCtx.save()
        radarCtx.beginPath()
        radarCtx.moveTo(cx, cy)
        radarCtx.arc(cx, cy, 240, sweepRad - Math.PI / 4, sweepRad)
        radarCtx.closePath()
        radarCtx.fillStyle = fanGrad
        radarCtx.fill()
        radarCtx.restore()

        radarTex.needsUpdate = true
      } else {
        radarSweepMesh.visible = false
      }

      // 3. Holographic Ghost Car (Pole Reference) Update
      if (showGhostRef.current) {
        ghostCar.visible = true
        const ghostProgress = ((elapsed * 0.058) % 1)
        const ghostPt = curve.getPointAt(ghostProgress)
        const ghostTan = curve.getTangentAt(ghostProgress).normalize()
        ghostCar.position.set(ghostPt.x, 0.07, ghostPt.z)
        ghostCar.rotation.y = Math.atan2(ghostTan.x, ghostTan.z)
      } else {
        ghostCar.visible = false
      }

      // 4. Wet Tire Spray Roost Particles
      if (currentRain > 0) {
        sprayParticles.visible = true
        sprayMat.opacity = Math.min(0.65, (currentRain / 100) * 0.75)
        const sPos = sprayGeo.attributes.position.array as Float32Array
        let sIdx = 0
        driversRef.current.forEach((driver) => {
          const car = carGroups.get(driver.id)
          if (!car || driver.speed < 50) return
          const speedFactor = driver.speed / 300
          for (let p = 0; p < 25 && sIdx < sprayCount; p += 1) {
            const i3 = sIdx * 3
            if (sPos[i3 + 1] < 0 || sPos[i3 + 1] > 3.2) {
              sPos[i3] = car.position.x + (Math.random() - 0.5) * 1.4
              sPos[i3 + 1] = 0.15 + Math.random() * 0.2
              sPos[i3 + 2] = car.position.z + (Math.random() - 0.5) * 1.4
            } else {
              sPos[i3 + 1] += deltaTime * (1.2 + speedFactor * 2.2)
              sPos[i3] += (Math.random() - 0.5) * 0.06
              sPos[i3 + 2] += (Math.random() - 0.5) * 0.06
            }
            sIdx += 1
          }
        })
        sprayGeo.attributes.position.needsUpdate = true
      } else {
        sprayParticles.visible = false
        sprayMat.opacity = 0
      }

      // 5. Cars Simulation & Pit Crew Animation
      let selectedPoint: THREE.Vector3 | undefined
      let selectedTangent: THREE.Vector3 | undefined
      let anyPittingActive = false

      driversRef.current.forEach((driver, index) => {
        const car = carGroups.get(driver.id)
        if (!car) return

        const isPitting = driver.pitStatus === 'PITTING'
        const isOutLap = driver.pitStatus === 'OUT_LAP' && driver.progress < 0.15

        let current = car.userData.progress as number
        let difference = driver.progress - current
        if (difference > 0.5) difference -= 1
        if (difference < -0.5) difference += 1
        current = (current + difference * Math.min(1, deltaTime * 7) + 1) % 1
        car.userData.progress = current

        let point: THREE.Vector3
        let tangent: THREE.Vector3
        let carElevation = 0

        if (isPitting || isOutLap) {
          const pitT = isPitting ? Math.min(0.5, current * 2.2) : Math.min(1, 0.5 + current * 3.3)
          point = pitCurve.getPointAt(pitT)
          tangent = pitCurve.getTangentAt(pitT).normalize()

          if (isPitting) {
            anyPittingActive = true
            const pitDuration = driver.pitDuration ?? 2.8
            const pitTimer = driver.pitStopTimer ?? 0
            const progress01 = Math.max(0, Math.min(1, 1 - pitTimer / pitDuration))

            const result = pitCrewRig.update(progress01, true, elapsed)
            carElevation = result.carElevation
          }
        } else {
          point = curve.getPointAt(current)
          tangent = curve.getTangentAt(current).normalize()
          side.set(-tangent.z, 0, tangent.x)
          const lane = ((index % 3) - 1) * 0.55
          point.addScaledVector(side, lane)
        }

        car.position.set(point.x, 0.07 + carElevation, point.z)
        car.rotation.y = Math.atan2(tangent.x, tangent.z)
        car.rotation.z = Math.sin(elapsed * 8 + index) * 0.005

        car.children.forEach((child) => {
          if (child.userData.isWheel) {
            const wheelSpeed = isPitting && carElevation > 0.05 ? 0 : Math.max(4, driver.speed * 0.08)
            child.rotation.x -= deltaTime * wheelSpeed
          }
        })

        if (driver.id === selectedRef.current) {
          selectedPoint = point.clone()
          selectedTangent = tangent.clone()
        }
      })

      if (!anyPittingActive) {
        pitCrewRig.update(0, false, elapsed)
      }

      if (selectedPoint && selectedTangent) {
        selectionRing.position.x = selectedPoint.x
        selectionRing.position.z = selectedPoint.z
        selectionRing.scale.setScalar(1 + Math.sin(elapsed * 4) * 0.1)
        selectionRing.rotation.z += deltaTime * 0.7
        side.set(-selectedTangent.z, 0, selectedTangent.x)

        const mode = cameraModeRef.current
        if (mode === 'cockpit') {
          desiredCamera.copy(selectedPoint).addScaledVector(selectedTangent, 0.28).add(new THREE.Vector3(0, 0.72, 0))
          lookTarget.copy(selectedPoint).addScaledVector(selectedTangent, 22).add(new THREE.Vector3(0, 0.45, 0))
          camera.fov = THREE.MathUtils.lerp(camera.fov, 72, 0.12)
        } else if (mode === 'nosecone') {
          desiredCamera.copy(selectedPoint).addScaledVector(selectedTangent, 2.1).add(new THREE.Vector3(0, 0.32, 0))
          lookTarget.copy(selectedPoint).addScaledVector(selectedTangent, 26).add(new THREE.Vector3(0, 0.25, 0))
          camera.fov = THREE.MathUtils.lerp(camera.fov, 82, 0.12)
        } else if (mode === 'helicopter') {
          desiredCamera.copy(selectedPoint).addScaledVector(selectedTangent, -26).add(new THREE.Vector3(0, 28, 0))
          lookTarget.copy(selectedPoint).addScaledVector(selectedTangent, 10)
          camera.fov = THREE.MathUtils.lerp(camera.fov, 52, 0.1)
        } else {
          // Broadcast Trackside Camera
          const orbitSide = side.clone().multiplyScalar(10 * Math.cos(orbitOffset))
          desiredCamera.copy(selectedPoint).addScaledVector(selectedTangent, -13).add(orbitSide).add(new THREE.Vector3(0, 8.2 + Math.abs(Math.sin(orbitOffset)) * 3.5, 0))
          lookTarget.copy(selectedPoint).addScaledVector(selectedTangent, 5)
          camera.fov = THREE.MathUtils.lerp(camera.fov, 46, 0.08)
        }

        camera.position.lerp(desiredCamera, 0.1)
        camera.lookAt(lookTarget)
        camera.updateProjectionMatrix()
      }

      renderer.render(scene, camera)
    }

    animationFrame = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(animationFrame)
      window.removeEventListener('resize', handleResize)
      renderer.domElement.removeEventListener('pointerdown', pointerDown)
      renderer.domElement.removeEventListener('pointermove', pointerMove)
      renderer.domElement.removeEventListener('pointerup', pointerUp)

      carGroups.forEach((car) => disposeF1Car(car))
      disposeF1Car(ghostCar)
      disposePitCrew(pitCrewRig)

      scenery.materials.forEach((m) => m.dispose())
      scenery.geometries.forEach((g) => g.dispose())
      scenery.textures.forEach((t) => t.dispose())

      grassMap.dispose()
      curbMap.dispose()
      startMap.dispose()
      radarTex.dispose()

      runoffGeometry.dispose()
      curbGeometry.dispose()
      roadGeometry.dispose()
      leftLineGeometry.dispose()
      rightLineGeometry.dispose()
      rubberGeometry.dispose()
      pitRoadGeometry.dispose()
      rainGeo.dispose()
      rainMat.dispose()
      sprayGeo.dispose()
      sprayMat.dispose()
      pitLineGeo.dispose()
      pitSpeedLimitGeo.dispose()
      pitWallGeo.dispose()
      pitBuildingGeo.dispose()
      rainGeo.dispose()

      runoffMaterial.dispose()
      curbMaterial.dispose()
      roadMaterial.dispose()
      lineMaterial.dispose()
      rubberMaterial.dispose()
      pitRoadMat.dispose()
      pitLineMat.dispose()
      pitWallMat.dispose()
      pitBuildingMat.dispose()
      rainMat.dispose()
      radarMat.dispose()

      window.removeEventListener('resize', handleResize)
      resizeObserver.disconnect()
      renderer.dispose()
      if (renderer.domElement.parentElement === container) {
        container.removeChild(renderer.domElement)
      }
    }
  }, [])

  if (webglFailed) {
    return (
      <div className="scene-fallback">
        <p>WebGL Hardware Acceleration is unavailable. Please enable GPU in your browser settings.</p>
      </div>
    )
  }

  return <div className="race-scene-container" ref={containerRef} />
}
