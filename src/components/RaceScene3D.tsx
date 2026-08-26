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

function createRibbon(curve: THREE.CatmullRomCurve3, width: number, y: number, centerOffset = 0, segments = 360) {
  const positions: number[] = []
  const uvs: number[] = []
  const indices: number[] = []
  const rows: { left: THREE.Vector3; right: THREE.Vector3 }[] = []
  const up = new THREE.Vector3(0, 1, 0)
  const firstEdge = new THREE.Vector3()
  const secondEdge = new THREE.Vector3()
  const faceNormal = new THREE.Vector3()

  for (let index = 0; index <= segments; index += 1) {
    const t = index / segments
    const point = curve.getPointAt(t)
    const tangent = curve.getTangentAt(t).normalize()
    const side = new THREE.Vector3().crossVectors(up, tangent).normalize()
    const offset = side.clone().multiplyScalar(centerOffset)
    const edge = side.clone().multiplyScalar(width / 2)
    const left = point.clone().add(offset).add(edge)
    const right = point.clone().add(offset).sub(edge)
    rows.push({ left, right })
    positions.push(left.x, y, left.z, right.x, y, right.z)
    uvs.push(t * 34, 0, t * 34, 1)
  }

  // Adaptive winding: each triangle decides its own order so every face points up
  // toward the sunlight. Switchbacks can reverse the tangent, which flips the
  // original winding; checking each triangle's actual normal keeps the road visible.
  for (let index = 0; index < segments; index += 1) {
    const current = rows[index]
    const next = rows[index + 1]
    const base = index * 2
    // First triangle: current.left, next.left, current.right.
    firstEdge.copy(next.left).sub(current.left)
    secondEdge.copy(current.right).sub(current.left)
    faceNormal.crossVectors(firstEdge, secondEdge)
    if (faceNormal.y >= 0) {
      indices.push(base, base + 2, base + 1)
    } else {
      indices.push(base, base + 1, base + 2)
    }
    // Second triangle: next.left, next.right, current.right.
    firstEdge.copy(next.right).sub(next.left)
    secondEdge.copy(current.right).sub(next.left)
    faceNormal.crossVectors(firstEdge, secondEdge)
    if (faceNormal.y >= 0) {
      indices.push(base + 2, base + 3, base + 1)
    } else {
      indices.push(base + 2, base + 1, base + 3)
    }
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
  geometry.setIndex(indices)
  geometry.computeVertexNormals()
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
    context.fillStyle = '#4ba55c'
    context.fillRect(0, 0, 128, 128)
    context.fillStyle = '#41955222'
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
      context.fillStyle = index % 2 === 0 ? '#f6f8f9' : '#e0293c'
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
        context.fillStyle = (column + row) % 2 === 0 ? '#f2f5f6' : '#15181c'
        context.fillRect(column * 16, row * 16, 16, 16)
      }
    }
  })
}

function crowdTexture() {
  return canvasTexture(128, 64, (context) => {
    context.fillStyle = '#39424c'
    context.fillRect(0, 0, 128, 64)
    const palette = ['#d8dee4', '#e2b23c', '#c74b45', '#4d94c9', '#57b378', '#a77bd6', '#e07e4f']
    for (let index = 0; index < 620; index += 1) {
      context.fillStyle = palette[index % palette.length]
      context.globalAlpha = 0.35 + (index % 5) * 0.14
      context.fillRect((index * 37) % 126, (index * 23) % 62, 2, 2)
    }
    context.globalAlpha = 1
  })
}

function addScenery(scene: THREE.Scene) {
  const unitBox = new THREE.BoxGeometry(1, 1, 1)
  const unitCylinder = new THREE.CylinderGeometry(1, 1, 1, 10)
  const unitCone = new THREE.ConeGeometry(1, 1, 8)

  const wallMaterial = new THREE.MeshStandardMaterial({ color: '#dbe2e8', roughness: 0.85 })
  const roofMaterial = new THREE.MeshStandardMaterial({ color: '#8e99a3', roughness: 0.7, metalness: 0.25 })
  const glassMaterial = new THREE.MeshStandardMaterial({ color: '#8fc3e3', roughness: 0.18, metalness: 0.55, emissive: '#2c5a78', emissiveIntensity: 0.18 })
  const standMaterial = new THREE.MeshStandardMaterial({ color: '#5c6873', roughness: 0.85 })
  const crowdMap = crowdTexture()
  const crowdMaterial = new THREE.MeshBasicMaterial({ map: crowdMap })
  const trunkMaterial = new THREE.MeshStandardMaterial({ color: '#7a5a3a', roughness: 1 })
  const leafMaterial = new THREE.MeshStandardMaterial({ color: '#2e8f4e', roughness: 0.95 })

  // Pit complex along the top straight
  const pitBuilding = new THREE.Group()
  for (let index = 0; index < 8; index += 1) {
    const unit = new THREE.Mesh(unitBox, wallMaterial)
    unit.scale.set(4.2, 2.6, 5.0)
    unit.position.set(-29 + index * 4.3, 1.3, 40)
    unit.castShadow = true
    unit.receiveShadow = true
    pitBuilding.add(unit)
    const windowBand = new THREE.Mesh(unitBox, glassMaterial)
    windowBand.scale.set(3.5, 0.9, 0.1)
    windowBand.position.set(-29 + index * 4.3, 1.7, 37.48)
    pitBuilding.add(windowBand)
    const roof = new THREE.Mesh(unitBox, roofMaterial)
    roof.scale.set(4.4, 0.22, 5.2)
    roof.position.set(-29 + index * 4.3, 2.72, 40)
    pitBuilding.add(roof)
  }
  scene.add(pitBuilding)

  // Grandstands with crowd texture facing the track
  const standLocations: [number, number, number, number][] = [
    [38, 0, 18, -0.55], [-25, 0, -29, 0.18], [22, 0, -23, -0.35],
  ]
  standLocations.forEach(([x, , z, rotation]) => {
    const stand = new THREE.Group()
    for (let tier = 0; tier < 4; tier += 1) {
      const block = new THREE.Mesh(unitBox, standMaterial)
      block.scale.set(15, 0.7, 2.4)
      block.position.set(0, 0.35 + tier * 0.75, -tier * 0.9)
      block.castShadow = true
      stand.add(block)
      const crowd = new THREE.Mesh(unitBox, crowdMaterial)
      crowd.scale.set(14.6, 0.62, 0.12)
      crowd.position.set(0, 0.38 + tier * 0.75, -tier * 0.9 + 1.26)
      stand.add(crowd)
    }
    const roof = new THREE.Mesh(unitBox, roofMaterial)
    roof.scale.set(15.6, 0.2, 5)
    roof.position.set(0, 4.1, -1.4)
    stand.add(roof)
    stand.position.set(x, 0, z)
    stand.rotation.y = rotation
    scene.add(stand)
  })

  // Tree line around the venue
  for (let index = 0; index < 46; index += 1) {
    const angle = index * 2.399
    const radius = 50 + (index % 7) * 2.9
    const tree = new THREE.Group()
    const trunk = new THREE.Mesh(unitCylinder, trunkMaterial)
    trunk.scale.set(0.26, 2.4, 0.26)
    trunk.position.y = 1.2
    tree.add(trunk)
    const leaves = new THREE.Mesh(unitCone, leafMaterial)
    leaves.scale.set(1.5, 4.0, 1.5)
    leaves.position.y = 3.6
    leaves.castShadow = true
    tree.add(leaves)
    tree.position.set(Math.cos(angle) * radius, 0, Math.sin(angle) * radius)
    scene.add(tree)
  }

  return {
    materials: [wallMaterial, roofMaterial, glassMaterial, standMaterial, crowdMaterial, trunkMaterial, leafMaterial],
    textures: [crowdMap],
    geometries: [unitBox, unitCylinder, unitCone],
  }
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
      renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' })
    } catch {
      setWebglFailed(true)
      return
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6))
    renderer.setSize(container.clientWidth, container.clientHeight)
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.16
    renderer.shadowMap.enabled = window.innerWidth > 760
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.domElement.className = 'race-3d-canvas'
    renderer.domElement.style.touchAction = 'none'
    container.appendChild(renderer.domElement)

    // Bright broadcast daylight
    const scene = new THREE.Scene()
    scene.background = new THREE.Color('#a9cdf0')
    scene.fog = new THREE.FogExp2('#bcd8ef', 0.0026)

    const camera = new THREE.PerspectiveCamera(46, container.clientWidth / Math.max(1, container.clientHeight), 0.1, 320)
    camera.position.set(0, 48, 66)

    const hemisphere = new THREE.HemisphereLight('#e8f4ff', '#5a8f62', 1.05)
    scene.add(hemisphere)
    const sun = new THREE.DirectionalLight('#fff5e2', 2.9)
    sun.position.set(-34, 60, 26)
    sun.castShadow = true
    sun.shadow.mapSize.set(1024, 1024)
    sun.shadow.camera.left = -75
    sun.shadow.camera.right = 75
    sun.shadow.camera.top = 75
    sun.shadow.camera.bottom = -75
    sun.shadow.bias = -0.0004
    scene.add(sun)
    const rimLight = new THREE.DirectionalLight('#cfe3ff', 0.5)
    rimLight.position.set(40, 18, -40)
    scene.add(rimLight)

    // Mown-grass infield and runoff
    const grassMap = grassTexture()
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(260, 200),
      new THREE.MeshStandardMaterial({ map: grassMap, roughness: 1, metalness: 0 }),
    )
    ground.rotation.x = -Math.PI / 2
    ground.position.y = -0.32
    ground.receiveShadow = true
    scene.add(ground)

    const curve = new THREE.CatmullRomCurve3(TRACK_POINTS, true, 'centripetal', 0.35)
    const runoffGeometry = createRibbon(curve, 14.2, -0.02)
    const curbGeometry = createRibbon(curve, 12.3, 0.02)
    const roadGeometry = createRibbon(curve, 9.4, 0.06)
    const leftLineGeometry = createRibbon(curve, 0.22, 0.085, -4.32)
    const rightLineGeometry = createRibbon(curve, 0.22, 0.085, 4.32)
    const rubberGeometry = createRibbon(curve, 3.6, 0.09)

    const runoffMaterial = new THREE.MeshStandardMaterial({ color: '#b6bec5', roughness: 0.95, side: THREE.DoubleSide })
    const curbMap = curbTexture()
    curbMap.repeat.set(9, 1)
    const curbMaterial = new THREE.MeshStandardMaterial({ map: curbMap, roughness: 0.7, side: THREE.DoubleSide })
    const roadMaterial = new THREE.MeshStandardMaterial({ color: '#5a6169', roughness: 0.92, side: THREE.DoubleSide })
    const lineMaterial = new THREE.MeshBasicMaterial({ color: '#f2f6f8', side: THREE.DoubleSide })
    const rubberMaterial = new THREE.MeshStandardMaterial({ color: '#41484f', roughness: 1, side: THREE.DoubleSide })

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
      new THREE.MeshBasicMaterial({ color: '#ff7a18', transparent: true, opacity: 0.95, side: THREE.DoubleSide }),
    )
    selectionRing.rotation.x = -Math.PI / 2
    selectionRing.position.y = 0.12
    scene.add(selectionRing)

    const sparkCount = 42
    const sparkPositions = new Float32Array(sparkCount * 3)
    const sparkLife = new Float32Array(sparkCount)
    const sparkGeometry = new THREE.BufferGeometry()
    sparkGeometry.setAttribute('position', new THREE.BufferAttribute(sparkPositions, 3))
    const sparks = new THREE.Points(
      sparkGeometry,
      new THREE.PointsMaterial({ color: '#ffb547', size: 0.14, transparent: true, opacity: 0.9, depthWrite: false }),
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
        car.position.set(point.x, 0.07, point.z)
        car.rotation.y = Math.atan2(tangent.x, tangent.z)
        car.rotation.z = Math.sin(elapsed * 8 + index) * 0.006
        car.children.forEach((child) => {
          if (child.userData.isWheel) child.rotation.x -= deltaTime * Math.max(4, driver.speed * 0.08)
        })
        if (driver.id === selectedRef.current) {
          selectedPoint = point.clone()
          selectedTangent = tangent.clone()
        }
      })

      if (selectedPoint && selectedTangent) {
        selectionRing.position.x = selectedPoint.x
        selectionRing.position.z = selectedPoint.z
        selectionRing.scale.setScalar(1 + Math.sin(elapsed * 4) * 0.12)
        selectionRing.rotation.z += deltaTime * 0.7
        side.set(-selectedTangent.z, 0, selectedTangent.x)

        if (cameraModeRef.current === 'onboard') {
          desiredCamera.copy(selectedPoint).addScaledVector(selectedTangent, -3.2).add(new THREE.Vector3(0, 1.7, 0))
          lookTarget.copy(selectedPoint).addScaledVector(selectedTangent, 14).add(new THREE.Vector3(0, 0.6, 0))
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

        const selectedDriver = driversRef.current.find((driver) => driver.id === selectedRef.current)
        const sparkActive = (selectedDriver?.speed ?? 0) > 285
        for (let index = 0; index < sparkCount; index += 1) {
          if (sparkLife[index] <= 0 && sparkActive && Math.random() < 0.05) {
            sparkLife[index] = 1
            sparkPositions[index * 3] = selectedPoint.x - selectedTangent.x * 1.2 + (Math.random() - 0.5) * 0.5
            sparkPositions[index * 3 + 1] = 0.18
            sparkPositions[index * 3 + 2] = selectedPoint.z - selectedTangent.z * 1.2 + (Math.random() - 0.5) * 0.5
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
      leftLineGeometry.dispose()
      rightLineGeometry.dispose()
      rubberGeometry.dispose()
      ground.geometry.dispose()
      grassMap.dispose()
      curbMap.dispose()
      startMap.dispose()
      startLine.geometry.dispose()
      ;(startLine.material as THREE.Material).dispose()
      runoffMaterial.dispose()
      curbMaterial.dispose()
      roadMaterial.dispose()
      lineMaterial.dispose()
      rubberMaterial.dispose()
      ;(ground.material as THREE.Material).dispose()
      scenery.materials.forEach((material) => material.dispose())
      scenery.textures.forEach((texture) => texture.dispose())
      scenery.geometries.forEach((geometry) => geometry.dispose())
      selectionRing.geometry.dispose()
      ;(selectionRing.material as THREE.Material).dispose()
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
