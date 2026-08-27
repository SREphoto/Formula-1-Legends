/**
 * Circuit Layouts & Track Geometry for the 24 F1 2026 World Championship Rounds
 */

export interface CircuitCorner {
  number: number
  name?: string
  x: number
  y: number
}

export interface CircuitInfo {
  circuitKey: number
  circuitName: string
  location: string
  country: string
  lengthKm: number
  turnsCount: number
  drsZonesCount: number
  lapRecord: { time: string; driver: string; year: number }
  viewBox: string
  path: string
  drsPaths?: string[]
  corners?: CircuitCorner[]
  startFinish: { x: number; y: number; angle?: number }
}

export const CIRCUITS_DATA: Record<number, CircuitInfo> = {
  // 1: Sakhir (Bahrain) - circuit_key: 63
  63: {
    circuitKey: 63,
    circuitName: 'Bahrain International Circuit',
    location: 'Sakhir',
    country: 'Bahrain',
    lengthKm: 5.412,
    turnsCount: 15,
    drsZonesCount: 3,
    lapRecord: { time: '1:31.447', driver: 'Pedro de la Rosa', year: 2005 },
    viewBox: '0 0 500 400',
    path: 'M 110 320 L 360 320 C 400 320 420 290 400 270 L 330 250 C 310 240 310 220 330 210 L 410 180 C 440 170 440 140 400 120 L 260 60 C 230 45 190 60 180 90 L 170 140 C 165 160 150 170 130 165 L 80 150 C 50 140 40 170 60 190 L 120 230 C 140 245 140 270 120 285 L 95 300 C 85 310 95 320 110 320 Z',
    drsPaths: [
      'M 120 320 L 350 320',
      'M 400 120 L 270 65',
      'M 120 230 L 70 195',
    ],
    corners: [
      { number: 1, name: 'Michael Schumacher Turn', x: 410, y: 300 },
      { number: 4, name: 'Turn 4', x: 420, y: 150 },
      { number: 10, name: 'Turn 10 Hairpin', x: 60, y: 160 },
      { number: 14, name: 'Turn 14 Entry', x: 95, y: 315 },
    ],
    startFinish: { x: 230, y: 320, angle: 0 },
  },

  // 2: Jeddah Corniche (Saudi Arabia) - circuit_key: 149
  149: {
    circuitKey: 149,
    circuitName: 'Jeddah Corniche Circuit',
    location: 'Jeddah',
    country: 'Saudi Arabia',
    lengthKm: 6.174,
    turnsCount: 27,
    drsZonesCount: 3,
    lapRecord: { time: '1:30.734', driver: 'Lewis Hamilton', year: 2021 },
    viewBox: '0 0 500 400',
    path: 'M 180 360 L 310 360 C 335 360 345 330 330 310 L 290 270 C 280 250 290 230 310 210 L 335 180 C 350 160 345 120 320 90 L 270 40 C 250 20 220 25 210 50 L 195 110 C 190 140 175 160 160 190 L 140 240 C 130 270 140 310 160 340 Z',
    drsPaths: [
      'M 190 360 L 300 360',
      'M 315 200 L 335 140',
      'M 190 120 L 150 220',
    ],
    corners: [
      { number: 1, name: 'T1/T2 Chicane', x: 335, y: 330 },
      { number: 13, name: 'Banked Turn 13', x: 255, y: 30 },
      { number: 27, name: 'Final Hairpin T27', x: 165, y: 355 },
    ],
    startFinish: { x: 240, y: 360, angle: 0 },
  },

  // 3: Albert Park (Melbourne, Australia) - circuit_key: 1
  1: {
    circuitKey: 1,
    circuitName: 'Albert Park Circuit',
    location: 'Melbourne',
    country: 'Australia',
    lengthKm: 5.278,
    turnsCount: 14,
    drsZonesCount: 4,
    lapRecord: { time: '1:19.813', driver: 'Charles Leclerc', year: 2024 },
    viewBox: '0 0 500 400',
    path: 'M 140 330 L 340 330 C 370 330 390 305 380 280 L 350 230 C 340 210 350 180 375 160 L 410 130 C 430 110 420 80 390 70 L 300 50 C 270 45 240 60 230 85 L 210 130 C 200 155 180 170 155 175 L 105 185 C 80 190 70 220 90 240 L 125 270 C 145 285 145 310 130 325 Z',
    drsPaths: [
      'M 150 330 L 330 330',
      'M 370 260 L 355 210',
      'M 395 140 L 320 60',
    ],
    corners: [
      { number: 1, name: 'Jones Turn 1', x: 380, y: 300 },
      { number: 6, name: 'Turn 6 High-Speed', x: 410, y: 100 },
      { number: 9, name: 'Clark Chicane (T9-10)', x: 220, y: 110 },
      { number: 13, name: 'Ascari (T13)', x: 90, y: 220 },
    ],
    startFinish: { x: 235, y: 330, angle: 0 },
  },

  // 4: Suzuka (Japan) - circuit_key: 46
  46: {
    circuitKey: 46,
    circuitName: 'Suzuka International Racing Course',
    location: 'Suzuka',
    country: 'Japan',
    lengthKm: 5.807,
    turnsCount: 18,
    drsZonesCount: 1,
    lapRecord: { time: '1:30.983', driver: 'Lewis Hamilton', year: 2019 },
    viewBox: '0 0 500 400',
    path: 'M 130 330 L 340 330 C 370 330 390 310 380 280 L 350 230 C 330 200 350 170 380 150 C 410 130 420 90 380 70 L 310 55 C 270 45 230 70 215 100 L 190 150 C 170 190 130 200 100 170 C 70 140 80 90 120 75 L 200 65 C 230 60 250 85 240 115 L 210 195 C 190 240 150 270 110 290 Z',
    drsPaths: [
      'M 140 330 L 330 330',
    ],
    corners: [
      { number: 1, name: 'First Curve (T1-2)', x: 380, y: 295 },
      { number: 3, name: 'Esses Curves (S-Curves)', x: 365, y: 190 },
      { number: 11, name: 'Hairpin (T11)', x: 80, y: 120 },
      { number: 15, name: '130R (T15)', x: 140, y: 260 },
      { number: 16, name: 'Casio Triangle (T16-17)', x: 110, y: 310 },
    ],
    startFinish: { x: 235, y: 330, angle: 0 },
  },

  // 5: Shanghai International Circuit (China) - circuit_key: 11
  11: {
    circuitKey: 11,
    circuitName: 'Shanghai International Circuit',
    location: 'Shanghai',
    country: 'China',
    lengthKm: 5.451,
    turnsCount: 16,
    drsZonesCount: 2,
    lapRecord: { time: '1:32.238', driver: 'Michael Schumacher', year: 2004 },
    viewBox: '0 0 500 400',
    path: 'M 130 330 L 370 330 C 400 330 420 300 395 270 C 370 240 330 250 320 220 C 310 180 360 170 385 145 C 410 120 400 80 360 65 L 250 45 C 210 40 170 70 160 110 L 140 190 C 130 230 110 260 80 275 C 60 285 70 320 100 328 Z',
    drsPaths: [
      'M 140 330 L 360 330',
      'M 360 65 L 180 45',
    ],
    corners: [
      { number: 1, name: 'T1-T4 Snail Curve', x: 380, y: 260 },
      { number: 13, name: 'Back Straight Entry (T13)', x: 360, y: 70 },
      { number: 14, name: 'Hairpin T14 (Heavy Braking)', x: 170, y: 50 },
    ],
    startFinish: { x: 250, y: 330, angle: 0 },
  },

  // 6: Miami International Autodrome (USA) - circuit_key: 151
  151: {
    circuitKey: 151,
    circuitName: 'Miami International Autodrome',
    location: 'Miami',
    country: 'United States',
    lengthKm: 5.412,
    turnsCount: 19,
    drsZonesCount: 3,
    lapRecord: { time: '1:29.708', driver: 'Max Verstappen', year: 2023 },
    viewBox: '0 0 500 400',
    path: 'M 100 320 L 410 320 C 440 320 455 290 435 265 L 390 220 C 375 205 380 180 400 165 L 430 140 C 450 120 440 85 410 75 L 260 55 C 230 50 190 70 170 95 L 130 145 C 110 170 90 190 65 200 C 45 210 50 250 80 270 L 105 290 Z',
    drsPaths: [
      'M 110 320 L 400 320',
      'M 400 75 L 250 55',
      'M 160 90 L 120 150',
    ],
    corners: [
      { number: 1, name: 'Turn 1 Apex', x: 430, y: 290 },
      { number: 7, name: 'Marina Complex (T7-8)', x: 420, y: 90 },
      { number: 14, name: 'Chicane Overpass (T14-15)', x: 70, y: 210 },
      { number: 17, name: 'Hairpin T17', x: 85, y: 300 },
    ],
    startFinish: { x: 260, y: 320, angle: 0 },
  },

  // 7: Imola (Italy) - circuit_key: 6
  6: {
    circuitKey: 6,
    circuitName: 'Autodromo Enzo e Dino Ferrari',
    location: 'Imola',
    country: 'Italy',
    lengthKm: 4.909,
    turnsCount: 19,
    drsZonesCount: 1,
    lapRecord: { time: '1:15.484', driver: 'Lewis Hamilton', year: 2020 },
    viewBox: '0 0 500 400',
    path: 'M 100 300 L 320 300 C 350 300 370 275 355 250 L 310 200 C 295 180 305 150 330 135 L 390 100 C 420 80 410 45 370 45 L 240 50 C 200 55 170 85 160 120 L 140 180 C 130 215 100 240 70 250 C 45 260 55 295 90 300 Z',
    drsPaths: ['M 110 300 L 310 300'],
    corners: [
      { number: 2, name: 'Variante Tamburello (T2-4)', x: 350, y: 270 },
      { number: 5, name: 'Variante Villeneuve (T5-6)', x: 310, y: 180 },
      { number: 7, name: 'Tosa Hairpin (T7)', x: 380, y: 70 },
      { number: 9, name: 'Piratella (T9)', x: 240, y: 55 },
      { number: 11, name: 'Acque Minerali (T11-13)', x: 155, y: 130 },
      { number: 14, name: 'Variante Alta (T14-15)', x: 100, y: 220 },
      { number: 17, name: 'Rivazza (T17-18)', x: 70, y: 280 },
    ],
    startFinish: { x: 210, y: 300, angle: 0 },
  },

  // 8: Monaco (Monaco) - circuit_key: 22
  22: {
    circuitKey: 22,
    circuitName: 'Circuit de Monaco',
    location: 'Monte Carlo',
    country: 'Monaco',
    lengthKm: 3.337,
    turnsCount: 19,
    drsZonesCount: 1,
    lapRecord: { time: '1:12.909', driver: 'Lewis Hamilton', year: 2021 },
    viewBox: '0 0 500 400',
    path: 'M 170 330 L 310 330 C 340 330 360 305 340 280 L 290 230 C 275 215 280 185 305 170 L 380 130 C 410 110 400 70 360 60 L 270 50 C 230 45 190 70 175 105 L 155 150 C 140 185 110 200 80 205 C 50 210 55 250 85 270 L 140 305 Z',
    drsPaths: ['M 180 330 L 300 330'],
    corners: [
      { number: 1, name: 'Sainte Dévote (T1)', x: 335, y: 310 },
      { number: 3, name: 'Massenet & Casino (T3-4)', x: 370, y: 100 },
      { number: 5, name: 'Mirabeau Haute (T5)', x: 290, y: 55 },
      { number: 6, name: 'Grand Hotel Hairpin (T6)', x: 200, y: 65 },
      { number: 8, name: 'Portier (T8)', x: 155, y: 120 },
      { number: 9, name: 'Tunnel Entry (T9)', x: 140, y: 170 },
      { number: 10, name: 'Nouvelle Chicane (T10-11)', x: 80, y: 220 },
      { number: 12, name: 'Tabac & Swimming Pool (T12-16)', x: 95, y: 280 },
      { number: 18, name: 'La Rascasse & Anthony Noghes (T18-19)', x: 155, y: 320 },
    ],
    startFinish: { x: 240, y: 330, angle: 0 },
  },

  // 9: Barcelona / Catalunya (Spain) - circuit_key: 15
  15: {
    circuitKey: 15,
    circuitName: 'Circuit de Barcelona-Catalunya',
    location: 'Montmeló',
    country: 'Spain',
    lengthKm: 4.657,
    turnsCount: 14,
    drsZonesCount: 2,
    lapRecord: { time: '1:16.330', driver: 'Max Verstappen', year: 2023 },
    viewBox: '0 0 500 400',
    path: 'M 100 330 L 370 330 C 405 330 425 300 400 270 L 350 220 C 330 200 340 170 370 150 L 415 120 C 440 100 430 65 390 55 L 260 45 C 220 40 180 70 170 110 L 150 170 C 140 210 110 235 80 245 C 50 255 55 295 85 315 Z',
    drsPaths: [
      'M 110 330 L 360 330',
      'M 385 55 L 240 45',
    ],
    corners: [
      { number: 1, name: 'Elf Turn 1-2', x: 395, y: 300 },
      { number: 3, name: 'Curva Renault (T3)', x: 380, y: 190 },
      { number: 4, name: 'Repsol (T4)', x: 410, y: 100 },
      { number: 9, name: 'Campsa High-Speed (T9)', x: 260, y: 48 },
      { number: 10, name: 'La Caixa (T10)', x: 160, y: 120 },
      { number: 14, name: 'Final Sweeper (T14)', x: 90, y: 310 },
    ],
    startFinish: { x: 235, y: 330, angle: 0 },
  },

  // 10: Montreal / Gilles-Villeneuve (Canada) - circuit_key: 23
  23: {
    circuitKey: 23,
    circuitName: 'Circuit Gilles-Villeneuve',
    location: 'Montreal',
    country: 'Canada',
    lengthKm: 4.361,
    turnsCount: 14,
    drsZonesCount: 3,
    lapRecord: { time: '1:13.078', driver: 'Valtteri Bottas', year: 2019 },
    viewBox: '0 0 500 400',
    path: 'M 110 320 L 420 320 C 445 320 460 295 440 275 L 380 220 C 365 205 370 180 395 165 L 430 140 C 455 120 445 80 410 70 L 220 50 C 185 45 155 70 145 105 L 125 170 C 115 210 90 235 65 245 C 40 255 45 295 75 310 Z',
    drsPaths: [
      'M 120 320 L 400 320',
      'M 400 70 L 210 50',
      'M 140 90 L 115 180',
    ],
    corners: [
      { number: 1, name: 'Senna S-Curves (T1-2)', x: 435, y: 295 },
      { number: 6, name: 'Pont de la Concorde (T6-7)', x: 420, y: 110 },
      { number: 10, name: 'L\'Epingle Hairpin (T10)', x: 170, y: 55 },
      { number: 13, name: 'Wall of Champions (T13-14)', x: 80, y: 300 },
    ],
    startFinish: { x: 265, y: 320, angle: 0 },
  },

  // 11: Red Bull Ring (Austria) - circuit_key: 19
  19: {
    circuitKey: 19,
    circuitName: 'Red Bull Ring',
    location: 'Spielberg',
    country: 'Austria',
    lengthKm: 4.318,
    turnsCount: 10,
    drsZonesCount: 3,
    lapRecord: { time: '1:05.619', driver: 'Carlos Sainz', year: 2020 },
    viewBox: '0 0 500 400',
    path: 'M 120 320 L 370 320 C 400 320 415 295 395 270 L 340 205 C 325 190 335 160 360 145 L 415 110 C 440 90 430 55 390 50 L 230 45 C 190 40 160 70 150 110 L 130 180 C 120 220 95 245 70 255 C 45 265 55 305 85 315 Z',
    drsPaths: [
      'M 130 320 L 360 320',
      'M 385 280 L 335 210',
      'M 390 50 L 220 45',
    ],
    corners: [
      { number: 1, name: 'Niki Lauda Kurve (T1)', x: 390, y: 295 },
      { number: 3, name: 'Remus Uphill Hairpin (T3)', x: 410, y: 80 },
      { number: 4, name: 'Schlossgold (T4)', x: 250, y: 48 },
      { number: 9, name: 'Jochen Rindt (T9-10)', x: 80, y: 300 },
    ],
    startFinish: { x: 245, y: 320, angle: 0 },
  },

  // 12: Silverstone (Great Britain) - circuit_key: 2
  2: {
    circuitKey: 2,
    circuitName: 'Silverstone Circuit',
    location: 'Silverstone',
    country: 'Great Britain',
    lengthKm: 5.891,
    turnsCount: 18,
    drsZonesCount: 2,
    lapRecord: { time: '1:27.097', driver: 'Max Verstappen', year: 2020 },
    viewBox: '0 0 500 400',
    path: 'M 110 320 C 80 290 70 240 90 200 C 110 170 145 175 160 145 C 175 115 145 95 170 65 C 200 30 260 40 290 70 C 320 100 340 115 375 95 C 415 75 435 35 485 45 C 530 55 540 90 525 115 C 505 145 470 150 455 175 C 440 205 475 225 515 215 C 555 200 600 215 625 245 C 650 280 635 315 600 330 C 560 345 540 320 505 325 C 470 335 460 370 420 380 C 375 390 350 355 310 350 C 270 345 240 375 200 370 C 160 365 140 340 110 320 Z',
    drsPaths: [
      'M 200 50 C 240 35 270 45 290 70',
      'M 560 335 C 535 320 520 320 505 325',
    ],
    corners: [
      { number: 1, name: 'Abbey & Farm (T1-2)', x: 160, y: 145 },
      { number: 3, name: 'Village & Loop (T3-5)', x: 170, y: 65 },
      { number: 9, name: 'Copse (T9)', x: 375, y: 95 },
      { number: 10, name: 'Maggotts & Becketts (T10-14)', x: 485, y: 45 },
      { number: 15, name: 'Stowe (T15)', x: 625, y: 245 },
      { number: 16, name: 'Vale & Club (T16-18)', x: 420, y: 380 },
    ],
    startFinish: { x: 135, y: 260, angle: -45 },
  },

  // 13: Hungaroring (Hungary) - circuit_key: 4
  4: {
    circuitKey: 4,
    circuitName: 'Hungaroring',
    location: 'Budapest',
    country: 'Hungary',
    lengthKm: 4.381,
    turnsCount: 14,
    drsZonesCount: 2,
    lapRecord: { time: '1:16.627', driver: 'Lewis Hamilton', year: 2020 },
    viewBox: '0 0 500 400',
    path: 'M 120 330 L 360 330 C 390 330 410 305 390 280 L 340 230 C 320 210 330 180 355 160 L 405 125 C 430 105 420 70 385 60 L 265 45 C 225 40 185 70 175 110 L 155 170 C 145 210 115 235 85 245 C 55 255 60 295 90 315 Z',
    drsPaths: [
      'M 130 330 L 350 330',
      'M 380 275 L 340 230',
    ],
    corners: [
      { number: 1, name: 'Turn 1 Downhill Hairpin', x: 380, y: 300 },
      { number: 4, name: 'Turn 4 Fast Left', x: 405, y: 100 },
      { number: 11, name: 'Alesi Chicane (T11)', x: 175, y: 110 },
      { number: 14, name: 'Final Corner (T14)', x: 90, y: 310 },
    ],
    startFinish: { x: 240, y: 330, angle: 0 },
  },

  // 14: Spa-Francorchamps (Belgium) - circuit_key: 7
  7: {
    circuitKey: 7,
    circuitName: 'Circuit de Spa-Francorchamps',
    location: 'Stavelot',
    country: 'Belgium',
    lengthKm: 7.004,
    turnsCount: 19,
    drsZonesCount: 2,
    lapRecord: { time: '1:46.286', driver: 'Valtteri Bottas', year: 2018 },
    viewBox: '0 0 500 400',
    path: 'M 110 330 L 250 330 C 275 330 295 310 280 285 L 240 230 C 230 210 245 180 275 160 L 380 90 C 420 60 450 70 460 110 L 470 180 C 475 220 440 250 400 260 L 320 280 C 290 290 275 320 240 330 Z M 110 330 C 80 330 65 300 80 275 L 120 210 C 135 180 120 150 90 135 L 60 120 C 40 105 50 75 75 70 L 160 55 C 190 50 215 70 220 100 L 225 150',
    drsPaths: [
      'M 250 160 L 370 95',
      'M 120 330 L 240 330',
    ],
    corners: [
      { number: 1, name: 'La Source Hairpin (T1)', x: 280, y: 310 },
      { number: 2, name: 'Eau Rouge & Raidillon (T2-4)', x: 250, y: 190 },
      { number: 5, name: 'Kemmel Straight End / Les Combes (T5-7)', x: 380, y: 90 },
      { number: 8, name: 'Bruxelles / Rivage (T8)', x: 460, y: 110 },
      { number: 10, name: 'Pouhon High-Speed Double Left (T10-11)', x: 430, y: 240 },
      { number: 17, name: 'Blanchimont (T17-18)', x: 90, y: 140 },
      { number: 19, name: 'Bus Stop Chicane (T19-20)', x: 80, y: 310 },
    ],
    startFinish: { x: 180, y: 330, angle: 0 },
  },

  // 15: Zandvoort (Netherlands) - circuit_key: 55
  55: {
    circuitKey: 55,
    circuitName: 'Circuit Zandvoort',
    location: 'Zandvoort',
    country: 'Netherlands',
    lengthKm: 4.259,
    turnsCount: 14,
    drsZonesCount: 2,
    lapRecord: { time: '1:11.097', driver: 'Lewis Hamilton', year: 2021 },
    viewBox: '0 0 500 400',
    path: 'M 130 330 L 370 330 C 405 330 420 300 395 270 L 340 210 C 320 190 330 160 360 140 L 410 105 C 435 85 420 50 380 45 L 250 40 C 210 35 175 65 165 105 L 145 165 C 135 205 105 230 75 240 C 45 250 50 290 80 310 Z',
    drsPaths: [
      'M 140 330 L 360 330',
      'M 380 45 L 240 40',
    ],
    corners: [
      { number: 1, name: 'Tarzanbocht (T1 Hairpin)', x: 390, y: 295 },
      { number: 3, name: 'Hugenholtzbocht Banked (T3)', x: 350, y: 170 },
      { number: 7, name: 'Scheivlak (T7)', x: 380, y: 50 },
      { number: 14, name: 'Arie Luyendyk Banked (T14)', x: 85, y: 310 },
    ],
    startFinish: { x: 250, y: 330, angle: 0 },
  },

  // 16: Monza (Italy) - circuit_key: 39
  39: {
    circuitKey: 39,
    circuitName: 'Autodromo Nazionale Monza',
    location: 'Monza',
    country: 'Italy',
    lengthKm: 5.793,
    turnsCount: 11,
    drsZonesCount: 2,
    lapRecord: { time: '1:21.046', driver: 'Rubens Barrichello', year: 2004 },
    viewBox: '0 0 500 400',
    path: 'M 90 330 L 420 330 C 450 330 460 300 440 270 L 390 200 C 375 180 385 150 410 130 L 440 100 C 460 80 445 45 410 40 L 200 35 C 160 30 130 60 120 100 L 105 170 C 95 210 75 240 50 255 C 30 265 40 305 70 325 Z',
    drsPaths: [
      'M 100 330 L 410 330',
      'M 400 40 L 190 35',
    ],
    corners: [
      { number: 1, name: 'Variante del Rettifilo (T1-2)', x: 435, y: 295 },
      { number: 3, name: 'Curva Grande (T3)', x: 400, y: 160 },
      { number: 4, name: 'Variante della Roggia (T4-5)', x: 430, y: 80 },
      { number: 6, name: 'Lesmo 1 & 2 (T6-7)', x: 380, y: 40 },
      { number: 8, name: 'Variante Ascari (T8-10)', x: 125, y: 90 },
      { number: 11, name: 'Curva Parabolica / Alboreto (T11)', x: 55, y: 290 },
    ],
    startFinish: { x: 255, y: 330, angle: 0 },
  },

  // 17: Baku (Azerbaijan) - circuit_key: 144
  144: {
    circuitKey: 144,
    circuitName: 'Baku City Circuit',
    location: 'Baku',
    country: 'Azerbaijan',
    lengthKm: 6.003,
    turnsCount: 20,
    drsZonesCount: 2,
    lapRecord: { time: '1:43.009', driver: 'Charles Leclerc', year: 2019 },
    viewBox: '0 0 500 400',
    path: 'M 80 340 L 440 340 C 470 340 480 310 460 280 L 410 210 C 395 190 405 160 430 140 L 455 110 C 475 90 465 55 430 45 L 260 40 C 220 35 185 65 175 105 L 155 170 C 145 210 115 240 85 255 C 55 270 50 315 75 335 Z',
    drsPaths: [
      'M 90 340 L 430 340',
      'M 420 45 L 250 40',
    ],
    corners: [
      { number: 1, name: 'Turn 1 90° Left', x: 455, y: 300 },
      { number: 8, name: 'Old Town Castle Section (T8-12)', x: 420, y: 100 },
      { number: 16, name: 'Turn 16 onto 2.2km Main Straight', x: 75, y: 280 },
    ],
    startFinish: { x: 260, y: 340, angle: 0 },
  },

  // 18: Marina Bay (Singapore) - circuit_key: 61
  61: {
    circuitKey: 61,
    circuitName: 'Marina Bay Street Circuit',
    location: 'Marina Bay',
    country: 'Singapore',
    lengthKm: 4.940,
    turnsCount: 19,
    drsZonesCount: 4,
    lapRecord: { time: '1:34.486', driver: 'Daniel Ricciardo', year: 2024 },
    viewBox: '0 0 500 400',
    path: 'M 110 330 L 360 330 C 390 330 410 305 390 280 L 340 230 C 320 210 330 180 355 160 L 405 125 C 430 105 420 70 385 60 L 265 45 C 225 40 185 70 175 110 L 155 170 C 145 210 115 235 85 245 C 55 255 60 295 90 315 Z',
    drsPaths: [
      'M 120 330 L 350 330',
      'M 380 275 L 340 230',
      'M 380 60 L 250 45',
    ],
    corners: [
      { number: 1, name: 'Sheares (T1-3)', x: 385, y: 300 },
      { number: 7, name: 'Memorial Corner (T7)', x: 405, y: 100 },
      { number: 14, name: 'Connaught (T14)', x: 175, y: 110 },
      { number: 19, name: 'Final Chicane (T18-19)', x: 90, y: 310 },
    ],
    startFinish: { x: 235, y: 330, angle: 0 },
  },

  // 19: COTA / Austin (USA) - circuit_key: 9
  9: {
    circuitKey: 9,
    circuitName: 'Circuit of the Americas',
    location: 'Austin',
    country: 'United States',
    lengthKm: 5.513,
    turnsCount: 20,
    drsZonesCount: 2,
    lapRecord: { time: '1:36.169', driver: 'Charles Leclerc', year: 2019 },
    viewBox: '0 0 500 400',
    path: 'M 100 320 L 380 320 C 415 320 435 290 410 260 L 360 210 C 340 190 350 160 380 140 L 430 110 C 455 90 445 55 405 45 L 260 40 C 220 35 180 65 170 105 L 150 165 C 140 205 110 235 80 245 C 50 255 55 295 85 315 Z',
    drsPaths: [
      'M 110 320 L 370 320',
      'M 400 45 L 250 40',
    ],
    corners: [
      { number: 1, name: 'Big Red Uphill Hairpin (T1)', x: 400, y: 290 },
      { number: 3, name: 'Maggotts-Style Esses (T3-6)', x: 370, y: 180 },
      { number: 11, name: 'Hairpin onto Backstraight (T11)', x: 405, y: 50 },
      { number: 12, name: 'Heavy Braking T12', x: 240, y: 45 },
      { number: 16, name: 'Triple Apex Carousel (T16-18)', x: 145, y: 170 },
    ],
    startFinish: { x: 240, y: 320, angle: 0 },
  },

  // 20: Hermanos Rodríguez (Mexico) - circuit_key: 65
  65: {
    circuitKey: 65,
    circuitName: 'Autódromo Hermanos Rodríguez',
    location: 'Mexico City',
    country: 'Mexico',
    lengthKm: 4.304,
    turnsCount: 17,
    drsZonesCount: 3,
    lapRecord: { time: '1:17.774', driver: 'Valtteri Bottas', year: 2021 },
    viewBox: '0 0 500 400',
    path: 'M 90 330 L 420 330 C 450 330 465 300 440 270 L 390 210 C 375 190 385 160 410 140 L 440 110 C 460 90 450 55 415 45 L 250 40 C 210 35 175 65 165 105 L 145 165 C 135 205 105 235 75 245 C 45 255 50 295 80 315 Z',
    drsPaths: [
      'M 100 330 L 410 330',
      'M 410 45 L 240 40',
      'M 160 90 L 135 170',
    ],
    corners: [
      { number: 1, name: 'Moisés Solana Complex (T1-3)', x: 435, y: 295 },
      { number: 4, name: 'Presidente Díaz Ordaz (T4-6)', x: 400, y: 160 },
      { number: 12, name: 'Foro Sol Baseball Stadium (T12-16)', x: 75, y: 270 },
      { number: 17, name: 'Nigel Mansell Curve (T17)', x: 80, y: 315 },
    ],
    startFinish: { x: 255, y: 330, angle: 0 },
  },

  // 21: Interlagos (Brazil) - circuit_key: 14
  14: {
    circuitKey: 14,
    circuitName: 'Autódromo José Carlos Pace',
    location: 'São Paulo',
    country: 'Brazil',
    lengthKm: 4.309,
    turnsCount: 15,
    drsZonesCount: 2,
    lapRecord: { time: '1:10.540', driver: 'Valtteri Bottas', year: 2018 },
    viewBox: '0 0 500 400',
    path: 'M 120 330 L 380 330 C 415 330 430 300 405 270 L 350 210 C 330 190 340 160 370 140 L 415 105 C 440 85 430 50 390 45 L 250 40 C 210 35 175 65 165 105 L 145 165 C 135 205 105 230 75 240 C 45 250 50 290 80 310 Z',
    drsPaths: [
      'M 130 330 L 370 330',
      'M 390 45 L 240 40',
    ],
    corners: [
      { number: 1, name: 'Senna S-Curves (T1-2)', x: 400, y: 295 },
      { number: 3, name: 'Curva do Sol (T3)', x: 360, y: 170 },
      { number: 4, name: 'Descida do Lago (T4)', x: 400, y: 70 },
      { number: 8, name: 'Ferradura & Pinheirinho (T6-8)', x: 170, y: 110 },
      { number: 12, name: 'Junção onto Uphill Finish (T12)', x: 80, y: 270 },
    ],
    startFinish: { x: 250, y: 330, angle: 0 },
  },

  // 22: Las Vegas Strip Circuit (USA) - circuit_key: 152
  152: {
    circuitKey: 152,
    circuitName: 'Las Vegas Strip Circuit',
    location: 'Las Vegas',
    country: 'United States',
    lengthKm: 6.201,
    turnsCount: 17,
    drsZonesCount: 2,
    lapRecord: { time: '1:34.876', driver: 'Lando Norris', year: 2024 },
    viewBox: '0 0 500 400',
    path: 'M 90 330 L 440 330 C 475 330 485 300 460 270 L 410 200 C 395 180 405 150 435 130 L 460 100 C 480 80 465 45 430 40 L 210 35 C 170 30 140 60 130 100 L 115 170 C 105 210 80 240 55 255 C 35 265 45 305 75 325 Z',
    drsPaths: [
      'M 100 330 L 430 330',
      'M 420 40 L 200 35',
    ],
    corners: [
      { number: 1, name: 'Turn 1 Hairpin', x: 450, y: 295 },
      { number: 5, name: 'Sphere Complex (T5-9)', x: 425, y: 80 },
      { number: 14, name: 'The Strip Straight End (T14 Chicane)', x: 115, y: 180 },
    ],
    startFinish: { x: 265, y: 330, angle: 0 },
  },

  // 23: Lusail (Qatar) - circuit_key: 150
  150: {
    circuitKey: 150,
    circuitName: 'Lusail International Circuit',
    location: 'Lusail',
    country: 'Qatar',
    lengthKm: 5.419,
    turnsCount: 16,
    drsZonesCount: 1,
    lapRecord: { time: '1:23.196', driver: 'Max Verstappen', year: 2023 },
    viewBox: '0 0 500 400',
    path: 'M 110 330 L 390 330 C 420 330 440 300 415 270 L 360 210 C 340 190 350 160 380 140 L 425 105 C 450 85 440 50 400 45 L 260 40 C 220 35 185 65 175 105 L 155 165 C 145 205 115 230 85 240 C 55 250 60 290 90 310 Z',
    drsPaths: ['M 120 330 L 380 330'],
    corners: [
      { number: 1, name: 'Turn 1 Braking Zone', x: 410, y: 295 },
      { number: 6, name: 'Turn 6 Medium Sweeper', x: 380, y: 140 },
      { number: 12, name: 'Triple Apex Right (T12-14)', x: 170, y: 110 },
      { number: 16, name: 'Final Corner (T16)', x: 90, y: 310 },
    ],
    startFinish: { x: 250, y: 330, angle: 0 },
  },

  // 24: Yas Marina (Abu Dhabi) - circuit_key: 70
  70: {
    circuitKey: 70,
    circuitName: 'Yas Marina Circuit',
    location: 'Yas Island',
    country: 'United Arab Emirates',
    lengthKm: 5.281,
    turnsCount: 16,
    drsZonesCount: 2,
    lapRecord: { time: '1:26.103', driver: 'Max Verstappen', year: 2021 },
    viewBox: '0 0 500 400',
    path: 'M 120 330 L 380 330 C 410 330 430 300 405 270 L 350 210 C 330 190 340 160 370 140 L 415 105 C 440 85 430 50 390 45 L 250 40 C 210 35 175 65 165 105 L 145 165 C 135 205 105 230 75 240 C 45 250 50 290 80 310 Z',
    drsPaths: [
      'M 130 330 L 370 330',
      'M 390 45 L 240 40',
    ],
    corners: [
      { number: 1, name: 'Turn 1 Apex', x: 400, y: 295 },
      { number: 5, name: 'Hairpin before 1.2km Straight (T5)', x: 380, y: 70 },
      { number: 6, name: 'Marsa Banked Turn (T9)', x: 165, y: 110 },
      { number: 12, name: 'W Hotel & Marina Sector (T12-15)', x: 80, y: 270 },
    ],
    startFinish: { x: 250, y: 330, angle: 0 },
  },
}

export function getCircuitInfo(circuitKey: number): CircuitInfo {
  return CIRCUITS_DATA[circuitKey] || CIRCUITS_DATA[2] // Fallback to Silverstone if key missing
}
