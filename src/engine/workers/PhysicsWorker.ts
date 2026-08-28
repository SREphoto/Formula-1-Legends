/// <reference lib="webworker" />

import { DRIVER_GRID, INITIAL_COMPOUNDS } from '../../data/drivers'
import type { DriverState, RaceSnapshot, TireCompound, WorkerCommand } from '../../types'
import { TIRE_PROFILES, getTireGrip } from '../physics/TireThermodynamics'

const TICK_SECONDS = 0.01
const TELEMETRY_DIVISOR = 10
const BASE_LAP_TIME = 89.62
const TOTAL_LAPS = 52
const workerScope = self as unknown as DedicatedWorkerGlobalScope

let paused = false
let playbackSpeed = 1
let elapsed = 43 * 60 + 12.438
let ticks = 0
let rainfall = 0
let waterDepth = 0
const nextCompound = new Map<string, TireCompound>()
const lastProcessedLap = new Map<string, number>()
const pitTimers = new Map<string, number>()
const pitStationaryDurations = new Map<string, number>()
const pitStationaryTimers = new Map<string, number>()

let drivers: DriverState[] = DRIVER_GRID.map((driver, index) => {
  const compound = INITIAL_COMPOUNDS[index]
  const tireAge = 9 + ((index * 3) % 12)
  const profile = TIRE_PROFILES[compound]
  const totalProgress = 27.78 - index * 0.0064 - (index > 8 ? (index - 8) * 0.0015 : 0)
  lastProcessedLap.set(driver.id, Math.floor(totalProgress))
  return {
    ...driver,
    position: index + 1,
    lap: 28,
    progress: totalProgress % 1,
    totalProgress,
    gap: index * 0.58,
    interval: index === 0 ? 0 : 0.58,
    speed: 284 - (index % 4) * 7,
    sector: totalProgress % 1 < 0.34 ? 1 : totalProgress % 1 < 0.68 ? 2 : 3,
    lastLap: BASE_LAP_TIME + index * 0.038 + ((index % 3) - 1) * 0.14,
    bestLap: 88.941 + index * 0.057,
    tire: compound,
    tireAge,
    tireWear: Math.min(82, tireAge * profile.wearPerLap * (1.04 - driver.tireSkill / 1000)),
    tireSurfaceTemp: profile.optimumMin + 7 + (index % 4) * 1.4,
    tireCoreTemp: profile.optimumMin + 8.5 + (index % 3) * 1.1,
    brakeTempFront: 690 + (index % 5) * 24,
    brakeTempRear: 615 + (index % 4) * 21,
    ers: 46 + (index * 7) % 45,
    fuel: 48.6 - index * 0.06,
    plankWear: 0.31 + (index % 6) * 0.028,
    engineWear: 31 + (index % 7) * 2.7,
    paceMode: 'BALANCED',
    ersMode: index % 5 === 0 ? 'DEPLOY' : 'BALANCED',
    boxThisLap: false,
    pitStatus: 'NONE',
  }
})

function trackSpeed(progress: number, rating: number): number {
  const p = progress * Math.PI * 2
  const cornerLoad =
    0.44 * Math.max(0, Math.sin(p * 3 + 0.45)) +
    0.32 * Math.max(0, Math.sin(p * 5 - 0.7)) +
    0.22 * Math.max(0, Math.sin(p * 9 + 1.2))
  return Math.max(108, 329 - cornerLoad * 198 + (rating - 92) * 0.55)
}

function stepDriver(driver: DriverState, simulationDelta: number): DriverState {
  const profile = TIRE_PROFILES[driver.tire]
  const grip = getTireGrip(driver.tire, driver.tireWear, driver.tireCoreTemp, waterDepth)
  const paceFactor = driver.paceMode === 'ATTACK' ? 1.0075 : driver.paceMode === 'CONSERVE' ? 0.992 : 1
  const ersFactor = driver.ersMode === 'DEPLOY' && driver.ers > 2 ? 1.0038 : driver.ersMode === 'HARVEST' ? 0.9955 : 1
  const talentFactor = 1 + (driver.rating - 94) * 0.00085
  const tireFactor = 0.992 + Math.min(0.01, grip.effectiveGrip * 0.008)
  const deterministicVariation = 1 + Math.sin(elapsed * 0.17 + driver.number * 0.63) * 0.0008
  const pitTimer = pitTimers.get(driver.id) ?? 0
  const pitFactor = pitTimer > 0 ? 0.12 : 1
  const lapRate = (paceFactor * ersFactor * talentFactor * tireFactor * deterministicVariation * pitFactor) / BASE_LAP_TIME
  const oldTotal = driver.totalProgress
  let totalProgress = oldTotal + lapRate * simulationDelta
  const progress = ((totalProgress % 1) + 1) % 1
  const speed = pitTimer > 0 ? 79 + Math.sin(elapsed) * 4 : trackSpeed(progress, driver.rating)
  const nextFloor = Math.floor(totalProgress)
  const processedLap = lastProcessedLap.get(driver.id) ?? Math.floor(oldTotal)
  let tire = driver.tire
  let tireAge = driver.tireAge
  let tireWear = driver.tireWear
  let tireSurfaceTemp = driver.tireSurfaceTemp
  let tireCoreTemp = driver.tireCoreTemp
  let lastLap = driver.lastLap
  let bestLap = driver.bestLap
  let pitStatus = driver.pitStatus
  let boxThisLap = driver.boxThisLap

  if (nextFloor > processedLap) {
    lastProcessedLap.set(driver.id, nextFloor)
    const completedLapTime = BASE_LAP_TIME / Math.max(0.985, paceFactor * talentFactor * tireFactor)
    lastLap = completedLapTime
    bestLap = Math.min(bestLap, completedLapTime)
    tireAge += 1

    if (driver.boxThisLap) {
      tire = nextCompound.get(driver.id) ?? 'HARD'
      tireAge = 0
      tireWear = 0.4
      const newProfile = TIRE_PROFILES[tire]
      tireSurfaceTemp = newProfile.optimumMin - 3
      tireCoreTemp = newProfile.optimumMin - 6
      const stopDuration = Number((1.8 + Math.random() * 2.4).toFixed(2))
      pitStationaryDurations.set(driver.id, stopDuration)
      pitStationaryTimers.set(driver.id, stopDuration)
      const totalPitDelta = 5.0 + stopDuration
      totalProgress -= totalPitDelta / BASE_LAP_TIME
      pitTimers.set(driver.id, totalPitDelta)
      pitStatus = 'PITTING'
      boxThisLap = false
      nextCompound.delete(driver.id)
    }
  }

  if (pitTimer > 0) {
    const remaining = Math.max(0, pitTimer - simulationDelta)
    pitTimers.set(driver.id, remaining)
    const stationary = pitStationaryTimers.get(driver.id) ?? 0
    if (stationary > 0) {
      pitStationaryTimers.set(driver.id, Math.max(0, stationary - simulationDelta))
    }
    if (remaining === 0) {
      pitStatus = 'OUT_LAP'
      pitStationaryTimers.delete(driver.id)
    }
  } else if (pitStatus === 'OUT_LAP' && progress > 0.22) {
    pitStatus = 'NONE'
    pitStationaryDurations.delete(driver.id)
  }

  const wearMultiplier = driver.paceMode === 'ATTACK' ? 1.24 : driver.paceMode === 'CONSERVE' ? 0.72 : 1
  const skillMultiplier = 1.13 - driver.tireSkill * 0.0014
  tireWear = Math.min(100, tireWear + (profile.wearPerLap / BASE_LAP_TIME) * simulationDelta * wearMultiplier * skillMultiplier)

  const targetCore = profile.optimumMin + 8 + (driver.paceMode === 'ATTACK' ? 6 : driver.paceMode === 'CONSERVE' ? -4 : 0)
  const targetSurface = targetCore + 7 + Math.abs(Math.sin(progress * Math.PI * 8)) * 5
  tireSurfaceTemp += (targetSurface - tireSurfaceTemp) * Math.min(1, simulationDelta * 0.09)
  tireCoreTemp += (targetCore - tireCoreTemp) * Math.min(1, simulationDelta * 0.035)

  const braking = Math.max(0, 1 - speed / 300)
  const brakeTargetFront = 560 + braking * 470
  const brakeTargetRear = 510 + braking * 390
  const brakeTempFront = driver.brakeTempFront + (brakeTargetFront - driver.brakeTempFront) * Math.min(1, simulationDelta * 0.25)
  const brakeTempRear = driver.brakeTempRear + (brakeTargetRear - driver.brakeTempRear) * Math.min(1, simulationDelta * 0.22)

  const deployRate = driver.ersMode === 'DEPLOY' ? -1.15 : driver.ersMode === 'HARVEST' ? 0.82 : Math.sin(progress * Math.PI * 6) > 0 ? 0.24 : -0.19
  const ers = Math.max(0, Math.min(100, driver.ers + deployRate * simulationDelta))
  const fuel = Math.max(0, driver.fuel - (1.8 / BASE_LAP_TIME) * simulationDelta * (driver.paceMode === 'ATTACK' ? 1.06 : 1))
  const plankWear = Math.min(1.2, driver.plankWear + (speed > 285 ? 0.0000028 : 0.0000004) * simulationDelta)
  const engineWear = Math.min(100, driver.engineWear + 0.000018 * simulationDelta)
  const recalculatedProgress = ((totalProgress % 1) + 1) % 1

  return {
    ...driver,
    totalProgress,
    progress: recalculatedProgress,
    lap: Math.min(TOTAL_LAPS, Math.floor(totalProgress) + 1),
    speed,
    sector: recalculatedProgress < 0.34 ? 1 : recalculatedProgress < 0.68 ? 2 : 3,
    lastLap,
    bestLap,
    tire,
    tireAge,
    tireWear,
    tireSurfaceTemp,
    tireCoreTemp,
    brakeTempFront,
    brakeTempRear,
    ers,
    fuel,
    plankWear,
    engineWear,
    pitStatus,
    boxThisLap,
    pitDuration: pitStationaryDurations.get(driver.id),
    pitStopTimer: pitStationaryTimers.get(driver.id),
  }
}

function rankDrivers(): void {
  drivers.sort((a, b) => b.totalProgress - a.totalProgress)
  const leader = drivers[0]
  const leaderLapTime = leader.lastLap || BASE_LAP_TIME

  drivers = drivers.map((driver, index) => {
    const ahead = index > 0 ? drivers[index - 1] : undefined
    return {
      ...driver,
      position: index + 1,
      gap: index === 0 ? 0 : Math.max(0, (leader.totalProgress - driver.totalProgress) * leaderLapTime),
      interval: ahead ? Math.max(0, (ahead.totalProgress - driver.totalProgress) * leaderLapTime) : 0,
    }
  })
}

function snapshot(): RaceSnapshot {
  return {
    drivers,
    elapsed,
    lap: Math.min(TOTAL_LAPS, Math.floor(drivers[0].totalProgress) + 1),
    totalLaps: TOTAL_LAPS,
    trackTemp: 32.4 - rainfall * 0.08,
    airTemp: 21.6,
    rainfall,
    waterDepth,
    raceStatus: 'GREEN',
    tickRate: 100,
  }
}

function simulationTick(): void {
  if (!paused) {
    const simulationDelta = TICK_SECONDS * playbackSpeed
    elapsed += simulationDelta
    waterDepth = Math.max(0, Math.min(4, waterDepth + (rainfall * 0.00018 - 0.00016) * simulationDelta))
    drivers = drivers.map((driver) => stepDriver(driver, simulationDelta))
    rankDrivers()
  }

  ticks += 1
  if (ticks % TELEMETRY_DIVISOR === 0) workerScope.postMessage(snapshot())
}

workerScope.onmessage = (event: MessageEvent<WorkerCommand>) => {
  const command = event.data
  if (command.type === 'INIT') {
    workerScope.postMessage(snapshot())
    return
  }

  if (command.type === 'PLAYBACK') {
    if (typeof command.paused === 'boolean') paused = command.paused
    if (typeof command.speed === 'number') playbackSpeed = Math.max(0.5, Math.min(4, command.speed))
    return
  }

  if (command.type === 'DRIVER_COMMAND') {
    drivers = drivers.map((driver) => driver.id === command.driverId
      ? {
          ...driver,
          paceMode: command.paceMode ?? driver.paceMode,
          ersMode: command.ersMode ?? driver.ersMode,
        }
      : driver)
    return
  }

  if (command.type === 'PIT_COMMAND') {
    drivers = drivers.map((driver) => driver.id === command.driverId
      ? { ...driver, boxThisLap: !command.cancel, pitStatus: command.cancel ? 'NONE' : 'REQUESTED' }
      : driver)
    if (command.cancel) nextCompound.delete(command.driverId)
    else nextCompound.set(command.driverId, command.compound)
    return
  }

  if (command.type === 'WEATHER') {
    rainfall = Math.max(0, Math.min(100, command.rainfall))
    return
  }

  if (command.type === 'SET_MANAGED_TEAM') {
    const code = command.teamShort.toUpperCase()
    drivers = drivers.map((driver) => ({
      ...driver,
      isManaged: driver.teamShort.toUpperCase() === code || (code === 'RB' && driver.teamShort.toUpperCase() === 'VCARB') || (code === 'HAA' && driver.teamShort.toUpperCase() === 'HAS') || (code === 'AMR' && driver.teamShort.toUpperCase() === 'AST')
    }))
    workerScope.postMessage(snapshot())
    return
  }
}

setInterval(simulationTick, TICK_SECONDS * 1000)
