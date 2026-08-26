import {
  Activity,
  AirVent,
  ArrowDown,
  Check,
  ChevronsDown,
  CircleGauge,
  CloudCog,
  Fan,
  Gauge,
  RotateCcw,
  Save,
  ShieldCheck,
  Sparkles,
  ThermometerSun,
  Wind,
  Wrench,
} from 'lucide-react'
import { lazy, Suspense, useMemo, useState } from 'react'
import type { DriverState, SetupState } from '../types'
import { calculateAero } from '../engine/physics/AeroEngine'

const CarShowroom3D = lazy(() => import('../components/CarShowroom3D').then((module) => ({ default: module.CarShowroom3D })))

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

function SetupSlider({ label, value, min, max, step = 1, unit, onChange, hint }: { label: string; value: number; min: number; max: number; step?: number; unit: string; onChange: (value: number) => void; hint?: string }) {
  const percentage = ((value - min) / (max - min)) * 100
  return (
    <label className="setup-slider">
      <span className="setup-slider-head"><span>{label}<small>{hint}</small></span><b>{value.toFixed(step < 1 ? 1 : 0)}<em>{unit}</em></b></span>
      <div className="slider-shell">
        <input type="range" min={min} max={max} step={step} value={value} onChange={(event) => onChange(Number(event.target.value))} style={{ '--slider-fill': `${percentage}%` } as React.CSSProperties} />
        <div className="slider-ticks"><i /><i /><i /><i /><i /></div>
      </div>
      <span className="slider-range"><i>{min}{unit}</i><i>{max}{unit}</i></span>
    </label>
  )
}

export function CarLab({ selectedDriver, onNotify }: CarLabProps) {
  const [setup, setSetup] = useState(DEFAULT_SETUP)
  const [preset, setPreset] = useState<'balanced' | 'downforce' | 'low-drag'>('balanced')
  const [saved, setSaved] = useState(true)

  const aero = useMemo(() => calculateAero({
    velocityMs: 83.33,
    frontWingAngle: setup.frontWing,
    rearWingAngle: setup.rearWing,
    rideHeightFrontMm: setup.rideHeightFront,
    rideHeightRearMm: setup.rideHeightRear,
    coolingPercent: setup.cooling,
    dirtyAirEfficiency: 1,
    timeSeconds: 5.2,
  }), [setup])

  const update = <K extends keyof SetupState>(key: K, value: SetupState[K]) => {
    setSetup((current) => ({ ...current, [key]: value }))
    setSaved(false)
  }

  const applyPreset = (next: typeof preset) => {
    setPreset(next)
    const values = next === 'downforce'
      ? { frontWing: 40, rearWing: 38, rideHeightFront: 20.5, rideHeightRear: 29 }
      : next === 'low-drag'
        ? { frontWing: 20, rearWing: 17, rideHeightFront: 18.5, rideHeightRear: 25 }
        : { frontWing: 32, rearWing: 28, rideHeightFront: 19.2, rideHeightRear: 27.4 }
    setSetup((current) => ({ ...current, ...values }))
    setSaved(false)
  }

  const saveSetup = () => {
    setSaved(true)
    onNotify('SETUP SAVED', `Car ${selectedDriver.number} baseline updated for Silverstone.`, 'success')
  }

  const balanceDelta = aero.frontBalancePercent - 45.5
  const cornerScore = Math.min(100, 74 + aero.clTotal * 3.4)
  const straightScore = Math.min(100, 64 + (aero.topSpeedEstimateKmh - 280) * 0.55)

  return (
    <main className="workspace car-lab-workspace">
      <div className="workspace-heading car-lab-heading">
        <div>
          <span className="eyebrow">SETUP LAB · SILVERSTONE · CAR {selectedDriver.number}</span>
          <h1>Performance engineering</h1>
          <p>Configure the aerodynamic platform and validate it against the live physics model.</p>
        </div>
        <div className="setup-status-actions">
          <span className={`save-state ${saved ? 'saved' : ''}`}>{saved ? <Check size={13} /> : <Activity size={13} />}{saved ? 'SETUP SYNCED' : 'UNSAVED CHANGES'}</span>
          <button className="secondary-action" onClick={() => { setSetup(DEFAULT_SETUP); setPreset('balanced'); setSaved(false) }}><RotateCcw size={14} /> RESET</button>
          <button className="primary-action" onClick={saveSetup}><Save size={14} /> SAVE SETUP</button>
        </div>
      </div>

      <div className="setup-presets">
        <span>QUICK PRESETS</span>
        <button className={preset === 'balanced' ? 'active' : ''} onClick={() => applyPreset('balanced')}><CircleGauge size={14} /><span><b>BALANCED</b><small>Recommended</small></span></button>
        <button className={preset === 'downforce' ? 'active' : ''} onClick={() => applyPreset('downforce')}><ChevronsDown size={14} /><span><b>HIGH DOWNFORCE</b><small>Corner priority</small></span></button>
        <button className={preset === 'low-drag' ? 'active' : ''} onClick={() => applyPreset('low-drag')}><Wind size={14} /><span><b>LOW DRAG</b><small>Straight priority</small></span></button>
        <div className="setup-confidence-chip"><Sparkles size={14} /><span><small>SETUP CONFIDENCE</small><b>91%</b></span></div>
      </div>

      <div className="car-lab-grid">
        <section className="panel setup-controls-panel">
          <div className="workspace-panel-title"><div><span className="eyebrow">CAR 12 · SPEC B</span><h2>Setup parameters</h2></div><Wrench size={16} /></div>

          <div className="setup-control-group">
            <div className="control-group-title"><span><AirVent size={14} /> AERODYNAMICS</span><small>GRIP VS TOP SPEED</small></div>
            <p className="control-group-about">Wings add cornering grip but slow the straights. Cooling protects the engine at a cost in top speed.</p>
            <SetupSlider label="Front wing" hint="More wing — sharper steering, slower straights" value={setup.frontWing} min={10} max={50} unit="°" onChange={(value) => update('frontWing', value)} />
            <SetupSlider label="Rear wing" hint="More wing — steadier rear, slower straights" value={setup.rearWing} min={10} max={50} unit="°" onChange={(value) => update('rearWing', value)} />
            <SetupSlider label="Cooling aperture" hint="Open it to run cooler, at a cost in top speed" value={setup.cooling} min={20} max={80} unit="%" onChange={(value) => update('cooling', value)} />
          </div>

          <div className="setup-control-group">
            <div className="control-group-title"><span><ArrowDown size={14} /> PLATFORM</span><small>UNDERFLOOR</small></div>
            <p className="control-group-about">Ride height feeds the underfloor. Run low for free grip — too low and the car starts bouncing (porpoising).</p>
            <SetupSlider label="Front ride height" hint="Lower is faster until the floor starts bouncing" value={setup.rideHeightFront} min={15} max={30} step={0.1} unit="mm" onChange={(value) => update('rideHeightFront', value)} />
            <SetupSlider label="Rear ride height" hint="A higher rear stance helps the floor make grip" value={setup.rideHeightRear} min={20} max={40} step={0.1} unit="mm" onChange={(value) => update('rideHeightRear', value)} />
            {aero.porpoisingActive && <div className="setup-warning"><Activity size={14} /><span><b>PORPOISING DETECTED</b><small>Raise front ride height above 20.0 mm to recover floor stability.</small></span></div>}
          </div>

          <div className="setup-control-group compact-group">
            <div className="control-group-title"><span><Gauge size={14} /> MECHANICAL</span><small>BRAKES &amp; TYRES</small></div>
            <p className="control-group-about">Brake bias and tyre pressures shape how the car turns, stops and wears its tyres.</p>
            <SetupSlider label="Brake bias" hint="Forward is safer under braking, back rotates the car" value={setup.brakeBias} min={52} max={60} step={0.1} unit="%" onChange={(value) => update('brakeBias', value)} />
            <div className="dual-pressure">
              <SetupSlider label="Front pressure" hint="Higher — sharper response, more front wear" value={setup.tirePressureFront} min={21} max={25} step={0.1} unit="psi" onChange={(value) => update('tirePressureFront', value)} />
              <SetupSlider label="Rear pressure" hint="Higher — more traction, hotter rears" value={setup.tirePressureRear} min={19} max={23} step={0.1} unit="psi" onChange={(value) => update('tirePressureRear', value)} />
            </div>
          </div>
        </section>

        <section className="panel car-visualizer-panel">
          <div className="workspace-panel-title visualizer-title">
            <div><span className="eyebrow">REAL-TIME CFD APPROXIMATION</span><h2>Aero platform</h2></div>
            <span className="model-live"><i /> 100 HZ SOLVER</span>
          </div>
          <div className="car-visualizer">
            <Suspense fallback={<div className="scene-loader"><i /><strong>LOADING 3D CAR</strong><span>Preparing live aero geometry…</span></div>}>
              <CarShowroom3D
                primaryColor={selectedDriver.teamColor}
                accentColor={selectedDriver.secondaryColor}
                frontBalance={aero.frontBalancePercent}
                downforceKn={aero.downforceN / 1000}
                porpoising={aero.porpoisingActive}
              />
            </Suspense>
            <div className="airflow-lines left">{Array.from({ length: 5 }, (_, index) => <i key={index} />)}</div>
            <div className="airflow-lines right">{Array.from({ length: 5 }, (_, index) => <i key={index} />)}</div>
            <svg viewBox="0 0 520 640" role="img" aria-label="Top-down aerodynamic visualization of the race car">
              <defs>
                <linearGradient id="carBody" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#ff963c" /><stop offset="0.52" stopColor="#ee6510" /><stop offset="1" stopColor="#a93805" /></linearGradient>
                <linearGradient id="carbon" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#343941" /><stop offset="1" stopColor="#111419" /></linearGradient>
                <filter id="carShadow"><feGaussianBlur stdDeviation="12" /></filter>
                <filter id="aeroGlow"><feGaussianBlur stdDeviation="5" /></filter>
              </defs>
              <ellipse cx="260" cy="335" rx="114" ry="265" fill="#000" opacity=".52" filter="url(#carShadow)" />
              <path d="M 260 44 C 245 65 242 103 244 143 L 215 193 C 203 229 210 270 220 306 L 199 405 L 217 551 L 260 596 L 303 551 L 321 405 L 300 306 C 310 270 317 229 305 193 L 276 143 C 278 103 275 65 260 44 Z" fill="url(#carBody)" stroke="#ffb16d" strokeOpacity=".4" />
              <path d="M 260 73 L 250 161 L 225 212 L 235 292 L 260 307 L 285 292 L 295 212 L 270 161 Z" fill="#ff9b4a" opacity=".62" />
              <path d="M 212 184 L 308 184 L 335 245 L 303 281 L 289 233 L 231 233 L 217 281 L 185 245 Z" fill="url(#carbon)" />
              <path d="M 260 197 C 235 198 223 224 229 257 C 234 287 242 310 260 319 C 278 310 286 287 291 257 C 297 224 285 198 260 197 Z" fill="#0b0d11" stroke="#575e68" />
              <ellipse cx="260" cy="250" rx="25" ry="38" fill="#15191f" stroke="#ff9b4a" strokeWidth="5" />
              <path d="M 240 237 Q 260 216 280 237 L 278 249 Q 260 234 242 249 Z" fill="#11151b" stroke="#7b838e" strokeWidth="3" />
              <rect x="161" y="86" width="198" height="18" rx="4" fill="url(#carbon)" stroke="#707782" />
              <rect x="185" y="63" width="150" height="9" rx="2" fill="url(#carbon)" />
              <path d="M 214 96 L 231 151 L 289 151 L 306 96" fill="none" stroke="#222831" strokeWidth="8" />
              <rect x="178" y="512" width="164" height="22" rx="3" fill="url(#carbon)" stroke="#707782" />
              <rect x="192" y="541" width="136" height="14" rx="3" fill="url(#carbon)" />
              <path d="M 211 508 L 220 458 L 300 458 L 309 508" fill="none" stroke="#252a31" strokeWidth="10" />
              <g fill="#0c0e12" stroke="#444a53" strokeWidth="2">
                <rect x="145" y="150" width="50" height="102" rx="13" /><rect x="325" y="150" width="50" height="102" rx="13" />
                <rect x="151" y="411" width="52" height="114" rx="13" /><rect x="317" y="411" width="52" height="114" rx="13" />
              </g>
              <g stroke="#ee6510" strokeWidth="3" opacity=".7"><line x1="194" y1="202" x2="221" y2="211" /><line x1="326" y1="202" x2="299" y2="211" /><line x1="202" y1="459" x2="217" y2="443" /><line x1="318" y1="459" x2="303" y2="443" /></g>
              <path d="M 214 313 Q 260 342 306 313 L 319 408 Q 260 431 201 408 Z" fill="#dd5a0e" opacity=".75" />
              <path d="M 209 398 Q 260 430 311 398 L 304 460 Q 260 478 216 460 Z" fill="#12161b" opacity=".75" />
              <g fill="#fff" fontFamily="Barlow Condensed" textAnchor="middle"><text x="260" y="386" fontSize="42" fontWeight="800">{selectedDriver.number}</text><text x="260" y="422" fontSize="13" fontWeight="700" letterSpacing="3">LEGENDS</text></g>
              <g className="aero-pressure" fill="none" strokeLinecap="round">
                <path d="M 135 95 Q 260 132 385 95" stroke="#4ce4be" strokeWidth="3" opacity=".55" />
                <path d="M 124 126 Q 260 172 396 126" stroke="#4ce4be" strokeWidth="2" opacity=".3" />
                <path d="M 130 534 Q 260 491 390 534" stroke="#ff655d" strokeWidth="3" opacity=".52" />
                <path d="M 138 562 Q 260 522 382 562" stroke="#ff655d" strokeWidth="2" opacity=".28" />
              </g>
            </svg>

            <div className="aero-callout front-callout"><span>FRONT LOAD</span><b>{(aero.downforceN * (aero.frontBalancePercent / 100) / 1000).toFixed(1)} kN</b><i /></div>
            <div className="aero-callout floor-callout"><span>FLOOR EFFICIENCY</span><b>{(aero.porpoiseEfficiency * 100).toFixed(1)}%</b><i /></div>
            <div className="aero-callout rear-callout"><span>REAR LOAD</span><b>{(aero.downforceN * (1 - aero.frontBalancePercent / 100) / 1000).toFixed(1)} kN</b><i /></div>
            <div className="flow-direction"><Wind size={14} /><span>AIRFLOW · 300 KM/H</span><i /></div>
          </div>
        </section>

        <aside className="setup-analysis-column">
          <section className="panel aero-output-card">
            <div className="workspace-panel-title"><div><span className="eyebrow">PHYSICS OUTPUT</span><h2>Aerodynamic balance</h2></div><CloudCog size={16} /></div>
            <div className="aero-balance-gauge">
              <div className="balance-scale"><span className="front-load" style={{ width: `${aero.frontBalancePercent}%` }} /><i style={{ left: `${aero.frontBalancePercent}%` }} /></div>
              <div className="balance-numbers"><span><small>FRONT</small><b>{aero.frontBalancePercent.toFixed(1)}%</b></span><span><small>REAR</small><b>{(100 - aero.frontBalancePercent).toFixed(1)}%</b></span></div>
              <div className={`balance-assessment ${Math.abs(balanceDelta) < 2.5 ? 'good' : 'warning'}`}><ShieldCheck size={14} /><span><b>{Math.abs(balanceDelta) < 2.5 ? 'STABLE PLATFORM' : balanceDelta > 0 ? 'OVERSTEER BIAS' : 'UNDERSTEER BIAS'}</b><small>{balanceDelta >= 0 ? '+' : ''}{balanceDelta.toFixed(1)}% vs target balance</small></span></div>
            </div>

            <div className="physics-metric-grid">
              <span><small>DOWNFORCE</small><b>{(aero.downforceN / 1000).toFixed(1)}<em>kN</em></b><i>at 300 km/h</i></span>
              <span><small>DRAG</small><b>{(aero.dragN / 1000).toFixed(1)}<em>kN</em></b><i>Cᴅ {aero.cdTotal.toFixed(3)}</i></span>
              <span><small>LIFT COEFF.</small><b>{aero.clTotal.toFixed(2)}</b><i>Cʟ total</i></span>
              <span><small>EFFICIENCY</small><b>{(aero.clTotal / aero.cdTotal).toFixed(2)}</b><i>L/D ratio</i></span>
            </div>
          </section>

          <section className="panel performance-impact-card">
            <div className="workspace-panel-title"><div><span className="eyebrow">SIMULATED IMPACT</span><h2>Lap performance</h2></div><Activity size={16} /></div>
            <div className="performance-score-row">
              <span><small>HIGH SPEED</small><b>{cornerScore.toFixed(0)}</b><i><em style={{ width: `${cornerScore}%` }} /></i></span>
              <span><small>LOW SPEED</small><b>{(83 - Math.abs(balanceDelta) * 2).toFixed(0)}</b><i><em style={{ width: `${83 - Math.abs(balanceDelta) * 2}%` }} /></i></span>
              <span><small>STRAIGHTS</small><b>{straightScore.toFixed(0)}</b><i><em style={{ width: `${straightScore}%` }} /></i></span>
              <span><small>TYRE USE</small><b>{(89 - Math.abs(setup.tirePressureFront - 23) * 3).toFixed(0)}</b><i><em style={{ width: `${89 - Math.abs(setup.tirePressureFront - 23) * 3}%` }} /></i></span>
            </div>
            <div className="predicted-lap-time">
              <div><small>PREDICTED LAP</small><b>1:28.8{Math.max(0, Math.round(Math.abs(balanceDelta) * 2))}</b></div>
              <span className="positive">−0.184s<small>vs. baseline</small></span>
            </div>
          </section>

          <section className="panel engineering-notes-card">
            <div className="side-card-heading"><span><ThermometerSun size={15} /> ENGINEER NOTES</span><b>3 ITEMS</b></div>
            <div className="engineering-note good"><Check size={13} /><span><b>Front response improved</b><small>+4 confidence through Copse entry</small></span></div>
            <div className="engineering-note"><Fan size={13} /><span><b>Cooling margin healthy</b><small>PU projection: 112°C peak</small></span></div>
            <div className={`engineering-note ${aero.porpoisingActive ? 'warning' : ''}`}><Activity size={13} /><span><b>{aero.porpoisingActive ? 'Floor oscillation risk' : 'Floor platform stable'}</b><small>Plank wear projection: {(selectedDriver.plankWear + aero.plankWearRateMmPerSecond * 3600).toFixed(2)} mm</small></span></div>
          </section>
        </aside>
      </div>
    </main>
  )
}
