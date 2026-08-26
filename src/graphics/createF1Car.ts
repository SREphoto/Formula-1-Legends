import * as THREE from 'three'

const bodyGeometry = new THREE.BoxGeometry(0.82, 0.42, 2.75)
const noseGeometry = new THREE.BoxGeometry(0.34, 0.2, 1.45)
const sidepodGeometry = new THREE.BoxGeometry(1.18, 0.33, 1.18)
const floorGeometry = new THREE.BoxGeometry(1.52, 0.1, 3.35)
const wingGeometry = new THREE.BoxGeometry(2.05, 0.09, 0.4)
const wingElementGeometry = new THREE.BoxGeometry(1.7, 0.07, 0.22)
const rearWingGeometry = new THREE.BoxGeometry(1.55, 0.09, 0.34)
const cockpitGeometry = new THREE.SphereGeometry(0.42, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.58)
const wheelGeometry = new THREE.CylinderGeometry(0.39, 0.39, 0.34, 14)
const rimGeometry = new THREE.CylinderGeometry(0.19, 0.19, 0.35, 12)
const haloGeometry = new THREE.TorusGeometry(0.34, 0.045, 6, 18, Math.PI * 1.45)

function mesh(geometry: THREE.BufferGeometry, material: THREE.Material, position: [number, number, number]) {
  const value = new THREE.Mesh(geometry, material)
  value.position.set(...position)
  value.castShadow = true
  value.receiveShadow = true
  return value
}

export function createF1Car(primaryColor: string, accentColor = '#f4f6f8'): THREE.Group {
  const car = new THREE.Group()
  const bodyMaterial = new THREE.MeshStandardMaterial({ color: primaryColor, metalness: 0.48, roughness: 0.3 })
  const bodyHighlight = new THREE.MeshStandardMaterial({ color: primaryColor, metalness: 0.25, roughness: 0.2, emissive: primaryColor, emissiveIntensity: 0.08 })
  const carbonMaterial = new THREE.MeshStandardMaterial({ color: '#111419', metalness: 0.15, roughness: 0.72 })
  const tireMaterial = new THREE.MeshStandardMaterial({ color: '#070809', roughness: 0.95 })
  const rimMaterial = new THREE.MeshStandardMaterial({ color: accentColor, metalness: 0.8, roughness: 0.25 })
  const glassMaterial = new THREE.MeshStandardMaterial({ color: '#202c35', metalness: 0.55, roughness: 0.15 })

  car.add(mesh(floorGeometry, carbonMaterial, [0, 0.18, -0.08]))
  car.add(mesh(bodyGeometry, bodyMaterial, [0, 0.45, -0.02]))
  car.add(mesh(noseGeometry, bodyHighlight, [0, 0.36, 1.92]))
  car.add(mesh(sidepodGeometry, bodyMaterial, [0, 0.4, -0.25]))

  const frontWing = mesh(wingGeometry, carbonMaterial, [0, 0.21, 2.66])
  car.add(frontWing)
  const frontElement = mesh(wingElementGeometry, bodyHighlight, [0, 0.32, 2.52])
  frontElement.rotation.x = -0.08
  car.add(frontElement)

  const rearWing = mesh(rearWingGeometry, carbonMaterial, [0, 0.9, -2.05])
  car.add(rearWing)
  const rearElement = mesh(wingElementGeometry, bodyHighlight, [0, 0.73, -1.92])
  rearElement.rotation.x = 0.12
  car.add(rearElement)
  const rearPillar = mesh(new THREE.BoxGeometry(0.08, 0.65, 0.08), carbonMaterial, [0, 0.56, -1.93])
  car.add(rearPillar)

  const cockpit = mesh(cockpitGeometry, glassMaterial, [0, 0.69, 0.15])
  cockpit.rotation.x = -Math.PI / 2
  car.add(cockpit)

  const halo = mesh(haloGeometry, accentColor === '#f4f6f8' ? carbonMaterial : rimMaterial, [0, 0.96, 0.2])
  halo.rotation.x = Math.PI / 2
  halo.rotation.z = 0.75
  car.add(halo)

  const wheelPositions: [number, number, number][] = [
    [-0.91, 0.37, 1.48], [0.91, 0.37, 1.48],
    [-0.91, 0.39, -1.36], [0.91, 0.39, -1.36],
  ]
  wheelPositions.forEach((position) => {
    const wheel = mesh(wheelGeometry, tireMaterial, position)
    wheel.rotation.z = Math.PI / 2
    wheel.userData.isWheel = true
    car.add(wheel)
    const rim = mesh(rimGeometry, rimMaterial, position)
    rim.rotation.z = Math.PI / 2
    car.add(rim)
  })

  const rainLight = new THREE.Mesh(
    new THREE.BoxGeometry(0.12, 0.12, 0.06),
    new THREE.MeshStandardMaterial({ color: '#ff2738', emissive: '#ff2738', emissiveIntensity: 2.4 }),
  )
  rainLight.position.set(0, 0.43, -2.19)
  car.add(rainLight)

  car.userData.materials = [bodyMaterial, bodyHighlight, carbonMaterial, tireMaterial, rimMaterial, glassMaterial]
  return car
}

export function disposeF1Car(car: THREE.Group) {
  const materials = car.userData.materials as THREE.Material[] | undefined
  materials?.forEach((material) => material.dispose())
}
