import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { createF1Car2026, type F1Car2026Controller } from '../graphics/f1_2026/F1Car2026Model'
import type { CarPartMetadata, SubsystemCategory } from '../graphics/f1_2026/carPartsData'

interface CarShowroom3DProps {
  primaryColor: string
  accentColor: string
  frontBalance: number
  downforceKn: number
  porpoising: boolean
  explodedRatio?: number
  explodeTarget?: 'ALL' | SubsystemCategory
  activeAeroMode?: 'CORNER' | 'STRAIGHT'
  subsystemFilter?: 'ALL' | SubsystemCategory
  wireframeMode?: boolean
  clippingAxis?: 'NONE' | 'X' | 'Y' | 'Z'
  clippingOffset?: number
  cfdHeatmapMode?: boolean
  onSelectPart?: (part: CarPartMetadata | null) => void
}

export function CarShowroom3D({
  primaryColor,
  accentColor,
  frontBalance,
  downforceKn,
  porpoising,
  explodedRatio = 0,
  explodeTarget = 'ALL',
  activeAeroMode = 'CORNER',
  subsystemFilter = 'ALL',
  wireframeMode = false,
  clippingAxis = 'NONE',
  clippingOffset = 0,
  cfdHeatmapMode = false,
  onSelectPart,
}: CarShowroom3DProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const valuesRef = useRef({
    frontBalance,
    downforceKn,
    porpoising,
    explodedRatio,
    explodeTarget,
    activeAeroMode,
    subsystemFilter,
    wireframeMode,
    clippingAxis,
    clippingOffset,
    cfdHeatmapMode,
  })
  valuesRef.current = {
    frontBalance,
    downforceKn,
    porpoising,
    explodedRatio,
    explodeTarget,
    activeAeroMode,
    subsystemFilter,
    wireframeMode,
    clippingAxis,
    clippingOffset,
    cfdHeatmapMode,
  }

  const carControllerRef = useRef<F1Car2026Controller | null>(null)

  // Sync prop changes to car controller
  useEffect(() => {
    if (carControllerRef.current) {
      carControllerRef.current.setExplodedRatio(explodedRatio, explodeTarget)
      carControllerRef.current.setAeroMode(activeAeroMode)
      carControllerRef.current.setSubsystemFilter(subsystemFilter)
      carControllerRef.current.setWireframeMode(wireframeMode)
      carControllerRef.current.setClippingPlane(clippingAxis, clippingOffset)
      carControllerRef.current.setCfdHeatmapMode(cfdHeatmapMode, activeAeroMode)
    }
  }, [
    explodedRatio,
    explodeTarget,
    activeAeroMode,
    subsystemFilter,
    wireframeMode,
    clippingAxis,
    clippingOffset,
    cfdHeatmapMode,
  ])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8))
    renderer.setSize(container.clientWidth, container.clientHeight)
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.25
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.localClippingEnabled = true // Enable CAD cross-section cutting planes
    renderer.domElement.className = 'showroom-3d-canvas'
    renderer.domElement.style.touchAction = 'none'
    container.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(38, container.clientWidth / Math.max(1, container.clientHeight), 0.1, 100)
    camera.position.set(8.2, 4.6, 9.2)
    camera.lookAt(0, 0.5, 0)

    scene.add(new THREE.HemisphereLight('#d8eeff', '#14181f', 1.9))
    const keyLight = new THREE.DirectionalLight('#fff5e6', 4.5)
    keyLight.position.set(-5, 9, 6)
    keyLight.castShadow = true
    keyLight.shadow.mapSize.set(1024, 1024)
    scene.add(keyLight)

    const teamGlowLight = new THREE.PointLight(primaryColor, 20, 18)
    teamGlowLight.position.set(5, 2.5, -4)
    scene.add(teamGlowLight)

    const cyanRim = new THREE.PointLight('#4de8cf', 14, 16)
    cyanRim.position.set(-5, 2.5, -3)
    scene.add(cyanRim)

    // Circular Presentation Turntable
    const platformMaterial = new THREE.MeshStandardMaterial({ color: '#11151a', roughness: 0.28, metalness: 0.65 })
    const platform = new THREE.Mesh(new THREE.CylinderGeometry(4.8, 5.15, 0.36, 64), platformMaterial)
    platform.position.y = -0.2
    platform.receiveShadow = true
    scene.add(platform)

    const ringMaterial = new THREE.MeshBasicMaterial({ color: primaryColor, transparent: true, opacity: 0.75, side: THREE.DoubleSide })
    const glowRing = new THREE.Mesh(new THREE.RingGeometry(3.7, 3.76, 96), ringMaterial)
    glowRing.rotation.x = -Math.PI / 2
    glowRing.position.y = 0.005
    scene.add(glowRing)

    const carPivot = new THREE.Group()
    carPivot.rotation.y = -0.52
    scene.add(carPivot)

    // 2026 Modular F1 Car Controller
    const carController = createF1Car2026(primaryColor, accentColor)
    carControllerRef.current = carController
    const car = carController.root
    car.scale.setScalar(1.2)
    car.position.y = 0.22
    car.rotation.y = Math.PI / 2
    carPivot.add(car)

    // Apply initial state
    carController.setExplodedRatio(valuesRef.current.explodedRatio, valuesRef.current.explodeTarget)
    carController.setAeroMode(valuesRef.current.activeAeroMode)
    carController.setSubsystemFilter(valuesRef.current.subsystemFilter)
    carController.setWireframeMode(valuesRef.current.wireframeMode)
    carController.setClippingPlane(valuesRef.current.clippingAxis, valuesRef.current.clippingOffset)
    carController.setCfdHeatmapMode(valuesRef.current.cfdHeatmapMode, valuesRef.current.activeAeroMode)

    const floorGlowMaterial = new THREE.MeshBasicMaterial({
      color: valuesRef.current.porpoising ? '#ff3f42' : primaryColor,
      transparent: true,
      opacity: 0.16,
      side: THREE.DoubleSide,
    })
    const floorGlow = new THREE.Mesh(new THREE.PlaneGeometry(5.4, 2.2), floorGlowMaterial)
    floorGlow.rotation.x = -Math.PI / 2
    floorGlow.rotation.z = Math.PI / 2
    floorGlow.position.y = 0.03
    carPivot.add(floorGlow)

    // Aero downforce load arrows
    const arrowMaterial = new THREE.MeshStandardMaterial({ color: '#4ce2c2', emissive: '#1f8d7b', emissiveIntensity: 0.8 })
    const arrowGeometry = new THREE.ConeGeometry(0.12, 0.4, 10)
    const arrows: THREE.Mesh[] = []
    ;[-1.7, -0.7, 0.4, 1.5].forEach((z, index) => {
      const arrow = new THREE.Mesh(arrowGeometry, arrowMaterial)
      arrow.position.set(index % 2 === 0 ? -0.72 : 0.72, 2.35, z)
      arrow.rotation.x = Math.PI
      carPivot.add(arrow)
      arrows.push(arrow)
    })

    // Wind Tunnel Airflow Streamline Particles
    const airflowCount = 120
    const airflowPositions = new Float32Array(airflowCount * 3)
    const airflowSpeeds = new Float32Array(airflowCount)
    for (let index = 0; index < airflowCount; index += 1) {
      airflowPositions[index * 3] = (Math.random() - 0.5) * 8.5
      airflowPositions[index * 3 + 1] = 0.25 + Math.random() * 2.5
      airflowPositions[index * 3 + 2] = -7 + Math.random() * 14
      airflowSpeeds[index] = 3.2 + Math.random() * 4.2
    }
    const airflowGeometry = new THREE.BufferGeometry()
    airflowGeometry.setAttribute('position', new THREE.BufferAttribute(airflowPositions, 3))
    const airflowMaterial = new THREE.PointsMaterial({ color: '#65daca', size: 0.045, transparent: true, opacity: 0.6, depthWrite: false })
    const airflow = new THREE.Points(airflowGeometry, airflowMaterial)
    airflow.rotation.y = Math.PI / 2
    scene.add(airflow)

    // Raycasting for Part Selection & Inspection
    const raycaster = new THREE.Raycaster()
    const mouse = new THREE.Vector2()

    const clock = new THREE.Clock()
    let animationFrame = 0
    let dragging = false
    let pointerX = 0
    let pointerY = 0
    let movedSinceDown = false
    let targetRotation = carPivot.rotation.y
    let targetCameraDistance = 1

    const onPointerDown = (event: PointerEvent) => {
      dragging = true
      movedSinceDown = false
      pointerX = event.clientX
      pointerY = event.clientY
      renderer.domElement.setPointerCapture(event.pointerId)
    }

    const onPointerMove = (event: PointerEvent) => {
      if (dragging) {
        const dx = event.clientX - pointerX
        const dy = event.clientY - pointerY
        if (Math.abs(dx) > 3 || Math.abs(dy) > 3) movedSinceDown = true
        targetRotation += dx * 0.008
        pointerX = event.clientX
        pointerY = event.clientY
      }
    }

    const onPointerUp = (event: PointerEvent) => {
      dragging = false
      if (!movedSinceDown && onSelectPart) {
        const rect = renderer.domElement.getBoundingClientRect()
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
        raycaster.setFromCamera(mouse, camera)

        const intersects = raycaster.intersectObjects(car.children, true)
        if (intersects.length > 0) {
          const hit = intersects[0].object
          const metadata = hit.userData?.metadata as CarPartMetadata | undefined
          if (metadata) {
            onSelectPart(metadata)
            return
          }
        }
        onSelectPart(null)
      }
    }

    const onWheel = (event: WheelEvent) => {
      event.preventDefault()
      targetCameraDistance = THREE.MathUtils.clamp(targetCameraDistance + event.deltaY * 0.0008, 0.72, 1.35)
    }

    renderer.domElement.addEventListener('pointerdown', onPointerDown)
    renderer.domElement.addEventListener('pointermove', onPointerMove)
    renderer.domElement.addEventListener('pointerup', onPointerUp)
    renderer.domElement.addEventListener('wheel', onWheel, { passive: false })

    const animate = () => {
      animationFrame = requestAnimationFrame(animate)
      const delta = Math.min(0.04, clock.getDelta())
      const elapsed = clock.elapsedTime

      if (!dragging && valuesRef.current.explodedRatio < 0.05 && valuesRef.current.clippingAxis === 'NONE') {
        targetRotation += delta * 0.12
      }
      carPivot.rotation.y = THREE.MathUtils.lerp(carPivot.rotation.y, targetRotation, 0.08)
      carPivot.position.y = valuesRef.current.porpoising ? Math.sin(elapsed * 35) * 0.045 : Math.sin(elapsed * 1.3) * 0.008
      floorGlowMaterial.color.set(valuesRef.current.porpoising ? '#ff3f42' : primaryColor)
      floorGlowMaterial.opacity = valuesRef.current.porpoising ? 0.32 + Math.sin(elapsed * 10) * 0.08 : 0.14
      glowRing.rotation.z += delta * 0.18

      // Update car internal kinematics
      carController.update(delta)

      // Aero load vectors
      arrows.forEach((arrow, index) => {
        const frontWeight = index > 1 ? valuesRef.current.frontBalance / 50 : (100 - valuesRef.current.frontBalance) / 50
        arrow.scale.y = 0.65 + frontWeight * valuesRef.current.downforceKn * 0.025
        arrow.position.y = 2.2 + Math.sin(elapsed * 2.4 + index) * 0.13
      })

      // Airflow streamline speed scales with Straight Mode
      const flowSpeedMult = valuesRef.current.activeAeroMode === 'STRAIGHT' ? 1.45 : 1.0
      for (let index = 0; index < airflowCount; index += 1) {
        airflowPositions[index * 3 + 2] += airflowSpeeds[index] * flowSpeedMult * delta
        if (airflowPositions[index * 3 + 2] > 7) airflowPositions[index * 3 + 2] = -7
      }
      airflowGeometry.attributes.position.needsUpdate = true

      const baseCamera = new THREE.Vector3(8.2, 4.6, 9.2).multiplyScalar(targetCameraDistance)
      camera.position.lerp(baseCamera, 0.06)
      camera.lookAt(0, 0.5, 0)
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
      renderer.domElement.removeEventListener('pointerdown', onPointerDown)
      renderer.domElement.removeEventListener('pointermove', onPointerMove)
      renderer.domElement.removeEventListener('pointerup', onPointerUp)
      renderer.domElement.removeEventListener('wheel', onWheel)
      carController.dispose()
      platform.geometry.dispose()
      platformMaterial.dispose()
      glowRing.geometry.dispose()
      ringMaterial.dispose()
      floorGlow.geometry.dispose()
      floorGlowMaterial.dispose()
      arrowGeometry.dispose()
      arrowMaterial.dispose()
      airflowGeometry.dispose()
      airflowMaterial.dispose()
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [primaryColor, accentColor, onSelectPart])

  return (
    <div className="car-showroom-3d" ref={containerRef}>
      <div className="showroom-grid" />
      <div className="showroom-title">
        <span>2026 SPECIFICATION · MODULAR CAD</span>
        <b>FIA NIMBLE CAR ARCHITECTURE</b>
      </div>
      <div className="showroom-help">
        {clippingAxis !== 'NONE'
          ? `CROSS-SECTION CUT: AXIS ${clippingAxis} (${clippingOffset > 0 ? '+' : ''}${clippingOffset.toFixed(2)}m)`
          : cfdHeatmapMode
            ? 'CFD SURFACE PRESSURE DISTRIBUTION (+Cp RED / -Cp PURPLE)'
            : 'DRAG TO ROTATE · SCROLL TO ZOOM · CLICK ANY PART TO INSPECT'}
      </div>
      <div className="showroom-stat front">
        <small>AERO BALANCE</small>
        <b>{frontBalance.toFixed(1)}%</b>
      </div>
      <div className="showroom-stat load">
        <small>TOTAL DOWNFORCE</small>
        <b>{downforceKn.toFixed(1)} kN</b>
      </div>
    </div>
  )
}
