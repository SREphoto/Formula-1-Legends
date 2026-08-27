# Master Change Log — Formula 1 Management Simulator

All notable project changes, releases, revisions, and architecture updates are documented in this log.

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
