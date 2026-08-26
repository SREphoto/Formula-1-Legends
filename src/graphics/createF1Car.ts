import * as THREE from 'three'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'

type MaterialKey = 'paint' | 'carbon' | 'accent'

const tireGeometry = new THREE.CylinderGeometry(0.37, 0.37, 0.36, 20)
tireGeometry.rotateZ(Math.PI / 2)
const rimGeometry = new THREE.CylinderGeometry(0.225, 0.225, 0.375, 14)
rimGeometry.rotateZ(Math.PI / 2)

/** Square-section tapered prism lying along Z (front toward +Z). */
function prism(radiusFront: number, radiusRear: number, length: number, flatten = 1): THREE.BufferGeometry {
  const geometry = new THREE.CylinderGeometry(radiusFront, radiusRear, length, 4, 1, false, Math.PI / 4)
  geometry.rotateX(Math.PI / 2)
  geometry.scale(1, flatten, 1)
  return geometry
}

/** Four-sided cone pointing toward +Z (the nose). */
function noseCone(radius: number, length: number): THREE.BufferGeometry {
  const geometry = new THREE.ConeGeometry(radius, length, 4, 1, false, Math.PI / 4)
  geometry.rotateX(Math.PI / 2)
  return geometry
}

function box(width: number, height: number, depth: number): THREE.BufferGeometry {
  return new THREE.BoxGeometry(width, height, depth)
}

function placed(
  geometry: THREE.BufferGeometry,
  position: [number, number, number],
  rotation: [number, number, number] = [0, 0, 0],
): THREE.BufferGeometry {
  const matrix = new THREE.Matrix4().compose(
    new THREE.Vector3(...position),
    new THREE.Quaternion().setFromEuler(new THREE.Euler(...rotation)),
    new THREE.Vector3(1, 1, 1),
  )
  const result = geometry.clone()
  result.applyMatrix4(matrix)
  return result
}

/** Thin cylinder between two points — suspension arms and drive shafts. */
function strut(from: THREE.Vector3, to: THREE.Vector3, radius = 0.022): THREE.BufferGeometry {
  const direction = to.clone().sub(from)
  const length = direction.length()
  const geometry = new THREE.CylinderGeometry(radius, radius, length, 6)
  geometry.translate(0, length / 2, 0)
  geometry.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize()))
  geometry.translate(from.x, from.y, from.z)
  return geometry
}

const vector = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z)

export function createF1Car(primaryColor: string, accentColor = '#f4f6f8'): THREE.Group {
  const car = new THREE.Group()
  const paintMaterial = new THREE.MeshStandardMaterial({ color: primaryColor, metalness: 0.5, roughness: 0.34 })
  const accentMaterial = new THREE.MeshStandardMaterial({ color: accentColor, metalness: 0.55, roughness: 0.3 })
  const carbonMaterial = new THREE.MeshStandardMaterial({ color: '#171b20', metalness: 0.2, roughness: 0.62 })
  const tireMaterial = new THREE.MeshStandardMaterial({ color: '#0b0c0e', roughness: 0.94 })
  const rimMaterial = new THREE.MeshStandardMaterial({ color: accentColor, metalness: 0.85, roughness: 0.24 })

  const buckets: Record<MaterialKey, THREE.BufferGeometry[]> = { paint: [], carbon: [], accent: [] }

  // Chassis
  buckets.paint.push(placed(prism(0.17, 0.3, 1.75, 0.55), [0, 0.3, 0.3]))
  buckets.paint.push(placed(noseCone(0.155, 1.25), [0, 0.3, 1.55]))
  buckets.paint.push(placed(prism(0.24, 0.16, 1.3, 0.5), [-0.44, 0.3, -0.28]))
  buckets.paint.push(placed(prism(0.24, 0.16, 1.3, 0.5), [0.44, 0.3, -0.28]))
  buckets.paint.push(placed(prism(0.24, 0.09, 1.55, 0.52), [0, 0.52, -0.7]))

  // Floor, airbox, mirrors
  buckets.carbon.push(placed(box(1.42, 0.06, 3.55), [0, 0.14, -0.05]))
  buckets.carbon.push(placed(box(0.3, 0.2, 0.34), [0, 0.64, -0.12]))
  buckets.carbon.push(placed(box(0.1, 0.06, 0.06), [-0.34, 0.52, 0.42]))
  buckets.carbon.push(placed(box(0.1, 0.06, 0.06), [0.34, 0.52, 0.42]))

  // Front wing
  buckets.carbon.push(placed(box(1.98, 0.05, 0.58), [0, 0.155, 2.02]))
  buckets.accent.push(placed(box(1.86, 0.04, 0.3), [0, 0.27, 1.94], [-0.12, 0, 0]))
  buckets.carbon.push(placed(box(0.05, 0.24, 0.66), [-1.0, 0.24, 2.0]))
  buckets.carbon.push(placed(box(0.05, 0.24, 0.66), [1.0, 0.24, 2.0]))

  // Rear wing
  buckets.carbon.push(placed(box(1.02, 0.05, 0.4), [0, 0.86, -1.98]))
  buckets.accent.push(placed(box(1.0, 0.04, 0.3), [0, 0.98, -2.02], [0.2, 0, 0]))
  buckets.carbon.push(placed(box(0.045, 0.44, 0.62), [-0.53, 0.84, -1.98]))
  buckets.carbon.push(placed(box(0.045, 0.44, 0.62), [0.53, 0.84, -1.98]))
  buckets.carbon.push(placed(box(0.05, 0.34, 0.06), [0, 0.62, -1.86]))

  // Engine cover fin
  buckets.accent.push(placed(box(0.035, 0.34, 0.85), [0, 0.74, -1.28]))

  // Diffuser and strakes
  buckets.carbon.push(placed(box(1.24, 0.05, 0.38), [0, 0.15, -1.86], [0.14, 0, 0]))
  for (const x of [-0.3, 0, 0.3]) {
    buckets.carbon.push(placed(box(0.02, 0.1, 0.34), [x, 0.1, -1.88]))
  }

  // Halo hoop and front pillar
  const halo = new THREE.TorusGeometry(0.3, 0.04, 8, 24, Math.PI * 1.9)
  halo.rotateX(Math.PI / 2)
  halo.scale(1, 1, 1.22)
  buckets.carbon.push(placed(halo, [0, 0.58, 0.3]))
  buckets.carbon.push(placed(new THREE.CylinderGeometry(0.035, 0.05, 0.26, 8), [0, 0.47, 0.6]))

  // Helmet
  buckets.accent.push(placed(new THREE.SphereGeometry(0.15, 16, 12), [0, 0.5, 0.2]))

  // Suspension arms: upper + lower wishbone legs and drive shaft per corner
  const corners: [number, number][] = [
    [-1, 1.32], [1, 1.32], [-1, -1.28], [1, -1.28],
  ]
  for (const [xSign, z] of corners) {
    buckets.carbon.push(strut(vector(0.2 * xSign, 0.42, z - 0.1 * Math.sign(z)), vector(0.78 * xSign, 0.46, z)))
    buckets.carbon.push(strut(vector(0.2 * xSign, 0.24, z - 0.1 * Math.sign(z)), vector(0.78 * xSign, 0.28, z)))
    buckets.carbon.push(strut(vector(0.16 * xSign, 0.34, z - 0.28 * Math.sign(z)), vector(0.78 * xSign, 0.37, z), 0.03))
  }

  const disposables: (THREE.BufferGeometry | THREE.Material)[] = []
  const materials: Record<MaterialKey, THREE.Material> = { paint: paintMaterial, carbon: carbonMaterial, accent: accentMaterial }
  for (const key of Object.keys(buckets) as MaterialKey[]) {
    const merged = mergeGeometries(buckets[key], false)
    if (!merged) continue
    const mesh = new THREE.Mesh(merged, materials[key])
    mesh.castShadow = true
    mesh.receiveShadow = true
    car.add(mesh)
    disposables.push(merged)
  }

  // Wheels: grouped so the whole hub spins together
  const wheelPositions: [number, number, number][] = [
    [-0.86, 0.37, 1.32], [0.86, 0.37, 1.32],
    [-0.86, 0.385, -1.28], [0.86, 0.385, -1.28],
  ]
  wheelPositions.forEach((position, index) => {
    const wheel = new THREE.Group()
    wheel.position.set(...position)
    const rear = index > 1
    const tire = new THREE.Mesh(tireGeometry, tireMaterial)
    tire.castShadow = true
    wheel.add(tire)
    const rim = new THREE.Mesh(rimGeometry, rimMaterial)
    wheel.add(rim)
    if (rear) wheel.scale.set(1, 1.05, 1.05)
    wheel.userData.isWheel = true
    car.add(wheel)
  })

  // Rain light
  const rainLight = new THREE.Mesh(
    new THREE.BoxGeometry(0.12, 0.12, 0.06),
    new THREE.MeshStandardMaterial({ color: '#ff2738', emissive: '#ff2738', emissiveIntensity: 2.6 }),
  )
  rainLight.position.set(0, 0.4, -2.16)
  car.add(rainLight)

  disposables.push(paintMaterial, accentMaterial, carbonMaterial, tireMaterial, rimMaterial, rainLight.geometry, rainLight.material as THREE.Material)
  car.userData.disposables = disposables
  return car
}

export function disposeF1Car(car: THREE.Group) {
  const disposables = car.userData.disposables as (THREE.BufferGeometry | THREE.Material)[] | undefined
  disposables?.forEach((item) => item.dispose())
}
