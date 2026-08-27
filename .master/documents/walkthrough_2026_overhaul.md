# Formula 1 2026 - UI/UX Overhaul & 2026 Grid Upgrade Walkthrough

## Summary of Completed Work

We executed a comprehensive overhaul of the **Formula 1 Legends / 2026** management simulator across all four primary application workspaces, typography, interactive command systems, and 3D rendering.

---

## Key Changes by Area

### 1. 2026 Official Grid & Constructors Data

- Updated `src/data/drivers.ts` with the official 2026 Formula 1 driver and constructor lineup:
  - **McLaren F1 Team** (Managed Player Team): Lando Norris (`#4 NOR`), Oscar Piastri (`#81 PIA`).
  - **Scuderia Ferrari HP**: Charles Leclerc (`#16 LEC`), Lewis Hamilton (`#44 HAM`).
  - **Oracle Red Bull Racing**: Max Verstappen (`#1 VER`), Liam Lawson (`#30 LAW`).
  - **Mercedes-AMG PETRONAS**: George Russell (`#63 RUS`), Kimi Antonelli (`#12 ANT`).
  - **Aston Martin Aramco**: Fernando Alonso (`#14 ALO`), Lance Stroll (`#18 STR`).
  - **Williams Racing**: Carlos Sainz (`#55 SAI`), Alexander Albon (`#23 ALB`).
  - **BWT Alpine F1 Team**: Pierre Gasly (`#10 GAS`), Jack Doohan (`#7 DOO`).
  - **Visa Cash App RB**: Yuki Tsunoda (`#22 TSU`), Isack Hadjar (`#6 HAD`).
  - **Stake F1 Team Kick Sauber (Audi)**: Nico Hülkenberg (`#27 HUL`), Gabriel Bortoleto (`#5 BOR`).
  - **MoneyGram Haas F1 Team**: Esteban Ocon (`#31 OCO`), Oliver Bearman (`#87 BEA`).
- Updated initial selected driver in `src/App.tsx` to `'nor'`.

---

### 2. Bespoke Motorsport Design System (`src/styles.css`)

- **Deep Carbon / Titanium Glassmorphism**: High-contrast, low-eyestrain dark palette (`#07090e`, `#0f131a`, `#141923`) with crisp borders (`#1e2634`).
- **Typography & No More Text Collisions**:
  - Rebuilt all numeric cards, progress bars, and labels with explicit semantic spacing and hierarchy.
  - Distinct units (`KM/H`, `RPM`, `°C`, `mm`, `psi`, `kg`, `kN`, `Cd`) rendered clearly with dedicated typography.
- **Tactile Interactive Affordances**:
  - Neon glowing active borders for selected tabs, pace modes, and strategy options.
  - Clear compound badges with official F1 tire colors (🔴 Soft, 🟡 Medium, ⚪ Hard, 🟢 Inter, 🔵 Wet).
  - High-impact, unambiguous action buttons (e.g., `[🏎️ BOX THIS LAP]` / `[❌ CANCEL PIT STOP]`).

---

### 3. Race Center Workspace (`src/views/RaceDashboard.tsx`)

- **Timing Tower (`src/components/TimingTower.tsx`)**:
  - F1 TV leaderboard layout with team color indicator, position, code, tire badge with stint age, gap to leader, and sector performance dots.
- **3D Scene Shadow Fix (`src/components/RaceScene3D.tsx`)**:
  - Corrected shadow bias (`+0.0008`) and ribbon normal generation to eliminate black polygon spikes and shadow acne.
  - Floating camera toggle (`Broadcast View` vs `Cockpit Onboard`).
- **Driver Telemetry Panel (`src/components/DriverTelemetryPanel.tsx`)**:
  - **Driver Hero**: Number badge `#4`, full name, country, team, and current P1 stint status.
  - **Cockpit Gauges**: 8-LED RPM shift-light tachometer (green → yellow → red), digital speedometer, gear readout, and throttle/brake gradient pressure meters.
  - **4-Corner Thermal Matrix**: FL, FR, RL, RR tire cards with surface temp, core temp, life %, and optimal window badge.
  - **Car Systems**: ERS hybrid battery %, fuel load (kg), carbon brake temps, ICE wear %, plank wear limit.
  - **Tactical Command Dock**: Segmented Pace buttons, ERS mode buttons, tire compound selector, and high-impact Box action button.

---

### 4. Race Strategy Workspace (`src/views/StrategyWorkspace.tsx`)

- **Managed Driver Switcher**: Toggle between Lando Norris and Oscar Piastri.
- **Strategic Scenario Cards**: Plan A (1-Stop Prime Overcut), Plan B (2-Stop Sprint Undercut), and Plan C (Weather Contingency) with direct `[COMMIT STRATEGY]` button.
- **Delta & Degradation Chart**: High-contrast SVG line chart showing projected gap vs leader with pit window zone and non-overlapping lap ticks.

---

### 5. Performance Engineering / Car Lab (`src/views/CarLab.tsx`)

- **Balanced 3-Column Layout**:
  - **Left**: Front/Rear Wing Angles, Engine Cooling, Front/Rear Ride Heights with porpoising alert.
  - **Center**: Interactive 3D Showroom + live computed aero telemetry ribbon (Downforce kN, Drag Cd, Top Speed km/h, Aero Balance %).
  - **Right**: Front Brake Bias, Front/Rear Tire Pressures, Cornering vs Straightline performance radar.
- **Quick Setup Presets**: One-click `[BALANCED]`, `[HIGH DOWNFORCE]`, `[LOW DRAG]` presets.

---

### 6. Team Headquarters (`src/views/HQDashboard.tsx`)

- **Top KPI Cards**: Available Factory Budget ($42.8M), FIA Cost Cap ($92.2M / $135.0M), Constructors Championship (P1 · 312 PTS), ATR Period 2 Allowance.
- **R&D Upgrade Pipeline**: Department tabs (Aerodynamics, Chassis, Powertrain), active upgrade cards with progress bars, ETA days, and performance gain.
- **ATR Allocation Slider**: Interactive compute balance between Underfloor vs Front Wing.
- **2026 Standings & Calendar**: Complete 2026 constructors standings table and Grand Prix calendar.

---

## 3D Simulation Realism Roadmap (Upcoming Tasks)

1. **Authentic Real-World GPS Spline Circuits**: Accurate track elevation, kerb profiles, and run-off geometry for Silverstone, Spa-Francorchamps, Monza, and Monaco.
2. **PBR 3D Car Meshes**: Detailed 3D car models with carbon weave normal maps, accurate venturi sidepods, Pirelli tire sidewall decals, rotating wheels, and DRS flap opening/closing animations.
3. **Environmental FX & Audio**: Dynamic trackside engine sounds, tire screech, and rain spray particles.
