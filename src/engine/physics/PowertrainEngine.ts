import type { ErsMode } from '../../types'

export interface PowertrainInput {
  rpm: number
  throttle: number
  speedMs: number
  ersMode: ErsMode
  ersStateOfCharge: number
  engineWearPercent: number
  deltaSeconds: number
}

export interface PowertrainOutput {
  icePowerKw: number
  mguKPowerKw: number
  totalPowerKw: number
  ersStateOfCharge: number
  fuelFlowKgHour: number
  fuelBurnKg: number
}

const MAX_ICE_POWER_KW = 740
const MAX_MGUK_POWER_KW = 120
const ENERGY_STORE_MJ = 4

export function calculatePowertrain(input: PowertrainInput): PowertrainOutput {
  const normalizedRpm = Math.max(0, Math.min(1, (input.rpm - 5000) / 10000))
  const torqueCurve = 0.7 + 0.3 * Math.sin(Math.min(1, normalizedRpm) * Math.PI * 0.72)
  const wearEfficiency = Math.max(0.88, 1 - input.engineWearPercent * 0.0012)
  const icePowerKw = MAX_ICE_POWER_KW * torqueCurve * input.throttle * wearEfficiency

  const requestedDeployment = input.ersMode === 'DEPLOY' ? 1 : input.ersMode === 'BALANCED' ? 0.48 : 0
  const canDeploy = input.ersStateOfCharge > 1
  const mguKPowerKw = canDeploy ? MAX_MGUK_POWER_KW * requestedDeployment : 0
  const deployedMj = (mguKPowerKw * input.deltaSeconds) / 1000
  const harvestKw = input.ersMode === 'HARVEST' ? Math.min(95, 25 + input.speedMs * 0.7) : 18
  const harvestedMj = (harvestKw * input.deltaSeconds) / 1000
  const nextEnergyMj = Math.max(0, Math.min(ENERGY_STORE_MJ, (input.ersStateOfCharge / 100) * ENERGY_STORE_MJ - deployedMj + harvestedMj))

  const fuelFlowKgHour = Math.min(100, 24 + input.throttle * 78)
  const fuelBurnKg = (fuelFlowKgHour / 3600) * input.deltaSeconds

  return {
    icePowerKw,
    mguKPowerKw,
    totalPowerKw: icePowerKw + mguKPowerKw,
    ersStateOfCharge: (nextEnergyMj / ENERGY_STORE_MJ) * 100,
    fuelFlowKgHour,
    fuelBurnKg,
  }
}
