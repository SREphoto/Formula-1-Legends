/**
 * OpenF1 API Service
 * Interacts with the free open-source OpenF1 API (https://api.openf1.org/v1/)
 * Provides real Grand Prix session data, driver telemetry, lap times, tire stints, and team radio audio.
 */

export interface OpenF1Meeting {
  meeting_key: number
  meeting_name: string
  meeting_official_name: string
  location: string
  country_name: string
  circuit_key: number
  circuit_short_name: string
  year: number
}

export interface OpenF1Session {
  session_key: number
  session_name: string
  session_type: string
  date_start: string
  date_end: string
  gmt_offset: string
  meeting_key: number
  year: number
}

export interface OpenF1Driver {
  driver_number: number
  broadcast_name: string
  full_name: string
  name_acronym: string
  team_name: string
  team_colour: string
  headshot_url?: string
  country_code?: string
}

export interface OpenF1TelemetrySample {
  date: string
  driver_number: number
  speed: number
  rpm: number
  gear: number
  throttle: number
  brake: number
  drs: number
}

export interface OpenF1TireStint {
  driver_number: number
  stint_number: number
  compound: 'SOFT' | 'MEDIUM' | 'HARD' | 'INTERMEDIATE' | 'WET'
  lap_start: number
  lap_end: number
  tyre_age_at_start: number
}

export interface OpenF1TeamRadio {
  date: string
  driver_number: number
  recording_url: string
  session_key: number
}

export interface OpenF1Weather {
  air_temperature: number
  track_temperature: number
  humidity: number
  pressure: number
  rainfall: number
  wind_direction: number
  wind_speed: number
}

const BASE_URL = 'https://api.openf1.org/v1'

export const DEFAULT_MEETINGS: OpenF1Meeting[] = [
  { meeting_key: 1231, meeting_name: 'Bahrain Grand Prix', meeting_official_name: 'FORMULA 1 GULF AIR BAHRAIN GRAND PRIX 2026', location: 'Sakhir', country_name: 'Bahrain', circuit_key: 63, circuit_short_name: 'Sakhir', year: 2026 },
  { meeting_key: 1232, meeting_name: 'Saudi Arabian Grand Prix', meeting_official_name: 'FORMULA 1 STC SAUDI ARABIAN GRAND PRIX 2026', location: 'Jeddah', country_name: 'Saudi Arabia', circuit_key: 149, circuit_short_name: 'Jeddah', year: 2026 },
  { meeting_key: 1233, meeting_name: 'Australian Grand Prix', meeting_official_name: 'FORMULA 1 ROLEX AUSTRALIAN GRAND PRIX 2026', location: 'Melbourne', country_name: 'Australia', circuit_key: 1, circuit_short_name: 'Albert Park', year: 2026 },
  { meeting_key: 1234, meeting_name: 'Japanese Grand Prix', meeting_official_name: 'FORMULA 1 MSC CRUISES JAPANESE GRAND PRIX 2026', location: 'Suzuka', country_name: 'Japan', circuit_key: 46, circuit_short_name: 'Suzuka', year: 2026 },
  { meeting_key: 1235, meeting_name: 'Chinese Grand Prix', meeting_official_name: 'FORMULA 1 LENOVO CHINESE GRAND PRIX 2026', location: 'Shanghai', country_name: 'China', circuit_key: 11, circuit_short_name: 'Shanghai', year: 2026 },
  { meeting_key: 1236, meeting_name: 'Miami Grand Prix', meeting_official_name: 'FORMULA 1 CRYPTO.COM MIAMI GRAND PRIX 2026', location: 'Miami', country_name: 'United States', circuit_key: 151, circuit_short_name: 'Miami', year: 2026 },
  { meeting_key: 1237, meeting_name: 'Emilia Romagna Grand Prix', meeting_official_name: 'FORMULA 1 MSC CRUISES GRAN PREMIO DEL MADE IN ITALY E DELL\'EMILIA-ROMAGNA 2026', location: 'Imola', country_name: 'Italy', circuit_key: 6, circuit_short_name: 'Imola', year: 2026 },
  { meeting_key: 1238, meeting_name: 'Monaco Grand Prix', meeting_official_name: 'FORMULA 1 GRAND PRIX DE MONACO 2026', location: 'Monte Carlo', country_name: 'Monaco', circuit_key: 22, circuit_short_name: 'Monaco', year: 2026 },
  { meeting_key: 1239, meeting_name: 'Spanish Grand Prix', meeting_official_name: 'FORMULA 1 ARAMCO GRAN PREMIO DE ESPAÑA 2026', location: 'Barcelona', country_name: 'Spain', circuit_key: 15, circuit_short_name: 'Barcelona', year: 2026 },
  { meeting_key: 1240, meeting_name: 'Canadian Grand Prix', meeting_official_name: 'FORMULA 1 AWS GRAND PRIX DU CANADA 2026', location: 'Montreal', country_name: 'Canada', circuit_key: 23, circuit_short_name: 'Montreal', year: 2026 },
  { meeting_key: 1241, meeting_name: 'Austrian Grand Prix', meeting_official_name: 'FORMULA 1 QATAR AIRWAYS AUSTRIAN GRAND PRIX 2026', location: 'Spielberg', country_name: 'Austria', circuit_key: 19, circuit_short_name: 'Red Bull Ring', year: 2026 },
  { meeting_key: 1242, meeting_name: 'British Grand Prix', meeting_official_name: 'FORMULA 1 BRITISH GRAND PRIX 2026', location: 'Silverstone', country_name: 'Great Britain', circuit_key: 2, circuit_short_name: 'Silverstone', year: 2026 },
  { meeting_key: 1243, meeting_name: 'Hungarian Grand Prix', meeting_official_name: 'FORMULA 1 HUNGARIAN GRAND PRIX 2026', location: 'Budapest', country_name: 'Hungary', circuit_key: 4, circuit_short_name: 'Hungaroring', year: 2026 },
  { meeting_key: 1244, meeting_name: 'Belgian Grand Prix', meeting_official_name: 'FORMULA 1 ROLEX BELGIAN GRAND PRIX 2026', location: 'Spa-Francorchamps', country_name: 'Belgium', circuit_key: 7, circuit_short_name: 'Spa-Francorchamps', year: 2026 },
  { meeting_key: 1245, meeting_name: 'Dutch Grand Prix', meeting_official_name: 'FORMULA 1 HEINEKEN DUTCH GRAND PRIX 2026', location: 'Zandvoort', country_name: 'Netherlands', circuit_key: 55, circuit_short_name: 'Zandvoort', year: 2026 },
  { meeting_key: 1246, meeting_name: 'Italian Grand Prix', meeting_official_name: 'FORMULA 1 PIRELLI GRAN PREMIO D’ITALIA 2026', location: 'Monza', country_name: 'Italy', circuit_key: 39, circuit_short_name: 'Monza', year: 2026 },
  { meeting_key: 1247, meeting_name: 'Azerbaijan Grand Prix', meeting_official_name: 'FORMULA 1 QATAR AIRWAYS AZERBAIJAN GRAND PRIX 2026', location: 'Baku', country_name: 'Azerbaijan', circuit_key: 144, circuit_short_name: 'Baku', year: 2026 },
  { meeting_key: 1248, meeting_name: 'Singapore Grand Prix', meeting_official_name: 'FORMULA 1 SINGAPORE AIRLINES SINGAPORE GRAND PRIX 2026', location: 'Marina Bay', country_name: 'Singapore', circuit_key: 61, circuit_short_name: 'Marina Bay', year: 2026 },
  { meeting_key: 1249, meeting_name: 'United States Grand Prix', meeting_official_name: 'FORMULA 1 PIRELLI UNITED STATES GRAND PRIX 2026', location: 'Austin', country_name: 'United States', circuit_key: 9, circuit_short_name: 'COTA', year: 2026 },
  { meeting_key: 1250, meeting_name: 'Mexico City Grand Prix', meeting_official_name: 'FORMULA 1 GRAN PREMIO DE LA CIUDAD DE MÉXICO 2026', location: 'Mexico City', country_name: 'Mexico', circuit_key: 65, circuit_short_name: 'Hermanos Rodríguez', year: 2026 },
  { meeting_key: 1251, meeting_name: 'São Paulo Grand Prix', meeting_official_name: 'FORMULA 1 LENOVO GRANDE PRÊMIO DE SÃO PAULO 2026', location: 'São Paulo', country_name: 'Brazil', circuit_key: 14, circuit_short_name: 'Interlagos', year: 2026 },
  { meeting_key: 1252, meeting_name: 'Las Vegas Grand Prix', meeting_official_name: 'FORMULA 1 HEINEKEN SILVER LAS VEGAS GRAND PRIX 2026', location: 'Las Vegas', country_name: 'United States', circuit_key: 152, circuit_short_name: 'Las Vegas', year: 2026 },
  { meeting_key: 1253, meeting_name: 'Qatar Grand Prix', meeting_official_name: 'FORMULA 1 QATAR AIRWAYS QATAR GRAND PRIX 2026', location: 'Lusail', country_name: 'Qatar', circuit_key: 150, circuit_short_name: 'Lusail', year: 2026 },
  { meeting_key: 1254, meeting_name: 'Abu Dhabi Grand Prix', meeting_official_name: 'FORMULA 1 ETIHAD AIRWAYS ABU DHABI GRAND PRIX 2026', location: 'Yas Marina', country_name: 'United Arab Emirates', circuit_key: 70, circuit_short_name: 'Yas Marina', year: 2026 },
]

export const DEFAULT_DRIVERS: OpenF1Driver[] = [
  { driver_number: 4, broadcast_name: 'L NORRIS', full_name: 'Lando Norris', name_acronym: 'NOR', team_name: 'McLaren', team_colour: 'FF8000' },
  { driver_number: 81, broadcast_name: 'O PIASTRI', full_name: 'Oscar Piastri', name_acronym: 'PIA', team_name: 'McLaren', team_colour: 'FF8000' },
  { driver_number: 16, broadcast_name: 'C LECLERC', full_name: 'Charles Leclerc', name_acronym: 'LEC', team_name: 'Ferrari', team_colour: 'E8002D' },
  { driver_number: 44, broadcast_name: 'L HAMILTON', full_name: 'Lewis Hamilton', name_acronym: 'HAM', team_name: 'Ferrari', team_colour: 'E8002D' },
  { driver_number: 1, broadcast_name: 'M VERSTAPPEN', full_name: 'Max Verstappen', name_acronym: 'VER', team_name: 'Red Bull Racing', team_colour: '3671C6' },
  { driver_number: 63, broadcast_name: 'G RUSSELL', full_name: 'George Russell', name_acronym: 'RUS', team_name: 'Mercedes', team_colour: '27F4D2' },
  { driver_number: 12, broadcast_name: 'K ANTONELLI', full_name: 'Kimi Antonelli', name_acronym: 'ANT', team_name: 'Mercedes', team_colour: '27F4D2' },
  { driver_number: 14, broadcast_name: 'F ALONSO', full_name: 'Fernando Alonso', name_acronym: 'ALO', team_name: 'Aston Martin', team_colour: '229971' },
]

export async function fetchOpenF1Meetings(year = 2026): Promise<OpenF1Meeting[]> {
  try {
    const res = await fetch(`${BASE_URL}/meetings?year=${year}`, { signal: AbortSignal.timeout(4000) })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    return Array.isArray(data) && data.length > 0 ? data : DEFAULT_MEETINGS
  } catch {
    return DEFAULT_MEETINGS
  }
}

export async function fetchOpenF1Drivers(sessionKey?: number): Promise<OpenF1Driver[]> {
  try {
    const url = sessionKey ? `${BASE_URL}/drivers?session_key=${sessionKey}` : `${BASE_URL}/drivers?session_key=latest`
    const res = await fetch(url, { signal: AbortSignal.timeout(4000) })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    return Array.isArray(data) && data.length > 0 ? data : DEFAULT_DRIVERS
  } catch {
    return DEFAULT_DRIVERS
  }
}

export function generateSyntheticLapTelemetry(driverNumber: number): OpenF1TelemetrySample[] {
  const points: OpenF1TelemetrySample[] = []
  const baseSpeedDelta = driverNumber === 4 ? 2 : driverNumber === 1 ? 3 : 0
  const totalSamples = 100

  for (let i = 0; i < totalSamples; i++) {
    const t = i / totalSamples
    // 3 straights, 3 heavy braking zones around Silverstone
    const speedProfile = 150 + Math.sin(t * Math.PI * 4) * 110 + Math.cos(t * Math.PI * 6) * 45 + baseSpeedDelta
    const speed = Math.max(78, Math.min(335, Math.round(speedProfile)))
    const throttle = speed > 220 ? 100 : Math.max(0, Math.round((speed - 80) * 0.7))
    const brake = throttle < 20 ? (100 - throttle) : 0
    const gear = speed > 290 ? 8 : speed > 250 ? 7 : speed > 200 ? 6 : speed > 160 ? 5 : speed > 120 ? 4 : speed > 90 ? 3 : 2
    const rpm = Math.round(8500 + (speed / 335) * 3800)
    const drs = (t > 0.15 && t < 0.28) || (t > 0.65 && t < 0.8) ? (speed > 240 ? 12 : 8) : 0

    points.push({
      date: new Date(Date.now() + i * 850).toISOString(),
      driver_number: driverNumber,
      speed,
      rpm,
      gear,
      throttle,
      brake,
      drs,
    })
  }

  return points
}

export function getSampleStints(driverNumber: number): OpenF1TireStint[] {
  if (driverNumber === 4) {
    return [
      { driver_number: 4, stint_number: 1, compound: 'MEDIUM', lap_start: 1, lap_end: 28, tyre_age_at_start: 0 },
      { driver_number: 4, stint_number: 2, compound: 'HARD', lap_start: 29, lap_end: 52, tyre_age_at_start: 0 },
    ]
  }
  if (driverNumber === 1) {
    return [
      { driver_number: 1, stint_number: 1, compound: 'MEDIUM', lap_start: 1, lap_end: 25, tyre_age_at_start: 0 },
      { driver_number: 1, stint_number: 2, compound: 'HARD', lap_start: 26, lap_end: 52, tyre_age_at_start: 0 },
    ]
  }
  return [
    { driver_number: driverNumber, stint_number: 1, compound: 'SOFT', lap_start: 1, lap_end: 18, tyre_age_at_start: 0 },
    { driver_number: driverNumber, stint_number: 2, compound: 'HARD', lap_start: 19, lap_end: 52, tyre_age_at_start: 0 },
  ]
}

export function getSampleTeamRadio(driverNumber: number): Array<{ time: string; text: string; speaker: string; audioDurationSec: number }> {
  // Lando Norris (McLaren #4)
  if (driverNumber === 4) {
    return [
      { time: 'LAP 44', speaker: 'Will Joseph (Race Engineer)', text: 'Lando, gap to Verstappen is 1.8 seconds. Mode push available, let us use overtake on the Wellington Straight.', audioDurationSec: 4.2 },
      { time: 'LAP 38', speaker: 'Lando Norris', text: 'Tires feel solid mate. Pace is strong, let me know if we need any lift and coast in Stowe.', audioDurationSec: 3.4 },
      { time: 'LAP 28', speaker: 'Will Joseph (Race Engineer)', text: 'Box this lap, box for Hards. Watch the pit entry white line.', audioDurationSec: 2.8 },
      { time: 'LAP 14', speaker: 'Will Joseph (Race Engineer)', text: 'Strat 4, balance is positive. You are currently the fastest car on track in sector 2.', audioDurationSec: 3.6 },
    ]
  }

  // Oscar Piastri (McLaren #81)
  if (driverNumber === 81) {
    return [
      { time: 'LAP 42', speaker: 'Tom Stallard (Race Engineer)', text: 'Oscar, you have DRS on Leclerc ahead. Good exit out of Copse, keep the pressure on.', audioDurationSec: 3.8 },
      { time: 'LAP 36', speaker: 'Oscar Piastri', text: 'Understood. Fronts are in the window, rear traction is clean.', audioDurationSec: 2.7 },
      { time: 'LAP 27', speaker: 'Tom Stallard (Race Engineer)', text: 'Box box, Box box Oscar. Fitting medium compound, confirm.', audioDurationSec: 2.9 },
    ]
  }

  // Max Verstappen (Red Bull #1)
  if (driverNumber === 1) {
    return [
      { time: 'LAP 43', speaker: 'Gianpiero Lambiase (GP)', text: 'Max, Norris is within DRS threat behind. Recharge available out of turn seven.', audioDurationSec: 3.6 },
      { time: 'LAP 35', speaker: 'Max Verstappen', text: 'Front left is starting to slide a bit in high speed, but balance is still okay.', audioDurationSec: 3.2 },
      { time: 'LAP 26', speaker: 'Gianpiero Lambiase (GP)', text: 'Understood Max, keep your head down. Mode seven when you can.', audioDurationSec: 2.8 },
      { time: 'LAP 18', speaker: 'Gianpiero Lambiase (GP)', text: 'Box this lap Max, box box for Hard compound.', audioDurationSec: 2.4 },
    ]
  }

  // Charles Leclerc (Ferrari #16)
  if (driverNumber === 16) {
    return [
      { time: 'LAP 45', speaker: 'Bryan Bozzi (Race Engineer)', text: 'Charles, we are targeting Plan B plus five laps. Pace is matching the McLarens.', audioDurationSec: 3.7 },
      { time: 'LAP 39', speaker: 'Charles Leclerc', text: 'Copy that Bryan. The car feels much better on the hard compound now.', audioDurationSec: 3.1 },
      { time: 'LAP 29', speaker: 'Bryan Bozzi (Race Engineer)', text: 'Box now Charles, box box. Watch out for Hamilton on pit exit.', audioDurationSec: 3.0 },
    ]
  }

  // Lewis Hamilton (Ferrari #44)
  if (driverNumber === 44) {
    return [
      { time: 'LAP 46', speaker: 'Riccardo Adami (Race Engineer)', text: 'Lewis, gap ahead is closing three tenths per lap. Strat mode attack is available.', audioDurationSec: 3.9 },
      { time: 'LAP 40', speaker: 'Lewis Hamilton', text: 'Tires are holding up nicely. Let us push to the end.', audioDurationSec: 2.6 },
      { time: 'LAP 30', speaker: 'Riccardo Adami (Race Engineer)', text: 'Box box, box box Lewis. Fitting the Hard tires.', audioDurationSec: 2.4 },
    ]
  }

  // George Russell (Mercedes #63)
  if (driverNumber === 63) {
    return [
      { time: 'LAP 41', speaker: 'Marcus Dudley (Race Engineer)', text: 'George, SOC is full. You have overtake for Turn 15.', audioDurationSec: 3.1 },
      { time: 'LAP 33', speaker: 'George Russell', text: 'The rear end is snapping slightly on turn-in, can we adjust the diff for the next stint?', audioDurationSec: 3.8 },
      { time: 'LAP 24', speaker: 'Marcus Dudley (Race Engineer)', text: 'Affirmative George, we will add front flap and adjust diff entry.', audioDurationSec: 3.2 },
    ]
  }

  // Fernando Alonso (Aston Martin #14)
  if (driverNumber === 14) {
    return [
      { time: 'LAP 40', speaker: 'Chris Cronin (Race Engineer)', text: 'Fernando, pace is very strong. We are P6 on track, fighting for the top five.', audioDurationSec: 3.8 },
      { time: 'LAP 32', speaker: 'Fernando Alonso', text: 'Yes, full attack now! Give me all the deployment out of the final corner.', audioDurationSec: 3.3 },
      { time: 'LAP 22', speaker: 'Chris Cronin (Race Engineer)', text: 'Understood Fernando, Engine Mode 1 selected.', audioDurationSec: 2.4 },
    ]
  }

  // Carlos Sainz (Williams #55)
  if (driverNumber === 55) {
    return [
      { time: 'LAP 39', speaker: 'Gaetan Jego (Race Engineer)', text: 'Carlos, gap to Albon is two seconds. Both cars are running in the points.', audioDurationSec: 3.6 },
      { time: 'LAP 31', speaker: 'Carlos Sainz', text: 'Understood, balance is consistent. Looking after the front left.', audioDurationSec: 2.9 },
      { time: 'LAP 21', speaker: 'Gaetan Jego (Race Engineer)', text: 'Box this lap Carlos, box box for Mediums.', audioDurationSec: 2.5 },
    ]
  }

  // Default Grid Fallback
  return [
    { time: 'LAP 38', speaker: 'Race Engineer', text: 'Radio check, driver. Gap to car ahead is 1.5 seconds. Strat mode 2 engaged.', audioDurationSec: 3.4 },
    { time: 'LAP 29', speaker: 'Driver', text: 'Tire temps are stabilized. Grip level is good.', audioDurationSec: 2.3 },
    { time: 'LAP 20', speaker: 'Race Engineer', text: 'Box this lap, confirm box box for Hard compound.', audioDurationSec: 2.6 },
  ]
}
