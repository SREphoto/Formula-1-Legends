export type TireCompound = 'SOFT' | 'MEDIUM' | 'HARD' | 'INTERMEDIATE' | 'WET'
export type PaceMode = 'CONSERVE' | 'BALANCED' | 'ATTACK'
export type ErsMode = 'HARVEST' | 'BALANCED' | 'DEPLOY'
export type AppView = 'race' | 'strategy' | 'car' | 'hq'

export interface DriverMeta {
  id: string
  number: number
  code: string
  firstName: string
  lastName: string
  shortName: string
  nationality: string
  team: string
  teamShort: string
  teamColor: string
  secondaryColor: string
  rating: number
  tireSkill: number
  wetSkill: number
  isManaged: boolean
}

export interface DriverState extends DriverMeta {
  position: number
  lap: number
  progress: number
  totalProgress: number
  gap: number
  interval: number
  speed: number
  sector: 1 | 2 | 3
  lastLap: number
  bestLap: number
  tire: TireCompound
  tireAge: number
  tireWear: number
  tireSurfaceTemp: number
  tireCoreTemp: number
  brakeTempFront: number
  brakeTempRear: number
  ers: number
  fuel: number
  plankWear: number
  engineWear: number
  paceMode: PaceMode
  ersMode: ErsMode
  boxThisLap: boolean
  pitStatus: 'NONE' | 'REQUESTED' | 'PITTING' | 'OUT_LAP'
}

export interface RaceEvent {
  id: number
  raceTime: number
  type: 'radio' | 'race-control' | 'strategy' | 'weather' | 'personal-best'
  driverId?: string
  title: string
  message: string
}

export interface RaceSnapshot {
  drivers: DriverState[]
  elapsed: number
  lap: number
  totalLaps: number
  trackTemp: number
  airTemp: number
  rainfall: number
  waterDepth: number
  raceStatus: 'GREEN' | 'YELLOW' | 'VSC' | 'SAFETY CAR'
  tickRate: number
}

export type WorkerCommand =
  | { type: 'INIT' }
  | { type: 'PLAYBACK'; paused?: boolean; speed?: number }
  | { type: 'DRIVER_COMMAND'; driverId: string; paceMode?: PaceMode; ersMode?: ErsMode }
  | { type: 'PIT_COMMAND'; driverId: string; compound: TireCompound; cancel?: boolean }
  | { type: 'WEATHER'; rainfall: number }

export interface SetupState {
  frontWing: number
  rearWing: number
  rideHeightFront: number
  rideHeightRear: number
  brakeBias: number
  tirePressureFront: number
  tirePressureRear: number
  cooling: number
}
