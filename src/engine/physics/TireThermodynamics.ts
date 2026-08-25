import type { TireCompound } from '../../types'

export interface TireProfile {
  baseGrip: number
  optimumMin: number
  optimumMax: number
  wearExponent: number
  cliffWear: number
  wearPerLap: number
}

export interface TireStateInput {
  compound: TireCompound
  wearPercent: number
  surfaceTempC: number
  coreTempC: number
  trackTempC: number
  waterDepthMm: number
  slipSpeedMs: number
  verticalLoadN: number
  wheelAngularVelocity: number
}

export interface TireStateOutput {
  effectiveGrip: number
  wearFactor: number
  thermalFactor: number
  waterFactor: number
  surfaceTempC: number
  coreTempC: number
  condition: 'COLD' | 'OPTIMAL' | 'HOT' | 'CLIFF'
}

export const TIRE_PROFILES: Record<TireCompound, TireProfile> = {
  SOFT: { baseGrip: 1.25, optimumMin: 90, optimumMax: 105, wearExponent: 1.8, cliffWear: 65, wearPerLap: 3.25 },
  MEDIUM: { baseGrip: 1.15, optimumMin: 95, optimumMax: 110, wearExponent: 1.4, cliffWear: 75, wearPerLap: 2.35 },
  HARD: { baseGrip: 1.05, optimumMin: 100, optimumMax: 115, wearExponent: 1.1, cliffWear: 85, wearPerLap: 1.7 },
  INTERMEDIATE: { baseGrip: 1.1, optimumMin: 70, optimumMax: 90, wearExponent: 1.3, cliffWear: 70, wearPerLap: 2.6 },
  WET: { baseGrip: 0.95, optimumMin: 60, optimumMax: 80, wearExponent: 1.2, cliffWear: 70, wearPerLap: 2.1 },
}

export function getTireGrip(
  compound: TireCompound,
  wearPercent: number,
  coreTempC: number,
  waterDepthMm: number,
): Pick<TireStateOutput, 'effectiveGrip' | 'wearFactor' | 'thermalFactor' | 'waterFactor' | 'condition'> {
  const profile = TIRE_PROFILES[compound]
  const wear = Math.max(0, Math.min(1, wearPercent / 100))
  let wearFactor = 1 - wear ** profile.wearExponent
  if (wearPercent >= profile.cliffWear) wearFactor *= 0.82

  let thermalFactor = 1
  if (coreTempC < profile.optimumMin) thermalFactor -= (profile.optimumMin - coreTempC) * 0.008
  if (coreTempC > profile.optimumMax) thermalFactor -= (coreTempC - profile.optimumMax) * 0.012
  thermalFactor = Math.max(0.5, thermalFactor)

  let waterFactor = 1
  if (compound === 'SOFT' || compound === 'MEDIUM' || compound === 'HARD') {
    waterFactor = waterDepthMm > 0.3 ? Math.max(0.2, 1 - waterDepthMm * 0.75) : 1
  } else if (compound === 'INTERMEDIATE') {
    waterFactor = waterDepthMm < 0.2 ? 0.88 : waterDepthMm > 2 ? 0.76 : 1
  } else {
    waterFactor = waterDepthMm < 0.5 ? 0.8 : 1
  }

  const condition: TireStateOutput['condition'] = wearPercent >= profile.cliffWear
    ? 'CLIFF'
    : coreTempC < profile.optimumMin
      ? 'COLD'
      : coreTempC > profile.optimumMax
        ? 'HOT'
        : 'OPTIMAL'

  return {
    effectiveGrip: profile.baseGrip * wearFactor * thermalFactor * waterFactor,
    wearFactor,
    thermalFactor,
    waterFactor,
    condition,
  }
}

export function stepTireThermals(input: TireStateInput, deltaSeconds: number): TireStateOutput {
  const grip = getTireGrip(input.compound, input.wearPercent, input.coreTempC, input.waterDepthMm)
  const frictionHeat = 0.000011 * Math.abs(input.slipSpeedMs) * input.verticalLoadN
  const surfaceToCore = 0.15 * (input.surfaceTempC - input.coreTempC)
  const ambientLoss = 0.022 * (input.surfaceTempC - input.trackTempC)
  const deflectionHeat = 0.000000007 * input.wheelAngularVelocity ** 2 * input.verticalLoadN
  const rimLoss = 0.012 * (input.coreTempC - 65)

  const surfaceTempC = input.surfaceTempC + (frictionHeat - surfaceToCore - ambientLoss) * deltaSeconds
  const coreTempC = input.coreTempC + (surfaceToCore + deflectionHeat - rimLoss) * deltaSeconds

  return { ...grip, surfaceTempC, coreTempC }
}
