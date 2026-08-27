import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import type { DriverState } from '../types'
import { createF1Car, disposeF1Car } from '../graphics/createF1Car'
import { createPitCrew, disposePitCrew, type PitCrewRig } from '../graphics/createPitCrew'

interface RaceScene3DProps {
  drivers: DriverState[]
  selectedDriverId: string
  cameraMode: 'broadcast' | 'onboard'
  onSelectDriver: (driverId: string) => void
  rainfall?: number
  showDopplerRadar?: boolean
}

const TRACK_POINTS = [
  new THREE.Vector3(-28, 0, 12),
  new THREE.Vector3(-31, 0, -4),
  new THREE.Vector3(-23, 0, -20),
  new THREE.Vector3(-7, 0, -25),
  new THREE.Vector3(8, 0, -18),
  new THREE.Vector3(15, 0, -6),
  new THREE.Vector3(28, 0, -10),
  new THREE.Vector3(37, 0, -1),
  new THREE.Vector3(35, 0, 13),
  new THREE.Vector3(23, 0, 20),
  new THREE.Vector3(10, 0, 18),
  new THREE.Vector3(3, 0, 29),
  new THREE.Vector3(-12, 0, 31),
  new THREE.Vector3(-18, 0, 20),
  new THREE.Vector3(-8, 0, 11),
  new THREE.Vector3(4, 0, 7),
  new THREE.Vector3(-3, 0, -2),
  new THREE.Vector3(-17, 0, 1),
]

const PIT_LANE_POINTS = [
  new THREE.Vector3(-14, 0, 0),
  new THREE.Vector3(-19, 0, 4.2),
  new THREE.Vector3(-23.5, 0, 8.2),
  new THREE.Vector3(-26.5, 0, 10.8),
  new THREE.Vector3(-29.5, 0, 5.5),
  new THREE.Vector3(-30.8, 0, -1.5),
]

/**
 * Creates a watertight, cleanly indexed ribbon mesh along a 3D spline.
 * Explicitly sets clean up-facing normals to prevent shadow acne and polygon artifacts.
 */
function createRibbon(curve: THREE.CatmullRomCurve3, width: number, y: number, centerOffset = 0, segments = 360) {
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
    uvs.push(t * 34, 0, t * 34, 1)

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
  const texture = canvasTexture(128, 128, (context) => {
    context.fillStyle = '#3a8747'
    context.fillRect(0, 0, 128, 128)
    context.fillStyle = '#337a3f'
    for (let index = 0; index < 128; index += 32) context.fillRect(0, index, 128, 16)
  })
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(26, 20)
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

  // Grandstand
  const grandstandGeo = new THREE.BoxGeometry(22, 6, 6)
  const grandstandMat = new THREE.MeshStandardMaterial({ color: '#2a3342', roughness: 0.8 })
  const grandstand = new THREE.Mesh(grandstandGeo, grandstandMat)
  grandstand.position.set(-2, 3, -15)
  grandstand.rotation.y = 0.22
  grandstand.castShadow = true
  grandstand.receiveShadow = true
  scene.add(grandstand)
  materials.push(grandstandMat)
  geometries.push(grandstandGeo)

  // Trackside trees
  const trunkGeo = new THREE.CylinderGeometry(0.2, 0.3, 2.4, 6)
  const foliageGeo = new THREE.ConeGeometry(1.6, 4.2, 6)
  const trunkMat = new THREE.MeshStandardMaterial({ color: '#4a3b2c', roughness: 0.9 })
  const foliageMat = new THREE.MeshStandardMaterial({ color: '#276b36', roughness: 0.7 })
  materials.push(trunkMat, foliageMat)
  geometries.push(trunkGeo, foliageGeo)

  const treePositions = [
    [-36, 18], [-38, -12], [-14, -32], [22, -24], [42, 6], [18, 34], [-24, 28],
    [2, 14], [-12, -8], [12, -2],
  ]
  treePositions.forEach(([x, z]) => {
    const tree = new THREE.Group()
    const trunk = new THREE.Mesh(trunkGeo, trunkMat)
    trunk.position.y = 1.2
    const foliage = new THREE.Mesh(foliageGeo, foliageMat)
    foliage.position.y = 3.6
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
}: RaceScene3DProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [webglFailed, setWebglFailed] = useState(false)
  const driversRef = useRef(drivers)
  const selectedRef = useRef(selectedDriverId)
  const cameraModeRef = useRef(cameraMode)
  const selectRef = useRef(onSelectDriver)
  const rainfallRef = useRef(rainfall)
  const showRadarRef = useRef(showDopplerRadar)

  const [activePitDriver, setActivePitDriver] = useState<DriverState | null>(null)

  useEffect(() => {
    driversRef.current = drivers
    const pitting = drivers.find((d) => d.pitStatus === 'PITTING')
    const selected = drivers.find((d) => d.id === selectedDriverId)
    if (selected && (selected.pitStatus === 'PITTING' || selected.pitStatus === 'REQUESTED')) {
      setActivePitDriver(selected)
    } else if (pitting) {
      setActivePitDriver(pitting)
    } else {
      setActivePitDriver(null)
    }
  }, [drivers, selectedDriverId])

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
    const container = containerRef.current
    if (!container) return

    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' })
    } catch {
      setWebglFailed(true)
      return
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75))
    renderer.setSize(container.clientWidth, container.clientHeight)
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
    scene.background = new THREE.Color('#9cc0e6')
    scene.fog = new THREE.FogExp2('#b0d0f0', 0.0028)

    const camera = new THREE.PerspectiveCamera(46, container.clientWidth / Math.max(1, container.clientHeight), 0.1, 320)
    camera.position.set(0, 48, 66)

    const hemisphere = new THREE.HemisphereLight('#f0f7ff', '#4f8054', 1.1)
    scene.add(hemisphere)

    const sun = new THREE.DirectionalLight('#fff7eb', 2.8)
    sun.position.set(-34, 60, 26)
    sun.castShadow = true
    sun.shadow.mapSize.set(1024, 1024)
    sun.shadow.camera.left = -75
    sun.shadow.camera.right = 75
    sun.shadow.camera.top = 75
    sun.shadow.camera.bottom = -75
    sun.shadow.bias = 0.0008
    sun.shadow.normalBias = 0.02
    scene.add(sun)

    const rimLight = new THREE.DirectionalLight('#d6e8ff', 0.6)
    rimLight.position.set(40, 22, -40)
    scene.add(rimLight)

    // Ground infield
    const grassMap = grassTexture()
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(260, 200),
      new THREE.MeshStandardMaterial({ map: grassMap, roughness: 1, metalness: 0 }),
    )
    ground.rotation.x = -Math.PI / 2
    ground.position.y = -0.3
    ground.receiveShadow = true
    scene.add(ground)

    // Main circuit spline & ribbons
    const curve = new THREE.CatmullRomCurve3(TRACK_POINTS, true, 'centripetal', 0.35)
    const runoffGeometry = createRibbon(curve, 14.2, -0.02)
    const curbGeometry = createRibbon(curve, 12.3, 0.02)
    const roadGeometry = createRibbon(curve, 9.4, 0.06)
    const leftLineGeometry = createRibbon(curve, 0.22, 0.085, -4.32)
    const rightLineGeometry = createRibbon(curve, 0.22, 0.085, 4.32)
    const rubberGeometry = createRibbon(curve, 3.6, 0.09)

    const runoffMaterial = new THREE.MeshStandardMaterial({ color: '#9ba4ad', roughness: 0.95, side: THREE.DoubleSide })
    const curbMap = curbTexture()
    curbMap.repeat.set(9, 1)
    const curbMaterial = new THREE.MeshStandardMaterial({ map: curbMap, roughness: 0.7, side: THREE.DoubleSide })
    const roadMaterial = new THREE.MeshStandardMaterial({ color: '#4a5159', roughness: 0.92, side: THREE.DoubleSide })
    const lineMaterial = new THREE.MeshBasicMaterial({ color: '#f5f7fa', side: THREE.DoubleSide })
    const rubberMaterial = new THREE.MeshStandardMaterial({ color: '#31373e', roughness: 1, side: THREE.DoubleSide })

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
      new THREE.PlaneGeometry(9.2, 1.05),
      new THREE.MeshBasicMaterial({ map: startMap }),
    )
    startLine.rotation.x = -Math.PI / 2
    startLine.rotation.z = -Math.atan2(startTangent.z, startTangent.x)
    startLine.position.set(startPoint.x, 0.11, startPoint.z)
    scene.add(startLine)

    // --- Pit Lane & Pit Wall Architecture ---
    const pitCurve = new THREE.CatmullRomCurve3(PIT_LANE_POINTS, false, 'centripetal', 0.4)
    const pitRoadGeometry = createRibbon(pitCurve, 4.6, 0.065, 0, 80)
    const pitLineGeo = createRibbon(pitCurve, 0.18, 0.088, -2.1, 80)
    const pitSpeedLimitGeo = createRibbon(pitCurve, 0.18, 0.088, 2.1, 80)
    const pitRoadMat = new THREE.MeshStandardMaterial({ color: '#3c434c', roughness: 0.94, side: THREE.DoubleSide })
    const pitLineMat = new THREE.MeshBasicMaterial({ color: '#ffcc00', side: THREE.DoubleSide })

    const pitRoad = new THREE.Mesh(pitRoadGeometry, pitRoadMat)
    pitRoad.receiveShadow = true
    const pitLine = new THREE.Mesh(pitLineGeo, pitLineMat)
    const pitSpeedLimitLine = new THREE.Mesh(pitSpeedLimitGeo, lineMaterial)
    scene.add(pitRoad, pitLine, pitSpeedLimitLine)

    // Pit Wall barrier dividing track from pit lane
    const pitWallGeo = new THREE.BoxGeometry(18, 1.1, 0.7)
    const pitWallMat = new THREE.MeshStandardMaterial({ color: '#272d36', roughness: 0.8 })
    const pitWall = new THREE.Mesh(pitWallGeo, pitWallMat)
    pitWall.position.set(-23.5, 0.55, 6.2)
    pitWall.rotation.y = 0.52
    pitWall.castShadow = true
    pitWall.receiveShadow = true
    scene.add(pitWall)

    // Pit Building / Team Garages
    const pitBuildingGeo = new THREE.BoxGeometry(26, 5.5, 7.5)
    const pitBuildingMat = new THREE.MeshStandardMaterial({ color: '#161c24', roughness: 0.85, metalness: 0.2 })
    const pitBuilding = new THREE.Mesh(pitBuildingGeo, pitBuildingMat)
    pitBuilding.position.set(-27.5, 2.75, 14.5)
    pitBuilding.rotation.y = 0.52
    pitBuilding.castShadow = true
    pitBuilding.receiveShadow = true
    scene.add(pitBuilding)

    // Pit Crew Rig instantiated for Primary Pit Box
    const pitCrewRig: PitCrewRig = createPitCrew('#ff8000', '#00e5ff')
    pitCrewRig.group.position.set(-24.5, 0, 9.2)
    pitCrewRig.group.rotation.y = 0.52
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
    radarSweepMesh.position.set(2, 6.5, 4)
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
      const delta = event.clientX - lastPointerX
      if (Math.abs(delta) > 1) moved = true
      orbitOffset += delta * 0.006
      lastPointerX = event.clientX
    }
    const pointerUp = (event: PointerEvent) => {
      dragging = false
      if (moved) return
      const bounds = renderer.domElement.getBoundingClientRect()
      pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1
      pointer.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1
      raycaster.setFromCamera(pointer, camera)
      const hits = raycaster.intersectObjects([...carGroups.values()], true)
      const driverId = hits[0]?.object.userData.driverId as string | undefined
      if (driverId) selectRef.current(driverId)
    }
    renderer.domElement.addEventListener('pointerdown', pointerDown)
    renderer.domElement.addEventListener('pointermove', pointerMove)
    renderer.domElement.addEventListener('pointerup', pointerUp)

    const animate = () => {
      animationFrame = requestAnimationFrame(animate)
      const deltaTime = Math.min(0.04, clock.getDelta())
      const elapsed = clock.elapsedTime
      const currentRain = rainfallRef.current
      const currentRadar = showRadarRef.current

      // 1. Weather Dynamics & Sky Atmospheric Adjustments
      if (currentRain > 0) {
        rainParticles.visible = true
        rainMat.opacity = Math.min(0.85, 0.15 + (currentRain / 100) * 0.65)
        const rainPos = rainGeo.attributes.position.array as Float32Array
        const fallSpeed = 32 + (currentRain / 100) * 28
        for (let i = 0; i < rainCount; i += 1) {
          rainPos[i * 3 + 1] -= fallSpeed * deltaTime
          rainPos[i * 3] += Math.sin(elapsed * 2) * 0.05
          if (rainPos[i * 3 + 1] < 0) {
            rainPos[i * 3 + 1] = 45
          }
        }
        rainGeo.attributes.position.needsUpdate = true

        // Wet track surface darkening and gloss
        const wetness = Math.min(1, currentRain / 100)
        roadMaterial.roughness = THREE.MathUtils.lerp(0.92, 0.22, wetness)
        roadMaterial.color.set(wetness > 0.4 ? '#252a30' : '#3d444d')
        scene.fog = new THREE.FogExp2('#687c94', 0.005 + wetness * 0.008)
        sun.intensity = THREE.MathUtils.lerp(2.8, 1.2, wetness)
      } else {
        rainParticles.visible = false
        rainMat.opacity = 0
        roadMaterial.roughness = 0.92
        roadMaterial.color.set('#4a5159')
        scene.fog = new THREE.FogExp2('#b0d0f0', 0.0028)
        sun.intensity = 2.8
      }

      // 2. 3D Atmospheric Doppler Radar Dynamic Texture Updates
      if (currentRadar || currentRain > 5) {
        radarSweepMesh.visible = true
        radarMat.opacity = currentRadar ? 0.68 : Math.min(0.5, (currentRain / 100) * 0.5)

        // Draw radial radar sweep onto texture
        radarCtx.clearRect(0, 0, 512, 512)
        const sweepRad = ((elapsed % 3) / 3) * Math.PI * 2
        const cx = 256
        const cy = 256

        // Range rings
        radarCtx.strokeStyle = 'rgba(56, 189, 248, 0.35)'
        radarCtx.lineWidth = 2
        ;[64, 128, 192, 240].forEach((r) => {
          radarCtx.beginPath()
          radarCtx.arc(cx, cy, r, 0, Math.PI * 2)
          radarCtx.stroke()
        })

        // Rain precipitation Doppler blobs
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

        // Phosphor sweep fan
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

      // 3. Cars Simulation & Pit Crew Animation
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
          // Drive along pit lane spline
          const pitT = isPitting ? Math.min(0.5, current * 2.2) : Math.min(1, 0.5 + current * 3.3)
          point = pitCurve.getPointAt(pitT)
          tangent = pitCurve.getTangentAt(pitT).normalize()

          if (isPitting) {
            anyPittingActive = true
            const pitDuration = driver.pitDuration ?? 2.8
            const pitTimer = driver.pitStopTimer ?? 0
            const progress01 = Math.max(0, Math.min(1, 1 - pitTimer / pitDuration))

            // Animate mechanics (jacks lift, gunners vibrate, lollipop switches)
            const result = pitCrewRig.update(progress01, true, elapsed)
            carElevation = result.carElevation
          }
        } else {
          // Regular on-track racing line
          point = curve.getPointAt(current)
          tangent = curve.getTangentAt(current).normalize()
          side.set(-tangent.z, 0, tangent.x)
          const lane = ((index % 3) - 1) * 0.58
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

      // If no car is currently pitting in the box, reset pit crew to ready idle
      if (!anyPittingActive) {
        pitCrewRig.update(0, false, elapsed)
      }

      if (selectedPoint && selectedTangent) {
        selectionRing.position.x = selectedPoint.x
        selectionRing.position.z = selectedPoint.z
        selectionRing.scale.setScalar(1 + Math.sin(elapsed * 4) * 0.1)
        selectionRing.rotation.z += deltaTime * 0.7
        side.set(-selectedTangent.z, 0, selectedTangent.x)

        if (cameraModeRef.current === 'onboard') {
          desiredCamera.copy(selectedPoint).addScaledVector(selectedTangent, -3.2).add(new THREE.Vector3(0, 1.6, 0))
          lookTarget.copy(selectedPoint).addScaledVector(selectedTangent, 14).add(new THREE.Vector3(0, 0.5, 0))
          camera.fov = THREE.MathUtils.lerp(camera.fov, 62, 0.08)
        } else {
          const orbitSide = side.clone().multiplyScalar(10 * Math.cos(orbitOffset))
          desiredCamera.copy(selectedPoint).addScaledVector(selectedTangent, -13).add(orbitSide).add(new THREE.Vector3(0, 8.2 + Math.abs(Math.sin(orbitOffset)) * 3.5, 0))
          lookTarget.copy(selectedPoint).addScaledVector(selectedTangent, 5)
          camera.fov = THREE.MathUtils.lerp(camera.fov, 47, 0.06)
        }
        camera.position.lerp(desiredCamera, 1 - Math.exp(-deltaTime * 2.8))
        camera.lookAt(lookTarget)
        camera.updateProjectionMatrix()
      }

      renderer.render(scene, camera)
    }
    animate()

    const resize = () => {
      const width = Math.max(1, container.clientWidth)
      const height = Math.max(1, container.clientHeight)
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height, false)
    }
    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(container)

    return () => {
      cancelAnimationFrame(animationFrame)
      resizeObserver.disconnect()
      renderer.domElement.removeEventListener('pointerdown', pointerDown)
      renderer.domElement.removeEventListener('pointermove', pointerMove)
      renderer.domElement.removeEventListener('pointerup', pointerUp)
      carGroups.forEach(disposeF1Car)
      disposePitCrew(pitCrewRig)
      runoffGeometry.dispose()
      curbGeometry.dispose()
      roadGeometry.dispose()
      leftLineGeometry.dispose()
      rightLineGeometry.dispose()
      rubberGeometry.dispose()
      pitRoadGeometry.dispose()
      pitLineGeo.dispose()
      pitSpeedLimitGeo.dispose()
      pitWallGeo.dispose()
      pitBuildingGeo.dispose()
      ground.geometry.dispose()
      rainGeo.dispose()
      radarGeo.dispose()
      grassMap.dispose()
      curbMap.dispose()
      startMap.dispose()
      radarTex.dispose()
      startLine.geometry.dispose()
      ;(startLine.material as THREE.Material).dispose()
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
      ;(ground.material as THREE.Material).dispose()
      scenery.materials.forEach((material) => material.dispose())
      scenery.textures.forEach((texture) => texture.dispose())
      scenery.geometries.forEach((geometry) => geometry.dispose())
      selectionRing.geometry.dispose()
      ;(selectionRing.material as THREE.Material).dispose()
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [])

  // Calculate live pit stop phase for HUD
  const pitProgress =
    activePitDriver?.pitStopTimer !== undefined && activePitDriver?.pitDuration !== undefined
      ? Math.max(0, Math.min(1, 1 - activePitDriver.pitStopTimer / activePitDriver.pitDuration))
      : 0
  const pitPhase =
    pitProgress < 0.18
      ? 'JACKS LIFTING'
      : pitProgress < 0.78
        ? 'GUNNING & TYRE SWAP'
        : pitProgress < 0.9
          ? 'JACKS RELEASING'
          : 'GREEN LIGHT · GO!'

  return (
    <div className="race-scene-3d" ref={containerRef}>
      {webglFailed && (
        <div className="webgl-fallback">
          <strong>3D VIEW UNAVAILABLE</strong>
          <span>Switch to the circuit map to continue race control.</span>
        </div>
      )}
      <div className="scene-vignette" />
      <div className="scene-badge"><i /> 3D BROADCAST FEED</div>
      <div className="scene-help"><span>DRAG</span> ROTATE CAMERA · TAP ANY CAR TO SELECT</div>

      {/* Real-time 3D Pit Stop HUD stopwatch card */}
      {activePitDriver && activePitDriver.pitStatus === 'PITTING' && (
        <div className="scene-pitstop-card" style={{ '--team-color': activePitDriver.teamColor } as React.CSSProperties}>
          <div className="pitstop-header">
            <span className="pitstop-pulse-dot" />
            <div className="pitstop-car-title">
              <strong>{activePitDriver.code}</strong>
              <small>BOXING · LAP {activePitDriver.lap}</small>
            </div>
            <span className="pitstop-team-tag">{activePitDriver.teamShort}</span>
          </div>

          <div className="pitstop-body">
            <div className="pitstop-timer-block">
              <span className="timer-title">STATIONARY STOPWATCH</span>
              <strong className="timer-val">
                {activePitDriver.pitStopTimer !== undefined && activePitDriver.pitDuration !== undefined
                  ? (activePitDriver.pitDuration - activePitDriver.pitStopTimer).toFixed(2)
                  : '0.00'}
                <small>s</small>
              </strong>
            </div>

            <div className="pitstop-phase-chip">
              <span>STATUS:</span>
              <strong className={pitProgress >= 0.9 ? 'go' : 'active'}>{pitPhase}</strong>
            </div>
          </div>

          <div className="pitstop-progress-track">
            <div className="pitstop-progress-fill" style={{ width: `${(pitProgress * 100).toFixed(0)}%` }} />
          </div>
        </div>
      )}
    </div>
  )
}
