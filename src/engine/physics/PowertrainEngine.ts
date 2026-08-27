import type { ErsMode } from '../../types'

export interface PowertrainInput {
  rpm: number
  throttle: number
  speedMs: number
  ersMode: ErsMode
  ersStateOfCharge: number
  engineWearPercent: number
  deltaSeconds: number
  manualOverrideActive?: boolean
}

export interface PowertrainOutput {
  icePowerKw: number
  mguKPowerKw: number
  totalPowerKw: number
  totalPowerBhp: number
  ersStateOfCharge: number
  fuelFlowKgHour: number
  fuelBurnKg: number
  manualOverrideActive: boolean
  deploymentTaperPercent: number
}

// 2026 FIA Power Unit Regulations:
// 50/50 Split: ICE ~400 kW (~536 bhp) + MGU-K 350 kW (~470 bhp) = ~750 kW (1,006 bhp)
const MAX_ICE_POWER_KW = 400
const MAX_MGUK_POWER_KW = 350
const ENERGY_STORE_MJ = 4.5
const KW_TO_BHP = 1.34102

export function calculatePowertrain(input: PowertrainInput): PowertrainOutput {
  const speedKmh = input.speedMs * 3.6
  const normalizedRpm = Math.max(0, Math.min(1, (input.rpm - 5000) / 10000))
  const torqueCurve = 0.75 + 0.25 * Math.sin(Math.min(1, normalizedRpm) * Math.PI * 0.72)
  const wearEfficiency = Math.max(0.88, 1 - input.engineWearPercent * 0.0012)
  const icePowerKw = MAX_ICE_POWER_KW * torqueCurve * input.throttle * wearEfficiency

  // 2026 Manual Override Mode (MOM / Overtake Mode) Speed Taper Formulation
  // Normal: Above 290 km/h, power tapers down linearly to 0 kW at 355 km/h
  // Override: Full 350 kW available up to 337 km/h, tapering down to 0 kW at 355 km/h
  let taper = 1.0
  if (input.manualOverrideActive) {
    if (speedKmh > 337) {
      taper = Math.max(0, 1 - (speedKmh - 337) / (355 - 337))
    }
  } else {
    if (speedKmh > 290) {
      taper = Math.max(0, 1 - (speedKmh - 290) / (355 - 290))
    }
  }

  const requestedDeployment = input.ersMode === 'DEPLOY' ? 1.0 : input.ersMode === 'BALANCED' ? 0.52 : 0.0
  const canDeploy = input.ersStateOfCharge > 0.5
  const mguKPowerKw = canDeploy ? MAX_MGUK_POWER_KW * requestedDeployment * taper : 0
  const deployedMj = (mguKPowerKw * input.deltaSeconds) / 1000

  // 2026 Regenerative Braking: 8.5 MJ/lap capacity under braking
  const isBraking = input.throttle < 0.1 && input.speedMs > 10
  const harvestKw = isBraking
    ? Math.min(350, 120 + input.speedMs * 3.5)
    : input.ersMode === 'HARVEST'
      ? Math.min(160, 45 + input.speedMs * 1.8)
      : 35
  const harvestedMj = (harvestKw * input.deltaSeconds) / 1000

  const nextEnergyMj = Math.max(
    0,
    Math.min(ENERGY_STORE_MJ, (input.ersStateOfCharge / 100) * ENERGY_STORE_MJ - deployedMj + harvestedMj),
  )

  // 2026 Sustainable fuel energy limit: ~3,000 MJ/h (~70-72 kg/h max flow)
  const fuelFlowKgHour = Math.min(71.5, 16 + input.throttle * 55.5)
  const fuelBurnKg = (fuelFlowKgHour / 3600) * input.deltaSeconds

  const totalPowerKw = icePowerKw + mguKPowerKw
  const totalPowerBhp = totalPowerKw * KW_TO_BHP

  return {
    icePowerKw,
    mguKPowerKw,
    totalPowerKw,
    totalPowerBhp,
    ersStateOfCharge: (nextEnergyMj / ENERGY_STORE_MJ) * 100,
    fuelFlowKgHour,
    fuelBurnKg,
    manualOverrideActive: !!input.manualOverrideActive,
    deploymentTaperPercent: Math.round(taper * 100),
  }
}
