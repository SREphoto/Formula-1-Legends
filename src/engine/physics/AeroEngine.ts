export interface AeroInput {
  velocityMs: number
  frontWingAngle: number
  rearWingAngle: number
  rideHeightFrontMm: number
  rideHeightRearMm: number
  coolingPercent: number
  dirtyAirEfficiency?: number
  timeSeconds?: number
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
}

const AIR_DENSITY = 1.225
const CRITICAL_RIDE_HEIGHT_MM = 20
const PLANK_WEAR_COEFFICIENT = 1.2e-9

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
  } = input

  const clFront = 0.78 + (frontWingAngle / 50) * 0.98
  const clRear = 1.06 + (rearWingAngle / 50) * 1.24
  const averageHeight = (rideHeightFrontMm + rideHeightRearMm) / 2
  const rake = rideHeightRearMm - rideHeightFrontMm
  const floorHeightEfficiency = Math.max(0.62, 1 - Math.abs(16.5 - averageHeight) * 0.025)
  const rakeEfficiency = Math.max(0.82, 1 - Math.abs(7 - rake) * 0.012)
  const clFloor = 2.62 * floorHeightEfficiency * rakeEfficiency
  const clBody = 0.31
  const clTotal = clFront + clRear + clFloor + clBody

  const penetration = Math.max(0, (CRITICAL_RIDE_HEIGHT_MM - rideHeightFrontMm) / CRITICAL_RIDE_HEIGHT_MM)
  const bounce = 0.4 + 0.2 * Math.sin(2 * Math.PI * 7.2 * timeSeconds)
  const porpoiseEfficiency = Math.max(0.48, 1 - penetration * bounce)
  const porpoisingActive = rideHeightFrontMm < CRITICAL_RIDE_HEIGHT_MM && velocityMs > 55

  const cdBase = 0.61
  const cdWings = (frontWingAngle / 50) * 0.23 + (rearWingAngle / 50) * 0.37
  const cdCooling = (coolingPercent / 100) * 0.085
  const inducedDrag = 0.022 * clTotal ** 2
  const cdTotal = cdBase + cdWings + cdCooling + inducedDrag

  const dynamicPressure = 0.5 * AIR_DENSITY * velocityMs ** 2
  const downforceN = dynamicPressure * clTotal * porpoiseEfficiency * Math.max(0.65, Math.min(1, dirtyAirEfficiency))
  const dragN = dynamicPressure * cdTotal
  const frontFloorShare = clFloor * (0.43 + rake * 0.002)
  const frontBalancePercent = ((clFront + frontFloorShare) / clTotal) * 100

  const plankContactMm = Math.max(0, CRITICAL_RIDE_HEIGHT_MM - rideHeightFrontMm)
  const plankWearRateMmPerSecond = PLANK_WEAR_COEFFICIENT * plankContactMm ** 2 * velocityMs ** 2
  const topSpeedEstimateKmh = Math.max(260, 367 - cdTotal * 52)

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
  }
}
