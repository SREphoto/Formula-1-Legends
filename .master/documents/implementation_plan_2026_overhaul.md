# Formula 1 2026 - Complete UI & UX Overhaul Implementation Plan

## Objectives & Requirements

1. **Complete UI Overhaul across All 4 Workspaces**:
   - Eliminate all mashed text, overlapping numbers, and cramped layouts.
   - Replace ambiguous elements with clear, tactile, high-contrast motorsport components.
   - Build a bespoke F1 Command Center design system with deep carbon glassmorphism, authentic telemetry layouts, and responsive widescreen cards.
   - Use **bespoke, crafted graphics and custom SVGs** (custom tire compound badges, tachometer gauges, pedal meters, sector chips) — **no generic or low-effort styling**.
2. **2026 Official Drivers & Constructors Grid**:
   - Update all 20 drivers and 10 constructor teams to the **official 2026 Formula 1 Grid** (McLaren, Ferrari with Hamilton/Leclerc, Red Bull, Mercedes with Russell/Antonelli, Aston Martin with Alonso/Stroll, Williams with Sainz/Albon, Alpine, Racing Bulls, Kick Sauber/Audi, Haas).
   - Set McLaren (Lando Norris `NOR #4` & Oscar Piastri `PIA #81`) as the managed player team.
3. **Fix Current 3D Rendering Glitches**:
   - Eliminate the black polygon shadow spikes / shadow acne by adjusting shadow camera bias (`+0.0008`) and clean normal computations.
4. **Dedicated 3D Simulation Realism Roadmap (After-Plan)**:
   - Dedicated roadmap for authentic real-world tracks (Silverstone, Spa, Monaco, Monza with real elevation profiles), authentic 3D car models with PBR textures, suspension geometry, DRS flap animation, and broadcast camera tracking.

---

## Detailed Page Redesign Specifications

### 1. 2026 Grid & Championship Seed Data (`src/data/drivers.ts`)

- All 10 teams and 20 drivers with 2026 liveries, driver ratings, tire skill, wet skill, and numbers.
- Team Standings updated to 2026 constructor standings.

---

### 2. Design System & Global Styles (`src/styles.css`)

- **Color Tokens**:
  - Carbon Chassis `#080a0f`, Matte Slate `#10141c`, Brushed Titanium `#1a212d`, High-Gloss Border `#283244`.
  - Neon Telemetry Accents: McLaren Papaya `#ff8000`, Ferrari Rosso `#e8002d`, Mercedes Cyan `#00d2be`, Soft Red `#ff3b30`, Medium Yellow `#ffd60a`, Hard White `#f5f5f7`, Inter Green `#30d158`, Wet Blue `#0a84ff`.
- **Typography & Structural Layout**:
  - Distinct spacing between labels, values, and units (e.g. `SPEED` · `275` · `KM/H`).
  - Tactile interactive buttons with glowing active borders, hover animations, and pressed feedback.
  - Multi-column flex and grid systems with minimum constraints so panels expand elegantly on all desktop & laptop screens.

---

### 3. Race Command Center (`src/views/RaceDashboard.tsx` & Subcomponents)

- **Timing Tower (`TimingTower.tsx`)**:
  - Official F1 TV timing leaderboard style: Position (P1–P20), team color bar, driver code (`NOR`, `VER`, `LEC`), tire badge (`S`, `M`, `H`, `I`, `W`) + stint age, gap to leader, and interval.
  - Highlighting active selected driver with glowing border and live telemetry pin.
- **3D Race Scene (`RaceScene3D.tsx`)**:
  - Fix shadow camera bias and ribbon vertex normals to remove black shadow spikes.
  - Custom floating camera toggle bar: `[🎥 Broadcast View]` / `[🏎️ Cockpit Onboard]`.
  - Floating Next Pit Window decision alert with direct strategy link.
- **Telemetry & Tactical Command Deck (`DriverTelemetryPanel.tsx`)**:
  - **Driver Hero**: Number `#4`, Lando Norris, Team McLaren, current P1, stint status.
  - **Live Tachometer & Pedals**: Digital speed, gear indicator (N/1-8), live RPM LED tachometer bar (green -> amber -> red shift lights), Throttle & Brake gradient pressure bars.
  - **4-Corner Thermal Tire Matrix**: 4 distinct corner cards (FL, FR, RL, RR) with Surface Temp (°C), Core Temp (°C), and Wear % with intuitive status colors (❄️ Cold / 🟢 Optimal / 🔥 Overheating).
  - **Systems & Health**: ERS Battery %, Fuel Load (kg) with delta, Front/Rear Carbon Brake Temps (°C), ICE Engine Wear %, Plank Wear gauge.
  - **Interactive Tactical Command Dock**:
    - **Pace Mode**: 3 tactile segmented buttons (`[🐢 Conserve]`, `[⚖️ Balanced]`, `[⚡ Attack]`).
    - **ERS Mode**: 3 segmented buttons (`[🔋 Harvest]`, `[⚖️ Balanced]`, `[🚀 Deploy/Overtake]`).
    - **Pit Command Deck**: Tire compound selectors (`[🔴 S]`, `[🟡 M]`, `[⚪ H]`, `[🟢 I]`) + High-contrast `[🏎️ BOX THIS LAP]` / `[❌ CANCEL PIT CALL]` action button.

---

### 4. Race Strategy Workspace (`src/views/StrategyWorkspace.tsx`)

- **Driver Switcher**: Toggle between managed drivers (Norris / Piastri).
- **Strategy Cards**:
  - **Plan A (1-Stop Medium → Hard)**, **Plan B (2-Stop Soft → Medium → Soft)**, **Plan C (Rain Cover)**.
  - Shows Projected Finish (`P1 +2.8s`), Win Probability (`42%`), Pit Window (Laps 39–43), and active **[✓ COMMIT PLAN]** button.
- **Pit Window & Race Delta Curve**:
  - Clean graph with shaded pit loss window and non-overlapping, evenly distributed lap tick numbers.
- **Degradation Breakdown & Weather Radar**:
  - Stint-by-stint degradation projection cards and rain probability timeline.

---

### 5. Performance Engineering / Car Lab (`src/views/CarLab.tsx`)

- **Center 3D Engineering Showroom**: Smooth car inspection with aero stream particles.
- **Quick Preset Bar**: `[⚖️ Balanced]`, `[🏎️ High Downforce]`, `[⚡ Low Drag / Monza]`, `[🌧️ Wet Setup]`.
- **Engineering Setup Cards**:
  - **Aerodynamic Platform**: Front Wing Angle (°), Rear Wing Angle (°), Engine Cooling (%) with clean sliders and real-time impact readouts.
  - **Ground Effect Floor**: Front / Rear Ride Height (mm), Rake Angle, Porpoising Gauge.
  - **Mechanical**: Brake Bias (F/R %), Front/Rear Tire Pressures (psi).
- **Live Aero Stats Bar**: Downforce (kN), Drag (Cd), Top Speed Est (km/h), Aero Balance (% Front).

---

### 6. Team Headquarters (`src/views/HQDashboard.tsx`)

- **Top Financial & Operational KPI Cards**: Available Budget ($42.8M), Cost Cap ($92.2M / $135.0M), Championship Standing (P1 Constructors), ATR Allowance.
- **R&D Upgrade Pipeline**: Active upgrades with progress bars, department filter (`[💨 Aero]`, `[🔧 Chassis]`, `[⚡ Powertrain]`), days remaining, time gain (`+0.18s`), and `[+ NEW UPGRADE]` modal.
- **ATR Allocation Slider**: Interactive CFD split with performance gain preview.
- **Constructors Standings Table**: 2026 team points and gaps.

---

## 3D Simulation Realism Roadmap (After-Plan)

After completing this full UI overhaul, the following dedicated 3D enhancements are scheduled:

1. **Accurate Real-World Circuit Layouts**: Import exact GPS spline coordinates, track elevation changes, kerb profiles, and run-off areas for Silverstone, Spa-Francorchamps, Monza, and Monaco.
2. **Realistic 3D F1 Car Meshes & PBR Materials**: Multi-part high-detail car model with accurate sidepod venturi tunnels, complex front/rear wing cascade elements, carbon-fiber weave normal maps, real tire compounds with Pirelli sidewall decals, rotating wheels, and DRS flap opening/closing animations.
3. **Immersive Audio & Environmental FX**: Dynamic engine audio synthesis, wind noise, tire screech on lockups, dynamic rain droplet shaders on cockpit view, and wet track spray particle systems.
