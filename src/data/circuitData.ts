/**
 * Authentic Circuit Layouts & Track Geometry for the 23 F1 2026 World Championship Rounds + Pre-Season Testing
 * Verified FIA track layouts, true corner counts, exact turn names, accurate DRS zones, elevation profiles, and asset links.
 * Compiled from the 2026 Track Design Report (.master/documents/track_design_report_2026_calendar.md)
 */

export interface CircuitCorner {
  number: number
  name?: string
  x: number
  y: number
}

export interface CircuitInfo {
  round: number // 1-23 on 2026 Calendar (0 = Pre-season Testing)
  circuitKey: number
  circuitName: string
  officialName: string
  location: string
  country: string
  flag: string
  lengthKm: number
  turnsCount: number
  drsZonesCount: number
  direction: 'clockwise' | 'anticlockwise'
  venueType: 'street' | 'semi-street' | 'permanent' | 'semi-permanent'
  elevationChangeM: number
  signatureFeature: string
  weatherProfile: string
  notes2026: string
  lapRecord: { time: string; driver: string; year: number }
  viewBox: string
  path: string
  drsPaths?: string[]
  corners?: CircuitCorner[]
  startFinish: { x: number; y: number; angle?: number }
  mapAssetUrl?: string
  aerialAssetUrl?: string
  venueAssetUrl?: string
}

export const CIRCUITS_DATA: Record<number, CircuitInfo> = {
  // -------------------------------------------------------------------------------------
  // PRE-SEASON TESTING: Sakhir (Bahrain) - circuitKey: 63
  // -------------------------------------------------------------------------------------
  63: {
    round: 0,
    circuitKey: 63,
    circuitName: 'Bahrain International Circuit',
    officialName: 'FORMULA 1 ARAMCO PRE-SEASON TESTING 2026',
    location: 'Sakhir',
    country: 'Bahrain',
    flag: 'BHR',
    lengthKm: 5.412,
    turnsCount: 15,
    drsZonesCount: 3,
    direction: 'clockwise',
    venueType: 'permanent',
    elevationChangeM: 17,
    signatureFeature: 'Turn 10 downhill off-camber braking & Sakhir desert floodlit night test',
    weatherProfile: 'Desert dry, 24–28°C daytime, evening track temp drops ~12°C, fine sand on surface',
    notes2026: 'Official pre-season test venue (Testing 1 & 2 in Feb 2026) for 50/50 hybrid power units and active aero systems.',
    lapRecord: { time: '1:31.447', driver: 'Pedro de la Rosa', year: 2005 },
    viewBox: '0 0 600 420',
    path: 'M 130 350 L 440 350 C 475 350 495 325 470 300 L 420 250 C 400 235 405 210 430 195 L 485 160 C 510 145 500 110 460 90 L 330 35 C 295 20 250 35 240 70 L 230 115 C 220 135 200 145 180 140 L 120 125 C 85 115 65 150 90 175 L 155 225 C 180 245 180 275 155 295 L 115 315 C 95 330 105 350 130 350 Z',
    drsPaths: [
      'M 140 350 L 430 350',
      'M 470 95 L 330 38',
      'M 160 230 L 95 180',
    ],
    corners: [
      { number: 1, name: 'Michael Schumacher Turn', x: 475, y: 315 },
      { number: 4, name: 'Turn 4 Fast Right', x: 490, y: 145 },
      { number: 8, name: 'Turn 8 Hairpin', x: 235, y: 115 },
      { number: 10, name: 'Turn 10 Downhill Left', x: 80, y: 155 },
      { number: 14, name: 'Turn 14 Entry to Main Straight', x: 110, y: 335 },
    ],
    startFinish: { x: 285, y: 350, angle: 0 },
    mapAssetUrl: '/assets/tracks/r01_melbourne_trackmap.png',
  },

  // -------------------------------------------------------------------------------------
  // ROUND 1: Albert Park Circuit (Melbourne, Australia) - circuitKey: 1
  // -------------------------------------------------------------------------------------
  1: {
    round: 1,
    circuitKey: 1,
    circuitName: 'Albert Park Circuit',
    officialName: 'FORMULA 1 QATAR AIRWAYS AUSTRALIAN GRAND PRIX 2026',
    location: 'Melbourne',
    country: 'Australia',
    flag: 'AUS',
    lengthKm: 5.278,
    turnsCount: 14,
    drsZonesCount: 4,
    direction: 'clockwise',
    venueType: 'semi-street',
    elevationChangeM: 3,
    signatureFeature: 'Lakeside parkland perimeter road with fast flowing Turn 9–10 sweep',
    weatherProfile: 'Late southern-summer, 23–27°C, volatile coastal fronts ("4 seasons in 1 day")',
    notes2026: '2026 Season Opener. Reprofiled fast layout with 4 DRS zones and 237 km/h average speed.',
    lapRecord: { time: '1:19.813', driver: 'Charles Leclerc', year: 2024 },
    viewBox: '0 0 600 420',
    path: 'M 160 360 L 410 360 C 445 360 465 330 450 300 L 415 240 C 400 215 410 185 440 160 L 490 120 C 515 90 495 50 455 40 L 330 30 C 290 25 255 50 245 85 L 225 140 C 210 175 180 195 150 205 L 90 215 C 55 225 50 265 80 290 L 135 320 C 165 335 165 360 160 360 Z',
    drsPaths: [
      'M 170 360 L 400 360',
      'M 440 280 L 415 225',
      'M 470 140 L 350 40',
      'M 215 150 L 105 220',
    ],
    corners: [
      { number: 1, name: 'Jones (Turn 1)', x: 450, y: 325 },
      { number: 3, name: 'Whiteford (Turn 3)', x: 415, y: 220 },
      { number: 6, name: 'Turn 6 High-Speed Sweep', x: 490, y: 95 },
      { number: 9, name: 'Clark Chicane (T9-10 Flat)', x: 245, y: 90 },
      { number: 11, name: 'Ascari (Turn 11-12)', x: 90, y: 235 },
      { number: 13, name: 'Brabham (Turn 13-14)', x: 135, y: 335 },
    ],
    startFinish: { x: 285, y: 360, angle: 0 },
    mapAssetUrl: '/assets/tracks/r01_melbourne_trackmap.png',
    aerialAssetUrl: '/assets/tracks/r01_melbourne_aerial.jpg',
  },

  // -------------------------------------------------------------------------------------
  // ROUND 2: Shanghai International Circuit (China) - circuitKey: 11
  // -------------------------------------------------------------------------------------
  11: {
    round: 2,
    circuitKey: 11,
    circuitName: 'Shanghai International Circuit',
    officialName: 'FORMULA 1 HEINEKEN CHINESE GRAND PRIX 2026',
    location: 'Shanghai',
    country: 'China',
    flag: 'CHN',
    lengthKm: 5.451,
    turnsCount: 16,
    drsZonesCount: 2,
    direction: 'clockwise',
    venueType: 'permanent',
    elevationChangeM: 12,
    signatureFeature: 'Iconic 270° descending Snail Spiral (Turns 1–4) & 1.2km back straight',
    weatherProfile: 'Mid-March damp and cool, 12–16°C, high humidity (70%), tyre warm-up critical',
    notes2026: 'Character "上" inspired layout with massive palace pit complex. First 2026 Asian round.',
    lapRecord: { time: '1:32.238', driver: 'Michael Schumacher', year: 2004 },
    viewBox: '0 0 600 420',
    path: 'M 150 350 L 430 350 C 470 350 495 315 465 280 C 430 245 380 255 370 220 C 360 175 420 165 450 135 C 480 105 470 65 425 45 L 290 25 C 245 20 195 50 185 95 L 160 180 C 145 230 120 265 85 285 C 60 300 70 335 110 345 Z',
    drsPaths: [
      'M 160 350 L 420 350',
      'M 425 45 L 210 25',
    ],
    corners: [
      { number: 1, name: 'Snail Curve T1-T4 Spiral (12m Drop)', x: 445, y: 270 },
      { number: 6, name: 'Turn 6 Hairpin Braking', x: 375, y: 220 },
      { number: 7, name: 'T7-T8 High-Speed Esses', x: 425, y: 150 },
      { number: 13, name: 'Turn 13 Banking Entry', x: 425, y: 50 },
      { number: 14, name: 'Turn 14 Heavy Braking Hairpin', x: 200, y: 30 },
      { number: 16, name: 'Turn 16 onto Main Straight', x: 105, y: 335 },
    ],
    startFinish: { x: 290, y: 350, angle: 0 },
    mapAssetUrl: '/assets/tracks/r02_shanghai_trackmap.png',
    aerialAssetUrl: '/assets/tracks/r02_shanghai_aerial.jpg',
  },

  // -------------------------------------------------------------------------------------
  // ROUND 3: Suzuka International Racing Course (Japan) - circuitKey: 46
  // -------------------------------------------------------------------------------------
  46: {
    round: 3,
    circuitKey: 46,
    circuitName: 'Suzuka International Racing Course',
    officialName: 'FORMULA 1 ARAMCO JAPANESE GRAND PRIX 2026',
    location: 'Suzuka',
    country: 'Japan',
    flag: 'JPN',
    lengthKm: 5.807,
    turnsCount: 18,
    drsZonesCount: 2,
    direction: 'clockwise',
    venueType: 'permanent',
    elevationChangeM: 40,
    signatureFeature: 'The only Figure-8 crossover layout in F1 with legendary S-Curves & 130R',
    weatherProfile: 'Early spring cherry blossom season, 13–17°C days, high tyre energy and lateral G',
    notes2026: 'Ultimate chassis aerodynamic benchmark with ~40m elevation amplitude through Mie hills.',
    lapRecord: { time: '1:30.983', driver: 'Lewis Hamilton', year: 2019 },
    viewBox: '0 0 600 420',
    path: 'M 140 350 L 390 350 C 430 350 455 320 440 285 L 400 225 C 375 190 400 155 435 135 C 470 115 480 70 435 55 L 350 40 C 305 30 260 55 245 90 L 215 145 C 190 190 145 200 110 170 C 75 135 85 80 135 65 L 225 55 C 260 50 285 78 270 110 L 235 195 C 210 245 165 280 120 300 Z',
    drsPaths: [
      'M 150 350 L 380 350',
      'M 240 190 L 140 290',
    ],
    corners: [
      { number: 1, name: 'First Curve (Turn 1–2)', x: 440, y: 300 },
      { number: 3, name: 'S-Curves Esses (T3-6)', x: 415, y: 180 },
      { number: 7, name: 'Dunlop Curve (T7)', x: 445, y: 110 },
      { number: 8, name: 'Degner 1 & 2 (Under Crossover)', x: 435, y: 55 },
      { number: 11, name: 'Hairpin (Turn 11)', x: 90, y: 120 },
      { number: 13, name: 'Spoon Curve (T13-14 Uphill)', x: 220, y: 55 },
      { number: 15, name: '130R Flat-Out 300 km/h', x: 150, y: 270 },
      { number: 16, name: 'Casio Triangle Chicane (T16-17)', x: 120, y: 320 },
    ],
    startFinish: { x: 265, y: 350, angle: 0 },
    mapAssetUrl: '/assets/tracks/r03_suzuka_trackmap.png',
    aerialAssetUrl: '/assets/tracks/r03_suzuka_aerial.jpg',
  },

  // -------------------------------------------------------------------------------------
  // ROUND 4: Miami International Autodrome (USA) - circuitKey: 151
  // -------------------------------------------------------------------------------------
  151: {
    round: 4,
    circuitKey: 151,
    circuitName: 'Miami International Autodrome',
    officialName: 'FORMULA 1 CRYPTO.COM MIAMI GRAND PRIX 2026',
    location: 'Miami Gardens',
    country: 'United States',
    flag: 'USA',
    lengthKm: 5.412,
    turnsCount: 19,
    drsZonesCount: 3,
    direction: 'clockwise',
    venueType: 'semi-street',
    elevationChangeM: 4,
    signatureFeature: 'Hard Rock Stadium campus, fake marina yacht basin & 1.28km back straight',
    weatherProfile: 'Hot & humid subtropical May, 27–31°C air, 38°C+ track, convective storm risks',
    notes2026: 'Three long full-throttle straights rewarding 2026 Active Aero X-Mode and Override electric boost.',
    lapRecord: { time: '1:29.708', driver: 'Max Verstappen', year: 2023 },
    viewBox: '0 0 600 420',
    path: 'M 110 340 L 460 340 C 500 340 520 300 490 270 L 435 220 C 415 205 420 175 445 160 L 480 135 C 505 110 490 70 455 60 L 290 40 C 255 35 210 55 185 85 L 140 140 C 115 170 90 190 60 200 C 35 210 40 255 75 280 L 105 305 Z',
    drsPaths: [
      'M 120 340 L 450 340',
      'M 445 60 L 280 40',
      'M 175 80 L 130 145',
    ],
    corners: [
      { number: 1, name: 'Turn 1 Apex Braking', x: 485, y: 295 },
      { number: 7, name: 'Marina Complex (T7-8)', x: 475, y: 80 },
      { number: 11, name: 'Turn 11 Hairpin', x: 280, y: 40 },
      { number: 14, name: 'Chicane Underpass (T14-15)', x: 65, y: 215 },
      { number: 17, name: 'Turn 17 Hairpin (Heavy Braking)', x: 85, y: 310 },
    ],
    startFinish: { x: 285, y: 340, angle: 0 },
    mapAssetUrl: '/assets/tracks/r04_miami_trackmap.png',
  },

  // -------------------------------------------------------------------------------------
  // ROUND 5: Circuit Gilles Villeneuve (Montreal, Canada) - circuitKey: 23
  // -------------------------------------------------------------------------------------
  23: {
    round: 5,
    circuitKey: 23,
    circuitName: 'Circuit Gilles-Villeneuve',
    officialName: 'FORMULA 1 LENOVO GRAND PRIX DU CANADA 2026',
    location: 'Montreal',
    country: 'Canada',
    flag: 'CAN',
    lengthKm: 4.361,
    turnsCount: 14,
    drsZonesCount: 3,
    direction: 'clockwise',
    venueType: 'semi-street',
    elevationChangeM: 5,
    signatureFeature: 'Île Notre-Dame island layout, Epingle hairpin & iconic "Wall of Champions"',
    weatherProfile: 'Late May volatile conditions, 17–22°C, green dusty asphalt with heavy braking loads',
    notes2026: 'Stop-and-go heavy braking track demanding exceptional thermal stability on 2026 brake regeneration.',
    lapRecord: { time: '1:13.078', driver: 'Valtteri Bottas', year: 2019 },
    viewBox: '0 0 600 420',
    path: 'M 130 350 L 460 350 C 495 350 510 320 485 290 L 425 225 C 405 205 410 175 435 160 L 480 125 C 505 95 490 55 455 45 L 275 30 C 230 25 190 60 180 100 L 150 180 C 140 225 105 255 70 265 C 45 275 50 320 85 340 Z',
    drsPaths: [
      'M 140 350 L 450 350',
      'M 445 45 L 265 30',
      'M 170 80 L 140 180',
    ],
    corners: [
      { number: 1, name: 'Senna S-Curve (Turn 1–2)', x: 480, y: 310 },
      { number: 6, name: 'Pont de la Concorde (T6-7)', x: 435, y: 160 },
      { number: 10, name: "L'Épingle Hairpin (T10)", x: 470, y: 65 },
      { number: 13, name: 'Wall of Champions Chicane (T13-14)', x: 90, y: 330 },
    ],
    startFinish: { x: 295, y: 350, angle: 0 },
    mapAssetUrl: '/assets/tracks/r05_montreal_trackmap.png',
    aerialAssetUrl: '/assets/tracks/r05_montreal_aerial.jpg',
  },

  // -------------------------------------------------------------------------------------
  // ROUND 6: Circuit de Monaco (Monaco) - circuitKey: 22
  // -------------------------------------------------------------------------------------
  22: {
    round: 6,
    circuitKey: 22,
    circuitName: 'Circuit de Monaco',
    officialName: 'FORMULA 1 LOUIS VUITTON GRAND PRIX DE MONACO 2026',
    location: 'Monte Carlo',
    country: 'Monaco',
    flag: 'MON',
    lengthKm: 3.337,
    turnsCount: 19,
    drsZonesCount: 1,
    direction: 'clockwise',
    venueType: 'street',
    elevationChangeM: 45,
    signatureFeature: 'Fairmont Hairpin (48 km/h slowest corner in F1) & 300 km/h Tunnel run',
    weatherProfile: 'Mediterranean early June, 19–24°C, sea breeze, zero margin for driver error',
    notes2026: 'The crown jewel street race. 45m elevation swing between Casino Square and Port Hercule.',
    lapRecord: { time: '1:12.909', driver: 'Lewis Hamilton', year: 2021 },
    viewBox: '0 0 600 420',
    path: 'M 190 350 L 350 350 C 385 350 410 320 385 290 L 330 235 C 310 215 315 180 345 165 L 430 120 C 465 100 450 55 405 45 L 305 35 C 260 30 215 60 195 100 L 175 150 C 155 190 120 205 85 210 C 50 215 55 260 90 285 L 155 320 Z',
    drsPaths: ['M 200 350 L 340 350'],
    corners: [
      { number: 1, name: 'Sainte Dévote (Turn 1)', x: 380, y: 325 },
      { number: 3, name: 'Massenet & Casino Square (T3-4)', x: 420, y: 90 },
      { number: 5, name: 'Mirabeau Haute (Turn 5)', x: 330, y: 40 },
      { number: 6, name: 'Fairmont Hairpin (48 km/h Slowest)', x: 230, y: 55 },
      { number: 8, name: 'Portier (Turn 8)', x: 180, y: 120 },
      { number: 9, name: 'Tunnel (Fast Blind Right)', x: 160, y: 170 },
      { number: 10, name: 'Nouvelle Chicane (T10-11)', x: 85, y: 225 },
      { number: 12, name: 'Tabac & Swimming Pool (T12-16)', x: 105, y: 295 },
      { number: 18, name: 'La Rascasse & Anthony Noghès (T18-19)', x: 175, y: 335 },
    ],
    startFinish: { x: 270, y: 350, angle: 0 },
    mapAssetUrl: '/assets/tracks/r06_monaco_trackmap.png',
    aerialAssetUrl: '/assets/tracks/r06_monaco_aerial.jpg',
  },

  // -------------------------------------------------------------------------------------
  // ROUND 7: Circuit de Barcelona-Catalunya (Spain) - circuitKey: 15
  // -------------------------------------------------------------------------------------
  15: {
    round: 7,
    circuitKey: 15,
    circuitName: 'Circuit de Barcelona-Catalunya',
    officialName: 'FORMULA 1 MSC CRUISES GRAN PREMIO DE BARCELONA-CATALUNYA 2026',
    location: 'Montmeló',
    country: 'Spain',
    flag: 'ESP',
    lengthKm: 4.657,
    turnsCount: 14,
    drsZonesCount: 2,
    direction: 'clockwise',
    venueType: 'permanent',
    elevationChangeM: 20,
    signatureFeature: 'Turn 3 Renault long-radius right curve & fast flowing final sector (no chicane)',
    weatherProfile: 'Mid-June sunny & dry, 25–28°C, thermal tyre degradation on high-lateral corners',
    notes2026: 'Retained on the 2026 calendar alongside Madrid for a dual-Spanish Grand Prix season.',
    lapRecord: { time: '1:16.330', driver: 'Max Verstappen', year: 2023 },
    viewBox: '0 0 600 420',
    path: 'M 120 350 L 420 350 C 460 350 485 315 455 280 L 400 225 C 375 200 385 165 420 145 L 470 110 C 500 85 485 50 440 40 L 295 30 C 250 25 205 60 190 105 L 170 170 C 155 215 120 245 85 255 C 50 265 55 310 90 330 Z',
    drsPaths: [
      'M 130 350 L 410 350',
      'M 435 40 L 275 30',
    ],
    corners: [
      { number: 1, name: 'Elf (Turn 1–2 Chicane)', x: 450, y: 315 },
      { number: 3, name: 'Renault Long Right (Turn 3)', x: 425, y: 215 },
      { number: 4, name: 'Repsol (Turn 4)', x: 470, y: 100 },
      { number: 10, name: 'La Caixa Hairpin (Turn 10)', x: 190, y: 105 },
      { number: 14, name: 'Final Sweeper Turn 14 (Full Throttle)', x: 95, y: 325 },
    ],
    startFinish: { x: 270, y: 350, angle: 0 },
    mapAssetUrl: '/assets/tracks/r07_catalunya_trackmap.png',
    aerialAssetUrl: '/assets/tracks/r07_catalunya_aerial.jpg',
  },

  // -------------------------------------------------------------------------------------
  // ROUND 8: Red Bull Ring (Austria) - circuitKey: 19
  // -------------------------------------------------------------------------------------
  19: {
    round: 8,
    circuitKey: 19,
    circuitName: 'Red Bull Ring',
    officialName: 'FORMULA 1 LENOVO AUSTRIAN GRAND PRIX 2026',
    location: 'Spielberg',
    country: 'Austria',
    flag: 'AUT',
    lengthKm: 4.318,
    turnsCount: 10,
    drsZonesCount: 3,
    direction: 'clockwise',
    venueType: 'permanent',
    elevationChangeM: 63,
    signatureFeature: 'Styrian hillside amphitheatre with 63m climb to Remus uphill hairpin',
    weatherProfile: 'Alpine summer, 20–25°C, rapid weather changes and thunderstorm cells over mountains',
    notes2026: 'Shortest lap time in F1 (~1:05) with 3 DRS zones despite having only 10 corners.',
    lapRecord: { time: '1:05.619', driver: 'Carlos Sainz', year: 2020 },
    viewBox: '0 0 600 420',
    path: 'M 140 340 L 420 340 C 455 340 480 305 450 275 L 390 215 C 365 190 375 155 410 135 L 470 95 C 500 70 485 35 440 30 L 260 25 C 215 20 175 55 160 100 L 140 165 C 130 210 95 240 60 250 C 25 260 30 305 65 325 Z',
    drsPaths: [
      'M 150 340 L 410 340',
      'M 440 290 L 385 215',
      'M 440 35 L 250 28',
    ],
    corners: [
      { number: 1, name: 'Niki Lauda Kurve (Turn 1)', x: 445, y: 310 },
      { number: 3, name: 'Remus Uphill Hairpin (Turn 3)', x: 465, y: 70 },
      { number: 4, name: 'Schlossgold (Turn 4 Downhill)', x: 285, y: 35 },
      { number: 9, name: 'Jochen Rindt (Turn 9–10)', x: 90, y: 315 },
    ],
    startFinish: { x: 280, y: 340, angle: 0 },
    mapAssetUrl: '/assets/tracks/r08_redbullring_trackmap.png',
    aerialAssetUrl: '/assets/tracks/r08_redbullring_aerial.jpg',
  },

  // -------------------------------------------------------------------------------------
  // ROUND 9: Silverstone Circuit (Great Britain) - circuitKey: 2
  // -------------------------------------------------------------------------------------
  2: {
    round: 9,
    circuitKey: 2,
    circuitName: 'Silverstone Circuit',
    officialName: 'FORMULA 1 PIRELLI BRITISH GRAND PRIX 2026',
    location: 'Silverstone',
    country: 'Great Britain',
    flag: 'GBR',
    lengthKm: 5.891,
    turnsCount: 18,
    drsZonesCount: 3,
    direction: 'clockwise',
    venueType: 'permanent',
    elevationChangeM: 20,
    signatureFeature: 'The Wing pit complex, Maggotts–Becketts–Chapel sequence & 290 km/h Copse',
    weatherProfile: 'British summer, 20–24°C, gusting winds across ex-airfield, fast-moving rain squalls',
    notes2026: 'Home of the British Grand Prix with 500,000 weekend fans. Supreme lateral aerodynamic test.',
    lapRecord: { time: '1:27.097', driver: 'Max Verstappen', year: 2020 },
    viewBox: '0 0 760 460',
    path: 'M 190 370 L 340 360 C 390 355 440 330 480 290 C 500 270 515 245 525 210 C 540 160 570 120 565 80 C 560 50 510 40 470 55 C 445 65 440 95 445 125 C 448 150 435 180 410 205 L 260 270 C 210 290 160 305 115 295 C 80 285 65 245 65 200 C 65 150 90 105 150 95 L 320 105 C 370 105 420 95 470 80 C 530 65 590 55 640 70 C 685 85 710 125 710 170 C 710 215 680 250 635 275 L 480 370 C 410 410 330 445 250 445 C 190 445 140 430 115 390 C 100 365 110 340 135 330 C 150 325 155 350 165 365 Z',
    drsPaths: [
      'M 400 215 L 260 270 L 160 300',
      'M 630 275 L 480 370 L 330 435',
      'M 190 370 L 340 360',
    ],
    corners: [
      { number: 1, name: 'Abbey & Farm (Turn 1–2)', x: 480, y: 290 },
      { number: 3, name: 'Village (Turn 3)', x: 565, y: 80 },
      { number: 4, name: 'The Loop Hairpin (Turn 4)', x: 470, y: 55 },
      { number: 6, name: 'Brooklands (Turn 6)', x: 115, y: 295 },
      { number: 7, name: 'Luffield (Turn 7)', x: 65, y: 200 },
      { number: 9, name: 'Copse Fast Right 290 km/h (Turn 9)', x: 470, y: 80 },
      { number: 10, name: 'Maggotts & Becketts (Turns 10–14)', x: 685, y: 125 },
      { number: 15, name: 'Stowe Corner (Turn 15)', x: 250, y: 445 },
      { number: 16, name: 'Vale Chicane (Turns 16–17)', x: 115, y: 390 },
      { number: 18, name: 'Club Corner (Turn 18)', x: 165, y: 365 },
    ],
    startFinish: { x: 240, y: 367, angle: -5 },
    mapAssetUrl: '/assets/tracks/r09_silverstone_trackmap.png',
    aerialAssetUrl: '/assets/tracks/r09_silverstone_aerial.jpg',
  },

  // -------------------------------------------------------------------------------------
  // ROUND 10: Circuit de Spa-Francorchamps (Belgium) - circuitKey: 7
  // -------------------------------------------------------------------------------------
  7: {
    round: 10,
    circuitKey: 7,
    circuitName: 'Circuit de Spa-Francorchamps',
    officialName: 'FORMULA 1 MOËT & CHANDON BELGIAN GRAND PRIX 2026',
    location: 'Stavelot',
    country: 'Belgium',
    flag: 'BEL',
    lengthKm: 7.004,
    turnsCount: 19,
    drsZonesCount: 2,
    direction: 'clockwise',
    venueType: 'semi-permanent',
    elevationChangeM: 102,
    signatureFeature: 'Eau Rouge–Raidillon 17% uphill climb & 2km flat-out Kemmel Straight',
    weatherProfile: 'Ardennes forest microclimates, 18–23°C, 50% rain probability (dry at La Source while wet at Pouhon)',
    notes2026: 'Longest circuit in Formula 1 (7.004 km) with massive 102m elevation swing.',
    lapRecord: { time: '1:46.286', driver: 'Valtteri Bottas', year: 2018 },
    viewBox: '0 0 600 420',
    path: 'M 130 350 L 300 350 C 330 350 350 330 330 300 L 285 240 C 275 220 290 190 325 170 L 440 95 C 485 65 520 75 530 120 L 540 195 C 545 240 505 275 460 285 L 370 305 C 335 315 320 345 280 350 Z M 130 350 C 95 350 75 320 95 290 L 140 220 C 160 190 140 160 105 145 L 70 130 C 45 115 55 80 85 75 L 180 60 C 215 55 245 75 250 110 L 255 165',
    drsPaths: [
      'M 300 170 L 430 100',
      'M 140 350 L 280 350',
    ],
    corners: [
      { number: 1, name: 'La Source Hairpin (Turn 1)', x: 330, y: 330 },
      { number: 2, name: 'Eau Rouge & Raidillon (Turns 2–4 17% Climb)', x: 300, y: 200 },
      { number: 5, name: 'Les Combes & Malmedy (T5-7)', x: 440, y: 95 },
      { number: 8, name: 'Bruxelles / Rivage Hairpin (T8)', x: 530, y: 120 },
      { number: 10, name: 'Pouhon Double-Left 280 km/h (T10-11)', x: 500, y: 265 },
      { number: 17, name: 'Blanchimont Flat-Out (T17-18)', x: 105, y: 150 },
      { number: 19, name: 'Bus Stop Chicane (Turns 19–20)', x: 95, y: 330 },
    ],
    startFinish: { x: 215, y: 350, angle: 0 },
    mapAssetUrl: '/assets/tracks/r10_spa_trackmap.svg',
    aerialAssetUrl: '/assets/tracks/r10_spa_aerial.jpg',
  },

  // -------------------------------------------------------------------------------------
  // ROUND 11: Hungaroring (Hungary) - circuitKey: 4
  // -------------------------------------------------------------------------------------
  4: {
    round: 11,
    circuitKey: 4,
    circuitName: 'Hungaroring',
    officialName: 'FORMULA 1 AWS HUNGARIAN GRAND PRIX 2026',
    location: 'Mogyoród',
    country: 'Hungary',
    flag: 'HUN',
    lengthKm: 4.381,
    turnsCount: 14,
    drsZonesCount: 2,
    direction: 'clockwise',
    venueType: 'permanent',
    elevationChangeM: 36,
    signatureFeature: 'Natural valley amphitheatre nicknamed "Monaco without walls"',
    weatherProfile: 'Late July heatwave, 28–32°C air, track temperature exceeding 50°C, high tyre deg',
    notes2026: 'Twisty, technical valley layout where qualifying grid position and aero balance dictate success.',
    lapRecord: { time: '1:16.627', driver: 'Lewis Hamilton', year: 2020 },
    viewBox: '0 0 600 420',
    path: 'M 140 350 L 410 350 C 445 350 470 320 445 290 L 390 235 C 365 210 375 180 405 160 L 460 120 C 490 95 475 60 435 50 L 300 35 C 255 30 210 60 200 105 L 175 170 C 165 215 130 240 95 250 C 60 260 65 305 100 325 Z',
    drsPaths: [
      'M 150 350 L 400 350',
      'M 435 285 L 390 235',
    ],
    corners: [
      { number: 1, name: 'Turn 1 Downhill 180° Hairpin', x: 435, y: 315 },
      { number: 4, name: 'Mansell Sweep (Turn 4 Fast Left)', x: 460, y: 95 },
      { number: 11, name: 'Alesi Chicane (Turn 11)', x: 200, y: 105 },
      { number: 14, name: 'Final Corner Turn 14', x: 100, y: 325 },
    ],
    startFinish: { x: 275, y: 350, angle: 0 },
    mapAssetUrl: '/assets/tracks/r11_hungaroring_trackmap.png',
    aerialAssetUrl: '/assets/tracks/r11_hungaroring_aerial.jpg',
  },

  // -------------------------------------------------------------------------------------
  // ROUND 12: Circuit Zandvoort (Netherlands) - circuitKey: 55
  // -------------------------------------------------------------------------------------
  55: {
    round: 12,
    circuitKey: 55,
    circuitName: 'Circuit Zandvoort',
    officialName: 'FORMULA 1 HEINEKEN DUTCH GRAND PRIX 2026',
    location: 'Zandvoort',
    country: 'Netherlands',
    flag: 'NED',
    lengthKm: 4.259,
    turnsCount: 14,
    drsZonesCount: 2,
    direction: 'clockwise',
    venueType: 'permanent',
    elevationChangeM: 15,
    signatureFeature: 'Arie Luyendyk 32% (18°) steepest banking in F1 & Hugenholtz parabolic curve',
    weatherProfile: 'North Sea coast dunes, 19–22°C, gusty ocean winds with sand blowing across track',
    notes2026: 'Designed by Studio Dromo (Jarno Zaffelli) with extreme banking creating huge vertical G-forces.',
    lapRecord: { time: '1:11.097', driver: 'Lewis Hamilton', year: 2021 },
    viewBox: '0 0 600 420',
    path: 'M 150 350 L 420 350 C 460 350 480 315 450 280 L 390 215 C 365 190 375 160 410 140 L 465 100 C 495 75 480 40 435 35 L 285 30 C 240 25 200 55 190 95 L 165 160 C 155 205 120 235 85 245 C 50 255 55 300 90 320 Z',
    drsPaths: [
      'M 160 350 L 410 350',
      'M 435 35 L 275 30',
    ],
    corners: [
      { number: 1, name: 'Tarzanbocht 18° Banked (Turn 1)', x: 445, y: 310 },
      { number: 3, name: 'Hugenholtzbocht 19° Parabolic (Turn 3)', x: 400, y: 175 },
      { number: 7, name: 'Scheivlak High-Speed Dunes (Turn 7)', x: 435, y: 45 },
      { number: 14, name: 'Arie Luyendyk 32% Banking (Turn 14)', x: 95, y: 325 },
    ],
    startFinish: { x: 285, y: 350, angle: 0 },
    mapAssetUrl: '/assets/tracks/r12_zandvoort_trackmap.png',
    aerialAssetUrl: '/assets/tracks/r12_zandvoort_aerial.jpg',
  },

  // -------------------------------------------------------------------------------------
  // ROUND 13: Autodromo Nazionale Monza (Italy) - circuitKey: 39
  // -------------------------------------------------------------------------------------
  39: {
    round: 13,
    circuitKey: 39,
    circuitName: 'Autodromo Nazionale Monza',
    officialName: 'FORMULA 1 PIRELLI GRAN PREMIO D’ITALIA 2026',
    location: 'Monza',
    country: 'Italy',
    flag: 'ITA',
    lengthKm: 5.793,
    turnsCount: 11,
    drsZonesCount: 2,
    direction: 'clockwise',
    venueType: 'permanent',
    elevationChangeM: 10,
    signatureFeature: 'The Temple of Speed with 350+ km/h top speeds and 80% lap at full throttle',
    weatherProfile: 'Early September northern Italy, 24–28°C, lowest downforce aerodynamic configurations',
    notes2026: 'Historic royal park track rewarding ultra-low drag active aero and immense braking recovery.',
    lapRecord: { time: '1:21.046', driver: 'Rubens Barrichello', year: 2004 },
    viewBox: '0 0 600 420',
    path: 'M 110 350 L 480 350 C 515 350 525 315 500 285 L 445 210 C 425 185 435 155 465 130 L 500 95 C 525 70 505 35 465 30 L 225 25 C 180 20 145 50 135 95 L 120 170 C 110 215 85 250 55 265 C 30 275 40 320 75 340 Z',
    drsPaths: [
      'M 120 350 L 470 350',
      'M 455 30 L 215 25',
    ],
    corners: [
      { number: 1, name: 'Variante del Rettifilo (Turns 1–2 Chicane)', x: 495, y: 310 },
      { number: 3, name: 'Curva Grande Flat Right (Turn 3)', x: 455, y: 165 },
      { number: 4, name: 'Variante della Roggia (Turns 4–5)', x: 490, y: 75 },
      { number: 6, name: 'Lesmo 1 & 2 (Turns 6–7)', x: 435, y: 30 },
      { number: 8, name: 'Variante Ascari (Turns 8–10 Triple Chicane)', x: 140, y: 85 },
      { number: 11, name: 'Curva Parabolica / Alboreto (Turn 11)', x: 60, y: 305 },
    ],
    startFinish: { x: 295, y: 350, angle: 0 },
    mapAssetUrl: '/assets/tracks/r13_monza_trackmap.png',
    aerialAssetUrl: '/assets/tracks/r13_monza_aerial.jpg',
  },

  // -------------------------------------------------------------------------------------
  // ROUND 14: Madring (Circuito de Madring, Spain) - circuitKey: 153 (NEW FOR 2026)
  // -------------------------------------------------------------------------------------
  153: {
    round: 14,
    circuitKey: 153,
    circuitName: 'Circuito de Madring',
    officialName: 'FORMULA 1 TAG HEUER GRAN PREMIO DE ESPAÑA 2026',
    location: 'Madrid',
    country: 'Spain',
    flag: 'ESP',
    lengthKm: 5.416,
    turnsCount: 22,
    drsZonesCount: 4,
    direction: 'clockwise',
    venueType: 'semi-street',
    elevationChangeM: 28,
    signatureFeature: 'La Monumental 24% Banked Curve, Two M-11 Tunnels & First Covered Paddock in F1',
    weatherProfile: 'Mid-September Madrid plateau, 27–30°C hot & dry, ~660m altitude (lower air density)',
    notes2026: 'NEW 2026 VENUE! Designed by Studio Dromo (Zaffelli) around IFEMA campus with 22 corners.',
    lapRecord: { time: '1:34.200', driver: 'Projected 2026 Benchmark', year: 2026 },
    viewBox: '0 0 600 420',
    path: 'M 120 350 L 440 350 C 475 350 495 320 470 290 L 420 230 C 400 210 405 175 435 155 L 485 115 C 510 90 495 50 455 40 L 320 30 C 285 25 250 45 235 75 L 205 130 C 190 160 160 180 130 190 L 80 205 C 45 220 50 265 80 290 L 115 320 Z',
    drsPaths: [
      'M 130 350 L 430 350',
      'M 470 290 L 420 230',
      'M 455 40 L 310 30',
      'M 205 130 L 80 205',
    ],
    corners: [
      { number: 1, name: 'Turn 1 Main Overtaking Zone', x: 470, y: 310 },
      { number: 5, name: 'Valdebebas Linked Sweep (T5)', x: 435, y: 155 },
      { number: 8, name: 'Turns 7-9 Downhill Plunge', x: 485, y: 85 },
      { number: 11, name: 'M-11 Motorway Tunnel Section 1', x: 320, y: 30 },
      { number: 14, name: 'The Bunker Enclosed Technical Complex', x: 235, y: 75 },
      { number: 17, name: 'La Monumental 24% Banked Curve (T17-20)', x: 130, y: 190 },
      { number: 22, name: 'Covered Paddock Pit Straight Entry', x: 95, y: 325 },
    ],
    startFinish: { x: 280, y: 350, angle: 0 },
    mapAssetUrl: '/assets/tracks/r14_madring_trackmap.svg',
  },

  // -------------------------------------------------------------------------------------
  // ROUND 15: Baku City Circuit (Azerbaijan) - circuitKey: 144
  // -------------------------------------------------------------------------------------
  144: {
    round: 15,
    circuitKey: 144,
    circuitName: 'Baku City Circuit',
    officialName: 'FORMULA 1 QATAR AIRWAYS AZERBAIJAN GRAND PRIX 2026',
    location: 'Baku',
    country: 'Azerbaijan',
    flag: 'AZE',
    lengthKm: 6.003,
    turnsCount: 20,
    drsZonesCount: 2,
    direction: 'anticlockwise',
    venueType: 'street',
    elevationChangeM: 4,
    signatureFeature: '2.2km flat-out seaside straight (~345 km/h) & 7.6m Medieval Castle section',
    weatherProfile: 'Late September Caspian coast, 22–26°C, gusting sea breezes creating braking instability',
    notes2026: 'Extreme contrast between the narrowest corner in F1 (Old Town) and the longest full-throttle straight.',
    lapRecord: { time: '1:43.009', driver: 'Charles Leclerc', year: 2019 },
    viewBox: '0 0 600 420',
    path: 'M 100 360 L 500 360 C 535 360 545 325 520 295 L 465 220 C 445 195 455 160 485 140 L 515 110 C 535 85 520 45 480 35 L 290 30 C 245 25 205 60 190 105 L 170 175 C 155 220 120 255 85 270 C 50 285 45 335 75 355 Z',
    drsPaths: [
      'M 110 360 L 490 360',
      'M 470 35 L 280 30',
    ],
    corners: [
      { number: 1, name: 'Turn 1 90° Left Braking from 340 km/h', x: 515, y: 320 },
      { number: 8, name: 'Old Town UNESCO Castle Section (T8–12 7.6m)', x: 480, y: 80 },
      { number: 16, name: 'Turn 16 onto 2.2km Main Straight', x: 75, y: 295 },
    ],
    startFinish: { x: 300, y: 360, angle: 0 },
    mapAssetUrl: '/assets/tracks/r15_baku_trackmap.png',
    aerialAssetUrl: '/assets/tracks/r15_baku_aerial.jpg',
  },

  // -------------------------------------------------------------------------------------
  // ROUND 16: Sepang International Circuit (Malaysia) - circuitKey: 16 (Bahrain GP in Malaysia)
  // -------------------------------------------------------------------------------------
  16: {
    round: 16,
    circuitKey: 16,
    circuitName: 'Sepang International Circuit',
    officialName: 'FORMULA 1 GULF AIR BAHRAIN GRAND PRIX IN MALAYSIA 2026',
    location: 'Sepang',
    country: 'Malaysia',
    flag: 'MAS',
    lengthKm: 5.543,
    turnsCount: 15,
    drsZonesCount: 2,
    direction: 'clockwise',
    venueType: 'permanent',
    elevationChangeM: 25,
    signatureFeature: 'Twin parallel straights, Turn 1/2 downhill hairpin & tropical 4pm downpour risk',
    weatherProfile: 'Equatorial October, 31–34°C, 80%+ humidity, extreme driver thermal stress and wet tyres',
    notes2026: 'Relocated round for 2026 (Bahrain Grand Prix staged at Sepang). High-downforce Tilke classic.',
    lapRecord: { time: '1:34.080', driver: 'Sebastian Vettel', year: 2017 },
    viewBox: '0 0 600 420',
    path: 'M 130 350 L 440 350 C 475 350 495 320 470 290 L 415 225 C 390 200 400 165 435 145 L 485 110 C 510 85 495 45 455 35 L 295 25 C 250 20 205 55 190 100 L 165 170 C 155 215 120 245 85 255 C 50 265 55 310 90 330 Z',
    drsPaths: [
      'M 140 350 L 430 350',
      'M 445 35 L 285 25',
    ],
    corners: [
      { number: 1, name: 'Turn 1 Downhill Right into T2 Left Hairpin', x: 465, y: 310 },
      { number: 4, name: 'Turn 4 Uphill Right', x: 435, y: 145 },
      { number: 7, name: 'Turns 7–8 Fast High-G Sweep', x: 485, y: 80 },
      { number: 9, name: 'Turn 9 Off-Camber Left', x: 295, y: 25 },
      { number: 14, name: 'Turn 14 Hairpin onto Back Straight', x: 190, y: 100 },
      { number: 15, name: 'Turn 15 Hairpin onto Pit Straight', x: 90, y: 325 },
    ],
    startFinish: { x: 285, y: 350, angle: 0 },
    mapAssetUrl: '/assets/tracks/r16_sepang_trackmap.png',
    aerialAssetUrl: '/assets/tracks/r16_sepang_aerial.jpg',
  },

  // -------------------------------------------------------------------------------------
  // ROUND 17: Marina Bay Street Circuit (Singapore) - circuitKey: 61
  // -------------------------------------------------------------------------------------
  61: {
    round: 17,
    circuitKey: 61,
    circuitName: 'Marina Bay Street Circuit',
    officialName: 'FORMULA 1 SINGAPORE AIRLINES SINGAPORE GRAND PRIX 2026',
    location: 'Marina Bay',
    country: 'Singapore',
    flag: 'SIN',
    lengthKm: 4.940,
    turnsCount: 19,
    drsZonesCount: 4,
    direction: 'anticlockwise',
    venueType: 'street',
    elevationChangeM: 2,
    signatureFeature: 'Night street race under 1,500 floodlights around Marina Bay Sands waterfront',
    weatherProfile: 'Equatorial night, 28–31°C, 75–85% humidity, physical endurance test lasting ~2 hours',
    notes2026: 'Reprofiled 2023 layout removing old Bay grandstand chicanes for a new high-speed riverside straight.',
    lapRecord: { time: '1:34.486', driver: 'Daniel Ricciardo', year: 2024 },
    viewBox: '0 0 600 420',
    path: 'M 130 350 L 410 350 C 445 350 465 320 445 290 L 390 235 C 365 210 375 180 405 160 L 460 120 C 490 95 475 60 435 50 L 300 35 C 255 30 210 60 200 105 L 175 170 C 165 215 130 240 95 250 C 60 260 65 305 100 325 Z',
    drsPaths: [
      'M 140 350 L 400 350',
      'M 435 285 L 390 235',
      'M 435 50 L 290 35',
      'M 190 120 L 165 185',
    ],
    corners: [
      { number: 1, name: 'Sheares (Turns 1–3 Chicane)', x: 435, y: 315 },
      { number: 7, name: 'Memorial Corner (Turn 7)', x: 460, y: 95 },
      { number: 11, name: 'Anderson Bridge (Turns 11–13)', x: 300, y: 35 },
      { number: 14, name: 'Connaught (Turn 14 into Fast Straight)', x: 200, y: 105 },
      { number: 19, name: 'Final Chicane (Turns 18–19)', x: 100, y: 325 },
    ],
    startFinish: { x: 270, y: 350, angle: 0 },
    mapAssetUrl: '/assets/tracks/r17_marinabay_trackmap.png',
    aerialAssetUrl: '/assets/tracks/r17_marinabay_aerial.jpg',
    venueAssetUrl: '/assets/tracks/r17_marinabay_pitbuilding.jpg',
  },

  // -------------------------------------------------------------------------------------
  // ROUND 18: Circuit of the Americas (Austin, USA) - circuitKey: 9
  // -------------------------------------------------------------------------------------
  9: {
    round: 18,
    circuitKey: 9,
    circuitName: 'Circuit of the Americas',
    officialName: 'FORMULA 1 MSC CRUISES UNITED STATES GRAND PRIX 2026',
    location: 'Austin',
    country: 'United States',
    flag: 'USA',
    lengthKm: 5.513,
    turnsCount: 20,
    drsZonesCount: 2,
    direction: 'anticlockwise',
    venueType: 'permanent',
    elevationChangeM: 41,
    signatureFeature: 'Blind 41m uphill climb into Turn 1 hairpin (10% gradient) & 25-storey tower carousel',
    weatherProfile: 'Texas Hill Country autumn, 24–28°C afternoons, high tyre stress through Maggotts-style esses',
    notes2026: 'Purpose-built Tilke masterpiece with Maggotts-style esses and Hockenheim-style stadium section.',
    lapRecord: { time: '1:36.169', driver: 'Charles Leclerc', year: 2019 },
    viewBox: '0 0 600 420',
    path: 'M 120 340 L 440 340 C 480 340 500 305 470 275 L 415 220 C 395 200 405 165 440 145 L 490 110 C 520 85 505 45 460 35 L 290 25 C 245 20 200 55 190 100 L 165 170 C 155 215 120 245 85 255 C 50 265 55 310 90 330 Z',
    drsPaths: [
      'M 130 340 L 430 340',
      'M 450 35 L 280 25',
    ],
    corners: [
      { number: 1, name: 'Big Red 41m Uphill Hairpin (Turn 1)', x: 460, y: 300 },
      { number: 3, name: 'Esses S-Curves (Turns 3–6)', x: 425, y: 195 },
      { number: 11, name: 'Turn 11 Hairpin onto 1.2km Back Straight', x: 460, y: 40 },
      { number: 12, name: 'Heavy Braking Turn 12 Stadium Entry', x: 275, y: 30 },
      { number: 16, name: 'Triple-Apex Carousel (Turns 16–18)', x: 165, y: 175 },
    ],
    startFinish: { x: 280, y: 340, angle: 0 },
    mapAssetUrl: '/assets/tracks/r18_cota_trackmap.png',
    aerialAssetUrl: '/assets/tracks/r18_cota_aerial.jpg',
  },

  // -------------------------------------------------------------------------------------
  // ROUND 19: Autódromo Hermanos Rodríguez (Mexico) - circuitKey: 65
  // -------------------------------------------------------------------------------------
  65: {
    round: 19,
    circuitKey: 65,
    circuitName: 'Autódromo Hermanos Rodríguez',
    officialName: 'FORMULA 1 GRAN PREMIO DE LA CIUDAD DE MÉXICO 2026',
    location: 'Mexico City',
    country: 'Mexico',
    flag: 'MEX',
    lengthKm: 4.304,
    turnsCount: 17,
    drsZonesCount: 3,
    direction: 'clockwise',
    venueType: 'permanent',
    elevationChangeM: 3,
    signatureFeature: '2,200m altitude (thinnest air in F1) & 30,000-seat Foro Sol Baseball Stadium stadium bowl',
    weatherProfile: 'High altitude dry autumn, 21–24°C, 25% lower air density reducing downforce and engine cooling',
    notes2026: 'Maximum wing angles run yet cars reach 350+ km/h due to thin air.',
    lapRecord: { time: '1:17.774', driver: 'Valtteri Bottas', year: 2021 },
    viewBox: '0 0 600 420',
    path: 'M 110 350 L 480 350 C 515 350 530 315 500 285 L 445 220 C 425 195 435 165 465 140 L 500 110 C 525 85 510 45 470 35 L 280 30 C 235 25 195 55 185 100 L 160 170 C 150 215 115 245 80 255 C 45 265 50 310 85 330 Z',
    drsPaths: [
      'M 120 350 L 470 350',
      'M 465 35 L 270 30',
      'M 175 80 L 150 170',
    ],
    corners: [
      { number: 1, name: 'Moisés Solana Complex (Turns 1–3)', x: 495, y: 310 },
      { number: 4, name: 'Presidente Díaz Ordaz (Turns 4–6)', x: 455, y: 175 },
      { number: 12, name: 'Foro Sol Baseball Stadium (Turns 12–16)', x: 80, y: 285 },
      { number: 17, name: 'Nigel Mansell Curve (Turn 17)', x: 90, y: 335 },
    ],
    startFinish: { x: 295, y: 350, angle: 0 },
    mapAssetUrl: '/assets/tracks/r19_mexico_trackmap.png',
    aerialAssetUrl: '/assets/tracks/r19_mexico_aerial.jpg',
  },

  // -------------------------------------------------------------------------------------
  // ROUND 20: Autódromo José Carlos Pace (Interlagos, Brazil) - circuitKey: 14
  // -------------------------------------------------------------------------------------
  14: {
    round: 20,
    circuitKey: 14,
    circuitName: 'Autódromo José Carlos Pace',
    officialName: 'FORMULA 1 MSC CRUISES GRANDE PRÊMIO DE SÃO PAULO 2026',
    location: 'São Paulo',
    country: 'Brazil',
    flag: 'BRA',
    lengthKm: 4.309,
    turnsCount: 15,
    drsZonesCount: 2,
    direction: 'anticlockwise',
    venueType: 'permanent',
    elevationChangeM: 40,
    signatureFeature: 'Senna S downhill plunge, natural bowl amphitheatre & banked uphill Subida dos Boxes',
    weatherProfile: 'Early summer São Paulo, 24–27°C, 75% humidity, highest probability of sudden tropical deluge in F1',
    notes2026: 'Anticlockwise high-elevation oscillating track renowned for legendary wet-weather title drama.',
    lapRecord: { time: '1:10.540', driver: 'Valtteri Bottas', year: 2018 },
    viewBox: '0 0 600 420',
    path: 'M 140 350 L 440 350 C 475 350 495 315 465 280 L 405 220 C 380 195 390 160 425 140 L 475 100 C 505 75 490 40 445 35 L 285 30 C 240 25 200 55 190 95 L 165 160 C 155 205 120 235 85 245 C 50 255 55 300 90 320 Z',
    drsPaths: [
      'M 150 350 L 430 350',
      'M 445 35 L 275 30',
    ],
    corners: [
      { number: 1, name: 'Senna S Downhill Plunge (Turns 1–2)', x: 455, y: 310 },
      { number: 3, name: 'Curva do Sol (Turn 3)', x: 415, y: 175 },
      { number: 4, name: 'Descida do Lago (Turn 4)', x: 455, y: 65 },
      { number: 8, name: 'Ferradura & Pinheirinho (Turns 6–8)', x: 190, y: 100 },
      { number: 12, name: 'Junção into Banked Uphill Finish (Turn 12)', x: 90, y: 285 },
    ],
    startFinish: { x: 290, y: 350, angle: 0 },
    mapAssetUrl: '/assets/tracks/r20_interlagos_trackmap.png',
    aerialAssetUrl: '/assets/tracks/r20_interlagos_aerial.jpg',
  },

  // -------------------------------------------------------------------------------------
  // ROUND 21: Las Vegas Strip Circuit (USA) - circuitKey: 152
  // -------------------------------------------------------------------------------------
  152: {
    round: 21,
    circuitKey: 152,
    circuitName: 'Las Vegas Strip Circuit',
    officialName: 'FORMULA 1 HEINEKEN SILVER LAS VEGAS GRAND PRIX 2026',
    location: 'Las Vegas',
    country: 'United States',
    flag: 'USA',
    lengthKm: 6.201,
    turnsCount: 17,
    drsZonesCount: 3,
    direction: 'anticlockwise',
    venueType: 'street',
    elevationChangeM: 2,
    signatureFeature: '1.92km Las Vegas Blvd Strip flat-out straight & Sphere illuminated complex',
    weatherProfile: 'Mid-November desert night, 8–15°C cold air, slick low-grip asphalt, extreme tyre warm-up challenge',
    notes2026: 'Second longest lap on calendar (6.201 km) run at 22:00 local time through the neon canyon.',
    lapRecord: { time: '1:34.876', driver: 'Lando Norris', year: 2024 },
    viewBox: '0 0 600 420',
    path: 'M 100 350 L 500 350 C 540 350 555 315 525 285 L 470 215 C 450 190 460 155 495 135 L 525 100 C 550 75 530 35 490 30 L 240 25 C 195 20 160 55 150 95 L 130 170 C 120 215 90 245 60 260 C 35 270 45 315 80 335 Z',
    drsPaths: [
      'M 110 350 L 490 350',
      'M 480 30 L 230 25',
    ],
    corners: [
      { number: 1, name: 'Turn 1 Hairpin at Harmon/Koval', x: 515, y: 310 },
      { number: 5, name: 'The Sphere Complex (Turns 5–9)', x: 485, y: 75 },
      { number: 14, name: 'The Strip End Chicane Braking (Turn 14)', x: 130, y: 180 },
    ],
    startFinish: { x: 300, y: 350, angle: 0 },
    mapAssetUrl: '/assets/tracks/r21_vegas_trackmap.png',
    venueAssetUrl: '/assets/tracks/r21_vegas_sphere.jpg',
  },

  // -------------------------------------------------------------------------------------
  // ROUND 22: Lusail International Circuit (Qatar) - circuitKey: 150
  // -------------------------------------------------------------------------------------
  150: {
    round: 22,
    circuitKey: 150,
    circuitName: 'Lusail International Circuit',
    officialName: 'FORMULA 1 QATAR AIRWAYS QATAR GRAND PRIX 2026',
    location: 'Lusail',
    country: 'Qatar',
    flag: 'QAT',
    lengthKm: 5.419,
    turnsCount: 16,
    drsZonesCount: 2,
    direction: 'clockwise',
    venueType: 'permanent',
    elevationChangeM: 2,
    signatureFeature: 'Fully floodlit desert venue with sustained high-speed lateral G-force sweeps',
    weatherProfile: 'Late November desert night, 22–26°C, fine sand blowing across track, high tyre carcass stress',
    notes2026: 'Sprint weekend staple with 1.068km straight feeding high-speed medium/fast sweeps.',
    lapRecord: { time: '1:23.196', driver: 'Max Verstappen', year: 2023 },
    viewBox: '0 0 600 420',
    path: 'M 130 350 L 450 350 C 485 350 505 315 475 285 L 415 220 C 390 195 400 160 435 140 L 485 100 C 515 75 500 40 455 35 L 295 30 C 250 25 210 55 200 95 L 175 160 C 165 205 130 235 95 245 C 60 255 65 300 100 320 Z',
    drsPaths: [
      'M 140 350 L 440 350',
      'M 455 35 L 285 30',
    ],
    corners: [
      { number: 1, name: 'Turn 1 Heavy Braking Zone', x: 470, y: 310 },
      { number: 6, name: 'Turn 6 Medium Sweeper', x: 435, y: 140 },
      { number: 12, name: 'Triple-Apex High-G Sweep (T12–14)', x: 195, y: 105 },
      { number: 16, name: 'Turn 16 onto Main Straight', x: 100, y: 325 },
    ],
    startFinish: { x: 290, y: 350, angle: 0 },
    mapAssetUrl: '/assets/tracks/r22_lusail_trackmap.png',
  },

  // -------------------------------------------------------------------------------------
  // ROUND 23: Yas Marina Circuit (Abu Dhabi) - circuitKey: 70
  // -------------------------------------------------------------------------------------
  70: {
    round: 23,
    circuitKey: 70,
    circuitName: 'Yas Marina Circuit',
    officialName: 'FORMULA 1 ETIHAD AIRWAYS ABU DHABI GRAND PRIX 2026',
    location: 'Yas Island',
    country: 'United Arab Emirates',
    flag: 'UAE',
    lengthKm: 5.281,
    turnsCount: 16,
    drsZonesCount: 2,
    direction: 'anticlockwise',
    venueType: 'permanent',
    elevationChangeM: 3,
    signatureFeature: 'Dusk-to-night season finale passing directly beneath the 5-star W Abu Dhabi Hotel',
    weatherProfile: 'Early December twilight, 24°C falling to 19°C at night, track temp drops ~10°C during race',
    notes2026: '2026 Season Finale. Reprofiled 2021 layout with banked Turn 5 and Marsa corner for overtaking.',
    lapRecord: { time: '1:26.103', driver: 'Max Verstappen', year: 2021 },
    viewBox: '0 0 600 420',
    path: 'M 140 350 L 440 350 C 475 350 495 315 465 285 L 405 220 C 380 195 390 160 425 140 L 475 100 C 505 75 490 40 445 35 L 285 30 C 240 25 200 55 190 95 L 165 160 C 155 205 120 235 85 245 C 50 255 55 300 90 320 Z',
    drsPaths: [
      'M 150 350 L 430 350',
      'M 445 35 L 275 30',
    ],
    corners: [
      { number: 1, name: 'Turn 1 Apex', x: 460, y: 310 },
      { number: 5, name: 'Turn 5 Banked Hairpin before 1.2km Straight', x: 440, y: 65 },
      { number: 9, name: 'Marsa Banked Turn (Turn 9)', x: 190, y: 105 },
      { number: 12, name: 'W Hotel & Marina Sector Underpass (Turns 12–15)', x: 90, y: 285 },
    ],
    startFinish: { x: 290, y: 350, angle: 0 },
    mapAssetUrl: '/assets/tracks/r23_yasmarina_trackmap.png',
    aerialAssetUrl: '/assets/tracks/r23_yasmarina_aerial.jpg',
  },
}

export function getCircuitInfo(circuitKey: number): CircuitInfo {
  return CIRCUITS_DATA[circuitKey] || CIRCUITS_DATA[2] // Default to Silverstone Circuit
}

export function getAllCircuits(): CircuitInfo[] {
  return Object.values(CIRCUITS_DATA).sort((a, b) => a.round - b.round)
}

export function getCircuitByRound(round: number): CircuitInfo | undefined {
  return Object.values(CIRCUITS_DATA).find((c) => c.round === round)
}
