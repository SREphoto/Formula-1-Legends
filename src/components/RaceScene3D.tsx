import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import type { DriverState } from '../types'
import { createF1Car, disposeF1Car } from '../graphics/createF1Car'

interface RaceScene3DProps {
  drivers: DriverState[]
  selectedDriverId: string
  cameraMode: 'broadcast' | 'onboard'
  onSelectDriver: (driverId: string) => void
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

function createRibbon(curve: THREE.CatmullRomCurve3, width: number, y: number, segments = 320) {
  const positions: number[] = []
  const uvs: number[] = []
  const indices: number[] = []
  const up = new THREE.Vector3(0, 1, 0)

  for (let index = 0; index <= segments; index += 1) {
    const t = index / segments
    const point = curve.getPointAt(t)
    const tangent = curve.getTangentAt(t).normalize()
    const side = new THREE.Vector3().crossVectors(up, tangent).normalize().multiplyScalar(width / 2)
    const left = point.clone().add(side)
    const right = point.clone().sub(side)
    positions.push(left.x, y, left.z, right.x, y, right.z)
    uvs.push(t * 34, 0, t * 34, 1)
    if (index < segments) {
      const base = index * 2
      indices.push(base, base + 2, base + 1, base + 2, base + 3, base + 1)
    }
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
  geometry.setIndex(indices)
  geometry.computeVertexNormals()
  return geometry
}

function curbTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 128
  canvas.height = 16
  const context = canvas.getContext('2d')!
  for (let index = 0; index < 8; index += 1) {
    context.fillStyle = index % 2 === 0 ? '#f3f4f4' : '#df3844'
    context.fillRect(index * 16, 0, 16, 16)
  }
  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.ClampToEdgeWrapping
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

function addScenery(scene: THREE.Scene) {
  const buildingMaterial = new THREE.MeshStandardMaterial({ color: '#242b32', roughness: 0.78, metalness: 0.18 })
  const glassMaterial = new THREE.MeshStandardMaterial({ color: '#27424d', roughness: 0.25, metalness: 0.62, emissive: '#14313d', emissiveIntensity: 0.3 })
  const standMaterial = new THREE.MeshStandardMaterial({ color: '#3b424a', roughness: 0.8 })

  const pitBuilding = new THREE.Group()
  for (let index = 0; index < 8; index += 1) {
    const unit = new THREE.Mesh(new THREE.BoxGeometry(4.2, 2.5, 4.8), buildingMaterial)
    unit.position.set(-29 + index * 4.3, 1.25, 39)
    unit.castShadow = true
    unit.receiveShadow = true
    pitBuilding.add(unit)
    const window = new THREE.Mesh(new THREE.BoxGeometry(3.45, 0.85, 0.08), glassMaterial)
    window.position.set(-29 + index * 4.3, 1.65, 36.57)
    pitBuilding.add(window)
  }
  scene.add(pitBuilding)

  const standLocations: [number, number, number, number][] = [
    [38, 2.4, 18, -0.55], [-25, 2.4, -29, 0.18], [22, 2.4, -23, -0.35],
  ]
  standLocations.forEach(([x, y, z, rotation]) => {
    const stand = new THREE.Group()
    for (let tier = 0; tier < 4; tier += 1) {
      const block = new THREE.Mesh(new THREE.BoxGeometry(14, 0.65, 2.2), standMaterial)
      block.position.set(0, tier * 0.62, -tier * 0.8)
      block.castShadow = true
      stand.add(block)
    }
    stand.position.set(x, y, z)
    stand.rotation.y = rotation
    scene.add(stand)
  })

  const trunkMaterial = new THREE.MeshStandardMaterial({ color: '#4a3726', roughness: 1 })
  const leafMaterial = new THREE.MeshStandardMaterial({ color: '#164d35', roughness: 0.95 })
  for (let index = 0; index < 44; index += 1) {
    const angle = index * 2.399
    const radius = 47 + (index % 7) * 2.8
    const tree = new THREE.Group()
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.34, 2.4, 6), trunkMaterial)
    trunk.position.y = 1.2
    tree.add(trunk)
    const leaves = new THREE.Mesh(new THREE.ConeGeometry(1.45, 3.8, 7), leafMaterial)
    leaves.position.y = 3.5
    leaves.castShadow = true
    tree.add(leaves)
    tree.position.set(Math.cos(angle) * radius, 0, Math.sin(angle) * radius)
    scene.add(tree)
  }

  return [buildingMaterial, glassMaterial, standMaterial, trunkMaterial, leafMaterial]
}

export function RaceScene3D({ drivers, selectedDriverId, cameraMode, onSelectDriver }: RaceScene3DProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const driversRef = useRef(drivers)
  const cameraModeRef = useRef(cameraMode)
  const selectedRef = useRef(selectedDriverId)
  const selectRef = useRef(onSelectDriver)
  const [webglFailed, setWebglFailed] = useState(false)

  driversRef.current = drivers
  cameraModeRef.current = cameraMode
  selectedRef.current = selectedDriverId
  selectRef.current = onSelectDriver

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' })
    } catch {
      setWebglFailed(true)
      return
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6))
    renderer.setSize(container.clientWidth, container.clientHeight)
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.12
    renderer.shadowMap.enabled = window.innerWidth > 760
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.domElement.className = 'race-3d-canvas'
    renderer.domElement.style.touchAction = 'none'
    container.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    scene.background = new THREE.Color('#091016')
    scene.fog = new THREE.FogExp2('#091016', 0.012)

    const camera = new THREE.PerspectiveCamera(46, container.clientWidth / Math.max(1, container.clientHeight), 0.1, 250)
    camera.position.set(0, 55, 61)

    const hemisphere = new THREE.HemisphereLight('#b8ddff', '#173021', 1.45)
    scene.add(hemisphere)
    const sun = new THREE.DirectionalLight('#fff0d5', 3.2)
    sun.position.set(-28, 54, 28)
    sun.castShadow = true
    sun.shadow.mapSize.set(1024, 1024)
    sun.shadow.camera.left = -70
    sun.shadow.camera.right = 70
    sun.shadow.camera.top = 70
    sun.shadow.camera.bottom = -70
    scene.add(sun)
    const rimLight = new THREE.DirectionalLight('#3a95d8', 1.4)
    rimLight.position.set(40, 16, -42)
    scene.add(rimLight)

    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(180, 145),
      new THREE.MeshStandardMaterial({ color: '#102f24', roughness: 1, metalness: 0 }),
    )
    ground.rotation.x = -Math.PI / 2
    ground.position.y = -0.18
    ground.receiveShadow = true
    scene.add(ground)

    const curve = new THREE.CatmullRomCurve3(TRACK_POINTS, true, 'centripetal', 0.35)
    const runoffGeometry = createRibbon(curve, 13.5, -0.04)
    const curbGeometry = createRibbon(curve, 11.5, 0.005)
    const roadGeometry = createRibbon(curve, 9.4, 0.03)
    const runoffMaterial = new THREE.MeshStandardMaterial({ color: '#4c5358', roughness: 0.95 })
    const curbMap = curbTexture()
    const curbMaterial = new THREE.MeshStandardMaterial({ map: curbMap, roughness: 0.78 })
    const roadMaterial = new THREE.MeshStandardMaterial({ color: '#22272c', roughness: 0.88, metalness: 0.04 })
    const runoff = new THREE.Mesh(runoffGeometry, runoffMaterial)
    const curbs = new THREE.Mesh(curbGeometry, curbMaterial)
    const road = new THREE.Mesh(roadGeometry, roadMaterial)
    road.receiveShadow = true
    scene.add(runoff, curbs, road)

    const racingLine = new THREE.Mesh(
      createRibbon(curve, 0.38, 0.065),
      new THREE.MeshBasicMaterial({ color: '#0b0d0f', transparent: true, opacity: 0.72 }),
    )
    scene.add(racingLine)

    const startPoint = curve.getPointAt(0)
    const startTangent = curve.getTangentAt(0)
    const startLine = new THREE.Mesh(
      new THREE.PlaneGeometry(9.2, 0.65),
      new THREE.MeshBasicMaterial({ color: '#e8ebed' }),
    )
    startLine.rotation.x = -Math.PI / 2
    startLine.rotation.z = -Math.atan2(startTangent.z, startTangent.x)
    startLine.position.set(startPoint.x, 0.075, startPoint.z)
    scene.add(startLine)

    const sceneryMaterials = addScenery(scene)
    const carGroups = new Map<string, THREE.Group>()
    driversRef.current.forEach((driver, index) => {
      const car = createF1Car(driver.teamColor, driver.secondaryColor)
      car.scale.setScalar(0.48)
      car.userData.driverId = driver.id
      car.userData.progress = driver.progress
      car.userData.gridIndex = index
      car.traverse((child) => { child.userData.driverId = driver.id })
      scene.add(car)
      carGroups.set(driver.id, car)
    })

    const selectionRing = new THREE.Mesh(
      new THREE.RingGeometry(1.2, 1.43, 32),
      new THREE.MeshBasicMaterial({ color: '#ff8b32', transparent: true, opacity: 0.9, side: THREE.DoubleSide }),
    )
    selectionRing.rotation.x = -Math.PI / 2
    selectionRing.position.y = 0.09
    scene.add(selectionRing)

    const sparkCount = 42
    const sparkPositions = new Float32Array(sparkCount * 3)
    const sparkLife = new Float32Array(sparkCount)
    const sparkGeometry = new THREE.BufferGeometry()
    sparkGeometry.setAttribute('position', new THREE.BufferAttribute(sparkPositions, 3))
    const sparks = new THREE.Points(
      sparkGeometry,
      new THREE.PointsMaterial({ color: '#ffad32', size: 0.13, transparent: true, opacity: 0.85, depthWrite: false }),
    )
    scene.add(sparks)

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
      let selectedCar: THREE.Group | undefined
      let selectedPoint: THREE.Vector3 | undefined
      let selectedTangent: THREE.Vector3 | undefined

      driversRef.current.forEach((driver, index) => {
        const car = carGroups.get(driver.id)
        if (!car) return
        let current = car.userData.progress as number
        let difference = driver.progress - current
        if (difference > 0.5) difference -= 1
        if (difference < -0.5) difference += 1
        current = (current + difference * Math.min(1, deltaTime * 7) + 1) % 1
        car.userData.progress = current
        const point = curve.getPointAt(current)
        const tangent = curve.getTangentAt(current).normalize()
        side.set(-tangent.z, 0, tangent.x)
        const lane = ((index % 3) - 1) * 0.58
        point.addScaledVector(side, lane)
        car.position.set(point.x, 0.08, point.z)
        car.rotation.y = Math.atan2(tangent.x, tangent.z)
        car.rotation.z = Math.sin(elapsed * 8 + index) * 0.006
        car.children.forEach((child) => {
          if (child.userData.isWheel) child.rotation.x -= deltaTime * Math.max(4, driver.speed * 0.08)
        })
        if (driver.id === selectedRef.current) {
          selectedCar = car
          selectedPoint = point.clone()
          selectedTangent = tangent.clone()
        }
      })

      if (selectedCar && selectedPoint && selectedTangent) {
        selectionRing.position.x = selectedPoint.x
        selectionRing.position.z = selectedPoint.z
        selectionRing.scale.setScalar(1 + Math.sin(elapsed * 4) * 0.12)
        selectionRing.rotation.z += deltaTime * 0.7
        side.set(-selectedTangent.z, 0, selectedTangent.x)

        if (cameraModeRef.current === 'onboard') {
          desiredCamera.copy(selectedPoint).addScaledVector(selectedTangent, -3.1).add(new THREE.Vector3(0, 1.55, 0))
          lookTarget.copy(selectedPoint).addScaledVector(selectedTangent, 12).add(new THREE.Vector3(0, 0.5, 0))
          camera.fov = THREE.MathUtils.lerp(camera.fov, 62, 0.08)
        } else {
          const orbitSide = side.clone().multiplyScalar(9 * Math.cos(orbitOffset))
          desiredCamera.copy(selectedPoint).addScaledVector(selectedTangent, -12).add(orbitSide).add(new THREE.Vector3(0, 7.5 + Math.abs(Math.sin(orbitOffset)) * 4, 0))
          lookTarget.copy(selectedPoint).addScaledVector(selectedTangent, 4)
          camera.fov = THREE.MathUtils.lerp(camera.fov, 47, 0.06)
        }
        camera.position.lerp(desiredCamera, 1 - Math.exp(-deltaTime * 2.8))
        camera.lookAt(lookTarget)
        camera.updateProjectionMatrix()

        const selectedDriver = driversRef.current.find((driver) => driver.id === selectedRef.current)
        const sparkActive = (selectedDriver?.speed ?? 0) > 285
        for (let index = 0; index < sparkCount; index += 1) {
          if (sparkLife[index] <= 0 && sparkActive && Math.random() < 0.05) {
            sparkLife[index] = 1
            sparkPositions[index * 3] = selectedPoint.x - selectedTangent.x * 1.1 + (Math.random() - 0.5) * 0.5
            sparkPositions[index * 3 + 1] = 0.15
            sparkPositions[index * 3 + 2] = selectedPoint.z - selectedTangent.z * 1.1 + (Math.random() - 0.5) * 0.5
          } else if (sparkLife[index] > 0) {
            sparkLife[index] -= deltaTime * 1.7
            sparkPositions[index * 3] -= selectedTangent.x * deltaTime * 5
            sparkPositions[index * 3 + 1] += deltaTime * (0.8 - sparkLife[index])
            sparkPositions[index * 3 + 2] -= selectedTangent.z * deltaTime * 5
          } else {
            sparkPositions[index * 3 + 1] = -10
          }
        }
        sparkGeometry.attributes.position.needsUpdate = true
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
      runoffGeometry.dispose()
      curbGeometry.dispose()
      roadGeometry.dispose()
      curbMap.dispose()
      runoffMaterial.dispose()
      curbMaterial.dispose()
      roadMaterial.dispose()
      sceneryMaterials.forEach((material) => material.dispose())
      sparkGeometry.dispose()
      ;(sparks.material as THREE.Material).dispose()
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [])

  return (
    <div className="race-scene-3d" ref={containerRef}>
      {webglFailed && (
        <div className="webgl-fallback">
          <strong>3D VIEW UNAVAILABLE</strong>
          <span>Switch to the circuit map to continue race control.</span>
        </div>
      )}
      <div className="scene-vignette" />
      <div className="scene-help"><span>DRAG</span> ROTATE CAMERA · TAP A CAR TO SELECT</div>
      <div className="scene-badge"><i /> LIVE 3D</div>
    </div>
  )
}
