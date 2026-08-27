# Master Change Log — Formula 1 Management Simulator

All notable project changes, releases, revisions, and architecture updates are documented in this log.

---

## [Build R18 / Broadcast-Quality Natural Team Radio Voices & VHF Audio DSP Overhaul] — 2026-08-27

### 08-27N Added & Enhanced

- **Neural & Natural Voice Synthesis Engine ([src/services/radioAudioService.ts](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/services/radioAudioService.ts))**:
  - Implemented strict blacklisting of legacy novelty, robotic, and comedic synthesizer voices (e.g. `Zarvox`, `Trinoids`, `Albert`, `Bad News`, `Fred`, `Boing`, `Cellos`, `Whisper`) that caused broken robotic audio artifacts.
  - Engineered dynamic Voice Scoring & Selection Algorithm prioritizing Natural, Neural, Enhanced, Apple Siri, Google UK/US Natural, and Microsoft Natural voices.
  - Implemented asynchronous voice discovery via `speechSynthesis.onvoiceschanged` with cached voice registries and fallback guarantees.
  - Built character-specific speaker personas with dedicated cadence, pitch, and accent profiling for Race Engineers (Will Joseph, Gianpiero Lambiase, Peter Bonnington, Bryan Bozzi) and Drivers (Lando Norris, Oscar Piastri, Max Verstappen, Lewis Hamilton, Charles Leclerc, George Russell, Fernando Alonso, Carlos Sainz).
- **Procedural VHF Team Radio Audio DSP Pipeline ([src/services/radioAudioService.ts](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/services/radioAudioService.ts))**:
  - Authentic Push-to-Talk (PTT) Roger chirps with calibrated dual frequencies (Intro: 1850Hz + 2300Hz, Outro: 2200Hz + 1750Hz) and tactile mic switch keying clicks.
  - Squelch tail burst generation (filtered noise burst on transmission end) and ducked VHF static ambiance that automatically attenuates background noise while speech is active.
  - 3 switchable radio acoustic profiles: `📻 Authentic VHF Radio`, `🎙️ Studio HD (Clean)`, and `🏎️ Cockpit Raw`.
- **2026 Grid Team Radio Transmissions ([src/services/openf1Service.ts](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/services/openf1Service.ts))**:
  - Expanded `getSampleTeamRadio` with authentic radio transmissions for Norris, Piastri, Verstappen, Leclerc, Hamilton, Russell, Alonso, and Sainz.
- **Interactive Radio Controls & Test Comms ([src/components/DriverTelemetryPanel.tsx](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/components/DriverTelemetryPanel.tsx), [src/views/LiveTelemetryExplorer.tsx](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/views/LiveTelemetryExplorer.tsx))**:
  - Added acoustic profile toggle chips and instant "Test Comms" preview buttons to audition voice clarity directly in the UI.
- **Resolved All Workspace ESLint Warnings & Errors ([src/components/SteeringWheel3D.tsx](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/components/SteeringWheel3D.tsx), [src/graphics/steering_wheel/F1SteeringWheelModel.ts](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/graphics/steering_wheel/F1SteeringWheelModel.ts), [src/views/SteeringWheelLab.tsx](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/views/SteeringWheelLab.tsx))**:
  - Cleaned up prefer-const, unused variables, and hook references to achieve 100% clean lint audit.

---

## [Build R17 / 3D Exact F1 Steering Wheel Replica & Interactive Cockpit Controls] — 2026-08-27

### 08-27M Added & Enhanced

- **3D Procedural Formula 1 Steering Wheel Replica ([src/graphics/steering_wheel/F1SteeringWheelModel.ts](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/graphics/steering_wheel/F1SteeringWheelModel.ts))**:
  - Engineered photo-realistic 3D procedural steering wheel model adhering to 2026 FIA technical regulations with carbon fiber composite faceplate weave, sculpted silicone/Alcantara handgrips with thumb rests, titanium mounting bolts, aluminum protective button bezels, CNC knurled rotaries, and rear magnetic carbon paddle shifters with quick-release steering hub.
- **28+ Interactive Controls & Comprehensive Metadata Registry ([src/graphics/steering_wheel/steeringWheelData.ts](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/graphics/steering_wheel/steeringWheelData.ts))**:
  - Full catalog of push buttons (`DRS`, `RADIO`, `PL` Pit Limiter, `OT` Overtake, `SOC` Recharge, `N` Neutral, `R` Reverse, `ACK` Marshal Acknowledge, `DRINK`, `PASS` Attack Pace, `BB+`/`BB-` Brake Balance, `EB+`/`EB-` Engine Braking, `PAGE+`/`PAGE-`), rotary thumb dials (`DIFF IN`, `DIFF OUT`), center rotary switches (`STRAT 1-10`, `TYRE`, `MF-SYS`, `CLUTCH BITE`), rear carbon paddle shifters (`SHIFT UP`, `SHIFT DOWN`), and analog launch clutch paddles.
- **Dynamic 4.3" FIA-Spec OLED Telemetry Display & Shift LEDs ([src/graphics/steering_wheel/F1SteeringWheelModel.ts](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/graphics/steering_wheel/F1SteeringWheelModel.ts))**:
  - 60 FPS Canvas-driven LCD texture rendering live gear, speed, RPM, delta times, ERS state of charge, brake balance, tire surface/core temperatures, and 4 switchable display pages (Race Telemetry, Tire Thermals, ERS Energy Flow, Active Aero Diagnostics).
  - 15x Progressive RGB Shift LEDs (5 Green -> 5 Red -> 5 Blue) flashing at peak RPM rev-limiter + 6x FIA Track Flag warning LEDs.
- **Zero-Latency Web Audio Tactile Synthesizer ([src/utils/wheelAudioSynthesizer.ts](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/utils/wheelAudioSynthesizer.ts))**:
  - Procedural sound synthesis generating authentic microswitch mechanical clicks, heavy rotary detent clunks, magnetic carbon paddle snaps, and team radio alert beeps.
- **Rich Holographic Engineering HUD Tooltips & Raycasting ([src/components/SteeringWheel3D.tsx](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/components/SteeringWheel3D.tsx))**:
  - 3D Raycasting with pointer hover highlighting, spring-loaded depression animations (-3.5mm Z push, 30° rotary detents, -12° paddle pulls), and floating HUD tooltips revealing technical acronyms, FIA rules, real-time values, and physics impact.
- **Dedicated Interactive Cockpit Wheel Lab View & Navigation ([src/views/SteeringWheelLab.tsx](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/views/SteeringWheelLab.tsx), [src/App.tsx](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/App.tsx), [src/components/AppHeader.tsx](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/components/AppHeader.tsx), [src/types.ts](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/types.ts), [src/styles.css](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/styles.css))**:
  - Added `Cockpit Wheel` to the main application navigation with 7 camera presets (`Front Full Wheel`, `Cockpit POV`, `4.3" LCD Focus`, `Left Thumb`, `Right Thumb`, `Rear Paddles`, `360° Orbit`), Live Simulation Sync vs Manual Test Bench mode, keyboard shortcuts (<kbd>SPACE</kbd>, <kbd>E</kbd>, <kbd>Q</kbd>, <kbd>P</kbd>, <kbd>B</kbd>, <kbd>V</kbd>, <kbd>1-4</kbd>), night cockpit lighting toggle, and interactive controls directory.

---

## [Build R16b / Tactical Command Subtitles & Strategic Plan Clarifications] — 2026-08-27

### 08-27M Added & Enhanced

- **Tactical Command Modal Clarity & Subtitles ([src/components/DriverTelemetryPanel.tsx](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/components/DriverTelemetryPanel.tsx), [src/styles.css](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/styles.css))**:
  - Upgraded Pace Directives with crystal-clear plain-language subtitles (`CONSERVE: Save Tyres & Fuel`, `BALANCED: Standard Target Pace`, `ATTACK: Maximum Push & Pass`).
  - Upgraded ERS Hybrid Programs with plain-language subtitles (`HARVEST: Recharge Battery (+15%)`, `BALANCED: 50/50 Electric Split`, `OVERTAKE: Full 350 kW Boost`).
  - Upgraded Pit Compound Selector with estimated stint lifespan tags (`Soft ~16 laps`, `Medium ~26 laps`, `Hard ~38 laps`, `Inters Wet track`).
- **Timing Tower Tooltips & Column Clarity ([src/components/TimingTower.tsx](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/components/TimingTower.tsx))**:
  - Replaced ambiguous abbreviations with explicit `GAP TO P1` and `INTERVAL` buttons with tooltips.
- **Strategic Plan Clarifications ([src/views/StrategyWorkspace.tsx](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/views/StrategyWorkspace.tsx))**:
  - Simplified Strategy Plans A, B, and C with clear risk, tire sequence, and pit window labels.

---

## [Build R16 / Camera Viewport Director, Aeroacoustic Wind Tunnel Audio & Lap Telemetry Trace Scrubber] — 2026-08-27

### 08-27L Added & Enhanced

- **Camera Viewport Director & Keyboard Shortcuts ([src/components/CarShowroom3D.tsx](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/components/CarShowroom3D.tsx), [src/views/CarLab.tsx](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/views/CarLab.tsx), [src/styles.css](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/styles.css))**:
  - Engineered smooth lerping camera director targeting 5 inspection angles: `1: FRONT WING`, `2: COCKPIT`, `3: POWER UNIT`, `4: DIFFUSER`, and `5: 360° ORBIT` with global keyboard hotkeys (`1`-`5`).
- **Aeroacoustic Wind Tunnel Audio Synthesizer ([src/services/soundEngine.ts](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/services/soundEngine.ts), [src/components/CarShowroom3D.tsx](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/components/CarShowroom3D.tsx), [src/views/CarLab.tsx](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/views/CarLab.tsx))**:
  - Web Audio synthesis generating procedural airflow whoosh, turbulence hiss, and drag reduction resonance when Straight Mode (X-Mode, -45% drag) attaches flow to the rear wing.
- **Interactive 2D Telemetry Lap Trace Scrubber ([src/views/CarLab.tsx](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/views/CarLab.tsx), [src/styles.css](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/styles.css))**:
  - Multi-parameter real-time telemetry card with Speed, Throttle, and Brake curves and a live scrubber needle synchronized to the 75s Silverstone Grand Prix hot lap.

---

## [Build R15 / Dynamic 4-Angle 3D Camera System, Telemetry Ghost Delta Phantom Car & Wet Tire Spray Roost] — 2026-08-27

### 08-27K Added & Enhanced

- **Dynamic 4-Angle 3D Camera System ([src/components/RaceScene3D.tsx](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/components/RaceScene3D.tsx), [src/components/TrackMap.tsx](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/components/TrackMap.tsx), [src/types.ts](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/types.ts), [src/styles.css](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/styles.css))**:
  - Implemented 4 live broadcast & onboard camera modes: **TV Broadcast Chase** (trackside panning with orbit offset), **Helicopter Aerial Chase** (+28m overhead orbit), **Cockpit Halo Driver POV** (+0.72m inside cockpit monocoque behind Halo central spar), and **Nosecone Bumper Cam** (+0.28m low asphalt perspective above front wing).
- **Holographic Telemetry Ghost Delta Phantom Car ([src/components/RaceScene3D.tsx](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/components/RaceScene3D.tsx), [src/components/TrackMap.tsx](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/components/TrackMap.tsx))**:
  - Holographic cyan wireframe phantom car (`#00f0ff`) tracking optimal pole reference pace in real time.
  - Interactive on/off toggle button (`👻 GHOST`) with live real-time pole delta badge (`POLE DELTA: -0.142s PURPLE` / `+0.240s YELLOW`).
- **Dynamic Wet Tire Spray Roost Particle System ([src/components/RaceScene3D.tsx](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/components/RaceScene3D.tsx))**:
  - 1,200 particle wet spray roost plumes rising and diffusing behind rear wheels and diffuser of cars traveling $>50\text{ km/h}$ in rainy conditions.
  - Plume volume, upward draft, and opacity dynamically coupled to vehicle velocity and precipitation depth.

---

## [Build R14 / Wind Tunnel Smoke Inserter, FLIR Thermal IR Camera & 3D Telemetry Playback Deck] — 2026-08-27

### 08-27J Added & Enhanced

- **Wind Tunnel Streamline Smoke Inserter ([src/components/CarShowroom3D.tsx](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/components/CarShowroom3D.tsx), [src/views/CarLab.tsx](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/views/CarLab.tsx), [src/styles.css](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/styles.css))**:
  - Engineered procedural 380-particle aerodynamic streamline wand tracer with selectable nozzle wands (`ALL WANDS`, `FRONT WING`, `AIRBOX & FIN`, `UNDERFLOOR`) modeling upwash, diffuser vortex expansion, and wake turbulence.
- **Thermal Infrared Tire & Brake FLIR Camera ([src/graphics/f1_2026/F1Car2026Model.ts](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/graphics/f1_2026/F1Car2026Model.ts), [src/components/CarShowroom3D.tsx](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/components/CarShowroom3D.tsx), [src/views/CarLab.tsx](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/views/CarLab.tsx), [src/styles.css](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/styles.css))**:
  - Implemented FLIR Ironbow thermal spectrum rendering cold composite bodywork ($<40^\circ\text{C}$ indigo), tire tread contact patches ($100^\circ\text{C}$ orange), glowing white-hot brake rotors ($>850^\circ\text{C}$ emissive), and high-heat Inconel exhaust/turbo turbine ($>900^\circ\text{C}$).
- **3D Telemetry Synchronized Playback Deck ([src/graphics/f1_2026/F1Car2026Model.ts](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/graphics/f1_2026/F1Car2026Model.ts), [src/components/CarShowroom3D.tsx](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/components/CarShowroom3D.tsx), [src/views/CarLab.tsx](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/views/CarLab.tsx), [src/styles.css](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/styles.css))**:
  - Live 75-second Grand Prix hot lap simulation loop driving wheel rotation ($\omega = v / r$), dynamic aerodynamic suspension squish/dive, active wing flap transitions (Z/X modes), and high-voltage MGU-K energy flow conduit pulsing (350 kW deploy green vs. 8.5 MJ regen amber) with real-time 3D cockpit HUD overlay.

---

## [Build R13 / 24-Track Extreme Detail Overhaul, Graphical Driver Cards & 3D Environment Polish] — 2026-08-27

### 08-27I Added & Enhanced

- **All 24 Grand Prix Circuits Extreme Precision Mapping ([src/data/circuitData.ts](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/data/circuitData.ts), [src/components/CircuitMapPreview.tsx](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/components/CircuitMapPreview.tsx))**:
  - Engineered distinct, mathematically verified SVG path definitions, genuine corner counts, turn names, and multi-DRS zones for every track from Sakhir, Melbourne, and Monaco to Suzuka (Figure-8 with bridge/underpass), Spa, Monza, and Yas Marina.
- **Interactive 24-Round Calendar Modal ([src/views/HQDashboard.tsx](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/views/HQDashboard.tsx))**:
  - Enabled clicking any round on the 2026 World Championship calendar to open a modal displaying the full 2D interactive circuit map, telemetry statistics, lap records, and animated driver cars.
- **Interactive Button & Workspace Audit**:
  - **Track Map**: Added interactive zoom rail (`+` / `−` / reset scale state) and SVG zoom transform (`TrackMap.tsx`).
  - **Timing Tower**: Added interactive session switcher dropdown (`Race`, `Qualifying`, `Practice`) with persistent state (`TimingTower.tsx`).
  - **Factory Operations**: Added interactive factory facility upgrades (`Design HQ`, `Wind Tunnel`, `Composites Lab`) and project creation handlers (`HQDashboard.tsx`).
- **Rich Graphical Driver Cards ([src/styles.css](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/styles.css), [src/components/DriverTelemetryPanel.tsx](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/components/DriverTelemetryPanel.tsx))**:
  - Added carbon-fiber weave composite textures, high-contrast team livery racing stripes, and giant translucent watermark driver numbers (`#4`, `#16`, `#1`, `#44`) in Barlow Condensed typography across all driver identity cards.
- **3D Environment Polish & Runoff Safety Barriers ([src/components/RaceScene3D.tsx](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/components/RaceScene3D.tsx))**:
  - Added trackside tire safety barriers on high-speed runoffs (Becketts, Stowe, Luffield, Abbey) and 150m/100m/50m distance marker boards approaching heavy braking zones.

---

## [Build R12 / Interactive CAD Cross-Section Clipping, CFD Pressure Heatmap & Targeted Subsystem Explode] — 2026-08-27

### 08-27H Added & Enhanced

- **Interactive Cross-Section CAD Clipping Planes ([src/graphics/f1_2026/F1Car2026Model.ts](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/graphics/f1_2026/F1Car2026Model.ts), [src/components/CarShowroom3D.tsx](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/components/CarShowroom3D.tsx), [src/views/CarLab.tsx](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/views/CarLab.tsx), [src/styles.css](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/styles.css))**:
  - Hardware-accelerated local clipping plane engine with selectable cut axes: **Axis X (Sagittal Side-Cut)** through ICE cylinders, MGU-K rotor and gearbox; **Axis Y (Horizontal Floor-Cut)** through lithium-NMC battery cells and diffuser channels; and **Axis Z (Transverse Front-to-Rear Cut)** through crash structures and radiator assemblies.
  - Interactive continuous offset slider with center reset.
- **CFD Surface Pressure Heatmap Shader & Mode ([src/graphics/f1_2026/F1Car2026Model.ts](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/graphics/f1_2026/F1Car2026Model.ts), [src/components/CarShowroom3D.tsx](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/components/CarShowroom3D.tsx), [src/views/CarLab.tsx](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/views/CarLab.tsx), [src/styles.css](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/styles.css))**:
  - Procedural CFD pressure mapping rendering stagnation high pressure ($+C_p$, red), free-stream neutral ($C_p \approx 0$, green), and deep suction low pressure ($-C_p$, purple) across all 30+ bodywork components.
  - Dynamic Straight Mode (X-Mode) drag shedding transitions front and rear wing flaps to neutral pressure in real time with floating CFD gradient legend bar.
- **Multi-Axis Targeted Subsystem Explode ([src/graphics/f1_2026/F1Car2026Model.ts](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/graphics/f1_2026/F1Car2026Model.ts), [src/views/CarLab.tsx](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/views/CarLab.tsx))**:
  - Subsystem explosion target filter (`ALL`, `AERO`, `PU`, `CHASSIS`, `SUSP`) enabling independent disassembly of individual assemblies (e.g. exploding only the 350kW Power Unit) while keeping the surrounding chassis intact.

---

## [Build R11 / 2026 Formula 1 Racecar Part-by-Part Modular CAD Studio & Dynamics Deployment] — 2026-08-27

### 08-27G Added & Implemented

- **Modular 3D Part-by-Part 2026 F1 Racecar Architecture ([src/graphics/f1_2026/F1Car2026Model.ts](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/graphics/f1_2026/F1Car2026Model.ts), [src/graphics/f1_2026/carPartsData.ts](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/graphics/f1_2026/carPartsData.ts))**:
  - Engineered over 30 distinct procedural 3D components representing the complete 2026 FIA "Nimble Car" architecture across Aerodynamics, Powertrain, Chassis & Safety, and Suspension & Running Gear.
  - Interactive **Continuous Exploded View Slider** ($0\% \to 100\%$) translating internal assemblies radially for structural CAD inspection.
  - Subsystem isolation filters (`FULL CAR`, `AERODYNAMICS`, `POWERTRAIN`, `CHASSIS & SAFETY`, `SUSPENSION & BRAKES`) and X-Ray wireframe toggle.
  - Direct 3D component click raycasting and quick-select dropdown displaying material composition, mass (kg), dimensions (mm), and official FIA regulation article citations.
- **Active Aerodynamics System (AAS) Kinematics & Physics Engine ([src/engine/physics/AeroEngine.ts](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/engine/physics/AeroEngine.ts), [src/components/CarShowroom3D.tsx](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/components/CarShowroom3D.tsx))**:
  - Articulated dual active front flaps and 3-element rear wing upper element between **Corner Mode (Z-Mode)** (high downforce) and **Straight Mode (X-Mode)** (low drag, -45% drag shedding).
  - Implemented 2026 partially flat floor ground-effect equations with reduced porpoising sensitivity and narrower 1900mm drag profile.
- **2026 Hybrid Power Unit Simulation & Manual Override Mode ([src/engine/physics/PowertrainEngine.ts](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/engine/physics/PowertrainEngine.ts), [src/views/CarLab.tsx](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/views/CarLab.tsx))**:
  - Implemented 50/50 power split: 400 kW 1.6L V6 Turbo ICE (100% sustainable drop-in e-fuel) + 350 kW MGU-K electrical generator ($1,006\text{ BHP}$ total output) and $8.5\text{ MJ/lap}$ regenerative braking recovery.
  - Implemented **Manual Override Mode (MOM / Overtake Boost)** with speed-dependent power tapering curve (>290 km/h) and full 350 kW boost override up to 337 km/h.
- **2026 FIA Regulatory Compliance Checklist ([src/views/CarLab.tsx](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/views/CarLab.tsx), [src/styles.css](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/styles.css))**:
  - Added live regulatory verification badges confirming 3,400 mm wheelbase, 1,900 mm width, 1,450 mm floor, 768 kg minimum weight, 350 kW MGU-K, and 100% sustainable fuel compliance.

---

## [Build R10 / Authentic Real-World F1 Circuit Geometry, Collapsible Workspace & Tactical Command Dock] — 2026-08-27

### 08-27F Added & Enhanced

- **Authentic 18-Corner Silverstone Grand Prix Circuit Geometry ([src/data/circuitData.ts](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/data/circuitData.ts), [src/components/TrackMap.tsx](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/components/TrackMap.tsx), [src/components/RaceScene3D.tsx](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/components/RaceScene3D.tsx))**:
  - Replaced generic template cubic beziers with authentic 18-corner FIA Silverstone track geometry (Hamilton Straight -> Abbey -> Farm Curve -> Village -> The Loop -> Aintree -> Wellington Straight -> Brooklands -> Luffield -> Woodcote -> Copse -> Maggotts -> Becketts -> Chapel -> Hangar Straight -> Stowe -> Vale -> Club).
  - Configured authentic layouts, corner coordinates, DRS zones, and start/finish lines for all 24 World Championship circuits.
- **100% Collision-Free 3D Track Scenery & Start Gantry ([src/components/RaceScene3D.tsx](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/components/RaceScene3D.tsx))**:
  - Re-positioned all grandstands (Hamilton Infield, Becketts Stadium, Stowe Runoff, Luffield Stadium), the Silverstone Wing Pit Complex, and outfield trees with safe clearance margins outside the track and pit lane envelopes.
  - Added start/finish overhead gantry with 5 red/green FIA starting light pods.
- **Collapsible Multi-Panel Workspace System ([src/views/RaceDashboard.tsx](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/views/RaceDashboard.tsx), [src/components/TimingTower.tsx](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/components/TimingTower.tsx), [src/components/DriverTelemetryPanel.tsx](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/components/DriverTelemetryPanel.tsx), [src/components/StrategyHorizon.tsx](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/components/StrategyHorizon.tsx), [src/styles.css](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/styles.css))**:
  - Added independent collapse/expand toggles for Timing Tower (left), Driver Telemetry (right), and Strategy Horizon (bottom).
  - Enables the 3D race canvas to expand dynamically to full width and height with smooth CSS grid transitions.
- **On-Demand Tactical Race Command Dock Modal ([src/components/DriverTelemetryPanel.tsx](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/components/DriverTelemetryPanel.tsx), [src/styles.css](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/styles.css))**:
  - Replaced the large static bottom command box with a compact status bar and modal trigger (`⚡ RACE COMMAND`).
  - Added an interactive slide-up strategic modal for Pace mode, ERS programs, tire compound selection, and pit stop calls.
- **Authentic Pit Radio Audio Player & OpenF1 Integration ([src/components/DriverTelemetryPanel.tsx](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/components/DriverTelemetryPanel.tsx), [src/services/radioAudioService.ts](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/services/radioAudioService.ts), [src/services/openf1Service.ts](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/services/openf1Service.ts))**:
  - Integrated interactive play/stop controls for driver radio transmissions with live equalizer waveform animations and Web Audio sound processing.

---

## [Build R9 / 2026 Formula 1 Racecar Modular Part-by-Part Engineering Architecture] — 2026-08-27

### 08-27E Researched & Planned

- **2026 FIA Technical Regulations Architecture Baseline**:
  - Researched and established full baseline engineering specifications according to official FIA 2026 regulations: Agile Nimble Car concept with 3,400 mm wheelbase (-200 mm), 1,900 mm overall width (-100 mm), 1,450 mm maximum floor width (-150 mm), 768 kg minimum weight limit (-30 kg), and narrower 18" tyres (280 mm front, 375 mm rear).
- **Active Aerodynamics System (AAS) Kinematics & Physics**:
  - Formulated active dual-state aerodynamics modeling replacing traditional DRS: **Corner Mode (Z-Mode)** for maximum downforce/braking vs. **Straight Mode (X-Mode)** for low drag with simultaneous front active flap shedding and rear 3-element active wing opening (-45% drag reduction).
- **2026 Hybrid Power Unit (PU2026) Architecture**:
  - Tripled electrical output with **350 kW MGU-K**, 400 kW 1.6L V6 Turbo ICE (100% sustainable drop-in e-fuel), removal of MGU-H, 8.5 MJ/lap regenerative braking recovery, and **Manual Override Mode (MOM / Overtake Boost)** speed-tapered power mapping.
- **Part-by-Part 3D Modular CAD Hierarchy**:
  - Formulated hierarchical 3D component breakdown encompassing over 30 inspectable parts across Aerodynamics, Powertrain & Hybrid, Chassis & Safety, and Suspension & Brakes with interactive exploded-view transforms, subsystem filters, and material callouts.

---

## [Build R8 / 3D Pit Lane Sequence, Mechanic Crew & Doppler Weather Radar] — 2026-08-27

### 08-27D Added & Enhanced

- **Interactive 3D Pit Lane Sequence & Low-Poly Mechanic Crew ([src/graphics/createPitCrew.ts](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/graphics/createPitCrew.ts), [src/components/RaceScene3D.tsx](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/components/RaceScene3D.tsx))**:
  - Engineered procedural low-polygon humanoid pit crew mechanics in team overalls (matching primary & secondary team liveries) with detailed helmets, visors, harnesses, and role-specific equipment.
  - **4 Tyre Gunners** (FL, FR, RL, RR) with pneumatic wheel gun props, crouching posture, and rapid vibration animation during tire swaps.
  - **1 Front Quick-Lift Jack Operator** with lever pivot mechanism, lifting the car chassis by `+0.14m`.
  - **1 Rear Cradle Jack Operator** positioned at the rear diffuser.
  - **1 Lollipop Controller** with dynamic two-sided signal disc (RED "STOP" -> GREEN "GO") with LED illumination.
  - **Pit Lane Architecture & Pit Wall**: Parallel pit lane branch spline, concrete pit wall barrier with timing stands, team garages, and overhead pneumatic gantry with hanging air lines.
  - **Stationary Stopwatch HUD**: Real-time 3D pit stop stopwatch display showing elapsed stop duration, target, and multi-step phase indicators (Jacks Up -> Wheel Guns -> Tyre Swap -> Jacks Down -> Green Go).
- **Realistic Randomized Pit Stop Durations ([src/engine/workers/PhysicsWorker.ts](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/engine/workers/PhysicsWorker.ts), [src/types.ts](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/types.ts))**:
  - Integrated randomized stationary stop durations between **1.8s and 4.2s** based on pit crew execution and random variation, accurately modeled inside the 100 Hz physics simulation loop.
- **Weather Radar Doppler Precipitation Overlay ([src/components/DopplerRadarOverlay.tsx](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/components/DopplerRadarOverlay.tsx), [src/components/TrackMap.tsx](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/components/TrackMap.tsx), [src/components/CircuitMapPreview.tsx](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/components/CircuitMapPreview.tsx))**:
  - **360° Circular Doppler Radar Sweep**: Continuous rotating radar beam with conical phosphor fading trail and antenna pulse node.
  - **Concentric Range Rings & Bearings**: 5 KM, 10 KM, 15 KM, 20 KM range markers and cardinal compass notches (N, E, S, W).
  - **Meteorological Rain Density Heatmap**: Dynamic multi-cell precipitation clusters with official Doppler dBZ color palette (Green drizzle -> Yellow moderate -> Orange heavy -> Red downpour -> Pink monsoon).
  - **Dedicated Radar Mode & Interactive Controls**: Full-screen radar console with instant rainfall adjustment sliders and preset pills (`DRY`, `DRIZZLE`, `RAIN`, `MONSOON`).
- **3D Atmospheric Weather & Rain Particles ([src/components/RaceScene3D.tsx](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/components/RaceScene3D.tsx))**:
  - 2,800 falling rain particle streaks reacting to storm intensity, dynamic overcast storm fog, darkened wet asphalt surface with enhanced specular gloss, and atmospheric 3D rotating Doppler scanning ring hovering over the circuit.

---

## [Build R7 / Interactive Circuit Maps, Audio Synthesis & News Persistence] — 2026-08-27

### 08-27C Added & Enhanced

- **Interactive 2D Circuit Map Preview ([src/components/CircuitMapPreview.tsx](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/components/CircuitMapPreview.tsx))**:
  - Added comprehensive 2D SVG track layout datasets for all 24 Formula 1 World Championship rounds in [`src/data/circuitData.ts`](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/data/circuitData.ts).
  - Multi-sector gradient track lines (S1/S2/S3), green DRS activation zones, and start/finish line indicator.
  - Interactive corner hover tooltips with turn numbers, corner naming (Abbey, Copse, Stowe, Eau Rouge, Tarzanbocht, etc.), and circuit telemetry metrics.
  - **Animated On-Track Car Position Dots**: Rendered glowing car markers for Driver 1 and Driver 2 dynamically interpolating along the SVG track path using `pathRef.current.getPointAtLength()` and `getTotalLength()`.
- **Procedural V6 Turbo-Hybrid Engine Sound Synthesizer ([src/services/soundEngine.ts](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/services/soundEngine.ts))**:
  - Web Audio synthesis modeling 6-cylinder ICE firing harmonics scaling with RPM, waveshaper distortion, turbocharger boost spool whine, MGU-K electrical deployment/harvest whir, and tire skid lockup noise.
  - Added live engine sound toggle button with real-time telemetry streaming in [`src/views/LiveTelemetryExplorer.tsx`](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/views/LiveTelemetryExplorer.tsx).
- **Dynamic Live Radio Player with Web Audio Synthesis ([src/services/radioAudioService.ts](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/services/radioAudioService.ts))**:
  - Dual-tone push-to-talk (PTT) radio key beeps (1850Hz/2300Hz), VHF bandpass filter (1400Hz center, Q=1.8), frequency crunch distortion, and dynamic pink/white cockpit static hiss.
  - Vocal audio playback via SpeechSynthesis API / OpenF1 audio clips with animated equalizer waveform bars and abort controls.
- **Paddock News Bookmark & OpenF1 Media Sync ([src/components/PaddockNewsWidget.tsx](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/components/PaddockNewsWidget.tsx))**:
  - Category filter persistence saved to `localStorage` (`f1_paddock_news_category`).
  - Article bookmarking saved to `localStorage` (`f1_paddock_news_bookmarks`).
  - **Automated Background Media Sync**: Background sync timer querying [`src/services/f1NewsService.ts`](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/services/f1NewsService.ts) for incoming breaking technical bulletins and triggering toast alerts in [`src/views/HQDashboard.tsx`](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/views/HQDashboard.tsx).

---

## [Build R6 / Live Telemetry & Paddock News] — 2026-08-27

### 08-27A Added

- **OpenF1 Real-Time Telemetry Explorer ([src/views/LiveTelemetryExplorer.tsx](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/views/LiveTelemetryExplorer.tsx))**:
  - Grand Prix meeting and session selector for real-world circuits (Silverstone, Spa, Monza, Monaco).
  - Head-to-Head driver comparison selector (Norris `#4` vs Verstappen `#1`, Leclerc `#16`, Russell `#63`).
  - High-precision SVG speed profile overlay trace (0–350 km/h) with corner apex annotations (Abbey, Copse, Stowe).
  - Throttle & Brake input pressure trace comparison.
  - Tire Stint strategy timeline breakdown by compound.
  - Team radio pit wall communications audio player & transcripts.
  - Live track weather and atmospheric telemetry (track temp, air temp, wind speed, rain risk).
- **Formula 1 Paddock News Center ([src/components/PaddockNewsWidget.tsx](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/components/PaddockNewsWidget.tsx))**:
  - Live news feed embedded in Team HQ with category filter pills (`Technical`, `Regulations`, `Paddock`, `Race Report`, `Driver Market`).
  - Featured story banner, read-time chips, and article inspection modal.
- **Data Services Layer**:
  - Created [`src/services/openf1Service.ts`](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/services/openf1Service.ts) connecting to `api.openf1.org` with robust offline fallbacks.
  - Created [`src/services/f1NewsService.ts`](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/services/f1NewsService.ts) for motorsport journalism feeds.
- **Navigation & App Shell**:
  - Added `Live Telemetry` tab into [`src/components/AppHeader.tsx`](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/components/AppHeader.tsx) and updated [`src/types.ts`](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/types.ts).

---

## [Governance & Real-Time Roadmap Expansion] — 2026-08-27

### 08-27B Added

- **Standard Operating Procedures System**:
  - Created [`.master/SOP.md`](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/.master/SOP.md), [`.agents/rules/sop_protocol.md`](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/.agents/rules/sop_protocol.md), and [`AGENTS.md`](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/AGENTS.md) for persistent universal rule injection on all new conversations.
  - Created automated SOP validation script [`.master/scripts/validate_sop.js`](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/.master/scripts/validate_sop.js) with `npm run sop:validate`.
  - Added [`.master/archive/archive_index.md`](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/.master/archive/archive_index.md) for archival preservation.

---

## [Build R5 / 2026 UI Overhaul] — 2026-08-27

### Added & Upgraded

- **Official 2026 Grid & Constructors Integration**:
  - Replaced legacy drivers with the official 2026 Formula 1 Grid (20 drivers across 10 teams).
- **Bespoke Motorsport Command Center Design System**:
  - Replaced entire compressed stylesheet with deep carbon and brushed titanium UI.
- **Race Center Overhaul**:
  - F1 TV leaderboard layout in Timing Tower and 8-LED RPM shift-light tachometer.
- **3D Graphic Rendering Fixes**:
  - Fixed shadow camera bias (+0.0008) and ribbon normal computations.
- **Strategy Workspace Overhaul**:
  - Plan A/B/C cards and non-overlapping SVG race delta chart.
- **Car Lab & Team HQ Overhauls**:
  - 3-column setup lab and factory R&D upgrade pipeline.

---

## [Build R4] — 2026-08-27

- Fixed invisible 3D track through adaptive winding and double-sided materials.

## [Build R3] — 2026-08-26

- Added on-screen build badge (`BUILD R3`).
- Added interactive onboarding overlay guide.

## [Build R2] — 2026-08-26

- Added mobile 3D update: Three.js race world, car showroom, mobile telemetry controls.

## [Build R1] — 2026-08-26

- Initial 100 Hz Web Worker deterministic physics engine and Vite GitHub Pages deployment setup.
