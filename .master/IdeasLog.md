# Ideas & Feature Roadmap Log — Formula 1 Management Simulator

This log tracks prospective features, 3D simulation enhancements, realism upgrades, gameplay modes, external data integrations, architectural expansions, and completed ideas.

_This is a living document. Ideas created in Report Cards are continuously added here, and finished items move to the Completed section at the bottom._

---

## 1. Advanced 3D Engine Technologies & Asset Creation Pipeline

- **Accurate Real-World GPS Spline Circuits with Elevation**:
  - Build millimeter-accurate circuit profiles (Silverstone, Spa-Francorchamps, Monza, Monaco, Suzuka) with real elevation changes (Eau Rouge compression, Becketts switchbacks), authentic kerb profiles, grandstands, pit buildings, safety barriers, and paddock architecture.
  - **2026 Track Design Dossier as 3D Build Spec** (added 2026-08-28): Use [.master/documents/track_design_report_2026_calendar.md](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/.master/documents/track_design_report_2026_calendar.md) as the authoritative reference for modeling all 23 2026-calendar circuits — including the new Madring (La Monumental banked corner at ≤13.5° banking, twin under-motorway tunnels, covered paddock), the relocated Bahrain GP at Sepang, and per-venue climate profiles to drive dynamic weather simulation.

- **Local 3D Tooling & MCP Integration**:
  - **Blender + Blender MCP Server**: Use local Blender (MCP) to block in the 2026 envelope from the car design research dossier, inspect topology, and export glTF/GLB into the web engine. Photo board is already in `.master/documents/references/f1_2026_car/`.
  - **Godot Engine & Unity Integration**: Explore WebGL/WebAssembly exports or standalone desktop builds for ultra-high-fidelity physics, ray-traced reflections, and cinematic replays.
- **Deep-Dive 3D Tech Stack Upgrades (Web & Native)**:
  - **Three.js WebGPU Renderer**: Migrate from WebGL to Three.js WebGPU / TSL (Three.js Shading Language) for compute shaders, realistic particle physics (wet tire spray, tire smoke, sparks), and real-time screen-space reflections (SSR).
  - **Photorealistic 3D Car Meshes & PBR Materials**:
    - Multi-part modular **2026-regulation** chassis (flat floor, large diffuser, **no Venturi tunnels**, **no beam wing**), animated Corner/Straight active front+rear flaps, rotating 18" 280/375 mm wheels, glowing brake rotors, Pirelli sidewall textures. Spec: [.master/documents/f1_2026_car_design_research.md](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/.master/documents/f1_2026_car_design_research.md).
  - **Blender 2026 Car v1 (next)**:
    - Generic FIA-envelope car in the Mercedes W17 box (5505 × 1900 × 950 mm, 3400 mm wheelbase), glTF export into `public/models/f1_2026/`, then swap `createF1Car2026` off procedural primitives.
  - **Accurate Real-World GPS Spline Circuits with Elevation**:
    - Build millimeter-accurate circuit profiles (Silverstone, Spa-Francorchamps, Monza, Monaco, Suzuka) with real elevation changes (Eau Rouge compression, Becketts switchbacks), authentic kerb profiles, grandstands, pit buildings, safety barriers, and paddock architecture.
  - **Live Weather & Environmental FX**:
    - Real-time weather API integration fetching actual track conditions (air/track temperature, rain radar, wind speed/direction) for Grand Prix circuits.
    - Dynamic rain screen shaders on cockpit camera view and water spray particle trails.
  - **WebGL Instanced Rendering with LOD**:
    - Implement instanced rendering and level-of-detail meshes in `RaceScene3D.tsx` to maintain 60 FPS on mobile and low-spec laptops when rendering full grids.

---

## 2. Audio Engine & Sound Synthesis

- **Dynamic Web Audio Engine**:
  - Procedural / sampled V6 Turbo-Hybrid engine sound synthesis scaling with RPM, throttle, and gear.
  - Turbocharger spool whine and MGU-K electrical deployment whir.
  - Dynamic wind noise on high-speed straights and tire lockup screech.
- **Web Audio Sound Profile Presets**:
  - Add an audio toggle in the header allowing users to select sound profiles (e.g. Modern 2026 Turbo-Hybrid, 2004 V10 Screamer, or Muted Broadcast).

---

## 3. Gameplay, AI & Strategy Enhancements

- **Dynamic AI Strategy Reactions**:
  - Implement dynamic AI undercut/overcut triggers in `PhysicsWorker.ts` so rival teams (e.g. Verstappen / Leclerc) respond reactively to player pit stop calls and dirty air.
- **Dynamic 3D Safety Car & VSC Intervention Sequence**:
  - Procedural safety car model deploying from pit lane to bunch up the pack during yellow flag incidents with delta delta speed restrictions.
- **Live Brake Rotor Thermal Glow & Titanium Spark Particles**:
  - Emissive carbon brake disc shaders glowing cherry-red (>900°C) on heavy braking zones (Stowe, Vale) with floor titanium skid sparks on curbs.
- **2026 Active Aero Wind Tunnel CFD Particle Streamline Visualizer**:
  - Add real-time CFD particle vectors flowing over front wing active flaps, sidepod undercuts, and 3-element rear wing showing low-pressure vortex sheets in Corner vs. Straight modes.
- **2026 350kW MGU-K Thermal Inverter & Battery Cell Balance Simulation**:
  - Simulate cell-by-cell temperature distribution, cooling jacket glycol loop, and state-of-health degradation under aggressive 8.5 MJ/lap regenerative braking cycles.
- **Interactive Part-by-Part 3D Blueprint & CAD Disassembly Studio**:
  - Provide an interactive multi-axis exploded CAD viewer with cross-section clipping planes, material analysis, and real-time FIA technical regulation compliance checks.
- **Driver Radio Voice Customization & Custom Pit Calls**:
  - Allow user to customize race engineer and driver voices via Web Speech API accents or ElevenLabs Web Audio audio buffers.
- **Multiplayer Pit Wall Strategy Challenge**:
  - WebRTC peer-to-peer synchronization allowing 2 players to compete head-to-head as rival team strategists.
- **Live OpenF1 & SignalR Telemetry Ingestion Engine & Broadcast Sync Buffer** (added 2026-08-28):
  - Real-time multi-channel telemetry streamer buffering live GP session feeds (`/car_data`, `/location`, `/team_radio`, `/intervals`, `/race_control`) with 0–90s broadcast delay offset slider matching TV feeds.
- **Dual-Mode Team Radio Web Audio Pipeline with Direct MP3 + Neural Voice Synthesis** (added 2026-08-28):
  - Synchronized pit wall comms playing real OpenF1 `.mp3` audio clips through VHF bandpass DSP and falling back to zero-latency natural neural voice synthesis.
- **Live 3D GPS Car Tracking on Ribbon Circuits** (added 2026-08-28):
  - Translating real OpenF1 `location` GPS coordinates $(X,Y,Z)$ into 3D spline progress in `RaceScene3D.tsx` to animate actual live cars during Formula 1 Grands Prix.

---

## Completed Ideas & Features

Completed items are moved here as they are deployed and verified:

- ✅ **Vector SVG Team Logos, Large Angled Movement Stripes & Constructor Persistence Fix**: Designed bespoke vector SVG logos and crests for all 10 official Formula 1 constructor teams (McLaren, Ferrari, Red Bull, Mercedes, Aston Martin, Williams, Alpine, Racing Bulls, Kick Sauber, Haas). Built `TeamBanner`, `TeamLogoBadge`, and `TeamAngledBackdrop` with large angled stripes (`-22deg`) and movement velocity streaks. Fixed constructor team selection persistence across landing login portal, 100 Hz physics simulation worker, session storage, and dashboard views (`TeamGraphics.tsx`, `ParallaxAuthScreen.tsx`, `App.tsx`, `PhysicsWorker.ts`, `types.ts`, `AppHeader.tsx`, `HQDashboard.tsx`, `DriverTelemetryPanel.tsx`, `StrategyWorkspace.tsx`, `TimingTower.tsx`, `styles.css`).
- ✅ **Bespoke Motorsport Vector Icon Suite, 3D Parallax Paddock Auth Gateway & Context+Focus Cards**: Created 14 custom vector SVG motorsport icons (`F1Icons.tsx`), multi-layer 3D parallax access portal with 3D tilting FIA Superlicense card, 10-team constructor credentials, 4-tier operational role switcher, simulated biometric chip scan with audio, and reusable `ContextFocusCard` component supporting compact KPI summary strips and full-screen holographic deep-dive modal inspection across CarLab and Strategy Workspace (`F1Icons.tsx`, `ParallaxAuthScreen.tsx`, `ContextFocusCard.tsx`, `App.tsx`, `AppHeader.tsx`, `CarLab.tsx`, `StrategyWorkspace.tsx`, `styles.css`).
- ✅ **3D Car Showroom CAD Viewport Overhaul, HUD Glassmorphism & Staging Polish**: Implemented missing CSS rules for `.car-showroom-3d` and overlay HUD badges, heroic camera framing (36° FOV, close-up orbit), flush carbon inspection pad with CNC titanium bevel rim, CAD coordinate ground grid (`GridHelper`), soft contact shadow plane, and high-contrast monospace typography (`styles.css`, `CarShowroom3D.tsx`).
- ✅ **Dynamic Aerodynamic Aero-Rake Rig & 3D Kiel Boundary Layer Wake Matrix**: 40-probe Pitot-tube / Kiel probe grid mounted behind front tyres, dynamic wake turbulence calculation ($C_p \approx -0.65$ to $-0.95$), 3D streamline wake particle tracer system, live in-viewport 40-probe pressure matrix HUD overlay, and Article 3.4 part metadata (`F1Car2026Model.ts`, `carPartsData.ts`, `CarShowroom3D.tsx`, `CarLab.tsx`, `styles.css`).
- ✅ **Authentic 23-Circuit Vector Geometries & 2026 Calendar Synchronization**: Handcrafted authentic FIA vector SVG tracks, DRS activation lines, start/finish lines, corner tooltips, and new 2026 venues (Madring Madrid #153 and Sepang Malaysia #16) replacing all placeholder oval curves; synchronized `DEFAULT_MEETINGS` and `FULL_RACE_CALENDAR` across the simulator (`circuitData.ts`, `openf1Service.ts`, `HQDashboard.tsx`).
- ✅ **Multi-Modal Circuit Visualizer with Satellite & FIA Map Modes**: 3 switchable preview modes (Vector SVG, Satellite Earth Observation via Planet Labs SkySat, and FIA Track Map), circuit direction badges, elevation relief tags, and 2026 active aero intel strips (`CircuitMapPreview.tsx`, `public/assets/tracks/`, `styles.css`).
- ✅ **Broadcast Delay Synchronization Scrubber & Buffer Offset Engine**: Interactive TV sync scrubber in `RaceStatusBar` and `LiveTelemetryExplorer` with presets (`LIVE 0s`, `F1 TV 20s`, `SKY/ESPN 35s`, `STREAM 60s`), fine 0–90s slider popover, `sessionStorage` persistence, and synchronization with `radioAudioService` (`RaceStatusBar.tsx`, `App.tsx`, `LiveTelemetryExplorer.tsx`, `radioAudioService.ts`, `styles.css`).
- ✅ **Real GPS Coordinate to 3D Track Spline Interpolator & GPS Tracker**: High-precision mathematical spline projection engine (`SplineTrackProjector`) with equidistant arc-length lookup table, binary search, orthogonal dot-product projection, lateral racing line deviation, and on-track compliance detection; interactive **GPS TRACK PROJECTION** tab in `LiveTelemetryExplorer` with frame scrubbing and side-by-side metric cards (`splineProjection.ts`, `openf1Service.ts`, `LiveTelemetryExplorer.tsx`, `styles.css`).
- ✅ **Real-Time Fourier Spectrum Audio Visualizer & Role-Tagged Comms Feed**: Animated Canvas + `AnalyserNode` frequency spectrum bars with team livery coloring, peak-hold caps, speaker role badges (`🎧 RACE ENGINEER`, `🏎️ DRIVER`), category filter tabs (`ALL`, `PIT WALL`, `DRIVER`, `BOX / TIRES`), and master gain DSP routing (`AudioWaveformVisualizer.tsx`, `radioAudioService.ts`, `DriverTelemetryPanel.tsx`, `LiveTelemetryExplorer.tsx`, `styles.css`).
- ✅ **Custom Livery Color & Sponsor Decal Studio**: Procedural carbon weave textures (Gloss Twill, Raw Matte, Forged Carbon, Satin), dynamic 1024x512 livery canvas map generator with custom team sponsor decals on sidepods, nose cone, shark fin, and rear wing, 7 preset livery themes, and color pickers seamlessly hot-swapped onto 3D CAD meshes (`F1Car2026Model.ts`, `CarLab.tsx`, `styles.css`).
- ✅ **High-Resolution 4K Studio Snapshot Export Pipeline**: High-res 3840×2160 offscreen render pipeline with aspect-corrected camera, ACESFilmic tone mapping, PCF soft shadows, composite technical watermark footer banner with live telemetry metrics and FIA certification badge, CAD shutter button with audio-visual camera flash, and automated PNG download (`CarShowroom3D.tsx`, `CarLab.tsx`, `styles.css`).
- ✅ **Broadcast-Quality Natural Team Radio Voices & VHF Squelch DSP**: Strict blacklisting of novelty/robotic voices, dynamic natural/neural voice scoring, persona matching for Race Engineers and Drivers, auto-ducking VHF pink noise static, authentic Roger PTT beeps, squelch tail bursts, acoustic profile presets (`Authentic VHF`, `Studio HD`, `Cockpit Raw`), and interactive Test Comms previews (`radioAudioService.ts`, `openf1Service.ts`, `DriverTelemetryPanel.tsx`, `LiveTelemetryExplorer.tsx`).
- ✅ **Exact 3D F1 Steering Wheel Replica & Cockpit Lab**: Photo-realistic procedural 3D steering wheel with 28+ interactive buttons, rotary dials, carbon paddle shifters, live 4.3" OLED telemetry canvas display, 15x RGB shift LEDs, zero-latency Web Audio mechanical click/detent synthesis, rich holographic HUD tooltips, and bi-directional 100 Hz simulation integration (`F1SteeringWheelModel.ts`, `steeringWheelData.ts`, `SteeringWheel3D.tsx`, `SteeringWheelLab.tsx`, `wheelAudioSynthesizer.ts`).
- ✅ **Camera Viewport Director & Keyboard Shortcuts**: 5 dedicated camera inspection angles (`1: FRONT WING`, `2: COCKPIT`, `3: PU`, `4: DIFFUSER`, `5: ORBIT`) with smooth mathematical lerping and hotkeys (`CarShowroom3D.tsx`, `CarLab.tsx`, `styles.css`).
- ✅ **Aeroacoustic Wind Tunnel Audio Synthesizer**: Web Audio bandpass-filtered airflow whoosh and drag drop resonance modulated with airspeed and Active Aero modes (`soundEngine.ts`, `CarShowroom3D.tsx`, `CarLab.tsx`).
- ✅ **Interactive 2D Telemetry Lap Trace Scrubber Graph**: Multi-trace Speed, Throttle, and Brake card with real-time synchronized scrubber needle (`CarLab.tsx`, `styles.css`).
- ✅ **Wind Tunnel Streamline Smoke Inserter**: Multi-nozzle particle streamline generator (380 particles) with selectable wands (`ALL`, `FRONT WING`, `AIRBOX`, `UNDERFLOOR`) modeling upwash and diffuser curl (`CarShowroom3D.tsx`, `CarLab.tsx`, `styles.css`).
- ✅ **Thermal Infrared Tire & Brake FLIR Camera**: FLIR Ironbow thermal camera view with real-time temperature gradients on tires ($100^\circ\text{C}$ orange), glowing white-hot brake rotors ($>850^\circ\text{C}$), and high-heat exhaust (`F1Car2026Model.ts`, `CarShowroom3D.tsx`, `CarLab.tsx`, `styles.css`).
- ✅ **3D Telemetry Synchronized Playback Deck**: Real-time 75-second Grand Prix hot lap simulation loop driving wheel rotation ($\omega = v / r$), aerodynamic suspension squish/dive, active wing flap transitions (Z/X modes), 350kW MGU-K energy flow conduit pulsing, and cockpit HUD overlay (`CarShowroom3D.tsx`, `CarLab.tsx`, `styles.css`).
- ✅ **Interactive CAD Cross-Section Clipping Planes (X/Y/Z)**: Hardware-accelerated local clipping plane cutting through ICE cylinders, 350kW MGU-K, lithium-NMC battery cells, and underfloor diffuser with offset slider (`F1Car2026Model.ts`, `CarShowroom3D.tsx`, `CarLab.tsx`, `styles.css`).
- ✅ **CFD Surface Pressure Heatmap Shader & Mode**: Real-time aerodynamic surface pressure distribution rendering (+Cp Stagnation Red -> Neutral Green -> -Cp Suction Purple) with dynamic Straight Mode (X-Mode) load shedding and floating legend (`F1Car2026Model.ts`, `CarShowroom3D.tsx`, `CarLab.tsx`, `styles.css`).
- ✅ **Multi-Axis Targeted Subsystem Explode Orbit**: Subsystem-specific explosion target filters (`ALL`, `AERO`, `PU`, `CHASSIS`, `SUSP`) enabling isolated disassembly of individual component assemblies (`F1Car2026Model.ts`, `CarLab.tsx`).
- ✅ **Modular 3D Part-by-Part 2026 F1 Racecar Architecture & CAD Studio**: 30+ inspectable procedural CAD components across Aero, Powertrain, Chassis & Suspension, continuous 0–100% exploded CAD slider, subsystem isolation filters, 3D raycast inspection overlay, Active Aero (Corner/Straight modes) kinematics, and 350kW MGU-K Hybrid Power Unit simulation (`F1Car2026Model.ts`, `carPartsData.ts`, `CarShowroom3D.tsx`, `CarLab.tsx`, `AeroEngine.ts`, `PowertrainEngine.ts`).
- ✅ **Authentic 18-Corner Silverstone & 24 Grand Prix Circuit Geometries**: Verified FIA turn sequences, accurate 2D SVG paths, and accurate 3D spline ribbons (`circuitData.ts`, `TrackMap.tsx`, `RaceScene3D.tsx`).
- ✅ **100% Collision-Free 3D Track Scenery & Start Gantry**: Recalculated safe placement of grandstands, pit complexes, FIA starting lights gantry, and vegetation outside track and pit lane envelopes (`RaceScene3D.tsx`).
- ✅ **Collapsible Multi-Panel Workspace System**: Independent collapse controls for Timing Tower, Driver Telemetry, and Strategy Horizon enabling full-screen 3D race canvas (`RaceDashboard.tsx`, `TimingTower.tsx`, `DriverTelemetryPanel.tsx`, `StrategyHorizon.tsx`, `styles.css`).
- ✅ **On-Demand Tactical Race Command Dock Modal**: Modal/drawer strategy dock freeing vertical space for telemetry and pit radio (`DriverTelemetryPanel.tsx`, `styles.css`).
- ✅ **Interactive F1 Team Radio Audio Playback**: Authentic driver-to-pit radio playback with animated equalizer waveform bars and Web Audio sound processing (`DriverTelemetryPanel.tsx`, `radioAudioService.ts`, `openf1Service.ts`).
- ✅ **Interactive 3D Pit Lane Sequence & Low-Poly Mechanic Crew**: 3D pit lane architecture, team overalls, 4 vibrating tyre gunners, front/rear quick-lift jacks (+0.14m elevation), red/green lollipop signal controller, and randomized stop durations (1.8s–4.2s) with live 3D stop timer HUD (`createPitCrew.ts`, `RaceScene3D.tsx`, `PhysicsWorker.ts`).
- ✅ **Weather Radar Doppler Precipitation Overlay**: Animated 360° circular Doppler radar sweep, 5–20 KM range rings, multi-cell precipitation heatmaps with official dBZ reflectivity palette, and 3D rain particle storm simulation (`DopplerRadarOverlay.tsx`, `TrackMap.tsx`, `RaceScene3D.tsx`, `CircuitMapPreview.tsx`).
- ✅ **Interactive On-Track Car Position Dots (2D Circuit Map)**: Animated glowing car markers for both reference drivers interpolating along SVG track paths using `getPointAtLength()` with real-time lap progress (`CircuitMapPreview.tsx`).
- ✅ **Procedural V6 Turbo-Hybrid Engine Audio Synthesizer**: Web Audio synthesis of 6-cylinder ICE firing harmonics, turbocharger boost whine, MGU-K electrical deployment/harvest, and brake lockup tire skid screeching (`soundEngine.ts`).
- ✅ **Paddock News OpenF1 Media Sync & Breaking Alert System**: Automated interval background sync pulling breaking FIA Technical Directives and dispatching toast notifications (`f1NewsService.ts`, `PaddockNewsWidget.tsx`).
- ✅ **Interactive 2D Circuit Map Previews (All 24 Grand Prix Rounds)**: 2D SVG track geometries with DRS zones, corner tooltips, and circuit specs across all 24 championship rounds (`circuitData.ts`, `CircuitMapPreview.tsx`).
- ✅ **Dynamic Web Audio Team Radio Engine**: Synthesized PTT beeps, bandpass VHF filtering, static crunch, and live frequency HUD with animated equalizer waveforms (`radioAudioService.ts`).
- ✅ **Paddock News Bookmark & Filter Persistence**: LocalStorage persistence for user categories and bookmarked technical articles with custom empty states (`PaddockNewsWidget.tsx`).
- ✅ **OpenF1 Real-Time Telemetry Explorer**: Interactive multi-driver telemetry analyzer (`LiveTelemetryExplorer.tsx`) comparing speed traces, throttle/brake inputs, tire stints, and team radio audio clips.
- ✅ **Formula 1 Paddock News Feed Widget**: Live categorized technical and paddock media feed (`PaddockNewsWidget.tsx`) embedded in Team HQ.
- ✅ **2026 Official Grid & Constructors Integration**: Replaced legacy grid with 20 official 2026 F1 drivers and 10 constructor teams across all views.
- ✅ **Bespoke Motorsport Command Center Design System**: Deep carbon titanium glassmorphism styling, clean typography hierarchy, zero text overlapping, and tactile interactive controls.
- ✅ **3D Track Shadow Acne & Spike Resolution**: Fixed shadow camera bias (+0.0008) and ribbon normal generation in `RaceScene3D.tsx`.
- ✅ **Master Governance & SOP Automation**: Established `.master/` documentation system, `FileManifest.md`, `TroubleshootingLog.md` with usage counts, and `npm run sop:validate`.

## Proposed — 2026-08-28 (Track Simulation Realism & Visualizer Roadmap)

- **Dynamic 3D Track Elevation Contouring**: Extrude real elevation deltas (e.g. +40.8m Spa, +30.9m COTA, +27.6m Red Bull Ring) into the 3D ribbon mesh in `RaceScene3D` with banked turns (Zandvoort 18°, Madring 24% / 13.5°).
- **Track Sector Aero Benchmark Visualizer**: Interactive sector-by-sector delta gauge comparing straight-line drag vs cornering downforce demands across all 23 circuits with recommended active aero flap presets.
- **Live Weather Radar Cloud Layer on Satellite Imagery**: Layer dynamic Doppler rainfall radar tiles directly on top of the satellite aerial photography in `CircuitMapPreview` for real-time track condition forecasting.

## Proposed — 2026-08-28 (Track Imagery & Live Telemetry Roadmap)

- **Live WebSocket/MQTT OpenF1 Telemetry Streaming Worker**: Connect background Web Worker to OpenF1 MQTT/WebSocket broker during live F1 race weekends with automatic reconnection, buffer queueing, and dropped packet recovery.
- **Dynamic 3D Car Position Sync via Live GPS Feed**: Feed live 3.7 Hz OpenF1 $(X, Y, Z)$ coordinates directly into `RaceScene3D` through `SplineTrackProjector` to render all 20 real-world cars racing live on our 3D track ribbon in real-time.
- **Fast-Forward & Rewind Time Machine Buffer**: Store up to 10 minutes of full telemetry and GPS snapshots in IndexedDB, allowing users to scrub backwards in time and replay crucial race overtakes or incidents from multiple camera angles.
- **Circuit Photo Cards in Track Explorer**: Use the 23 track maps + 19 aerials + 2 venue photos (`.master/assets/tracks_2026/`) as a gallery layer in the Track Explorer / CircuitMapPreview, with lazy-loaded imagery and Commons attribution tooltips.
- **Aerial-Referenced 3D Terrain Textures**: Project the SkySat aerials as ground textures under the 3D track ribbons for the 14 covered European/American venues to validate layout accuracy against the sim geometry.
- **Imagery Completeness Bot**: Scheduled re-run of `fetch_track_images_final.py` to detect newly-uploaded Commons aerials for the four gaps (Miami, Madring, Vegas, Lusail) as new photography gets freed.
- **Typed `circuits2026.ts` Dataset**: Convert the report dossier + manifest into a typed TS dataset (lengths, turns, capacities, imagery paths, licenses) powering both Track Explorer and the weather-sim module.
