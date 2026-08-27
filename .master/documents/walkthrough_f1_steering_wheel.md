# Walkthrough: 3D Interactive F1 Steering Wheel Replica

We have engineered and integrated a photo-realistic, fully interactive 3D replica of a modern Formula 1 steering wheel (2026 FIA regulation spec). The steering wheel features molded ergonomic handgrips, carbon fiber composite weave, aluminum protective shrouds, knurled rotaries, magnetic paddle shifters, a live 4.3" OLED telemetry display, 15x progressive RGB shift LEDs, zero-latency Web Audio tactile sound feedback, and rich holographic HUD tooltips for all 28+ controls.

---

## Key Capabilities & Features

### 1. Photo-Realistic Procedural 3D Geometry
- **Main Carbon Faceplate & Monocoque Body**: Multi-bevel extruded carbon composite chassis with titanium allen mounting bolts.
- **Ergonomic Polyurethane / Alcantara Handgrips**: Sculpted left and right handgrips with textured stippling, contoured thumb shelves, and palm rests.
- **Protective Aluminum Button Bezels**: Raised safety collars around every pushbutton preventing accidental activation.
- **CNC Knurled Rotaries & Thumb Wheels**: Textured dials with colored pointer indicators and 30-degree detent steps.
- **Rear Carbon Paddle Shifters & Quick-Release Boss**: Left downshift paddle (-), right upshift paddle (+), dual analog launch clutches, and quick-release steering column boss.

### 2. Live 4.3" FIA-Spec OLED Telemetry Display & Shift LEDs
- **Dynamic 60 FPS Canvas Texture**:
  - **Page 1 (Race Main Telemetry)**: Big Gear number, Speed (km/h), RPM numerical readout, Lap Delta (electric green / crimson red), ERS battery SOC %, Brake Bias %, and active indicators.
  - **Page 2 (Tire Thermals & Pressures)**: 4-corner tire surface and core temperatures (°C) with dynamic thermal color ramp + tire pressures (PSI).
  - **Page 3 (350kW MGU-K & Energy Flow)**: Battery State of Charge bar, instantaneous MGU-K power, remaining lap MJ allocation, and fuel mass (kg).
  - **Page 4 (Active Aero & Diagnostics)**: Front wing flap angle, rear beam flap mode (Z-mode vs X-mode), and clutch bite-point calibration.
- **15x Progressive RGB Shift LEDs**: 5 Green -> 5 Red -> 5 Blue progressive lighting flashing at peak RPM rev-limiter.
- **6x FIA Flag Warning LEDs**: Left and right 3-LED warning strips illuminating with active Track Flag status (Green, Yellow, VSC, Safety Car, Red).

### 3. Full 3D Interactivity & Zero-Latency Web Audio
- **3D Raycasting & Physical Motion**:
  - Clicking any button depresses it by -3.5mm along the Z-axis with smooth spring return.
  - Turning rotaries rotates them by 30° with detent feel.
  - Pulling paddle shifters rotates them by -12° towards the wheel rim with magnetic snap release.
- **Procedural Sound Synthesis (`wheelAudioSynthesizer.ts`)**:
  - Authentic microswitch mechanical click transient + subharmonic thud.
  - Heavy mechanical rotary switch detent clunk.
  - Carbon fiber magnetic paddle shifter snap with plate resonance.
  - Pit limiter audible beeps and team radio transmission tones.

### 4. Rich Holographic Engineering HUD Tooltips
- Hovering any button, dial, or paddle displays a high-tech floating HUD tooltip providing:
  - Component Acronym & Name (`[DRS] DRS & Active Aero Override`, `[PL] Pit Lane Speed Limiter`, `[OT] ERS Overtake Boost`, `[BB+] Brake Balance Forward`, etc.).
  - Technical Category & Steering Wheel Location.
  - Real-World F1 Engineering Explanation.
  - FIA Technical / Sporting Regulation Citation.
  - In-Game Physics / Strategy Impact.
  - Live Parameter Value & Action Hint.

### 5. Dedicated Cockpit Wheel Lab & Navigation
- **Navigation Item**: Added `Cockpit Wheel` directly to the top application header.
- **7 Camera Angle Presets**:
  - `Front Full Wheel`
  - `Cockpit POV`
  - `4.3" LCD Focus`
  - `Left Thumb`
  - `Right Thumb`
  - `Rear Paddles`
  - `360° Orbit`
- **Live Sim Sync vs Test Bench Sandbox**: Switch between synchronizing with the active race physics engine or manually adjusting engine RPM, shifting gears, and testing flag alerts.
- **Keyboard Shortcuts**:
  - <kbd>SPACE</kbd>: DRS / Active Aero Toggle
  - <kbd>E</kbd> / <kbd>Shift</kbd>: Shift Up a gear
  - <kbd>Q</kbd> / <kbd>Z</kbd>: Shift Down a gear
  - <kbd>P</kbd>: Pit Lane Limiter (80 km/h)
  - <kbd>B</kbd> / <kbd>V</kbd>: Brake Bias Forward (+0.5%) / Rearward (-0.5%)
  - <kbd>R</kbd>: Team Radio
  - <kbd>1-4</kbd>: Switch LCD Display Page

---

## Verification & Validation Results

| Test / Check | Command / Procedure | Result |
| :--- | :--- | :--- |
| **SOP Protocol Validation** | `npm run sop:validate` | ✅ Passed (All logs, manifest, structure 100% compliant) |
| **ESLint Quality Check** | `npm run lint` | ✅ Passed (0 errors, 0 warnings) |
| **TypeScript & Vite Build** | `npm run build` | ✅ Passed (`tsc -b && vite build` compiled with 0 errors) |
| **3D Rendering & Geometry** | Visual inspection | ✅ Procedural carbon weave, titanium bolts, aluminum collars, molded grips |
| **3D Raycasting & Tooltips** | Hover over all 28+ controls | ✅ Instant detection, highlight ring, rich holographic HUD tooltip |
| **Audio Feedback** | Button clicks, rotary turns, paddle shifts | ✅ Zero-latency procedural Web Audio synthesis |
| **Live Physics Integration** | Adjusting BB, ERS, Pit Limiter | ✅ Connected to live 100 Hz race worker |
