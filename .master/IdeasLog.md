# Ideas & Feature Roadmap Log — Formula 1 Management Simulator

This log tracks prospective features, 3D simulation enhancements, realism upgrades, gameplay modes, external data integrations, architectural expansions, and completed ideas.

*This is a living document. Ideas created in Report Cards are continuously added here, and finished items move to the Completed section at the bottom.*

---

## 1. Advanced 3D Engine Technologies & Asset Creation Pipeline

- **Local 3D Tooling & MCP Integration**:
  - **Blender + Blender MCP Server**: Utilize local Blender instance via Blender MCP to programmatically generate, inspect, modify, and optimize 3D car models, wing components, and export GLTF/GLB binary assets directly into the web engine.
  - **Godot Engine & Unity Integration**: Explore WebGL/WebAssembly exports or standalone desktop builds for ultra-high-fidelity physics, ray-traced reflections, and cinematic replays.
- **Deep-Dive 3D Tech Stack Upgrades (Web & Native)**:
  - **Three.js WebGPU Renderer**: Migrate from WebGL to Three.js WebGPU / TSL (Three.js Shading Language) for compute shaders, realistic particle physics (wet tire spray, tire smoke, sparks), and real-time screen-space reflections (SSR).
  - **Photorealistic 3D Car Meshes & PBR Materials**:
    - Multi-part modular 2026 chassis with authentic floor venturi tunnels, active DRS wing flap animation, rotating wheels, glowing brake rotors, and Pirelli tire sidewall textures.
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

---

## Completed Ideas & Features

Completed items are moved here as they are deployed and verified:

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
