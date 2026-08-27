export interface AeroInput {
  velocityMs: number
  frontWingAngle: number
  rearWingAngle: number
  rideHeightFrontMm: number
  rideHeightRearMm: number
  coolingPercent: number
  dirtyAirEfficiency?: number
  timeSeconds?: number
  activeAeroMode?: 'CORNER' | 'STRAIGHT'
}

export interface AeroOutput {
  downforceN: number
  dragN: number
  frontBalancePercent: number
  porpoisingActive: boolean
  porpoiseEfficiency: number
  plankWearRateMmPerSecond: number
  clTotal: number
  cdTotal: number
  topSpeedEstimateKmh: number
  activeAeroMode: 'CORNER' | 'STRAIGHT'
  dragReductionPercent: number
}

const AIR_DENSITY = 1.225
// 2026 Regulations: Partially flat floor reduces critical ride height threshold
const CRITICAL_RIDE_HEIGHT_MM = 16.5
const PLANK_WEAR_COEFFICIENT = 0.95e-9

export function calculateAero(input: AeroInput): AeroOutput {
  const {
    velocityMs,
    frontWingAngle,
    rearWingAngle,
    rideHeightFrontMm,
    rideHeightRearMm,
    coolingPercent,
    dirtyAirEfficiency = 1,
    timeSeconds = 0,
    activeAeroMode = 'CORNER',
  } = input

  // Active Aerodynamics modifiers (2026 Straight Mode X-Mode vs Corner Mode Z-Mode)
  const isStraightMode = activeAeroMode === 'STRAIGHT'
  const frontWingTrim = isStraightMode ? 0.65 : 1.0 // Shed front load in Straight Mode
  const rearWingTrim = isStraightMode ? 0.52 : 1.0  // Shed 48% rear wing drag/lift

  const clFront = (0.74 + (frontWingAngle / 50) * 0.92) * frontWingTrim
  const clRear = (0.98 + (rearWingAngle / 50) * 1.18) * rearWingTrim
  const averageHeight = (rideHeightFrontMm + rideHeightRearMm) / 2
  const rake = rideHeightRearMm - rideHeightFrontMm

  // 2026 Partially flat floor equation: less sensitive to rake/ride height
  const floorHeightEfficiency = Math.max(0.72, 1 - Math.abs(17.0 - averageHeight) * 0.018)
  const rakeEfficiency = Math.max(0.88, 1 - Math.abs(6.5 - rake) * 0.008)
  const clFloor = 2.15 * floorHeightEfficiency * rakeEfficiency
  const clBody = 0.28
  const clTotal = clFront + clRear + clFloor + clBody

  // 2026 Porpoising mitigation (vastly improved stability over 2022-2025 ground effect cars)
  const penetration = Math.max(0, (CRITICAL_RIDE_HEIGHT_MM - rideHeightFrontMm) / CRITICAL_RIDE_HEIGHT_MM)
  const bounce = 0.3 + 0.15 * Math.sin(2 * Math.PI * 6.5 * timeSeconds)
  const porpoiseEfficiency = Math.max(0.65, 1 - penetration * bounce)
  const porpoisingActive = rideHeightFrontMm < CRITICAL_RIDE_HEIGHT_MM && velocityMs > 62

  const cdBase = 0.52 // Narrower 1900mm width lower base drag
  const cdFront = ((frontWingAngle / 50) * 0.19) * frontWingTrim
  const cdRear = ((rearWingAngle / 50) * 0.34) * rearWingTrim
  const cdCooling = (coolingPercent / 100) * 0.075
  const inducedDrag = 0.019 * clTotal ** 2
  const cdTotal = cdBase + cdFront + cdRear + cdCooling + inducedDrag

  // Reference baseline drag for Corner Mode to calculate reduction %
  const cdCornerBaseline = cdBase + (frontWingAngle / 50) * 0.19 + (rearWingAngle / 50) * 0.34 + cdCooling + 0.019 * (0.74 + (frontWingAngle / 50) * 0.92 + 0.98 + (rearWingAngle / 50) * 1.18 + clFloor + clBody) ** 2
  const dragReductionPercent = isStraightMode ? Math.max(0, ((cdCornerBaseline - cdTotal) / cdCornerBaseline) * 100) : 0

  const dynamicPressure = 0.5 * AIR_DENSITY * velocityMs ** 2
  const downforceN = dynamicPressure * clTotal * porpoiseEfficiency * Math.max(0.7, Math.min(1, dirtyAirEfficiency))
  const dragN = dynamicPressure * cdTotal
  const frontFloorShare = clFloor * (0.44 + rake * 0.0018)
  const frontBalancePercent = ((clFront + frontFloorShare) / clTotal) * 100

  const plankContactMm = Math.max(0, CRITICAL_RIDE_HEIGHT_MM - rideHeightFrontMm)
  const plankWearRateMmPerSecond = PLANK_WEAR_COEFFICIENT * plankContactMm ** 2 * velocityMs ** 2
  const topSpeedEstimateKmh = isStraightMode
    ? Math.max(290, 385 - cdTotal * 58)
    : Math.max(265, 362 - cdTotal * 52)

  return {
    downforceN,
    dragN,
    frontBalancePercent,
    porpoisingActive,
    porpoiseEfficiency,
    plankWearRateMmPerSecond,
    clTotal,
    cdTotal,
    topSpeedEstimateKmh,
    activeAeroMode,
    dragReductionPercent,
  }
}
