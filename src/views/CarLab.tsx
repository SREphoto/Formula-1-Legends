import {
  Activity,
  AlertTriangle,
  Check,
  ChevronsDown,
  CircleGauge,
  Cpu,
  Eye,
  Layers,
  Palette,
  RotateCcw,
  Save,
  Scissors,
  ShieldCheck,
  Sliders,
  Wind,
  X,
  Zap,
} from 'lucide-react'
import { lazy, Suspense, useMemo, useState } from 'react'
import type { DriverState, SetupState } from '../types'
import { calculateAero } from '../engine/physics/AeroEngine'
import { calculatePowertrain } from '../engine/physics/PowertrainEngine'
import { F1_2026_CAR_PARTS, type CarPartMetadata, type SubsystemCategory } from '../graphics/f1_2026/carPartsData'

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
  const [selectedPart, setSelectedPart] = useState<CarPartMetadata | null>(null)
  const [manualOverrideActive, setManualOverrideActive] = useState(false)

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
        activeAeroMode,
      }),
    [setup, activeAeroMode],
  )

  const powertrain = useMemo(
    () =>
      calculatePowertrain({
        rpm: 12500,
        throttle: 1.0,
        speedMs: 83.33,
        ersMode: 'DEPLOY',
        ersStateOfCharge: 85,
        engineWearPercent: 12,
        deltaSeconds: 0.01,
        manualOverrideActive,
      }),
    [manualOverrideActive],
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
                className={`wireframe-toggle-btn ${wireframeMode ? 'active' : ''}`}
                onClick={() => setWireframeMode(!wireframeMode)}
                title="Toggle X-Ray Wireframe Mode"
              >
                <Eye size={14} /> {wireframeMode ? 'SOLID' : 'X-RAY'}
              </button>
            </div>
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
