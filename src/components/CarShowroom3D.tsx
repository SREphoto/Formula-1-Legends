import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { createF1Car, disposeF1Car } from '../graphics/createF1Car'

interface CarShowroom3DProps {
  primaryColor: string
  accentColor: string
  frontBalance: number
  downforceKn: number
  porpoising: boolean
}

export function CarShowroom3D({ primaryColor, accentColor, frontBalance, downforceKn, porpoising }: CarShowroom3DProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const valuesRef = useRef({ frontBalance, downforceKn, porpoising })
  valuesRef.current = { frontBalance, downforceKn, porpoising }

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.7))
    renderer.setSize(container.clientWidth, container.clientHeight)
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.2
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.domElement.className = 'showroom-3d-canvas'
    renderer.domElement.style.touchAction = 'none'
    container.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(38, container.clientWidth / Math.max(1, container.clientHeight), 0.1, 100)
    camera.position.set(8.4, 4.7, 9.4)
    camera.lookAt(0, 0.55, 0)

    scene.add(new THREE.HemisphereLight('#d8eeff', '#1b110d', 1.85))
    const keyLight = new THREE.DirectionalLight('#fff1da', 4.3)
    keyLight.position.set(-5, 9, 6)
    keyLight.castShadow = true
    keyLight.shadow.mapSize.set(1024, 1024)
    scene.add(keyLight)
    const orangeRim = new THREE.PointLight(primaryColor, 18, 18)
    orangeRim.position.set(5, 2, -4)
    scene.add(orangeRim)
    const blueRim = new THREE.PointLight('#4d9ee8', 12, 16)
    blueRim.position.set(-5, 2, -3)
    scene.add(blueRim)

    const platformMaterial = new THREE.MeshStandardMaterial({ color: '#12171c', roughness: 0.28, metalness: 0.62 })
    const platform = new THREE.Mesh(new THREE.CylinderGeometry(4.8, 5.15, 0.36, 64), platformMaterial)
    platform.position.y = -0.2
    platform.receiveShadow = true
    scene.add(platform)

    const ringMaterial = new THREE.MeshBasicMaterial({ color: primaryColor, transparent: true, opacity: 0.7, side: THREE.DoubleSide })
    const glowRing = new THREE.Mesh(new THREE.RingGeometry(3.7, 3.76, 96), ringMaterial)
    glowRing.rotation.x = -Math.PI / 2
    glowRing.position.y = 0.005
    scene.add(glowRing)

    const carPivot = new THREE.Group()
    carPivot.rotation.y = -0.52
    scene.add(carPivot)
    const car = createF1Car(primaryColor, accentColor)
    car.scale.setScalar(1.22)
    car.position.y = 0.24
    car.rotation.y = Math.PI / 2
    carPivot.add(car)

    const floorGlowMaterial = new THREE.MeshBasicMaterial({ color: valuesRef.current.porpoising ? '#ff3f42' : '#ff7a18', transparent: true, opacity: 0.18, side: THREE.DoubleSide })
    const floorGlow = new THREE.Mesh(new THREE.PlaneGeometry(5.4, 2.2), floorGlowMaterial)
    floorGlow.rotation.x = -Math.PI / 2
    floorGlow.rotation.z = Math.PI / 2
    floorGlow.position.y = 0.03
    carPivot.add(floorGlow)

    const arrowMaterial = new THREE.MeshStandardMaterial({ color: '#4ce2c2', emissive: '#1f8d7b', emissiveIntensity: 0.8 })
    const arrowGeometry = new THREE.ConeGeometry(0.13, 0.42, 10)
    const arrows: THREE.Mesh[] = []
    ;[-1.75, -0.75, 0.4, 1.55].forEach((z, index) => {
      const arrow = new THREE.Mesh(arrowGeometry, arrowMaterial)
      arrow.position.set(index % 2 === 0 ? -0.72 : 0.72, 2.35, z)
      arrow.rotation.x = Math.PI
      carPivot.add(arrow)
      arrows.push(arrow)
    })

    const airflowCount = 100
    const airflowPositions = new Float32Array(airflowCount * 3)
    const airflowSpeeds = new Float32Array(airflowCount)
    for (let index = 0; index < airflowCount; index += 1) {
      airflowPositions[index * 3] = (Math.random() - 0.5) * 8.5
      airflowPositions[index * 3 + 1] = 0.25 + Math.random() * 2.5
      airflowPositions[index * 3 + 2] = -7 + Math.random() * 14
      airflowSpeeds[index] = 2.8 + Math.random() * 3.8
    }
    const airflowGeometry = new THREE.BufferGeometry()
    airflowGeometry.setAttribute('position', new THREE.BufferAttribute(airflowPositions, 3))
    const airflowMaterial = new THREE.PointsMaterial({ color: '#65daca', size: 0.045, transparent: true, opacity: 0.58, depthWrite: false })
    const airflow = new THREE.Points(airflowGeometry, airflowMaterial)
    airflow.rotation.y = Math.PI / 2
    scene.add(airflow)

    const clock = new THREE.Clock()
    let animationFrame = 0
    let dragging = false
    let pointerX = 0
    let targetRotation = carPivot.rotation.y
    let targetCameraDistance = 1

    const onPointerDown = (event: PointerEvent) => {
      dragging = true
      pointerX = event.clientX
      renderer.domElement.setPointerCapture(event.pointerId)
    }
    const onPointerMove = (event: PointerEvent) => {
      if (!dragging) return
      targetRotation += (event.clientX - pointerX) * 0.008
      pointerX = event.clientX
    }
    const onPointerUp = () => { dragging = false }
    const onWheel = (event: WheelEvent) => {
      event.preventDefault()
      targetCameraDistance = THREE.MathUtils.clamp(targetCameraDistance + event.deltaY * 0.0008, 0.74, 1.32)
    }
    renderer.domElement.addEventListener('pointerdown', onPointerDown)
    renderer.domElement.addEventListener('pointermove', onPointerMove)
    renderer.domElement.addEventListener('pointerup', onPointerUp)
    renderer.domElement.addEventListener('wheel', onWheel, { passive: false })

    const animate = () => {
      animationFrame = requestAnimationFrame(animate)
      const delta = Math.min(0.04, clock.getDelta())
      const elapsed = clock.elapsedTime
      if (!dragging) targetRotation += delta * 0.12
      carPivot.rotation.y = THREE.MathUtils.lerp(carPivot.rotation.y, targetRotation, 0.08)
      carPivot.position.y = valuesRef.current.porpoising ? Math.sin(elapsed * 35) * 0.045 : Math.sin(elapsed * 1.3) * 0.008
      floorGlowMaterial.color.set(valuesRef.current.porpoising ? '#ff3f42' : primaryColor)
      floorGlowMaterial.opacity = valuesRef.current.porpoising ? 0.32 + Math.sin(elapsed * 10) * 0.08 : 0.14
      glowRing.rotation.z += delta * 0.18

      arrows.forEach((arrow, index) => {
        const frontWeight = index > 1 ? valuesRef.current.frontBalance / 50 : (100 - valuesRef.current.frontBalance) / 50
        arrow.scale.y = 0.65 + frontWeight * valuesRef.current.downforceKn * 0.025
        arrow.position.y = 2.2 + Math.sin(elapsed * 2.4 + index) * 0.13
      })

      for (let index = 0; index < airflowCount; index += 1) {
        airflowPositions[index * 3 + 2] += airflowSpeeds[index] * delta
        if (airflowPositions[index * 3 + 2] > 7) airflowPositions[index * 3 + 2] = -7
      }
      airflowGeometry.attributes.position.needsUpdate = true
      const baseCamera = new THREE.Vector3(8.4, 4.7, 9.4).multiplyScalar(targetCameraDistance)
      camera.position.lerp(baseCamera, 0.06)
      camera.lookAt(0, 0.55, 0)
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
      disposeF1Car(car)
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
  }, [primaryColor, accentColor])

  return (
    <div className="car-showroom-3d" ref={containerRef}>
      <div className="showroom-grid" />
      <div className="showroom-title"><span>ACTIVE AERO MODEL</span><b>SPEC B · LIVE GEOMETRY</b></div>
      <div className="showroom-help">DRAG TO ROTATE · SCROLL TO ZOOM</div>
      <div className="showroom-stat front"><small>FRONT BALANCE</small><b>{frontBalance.toFixed(1)}%</b></div>
      <div className="showroom-stat load"><small>TOTAL LOAD</small><b>{downforceKn.toFixed(1)} kN</b></div>
    </div>
  )
}
