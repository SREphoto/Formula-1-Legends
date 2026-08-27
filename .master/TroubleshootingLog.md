# Troubleshooting Log — Formula 1 Management Simulator

This log tracks technical issues, root causes, diagnostics, solutions, and usage frequency.

_Ranked by usefulness and fix count._

---

## 1. 3D Race Scene Black Shadow Spikes & Streaks

- **Rank**: #1 Most Critical Visual Fix
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
