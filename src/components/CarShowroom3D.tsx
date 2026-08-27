import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { createF1Car2026, type F1Car2026Controller } from '../graphics/f1_2026/F1Car2026Model'
import type { CarPartMetadata, SubsystemCategory } from '../graphics/f1_2026/carPartsData'
import { soundEngine } from '../services/soundEngine'

export type SmokeWandMode = 'OFF' | 'ALL' | 'FRONT_WING' | 'AIRBOX' | 'FLOOR'
export type CameraPreset = 'ORBIT' | 'FRONT_WING' | 'COCKPIT' | 'POWERTRAIN' | 'DIFFUSER'

export interface TelemetrySyncState {
  active: boolean
  speedKmh: number
  rpm: number
  gear: number
  throttle: number
  brake: number
  ersMode: 'DEPLOY' | 'HARVEST' | 'NEUTRAL'
  ersPowerKw: number
  frontHeaveMm: number
  rearHeaveMm: number
}

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
  flirMode?: boolean
  smokeWandMode?: SmokeWandMode
  cameraPreset?: CameraPreset
  isWindAudioActive?: boolean
  telemetrySync?: TelemetrySyncState
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
  flirMode = false,
  smokeWandMode = 'OFF',
  cameraPreset = 'ORBIT',
  isWindAudioActive = false,
  telemetrySync,
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
    flirMode,
    smokeWandMode,
    cameraPreset,
    isWindAudioActive,
    telemetrySync,
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
    flirMode,
    smokeWandMode,
    cameraPreset,
    isWindAudioActive,
    telemetrySync,
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
      if (flirMode) {
        carControllerRef.current.setFlirMode(true)
      } else if (cfdHeatmapMode) {
        carControllerRef.current.setCfdHeatmapMode(true, activeAeroMode)
      } else {
        carControllerRef.current.setCfdHeatmapMode(false)
        carControllerRef.current.setFlirMode(false)
      }
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
    flirMode,
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
    renderer.localClippingEnabled = true
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

    // Turntable
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
    if (valuesRef.current.flirMode) {
      carController.setFlirMode(true)
    } else if (valuesRef.current.cfdHeatmapMode) {
      carController.setCfdHeatmapMode(true, valuesRef.current.activeAeroMode)
    }

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

    // Downforce load arrows
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

    // Ambient Airflow Particles
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

    // Multi-Nozzle Smoke Streamlines Wand Particles
    const smokeCount = 380
    const smokePositions = new Float32Array(smokeCount * 3)
    const smokeOffsets = new Float32Array(smokeCount * 3)
    const smokeWandIds = new Float32Array(smokeCount)

    for (let i = 0; i < smokeCount; i++) {
      const wand = i % 5
      smokeWandIds[i] = wand
      const progress = (i / smokeCount) * 6.5
      let x = 0
      let y = 0.5
      if (wand === 0) { x = -0.55; y = 0.22 }
      else if (wand === 1) { x = 0.55; y = 0.22 }
      else if (wand === 2) { x = 0; y = 0.85 }
      else if (wand === 3) { x = -0.42; y = 0.12 }
      else if (wand === 4) { x = 0.42; y = 0.12 }

      smokePositions[i * 3] = x
      smokePositions[i * 3 + 1] = y
      smokePositions[i * 3 + 2] = 2.8 - progress
      smokeOffsets[i * 3] = (Math.random() - 0.5) * 0.04
      smokeOffsets[i * 3 + 1] = (Math.random() - 0.5) * 0.04
      smokeOffsets[i * 3 + 2] = Math.random()
    }

    const smokeGeometry = new THREE.BufferGeometry()
    smokeGeometry.setAttribute('position', new THREE.BufferAttribute(smokePositions, 3))
    const smokeMaterial = new THREE.PointsMaterial({
      color: '#e2f8ff',
      size: 0.075,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
    const smokePoints = new THREE.Points(smokeGeometry, smokeMaterial)
    carPivot.add(smokePoints)

    // Raycasting
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

    const currentLookTarget = new THREE.Vector3(0, 0.5, 0)
    const desiredLookTarget = new THREE.Vector3(0, 0.5, 0)
    const desiredCameraPos = new THREE.Vector3(8.2, 4.6, 9.2)

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
      const currentSync = valuesRef.current.telemetrySync
      const currentPreset = valuesRef.current.cameraPreset

      // Camera preset targets
      if (currentPreset === 'FRONT_WING') {
        desiredCameraPos.set(0, 1.4, 4.4)
        desiredLookTarget.set(0, 0.25, 1.8)
      } else if (currentPreset === 'COCKPIT') {
        desiredCameraPos.set(0, 1.6, 1.5)
        desiredLookTarget.set(0, 0.52, 0.3)
      } else if (currentPreset === 'POWERTRAIN') {
        desiredCameraPos.set(2.4, 2.6, -0.6)
        desiredLookTarget.set(0, 0.42, -0.6)
      } else if (currentPreset === 'DIFFUSER') {
        desiredCameraPos.set(0, 1.1, -4.5)
        desiredLookTarget.set(0, 0.48, -1.8)
      } else {
        // 'ORBIT'
        desiredCameraPos.set(8.2, 4.6, 9.2).multiplyScalar(targetCameraDistance)
        desiredLookTarget.set(0, 0.5, 0)
      }

      if (
        !dragging &&
        valuesRef.current.explodedRatio < 0.05 &&
        valuesRef.current.clippingAxis === 'NONE' &&
        !currentSync?.active &&
        currentPreset === 'ORBIT'
      ) {
        targetRotation += delta * 0.12
      }
      carPivot.rotation.y = THREE.MathUtils.lerp(carPivot.rotation.y, targetRotation, 0.08)
      carPivot.position.y = valuesRef.current.porpoising ? Math.sin(elapsed * 35) * 0.045 : Math.sin(elapsed * 1.3) * 0.008
      floorGlowMaterial.color.set(valuesRef.current.porpoising ? '#ff3f42' : primaryColor)
      floorGlowMaterial.opacity = valuesRef.current.porpoising ? 0.32 + Math.sin(elapsed * 10) * 0.08 : 0.14
      glowRing.rotation.z += delta * 0.18

      // Update car internal kinematics
      carController.update(delta)

      // Handle Telemetry Synchronized Playback
      if (currentSync?.active) {
        const speedMs = currentSync.speedKmh / 3.6
        const radDelta = (speedMs / 0.35) * delta
        carController.spinWheels(radDelta)
        carController.setSuspensionCompression(currentSync.frontHeaveMm / 1000, currentSync.rearHeaveMm / 1000)
        carController.setEnergyFlow(currentSync.ersMode, currentSync.ersPowerKw)

        // Update wind tunnel sound
        if (valuesRef.current.isWindAudioActive) {
          soundEngine.updateWindTunnel(currentSync.speedKmh, valuesRef.current.activeAeroMode, true)
        }
      } else if (valuesRef.current.isWindAudioActive) {
        soundEngine.updateWindTunnel(180, valuesRef.current.activeAeroMode, true)
      } else {
        soundEngine.updateWindTunnel(0, 'CORNER', false)
      }

      // Aero load vectors
      arrows.forEach((arrow, index) => {
        const frontWeight = index > 1 ? valuesRef.current.frontBalance / 50 : (100 - valuesRef.current.frontBalance) / 50
        arrow.scale.y = 0.65 + frontWeight * valuesRef.current.downforceKn * 0.025
        arrow.position.y = 2.2 + Math.sin(elapsed * 2.4 + index) * 0.13
      })

      // Airflow streamline speed
      const flowSpeedMult = valuesRef.current.activeAeroMode === 'STRAIGHT' ? 1.45 : 1.0
      for (let index = 0; index < airflowCount; index += 1) {
        airflowPositions[index * 3 + 2] += airflowSpeeds[index] * flowSpeedMult * delta
        if (airflowPositions[index * 3 + 2] > 7) airflowPositions[index * 3 + 2] = -7
      }
      airflowGeometry.attributes.position.needsUpdate = true

      // Wind Tunnel Smoke Wand Streamlines
      const wandMode = valuesRef.current.smokeWandMode
      smokePoints.visible = wandMode !== 'OFF'
      if (wandMode !== 'OFF') {
        const smokeSpeed = (valuesRef.current.activeAeroMode === 'STRAIGHT' ? 5.5 : 4.0) * delta
        for (let i = 0; i < smokeCount; i++) {
          const wand = smokeWandIds[i]
          let active = true
          if (wandMode === 'FRONT_WING' && wand !== 0 && wand !== 1) active = false
          if (wandMode === 'AIRBOX' && wand !== 2) active = false
          if (wandMode === 'FLOOR' && wand !== 3 && wand !== 4) active = false

          if (!active) {
            smokePositions[i * 3 + 1] = -50
            continue
          }

          smokePositions[i * 3 + 2] -= smokeSpeed
          const z = smokePositions[i * 3 + 2]
          if (wand === 0 || wand === 1) {
            if (z < 2.0 && z > 0.8) {
              smokePositions[i * 3 + 1] += 0.04 * delta
              smokePositions[i * 3] += (wand === 0 ? -0.06 : 0.06) * delta
            }
          } else if (wand === 2) {
            if (z < 0.5 && z > -1.2) {
              smokePositions[i * 3 + 1] -= 0.02 * delta
            } else if (z <= -1.8) {
              smokePositions[i * 3 + 1] += 0.08 * delta
            }
          } else if (wand === 3 || wand === 4) {
            if (z < -1.0) {
              smokePositions[i * 3 + 1] += 0.06 * delta
            }
          }

          if (smokePositions[i * 3 + 2] < -3.2) {
            smokePositions[i * 3 + 2] = 2.8
            if (wand === 0) { smokePositions[i * 3] = -0.55; smokePositions[i * 3 + 1] = 0.22 }
            else if (wand === 1) { smokePositions[i * 3] = 0.55; smokePositions[i * 3 + 1] = 0.22 }
            else if (wand === 2) { smokePositions[i * 3] = 0; smokePositions[i * 3 + 1] = 0.85 }
            else if (wand === 3) { smokePositions[i * 3] = -0.42; smokePositions[i * 3 + 1] = 0.12 }
            else if (wand === 4) { smokePositions[i * 3] = 0.42; smokePositions[i * 3 + 1] = 0.12 }
          }
        }
        smokeGeometry.attributes.position.needsUpdate = true
      }

      camera.position.lerp(desiredCameraPos, 0.06)
      currentLookTarget.lerp(desiredLookTarget, 0.06)
      camera.lookAt(currentLookTarget)
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
      smokeGeometry.dispose()
      smokeMaterial.dispose()
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [primaryColor, accentColor, onSelectPart])

  const currentSync = telemetrySync

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
          : flirMode
            ? 'FLIR THERMAL INFRARED CAMERA VIEW (IRONBOW PALETTE)'
            : cfdHeatmapMode
              ? 'CFD SURFACE PRESSURE DISTRIBUTION (+Cp RED / -Cp PURPLE)'
              : smokeWandMode !== 'OFF'
                ? `WIND TUNNEL SMOKE WAND: ${smokeWandMode} STREAMLINES`
                : cameraPreset !== 'ORBIT'
                  ? `CAMERA VIEWPORT: ${cameraPreset} FOCUS`
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

      {/* Real-Time Live Telemetry HUD Overlay */}
      {currentSync?.active && (
        <div className="showroom-telemetry-hud">
          <div className="hud-gear-badge">
            <span>GEAR</span>
            <strong>{currentSync.gear > 0 ? currentSync.gear : 'N'}</strong>
          </div>
          <div className="hud-metric">
            <small>SPEED</small>
            <b>{Math.round(currentSync.speedKmh)} <abbr>KM/H</abbr></b>
          </div>
          <div className="hud-metric">
            <small>ICE RPM</small>
            <b>{Math.round(currentSync.rpm)}</b>
          </div>
          <div className="hud-metric">
            <small>THROTTLE / BRAKE</small>
            <div className="hud-pedal-bars">
              <div className="pedal-bar throttle" style={{ width: `${currentSync.throttle * 100}%` }} />
              <div className="pedal-bar brake" style={{ width: `${currentSync.brake * 100}%` }} />
            </div>
          </div>
          <div className="hud-metric">
            <small>350kW MGU-K FLOW</small>
            <b className={currentSync.ersMode === 'DEPLOY' ? 'flow-deploy' : currentSync.ersMode === 'HARVEST' ? 'flow-harvest' : ''}>
              {currentSync.ersMode === 'DEPLOY'
                ? `⚡ ${Math.round(currentSync.ersPowerKw)} kW DEPLOY`
                : currentSync.ersMode === 'HARVEST'
                  ? `🔋 8.5 MJ REGEN`
                  : 'NEUTRAL'}
            </b>
          </div>
        </div>
      )}
    </div>
  )
}
