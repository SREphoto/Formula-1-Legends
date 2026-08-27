# Walkthrough — Interactive Circuit Maps, Dynamic Live Radio Player, V6 Synthesizer & News Persistence

**Build**: `BUILD R7`
**Date**: 2026-08-27

---

## 1. Summary of Changes

### 1.1 Interactive 2D Circuit Map Preview & On-Track Car Position Dots

- Created [`src/data/circuitData.ts`](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/data/circuitData.ts) defining precise 2D SVG track geometries, turn metadata, corner names (e.g. Abbey, Copse, Stowe, Eau Rouge, Tarzanbocht, Senna S), DRS activation zones, and official lap records across all 24 Grand Prix meetings in the 2026 calendar.
- Built [`src/components/CircuitMapPreview.tsx`](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/components/CircuitMapPreview.tsx) rendering:
  - Multi-sector gradient track paths (S1/S2/S3).
  - Green DRS activation zones with dashed racing centerlines.
  - Interactive turn nodes with hover tooltips displaying turn numbers and corner names.
  - Circuit statistics badge (length in KM, turn count, DRS zone count, country pin, and official lap record).
  - **Animated On-Track Car Position Dots**: Dynamic glowing car markers for Driver 1 (`#4 NOR`) and Driver 2 (`#1 VER`) interpolating along the SVG track path using `pathRef.current.getPointAtLength()` with real-time lap progress calculations.
- Connected the circuit switcher in [`src/views/LiveTelemetryExplorer.tsx`](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/views/LiveTelemetryExplorer.tsx) so the map dynamically updates when toggling between the 24 rounds.

### 1.2 Procedural V6 Turbo-Hybrid Engine Audio Synthesizer

- Created [`src/services/soundEngine.ts`](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/services/soundEngine.ts) using the Web Audio API:
  - **ICE V6 Harmonics**: 4 harmonic oscillators for combustion firing pulses (`fundamental = (RPM / 60) * 3 Hz`).
  - **Manifold & Exhaust Rasp**: Waveshaper non-linear saturation curve and throttle-modulated lowpass filter.
  - **Turbocharger Boost Spool**: High-frequency sine tone (1800Hz–4500Hz) modulated by throttle input.
  - **MGU-K Electrical Deployment/Harvest**: High-pitch electrical whir (3200Hz–6000Hz) during ERS deployment.
  - **Tire Skid Screeching**: Filtered bandpass noise burst triggered during heavy braking (>60% brake pressure).
  - **Telemetry Streaming Loop**: Integrated real-time telemetry streaming in [`src/views/LiveTelemetryExplorer.tsx`](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/views/LiveTelemetryExplorer.tsx) with a tactile `[V6 ENGINE AUDIO]` toggle.

### 1.3 Dynamic Live Radio Player with Web Audio Synthesis

- Created [`src/services/radioAudioService.ts`](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/services/radioAudioService.ts) using the Web Audio API:
  - **Push-to-Talk (PTT) Beep Tones**: Dual-frequency sine bursts (1850Hz & 2300Hz) simulating pit-to-car radio engagement.
  - **Cockpit VHF Filter & Crunch**: BiquadFilter (1400Hz center, Q=1.8 bandpass) and non-linear waveshaping transfer curve.
  - **Cockpit Static Noise**: Dynamic pink/white noise generator providing realistic cockpit interference.
  - **Speech Synthesis Playback**: Synchronized speech playback for driver and race engineer messages with automatic voice pitch modulation.
- Enhanced [`src/views/LiveTelemetryExplorer.tsx`](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/views/LiveTelemetryExplorer.tsx) with:
  - VHF Encrypted Channel HUD (`462.550 MHz`).
  - Animated 5-band audio equalizer waveform bars during active broadcasts.
  - Active transmission glow and instant Stop Audio / abort controls.

### 1.4 Paddock News Bookmark & OpenF1 Media Sync

- Updated [`src/components/PaddockNewsWidget.tsx`](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/components/PaddockNewsWidget.tsx) and [`src/services/f1NewsService.ts`](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/services/f1NewsService.ts):
  - Category filter persistence saved to `localStorage` (`f1_paddock_news_category`).
  - Article bookmarking saved to `localStorage` (`f1_paddock_news_bookmarks`).
  - Added "Bookmarked" filter pill with live count badge and empty state.
  - Added bookmark toggle icon buttons on all cards with golden glow state.
  - **Automated Background Media Sync**: 35-second periodic background timer that polls for incoming breaking technical directives (e.g. FIA TD048 Skid Block Wear, Mercedes beam wing evaluation), pushing updates to the feed and triggering live toast alerts.

---

## 2. Verification & Validation Results

### Automated Quality Checks

- `npm run build`: Compiled TypeScript and bundled Vite with **0 errors**.
- `npm run lint`: ESLint check completed with **0 warnings or errors**.
- `npm run sop:validate`: SOP validation audit passed with **100% compliance**.

### File Inventory

- [`src/data/circuitData.ts`](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/data/circuitData.ts)
- [`src/components/CircuitMapPreview.tsx`](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/components/CircuitMapPreview.tsx)
- [`src/services/soundEngine.ts`](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/services/soundEngine.ts)
- [`src/services/radioAudioService.ts`](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/services/radioAudioService.ts)
- [`src/services/f1NewsService.ts`](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/services/f1NewsService.ts)
- [`src/views/LiveTelemetryExplorer.tsx`](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/views/LiveTelemetryExplorer.tsx)
- [`src/components/PaddockNewsWidget.tsx`](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/components/PaddockNewsWidget.tsx)
- [`src/views/HQDashboard.tsx`](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/views/HQDashboard.tsx)
- [`src/styles.css`](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/styles.css)
- [`.master/MasterChangeLog.md`](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/.master/MasterChangeLog.md)
- [`.master/TroubleshootingLog.md`](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/.master/TroubleshootingLog.md)
- [`.master/IdeasLog.md`](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/.master/IdeasLog.md)
- [`.master/FileManifest.md`](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/.master/FileManifest.md)
