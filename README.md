# Formula 1 Legends

A high-density Formula racing management simulator built with React, TypeScript, Vite, and a deterministic Web Worker simulation.

## Features

- **100 Hz race simulation** in a dedicated Web Worker with 10 Hz telemetry delivery
- Live timing tower and animated Silverstone circuit map for a 20-driver legends grid
- Driver telemetry with two-layer tyre temperatures, wear, ERS, fuel, brakes, and plank wear
- Interactive pace, ERS, tyre, and pit-stop commands
- Strategy workspace with pit-window, stint, weather, traffic, and outcome projections
- Car setup lab backed by aerodynamic and ground-effect equations
- Team HQ with cost-cap, ATR, R&D, facility, calendar, and championship views
- Responsive, bespoke motorsport command-center interface

## Run locally

```bash
npm install
npm run dev
```

The Vite development server runs on `http://localhost:5173`.

## GitHub Pages

The production build is committed in `/docs` and configured for:

**https://srephoto.github.io/Formula-1-Legends/**

In the repository's **Settings → Pages** screen, choose **Deploy from a branch**, select the published branch and the `/docs` folder. After this branch is merged, use `main` and `/docs`.

## Quality checks

```bash
npm run lint
npm run build
```

## Architecture

```text
src/
├── components/          # Race HUD and shared controls
├── data/                # Driver grid and championship seed data
├── engine/
│   ├── physics/         # Aero, tyre thermodynamics, and powertrain models
│   └── workers/         # Deterministic 100 Hz race worker
├── hooks/               # Worker lifecycle and telemetry subscription
├── utils/               # Display formatting helpers
└── views/               # Race, strategy, car lab, and team HQ workspaces
```
