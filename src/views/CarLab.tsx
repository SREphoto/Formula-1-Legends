import {
  Activity,
  AlertTriangle,
  Camera,
  Check,
  ChevronsDown,
  CircleGauge,
  Cpu,
  Eye,
  Flame,
  Layers,
  Palette,
  Play,
  RotateCcw,
  Save,
  Scissors,
  ShieldCheck,
  Sliders,
  Square,
  Thermometer,
  Volume2,
  VolumeX,
  Wind,
  X,
  Zap,
} from 'lucide-react'
import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import type { DriverState, SetupState } from '../types'
import { calculateAero } from '../engine/physics/AeroEngine'
import { calculatePowertrain } from '../engine/physics/PowertrainEngine'
import { F1_2026_CAR_PARTS, type CarPartMetadata, type SubsystemCategory } from '../graphics/f1_2026/carPartsData'
import type { CameraPreset, SmokeWandMode, TelemetrySyncState } from '../components/CarShowroom3D'
import { soundEngine } from '../services/soundEngine'

const CarShowroom3D = lazy(() =>
  import('../components/CarShowroom3D').then((module) => ({ default: module.CarShowroom3D })),
)

interface CarLabProps {
  selectedDriver: DriverState
  onNotify: (title: string, message: string, tone?: 'success' | 'warning') => void
}

const DEFAULT_SETUP: SetupState = {
  frontWing: 32,
  rearWing: 28,
  rideHeightFront: 18.5,
  rideHeightRear: 25.0,
  brakeBias: 56.4,
  tirePressureFront: 22.8,
  tirePressureRear: 20.6,
  cooling: 45,
}

function SetupRangeSlider({
  label,
  value,
  min,
  max,
  step = 1,
  unit,
  onChange,
  hint,
}: {
  label: string
  value: number
  min: number
  max: number
  step?: number
  unit: string
  onChange: (value: number) => void
  hint?: string
}) {
  const percentage = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100))

  return (
    <div className="setup-slider-card">
      <div className="slider-header-row">
        <div className="slider-label-block">
          <strong className="slider-title">{label}</strong>
          {hint && <small className="slider-hint">{hint}</small>}
        </div>
        <div className="slider-current-badge">
          <span>{value.toFixed(step < 1 ? 1 : 0)}</span>
          <small>{unit}</small>
        </div>
      </div>

      <div className="slider-control-row">
        <span className="bound-tag min">{min}{unit}</span>
        <div className="slider-track-wrap">
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            style={{ '--slider-fill': `${percentage}%` } as React.CSSProperties}
            className="custom-range-input"
          />
        </div>
        <span className="bound-tag max">{max}{unit}</span>
      </div>
    </div>
  )
}

export function CarLab({ selectedDriver, onNotify }: CarLabProps) {
  const [setup, setSetup] = useState<SetupState>(DEFAULT_SETUP)
  const [preset, setPreset] = useState<'balanced' | 'downforce' | 'low-drag'>('balanced')
  const [saved, setSaved] = useState(true)

  // 2026 CAD & Advanced Simulation Controls
  const [activeAeroMode, setActiveAeroMode] = useState<'CORNER' | 'STRAIGHT'>('CORNER')
  const [explodedRatio, setExplodedRatio] = useState<number>(0)
  const [explodeTarget, setExplodeTarget] = useState<'ALL' | SubsystemCategory>('ALL')
  const [subsystemFilter, setSubsystemFilter] = useState<'ALL' | SubsystemCategory>('ALL')
  const [wireframeMode, setWireframeMode] = useState(false)
  const [clippingAxis, setClippingAxis] = useState<'NONE' | 'X' | 'Y' | 'Z'>('NONE')
  const [clippingOffset, setClippingOffset] = useState<number>(0)
  const [cfdHeatmapMode, setCfdHeatmapMode] = useState(false)
  const [flirMode, setFlirMode] = useState(false)
  const [smokeWandMode, setSmokeWandMode] = useState<SmokeWandMode>('OFF')
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>('ORBIT')
  const [isWindAudioActive, setIsWindAudioActive] = useState(false)
  const [selectedPart, setSelectedPart] = useState<CarPartMetadata | null>(null)
  const [manualOverrideActive, setManualOverrideActive] = useState(false)

  // 3D Telemetry Synchronized Playback Loop
  const [telemetryPlaying, setTelemetryPlaying] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState<1 | 2 | 4>(1)
  const [lapTimeSec, setLapTimeSec] = useState(0)
  const [telemetrySyncState, setTelemetrySyncState] = useState<TelemetrySyncState>({
    active: false,
    speedKmh: 0,
    rpm: 12000,
    gear: 1,
    throttle: 0,
    brake: 0,
    ersMode: 'NEUTRAL',
    ersPowerKw: 0,
    frontHeaveMm: 0,
    rearHeaveMm: 0,
  })

  const lapProgressRef = useRef(0)

  // Keyboard shortcut listener for camera viewports
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement) return
      if (e.key === '1') setCameraPreset('FRONT_WING')
      else if (e.key === '2') setCameraPreset('COCKPIT')
      else if (e.key === '3') setCameraPreset('POWERTRAIN')
      else if (e.key === '4') setCameraPreset('DIFFUSER')
      else if (e.key === '5') setCameraPreset('ORBIT')
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  useEffect(() => {
    if (!telemetryPlaying) {
      setTelemetrySyncState((prev) => ({ ...prev, active: false }))
      return
    }

    let animationFrame = 0
    let lastTimestamp = performance.now()

    const loop = (timestamp: number) => {
      const dt = ((timestamp - lastTimestamp) / 1000) * playbackSpeed
      lastTimestamp = timestamp

      lapProgressRef.current = (lapProgressRef.current + dt) % 75 // 75 second Grand Prix hot lap
      const t = lapProgressRef.current
      setLapTimeSec(t)

      // Simulated Real-Time Grand Prix Lap Profile
      let speedKmh = 120
      let rpm = 11000
      let gear = 3
      let throttle = 0.8
      let brake = 0
      let ersMode: 'DEPLOY' | 'HARVEST' | 'NEUTRAL' = 'DEPLOY'
      const ersPowerKw = 350
      let frontHeaveMm = 0
      let rearHeaveMm = 0
      let dynamicAeroMode: 'CORNER' | 'STRAIGHT' = 'CORNER'

      if (t < 14) {
        // Sector 1: Hamilton Straight into Abbey -> Farm Curve
        speedKmh = 240 + (t / 14) * 95 // 240 -> 335 km/h
        gear = 8
        rpm = 12200 + (t / 14) * 800
        throttle = 1.0
        ersMode = 'DEPLOY'
        dynamicAeroMode = 'STRAIGHT'
        frontHeaveMm = -4.2
        rearHeaveMm = -14.5
      } else if (t < 20) {
        // Heavy Braking into Village & Loop
        const bProgress = (t - 14) / 6
        speedKmh = 335 - bProgress * 250 // 335 -> 85 km/h
        gear = 2
        rpm = 10500
        throttle = 0
        brake = 1.0
        ersMode = 'HARVEST'
        dynamicAeroMode = 'CORNER'
        frontHeaveMm = 14.8
        rearHeaveMm = -2.1
      } else if (t < 36) {
        // Acceleration through Aintree into Wellington Straight
        const aProgress = (t - 20) / 16
        speedKmh = 85 + aProgress * 255 // 85 -> 340 km/h
        gear = 8
        rpm = 12400
        throttle = 1.0
        ersMode = 'DEPLOY'
        dynamicAeroMode = 'STRAIGHT'
        frontHeaveMm = -5.0
        rearHeaveMm = -16.0
      } else if (t < 44) {
        // Brooklands & Luffield Stadium Turns
        speedKmh = 135
        gear = 4
        rpm = 11800
        throttle = 0.65
        brake = 0.15
        ersMode = 'NEUTRAL'
        dynamicAeroMode = 'CORNER'
        frontHeaveMm = 4.2
        rearHeaveMm = 6.8
      } else if (t < 58) {
        // High Speed Copse, Maggotts, Becketts Complex
        speedKmh = 278
        gear = 7
        rpm = 12700
        throttle = 0.95
        ersMode = 'DEPLOY'
        dynamicAeroMode = 'CORNER'
        frontHeaveMm = -12.0
        rearHeaveMm = -18.5
      } else {
        // Hangar Straight into Stowe & Club Chicane
        const hProgress = (t - 58) / 17
        if (hProgress < 0.65) {
          speedKmh = 260 + (hProgress / 0.65) * 85 // 260 -> 345 km/h
          gear = 8
          throttle = 1.0
          ersMode = 'DEPLOY'
          dynamicAeroMode = 'STRAIGHT'
          rearHeaveMm = -17.2
        } else {
          speedKmh = 345 - ((hProgress - 0.65) / 0.35) * 230 // Hard braking
          gear = 3
          throttle = 0
          brake = 0.95
          ersMode = 'HARVEST'
          dynamicAeroMode = 'CORNER'
          frontHeaveMm = 12.5
        }
      }

      setActiveAeroMode(dynamicAeroMode)
      setTelemetrySyncState({
        active: true,
        speedKmh,
        rpm,
        gear,
        throttle,
        brake,
        ersMode,
        ersPowerKw,
        frontHeaveMm,
        rearHeaveMm,
      })

      animationFrame = requestAnimationFrame(loop)
    }

    animationFrame = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(animationFrame)
  }, [telemetryPlaying, playbackSpeed])

  const aero = useMemo(
    () =>
      calculateAero({
        velocityMs: telemetrySyncState.active ? telemetrySyncState.speedKmh / 3.6 : 83.33,
        frontWingAngle: setup.frontWing,
        rearWingAngle: setup.rearWing,
        rideHeightFrontMm: setup.rideHeightFront,
        rideHeightRearMm: setup.rideHeightRear,
        coolingPercent: setup.cooling,
        dirtyAirEfficiency: 1,
        timeSeconds: 5.2,
        activeAeroMode,
      }),
    [setup, activeAeroMode, telemetrySyncState],
  )

  const powertrain = useMemo(
    () =>
      calculatePowertrain({
        rpm: telemetrySyncState.active ? telemetrySyncState.rpm : 12500,
        throttle: telemetrySyncState.active ? telemetrySyncState.throttle : 1.0,
        speedMs: telemetrySyncState.active ? telemetrySyncState.speedKmh / 3.6 : 83.33,
        ersMode: telemetrySyncState.active
          ? telemetrySyncState.ersMode === 'NEUTRAL'
            ? 'BALANCED'
            : telemetrySyncState.ersMode
          : 'DEPLOY',
        ersStateOfCharge: 85,
        engineWearPercent: 12,
        deltaSeconds: 0.01,
        manualOverrideActive,
      }),
    [manualOverrideActive, telemetrySyncState],
  )

  const update = <K extends keyof SetupState>(key: K, value: SetupState[K]) => {
    setSetup((current) => ({ ...current, [key]: value }))
    setSaved(false)
  }

  const applyPreset = (next: typeof preset) => {
    setPreset(next)
    const values =
      next === 'downforce'
        ? { frontWing: 42, rearWing: 38, rideHeightFront: 19.5, rideHeightRear: 27.5 }
        : next === 'low-drag'
          ? { frontWing: 18, rearWing: 16, rideHeightFront: 17.5, rideHeightRear: 23.5 }
          : { frontWing: 32, rearWing: 28, rideHeightFront: 18.5, rideHeightRear: 25.0 }
    setSetup((current) => ({ ...current, ...values }))
    setSaved(false)
    onNotify('2026 PRESET APPLIED', `${next.toUpperCase()} configuration loaded for car #${selectedDriver.number}.`, 'success')
  }

  const saveSetup = () => {
    setSaved(true)
    onNotify('2026 SETUP DEPLOYED', `Car #${selectedDriver.number} baseline configuration verified against FIA 2026 regulations.`, 'success')
  }

  return (
    <main className="workspace car-lab-workspace">
      {/* Header Bar */}
      <div className="workspace-header-bar">
        <div>
          <span className="section-eyebrow">
            FIA 2026 REGULATIONS · 3D MODULAR CAD LAB · CAR #{selectedDriver.number} {selectedDriver.code}
          </span>
          <h1 className="workspace-title">2026 Formula 1 Engineering &amp; Part-by-Part Studio</h1>
        </div>

        <div className="header-actions-deck">
          <span className={`sync-badge ${saved ? 'synced' : 'modified'}`}>
            {saved ? <Check size={14} /> : <Activity size={14} />}
            {saved ? '2026 SPEC SYNCED' : 'UNSAVED CHANGES'}
          </span>
          <button
            className="secondary-btn"
            onClick={() => {
              setSetup(DEFAULT_SETUP)
              setPreset('balanced')
              setExplodedRatio(0)
              setExplodeTarget('ALL')
              setSubsystemFilter('ALL')
              setActiveAeroMode('CORNER')
              setClippingAxis('NONE')
              setCfdHeatmapMode(false)
              setFlirMode(false)
              setSmokeWandMode('OFF')
              setCameraPreset('ORBIT')
              setIsWindAudioActive(false)
              setTelemetryPlaying(false)
              setSaved(false)
            }}
          >
            <RotateCcw size={14} /> RESET
          </button>
          <button className="primary-save-btn" onClick={saveSetup}>
            <Save size={15} /> DEPLOY SETUP
          </button>
        </div>
      </div>

      {/* Quick Setup Presets & Mode Selector */}
      <div className="presets-bar">
        <span className="presets-label"><Sliders size={14} /> 2026 BASELINE PRESETS:</span>
        <button className={`preset-pill ${preset === 'balanced' ? 'active' : ''}`} onClick={() => applyPreset('balanced')}>
          <CircleGauge size={14} />
          <span>BALANCED (MEDIUM DOWNFORCE)</span>
        </button>
        <button className={`preset-pill ${preset === 'downforce' ? 'active' : ''}`} onClick={() => applyPreset('downforce')}>
          <ChevronsDown size={14} />
          <span>HIGH DOWNFORCE (MONACO / SILVERSTONE)</span>
        </button>
        <button className={`preset-pill ${preset === 'low-drag' ? 'active' : ''}`} onClick={() => applyPreset('low-drag')}>
          <Wind size={14} />
          <span>LOW DRAG / TOP SPEED (MONZA / LAS VEGAS)</span>
        </button>
      </div>

      {/* 3-Column Engineering Layout */}
      <div className="carlab-tri-layout">
        {/* Left Column: Aero Platform & Active Wing Kinematics */}
        <section className="panel setup-section-panel">
          <div className="card-panel-header">
            <div className="header-text">
              <span className="eyebrow">AERO PLATFORM (2026)</span>
              <h2>Active Wings &amp; Underfloor</h2>
            </div>
            <Wind size={18} className="panel-icon-accent" />
          </div>

          <div className="setup-cards-stack">
            {/* Active Aero Mode Switcher */}
            <div className="active-aero-mode-card">
              <div className="mode-card-header">
                <strong>ACTIVE AERODYNAMICS (AAS)</strong>
                <span className="regulation-tag">FIA ART. 3.4 &amp; 3.9</span>
              </div>
              <div className="mode-toggle-group">
                <button
                  className={`mode-toggle-btn ${activeAeroMode === 'CORNER' ? 'active' : ''}`}
                  onClick={() => {
                    setActiveAeroMode('CORNER')
                    onNotify('AERO MODE', 'Corner Mode (Z-Mode: High Downforce) engaged.', 'success')
                  }}
                >
                  <ChevronsDown size={14} />
                  <span>CORNER MODE (Z-MODE)</span>
                </button>
                <button
                  className={`mode-toggle-btn ${activeAeroMode === 'STRAIGHT' ? 'active' : ''}`}
                  onClick={() => {
                    setActiveAeroMode('STRAIGHT')
                    onNotify('AERO MODE', 'Straight Mode (X-Mode: -45% Drag) engaged.', 'warning')
                  }}
                >
                  <Wind size={14} />
                  <span>STRAIGHT MODE (X-MODE)</span>
                </button>
              </div>
              <p className="mode-description">
                {activeAeroMode === 'CORNER'
                  ? 'High downforce configuration: Front dual active flaps closed and 3-element rear wing deployed for maximum cornering grip.'
                  : 'Low drag configuration: Front active flaps shed load (-14°) and rear wing upper element opens (+28°), cutting drag by ~45%.'}
              </p>
            </div>

            {/* Wind Tunnel Streamline Smoke Wand Inserter */}
            <div className="smoke-wand-card">
              <div className="wand-card-header">
                <div className="wand-label-block">
                  <Wind size={14} className="wand-icon" />
                  <strong>WIND TUNNEL SMOKE WANDS</strong>
                </div>
                <span className="wand-badge">PARTICLE TRACERS</span>
              </div>
              <div className="smoke-wand-pills">
                {(
                  [
                    { key: 'OFF', label: 'OFF' },
                    { key: 'ALL', label: 'ALL WANDS' },
                    { key: 'FRONT_WING', label: 'FRONT WING' },
                    { key: 'AIRBOX', label: 'AIRBOX & FIN' },
                    { key: 'FLOOR', label: 'UNDERFLOOR' },
                  ] as const
                ).map((w) => (
                  <button
                    key={w.key}
                    className={`smoke-wand-pill ${smokeWandMode === w.key ? 'active' : ''}`}
                    onClick={() => {
                      setSmokeWandMode(w.key)
                      onNotify('WIND TUNNEL SMOKE', `Streamline nozzle set to: ${w.label}`, 'success')
                    }}
                  >
                    {w.label}
                  </button>
                ))}
              </div>
            </div>

            <SetupRangeSlider
              label="Front Wing Flap Angle"
              hint="Dual-element active flap base pitch"
              value={setup.frontWing}
              min={10}
              max={50}
              unit="°"
              onChange={(val) => update('frontWing', val)}
            />

            <SetupRangeSlider
              label="Rear Wing Angle"
              hint="3-element mainplane baseline angle"
              value={setup.rearWing}
              min={10}
              max={50}
              unit="°"
              onChange={(val) => update('rearWing', val)}
            />

            <SetupRangeSlider
              label="Engine Cooling Aperture"
              hint="Sidepod louvre opening vs. drag penalty"
              value={setup.cooling}
              min={20}
              max={80}
              unit="%"
              onChange={(val) => update('cooling', val)}
            />

            <div className="separator-line" />

            <SetupRangeSlider
              label="Front Ride Height"
              hint="1450mm stepped floor entry clearance"
              value={setup.rideHeightFront}
              min={14}
              max={28}
              step={0.1}
              unit="mm"
              onChange={(val) => update('rideHeightFront', val)}
            />

            <SetupRangeSlider
              label="Rear Ride Height"
              hint="Diffuser expansion and rake angle"
              value={setup.rideHeightRear}
              min={18}
              max={36}
              step={0.1}
              unit="mm"
              onChange={(val) => update('rideHeightRear', val)}
            />

            {aero.porpoisingActive && (
              <div className="porpoising-warning-card">
                <AlertTriangle size={18} />
                <div>
                  <strong>GROUND EFFECT OSCILLATION DETECTED</strong>
                  <p>Raise front ride height above 16.5mm to restore laminar underfloor flow.</p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Center Column: 3D Modular CAD Showroom & Part Inspector */}
        <section className="panel center-showroom-panel">
          <div className="card-panel-header">
            <div className="header-text">
              <span className="eyebrow">3D MODULAR CAD SHOWROOM</span>
              <h2>2026 Vehicle Geometry &amp; Exploded View</h2>
            </div>
            <div className="cad-header-tools">
              <select
                className="part-selector-dropdown"
                value={selectedPart?.id ?? ''}
                onChange={(e) => {
                  const found = F1_2026_CAR_PARTS.find((p) => p.id === e.target.value)
                  setSelectedPart(found ?? null)
                }}
              >
                <option value="">INSPECT PART (30+ CAD COMPONENTS)...</option>
                {F1_2026_CAR_PARTS.map((p) => (
                  <option key={p.id} value={p.id}>
                    [{p.category}] {p.name}
                  </option>
                ))}
              </select>

              <button
                className={`cfd-toggle-btn ${cfdHeatmapMode ? 'active' : ''}`}
                onClick={() => {
                  setCfdHeatmapMode(!cfdHeatmapMode)
                  setFlirMode(false)
                  onNotify(
                    'CFD HEATMAP',
                    !cfdHeatmapMode
                      ? 'CFD Surface Pressure Heatmap engaged (+Cp Red Stagnation / -Cp Purple Suction).'
                      : 'Standard livery rendering restored.',
                    'success',
                  )
                }}
                title="Toggle CFD Surface Pressure Heatmap"
              >
                <Palette size={14} /> {cfdHeatmapMode ? 'CFD ACTIVE' : 'CFD HEATMAP'}
              </button>

              <button
                className={`flir-toggle-btn ${flirMode ? 'active' : ''}`}
                onClick={() => {
                  setFlirMode(!flirMode)
                  setCfdHeatmapMode(false)
                  onNotify(
                    'FLIR THERMAL IR',
                    !flirMode
                      ? 'Thermal Infrared Camera View engaged (Ironbow thermal tyre/brake imaging).'
                      : 'Standard livery rendering restored.',
                    'success',
                  )
                }}
                title="Toggle FLIR Thermal Infrared Imaging"
              >
                <Thermometer size={14} /> {flirMode ? 'FLIR ON' : 'FLIR IR'}
              </button>

              <button
                className={`audio-toggle-btn ${isWindAudioActive ? 'active' : ''}`}
                onClick={() => {
                  if (!soundEngine.getIsRunning()) soundEngine.start()
                  setIsWindAudioActive(!isWindAudioActive)
                  onNotify(
                    'AERO SOUND',
                    !isWindAudioActive
                      ? 'Aeroacoustic Wind Tunnel synthesis active.'
                      : 'Wind audio muted.',
                    'success',
                  )
                }}
                title="Toggle Aeroacoustic Wind Tunnel Audio"
              >
                {isWindAudioActive ? <Volume2 size={14} /> : <VolumeX size={14} />}
                <span>{isWindAudioActive ? 'WIND ON' : 'WIND AUDIO'}</span>
              </button>

              <button
                className={`wireframe-toggle-btn ${wireframeMode ? 'active' : ''}`}
                onClick={() => setWireframeMode(!wireframeMode)}
                title="Toggle X-Ray Wireframe Mode"
              >
                <Eye size={14} /> {wireframeMode ? 'SOLID' : 'X-RAY'}
              </button>
            </div>
          </div>

          {/* Camera Viewport Director Bar */}
          <div className="camera-director-bar">
            <span className="camera-director-label"><Camera size={13} /> VIEWPORT (KEYS 1-5):</span>
            {(
              [
                { key: 'ORBIT', label: '5: 360° ORBIT' },
                { key: 'FRONT_WING', label: '1: FRONT WING' },
                { key: 'COCKPIT', label: '2: COCKPIT' },
                { key: 'POWERTRAIN', label: '3: POWER UNIT' },
                { key: 'DIFFUSER', label: '4: DIFFUSER' },
              ] as const
            ).map((cam) => (
              <button
                key={cam.key}
                className={`cam-director-pill ${cameraPreset === cam.key ? 'active' : ''}`}
                onClick={() => setCameraPreset(cam.key)}
              >
                {cam.label}
              </button>
            ))}
          </div>

          {/* Subsystem Isolation Filter Tabs */}
          <div className="subsystem-filter-tabs">
            {(
              [
                { key: 'ALL', label: 'FULL CAR' },
                { key: 'AERO', label: 'AERODYNAMICS' },
                { key: 'POWERTRAIN', label: 'POWERTRAIN' },
                { key: 'CHASSIS', label: 'CHASSIS & SAFETY' },
                { key: 'SUSPENSION', label: 'SUSPENSION & BRAKES' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.key}
                className={`subsystem-tab-btn ${subsystemFilter === tab.key ? 'active' : ''}`}
                onClick={() => setSubsystemFilter(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Multi-Axis Targeted Exploded View & Clipping Plane Toolbar */}
          <div className="cad-exploded-toolbar">
            <div className="exploded-label-row">
              <div className="explode-target-deck">
                <span><Layers size={14} /> EXPLODE TARGET:</span>
                {(
                  [
                    { key: 'ALL', label: 'ALL' },
                    { key: 'AERO', label: 'AERO' },
                    { key: 'POWERTRAIN', label: 'PU' },
                    { key: 'CHASSIS', label: 'CHASSIS' },
                    { key: 'SUSPENSION', label: 'SUSP' },
                  ] as const
                ).map((item) => (
                  <button
                    key={item.key}
                    className={`explode-target-pill ${explodeTarget === item.key ? 'active' : ''}`}
                    onClick={() => setExplodeTarget(item.key)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              <strong>{Math.round(explodedRatio * 100)}% DISASSEMBLY</strong>
            </div>

            <div className="exploded-slider-row">
              <button className="ratio-quick-pill" onClick={() => setExplodedRatio(0)}>0% (ASSEMBLED)</button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={explodedRatio}
                onChange={(e) => setExplodedRatio(Number(e.target.value))}
                className="exploded-range-input"
              />
              <button className="ratio-quick-pill" onClick={() => setExplodedRatio(0.5)}>50% (INSPECT)</button>
              <button className="ratio-quick-pill" onClick={() => setExplodedRatio(1.0)}>100% (EXPLODE)</button>
            </div>

            {/* Interactive Cross-Section CAD Clipping Plane Controls */}
            <div className="clipping-controls-deck">
              <div className="clipping-axis-buttons">
                <span className="clipping-label"><Scissors size={13} /> CROSS-SECTION CUT:</span>
                {(
                  [
                    { key: 'NONE', label: 'OFF' },
                    { key: 'X', label: 'X: SAGITTAL' },
                    { key: 'Y', label: 'Y: FLOOR/TOP' },
                    { key: 'Z', label: 'Z: TRANSVERSE' },
                  ] as const
                ).map((axis) => (
                  <button
                    key={axis.key}
                    className={`clipping-axis-pill ${clippingAxis === axis.key ? 'active' : ''}`}
                    onClick={() => {
                      setClippingAxis(axis.key)
                      if (axis.key === 'NONE') setClippingOffset(0)
                    }}
                  >
                    {axis.label}
                  </button>
                ))}
              </div>

              {clippingAxis !== 'NONE' && (
                <div className="clipping-slider-deck">
                  <span className="clipping-offset-badge">
                    CUT OFFSET: {clippingOffset > 0 ? '+' : ''}{clippingOffset.toFixed(2)}m
                  </span>
                  <input
                    type="range"
                    min={clippingAxis === 'X' ? -1.2 : clippingAxis === 'Y' ? -0.4 : -2.4}
                    max={clippingAxis === 'X' ? 1.2 : clippingAxis === 'Y' ? 1.4 : 2.4}
                    step={0.02}
                    value={clippingOffset}
                    onChange={(e) => setClippingOffset(Number(e.target.value))}
                    className="clipping-range-input"
                  />
                  <button className="ratio-quick-pill" onClick={() => setClippingOffset(0)}>CENTER (0.00m)</button>
                </div>
              )}
            </div>
          </div>

          <div className="carlab-3d-stage">
            <Suspense
              fallback={
                <div className="scene-loader">
                  <i />
                  <strong>LOADING 2026 MODULAR CAD MODEL</strong>
                  <span>Assembling 30+ precision FIA components…</span>
                </div>
              }
            >
              <CarShowroom3D
                primaryColor={selectedDriver.teamColor}
                accentColor={selectedDriver.secondaryColor}
                frontBalance={aero.frontBalancePercent}
                downforceKn={aero.downforceN / 1000}
                porpoising={aero.porpoisingActive}
                explodedRatio={explodedRatio}
                explodeTarget={explodeTarget}
                activeAeroMode={activeAeroMode}
                subsystemFilter={subsystemFilter}
                wireframeMode={wireframeMode}
                clippingAxis={clippingAxis}
                clippingOffset={clippingOffset}
                cfdHeatmapMode={cfdHeatmapMode}
                flirMode={flirMode}
                smokeWandMode={smokeWandMode}
                cameraPreset={cameraPreset}
                isWindAudioActive={isWindAudioActive}
                telemetrySync={telemetrySyncState}
                onSelectPart={(part) => setSelectedPart(part)}
              />
            </Suspense>

            {/* CFD Pressure Heatmap Legend Bar */}
            {cfdHeatmapMode && (
              <div className="cfd-pressure-legend-bar">
                <div className="legend-label">CFD PRESSURE GRADIENT (Cp)</div>
                <div className="legend-gradient-strip" />
                <div className="legend-bounds">
                  <span>+1.0 (STAGNATION RED)</span>
                  <span>0.0 (FREE STREAM)</span>
                  <span>-2.5 (SUCTION PURPLE)</span>
                </div>
              </div>
            )}

            {/* FLIR Thermal Camera Legend Bar */}
            {flirMode && (
              <div className="flir-thermal-legend-bar">
                <div className="flir-legend-title">
                  <Flame size={12} /> FLIR IRONBOW THERMAL SPECTRUM
                </div>
                <div className="flir-gradient-strip" />
                <div className="flir-bounds">
                  <span>COLD BODY &lt;40°C</span>
                  <span>TYRE TREAD 100°C</span>
                  <span>BRAKE DISC &gt;850°C</span>
                </div>
              </div>
            )}

            {/* Selected Component Technical Drawer Modal */}
            {selectedPart && (
              <div className="part-spec-overlay-card">
                <div className="spec-card-header">
                  <div>
                    <span className="spec-eyebrow">{selectedPart.category} · {selectedPart.subsystem}</span>
                    <h3 className="spec-title">{selectedPart.name}</h3>
                  </div>
                  <button className="close-spec-btn" onClick={() => setSelectedPart(null)}>
                    <X size={16} />
                  </button>
                </div>
                <div className="spec-metrics-grid">
                  <div className="spec-stat">
                    <span>REGULATION</span>
                    <strong>{selectedPart.fiaArticle}</strong>
                  </div>
                  <div className="spec-stat">
                    <span>MASS</span>
                    <strong>{selectedPart.massKg} kg</strong>
                  </div>
                  <div className="spec-stat">
                    <span>DIMENSIONS</span>
                    <strong>{selectedPart.dimensionsMm} mm</strong>
                  </div>
                </div>
                <div className="spec-material-block">
                  <span className="material-label">MATERIAL COMPOSITION:</span>
                  <p className="material-value">{selectedPart.material}</p>
                </div>
                <p className="spec-description">{selectedPart.description}</p>
                <div className="spec-features-list">
                  {selectedPart.keyFeatures.map((feature, idx) => (
                    <div key={idx} className="feature-item">
                      <Check size={12} className="feature-check" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 3D Telemetry Synchronized Playback Deck Toolbar */}
          <div className="telemetry-playback-deck">
            <div className="telemetry-playback-controls">
              <button
                className={`telemetry-play-btn ${telemetryPlaying ? 'playing' : ''}`}
                onClick={() => {
                  setTelemetryPlaying(!telemetryPlaying)
                  onNotify(
                    'TELEMETRY SYNC',
                    !telemetryPlaying
                      ? 'Live Hot Lap Telemetry loop active: Driving suspension heave, wheel spin, active wings & MGU-K energy flows.'
                      : 'Live Telemetry loop paused.',
                    'success',
                  )
                }}
              >
                {telemetryPlaying ? <Square size={13} /> : <Play size={13} />}
                <span>{telemetryPlaying ? 'PAUSE TELEMETRY' : 'PLAY LIVE HOT LAP SIMULATION'}</span>
              </button>

              <div className="playback-speed-group">
                <span className="speed-label">SPEED:</span>
                {([1, 2, 4] as const).map((speed) => (
                  <button
                    key={speed}
                    className={`speed-pill ${playbackSpeed === speed ? 'active' : ''}`}
                    onClick={() => setPlaybackSpeed(speed)}
                  >
                    {speed}x
                  </button>
                ))}
              </div>
            </div>

            {/* Interactive Telemetry Lap Trace Mini-Graph */}
            {telemetryPlaying && (
              <div className="telemetry-trace-graph-card">
                <div className="trace-graph-header">
                  <span>SILVERSTONE GRAND PRIX · HOT LAP TRACE ({lapTimeSec.toFixed(1)}s / 75.0s)</span>
                  <div className="trace-legends">
                    <span className="leg speed">● SPEED (KM/H)</span>
                    <span className="leg throttle">● THROTTLE</span>
                    <span className="leg brake">● BRAKE</span>
                  </div>
                </div>
                <div className="trace-graph-canvas-wrap">
                  <svg className="trace-svg" viewBox="0 0 400 48" preserveAspectRatio="none">
                    {/* Grid lines */}
                    <line x1="0" y1="24" x2="400" y2="24" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
                    {/* Simulated Speed curve */}
                    <path
                      d="M 0,32 Q 35,4 75,4 L 80,42 Q 100,42 120,4 L 180,4 Q 210,38 230,38 L 290,6 Q 320,6 340,42 Q 370,42 400,16"
                      fill="none"
                      stroke="#38bdf8"
                      strokeWidth="2"
                    />
                    {/* Live Scrubber Cursor */}
                    <line
                      x1={(lapTimeSec / 75) * 400}
                      y1="0"
                      x2={(lapTimeSec / 75) * 400}
                      y2="48"
                      stroke="#ff3b30"
                      strokeWidth="2"
                    />
                  </svg>
                </div>
              </div>
            )}

            {/* Live Calculated Aero & Telemetry Ribbon */}
            <div className="aero-metrics-ribbon">
              <div className="aero-stat">
                <span className="stat-label">TOTAL DOWNFORCE</span>
                <strong className="stat-value">{(aero.downforceN / 1000).toFixed(1)} <small>kN</small></strong>
              </div>
              <div className="aero-stat">
                <span className="stat-label">DRAG COEFFICIENT</span>
                <strong className="stat-value">{aero.cdTotal.toFixed(2)} <small>Cd</small></strong>
              </div>
              <div className="aero-stat">
                <span className="stat-label">DRAG SHEDDING</span>
                <strong className={`stat-value ${activeAeroMode === 'STRAIGHT' ? 'highlight-green' : ''}`}>
                  {activeAeroMode === 'STRAIGHT' ? `-${aero.dragReductionPercent.toFixed(1)}%` : '0.0%'}
                </strong>
              </div>
              <div className="aero-stat">
                <span className="stat-label">EST. TOP SPEED</span>
                <strong className="stat-value highlight">{aero.topSpeedEstimateKmh.toFixed(0)} <small>KM/H</small></strong>
              </div>
              <div className="aero-stat">
                <span className="stat-label">AERO BALANCE</span>
                <strong className="stat-value">{aero.frontBalancePercent.toFixed(1)}% <small>FRONT</small></strong>
              </div>
            </div>
          </div>
        </section>

        {/* Right Column: 2026 Hybrid Power Unit & Mechanical Platform */}
        <section className="panel setup-section-panel">
          <div className="card-panel-header">
            <div className="header-text">
              <span className="eyebrow">HYBRID PU &amp; MECHANICAL</span>
              <h2>350kW MGU-K &amp; Suspension</h2>
            </div>
            <Cpu size={18} className="panel-icon-accent" />
          </div>

          <div className="setup-cards-stack">
            {/* 2026 Power Unit Specs Card */}
            <div className="pu-2026-summary-card">
              <div className="pu-card-header">
                <strong>2026 HYBRID POWER UNIT (PU2026)</strong>
                <span className="power-total-badge">{powertrain.totalPowerBhp.toFixed(0)} BHP</span>
              </div>
              <div className="pu-power-split-grid">
                <div className="pu-split-stat">
                  <span>1.6L V6 TURBO ICE</span>
                  <strong>{powertrain.icePowerKw.toFixed(0)} kW <small>(536 bhp)</small></strong>
                </div>
                <div className="pu-split-stat">
                  <span>350 kW MGU-K HYBRID</span>
                  <strong>{powertrain.mguKPowerKw.toFixed(0)} kW <small>(470 bhp)</small></strong>
                </div>
              </div>

              {/* Manual Override Mode (Overtake Boost) Test Button */}
              <button
                className={`override-boost-btn ${manualOverrideActive ? 'active' : ''}`}
                onClick={() => {
                  setManualOverrideActive(!manualOverrideActive)
                  onNotify(
                    'OVERTAKE BOOST',
                    !manualOverrideActive
                      ? 'Manual Override Mode active: Full 350kW deployment sustained up to 337 km/h.'
                      : 'Standard speed-tapered deployment restored.',
                    !manualOverrideActive ? 'warning' : 'success',
                  )
                }}
              >
                <Zap size={15} />
                <span>{manualOverrideActive ? 'MANUAL OVERRIDE (MOM) ENGAGED' : 'ENGAGE MANUAL OVERRIDE (350kW BOOST)'}</span>
              </button>
            </div>

            <SetupRangeSlider
              label="Front Brake Bias"
              hint="BBW regenerative torque blending"
              value={setup.brakeBias}
              min={50}
              max={62}
              step={0.2}
              unit="%"
              onChange={(val) => update('brakeBias', val)}
            />

            <SetupRangeSlider
              label="Front Tyre Pressure"
              hint="2026 narrow 280mm spec tyre patch"
              value={setup.tirePressureFront}
              min={20}
              max={26}
              step={0.1}
              unit="psi"
              onChange={(val) => update('tirePressureFront', val)}
            />

            <SetupRangeSlider
              label="Rear Tyre Pressure"
              hint="2026 narrow 375mm spec traction patch"
              value={setup.tirePressureRear}
              min={19}
              max={24}
              step={0.1}
              unit="psi"
              onChange={(val) => update('tirePressureRear', val)}
            />

            {/* 2026 FIA Regulation Compliance Checklist */}
            <div className="compliance-checklist-card">
              <div className="compliance-header">
                <ShieldCheck size={16} className="compliance-icon" />
                <strong>2026 FIA REGULATORY COMPLIANCE</strong>
              </div>
              <div className="compliance-grid">
                <div className="compliance-row">
                  <span>Wheelbase: 3,400 mm (-200mm)</span>
                  <span className="pass-pill"><Check size={12} /> PASS</span>
                </div>
                <div className="compliance-row">
                  <span>Max Width: 1,900 mm (-100mm)</span>
                  <span className="pass-pill"><Check size={12} /> PASS</span>
                </div>
                <div className="compliance-row">
                  <span>Floor Width: 1,450 mm (-150mm)</span>
                  <span className="pass-pill"><Check size={12} /> PASS</span>
                </div>
                <div className="compliance-row">
                  <span>Min Mass: 768 kg (-30kg)</span>
                  <span className="pass-pill"><Check size={12} /> PASS</span>
                </div>
                <div className="compliance-row">
                  <span>MGU-K Output: 350 kW (3x Boost)</span>
                  <span className="pass-pill"><Check size={12} /> PASS</span>
                </div>
                <div className="compliance-row">
                  <span>Fuel: 100% Sustainable E-Fuel</span>
                  <span className="pass-pill"><Check size={12} /> PASS</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
