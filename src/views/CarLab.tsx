import {
  Activity,
  AlertTriangle,
  Check,
  ChevronsDown,
  CircleGauge,
  RotateCcw,
  Save,
  Sliders,
  Wind,
  Wrench,
} from 'lucide-react'
import { lazy, Suspense, useMemo, useState } from 'react'
import type { DriverState, SetupState } from '../types'
import { calculateAero } from '../engine/physics/AeroEngine'

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
  rideHeightFront: 19.2,
  rideHeightRear: 27.4,
  brakeBias: 56.8,
  tirePressureFront: 23.2,
  tirePressureRear: 21.0,
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

  const aero = useMemo(
    () =>
      calculateAero({
        velocityMs: 83.33,
        frontWingAngle: setup.frontWing,
        rearWingAngle: setup.rearWing,
        rideHeightFrontMm: setup.rideHeightFront,
        rideHeightRearMm: setup.rideHeightRear,
        coolingPercent: setup.cooling,
        dirtyAirEfficiency: 1,
        timeSeconds: 5.2,
      }),
    [setup],
  )

  const update = <K extends keyof SetupState>(key: K, value: SetupState[K]) => {
    setSetup((current) => ({ ...current, [key]: value }))
    setSaved(false)
  }

  const applyPreset = (next: typeof preset) => {
    setPreset(next)
    const values =
      next === 'downforce'
        ? { frontWing: 40, rearWing: 38, rideHeightFront: 20.5, rideHeightRear: 29 }
        : next === 'low-drag'
          ? { frontWing: 20, rearWing: 17, rideHeightFront: 18.5, rideHeightRear: 25 }
          : { frontWing: 32, rearWing: 28, rideHeightFront: 19.2, rideHeightRear: 27.4 }
    setSetup((current) => ({ ...current, ...values }))
    setSaved(false)
    onNotify('PRESET APPLIED', `${next.toUpperCase()} setup loaded for car #${selectedDriver.number}.`, 'success')
  }

  const saveSetup = () => {
    setSaved(true)
    onNotify('SETUP SAVED', `Car #${selectedDriver.number} baseline setup deployed for Silverstone.`, 'success')
  }

  return (
    <main className="workspace car-lab-workspace">
      {/* Header Bar */}
      <div className="workspace-header-bar">
        <div>
          <span className="section-eyebrow">AERODYNAMICS &amp; VEHICLE DYNAMICS · CAR #{selectedDriver.number} {selectedDriver.code}</span>
          <h1 className="workspace-title">Performance Engineering &amp; Setup Lab</h1>
        </div>

        <div className="header-actions-deck">
          <span className={`sync-badge ${saved ? 'synced' : 'modified'}`}>
            {saved ? <Check size={14} /> : <Activity size={14} />}
            {saved ? 'SETUP SYNCED' : 'UNSAVED CHANGES'}
          </span>
          <button
            className="secondary-btn"
            onClick={() => {
              setSetup(DEFAULT_SETUP)
              setPreset('balanced')
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

      {/* Quick Setup Presets */}
      <div className="presets-bar">
        <span className="presets-label"><Sliders size={14} /> BASELINE PRESETS:</span>
        <button className={`preset-pill ${preset === 'balanced' ? 'active' : ''}`} onClick={() => applyPreset('balanced')}>
          <CircleGauge size={14} />
          <span>BALANCED (DEFAULT)</span>
        </button>
        <button className={`preset-pill ${preset === 'downforce' ? 'active' : ''}`} onClick={() => applyPreset('downforce')}>
          <ChevronsDown size={14} />
          <span>HIGH DOWNFORCE (MONACO / SILVERSTONE)</span>
        </button>
        <button className={`preset-pill ${preset === 'low-drag' ? 'active' : ''}`} onClick={() => applyPreset('low-drag')}>
          <Wind size={14} />
          <span>LOW DRAG / TOP SPEED (MONZA)</span>
        </button>
      </div>

      {/* 3-Column Engineering Layout */}
      <div className="carlab-tri-layout">
        {/* Left Column: Aero Platform & Ground Effect */}
        <section className="panel setup-section-panel">
          <div className="card-panel-header">
            <div className="header-text">
              <span className="eyebrow">AERO PLATFORM</span>
              <h2>Wings &amp; Underfloor</h2>
            </div>
            <Wind size={18} className="panel-icon-accent" />
          </div>

          <div className="setup-cards-stack">
            <SetupRangeSlider
              label="Front Wing Flap Angle"
              hint="Increases front-end grip; adds slight drag"
              value={setup.frontWing}
              min={10}
              max={50}
              unit="°"
              onChange={(val) => update('frontWing', val)}
            />

            <SetupRangeSlider
              label="Rear Wing Angle"
              hint="High-speed rear stability and braking grip"
              value={setup.rearWing}
              min={10}
              max={50}
              unit="°"
              onChange={(val) => update('rearWing', val)}
            />

            <SetupRangeSlider
              label="Engine Cooling Aperture"
              hint="Controls thermal limits vs. aerodynamic drag"
              value={setup.cooling}
              min={20}
              max={80}
              unit="%"
              onChange={(val) => update('cooling', val)}
            />

            <div className="separator-line" />

            <SetupRangeSlider
              label="Front Ride Height"
              hint="Feeds Venturi tunnels — critical for ground effect"
              value={setup.rideHeightFront}
              min={15}
              max={30}
              step={0.1}
              unit="mm"
              onChange={(val) => update('rideHeightFront', val)}
            />

            <SetupRangeSlider
              label="Rear Ride Height"
              hint="Controls diffuser expansion ratio and rake"
              value={setup.rideHeightRear}
              min={20}
              max={40}
              step={0.1}
              unit="mm"
              onChange={(val) => update('rideHeightRear', val)}
            />

            {aero.porpoisingActive && (
              <div className="porpoising-warning-card">
                <AlertTriangle size={18} />
                <div>
                  <strong>PORPOISING OSCILLATION DETECTED</strong>
                  <p>Floor boundary layer separation. Raise front ride height above 20.0mm.</p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Center Column: 3D Car Showroom & Live Telemetry Output */}
        <section className="panel center-showroom-panel">
          <div className="card-panel-header">
            <div className="header-text">
              <span className="eyebrow">3D AERO SIMULATION</span>
              <h2>Vehicle Geometry &amp; CFD Flow</h2>
            </div>
            <span className="live-status-chip"><i /> 3D LIVE</span>
          </div>

          <div className="carlab-3d-stage">
            <Suspense
              fallback={
                <div className="scene-loader">
                  <i />
                  <strong>INITIALIZING 3D SHOWROOM</strong>
                  <span>Loading wind tunnel particles &amp; chassis…</span>
                </div>
              }
            >
              <CarShowroom3D
                primaryColor={selectedDriver.teamColor}
                accentColor={selectedDriver.secondaryColor}
                frontBalance={aero.frontBalancePercent}
                downforceKn={aero.downforceN / 1000}
                porpoising={aero.porpoisingActive}
              />
            </Suspense>
          </div>

          {/* Live Calculated Aero Telemetry Bar */}
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
              <span className="stat-label">EST. TOP SPEED</span>
              <strong className="stat-value highlight">{aero.topSpeedEstimateKmh.toFixed(0)} <small>KM/H</small></strong>
            </div>
            <div className="aero-stat">
              <span className="stat-label">AERO BALANCE</span>
              <strong className="stat-value">{aero.frontBalancePercent.toFixed(1)}% <small>FRONT</small></strong>
            </div>
          </div>
        </section>

        {/* Right Column: Mechanical, Brakes & Tires */}
        <section className="panel setup-section-panel">
          <div className="card-panel-header">
            <div className="header-text">
              <span className="eyebrow">MECHANICAL PLATFORM</span>
              <h2>Brakes &amp; Tire Pressures</h2>
            </div>
            <Wrench size={18} className="panel-icon-accent" />
          </div>

          <div className="setup-cards-stack">
            <SetupRangeSlider
              label="Front Brake Bias"
              hint="Higher front bias improves straight braking stability"
              value={setup.brakeBias}
              min={50}
              max={62}
              step={0.2}
              unit="%"
              onChange={(val) => update('brakeBias', val)}
            />

            <SetupRangeSlider
              label="Front Tire Pressure"
              hint="Controls contact patch size and steering response"
              value={setup.tirePressureFront}
              min={20}
              max={26}
              step={0.1}
              unit="psi"
              onChange={(val) => update('tirePressureFront', val)}
            />

            <SetupRangeSlider
              label="Rear Tire Pressure"
              hint="Controls traction out of slow corners"
              value={setup.tirePressureRear}
              min={19}
              max={24}
              step={0.1}
              unit="psi"
              onChange={(val) => update('tirePressureRear', val)}
            />

            {/* Platform Performance Radar */}
            <div className="performance-summary-box">
              <div className="summary-row">
                <span>CORNERING EFFICIENCY</span>
                <strong className="positive-text">HIGH (94/100)</strong>
              </div>
              <div className="performance-bar">
                <div className="fill-bar" style={{ width: '94%' }} />
              </div>

              <div className="summary-row mt">
                <span>STRAIGHTLINE SPEED</span>
                <strong>{aero.topSpeedEstimateKmh > 325 ? 'VERY HIGH' : 'MODERATE'} ({Math.round(aero.topSpeedEstimateKmh / 3.4)}/100)</strong>
              </div>
              <div className="performance-bar">
                <div className="fill-bar orange" style={{ width: `${Math.min(100, Math.round(aero.topSpeedEstimateKmh / 3.4))}%` }} />
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
