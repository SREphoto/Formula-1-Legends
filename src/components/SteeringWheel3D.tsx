import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import {
  createF1SteeringWheel,
  type F1SteeringWheelController,
  type WheelTelemetryData,
} from '../graphics/steering_wheel/F1SteeringWheelModel'
import {
  type WheelControlMetadata,
} from '../graphics/steering_wheel/steeringWheelData'
import { wheelAudio } from '../utils/wheelAudioSynthesizer'

export type CameraPreset =
  | 'front'
  | 'cockpit'
  | 'lcd'
  | 'thumb_left'
  | 'thumb_right'
  | 'paddles'
  | 'free'

interface SteeringWheel3DProps {
  telemetry?: Partial<WheelTelemetryData>
  activeLcdPage?: number
  cameraPreset?: CameraPreset
  nightMode?: boolean
  audioEnabled?: boolean
  selectedControlId?: string | null
  onControlInteract?: (
    control: WheelControlMetadata,
    interactionType: 'CLICK' | 'ROTARY_CW' | 'ROTARY_CCW' | 'PADDLE_PULL',
  ) => void
  onHoverControl?: (control: WheelControlMetadata | null) => void
}

const CAMERA_PRESET_TARGETS: Record<CameraPreset, { pos: THREE.Vector3; lookAt: THREE.Vector3; fov: number }> = {
  front: {
    pos: new THREE.Vector3(0, 0, 0.38),
    lookAt: new THREE.Vector3(0, 0, 0),
    fov: 40,
  },
  cockpit: {
    pos: new THREE.Vector3(0, 0.05, 0.42),
    lookAt: new THREE.Vector3(0, 0, 0.01),
    fov: 42,
  },
  lcd: {
    pos: new THREE.Vector3(0, 0.035, 0.18),
    lookAt: new THREE.Vector3(0, 0.03, 0.015),
    fov: 34,
  },
  thumb_left: {
    pos: new THREE.Vector3(-0.085, 0.03, 0.22),
    lookAt: new THREE.Vector3(-0.08, 0.025, 0.01),
    fov: 35,
  },
  thumb_right: {
    pos: new THREE.Vector3(0.085, 0.03, 0.22),
    lookAt: new THREE.Vector3(0.08, 0.025, 0.01),
    fov: 35,
  },
  paddles: {
    pos: new THREE.Vector3(0, 0.03, -0.34),
    lookAt: new THREE.Vector3(0, 0.01, -0.01),
    fov: 38,
  },
  free: {
    pos: new THREE.Vector3(0.12, 0.1, 0.36),
    lookAt: new THREE.Vector3(0, 0, 0),
    fov: 40,
  },
}

export function SteeringWheel3D({
  telemetry,
  activeLcdPage = 1,
  cameraPreset = 'front',
  nightMode = false,
  audioEnabled = true,
  selectedControlId = null,
  onControlInteract,
  onHoverControl,
}: SteeringWheel3DProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const wheelControllerRef = useRef<F1SteeringWheelController | null>(null)
  const [hoveredControl, setHoveredControl] = useState<WheelControlMetadata | null>(null)
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 })

  const stateRef = useRef({
    cameraPreset,
    audioEnabled,
    nightMode,
    onControlInteract,
    onHoverControl,
  })
  stateRef.current = {
    cameraPreset,
    audioEnabled,
    nightMode,
    onControlInteract,
    onHoverControl,
  }

  // Sync telemetry props
  useEffect(() => {
    if (wheelControllerRef.current && telemetry) {
      wheelControllerRef.current.setTelemetry(telemetry)
    }
  }, [telemetry])

  // Sync LCD Page
  useEffect(() => {
    if (wheelControllerRef.current) {
      wheelControllerRef.current.setLcdPage(activeLcdPage)
    }
  }, [activeLcdPage])

  // Sync highlight
  useEffect(() => {
    if (wheelControllerRef.current) {
      wheelControllerRef.current.highlightControl(selectedControlId)
    }
  }, [selectedControlId])

  // Sync audio enabled
  useEffect(() => {
    wheelAudio.setEnabled(audioEnabled)
  }, [audioEnabled])

  // Main Three.js Scene Setup
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(nightMode ? 0x050608 : 0x0a0c10)

    const width = container.clientWidth || 800
    const height = container.clientHeight || 600

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.01, 20)
    const initialCam = CAMERA_PRESET_TARGETS[cameraPreset]
    camera.position.copy(initialCam.pos)
    const currentLookAt = initialCam.lookAt.clone()
    camera.lookAt(currentLookAt)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.25
    container.appendChild(renderer.domElement)

    // High-Fidelity Studio Lighting (Front + Rear 360° Illumination)
    const ambientLight = new THREE.AmbientLight(0xffffff, nightMode ? 0.45 : 1.1)
    scene.add(ambientLight)

    // Front Main Key Light (high-contrast reflections on faceplate)
    const mainKeyLight = new THREE.DirectionalLight(0xffffff, nightMode ? 1.4 : 2.6)
    mainKeyLight.position.set(0.4, 0.8, 0.7)
    scene.add(mainKeyLight)

    // Front Left Fill Light
    const frontFillLight = new THREE.DirectionalLight(0xd4e8ff, nightMode ? 0.9 : 1.5)
    frontFillLight.position.set(-0.5, 0.3, 0.6)
    scene.add(frontFillLight)

    // Top Rim Light
    const topFill = new THREE.DirectionalLight(0xffffff, 0.8)
    topFill.position.set(0, 0.9, 0.2)
    scene.add(topFill)

    // --- REAR PADDLE & HUB LIGHTS (Brightly illuminates shifters & quick release) ---
    const rearKeyLight = new THREE.DirectionalLight(0xffffff, nightMode ? 1.8 : 2.8)
    rearKeyLight.position.set(0.35, 0.65, -0.75)
    scene.add(rearKeyLight)

    const rearFillLight = new THREE.DirectionalLight(0xbad7ff, nightMode ? 1.5 : 2.4)
    rearFillLight.position.set(-0.45, 0.45, -0.65)
    scene.add(rearFillLight)

    const rearBottomLight = new THREE.DirectionalLight(0xffffff, 1.2)
    rearBottomLight.position.set(0, -0.5, -0.5)
    scene.add(rearBottomLight)

    // Dedicated Point Lights behind Left & Right Paddle Shifters
    const leftPaddlePoint = new THREE.PointLight(0x00f0ff, 0.9, 0.35)
    leftPaddlePoint.position.set(-0.09, 0.02, -0.04)
    scene.add(leftPaddlePoint)

    const rightPaddlePoint = new THREE.PointLight(0x30d158, 0.9, 0.35)
    rightPaddlePoint.position.set(0.09, 0.02, -0.04)
    scene.add(rightPaddlePoint)

    // Create 3D Steering Wheel Model
    const controller = createF1SteeringWheel()
    wheelControllerRef.current = controller
    scene.add(controller.root)

    if (telemetry) {
      controller.setTelemetry(telemetry)
    }
    controller.setLcdPage(activeLcdPage)

    // Raycasting & Pointer Interaction
    const raycaster = new THREE.Raycaster()
    const mouse = new THREE.Vector2(-999, -999)
    let hoveredMesh: THREE.Mesh | null = null

    // Orbit / Dragging variables
    let isDragging = false
    let prevMouseX = 0
    let prevMouseY = 0
    const spherical = new THREE.Spherical(0.38, Math.PI / 2, 0)
    const targetLookAt = currentLookAt.clone()

    const handlePointerMove = (e: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect()
      const clientX = e.clientX - rect.left
      const clientY = e.clientY - rect.top

      mouse.x = (clientX / rect.width) * 2 - 1
      mouse.y = -(clientY / rect.height) * 2 + 1

      setTooltipPos({ x: e.clientX, y: e.clientY })

      if (isDragging) {
        const deltaX = e.clientX - prevMouseX
        const deltaY = e.clientY - prevMouseY
        prevMouseX = e.clientX
        prevMouseY = e.clientY

        spherical.theta -= deltaX * 0.008
        spherical.phi -= deltaY * 0.008
        spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi))

        camera.position.setFromSpherical(spherical).add(targetLookAt)
        camera.lookAt(targetLookAt)
      } else {
        // Raycast
        raycaster.setFromCamera(mouse, camera)
        const intersects = raycaster.intersectObjects(controller.interactiveMeshes, false)

        if (intersects.length > 0) {
          const hit = intersects[0].object as THREE.Mesh
          if (hit !== hoveredMesh) {
            hoveredMesh = hit
            const controlId = hit.userData.controlId as string
            const ctrl = controller.getControlById(controlId)
            setHoveredControl(ctrl ?? null)
            stateRef.current.onHoverControl?.(ctrl ?? null)
            renderer.domElement.style.cursor = 'pointer'
          }
        } else {
          if (hoveredMesh) {
            hoveredMesh = null
            setHoveredControl(null)
            stateRef.current.onHoverControl?.(null)
            renderer.domElement.style.cursor = 'default'
          }
        }
      }
    }

    const handlePointerDown = (e: PointerEvent) => {
      if (e.button === 0) {
        raycaster.setFromCamera(mouse, camera)
        const intersects = raycaster.intersectObjects(controller.interactiveMeshes, false)

        if (intersects.length > 0) {
          const hit = intersects[0].object as THREE.Mesh
          const controlId = hit.userData.controlId as string
          const ctrl = controller.getControlById(controlId)

          if (ctrl) {
            // Trigger 3D tactile animation
            if (ctrl.type === 'PUSH_BUTTON' || ctrl.type === 'DISPLAY_SCREEN') {
              controller.pressButton(ctrl.id)
              if (ctrl.sound === 'beep') wheelAudio.playBeep(1900, 0.08)
              else if (ctrl.sound === 'radio') wheelAudio.playRadioTone()
              else wheelAudio.playButtonClick()
              stateRef.current.onControlInteract?.(ctrl, 'CLICK')
            } else if (ctrl.type === 'ROTARY_DIAL' || ctrl.type === 'THUMB_ROTARY') {
              controller.turnRotary(ctrl.id, 1)
              wheelAudio.playRotaryClick()
              stateRef.current.onControlInteract?.(ctrl, 'ROTARY_CW')
            } else if (ctrl.type === 'PADDLE_SHIFTER' || ctrl.type === 'CLUTCH_PADDLE') {
              controller.pullPaddle(ctrl.id)
              wheelAudio.playPaddleShift(ctrl.id === 'paddle_upshift')
              stateRef.current.onControlInteract?.(ctrl, 'PADDLE_PULL')
            }
            return
          }
        }

        // Otherwise initiate drag orbit
        isDragging = true
        prevMouseX = e.clientX
        prevMouseY = e.clientY
      }
    }

    const handlePointerUp = () => {
      isDragging = false
    }

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault()
      // Check if hovering a rotary
      if (hoveredMesh) {
        const controlId = hoveredMesh.userData.controlId as string
        const ctrl = controller.getControlById(controlId)
        if (ctrl && (ctrl.type === 'ROTARY_DIAL' || ctrl.type === 'THUMB_ROTARY')) {
          const delta = e.deltaY < 0 ? 1 : -1
          controller.turnRotary(ctrl.id, delta)
          wheelAudio.playRotaryClick()
          stateRef.current.onControlInteract?.(ctrl, delta > 0 ? 'ROTARY_CW' : 'ROTARY_CCW')
          return
        }
      }

      // Camera zoom
      spherical.radius = Math.max(0.12, Math.min(0.85, spherical.radius + e.deltaY * 0.0006))
      camera.position.setFromSpherical(spherical).add(targetLookAt)
      camera.lookAt(targetLookAt)
    }

    const dom = renderer.domElement
    dom.addEventListener('pointermove', handlePointerMove)
    dom.addEventListener('pointerdown', handlePointerDown)
    window.addEventListener('pointerup', handlePointerUp)
    dom.addEventListener('wheel', handleWheel, { passive: false })

    // Resize Handler
    const handleResize = () => {
      if (!container) return
      const w = container.clientWidth
      const h = container.clientHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    window.addEventListener('resize', handleResize)

    // Animation Loop
    let animationFrameId: number
    let lastTime = performance.now()

    const animate = (currentTime: number) => {
      animationFrameId = requestAnimationFrame(animate)
      const deltaSeconds = Math.min(0.1, (currentTime - lastTime) / 1000)
      lastTime = currentTime
      
      // Smooth camera transition to target preset
      const targetPresetConfig = CAMERA_PRESET_TARGETS[stateRef.current.cameraPreset]
      if (!isDragging && targetPresetConfig) {
        camera.position.lerp(targetPresetConfig.pos, deltaSeconds * 5.0)
        targetLookAt.lerp(targetPresetConfig.lookAt, deltaSeconds * 5.0)
        camera.lookAt(targetLookAt)
        spherical.setFromVector3(camera.position.clone().sub(targetLookAt))
      }

      controller.update(deltaSeconds)
      renderer.render(scene, camera)
    }
    animationFrameId = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('resize', handleResize)
      dom.removeEventListener('pointermove', handlePointerMove)
      dom.removeEventListener('pointerdown', handlePointerDown)
      window.removeEventListener('pointerup', handlePointerUp)
      dom.removeEventListener('wheel', handleWheel)
      controller.dispose()
      renderer.dispose()
      if (dom.parentElement) {
        dom.parentElement.removeChild(dom)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nightMode]) // Recreate scene when night mode toggled for ambient mood

  return (
    <div className="steering-wheel-3d-wrapper" ref={containerRef}>
      {/* Rich Holographic Engineering Tooltip */}
      {hoveredControl && (
        <div
          className="wheel-hud-tooltip"
          style={{
            left: `${Math.min(window.innerWidth - 340, tooltipPos.x + 18)}px`,
            top: `${Math.min(window.innerHeight - 260, tooltipPos.y + 18)}px`,
          }}
        >
          <div className="tooltip-header">
            <span className="tooltip-acronym" style={{ borderColor: hoveredControl.color, color: hoveredControl.color }}>
              {hoveredControl.acronym}
            </span>
            <div className="tooltip-title-wrap">
              <strong className="tooltip-name">{hoveredControl.name}</strong>
              <span className="tooltip-category">{hoveredControl.category} • {hoveredControl.positionLabel}</span>
            </div>
          </div>

          <p className="tooltip-description">{hoveredControl.description}</p>

          <div className="tooltip-grid">
            <div className="tooltip-stat">
              <small>PHYSICS & ENGINE IMPACT</small>
              <span>{hoveredControl.physicsImpact}</span>
            </div>
            <div className="tooltip-stat">
              <small>FIA REGULATION</small>
              <span className="fia-note">{hoveredControl.fiaContext}</span>
            </div>
          </div>

          <div className="tooltip-action-hint">
            <span className="hint-bullet" style={{ backgroundColor: hoveredControl.color }} />
            <span>{hoveredControl.actionHint}</span>
          </div>
        </div>
      )}
    </div>
  )
}
