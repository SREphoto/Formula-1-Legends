import type { DriverMeta, TireCompound } from '../types'

export const DRIVER_GRID: DriverMeta[] = [
  { id: 'sen', number: 12, code: 'SEN', firstName: 'Ayrton', lastName: 'Senna', shortName: 'A. Senna', nationality: 'BRA', team: 'McLaren Heritage', teamShort: 'MCL', teamColor: '#ff7a18', secondaryColor: '#ffe2c4', rating: 98, tireSkill: 92, wetSkill: 99, isManaged: true },
  { id: 'sch', number: 7, code: 'SCH', firstName: 'Michael', lastName: 'Schumacher', shortName: 'M. Schumacher', nationality: 'GER', team: 'Scuderia Legacy', teamShort: 'SCL', teamColor: '#f04444', secondaryColor: '#ffd2d2', rating: 98, tireSkill: 96, wetSkill: 97, isManaged: false },
  { id: 'ham', number: 44, code: 'HAM', firstName: 'Lewis', lastName: 'Hamilton', shortName: 'L. Hamilton', nationality: 'GBR', team: 'Silver Arrows', teamShort: 'SAR', teamColor: '#35d4c7', secondaryColor: '#d1fffb', rating: 97, tireSkill: 96, wetSkill: 97, isManaged: false },
  { id: 'pro', number: 2, code: 'PRO', firstName: 'Alain', lastName: 'Prost', shortName: 'A. Prost', nationality: 'FRA', team: 'McLaren Heritage', teamShort: 'MCL', teamColor: '#ff7a18', secondaryColor: '#ffe2c4', rating: 97, tireSkill: 98, wetSkill: 91, isManaged: true },
  { id: 'ver', number: 1, code: 'VER', firstName: 'Max', lastName: 'Verstappen', shortName: 'M. Verstappen', nationality: 'NED', team: 'Red Bull Icons', teamShort: 'RBI', teamColor: '#5675ed', secondaryColor: '#dbe2ff', rating: 97, tireSkill: 94, wetSkill: 96, isManaged: false },
  { id: 'fan', number: 5, code: 'FAN', firstName: 'Juan Manuel', lastName: 'Fangio', shortName: 'J. Fangio', nationality: 'ARG', team: 'Silver Arrows', teamShort: 'SAR', teamColor: '#35d4c7', secondaryColor: '#d1fffb', rating: 97, tireSkill: 95, wetSkill: 94, isManaged: false },
  { id: 'cla', number: 18, code: 'CLA', firstName: 'Jim', lastName: 'Clark', shortName: 'J. Clark', nationality: 'GBR', team: 'British Racing', teamShort: 'BRG', teamColor: '#2bc478', secondaryColor: '#ccffe3', rating: 96, tireSkill: 95, wetSkill: 97, isManaged: false },
  { id: 'vet', number: 5, code: 'VET', firstName: 'Sebastian', lastName: 'Vettel', shortName: 'S. Vettel', nationality: 'GER', team: 'Red Bull Icons', teamShort: 'RBI', teamColor: '#5675ed', secondaryColor: '#dbe2ff', rating: 95, tireSkill: 94, wetSkill: 93, isManaged: false },
  { id: 'lau', number: 8, code: 'LAU', firstName: 'Niki', lastName: 'Lauda', shortName: 'N. Lauda', nationality: 'AUT', team: 'Scuderia Legacy', teamShort: 'SCL', teamColor: '#f04444', secondaryColor: '#ffd2d2', rating: 95, tireSkill: 97, wetSkill: 92, isManaged: false },
  { id: 'alo', number: 14, code: 'ALO', firstName: 'Fernando', lastName: 'Alonso', shortName: 'F. Alonso', nationality: 'ESP', team: 'Team Enstone', teamShort: 'ENS', teamColor: '#38a9f0', secondaryColor: '#d9f1ff', rating: 95, tireSkill: 97, wetSkill: 96, isManaged: false },
  { id: 'ste', number: 1, code: 'STE', firstName: 'Jackie', lastName: 'Stewart', shortName: 'J. Stewart', nationality: 'GBR', team: 'British Racing', teamShort: 'BRG', teamColor: '#2bc478', secondaryColor: '#ccffe3', rating: 94, tireSkill: 96, wetSkill: 95, isManaged: false },
  { id: 'hak', number: 8, code: 'HAK', firstName: 'Mika', lastName: 'Häkkinen', shortName: 'M. Häkkinen', nationality: 'FIN', team: 'Brawn Legacy', teamShort: 'BRW', teamColor: '#e8e8e8', secondaryColor: '#ffffff', rating: 94, tireSkill: 93, wetSkill: 92, isManaged: false },
  { id: 'rai', number: 6, code: 'RAI', firstName: 'Kimi', lastName: 'Räikkönen', shortName: 'K. Räikkönen', nationality: 'FIN', team: 'Team Enstone', teamShort: 'ENS', teamColor: '#38a9f0', secondaryColor: '#d9f1ff', rating: 93, tireSkill: 95, wetSkill: 94, isManaged: false },
  { id: 'man', number: 5, code: 'MAN', firstName: 'Nigel', lastName: 'Mansell', shortName: 'N. Mansell', nationality: 'GBR', team: 'Williams Icons', teamShort: 'WIL', teamColor: '#397cff', secondaryColor: '#dbe7ff', rating: 93, tireSkill: 90, wetSkill: 91, isManaged: false },
  { id: 'fit', number: 1, code: 'FIT', firstName: 'Emerson', lastName: 'Fittipaldi', shortName: 'E. Fittipaldi', nationality: 'BRA', team: 'Team Lotus', teamShort: 'LOT', teamColor: '#f4c446', secondaryColor: '#fff2be', rating: 92, tireSkill: 95, wetSkill: 91, isManaged: false },
  { id: 'but', number: 22, code: 'BUT', firstName: 'Jenson', lastName: 'Button', shortName: 'J. Button', nationality: 'GBR', team: 'Brawn Legacy', teamShort: 'BRW', teamColor: '#e8e8e8', secondaryColor: '#ffffff', rating: 92, tireSkill: 97, wetSkill: 96, isManaged: false },
  { id: 'ros', number: 6, code: 'ROS', firstName: 'Nico', lastName: 'Rosberg', shortName: 'N. Rosberg', nationality: 'GER', team: 'Williams Icons', teamShort: 'WIL', teamColor: '#397cff', secondaryColor: '#dbe7ff', rating: 92, tireSkill: 93, wetSkill: 90, isManaged: false },
  { id: 'and', number: 11, code: 'AND', firstName: 'Mario', lastName: 'Andretti', shortName: 'M. Andretti', nationality: 'USA', team: 'Team Lotus', teamShort: 'LOT', teamColor: '#f4c446', secondaryColor: '#fff2be', rating: 91, tireSkill: 92, wetSkill: 91, isManaged: false },
  { id: 'piq', number: 3, code: 'PIQ', firstName: 'Nelson', lastName: 'Piquet', shortName: 'N. Piquet', nationality: 'BRA', team: 'Brabham Legends', teamShort: 'BRA', teamColor: '#8b78f6', secondaryColor: '#e6e0ff', rating: 91, tireSkill: 94, wetSkill: 90, isManaged: false },
  { id: 'vil', number: 27, code: 'VIL', firstName: 'Gilles', lastName: 'Villeneuve', shortName: 'G. Villeneuve', nationality: 'CAN', team: 'Brabham Legends', teamShort: 'BRA', teamColor: '#8b78f6', secondaryColor: '#e6e0ff', rating: 91, tireSkill: 87, wetSkill: 95, isManaged: false },
]

export const INITIAL_COMPOUNDS: TireCompound[] = [
  'MEDIUM', 'MEDIUM', 'HARD', 'HARD', 'MEDIUM', 'HARD', 'MEDIUM', 'SOFT', 'HARD', 'MEDIUM',
  'HARD', 'MEDIUM', 'HARD', 'MEDIUM', 'HARD', 'SOFT', 'HARD', 'MEDIUM', 'HARD', 'MEDIUM',
]

export const TEAM_STANDINGS = [
  { position: 1, team: 'McLaren Heritage', color: '#ff7a18', points: 286, trend: 12 },
  { position: 2, team: 'Scuderia Legacy', color: '#f04444', points: 268, trend: 18 },
  { position: 3, team: 'Silver Arrows', color: '#35d4c7', points: 251, trend: 7 },
  { position: 4, team: 'Red Bull Icons', color: '#5675ed', points: 237, trend: 15 },
  { position: 5, team: 'British Racing', color: '#2bc478', points: 188, trend: 4 },
]
