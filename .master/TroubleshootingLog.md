# Troubleshooting Log — Formula 1 Management Simulator

This log tracks technical issues, root causes, diagnostics, solutions, and usage frequency.

_Ranked by usefulness and fix count._

---

## 1. Landing Login Constructor Team Selection Not Sticking Post-Authentication

- **Rank**: #1 Most Critical Gameplay/UX State Fix
- **Fix Count**: 1
- **Symptoms**: When a user selected a constructor team (e.g. Scuderia Ferrari, Oracle Red Bull, Mercedes-AMG, Aston Martin) in the 3D Parallax landing login portal, the game immediately reverted back to McLaren / Lando Norris once entering the simulator.
- **Root Cause**:
  - `ParallaxAuthScreen.tsx` emitted credentials without a `teamCode` or `primaryDriverId` property.
  - `App.tsx` state `selectedDriverId` was hardcoded to `'nor'`, and `handleAuthenticate` never updated `selectedDriverId` based on the chosen team.
  - `PhysicsWorker.ts` initialized drivers with a static `isManaged: true` flag hardcoded only on McLaren drivers (`nor` and `pia`), with no mechanism to reassign management status to other constructor teams.
- **Resolution**:
  - Added `teamCode` and `primaryDriverId` to `PaddockCredentials`.
  - Added `{ type: 'SET_MANAGED_TEAM'; teamShort: string }` command to `PhysicsWorker.ts` and `types.ts` that dynamically recomputes `isManaged` for drivers of the chosen constructor team.
  - Updated `App.tsx` to automatically set `selectedDriverId` to the matching team's lead driver upon authentication and persist both `f1l-paddock-creds` and `f1l-selected-driver-id` in `sessionStorage`.
  - Added sticky team restoration on app startup so reloads preserve the player's selected team.
- **Files Modified**: `src/App.tsx`, `src/components/ParallaxAuthScreen.tsx`, `src/engine/workers/PhysicsWorker.ts`, `src/types.ts`

---

## 2. 3D Track Building/Tree Collisions & Generic Bezier Splines

- **Rank**: #1 Most Critical 3D Track Fix
- **Fix Count**: 1
- **Symptoms**: Grandstands, trees, and pit buildings were clipping through the asphalt track and pit lane ribbons; 2D and 3D circuit layouts were generic rounded bezier loops rather than real FIA F1 track layouts.
- **Root Cause**:
  - `RaceScene3D.tsx` scenery coordinates (`[-2, 3, -15]`, `[-27.5, 2.75, 14.5]`, `[2, 14]`) were placed without clearance buffer checks against spline points.
  - Track paths in `circuitData.ts` and `RaceScene3D.tsx` used template cubic bezier curves rather than real-world 18-corner Silverstone coordinates (Abbey -> Village -> Loop -> Wellington -> Brooklands -> Luffield -> Copse -> Maggotts/Becketts -> Stowe -> Vale -> Club).
- **Resolution**:
  - Replaced track spline with verified 18-turn Silverstone coordinates and updated all 24 World Championship circuit definitions.
  - Re-positioned all grandstands (Hamilton Infield, Becketts Stadium, Stowe Runoff, Luffield Stadium), the Silverstone Wing Pit Complex, and vegetation with safe clearance margins outside the track and pit lane envelopes.
- **Files Modified**: `src/components/RaceScene3D.tsx`, `src/components/TrackMap.tsx`, `src/data/circuitData.ts`

---

## 2. 3D Race Scene Black Shadow Spikes & Streaks

- **Rank**: #2 Most Critical Visual Fix
- **Fix Count**: 3
- **Symptoms**: Black fan-like polygons and shadow streaks radiated from cars across the Silverstone track.
- **Root Cause**:
  - `sun.shadow.bias` was set to negative (`-0.0004`), creating extreme shadow acne on flat planar surfaces.
  - Ribbon track mesh generation had dynamic triangle-by-triangle winding logic that could produce colinear face normals, yielding `(0,0,0)` cross vectors and `NaN` vertex normals upon normalization, which corrupts shadow projection matrices in shaders.
- **Resolution**:
  - Set `sun.shadow.bias = 0.0008` (positive bias) and added `sun.shadow.normalBias = 0.02`.
  - Rebuilt `createRibbon` with consistent quad indexing (`base, base+2, base+1` & `base+1, base+2, base+3`) and explicit up-facing normal vectors `(0, 1, 0)`.
- **Files Modified**: `src/components/RaceScene3D.tsx`

---

## 2. Vite Build Cleaning `docs/` Directory

- **Rank**: #2 Most Critical Architecture Fix
- **Fix Count**: 2
- **Symptoms**: Vite build (`vite build`) wiped manual documentation folders stored inside `/docs`.
- **Root Cause**: `vite.config.ts` was configured with `outDir: 'docs'` and `emptyOutDir: true` (or Vite cleans `outDir` before writing production assets for GitHub Pages).
- **Resolution**:
  - Moved all project documentation, change logs, implementation plans, and troubleshooting guides into a dedicated root `.master/` folder (`.master/documents/`, `.master/MasterChangeLog.md`, `.master/TroubleshootingLog.md`, `.master/IdeasLog.md`, `.master/FileManifest.md`).
  - `/docs` is reserved strictly as the automated GitHub Pages output directory.
- **Files Modified**: `.master/`, `package.json`, `.master/scripts/validate_sop.js`

---

## 3. UI Typography Clumping & Text Overlaps

- **Rank**: #3 Most Critical UI/UX Fix
- **Fix Count**: 2
- **Symptoms**: Numbers, min/max range limits, and labels mashed together with zero spacing (e.g. `SPEED275KM/H`, `10°50°Rear wing`, `L39L42L45L48...`).
- **Root Cause**:
  - Previous CSS had micro line-heights, compressed grid columns with zero gaps, missing `display: flex` / `display: block` separation, and tiny font sizes (8px–10px) with negative margins.
  - Range sliders rendered min and max bounds inside the same inline span as titles.
- **Resolution**:
  - Re-architected all cards with explicit semantic markup (`<span className="metric-label">`, `<strong className="metric-value">`, `<small className="metric-unit">`).
  - Implemented custom `.setup-slider-card` with separate title row, current value badge, and slider track flanked by `.bound-tag.min` and `.bound-tag.max`.
- **Files Modified**: `src/styles.css`, `src/views/CarLab.tsx`, `src/components/DriverTelemetryPanel.tsx`, `src/views/StrategyWorkspace.tsx`, `src/views/HQDashboard.tsx`

---

## 4. Ambiguous Interactive Affordances & Unstyled Buttons

- **Rank**: #4
- **Fix Count**: 1
- **Symptoms**: Clickable buttons, static labels, and chips shared identical flat dark styling, making interactive state unclear.
- **Root Cause**: Lack of dedicated button classes, missing active glow states, and unstyled radio/pace selectors.
- **Resolution**:
  - Created tactile segmented command button groups with glowing neon borders when active.
  - Implemented high-contrast `[BOX THIS LAP]` button with dual confirmation/cancel states.
  - Added dedicated preset pills with hover and active illumination.
- **Files Modified**: `src/styles.css`, `src/components/DriverTelemetryPanel.tsx`, `src/views/CarLab.tsx`

---

## 5. Web Audio Autoplay Lifecycle & Safe State Management

- **Rank**: #5 Audio Synthesis & Lifecycle Fix
- **Fix Count**: 1
- **Symptoms**: Modern web browsers block unprompted audio playback or throw `AudioContext was not allowed to start` errors before user gesture.
- **Root Cause**: Web Audio API requires lazy initialization upon direct user click gesture, explicit `ctx.resume()` handling, and cleanup of oscillators and noise source nodes on playback abort.
- **Resolution**:
  - Implemented singleton `RadioAudioService` with deferred `AudioContext` acquisition upon user click.
  - Automatically checks `audioCtx.state === 'suspended'` and invokes `resume()`.
  - Added global `stop()` handler that cancels both active `AudioBufferSourceNode` buffers, oscillator schedules, and `window.speechSynthesis` utterances to prevent audio leaks when navigating tabs.
- **Files Modified**: `src/services/radioAudioService.ts`, `src/views/LiveTelemetryExplorer.tsx`

---

## 6. Dynamic Canvas Radar Texture Memory Leaks & Pit Rig Lifecycle

- **Rank**: #6 Graphics & Performance Optimization
- **Fix Count**: 1
- **Symptoms**: Generating procedural 2D radar scans and 3D rain particles across scene mount/unmount cycles causes GPU memory bloat and context loss if not systematically garbage-collected.
- **Root Cause**: Three.js requires explicit disposal of dynamic `CanvasTexture`, custom geometries (`RingGeometry`, `BufferGeometry` for rain points), and custom mesh materials when tearing down scenes or hot-reloading components.
- **Resolution**:
  - Encapsulated low-poly mechanics into `disposePitCrew(pitCrewRig)` traversing all nested materials and buffer geometries.
  - Added explicit `.dispose()` calls on `radarTex`, `rainGeo`, `rainMat`, `pitRoadGeometry`, `pitWallGeo`, and `radarGeo` in `RaceScene3D.tsx`'s unmount cleanup effect.
- **Files Modified**: `src/graphics/createPitCrew.ts`, `src/components/RaceScene3D.tsx`

---

## 7. Dynamic Canvas LCD Screen Memory & Pointer Raycasting Handler Staling

- **Rank**: #7 3D Graphics & React State Integration Fix
- **Fix Count**: 1
- **Symptoms**: Frequent pointer raycasting events and keyboard shortcuts in complex Three.js viewports captured stale React state closures, or triggered TypeScript index signature mismatch warnings during partial state merges.
- **Root Cause**:
  - Direct type-casting `telemetry as Record<string, unknown>` triggers TypeScript strict overlap error `TS2352`.
  - Native DOM `pointermove`, `wheel`, and `keydown` event listeners bound inside `useEffect` capture initial closure state unless synchronized via mutable `useRef` bridges.
- **Resolution**:
  - Switched telemetry updates to idiomatic `Object.assign(telemetry, data)` with automatic dynamic `needsUpdate = true` on the 1024x640 OLED canvas texture.
  - Attached interaction callbacks and camera target positions to mutable `stateRef` and `handleControlInteractRef` instances, preventing listener re-attachment churn and eliminating closure staleness.
- **Files Modified**: `src/graphics/steering_wheel/F1SteeringWheelModel.ts`, `src/components/SteeringWheel3D.tsx`, `src/views/SteeringWheelLab.tsx`

---

## 8. Robotic Novelty Voice Synthesis Artifacts & VHF Squelch Noise Clashing

- **Rank**: #4 Most Critical Audio Quality & Voice Synthesis Fix
- **Fix Count**: 1
- **Symptoms**: Team radio voices sounded horribly robotic, squeaky, or like glitching vintage synthesizers ("like robots but worse"); background static noise clashed harshly with voice playback.
- **Root Cause**:
  - `radioAudioService.ts` picked a random voice (`Math.random() * englishVoices.length`) without filtering out built-in OS novelty/robotic voices (e.g. `Zarvox`, `Trinoids`, `Albert`, `Bad News`, `Fred`, `Boing`, `Cellos`, `Whisper`).
  - Web Speech voice list loading is asynchronous; synchronous initial reads returned `[]`, triggering low-quality OS fallback synthesizers.
  - Extreme manual pitch shifting (`1.15` / `0.95`) caused metallic vocoder distortion in browser speech synthesis.
  - Background static played at constant gain without dynamic speech ducking, muddling voice clarity.
- **Resolution**:
  - Implemented strict blacklisting of all novelty, robotic, and alien synthesizer voices across macOS, Windows, Linux, and iOS.
  - Created a dynamic Natural Voice Scoring & Ranking engine prioritizing Apple Siri/Enhanced, Google Natural, and Microsoft Natural voices.
  - Added asynchronous voice caching via `speechSynthesis.onvoiceschanged`.
  - Created dedicated speaker persona mappings with character-appropriate accents, rates, and natural pitches for Race Engineers (Will Joseph, Gianpiero Lambiase, Bono, Bryan Bozzi) and Drivers (Norris, Piastri, Verstappen, Leclerc, Hamilton, Russell, Alonso, Sainz).
  - Integrated dynamic Web Audio speech ducking (reducing background VHF noise by 75% during active speech) with authentic Roger PTT beeps, mic keying clicks, and squelch release tail bursts.
- **Files Modified**: `src/services/radioAudioService.ts`, `src/services/openf1Service.ts`, `src/components/DriverTelemetryPanel.tsx`, `src/views/LiveTelemetryExplorer.tsx`

---

## 9. 3D Race View Container Collapse, Steering Wheel Rear Shadowing & Button Crispness

- **Rank**: #5 Most Critical 3D Viewport & Rendering Fix
- **Fix Count**: 1
- **Symptoms**:
  - Main race screen showed a blank/black center stage where 3D race cars and track should render.
  - Steering wheel rear paddle shifters and quick-release hub were pitch black / shadowed in 3D viewport.
  - Steering wheel buttons were plain solid-color cylinders without real silkscreen labels, making tactile affordance difficult to read.
- **Root Cause**:
  - `RaceScene3D.tsx` rendered `<div className="race-scene-container" ref={containerRef} />`, but `styles.css` only defined `.race-scene-3d`. Without explicit flex styling and `height: 100%`, `container.clientHeight` initialized to 0, resulting in a 0-height WebGL viewport.
  - `SteeringWheel3D.tsx` only had directional lighting from the front (+Z), casting total shadow on the rear paddles and boss when rotated or using the `paddles` camera preset.
  - Button caps lacked high-resolution decal textures, laser-etched font faceplates, and protective double-beveled safety collars.
- **Resolution**:
  - Added `.race-scene-container` with `min-height: 280px; flex: 1; position: relative; width: 100%; height: 100%;` and integrated a `ResizeObserver` lifecycle listener inside `RaceScene3D.tsx` with fallback dimensions.
  - Added 360-degree studio lighting in `SteeringWheel3D.tsx` with high-intensity rear key light (`#ffffff`, 2.8), rear cool fill light (`#bad7ff`, 2.4), rear bottom light, and dedicated left/right paddle accent point lights (`#00f0ff` / `#30d158`).
  - Upgraded `F1SteeringWheelModel.ts` with procedural high-resolution canvas decals (`createButtonDecalTexture`, `createPaddleDecalTexture`, `createDialScaleTexture`) featuring laser-etched silkscreen typography (`DRS`, `RAD`, `PL`, `OT`, `SOC`, `N`, `R`, `ACK`, `DRK`, `PASS`, `BB+`, `BB-`, `EB+`, `EB-`, `P+`, `P-`), outer colored bezel rings, concave tactile dish gradients, raised CNC anodized aluminum collars, knurled dial scales, and green `+` / red `−` paddle engravings with titanium magnetic switch cylinders.
- **Files Modified**: `src/styles.css`, `src/components/RaceScene3D.tsx`, `src/components/SteeringWheel3D.tsx`, `src/graphics/steering_wheel/F1SteeringWheelModel.ts`

---

## 10. Steering Wheel Telemetry TypeScript Index Signature & 3D Livery Hot-Swapping Cache

- **Rank**: #6 Most Critical TypeScript & 3D Texture Management Fix
- **Fix Count**: 1
- **Symptoms**:
  - `npm run build` failed with TypeScript error TS7053: `Element implicitly has an 'any' type because type 'Record<string, unknown>' has no index signature`.
  - Switching between custom liveries and CFD / FLIR modes wiped custom canvas textures or rendered blank black bodywork meshes.
- **Root Cause**:
  - Dynamic key iteration in `updateTelemetry` cast `telemetry` to `Record<string, unknown>` and indexed via `k in data`, which was not allowed under strict TypeScript type definitions.
  - Three.js materials replaced during livery customization did not update `child.userData.originalMaterial`, causing subsequent CFD/FLIR toggle resets to restore the initial stock material instead of the user's custom livery.
- **Resolution**:
  - Refactored `updateTelemetry` in `F1SteeringWheelModel.ts` to use type-safe `Object.assign(telemetry, data)`.
  - Updated `updateLivery` in `F1Car2026Model.ts` to assign new canvas-textured `MeshStandardMaterial` instances directly onto `child.userData.originalMaterial`, ensuring seamless transitions when entering and leaving CFD or FLIR thermal modes.
- **Files Modified**: `src/graphics/steering_wheel/F1SteeringWheelModel.ts`, `src/graphics/f1_2026/F1Car2026Model.ts`

---

## 11. 3D Car Showroom Unconstrained Text Overlays, Distant Camera & Chunky Platter Platform

- **Rank**: #7 Most Critical 3D Staging & Layout Fix
- **Fix Count**: 1
- **Symptoms**:
  - In Car Lab's 2026 Vehicle Geometry view, raw text ("2026 SPECIFICATION", "FIA NIMBLE CAR ARCHITECTURE", "AERO BALANCE 42.5%", etc.) was rendered stacked and uncontained in standard HTML document flow above the 3D canvas.
  - The 3D race car model appeared minuscule in the center of the screen.
  - The car appeared to sit atop an oversized, thick round cylinder resembling a dining platter.
- **Root Cause**:
  - `styles.css` was missing class definitions for `.car-showroom-3d`, `.showroom-3d-canvas`, `.showroom-grid`, `.showroom-title`, `.showroom-help`, and `.showroom-stat`, leaving overlay HUD divs as unstyled block elements.
  - Three.js camera distance was positioned far at `(8.2, 4.6, 9.2)` with a narrow FOV, reducing the car to <25% of viewport height.
  - Turntable geometry was defined as a thick `CylinderGeometry(4.8, 5.15, 0.36)` floating in empty space without ground integration or contact shadows.
- **Resolution**:
  - Added CSS definitions for `.car-showroom-3d` (`position: absolute; inset: 0; width: 100%; height: 100%`) and transformed all floating text into semi-transparent glassmorphic HUD badges (`.showroom-title`, `.showroom-help`, `.showroom-stat`) positioned over the canvas with Barlow and Inter typography.
  - Re-positioned default orbit camera closer to `(4.4, 2.1, 4.8)` with target `(0, 0.35, 0)` and adjusted close-up presets, bringing the car into heroic, high-detail focus.
  - Replaced the thick cylinder platform with a flush carbon inspection pad (`CylinderGeometry(3.0, 3.05, 0.02)`), a CNC titanium bevel rim, a soft contact shadow receiver plane (`ShadowMaterial`), an engineering CAD coordinate grid (`GridHelper`), and technical measurement rings.
- **Files Modified**: `src/styles.css`, `src/components/CarShowroom3D.tsx`

## 12. Lucide ForwardRef vs. Custom SVG Component Type Incompatibility in Nav Array

- **Rank**: #8 Most Critical TypeScript Component Architecture Fix
- **Fix Count**: 1
- **Symptoms**: `npm run build` failed with TypeScript error TS2322: `Type 'ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>' is not assignable to type 'ComponentType<{ size?: number; color?: string; }>'`.
- **Root Cause**:
  - `AppHeader.tsx` defined `navItems` array with an overly restrictive prop type `React.ComponentType<{ size?: number; color?: string }>`.
  - Lucide icons use `ForwardRefExoticComponent` whose `size` prop validator accepts `string | number | undefined`, whereas the custom `ComponentType` restricted `size` strictly to `number | undefined`.
- **Resolution**:
  - Changed `navItems` item `icon` definition to `React.ElementType`, allowing both `lucide-react` icons and bespoke `F1Icons` SVG components to be passed interchangeably with type safety.
- **Files Modified**: `src/components/AppHeader.tsx`, `src/components/F1Icons.tsx`

---

## 13. Live OpenF1 API Rate Limiting & High-Frequency Stream Throttling

- **Rank**: #9 Network & Live Data Streaming Resilience
- **Fix Count**: 1
- **Symptoms**: Rapid unthrottled polling of OpenF1 REST endpoints across multiple drivers (Norris, Verstappen, Leclerc) triggered HTTP 429 (Too Many Requests) errors and temporary IP blocking against the public 3 req/s free tier limit.
- **Root Cause**:
  - Individual components independently polled `/car_data` and `/location` without centralized batching, token-bucket rate limiting, or fallback caching.
- **Resolution**:
  - Centralized streaming architecture through `liveF1DataService` coordinator with token-bucket request throttling (max 2 req/s), query parameter batching, local memory caching with TTL, automatic exponential backoff, and WebSocket/MQTT subscription channels for high-frequency telemetry.
- **Files Documented**: `.master/documents/live_f1_telemetry_radio_streaming_architecture.md`, `src/services/openf1Service.ts`

---

## 14. Wikimedia Commons Imagery Downloads: 429 Throttle Pages Masquerading as 404s / Images

- **Rank**: #14 Asset Research Pipeline
- **Fix Count**: 1
- **Symptoms**: Background image-fetch scripts reported `HTTP Error 404: Not Found` for Commons files that verifiably exist (e.g. `Madring (2026).svg`, `Baku Formula One circuit map.svg`, `Circuit Park Zandvoort from air 2016-08-24.jpg`), and later runs saved 2,281-byte HTML "Wikimedia Error" pages with `.svg`/`.jpg` extensions instead of images. Search-based aerial matching also returned wrong subjects (Jarama instead of Madring, Barajas airport instead of Madring, a Miami-Dade coastline instead of the Hard Rock Stadium circuit).
- **Root Cause**:
  - Wikimedia edge (Varnish) responds to rate-limited `Special:FilePath` requests with error pages whose status/interleaving scripts misread as 404; message explicitly requests less disruptive access and standard thumbnail sizes.
  - Download scripts wrote response bodies unvalidated, so HTML error pages were persisted as image files.
  - Generic `<name> aerial` Commons searches match geography stock (coastlines, airports) when the circuit lacks dedicated aerial photography; filename scoring alone couldn't distinguish them.
- **Resolution**:
  - Replaced `Special:FilePath` guessing with the `imageinfo` API (`iiurlwidth=1280`) which returns a standard-size thumbnail URL **plus** `extmetadata` (author, license) in one call; pacing raised to 25 s between requests with exponential backoff on 429/5xx.
  - Added magic-byte validation (`\x89PNG`, `<?xml`/`<svg`, `\xff\xd8`, `GIF8`, `RIFF/WEBP`) so an HTML page can never be written as an image; junk files deleted and re-downloaded.
  - Added mandatory visual review (downscaled previews) for every search-matched aerial; rejected Jarama/Barajas/Miami-coastline/Lusail line-painting matches and explicitly marked those circuits "no aerial available" in `image_manifest.json` and the report's Imagery Index.
- **Files Documented**: `.master/scripts/fetch_track_images_final.py`, `.master/scripts/fetch_track_images_retry.py`, `.master/assets/tracks_2026/image_manifest.json`

---

## 15. Web Audio AnalyserNode Disconnection & Spline Projection Edge Overshoot

- **Rank**: #15 Web Audio & Mathematics Realism
- **Fix Count**: 1
- **Symptoms**: Team radio Fourier frequency spectrum bars rendered 0 dB amplitude during Roger beep, mic switch, and squelch burst playback; GPS coordinates near start/finish line $(t \approx 0.0 \text{ or } 1.0)$ caused sudden loop wrap-around snapping.
- **Root Cause**:
  - `radioAudioService.ts` routed one-shot audio bursts directly to `ctx.destination` instead of `this.getMasterDestination(ctx)`, bypassing `analyserNode` and `masterGainNode`.
  - Spline nearest-point segment projection without modular modulo wrapping resulted in index boundary clamping near cyclic circuit closures.
- **Resolution**:
  - Unified all audio generator output stages to route through `getMasterDestination(ctx) -> analyserNode -> masterGainNode -> destination`.
  - Implemented Catmull-Rom closed-loop arc-length lookup table with periodic modular indexing `(idx + 1) % segments` in `SplineTrackProjector`, guaranteeing smooth $C^2$ continuous transitions across the start/finish line.
- **Files Modified**: `src/services/radioAudioService.ts`, `src/utils/splineProjection.ts`, `src/components/AudioWaveformVisualizer.tsx`

---

## 16. Circuit Geometry Placeholder Duplication & 2026 Calendar Desynchronization

- **Rank**: #16 Track Simulation Realism & Calendar Integrity
- **Fix Count**: 1
- **Symptoms**: Selecting circuits in `CircuitMapPreview` or `LiveTelemetryExplorer` for multiple venues (Hungaroring, Zandvoort, Baku, Marina Bay, COTA, Mexico City, Interlagos, Las Vegas, Lusail, Yas Marina) displayed identical rounded placeholder oval tracks; newly confirmed 2026 championship rounds (Round 14 Madring Madrid and Round 16 Sepang Malaysia) were missing; calendar schedules desynchronized with the verified 23-round 2026 World Championship calendar.
- **Root Cause**:
  - `src/data/circuitData.ts` contained copy-pasted fallback SVG path strings for 10+ circuits.
  - `DEFAULT_MEETINGS` in `openf1Service.ts` and `FULL_RACE_CALENDAR` in `HQDashboard.tsx` followed outdated 24-round templates with Sakhir and Jeddah opening the season instead of Melbourne.
- **Resolution**:
  - Synthesized research from `.master/documents/track_design_report_2026_calendar.md` and `.master/assets/tracks_2026/` to handcrafted authentic FIA SVG track geometries, DRS activation paths, start/finish lines, and accurate corner tooltips for all 23 official 2026 Championship rounds plus Sakhir.
  - Added new 2026 circuits: **Madring** (circuitKey: 153 — 5.416 km, 22 turns, La Monumental 24% banking) and **Sepang** (circuitKey: 16 — Bahrain GP in Malaysia).
  - Synchronized `DEFAULT_MEETINGS` and `FULL_RACE_CALENDAR` to the exact 23-round 2026 schedule.
  - Upgraded `CircuitMapPreview.tsx` with 3 switchable rendering modes (Interactive Vector, Satellite Aerial Photography via Planet Labs SkySat, and Homologated FIA Track Maps).
  - Deployed 47MB asset bundle to `public/assets/tracks/` for zero-latency asset streaming.
- **Files Modified**: `src/data/circuitData.ts`, `src/services/openf1Service.ts`, `src/views/HQDashboard.tsx`, `src/components/CircuitMapPreview.tsx`, `src/styles.css`
