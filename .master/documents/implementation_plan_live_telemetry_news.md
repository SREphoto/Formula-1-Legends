# Implementation Plan — Live Formula 1 Telemetry (OpenF1) & Paddock News Center

## Objective

Implement Option A from the roadmap:

1. Integrate the **OpenF1 API** to enable real-world Formula 1 race session telemetry, driver comparison traces (speed, RPM, throttle, brake, DRS), tire stint timelines, and team radio clips.
2. Build a live **Paddock News & Technical Media Center** with real motorsport feeds, category filters, and breaking news alerts.
3. Add a dedicated **Live F1 Telemetry** navigation tab in the application header.

---

## Technical Architecture

### 1. Data Services Layer

- [`src/services/openf1Service.ts`](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/services/openf1Service.ts):
  - Fetches meetings, sessions (Practice, Qualifying, Race), driver list, lap times, tire stints, car telemetry streams, and radio messages from `https://api.openf1.org/v1/`.
  - Built-in cached session fallback for seamless instant loading and offline capability.
- [`src/services/f1NewsService.ts`](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/services/f1NewsService.ts):
  - Provides categorized F1 news stories (Technical Upgrades, Regulations, Paddock Rumors, Race Reports) with live refresh and linkouts.

### 2. UI Components & Views

- [`src/components/PaddockNewsWidget.tsx`](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/components/PaddockNewsWidget.tsx):
  - News digest widget embedded in Team HQ with category filters and breaking alerts.
- [`src/views/LiveTelemetryExplorer.tsx`](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/views/LiveTelemetryExplorer.tsx):
  - Interactive multi-driver telemetry analyzer:
    - Session & Grand Prix selector (e.g. Silverstone, Spa, Monza, Monaco).
    - Head-to-Head Driver Telemetry Overlay (Norris `#4` vs Verstappen `#1` / Leclerc `#16`): Speed curve, Throttle/Brake traces, Gear, DRS status.
    - Tire Stint History & Compound matrix.
    - Team Radio Transcript & Audio player.
    - Live Weather & Track Conditions readout.
- [`src/components/AppHeader.tsx`](file:///Users/Samuel/AGapps/Formula-1-legends/Formula-1-Legends/src/components/AppHeader.tsx):
  - Add `live-telemetry` navigation tab.

---

## Verification Plan

- Build check: `npm run build`
- Lint check: `npm run lint`
- SOP check: `npm run sop:validate`
