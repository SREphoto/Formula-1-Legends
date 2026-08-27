import type { DriverMeta, TireCompound } from '../types'

export const DRIVER_GRID: DriverMeta[] = [
  // McLaren F1 Team (Managed Player Team)
  { id: 'nor', number: 4, code: 'NOR', firstName: 'Lando', lastName: 'Norris', shortName: 'L. Norris', nationality: 'GBR', team: 'McLaren Formula 1 Team', teamShort: 'MCL', teamColor: '#ff8000', secondaryColor: '#12171f', rating: 98, tireSkill: 95, wetSkill: 97, isManaged: true },
  { id: 'pia', number: 81, code: 'PIA', firstName: 'Oscar', lastName: 'Piastri', shortName: 'O. Piastri', nationality: 'AUS', team: 'McLaren Formula 1 Team', teamShort: 'MCL', teamColor: '#ff8000', secondaryColor: '#12171f', rating: 96, tireSkill: 94, wetSkill: 94, isManaged: true },

  // Scuderia Ferrari HP
  { id: 'lec', number: 16, code: 'LEC', firstName: 'Charles', lastName: 'Leclerc', shortName: 'C. Leclerc', nationality: 'MON', team: 'Scuderia Ferrari HP', teamShort: 'FER', teamColor: '#e8002d', secondaryColor: '#ffe500', rating: 97, tireSkill: 94, wetSkill: 95, isManaged: false },
  { id: 'ham', number: 44, code: 'HAM', firstName: 'Lewis', lastName: 'Hamilton', shortName: 'L. Hamilton', nationality: 'GBR', team: 'Scuderia Ferrari HP', teamShort: 'FER', teamColor: '#e8002d', secondaryColor: '#ffe500', rating: 97, tireSkill: 97, wetSkill: 98, isManaged: false },

  // Oracle Red Bull Racing
  { id: 'ver', number: 1, code: 'VER', firstName: 'Max', lastName: 'Verstappen', shortName: 'M. Verstappen', nationality: 'NED', team: 'Oracle Red Bull Racing', teamShort: 'RBR', teamColor: '#1e41ff', secondaryColor: '#ff1801', rating: 99, tireSkill: 97, wetSkill: 99, isManaged: false },
  { id: 'law', number: 30, code: 'LAW', firstName: 'Liam', lastName: 'Lawson', shortName: 'L. Lawson', nationality: 'NZL', team: 'Oracle Red Bull Racing', teamShort: 'RBR', teamColor: '#1e41ff', secondaryColor: '#ff1801', rating: 91, tireSkill: 90, wetSkill: 91, isManaged: false },

  // Mercedes-AMG PETRONAS F1 Team
  { id: 'rus', number: 63, code: 'RUS', firstName: 'George', lastName: 'Russell', shortName: 'G. Russell', nationality: 'GBR', team: 'Mercedes-AMG PETRONAS', teamShort: 'MER', teamColor: '#00d2be', secondaryColor: '#c0c0c0', rating: 96, tireSkill: 93, wetSkill: 95, isManaged: false },
  { id: 'ant', number: 12, code: 'ANT', firstName: 'Kimi', lastName: 'Antonelli', shortName: 'K. Antonelli', nationality: 'ITA', team: 'Mercedes-AMG PETRONAS', teamShort: 'MER', teamColor: '#00d2be', secondaryColor: '#c0c0c0', rating: 91, tireSkill: 89, wetSkill: 90, isManaged: false },

  // Aston Martin Aramco F1 Team
  { id: 'alo', number: 14, code: 'ALO', firstName: 'Fernando', lastName: 'Alonso', shortName: 'F. Alonso', nationality: 'ESP', team: 'Aston Martin Aramco', teamShort: 'AST', teamColor: '#229971', secondaryColor: '#cedc00', rating: 96, tireSkill: 97, wetSkill: 96, isManaged: false },
  { id: 'str', number: 18, code: 'STR', firstName: 'Lance', lastName: 'Stroll', shortName: 'L. Stroll', nationality: 'CAN', team: 'Aston Martin Aramco', teamShort: 'AST', teamColor: '#229971', secondaryColor: '#cedc00', rating: 89, tireSkill: 88, wetSkill: 92, isManaged: false },

  // Williams Racing
  { id: 'sai', number: 55, code: 'SAI', firstName: 'Carlos', lastName: 'Sainz', shortName: 'C. Sainz', nationality: 'ESP', team: 'Williams Racing', teamShort: 'WIL', teamColor: '#005aff', secondaryColor: '#00a0de', rating: 95, tireSkill: 95, wetSkill: 93, isManaged: false },
  { id: 'alb', number: 23, code: 'ALB', firstName: 'Alexander', lastName: 'Albon', shortName: 'A. Albon', nationality: 'THA', team: 'Williams Racing', teamShort: 'WIL', teamColor: '#005aff', secondaryColor: '#00a0de', rating: 93, tireSkill: 93, wetSkill: 92, isManaged: false },

  // BWT Alpine F1 Team
  { id: 'gas', number: 10, code: 'GAS', firstName: 'Pierre', lastName: 'Gasly', shortName: 'P. Gasly', nationality: 'FRA', team: 'BWT Alpine F1 Team', teamShort: 'ALP', teamColor: '#0090ff', secondaryColor: '#ff87bc', rating: 92, tireSkill: 91, wetSkill: 91, isManaged: false },
  { id: 'doo', number: 7, code: 'DOO', firstName: 'Jack', lastName: 'Doohan', shortName: 'J. Doohan', nationality: 'AUS', team: 'BWT Alpine F1 Team', teamShort: 'ALP', teamColor: '#0090ff', secondaryColor: '#ff87bc', rating: 88, tireSkill: 88, wetSkill: 87, isManaged: false },

  // Visa Cash App RB
  { id: 'tsu', number: 22, code: 'TSU', firstName: 'Yuki', lastName: 'Tsunoda', shortName: 'Y. Tsunoda', nationality: 'JPN', team: 'Visa Cash App RB', teamShort: 'VCARB', teamColor: '#6692ff', secondaryColor: '#ffffff', rating: 91, tireSkill: 90, wetSkill: 91, isManaged: false },
  { id: 'had', number: 6, code: 'HAD', firstName: 'Isack', lastName: 'Hadjar', shortName: 'I. Hadjar', nationality: 'FRA', team: 'Visa Cash App RB', teamShort: 'VCARB', teamColor: '#6692ff', secondaryColor: '#ffffff', rating: 88, tireSkill: 87, wetSkill: 88, isManaged: false },

  // Stake F1 Team Kick Sauber / Audi
  { id: 'hul', number: 27, code: 'HUL', firstName: 'Nico', lastName: 'Hülkenberg', shortName: 'N. Hülkenberg', nationality: 'GER', team: 'Stake F1 Team Kick Sauber', teamShort: 'SAU', teamColor: '#52e252', secondaryColor: '#111111', rating: 91, tireSkill: 93, wetSkill: 92, isManaged: false },
  { id: 'bor', number: 5, code: 'BOR', firstName: 'Gabriel', lastName: 'Bortoleto', shortName: 'G. Bortoleto', nationality: 'BRA', team: 'Stake F1 Team Kick Sauber', teamShort: 'SAU', teamColor: '#52e252', secondaryColor: '#111111', rating: 89, tireSkill: 88, wetSkill: 89, isManaged: false },

  // MoneyGram Haas F1 Team
  { id: 'oco', number: 31, code: 'OCO', firstName: 'Esteban', lastName: 'Ocon', shortName: 'E. Ocon', nationality: 'FRA', team: 'MoneyGram Haas F1 Team', teamShort: 'HAS', teamColor: '#b6babd', secondaryColor: '#e6002b', rating: 91, tireSkill: 91, wetSkill: 93, isManaged: false },
  { id: 'bea', number: 87, code: 'BEA', firstName: 'Oliver', lastName: 'Bearman', shortName: 'O. Bearman', nationality: 'GBR', team: 'MoneyGram Haas F1 Team', teamShort: 'HAS', teamColor: '#b6babd', secondaryColor: '#e6002b', rating: 89, tireSkill: 88, wetSkill: 89, isManaged: false },
]

export const INITIAL_COMPOUNDS: TireCompound[] = [
  'MEDIUM', 'MEDIUM', 'HARD', 'HARD', 'MEDIUM', 'HARD', 'MEDIUM', 'SOFT', 'HARD', 'MEDIUM',
  'HARD', 'MEDIUM', 'HARD', 'MEDIUM', 'HARD', 'SOFT', 'HARD', 'MEDIUM', 'HARD', 'MEDIUM',
]

export const TEAM_STANDINGS = [
  { position: 1, team: 'McLaren Formula 1 Team', color: '#ff8000', points: 312, trend: 18 },
  { position: 2, team: 'Scuderia Ferrari HP', color: '#e8002d', points: 295, trend: 15 },
  { position: 3, team: 'Oracle Red Bull Racing', color: '#1e41ff', points: 274, trend: 12 },
  { position: 4, team: 'Mercedes-AMG PETRONAS', color: '#00d2be', points: 240, trend: 10 },
  { position: 5, team: 'Aston Martin Aramco', color: '#229971', points: 182, trend: 6 },
  { position: 6, team: 'Williams Racing', color: '#005aff', points: 94, trend: 4 },
  { position: 7, team: 'BWT Alpine F1 Team', color: '#0090ff', points: 62, trend: 2 },
  { position: 8, team: 'Visa Cash App RB', color: '#6692ff', points: 58, trend: 1 },
  { position: 9, team: 'MoneyGram Haas F1 Team', color: '#b6babd', points: 44, trend: 0 },
  { position: 10, team: 'Stake F1 Team Kick Sauber', color: '#52e252', points: 36, trend: 0 },
]
