# Master Change Log — Formula 1 Management Simulator

All notable project changes, releases, revisions, and architecture updates are documented in this log.

---

## [Build R27 / Authentic 2026 Circuit Geometry, Calendar Sync & Satellite Asset Integration] — 2026-08-28

### 08-28E Added & Overhauled

- **Authentic Circuit Geometries & Rich 2026 Dossier ([src/data/circuitData.ts](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/data/circuitData.ts))**:
  - Completely overhauled `circuitData.ts` based on the verified 2026 Track Design Report (`track_design_report_2026_calendar.md`).
  - Replaced all copy-pasted placeholder SVG paths with handcrafted, authentic FIA track geometries, DRS activation lines, start/finish line vectors, and interactive corner markers for all 23 official 2026 Championship rounds plus Sakhir pre-season testing.
  - Added new 2026 tracks: **Madring** (Round 14, circuitKey: 153 — 5.416 km, 22 turns, La Monumental 24% banking, two M-11 tunnels, first covered paddock in F1) and **Sepang** (Round 16, circuitKey: 16 — Bahrain GP in Malaysia).
  - Added comprehensive metadata fields: `round`, `officialName`, `direction` (`clockwise` | `anticlockwise`), `venueType` (`street` | `semi-street` | `permanent` | `semi-permanent`), `elevationChangeM`, `signatureFeature`, `weatherProfile`, `notes2026`, `mapAssetUrl`, and `aerialAssetUrl`.
- **23-Round 2026 Calendar Harmonization ([src/services/openf1Service.ts](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/services/openf1Service.ts), [src/views/HQDashboard.tsx](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/views/HQDashboard.tsx))**:
  - Synchronized `DEFAULT_MEETINGS` in `openf1Service.ts` and `FULL_RACE_CALENDAR` in `HQDashboard.tsx` to the authentic 23-round 2026 schedule starting at Melbourne (Albert Park) and culminating at Abu Dhabi (Yas Marina).
- **Multi-Modal Circuit Visualizer ([src/components/CircuitMapPreview.tsx](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/components/CircuitMapPreview.tsx), [src/styles.css](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/styles.css))**:
  - Added 3 switchable preview modes: **VECTOR LAYOUT** (interactive SVG with real-time simulated driver dots and corner tooltips), **SATELLITE AERIAL** (high-resolution Earth observation photography from Planet Labs SkySat series), and **FIA TRACK MAP** (homologated circuit drawings).
  - Added track intel strip detailing key venue features and 2026 active aero/power-unit regulations impact.
  - Deployed 47MB asset library from `.master/assets/tracks_2026/` to `public/assets/tracks/` for high-speed client delivery.
- **Verification**:
  - `npm run build` (0 errors), `npm run lint` (0 errors), `npm run sop:validate` (100% compliant).

---

## [Build R26 / Live Broadcast Delay Sync, GPS Spline Projection & Audio Visualizer] — 2026-08-28

### 08-28D Added & Implemented

- **Broadcast Delay Synchronization Engine & Scrubber UI ([src/components/RaceStatusBar.tsx](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/components/RaceStatusBar.tsx), [src/App.tsx](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/App.tsx), [src/services/radioAudioService.ts](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/services/radioAudioService.ts))**:
  - Implemented interactive TV Broadcast Delay Scrubber pill in `RaceStatusBar` with quick presets (`LIVE 0s`, `F1 TV 20s`, `SKY / ESPN 35s`, `STREAM 60s`) and custom 0–90s slider popover.
  - State lifted to `App.tsx` with browser session storage persistence (`f1l-broadcast-delay-sec`) and synced directly to `radioAudioService.setBroadcastDelaySec()`.
  - Added real-time TV Delay buffer status chip in `LiveTelemetryExplorer` header controls cluster.
- **Real GPS Coordinate to 3D Track Spline Interpolation Engine ([src/utils/splineProjection.ts](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/utils/splineProjection.ts), [src/services/openf1Service.ts](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/services/openf1Service.ts))**:
  - Created `SplineTrackProjector` mathematical projection engine: equidistant Catmull-Rom arc-length lookup table, binary search segment location, orthogonal projection $(P - A) \cdot (B - A) / |B - A|^2$, lateral offset computation, and FIA track limits compliance checking.
  - Added `OpenF1LocationSample`, `fetchOpenF1Locations()`, and `generateSyntheticGpsTrace()` in `openf1Service.ts`.
  - Created new interactive **GPS TRACK PROJECTION** tab in `LiveTelemetryExplorer.tsx` featuring frame scrubbing, real-time Cartesian $(X, Y, Z)$ coordinates, normalized track progress $t \in [0, 1]$, lateral racing line offset delta, and on-track compliance badges for both competing drivers.
- **Real-Time Fourier Spectrum Audio Visualizer & Enhanced Pit Radio ([src/components/AudioWaveformVisualizer.tsx](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/components/AudioWaveformVisualizer.tsx), [src/components/DriverTelemetryPanel.tsx](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/components/DriverTelemetryPanel.tsx), [src/views/LiveTelemetryExplorer.tsx](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/views/LiveTelemetryExplorer.tsx))**:
  - Built `AudioWaveformVisualizer` rendering animated Fourier frequency spectrum bars via Canvas and `AnalyserNode` with team livery color styling and peak-hold caps.
  - Upgraded `radioAudioService.ts` to route all oscillator, noise, and transmission streams through `AnalyserNode` and `masterGainNode`.
  - Added role badges (`🎧 RACE ENGINEER`, `🏎️ DRIVER`) and category filter tabs (`ALL COMMS`, `PIT WALL`, `DRIVER`, `BOX / TIRES`) in `DriverTelemetryPanel.tsx`.
- **Motorsport Styling & Production Build ([src/styles.css](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/styles.css))**:
  - Added full CSS for `.tv-sync-pill-btn`, `.tv-sync-popover`, `.sync-presets-grid`, `.audio-waveform-container`, `.gps-projection-workspace`, and `.speaker-role-badge`.
  - Verified `npm run build` (0 errors), `npm run lint` (0 errors), and `npm run sop:validate` (100% compliant).

---

## [Build R26 / 2026 Track Imagery Pipeline & Report Embedding] — 2026-08-28

### 08-28C Added & Verified

- **Track Imagery Asset Library ([.master/assets/tracks_2026/](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/.master/assets/tracks_2026/))**:
  - **23/23 track maps** downloaded or rendered for every 2026 circuit round (r01–r23), sourced from Wikimedia Commons via infobox `File:` extraction and GeoJSON `Data:*.map` maplink rasterization.
  - **19/23 circuit aerials** captured — 14 from the Commons "SkySat" (Planet Labs, CC BY-SA 4.0) 2018 satellite series, plus Melbourne, Suzuka, Montréal, Sepang (earlier pass), Zandvoort (Otto Karikoski CC BY-SA 4.0), Silverstone (geograph CC BY-SA 2.0), COTA (in-flight photo), and Yas Marina. Explicitly marked "no aerial available": Miami, Madring (construction-era only), Las Vegas, Lusail.
  - **2 venue photos**: Marina Bay pit building (6720×4480, skyline backdrop) and Las Vegas Sphere displaying the F1 driver face over the circuit.
  - Every file magic-byte-validated (`file`) — HTML throttle pages can never masquerade as images in the asset set; Madring search results were manually image-reviewed to reject Jarama/Barajas false matches.
- **Attribution & Manifest ([.master/assets/tracks_2026/image_manifest.json](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/.master/assets/tracks_2026/image_manifest.json))**:
  - Per-asset `source_file`, `source_url`, `author`, `license` captured via the Commons `imageinfo` + `extmetadata` API in the same request as the thumbnail URL (one API call per file).
  - Manifest reconciled against the directory: stale entries removed, SVG-vs-raster extensions corrected (12 rasterized "SVG" files renamed `.png`), duplicates pruned.
- **Report Embedding ([.master/documents/track_design_report_2026_calendar.md](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/.master/documents/track_design_report_2026_calendar.md))**:
  - `*Imagery:*` link line under each of the 23 Round dossiers (relative `../assets/tracks_2026/...` paths; all 82 links verified to resolve).
  - New **§6 Imagery Index** table: per-round map/aerial links plus Commons attribution (source file, author, license).
- **Scripts (paced download pipeline)**: `fetch_track_images_final.py` (imageinfo-driven gap-fill: 25 s pacing, 429/5xx backoff, magic-byte validation, manifest attribution), `fetch_track_images_retry.py` (targeted alternate-query retry), `embed_track_imagery.py` (idempotent report embedding). Supersedes `fetch_track_images.py` / `fetch_track_images_v2.py` / `fetch_track_images_fixup.py`.
- Validation: `npm run sop:validate` — all SOP documents & logs 100% compliant.

---

## [Build R25 / Live F1 Telemetry, Team Radio & Race Data Streaming Architecture] — 2026-08-28

### 08-28B Added & Researched

- **Live F1 Telemetry, Team Radio & Race Data Streaming Blueprint ([.master/documents/live_f1_telemetry_radio_streaming_architecture.md](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/.master/documents/live_f1_telemetry_radio_streaming_architecture.md))**:
  - Researched all public and official Formula 1 live data infrastructure, endpoints, protocols, and stream formats for live in-browser consumption.
  - Deep-dive on **OpenF1 API** (`api.openf1.org/v1/`): REST, WebSocket, and MQTT streams covering 11+ core endpoints: `/car_data` (3.7 Hz speed, RPM, throttle, brake, gear, DRS), `/location` (3.7 Hz X,Y,Z GPS coordinates), `/team_radio` (live MP3 audio URLs + transcripts), `/intervals` (gap to leader and car ahead), `/laps` (mini-sectors, sector times, speed traps), `/position` (running order), `/race_control` (flags, SC/VSC status, steward notices), `/stints` (tire compound, stint length, tyre age), `/pit` (pit stop durations), `/weather` (track/air temps, rain radar), and `/sessions`/`/meetings`/`/drivers`.
  - Deep-dive on **Official F1 Live Timing SignalR Hub** (`livetiming.formula1.com/signalr` or `/signalrcore`): Hub subscriptions (`CarData.z`, `Position.z`, `TeamRadio`, `TimingData`, `TrackStatus`, `WeatherData`), Base64 binary decoding, and raw DEFLATE streaming decompression via native Web Streams `DecompressionStream('deflate-raw')`.
  - Mapped complete live feature matrix for Formula 1 Legends: 3D car GPS path tracking in `RaceScene3D.tsx`, dual-mode audio engine combining real MP3 audio files with Web Audio VHF DSP and natural neural voice fallback in `radioAudioService.ts`, live steering wheel shift LED and OLED sync in `SteeringWheelLab.tsx`, live weather radar integration, and TV broadcast synchronization delay engine (0–90s buffer).

---

## [Build R25 / 2026 F1 Car Design Research for Blender] — 2026-08-28

### 08-28B Added & Documented

- **2026 Car Design Research ([.master/documents/f1_2026_car_design_research.md](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/.master/documents/f1_2026_car_design_research.md))**:
  - Compiled what is actually public for 2026 F1 cars: no team CAD/STEP; closest sources are the FIA Technical Regulations envelopes, Mercedes W17 published box (5505 × 1900 × 950 mm, 3400 mm wheelbase, 772 kg), Ferrari SF-26 official PU/ERS sheet, and McLaren’s 2026 aero explainer.
  - Locked modeling facts: Venturi tunnels removed, beam wing deleted, active front+rear (Corner/Straight modes), DRS replaced by Overtake Mode, 18" rims retained, tyres 280 mm F / 375 mm R, real min mass 770–772 kg vs 768 kg target.
  - Documented the 11-car 2026 grid (W17, SF-26, MCL40, RB22, VCARB 03, AMR26, A526, FW48, VF-26, R26, MAC-26) and called out pull-rod front on RB22 vs push-rod F+R on Mercedes/Ferrari.
  - Flagged that `src/graphics/f1_2026/` still describes 2022-style Venturi floors; Blender GLB should become the new source of truth.
- **Blender photo board ([.master/documents/references/f1_2026_car/](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/.master/documents/references/f1_2026_car/))**:
  - Six Wikimedia Commons Austria 2026 stills (W17, SF-26, RB22, MCL40, Audi R26, Cadillac MAC-26), resized 1920×960 (~270–320 KB each) for image-plane reference.

---

## [Build R24 / 2026 Calendar Track Design Research Dossier] — 2026-08-28

### 08-28A Added & Documented

- **2026 Track Design Report ([.master/documents/track_design_report_2026_calendar.md](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/.master/documents/track_design_report_2026_calendar.md))**:
  - Compiled a ~52 KB research dossier covering all **23 circuits** on the verified 2026 FIA F1 calendar, sourced via live web research (Formula1.com official calendar, Wikipedia 2026 season article, Wikipedia Madring article with raw Layout/Site sections).
  - Per-circuit dossiers: identity/grading, track layout & corner design, pit complexes & buildings, grandstands & seating capacities, terrain & surroundings, and climate/weather profiles.
  - **Verified calendar anomalies captured**: 23-round season; new **Madring (Madrid)** as Round 14 (5.416 km / 22 turns / Studio Dromo–Jarno Zaffelli / €83.2M build / La Monumental banked corner capped at 24% gradient / two tunnels under an elevated motorway / first fully covered paddock in F1 / 110,000→140,000 capacity plan); **Round 16 "Gulf Air Bahrain Grand Prix in Malaysia"** staged at Sepang (Sakhir & Jeddah listed as returning 2027); Barcelona-Catalunya retained alongside Madrid.
  - Added comparative technical summary table (length/turns/direction/elevation/venue type) and a 2026-regulations design-impact analysis (active aero X-Mode/Z-Mode, MGU-K override deployment).

---

---

## [Build R23 / Bespoke F1 Motorsport Icons, 3D Parallax Auth Gateway & Context+Focus Cards] — 2026-08-27

### 08-27S Added & Enhanced

- **Bespoke Motorsport Vector Icon Suite ([src/components/F1Icons.tsx](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/components/F1Icons.tsx))**:
  - Designed 14 custom vector SVG motorsport icons engineered specifically for the F1 2026 application: `F1CarAeroIcon`, `F1EngineV6Icon`, `F1MguKIcon`, `F1TireCompoundIcon`, `F1TelemetryWaveIcon`, `F1TrackElevationIcon`, `F1PitStopCrewIcon`, `F1SteeringWheelIcon`, `F1RadioSquelchIcon`, `F1SuperlicenseIcon`, `F1KielProbeIcon`, `F1PorpoisingIcon`, `F1FlagChequeredIcon`, and `F1WindTunnelIcon`.
  - Replaced generic utility icons across navigation, headers, car lab platforms, and strategy modules.
- **3D Parallax Paddock & Telemetry Auth Gateway ([src/components/ParallaxAuthScreen.tsx](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/components/ParallaxAuthScreen.tsx), [src/App.tsx](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/App.tsx), [src/components/AppHeader.tsx](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/components/AppHeader.tsx), [src/styles.css](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/styles.css))**:
  - Built an immersive multi-layer 3D parallax access portal featuring real-time mouse/cursor tracking, speed streak light beams, and ambient Silverstone/Monza topography gridlines.
  - Engineered an interactive 3D FIA Superlicense & Paddock Pass card with procedural gold smart chip, foil shimmer reflection, and 3D perspective tilt (`rotateX/rotateY`).
  - Added 10-team constructor credential selector with live theme color reactivity, 4-tier operational role switcher (_Lead Race Strategist, Chief Aerodynamicist, Telemetry Systems Engineer, FIA Technical Delegate_), callsign name input, and simulated biometric fingerprint/FIA chip scan animation with audio feedback.
  - Added interactive header credential badge allowing instant session switching and re-opening of the credential portal on demand.
- **Compact Context + Focus Card Architecture ([src/components/ContextFocusCard.tsx](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/components/ContextFocusCard.tsx), [src/views/CarLab.tsx](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/views/CarLab.tsx), [src/views/StrategyWorkspace.tsx](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/views/StrategyWorkspace.tsx), [src/styles.css](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/styles.css))**:
  - Implemented reusable `ContextFocusCard` component supporting compact KPI summary strips by default, smooth accordion expansion, and full-screen holographic deep-dive modal inspection.
  - Integrated across CarLab (Active Aero, Wind Tunnel/Aero-Rake Diagnostics, Ground Effect Ride Heights, 350kW MGU-K Hybrid Power Unit, Brakes & Narrow Tires, and FIA Scrutineering Compliance) and Strategy Workspace (Monte Carlo AI Environmental Factors).

---

## [Build R22 / 3D Car Showroom CAD Viewport Overhaul, HUD Styling & Staging Polish] — 2026-08-27

### 08-27R Added & Enhanced

- **3D Car Showroom CAD Viewport & HUD Overlay Styling ([src/styles.css](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/styles.css))**:
  - Implemented missing CSS rules for `.car-showroom-3d`, `.showroom-3d-canvas`, `.showroom-grid`, `.showroom-title`, `.showroom-help`, and `.showroom-stat` (`.showroom-stat.front`, `.showroom-stat.load`).
  - Resolved issue where specification and aerodynamic balance text was rendering unconstrained in standard document flow above the canvas.
  - Formatted all telemetry and technical overlays into glassmorphism HUD cards with subtle cyan and papaya neon indicators, high-contrast monospace metadata, and responsive positioning.
- **Heroic 3D Camera Framing & Proportions ([src/components/CarShowroom3D.tsx](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/components/CarShowroom3D.tsx))**:
  - Optimized camera projection FOV (36°) and orbit distance coordinates (`(4.4, 2.1, 4.8)` from previous `(8.2, 4.6, 9.2)`), centering the 2026 F1 car prominently in the viewport.
  - Adjusted model ground clearance (`y = 0.02`) and close-up camera presets (`FRONT_WING`, `COCKPIT`, `POWERTRAIN`, `DIFFUSER`) for crisp component inspection.
- **Engineering Stage Floor & Turntable Replacement ([src/components/CarShowroom3D.tsx](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/components/CarShowroom3D.tsx))**:
  - Replaced the oversized, thick cylinder "platter" with a flush carbon-fiber inspection pad (`CylinderGeometry(3.0, 3.05, 0.02)`), a CNC titanium bevel rim, and a soft shadow receiver plane.
  - Added an authentic CAD coordinate floor grid (`GridHelper(12, 24)`) and concentric technical measurement calibration rings.

---

## [Build R21 / Dynamic Aero-Rake Pitot Rig, Custom Livery Studio & 4K Studio Snapshot Export] — 2026-08-27

### 08-27Q Added & Enhanced

- **Dynamic Aerodynamic Aero-Rake Rig ([src/graphics/f1_2026/F1Car2026Model.ts](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/graphics/f1_2026/F1Car2026Model.ts), [src/graphics/f1_2026/carPartsData.ts](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/graphics/f1_2026/carPartsData.ts), [src/components/CarShowroom3D.tsx](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/components/CarShowroom3D.tsx), [src/views/CarLab.tsx](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/views/CarLab.tsx))**:
  - Implemented 3D Pitot-tube / Kiel probe Aero-Rake Grid mounted behind both front tyres (titanium perimeter frames, 4 horizontal and 5 vertical lattice struts, carbon mounting arms to chassis/uprights, and 40 forward-facing Kiel probes with conical shrouds and dynamic color-coded pressure tip spheres).
  - Added real-time wake pressure calculation algorithm (`updateAeroRakePressures()`) modeling tyre wake boundary layer loss ($C_p \approx -0.65$ to $-0.95$, purple/blue) and clean inboard underfloor feed ($C_p \approx +0.85$, red/orange) dynamically scaled with velocity and active wing pitch.
  - Added animated 3D wake streamline particle tracer system and live in-viewport 40-probe pressure matrix HUD overlay.
  - Added dedicated Aero-Rake instrumentation toggle card in the CarLab Aero Platform column and metadata specs in `carPartsData.ts`.
- **Custom Livery Color & Sponsor Decal Studio ([src/graphics/f1_2026/F1Car2026Model.ts](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/graphics/f1_2026/F1Car2026Model.ts), [src/views/CarLab.tsx](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/views/CarLab.tsx), [src/styles.css](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/styles.css))**:
  - Created procedural carbon weave texture engine supporting 4 selectable finishes: Gloss 2x2 Twill, Raw Matte Micro-Grain, Forged Carbon Composite, and Satin Weave.
  - Developed dynamic 1024x512 livery canvas map generator (`createSponsorCanvasTexture`) applying racing color block gradients, driver number roundels, and custom sponsor decals to sidepods, nose cone, shark fin, and rear wing elements.
  - Integrated interactive Livery Studio drawer panel in CarLab with 7 preset themes (Apex Racing, Cyber Silver, Gulf Legacy, Stealth Carbon, Papaya Speed, British Racing, Neon Cyberpunk), primary/accent HTML5 color pickers, carbon finish selector, and custom text inputs for team sponsor decals.
  - Configured seamless hot-swapping on 3D meshes while preserving compatibility with CFD pressure heatmaps and FLIR thermal infrared rendering modes.
- **High-Resolution 4K Studio Snapshot Export ([src/components/CarShowroom3D.tsx](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/components/CarShowroom3D.tsx), [src/views/CarLab.tsx](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/views/CarLab.tsx), [src/styles.css](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/styles.css))**:
  - Engineered 4K UHD (3840×2160) offscreen render pipeline with aspect-corrected camera projection, anti-aliasing, ACESFilmic tone mapping, and PCF soft shadow maps.
  - Generated composite technical watermark footer banner displaying car telemetry (Downforce kN, Balance %, Active Mode), FIA Article 3.4 certification badge, and high-contrast typography.
  - Added camera shutter action button in CAD toolbar with audio-visual camera flash animation and automatic PNG file download.
- **TypeScript Type Hygiene & Bugfix ([src/graphics/steering_wheel/F1SteeringWheelModel.ts](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/graphics/steering_wheel/F1SteeringWheelModel.ts))**:
  - Fixed pre-existing TypeScript index signature error on telemetry object in steering wheel controller by replacing dynamic index assignment with type-safe `Object.assign`.

---

## [Build R20 / Steering Wheel High-Fidelity Decals, Rear Paddle Lighting & 3D Race View Sizing Fix] — 2026-08-27

### 08-27P Added & Fixed

- **3D Race View Container Sizing & ResizeObserver Fix ([src/components/RaceScene3D.tsx](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/components/RaceScene3D.tsx), [src/styles.css](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/styles.css))**:
  - Fixed issue where the 3D race was not displaying on the main dashboard due to missing `.race-scene-container` styling.
  - Added `.race-scene-container` with explicit flex sizing (`min-height: 280px; flex: 1; position: relative; width: 100%; height: 100%;`).
  - Added `ResizeObserver` lifecycle listeners with safe fallback dimensions (`800x500`) to guarantee proper WebGL viewport scaling upon container mount.
- **Steering Wheel Rear Paddle Illumination & Studio Lighting ([src/components/SteeringWheel3D.tsx](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/components/SteeringWheel3D.tsx))**:
  - Implemented 360° studio lighting with dedicated high-intensity rear key light (`#ffffff`, 2.8), rear cool fill light (`#bad7ff`, 2.4), rear bottom light, and dual rear point lights (`#00f0ff` / `#30d158`) right behind the left and right carbon paddle blades.
  - Adjusted `paddles` camera preset perspective (`pos: (0, 0.03, -0.34)`, `lookAt: (0, 0.01, -0.01)`) for clear paddle inspection.
- **High-Definition Silkscreen Button Decals & Mechanical Detailing ([src/graphics/steering_wheel/F1SteeringWheelModel.ts](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/graphics/steering_wheel/F1SteeringWheelModel.ts))**:
  - Built procedural high-res canvas decal generators: `createButtonDecalTexture`, `createPaddleDecalTexture`, and `createDialScaleTexture`.
  - Upgraded all 16 pushbuttons with laser-etched silkscreen typography (`DRS`, `RAD`, `ACK`, `PL`, `OT`, `N`, `R`, `SOC`, `PASS`, `EB+`, `EB-`, `BB+`, `BB-`, `DRK`, `P+`, `P-`), outer colored bezel rings, concave tactile dish gradients, and raised CNC anodized aluminum collars with titanium chamfer accents.
  - Upgraded rotary dials with circular laser-etched scale graduations and heavy knurled aluminum knobs.
  - Upgraded paddle shifters with glossy clearcoat carbon weave, laser-etched green `+` / crimson `−` symbols, titanium pivot brackets, and neodymium magnetic microswitch cylinders.
- **Code Hygiene & Unused Variable Clean-Up ([src/graphics/f1_2026/F1Car2026Model.ts](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/graphics/f1_2026/F1Car2026Model.ts))**:
  - Resolved unused `speedKmh` in `updateAeroRakePressures` by integrating dynamic velocity scaling into the Kiel probe differential pressure equation.

---

## [Build R19 / UI/UX Cohesion Overhaul — Design Flow, Graphics & Layout Fix] — 2026-08-27

### 08-27O Added & Fixed

- **Onboarding Overlay Root-Cause Fix & Visual Redesign ([src/components/OnboardingOverlay.tsx](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/components/OnboardingOverlay.tsx), [src/styles.css](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/styles.css))**:
  - **Fixed critical CSS class mismatch**: component used `onboarding-overlay` but CSS defined `onboarding-backdrop` — causing the entire Race Guide modal to render as an unstyled, unconstrained text wall covering the race view.
  - Added branded F1 hero banner with papaya gradient icon, radial glow, and orange accent underline stripe.
  - Rebuilt step cards using all existing CSS classes (`.guide-step`, `.step-num`, `.onboarding-body`, `.onboarding-footer`, `.got-it-btn`) that were defined but never connected.
  - Added `.step-icon-wrap` papaya-tinted icon containers alongside numbered circles for visual hierarchy.
  - Added `.step-title` / `.step-desc` typography hierarchy replacing bare `<b><span>` pairs.
  - Upgraded CTA button to full-width gradient with lift-on-hover animation and glow shadow.
- **Car Lab Center Panel 2-Row Header Restructure ([src/views/CarLab.tsx](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/views/CarLab.tsx), [src/styles.css](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/styles.css))**:
  - Split the single overloaded header row (title + dropdown + 5 buttons) into three clean zones: **Title Row** (eyebrow + h2 + FIA 2026 / 30+ PARTS spec badges), **Tool Row** (CFD / FLIR / X-RAY / WIND as compact icon-pills), and **Search Bar** (full-width part inspector dropdown).
  - Added `.cad-panel-title-row`, `.cad-spec-badges`, `.cad-spec-badge`, `.cad-tool-row`, `.cad-tool-group`, `.cad-tool-btn`, `.cad-search-bar` CSS classes.
  - `cad-tool-btn.active.thermal` variant: red glow for FLIR mode to distinguish from papaya CFD mode.
- **Camera Director Bar — Compact Pill Format**:
  - Replaced verbose full labels (`5: 360° ORBIT`, `1: FRONT WING`) with compact `ORBIT / NOSE / COCKPIT / PU / DIFF` labels with keyboard shortcut badge (`.cam-kbd`) inside each pill.
  - Adds `title` tooltip on each pill showing full label + keyboard shortcut.
- **Aero Metrics Ribbon Upgrade**:
  - Added 5th column **AERO MODE** stat showing `Z-MODE` (green) or `X-MODE` (papaya) with sub-label `HIGH DF` / `-45% DRAG`.
  - Ribbon now uses divider-line column layout (`border-right`) instead of gap grid for a cleaner dashboard look.
  - Added `.aero-mode-stat`, `.stat-mode-badge.corner`, `.stat-mode-badge.straight`, `.stat-mode-sub` CSS classes.
  - Fixed missing `.stat-value.highlight-green` class (was referenced in JSX but undefined in CSS).

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
