# Repository File Manifest — Formula 1 Project

Last updated: 2026-08-27

This manifest tracks the repository directory tree, active source modules, documentation assets, and archives.

---

## 1. Master Documentation & Governance (`.master/` & Root Rules)

| File / Folder | Purpose | Status |
| :--- | :--- | :--- |
| [`AGENTS.md`](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/AGENTS.md) | Universal root-level agent rule enforcing SOP across sessions | Active |
| [`.agents/rules/sop_protocol.md`](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/.agents/rules/sop_protocol.md) | Persistent workspace agent rule for response format & logs | Active |
| [`.master/SOP.md`](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/.master/SOP.md) | Standard Operating Procedures protocol for all operations | Active |
| [`.master/MasterChangeLog.md`](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/.master/MasterChangeLog.md) | Authoritative changelog across all builds and revisions | Active |
| [`.master/TroubleshootingLog.md`](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/.master/TroubleshootingLog.md) | Bug fixes, root cause diagnostics, and usage counters | Active |
| [`.master/IdeasLog.md`](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/.master/IdeasLog.md) | Roadmap for 3D realism, GPS circuits, audio, OpenF1 telemetry | Active |
| [`.master/FileManifest.md`](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/.master/FileManifest.md) | Complete file directory manifest | Active |
| [`.master/scripts/validate_sop.js`](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/.master/scripts/validate_sop.js) | Automated validation script verifying SOP compliance | Active |
| [`.master/documents/implementation_plan_2026_overhaul.md`](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/.master/documents/implementation_plan_2026_overhaul.md) | Technical implementation plan for 2026 grid & UI overhaul | Active |
| [`.master/documents/walkthrough_2026_overhaul.md`](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/.master/documents/walkthrough_2026_overhaul.md) | Walkthrough and verification notes for 2026 UI overhaul | Active |
| [`.master/documents/implementation_plan_live_telemetry_news.md`](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/.master/documents/implementation_plan_live_telemetry_news.md) | Technical plan for OpenF1 live telemetry & news integration | Active |
| [`.master/documents/walkthrough_live_telemetry_news.md`](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/.master/documents/walkthrough_live_telemetry_news.md) | Walkthrough for OpenF1 live telemetry & paddock news | Active |
| [`.master/documents/workflow_run.md`](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/.master/documents/workflow_run.md) | End-to-end execution workflow for /run pipeline | Active |
| [`.agents/skills/run/SKILL.md`](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/.agents/skills/run/SKILL.md) | Antigravity custom skill for /run command | Active |
| [`.master/archive/`](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/.master/archive/) | Archive storage for superseded plans and previous notes | Active |

---

## 2. Application Source Code (`src/`)

### 2.1 Entry & Shell

| File | Purpose | Status |
| :--- | :--- | :--- |
| [`src/main.tsx`](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/main.tsx) | React root mounting with Barlow & Inter typography fonts | Active |
| [`src/App.tsx`](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/App.tsx) | Top-level application shell, active view switcher, toasts | Active |
| [`src/styles.css`](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/styles.css) | Bespoke motorsport design system, telemetry styling, carbon cards | Active |
| [`src/types.ts`](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/types.ts) | TypeScript interfaces for simulation telemetry, drivers, commands | Active |

### 2.2 Views (`src/views/`)

| File | Purpose | Status |
| :--- | :--- | :--- |
| [`src/views/RaceDashboard.tsx`](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/views/RaceDashboard.tsx) | 3-Column live race center workspace | Active |
| [`src/views/StrategyWorkspace.tsx`](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/views/StrategyWorkspace.tsx) | Pit window calculator, scenario cards (Plan A/B/C), delta chart | Active |
| [`src/views/CarLab.tsx`](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/views/CarLab.tsx) | 3-Column performance engineering setup lab and 3D showroom | Active |
| [`src/views/SteeringWheelLab.tsx`](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/views/SteeringWheelLab.tsx) | Interactive 3D F1 steering wheel lab, camera presets & telemetry sync | Active |
| [`src/views/HQDashboard.tsx`](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/views/HQDashboard.tsx) | Factory R&D pipeline, ATR allocation, paddock news feed | Active |
| [`src/views/LiveTelemetryExplorer.tsx`](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/views/LiveTelemetryExplorer.tsx) | OpenF1 live race telemetry analyzer & driver comparison | Active |

### 2.3 Components (`src/components/`)

| File | Purpose | Status |
| :--- | :--- | :--- |
| [`src/components/AppHeader.tsx`](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/components/AppHeader.tsx) | Top navigation header with view tabs, 2026 branding | Active |
| [`src/components/SteeringWheel3D.tsx`](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/components/SteeringWheel3D.tsx) | Interactive Three.js 3D steering wheel canvas with raycasting & holographic tooltips | Active |
| [`src/components/RaceStatusBar.tsx`](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/components/RaceStatusBar.tsx) | Race status bar, lap counter, session clock, playback deck | Active |
| [`src/components/TimingTower.tsx`](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/components/TimingTower.tsx) | F1 TV live timing tower leaderboard, tire badges, and collapsible rail | Active |
| [`src/components/DriverTelemetryPanel.tsx`](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/components/DriverTelemetryPanel.tsx) | Cockpit gauges, 4-corner tire thermal matrix, on-demand command dock modal, and team radio audio player | Active |
| [`src/components/StrategyHorizon.tsx`](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/components/StrategyHorizon.tsx) | Predictive race model chart, stint delta comparison, and collapsible drawer | Active |
| [`src/components/TrackMap.tsx`](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/components/TrackMap.tsx) | Authentic 18-corner Silverstone Grand Prix map, Doppler radar layer, and 3D viewport | Active |
| [`src/components/RaceScene3D.tsx`](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/components/RaceScene3D.tsx) | High-performance Three.js 3D race scene with authentic Silverstone spline, start gantry, and collision-free scenery | Active |
| [`src/components/CircuitMapPreview.tsx`](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/components/CircuitMapPreview.tsx) | Interactive 2D SVG track layout preview with DRS zones & corner tooltips | Active |
| [`src/components/DopplerRadarOverlay.tsx`](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/components/DopplerRadarOverlay.tsx) | Circular Doppler radar sweep, dBZ reflectivity scale & rain heatmap | Active |
| [`src/components/PaddockNewsWidget.tsx`](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/components/PaddockNewsWidget.tsx) | Paddock news feed widget with category filters, bookmarks, and storage | Active |
| [`src/components/CarShowroom3D.tsx`](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/components/CarShowroom3D.tsx) | Interactive 3D engineering showroom and wind tunnel particles | Active |
| [`src/components/OnboardingOverlay.tsx`](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/components/OnboardingOverlay.tsx) | Modal guide explaining race controls, telemetry, and strategy | Active |

### 2.4 Services & Physics Engine (`src/services/`, `src/data/`, `src/engine/`, `src/hooks/`, `src/graphics/`, `src/utils/`)

| File | Purpose | Status |
| :--- | :--- | :--- |
| [`src/graphics/steering_wheel/steeringWheelData.ts`](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/graphics/steering_wheel/steeringWheelData.ts) | Registry of 28+ steering wheel controls, FIA rules, metadata, and sound mappings | Active |
| [`src/graphics/steering_wheel/F1SteeringWheelModel.ts`](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/graphics/steering_wheel/F1SteeringWheelModel.ts) | Procedural 3D F1 steering wheel model, dynamic LCD canvas, shift LEDs, and spring animations | Active |
| [`src/utils/wheelAudioSynthesizer.ts`](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/utils/wheelAudioSynthesizer.ts) | Web Audio synthesizer for tactile switch clicks, rotary detents, and paddle shifts | Active |
| [`src/data/circuitData.ts`](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/data/circuitData.ts) | 2D SVG track geometry, DRS paths, and turn metadata for all 24 GP rounds | Active |
| [`src/services/soundEngine.ts`](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/services/soundEngine.ts) | Procedural V6 Turbo-Hybrid ICE harmonics, turbo spool, and skid sound engine | Active |
| [`src/services/radioAudioService.ts`](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/services/radioAudioService.ts) | Neural & Natural Voice Synthesis Engine, driver/engineer personas, PTT Roger beeps, and VHF squelch DSP | Active |
| [`src/services/openf1Service.ts`](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/services/openf1Service.ts) | OpenF1 API client for meetings, drivers, telemetry & authentic team radio | Active |
| [`src/services/f1NewsService.ts`](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/services/f1NewsService.ts) | Paddock news data provider with categorized feeds | Active |
| [`src/data/drivers.ts`](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/data/drivers.ts) | 2026 driver grid (20 drivers), teams, liveries, and standings | Active |
| [`src/engine/physics/AeroEngine.ts`](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/engine/physics/AeroEngine.ts) | Aerodynamic downforce, drag, and ground-effect porpoising math | Active |
| [`src/engine/physics/PowertrainEngine.ts`](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/engine/physics/PowertrainEngine.ts) | ERS harvest/deployment, fuel consumption, engine wear | Active |
| [`src/engine/physics/TireThermodynamics.ts`](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/engine/physics/TireThermodynamics.ts) | Two-layer tire surface vs core temperature & degradation | Active |
| [`src/engine/workers/PhysicsWorker.ts`](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/engine/workers/PhysicsWorker.ts) | 100 Hz simulation loop with 10 Hz telemetry snapshots & pit timer | Active |
| [`src/hooks/useRaceSimulation.ts`](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/hooks/useRaceSimulation.ts) | Web Worker lifecycle hook and command dispatch | Active |
| [`src/graphics/f1_2026/carPartsData.ts`](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/graphics/f1_2026/carPartsData.ts) | 30+ 2026 F1 modular CAD components database, dimensions, materials, FIA articles | Active |
| [`src/graphics/f1_2026/F1Car2026Model.ts`](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/graphics/f1_2026/F1Car2026Model.ts) | Procedural 2026 F1 3D model builder with Active Aero, exploded view & raycasting | Active |
| [`src/graphics/createF1Car.ts`](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/graphics/createF1Car.ts) | Procedural 3D car mesh generator for custom team liveries | Active |
| [`src/graphics/createPitCrew.ts`](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/graphics/createPitCrew.ts) | Low-poly 3D animated pit crew mechanics, tyre gunners, jacks & lollipop | Active |
| [`src/utils/format.ts`](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/utils/format.ts) | Formatting helpers for lap times, race clocks, gaps, and currency | Active |

---

## 3. Configuration & Deployment

| File | Purpose | Status |
| :--- | :--- | :--- |
| [`.github/workflows/deploy.yml`](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/.github/workflows/deploy.yml) | GitHub Actions workflow deploying production bundle to GitHub Pages | Active |
| [`package.json`](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/package.json) | NPM scripts, dependencies (React, Three.js, Lucide) | Active |
| [`vite.config.ts`](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/vite.config.ts) | Vite bundler config with `/docs` output directory | Active |
| [`tsconfig.json`](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/tsconfig.json) | TypeScript root configuration | Active |
| [`eslint.config.js`](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/eslint.config.js) | ESLint configuration | Active |
| [`docs/`](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/docs/) | Production build distribution directory for GitHub Pages | Active |
