import * as THREE from 'three'

export interface PitCrewRig {
  group: THREE.Group
  frontJackGroup: THREE.Group
  rearJackGroup: THREE.Group
  lollipopGroup: THREE.Group
  lollipopDisc: THREE.Mesh
  lollipopLight: THREE.Mesh
  gunners: THREE.Group[]
  tireStacks: THREE.Group[]
  gantryGroup: THREE.Group
  materials: THREE.Material[]
  geometries: THREE.BufferGeometry[]
  update: (progress01: number, isPitting: boolean, elapsed: number) => { carElevation: number }
}

/**
 * Creates a low-polygon mechanic humanoid with helmet, suit, and boots in team colors.
 */
function createMechanic(
  suitColor: string,
  trimColor: string,
  role: 'gunner' | 'frontJack' | 'rearJack' | 'lollipop' | 'tireAssistant',
  materials: THREE.Material[],
  geometries: THREE.BufferGeometry[],
): THREE.Group {
  const mechanic = new THREE.Group()

  const suitMat = new THREE.MeshStandardMaterial({
    color: suitColor,
    roughness: 0.7,
    metalness: 0.1,
  })
  const trimMat = new THREE.MeshStandardMaterial({
    color: trimColor,
    roughness: 0.5,
    metalness: 0.3,
  })
  const darkMat = new THREE.MeshStandardMaterial({
    color: '#1a1e24',
    roughness: 0.9,
  })
  const visorMat = new THREE.MeshStandardMaterial({
    color: '#0d1117',
    roughness: 0.1,
    metalness: 0.9,
  })
  materials.push(suitMat, trimMat, darkMat, visorMat)

  // Torso
  const torsoGeo = new THREE.BoxGeometry(0.38, 0.48, 0.22)
  geometries.push(torsoGeo)
  const torso = new THREE.Mesh(torsoGeo, suitMat)
  torso.position.y = 0.82
  torso.castShadow = true
  mechanic.add(torso)

  // Belt / Harness trim
  const beltGeo = new THREE.BoxGeometry(0.39, 0.08, 0.23)
  geometries.push(beltGeo)
  const belt = new THREE.Mesh(beltGeo, trimMat)
  belt.position.y = 0.64
  mechanic.add(belt)

  // Helmet / Head
  const helmetGeo = new THREE.SphereGeometry(0.14, 8, 8)
  geometries.push(helmetGeo)
  const helmet = new THREE.Mesh(helmetGeo, suitMat)
  helmet.position.y = 1.18
  helmet.castShadow = true
  mechanic.add(helmet)

  // Visor
  const visorGeo = new THREE.BoxGeometry(0.18, 0.07, 0.12)
  geometries.push(visorGeo)
  const visor = new THREE.Mesh(visorGeo, visorMat)
  visor.position.set(0, 1.18, 0.09)
  mechanic.add(visor)

  // Legs (Left and Right)
  const legGeo = new THREE.BoxGeometry(0.14, 0.52, 0.16)
  geometries.push(legGeo)
  const leftLeg = new THREE.Mesh(legGeo, darkMat)
  leftLeg.position.set(-0.11, 0.32, 0)
  leftLeg.castShadow = true
  const rightLeg = new THREE.Mesh(legGeo, darkMat)
  rightLeg.position.set(0.11, 0.32, 0)
  rightLeg.castShadow = true
  mechanic.add(leftLeg, rightLeg)

  // Boots
  const bootGeo = new THREE.BoxGeometry(0.15, 0.1, 0.24)
  geometries.push(bootGeo)
  const leftBoot = new THREE.Mesh(bootGeo, darkMat)
  leftBoot.position.set(-0.11, 0.05, 0.04)
  const rightBoot = new THREE.Mesh(bootGeo, darkMat)
  rightBoot.position.set(0.11, 0.05, 0.04)
  mechanic.add(leftBoot, rightBoot)

  // Arms (role specific poses)
  const armGeo = new THREE.BoxGeometry(0.11, 0.42, 0.12)
  geometries.push(armGeo)
  const leftArm = new THREE.Mesh(armGeo, suitMat)
  const rightArm = new THREE.Mesh(armGeo, suitMat)

  if (role === 'gunner') {
    // Crouched gunner posture holding pneumatic wheel gun
    torso.position.y = 0.62
    helmet.position.y = 0.98
    visor.position.set(0, 0.98, 0.09)
    leftLeg.scale.set(1, 0.65, 1.3)
    rightLeg.scale.set(1, 0.65, 1.3)
    leftLeg.position.set(-0.12, 0.22, -0.08)
    rightLeg.position.set(0.12, 0.22, -0.08)

    leftArm.position.set(-0.24, 0.58, 0.15)
    leftArm.rotation.x = Math.PI / 3
    rightArm.position.set(0.24, 0.58, 0.15)
    rightArm.rotation.x = Math.PI / 3

    // Pneumatic wheel gun prop
    const gunBodyGeo = new THREE.CylinderGeometry(0.04, 0.05, 0.26, 6)
    const gunNozzleGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.14, 6)
    geometries.push(gunBodyGeo, gunNozzleGeo)
    const gunBody = new THREE.Mesh(gunBodyGeo, trimMat)
    gunBody.rotation.x = Math.PI / 2
    gunBody.position.set(0, 0.52, 0.32)
    const gunNozzle = new THREE.Mesh(gunNozzleGeo, darkMat)
    gunNozzle.rotation.x = Math.PI / 2
    gunNozzle.position.set(0, 0.52, 0.45)
    mechanic.add(gunBody, gunNozzle)

    // Air hose coil
    const hoseGeo = new THREE.TorusGeometry(0.06, 0.015, 6, 12)
    geometries.push(hoseGeo)
    const hose = new THREE.Mesh(hoseGeo, darkMat)
    hose.position.set(0, 0.46, 0.26)
    mechanic.add(hose)
  } else if (role === 'frontJack' || role === 'rearJack') {
    leftArm.position.set(-0.22, 0.72, 0.18)
    leftArm.rotation.x = Math.PI / 4
    rightArm.position.set(0.22, 0.72, 0.18)
    rightArm.rotation.x = Math.PI / 4
  } else if (role === 'lollipop') {
    leftArm.position.set(-0.24, 0.88, 0.15)
    leftArm.rotation.x = Math.PI / 2.2
    rightArm.position.set(0.24, 0.88, 0.15)
    rightArm.rotation.x = Math.PI / 2.2
  } else {
    leftArm.position.set(-0.24, 0.74, 0)
    rightArm.position.set(0.24, 0.74, 0)
  }

  mechanic.add(leftArm, rightArm)
  mechanic.userData.role = role
  mechanic.userData.initialTorsoY = torso.position.y
  mechanic.userData.torso = torso
  mechanic.userData.leftArm = leftArm
  mechanic.userData.rightArm = rightArm

  return mechanic
}

/**
 * Builds the complete 3D Pit Box with 4 gunners, front/rear jacks, lollipop, gantry, and tire warmers.
 */
export function createPitCrew(teamColor: string, secondaryColor: string): PitCrewRig {
  const group = new THREE.Group()
  const materials: THREE.Material[] = []
  const geometries: THREE.BufferGeometry[] = []

  // Pit Box Tarmac Base & Line Markings
  const boxMarkingsGeo = new THREE.PlaneGeometry(5.4, 3.2)
  geometries.push(boxMarkingsGeo)
  const boxMarkingsMat = new THREE.MeshStandardMaterial({
    color: '#1a1e24',
    roughness: 0.95,
  })
  materials.push(boxMarkingsMat)
  const boxFloor = new THREE.Mesh(boxMarkingsGeo, boxMarkingsMat)
  boxFloor.rotation.x = -Math.PI / 2
  boxFloor.position.set(0, 0.015, 0)
  boxFloor.receiveShadow = true
  group.add(boxFloor)

  // Painted box boundary lines (Yellow/White)
  const borderGeo = new THREE.RingGeometry(2.1, 2.2, 4)
  geometries.push(borderGeo)
  const borderMat = new THREE.MeshBasicMaterial({ color: '#ffcc00', side: THREE.DoubleSide })
  materials.push(borderMat)
  const border = new THREE.Mesh(borderGeo, borderMat)
  border.rotation.x = -Math.PI / 2
  border.rotation.z = Math.PI / 4
  border.scale.set(1.5, 0.9, 1)
  border.position.set(0, 0.02, 0)
  group.add(border)

  // Overhead Gantry & Air Lines
  const gantryGroup = new THREE.Group()
  const trussMat = new THREE.MeshStandardMaterial({ color: '#333b47', metalness: 0.8, roughness: 0.4 })
  materials.push(trussMat)
  const pillarGeo = new THREE.CylinderGeometry(0.08, 0.08, 3.8, 8)
  const boomGeo = new THREE.BoxGeometry(4.6, 0.12, 0.12)
  geometries.push(pillarGeo, boomGeo)

  const rearPillar = new THREE.Mesh(pillarGeo, trussMat)
  rearPillar.position.set(0, 1.9, -1.8)
  rearPillar.castShadow = true
  const overheadBoom = new THREE.Mesh(boomGeo, trussMat)
  overheadBoom.position.set(0, 3.7, -0.4)
  overheadBoom.rotation.y = 0
  gantryGroup.add(rearPillar, overheadBoom)

  // Hanging pneumatic air lines
  const lineGeo = new THREE.CylinderGeometry(0.012, 0.012, 2.2, 4)
  geometries.push(lineGeo)
  const lineMat = new THREE.MeshBasicMaterial({ color: '#00e5ff' })
  materials.push(lineMat)
  const hoseFL = new THREE.Mesh(lineGeo, lineMat)
  hoseFL.position.set(1.4, 2.6, 0.8)
  const hoseFR = new THREE.Mesh(lineGeo, lineMat)
  hoseFR.position.set(1.4, 2.6, -0.8)
  const hoseRL = new THREE.Mesh(lineGeo, lineMat)
  hoseRL.position.set(-1.4, 2.6, 0.8)
  const hoseRR = new THREE.Mesh(lineGeo, lineMat)
  hoseRR.position.set(-1.4, 2.6, -0.8)
  gantryGroup.add(hoseFL, hoseFR, hoseRL, hoseRR)
  group.add(gantryGroup)

  // 4 Tyre Gunners (Front-Left, Front-Right, Rear-Left, Rear-Right)
  const gunners: THREE.Group[] = []
  const gunnerFL = createMechanic(teamColor, secondaryColor, 'gunner', materials, geometries)
  gunnerFL.position.set(1.35, 0, 1.15)
  gunnerFL.rotation.y = -Math.PI / 1.15
  group.add(gunnerFL)
  gunners.push(gunnerFL)

  const gunnerFR = createMechanic(teamColor, secondaryColor, 'gunner', materials, geometries)
  gunnerFR.position.set(1.35, 0, -1.15)
  gunnerFR.rotation.y = Math.PI / 1.15
  group.add(gunnerFR)
  gunners.push(gunnerFR)

  const gunnerRL = createMechanic(teamColor, secondaryColor, 'gunner', materials, geometries)
  gunnerRL.position.set(-1.35, 0, 1.15)
  gunnerRL.rotation.y = -Math.PI / 4
  group.add(gunnerRL)
  gunners.push(gunnerRL)

  const gunnerRR = createMechanic(teamColor, secondaryColor, 'gunner', materials, geometries)
  gunnerRR.position.set(-1.35, 0, -1.15)
  gunnerRR.rotation.y = Math.PI / 4
  group.add(gunnerRR)
  gunners.push(gunnerRR)

  // Front Jack Operator & Quick-Lift Jack
  const frontJackGroup = new THREE.Group()
  const frontJackMechanic = createMechanic(teamColor, secondaryColor, 'frontJack', materials, geometries)
  frontJackMechanic.position.set(2.4, 0, 0)
  frontJackMechanic.rotation.y = -Math.PI / 2
  frontJackGroup.add(frontJackMechanic)

  // 3D Jack Tool
  const jackMat = new THREE.MeshStandardMaterial({ color: '#e10600', metalness: 0.6, roughness: 0.4 })
  materials.push(jackMat)
  const jackHandleGeo = new THREE.CylinderGeometry(0.025, 0.025, 1.6, 6)
  const jackCradleGeo = new THREE.BoxGeometry(0.5, 0.08, 0.35)
  geometries.push(jackHandleGeo, jackCradleGeo)
  const jackHandle = new THREE.Mesh(jackHandleGeo, jackMat)
  jackHandle.position.set(2.0, 0.55, 0)
  jackHandle.rotation.z = Math.PI / 3.5
  const jackCradle = new THREE.Mesh(jackCradleGeo, jackMat)
  jackCradle.position.set(1.55, 0.08, 0)
  frontJackGroup.add(jackHandle, jackCradle)
  group.add(frontJackGroup)

  // Rear Jack Operator & Cradle Jack
  const rearJackGroup = new THREE.Group()
  const rearJackMechanic = createMechanic(teamColor, secondaryColor, 'rearJack', materials, geometries)
  rearJackMechanic.position.set(-2.4, 0, 0)
  rearJackMechanic.rotation.y = Math.PI / 2
  rearJackGroup.add(rearJackMechanic)

  const rearJackHandle = new THREE.Mesh(jackHandleGeo, jackMat)
  rearJackHandle.position.set(-2.0, 0.55, 0)
  rearJackHandle.rotation.z = -Math.PI / 3.5
  const rearJackCradle = new THREE.Mesh(jackCradleGeo, jackMat)
  rearJackCradle.position.set(-1.55, 0.08, 0)
  rearJackGroup.add(rearJackHandle, rearJackCradle)
  group.add(rearJackGroup)

  // Lollipop Controller (Lollipop Board with Red / Green indicators)
  const lollipopGroup = new THREE.Group()
  const lollipopController = createMechanic(teamColor, secondaryColor, 'lollipop', materials, geometries)
  lollipopController.position.set(2.1, 0, 1.45)
  lollipopController.rotation.y = -Math.PI / 1.6
  lollipopGroup.add(lollipopController)

  // Lollipop Pole & Signal Disc
  const poleGeo = new THREE.CylinderGeometry(0.02, 0.02, 2.4, 6)
  const discGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.04, 16)
  const lightGeo = new THREE.SphereGeometry(0.08, 8, 8)
  geometries.push(poleGeo, discGeo, lightGeo)

  const poleMat = new THREE.MeshStandardMaterial({ color: '#555e6d', metalness: 0.8 })
  const discMat = new THREE.MeshStandardMaterial({ color: '#e10600', roughness: 0.2 })
  const lightMat = new THREE.MeshBasicMaterial({ color: '#ff2200' })
  materials.push(poleMat, discMat, lightMat)

  const pole = new THREE.Mesh(poleGeo, poleMat)
  pole.position.set(1.4, 1.65, 0.65)
  pole.rotation.x = Math.PI / 3.2
  pole.rotation.z = -Math.PI / 6

  const lollipopDisc = new THREE.Mesh(discGeo, discMat)
  lollipopDisc.position.set(0.85, 1.4, 0.0)
  lollipopDisc.rotation.z = Math.PI / 2
  lollipopDisc.rotation.y = -Math.PI / 2

  const lollipopLight = new THREE.Mesh(lightGeo, lightMat)
  lollipopLight.position.set(0.85, 1.4, 0.02)
  lollipopGroup.add(pole, lollipopDisc, lollipopLight)
  group.add(lollipopGroup)

  // Spare Tire Stacks with Electric Tire Warmers
  const tireStacks: THREE.Group[] = []
  const tireGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.26, 12)
  const warmerMat = new THREE.MeshStandardMaterial({ color: '#ff1744', roughness: 0.6 })
  geometries.push(tireGeo)
  materials.push(warmerMat)

  const stackPositions = [
    [1.7, -1.6],
    [-1.7, -1.6],
    [1.7, 1.6],
    [-1.7, 1.6],
  ]
  stackPositions.forEach(([sx, sz]) => {
    const stack = new THREE.Group()
    const tire1 = new THREE.Mesh(tireGeo, warmerMat)
    tire1.position.y = 0.13
    const tire2 = new THREE.Mesh(tireGeo, warmerMat)
    tire2.position.y = 0.39
    stack.add(tire1, tire2)
    stack.position.set(sx, 0, sz)
    group.add(stack)
    tireStacks.push(stack)
  })

  // Update & animation loop for the pit stop sequence
  const update = (progress01: number, isPitting: boolean, elapsed: number) => {
    let carElevation = 0

    if (!isPitting) {
      // Idle ready state: lollipop is held up high
      lollipopDisc.position.y = 2.4
      lollipopLight.position.y = 2.4
      discMat.color.set('#00e676')
      lightMat.color.set('#00ff66')
      frontJackGroup.position.y = 0
      rearJackGroup.position.y = 0
      gunners.forEach((g) => {
        g.position.y = 0
      })
      return { carElevation: 0 }
    }

    // Pitting Active Sequence
    // Phase 1: 0.00 - 0.18 -> Car arrives, Lollipop drops RED STOP, Jacks slide under
    // Phase 2: 0.18 - 0.78 -> Jacks LIFT car, Gunners engage with vibration, tires swap
    // Phase 3: 0.78 - 0.90 -> Jacks DROP car, Gunners pull back
    // Phase 4: 0.90 - 1.00 -> Lollipop goes GREEN GO, Car departs

    if (progress01 < 0.18) {
      // Car entering & jack positioning
      lollipopDisc.position.y = 1.35
      lollipopLight.position.y = 1.35
      discMat.color.set('#e10600')
      lightMat.color.set('#ff1744')
      carElevation = 0
    } else if (progress01 < 0.78) {
      // Elevated & gunning
      carElevation = 0.14
      lollipopDisc.position.y = 1.35
      lollipopLight.position.y = 1.35
      discMat.color.set('#e10600')
      lightMat.color.set('#ff1744')

      // Intense gun vibration simulation
      const vibe = Math.sin(elapsed * 55) * 0.015
      gunners.forEach((g, idx) => {
        g.position.x += vibe * (idx % 2 === 0 ? 1 : -1)
        const torso = g.userData.torso as THREE.Mesh | undefined
        if (torso) torso.position.y = (g.userData.initialTorsoY as number) + vibe * 0.5
      })

      // Front & rear jacks levered down
      frontJackGroup.position.x = 0.12
      rearJackGroup.position.x = -0.12
    } else if (progress01 < 0.90) {
      // Jacks drop car
      carElevation = 0.03
      discMat.color.set('#e10600')
      lightMat.color.set('#ff1744')
      frontJackGroup.position.x = 0.4
      rearJackGroup.position.x = -0.4
    } else {
      // Released! Lollipop goes GREEN GO and lifts out of way
      carElevation = 0
      discMat.color.set('#00e676')
      lightMat.color.set('#00ff66')
      lollipopDisc.position.y = 2.4
      lollipopLight.position.y = 2.4
      frontJackGroup.position.x = 0.6
      rearJackGroup.position.x = -0.6
    }

    return { carElevation }
  }

  return {
    group,
    frontJackGroup,
    rearJackGroup,
    lollipopGroup,
    lollipopDisc,
    lollipopLight,
    gunners,
    tireStacks,
    gantryGroup,
    materials,
    geometries,
    update,
  }
}

export function disposePitCrew(rig: PitCrewRig) {
  rig.materials.forEach((m) => m.dispose())
  rig.geometries.forEach((g) => g.dispose())
  rig.group.clear()
}
