import {
  Activity,
  Camera,
  ChevronRight,
  Compass,
  Cpu,
  Gauge,
  Layers,
  Moon,
  RotateCcw,
  Sliders,
  Sun,
  Volume2,
  VolumeX,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  SteeringWheel3D,
  type CameraPreset,
} from '../components/SteeringWheel3D'
import type { DriverState, WorkerCommand } from '../types'
import {
  F1_STEERING_WHEEL_CONTROLS,
  type WheelControlMetadata,
} from '../graphics/steering_wheel/steeringWheelData'
import type { WheelTelemetryData } from '../graphics/steering_wheel/F1SteeringWheelModel'

interface SteeringWheelLabProps {
  selectedDriver?: DriverState
  sendCommand?: (command: WorkerCommand) => void
  onNotify?: (title: string, message: string, tone?: 'success' | 'warning') => void
}

export function SteeringWheelLab({
  selectedDriver,
  sendCommand,
  onNotify,
}: SteeringWheelLabProps) {
  // Viewport Settings
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>('front')
  const [nightMode, setNightMode] = useState(false)
  const [audioEnabled, setAudioEnabled] = useState(true)
  const [activeLcdPage, setActiveLcdPage] = useState(1)
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL')
  const [selectedControlId, setSelectedControlId] = useState<string | null>(null)
  const [syncMode, setSyncMode] = useState<'LIVE' | 'BENCH'>('LIVE')

  // Manual Test Bench States (when not in LIVE mode or overriding)
  const [benchGear, setBenchGear] = useState<number | string>(6)
  const [benchRpm, setBenchRpm] = useState(12800)
  const [benchSpeed, setBenchSpeed] = useState(294)
  const [benchDelta] = useState(-0.215)
  const [benchErsSoc] = useState(82)
  const [benchErsMode, setBenchErsMode] = useState<'BALANCED' | 'DEPLOY' | 'HARVEST' | 'OVERTAKE'>('BALANCED')
  const [benchBrakeBias, setBenchBrakeBias] = useState(56.5)
  const [benchEngineBrake, setBenchEngineBrake] = useState(3)
  const [benchDiffEntry, setBenchDiffEntry] = useState(54)
  const [benchDiffExit, setBenchDiffExit] = useState(58)
  const [benchStratMode, setBenchStratMode] = useState(3)
  const [benchTyreCompound, setBenchTyreCompound] = useState('MED')
  const [benchDrs, setBenchDrs] = useState(false)
  const [benchPitLimiter, setBenchPitLimiter] = useState(false)
  const [benchFlag, setBenchFlag] = useState<'GREEN' | 'YELLOW' | 'VSC' | 'SC' | 'RED' | 'BLUE'>('GREEN')

  // Compute live or bench telemetry for the 3D model
  const telemetryData: WheelTelemetryData = useMemo(() => {
    if (syncMode === 'LIVE' && selectedDriver) {
      const isPitting = selectedDriver.pitStatus === 'PITTING' || selectedDriver.boxThisLap
      const flag: 'GREEN' | 'YELLOW' | 'VSC' | 'SC' | 'RED' | 'BLUE' =
        isPitting ? 'YELLOW' : 'GREEN'

      return {
        gear: selectedDriver.speed > 290 ? 8 : selectedDriver.speed > 250 ? 7 : selectedDriver.speed > 200 ? 6 : selectedDriver.speed > 140 ? 5 : selectedDriver.speed > 90 ? 4 : selectedDriver.speed > 50 ? 3 : 2,
        speedKmh: Math.round(selectedDriver.speed),
        rpm: Math.min(15000, 9500 + (selectedDriver.speed % 60) * 85),
        maxRpm: 15000,
        deltaSeconds: selectedDriver.interval > 0 ? selectedDriver.interval : -0.145,
        ersSocPercent: Math.round(selectedDriver.ers),
        ersMode: selectedDriver.ersMode,
        brakeBiasPercent: benchBrakeBias,
        engineBrakeLevel: benchEngineBrake,
        diffEntryPercent: benchDiffEntry,
        diffExitPercent: benchDiffExit,
        stratMode: selectedDriver.paceMode === 'ATTACK' ? 1 : selectedDriver.paceMode === 'CONSERVE' ? 5 : 3,
        tyreCompound: selectedDriver.tire.substring(0, 4),
        tireTemps: {
          fl: Math.round(selectedDriver.tireSurfaceTemp),
          fr: Math.round(selectedDriver.tireSurfaceTemp + 2),
          rl: Math.round(selectedDriver.tireCoreTemp - 1),
          rr: Math.round(selectedDriver.tireCoreTemp + 1),
        },
        tirePressures: { fl: 22.8, fr: 22.9, rl: 20.6, rr: 20.7 },
        drsActive: benchDrs,
        pitLimiterActive: isPitting || benchPitLimiter,
        flagStatus: flag,
        lapTimeStr: `${selectedDriver.lastLap.toFixed(3)}s`,
        fuelRemainingKg: selectedDriver.fuel,
      }
    }

    return {
      gear: benchGear,
      speedKmh: benchSpeed,
      rpm: benchRpm,
      maxRpm: 15000,
      deltaSeconds: benchDelta,
      ersSocPercent: benchErsSoc,
      ersMode: benchErsMode,
      brakeBiasPercent: benchBrakeBias,
      engineBrakeLevel: benchEngineBrake,
      diffEntryPercent: benchDiffEntry,
      diffExitPercent: benchDiffExit,
      stratMode: benchStratMode,
      tyreCompound: benchTyreCompound,
      tireTemps: { fl: 102, fr: 104, rl: 99, rr: 101 },
      tirePressures: { fl: 22.8, fr: 22.9, rl: 20.6, rr: 20.7 },
      drsActive: benchDrs,
      pitLimiterActive: benchPitLimiter,
      flagStatus: benchFlag,
      lapTimeStr: '1:18.420',
      fuelRemainingKg: 42.5,
    }
  }, [
    syncMode,
    selectedDriver,
    benchGear,
    benchRpm,
    benchSpeed,
    benchDelta,
    benchErsSoc,
    benchErsMode,
    benchBrakeBias,
    benchEngineBrake,
    benchDiffEntry,
    benchDiffExit,
    benchStratMode,
    benchTyreCompound,
    benchDrs,
    benchPitLimiter,
    benchFlag,
  ])

  // Filtered control list
  const filteredControls = useMemo(() => {
    if (categoryFilter === 'ALL') return F1_STEERING_WHEEL_CONTROLS
    return F1_STEERING_WHEEL_CONTROLS.filter((c) => c.category === categoryFilter)
  }, [categoryFilter])

  // Handle direct interaction from 3D viewport or Drawer
  const handleControlInteract = (
    ctrl: WheelControlMetadata,
    interactionType: 'CLICK' | 'ROTARY_CW' | 'ROTARY_CCW' | 'PADDLE_PULL',
  ) => {
    setSelectedControlId(ctrl.id)

    switch (ctrl.id) {
      case 'btn_drs': {
        const nextDrs = !benchDrs
        setBenchDrs(nextDrs)
        onNotify?.(
          nextDrs ? 'DRS / ACTIVE AERO OPEN' : 'DRS CLOSED',
          nextDrs ? 'Straight-line low drag active (-38% drag)' : 'Cornering high-downforce restored',
          'success',
        )
        break
      }

      case 'btn_radio': {
        onNotify?.(
          'TEAM RADIO OPEN [MCL-NOR]',
          'Driver: "Engine mode 2 available next straight? Balance feels strong."',
          'success',
        )
        break
      }

      case 'btn_pit_limiter': {
        const nextPL = !benchPitLimiter
        setBenchPitLimiter(nextPL)
        if (selectedDriver && sendCommand) {
          sendCommand({
            type: 'PIT_COMMAND',
            driverId: selectedDriver.id,
            compound: selectedDriver.tire,
            cancel: !nextPL,
          })
        }
        onNotify?.(
          nextPL ? 'PIT LIMITER ENGAGED (80 KM/H)' : 'PIT LIMITER DISENGAGED',
          nextPL ? 'Pit lane speed governing active & Box confirmed' : 'Full throttle map restored',
          'warning',
        )
        break
      }

      case 'btn_overtake': {
        setBenchErsMode('OVERTAKE')
        if (selectedDriver && sendCommand) {
          sendCommand({
            type: 'DRIVER_COMMAND',
            driverId: selectedDriver.id,
            ersMode: 'DEPLOY',
          })
        }
        onNotify?.('ERS OVERTAKE BOOST', '350 kW MGU-K peak battery discharge engaged!', 'success')
        break
      }

      case 'btn_soc_harvest': {
        setBenchErsMode('HARVEST')
        if (selectedDriver && sendCommand) {
          sendCommand({
            type: 'DRIVER_COMMAND',
            driverId: selectedDriver.id,
            ersMode: 'HARVEST',
          })
        }
        onNotify?.('ERS RECHARGE HARVEST', 'Aggressive kinetic energy harvesting active (+45% regen)', 'success')
        break
      }

      case 'btn_neutral': {
        setBenchGear('N')
        setBenchSpeed(0)
        onNotify?.('GEARBOX NEUTRAL', 'Clutches disengaged into Neutral', 'warning')
        break
      }

      case 'btn_reverse': {
        setBenchGear('R')
        setBenchSpeed(-12)
        onNotify?.('REVERSE GEAR ENGAGED', 'Backing up at low speed', 'warning')
        break
      }

      case 'btn_marshal_ack': {
        onNotify?.('MARSHAL DIRECTIVE ACKNOWLEDGED', 'Flag alerts confirmed on telemetry bus', 'success')
        break
      }

      case 'btn_drink': {
        onNotify?.('DRIVER HYDRATION SQUIRT', '150ml electrolyte solution injected', 'success')
        break
      }

      case 'btn_pass_pace': {
        if (selectedDriver && sendCommand) {
          sendCommand({
            type: 'DRIVER_COMMAND',
            driverId: selectedDriver.id,
            paceMode: 'ATTACK',
          })
        }
        onNotify?.('PACE MODE: ATTACK', 'Driver pushing maximum delta targets', 'success')
        break
      }

      case 'btn_bb_plus': {
        const nextBB = Math.min(62, benchBrakeBias + 0.5)
        setBenchBrakeBias(nextBB)
        onNotify?.('BRAKE BIAS FORWARD', `Brake Balance adjusted to ${nextBB.toFixed(1)}% Front`, 'success')
        break
      }

      case 'btn_bb_minus': {
        const nextBB = Math.max(50, benchBrakeBias - 0.5)
        setBenchBrakeBias(nextBB)
        onNotify?.('BRAKE BIAS REARWARD', `Brake Balance adjusted to ${nextBB.toFixed(1)}% Front`, 'success')
        break
      }

      case 'btn_eb_plus': {
        const nextEB = Math.min(5, benchEngineBrake + 1)
        setBenchEngineBrake(nextEB)
        onNotify?.('ENGINE BRAKING INCREASE', `EB map raised to Level ${nextEB}`, 'success')
        break
      }

      case 'btn_eb_minus': {
        const nextEB = Math.max(1, benchEngineBrake - 1)
        setBenchEngineBrake(nextEB)
        onNotify?.('ENGINE BRAKING DECREASE', `EB map lowered to Level ${nextEB}`, 'success')
        break
      }

      case 'btn_page_next': {
        const nextP = activeLcdPage >= 4 ? 1 : activeLcdPage + 1
        setActiveLcdPage(nextP)
        break
      }

      case 'btn_page_prev': {
        const prevP = activeLcdPage <= 1 ? 4 : activeLcdPage - 1
        setActiveLcdPage(prevP)
        break
      }

      case 'disp_lcd_43': {
        const nextP = activeLcdPage >= 4 ? 1 : activeLcdPage + 1
        setActiveLcdPage(nextP)
        onNotify?.('LCD DISPLAY PAGE', `Switched to Page ${nextP}`, 'success')
        break
      }

      case 'rot_diff_entry': {
        const delta = interactionType === 'ROTARY_CCW' ? -1 : 1
        const nextVal = Math.max(45, Math.min(70, benchDiffEntry + delta))
        setBenchDiffEntry(nextVal)
        onNotify?.('DIFF CORNER ENTRY', `Differential lock set to ${nextVal}%`, 'success')
        break
      }

      case 'rot_diff_exit': {
        const delta = interactionType === 'ROTARY_CCW' ? -1 : 1
        const nextVal = Math.max(40, Math.min(65, benchDiffExit + delta))
        setBenchDiffExit(nextVal)
        onNotify?.('DIFF CORNER EXIT', `Differential power lock set to ${nextVal}%`, 'success')
        break
      }

      case 'rot_strat_mode': {
        const strats = [1, 2, 3, 4, 5, 7, 10]
        const currentIdx = strats.indexOf(benchStratMode)
        const nextStrat = strats[(currentIdx + 1) % strats.length]
        setBenchStratMode(nextStrat)
        onNotify?.('STRAT ROTARY', `Engine strategy map switched to STRAT ${nextStrat}`, 'success')
        break
      }

      case 'rot_tire_selector': {
        const compounds = ['SOFT', 'MED', 'HARD', 'INTER', 'WET']
        const currentIdx = compounds.indexOf(benchTyreCompound)
        const nextComp = compounds[(currentIdx + 1) % compounds.length]
        setBenchTyreCompound(nextComp)
        onNotify?.('TYRE CALIBRATION ROTARY', `ECU slip calibrated for ${nextComp} compound`, 'success')
        break
      }

      case 'paddle_upshift': {
        if (typeof benchGear === 'number') {
          const nextG = Math.min(8, benchGear + 1)
          setBenchGear(nextG)
          setBenchRpm(Math.max(9200, benchRpm - 1800))
          setBenchSpeed(Math.min(345, benchSpeed + 14))
          onNotify?.('UPSHIFT (+)', `Gear ${nextG} engaged (Seamless)`, 'success')
        } else {
          setBenchGear(1)
        }
        break
      }

      case 'paddle_downshift': {
        if (typeof benchGear === 'number') {
          const nextG = Math.max(1, benchGear - 1)
          setBenchGear(nextG)
          setBenchRpm(Math.min(14800, benchRpm + 2200))
          setBenchSpeed(Math.max(65, benchSpeed - 18))
          onNotify?.('DOWNSHIFT (-)', `Gear ${nextG} engaged (Auto Blip)`, 'success')
        } else {
          setBenchGear(1)
        }
        break
      }

      default: {
        onNotify?.(ctrl.name, ctrl.actionHint, 'success')
      }
    }
  }

  const handleControlInteractRef = useRef(handleControlInteract)
  handleControlInteractRef.current = handleControlInteract

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid firing when typing in an input
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return

      if (e.key === 'd' || e.key === 'D') {
        const drsCtrl = F1_STEERING_WHEEL_CONTROLS.find((c) => c.id === 'btn_drs')
        if (drsCtrl) handleControlInteractRef.current(drsCtrl, 'CLICK')
      } else if (e.key === 'e' || e.key === 'E' || (e.shiftKey && e.code === 'ShiftRight')) {
        const upshiftCtrl = F1_STEERING_WHEEL_CONTROLS.find((c) => c.id === 'paddle_upshift')
        if (upshiftCtrl) handleControlInteractRef.current(upshiftCtrl, 'PADDLE_PULL')
      } else if (e.key === 'q' || e.key === 'Q' || e.key === 'z' || e.key === 'Z') {
        const downshiftCtrl = F1_STEERING_WHEEL_CONTROLS.find((c) => c.id === 'paddle_downshift')
        if (downshiftCtrl) handleControlInteractRef.current(downshiftCtrl, 'PADDLE_PULL')
      } else if (e.key === 'p' || e.key === 'P') {
        const plCtrl = F1_STEERING_WHEEL_CONTROLS.find((c) => c.id === 'btn_pit_limiter')
        if (plCtrl) handleControlInteractRef.current(plCtrl, 'CLICK')
      } else if (e.key === 'r' || e.key === 'R') {
        const radCtrl = F1_STEERING_WHEEL_CONTROLS.find((c) => c.id === 'btn_radio')
        if (radCtrl) handleControlInteractRef.current(radCtrl, 'CLICK')
      } else if (e.key === 'b' || e.key === 'B') {
        const bbCtrl = F1_STEERING_WHEEL_CONTROLS.find((c) => c.id === 'btn_bb_plus')
        if (bbCtrl) handleControlInteractRef.current(bbCtrl, 'CLICK')
      } else if (e.key === 'v' || e.key === 'V') {
        const bbMinusCtrl = F1_STEERING_WHEEL_CONTROLS.find((c) => c.id === 'btn_bb_minus')
        if (bbMinusCtrl) handleControlInteractRef.current(bbMinusCtrl, 'CLICK')
      } else if (['1', '2', '3', '4'].includes(e.key)) {
        setActiveLcdPage(Number(e.key))
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const categories: { id: string; label: string }[] = [
    { id: 'ALL', label: 'All Controls (28)' },
    { id: 'AERO', label: 'Aerodynamics' },
    { id: 'POWERTRAIN', label: 'Powertrain & ERS' },
    { id: 'BRAKES', label: 'Brakes & BBW' },
    { id: 'TRANSMISSION', label: 'Gears & Diff' },
    { id: 'TELEMETRY', label: 'LCD & Sensors' },
    { id: 'SAFETY', label: 'Safety & Limiter' },
    { id: 'RADIO', label: 'Radio Comms' },
  ]

  const cameraButtons: { id: CameraPreset; label: string; icon: typeof Camera }[] = [
    { id: 'front', label: 'Front Full Wheel', icon: Camera },
    { id: 'cockpit', label: 'Cockpit POV', icon: Compass },
    { id: 'lcd', label: '4.3" LCD Focus', icon: Gauge },
    { id: 'thumb_left', label: 'Left Thumb', icon: Sliders },
    { id: 'thumb_right', label: 'Right Thumb', icon: Sliders },
    { id: 'paddles', label: 'Rear Paddles', icon: Layers },
    { id: 'free', label: '360° Orbit', icon: RotateCcw },
  ]

  return (
    <div className="steering-wheel-lab-container">
      {/* Top HUD Control Bar */}
      <div className="wheel-lab-header">
        <div className="header-left">
          <div className="title-group">
            <span className="spec-badge">FIA 2026 SPEC</span>
            <h2>F1 COCKPIT STEERING WHEEL</h2>
          </div>
          <p className="subtitle">
            Exact 3D replica with tactile microswitches, rotary detents, carbon paddles & 60 FPS live telemetry LCD.
          </p>
        </div>

        <div className="header-actions">
          {/* Live Sync vs Bench Toggle */}
          <div className="mode-toggle-pill">
            <button
              className={`pill-btn ${syncMode === 'LIVE' ? 'active' : ''}`}
              onClick={() => setSyncMode('LIVE')}
              title="Synchronize live with 100 Hz race simulation engine"
            >
              <Activity size={14} />
              <span>LIVE SIM SYNC</span>
            </button>
            <button
              className={`pill-btn ${syncMode === 'BENCH' ? 'active' : ''}`}
              onClick={() => setSyncMode('BENCH')}
              title="Manual sandbox test bench"
            >
              <Cpu size={14} />
              <span>TEST BENCH</span>
            </button>
          </div>

          {/* Night Mode Toggle */}
          <button
            className={`icon-toggle-btn ${nightMode ? 'active' : ''}`}
            onClick={() => setNightMode(!nightMode)}
            title="Toggle Cockpit Night Lighting"
          >
            {nightMode ? <Moon size={16} /> : <Sun size={16} />}
          </button>

          {/* Sound FX Toggle */}
          <button
            className={`icon-toggle-btn ${audioEnabled ? 'active' : ''}`}
            onClick={() => setAudioEnabled(!audioEnabled)}
            title="Toggle Web Audio Sound Synthesis"
          >
            {audioEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="wheel-lab-layout">
        {/* Left Column: 3D Viewport & Controls */}
        <div className="wheel-viewport-column">
          {/* Camera Angles Toolbar */}
          <div className="camera-presets-bar">
            <span className="bar-label">CAMERA PRESETS:</span>
            <div className="presets-list">
              {cameraButtons.map((btn) => (
                <button
                  key={btn.id}
                  className={`preset-chip ${cameraPreset === btn.id ? 'active' : ''}`}
                  onClick={() => setCameraPreset(btn.id)}
                >
                  <btn.icon size={13} />
                  <span>{btn.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 3D Canvas Viewport */}
          <div className="wheel-3d-canvas-container">
            <SteeringWheel3D
              telemetry={telemetryData}
              activeLcdPage={activeLcdPage}
              cameraPreset={cameraPreset}
              nightMode={nightMode}
              audioEnabled={audioEnabled}
              selectedControlId={selectedControlId}
              onControlInteract={handleControlInteract}
            />

            {/* In-Canvas Quick Telemetry Overlay Strip */}
            <div className="canvas-telemetry-hud">
              <div className="hud-metric">
                <small>GEAR</small>
                <strong>{telemetryData.gear}</strong>
              </div>
              <div className="hud-metric">
                <small>SPEED</small>
                <strong className="text-cyan">{telemetryData.speedKmh} <span className="unit">km/h</span></strong>
              </div>
              <div className="hud-metric">
                <small>RPM</small>
                <strong className="text-orange">{Math.round(telemetryData.rpm)}</strong>
              </div>
              <div className="hud-metric">
                <small>ERS SOC</small>
                <strong className="text-purple">{telemetryData.ersSocPercent}%</strong>
              </div>
              <div className="hud-metric">
                <small>BB BALANCE</small>
                <strong className="text-red">{telemetryData.brakeBiasPercent.toFixed(1)}%</strong>
              </div>
              <div className="hud-metric">
                <small>DELTA</small>
                <strong className={telemetryData.deltaSeconds <= 0 ? 'text-green' : 'text-red'}>
                  {telemetryData.deltaSeconds <= 0 ? telemetryData.deltaSeconds.toFixed(3) : `+${telemetryData.deltaSeconds.toFixed(3)}`}s
                </strong>
              </div>
            </div>

            {/* Bottom Keyboard Guide */}
            <div className="keyboard-shortcuts-pill">
              <span><b>HOTKEYS:</b></span>
              <span><kbd>SPACE</kbd> DRS</span>
              <span><kbd>E</kbd> Shift Up</span>
              <span><kbd>Q</kbd> Shift Down</span>
              <span><kbd>P</kbd> Pit Limiter</span>
              <span><kbd>B</kbd> / <kbd>V</kbd> Brake Bias</span>
              <span><kbd>1-4</kbd> LCD Pages</span>
            </div>
          </div>

          {/* LCD Page Switcher Tabs */}
          <div className="lcd-page-selector-card">
            <div className="selector-title">
              <Gauge size={15} />
              <span>4.3" PCF / DDU DISPLAY PAGE SELECTOR:</span>
            </div>
            <div className="lcd-page-tabs">
              <button
                className={`lcd-tab ${activeLcdPage === 1 ? 'active' : ''}`}
                onClick={() => setActiveLcdPage(1)}
              >
                <b>PAGE 1</b>
                <span>Race Main Telemetry</span>
              </button>
              <button
                className={`lcd-tab ${activeLcdPage === 2 ? 'active' : ''}`}
                onClick={() => setActiveLcdPage(2)}
              >
                <b>PAGE 2</b>
                <span>Tire Thermals & Pressures</span>
              </button>
              <button
                className={`lcd-tab ${activeLcdPage === 3 ? 'active' : ''}`}
                onClick={() => setActiveLcdPage(3)}
              >
                <b>PAGE 3</b>
                <span>350kW ERS & Energy Flow</span>
              </button>
              <button
                className={`lcd-tab ${activeLcdPage === 4 ? 'active' : ''}`}
                onClick={() => setActiveLcdPage(4)}
              >
                <b>PAGE 4</b>
                <span>Active Aero & Diagnostics</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Controls Matrix & Inspector */}
        <div className="wheel-sidebar-column">
          <div className="sidebar-header">
            <div className="sidebar-title-row">
              <Sliders size={16} />
              <h3>CONTROLS DIRECTORY</h3>
            </div>
            <span className="badge-count">{filteredControls.length} Controls</span>
          </div>

          {/* Category Filter Pills */}
          <div className="category-filters-wrap">
            {categories.map((cat) => (
              <button
                key={cat.id}
                className={`category-pill ${categoryFilter === cat.id ? 'active' : ''}`}
                onClick={() => setCategoryFilter(cat.id)}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Controls List Cards */}
          <div className="controls-scroll-list">
            {filteredControls.map((ctrl) => {
              const isSelected = selectedControlId === ctrl.id

              return (
                <div
                  key={ctrl.id}
                  className={`control-inspector-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleControlInteract(ctrl, 'CLICK')}
                >
                  <div className="control-card-header">
                    <span
                      className="control-acronym-badge"
                      style={{ borderColor: ctrl.color, color: ctrl.color }}
                    >
                      {ctrl.acronym}
                    </span>
                    <div className="control-card-titles">
                      <strong>{ctrl.name}</strong>
                      <small>{ctrl.type.replace('_', ' ')} • {ctrl.positionLabel}</small>
                    </div>
                  </div>

                  <p className="control-card-desc">{ctrl.description}</p>

                  <div className="control-card-footer">
                    <span className="action-hint-text">
                      <span className="dot" style={{ backgroundColor: ctrl.color }} />
                      {ctrl.actionHint}
                    </span>
                    <button
                      className="inspect-btn"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleControlInteract(ctrl, 'CLICK')
                      }}
                    >
                      <span>ACTIVATE</span>
                      <ChevronRight size={13} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Test Bench Manual Tweaks Panel (when Bench mode is on) */}
          {syncMode === 'BENCH' && (
            <div className="test-bench-panel">
              <h4>TEST BENCH SIMULATOR OVERRIDES</h4>
              <div className="bench-grid">
                <div className="bench-row">
                  <label>Engine Throttle (RPM):</label>
                  <input
                    type="range"
                    min={4000}
                    max={15000}
                    step={100}
                    value={benchRpm}
                    onChange={(e) => setBenchRpm(Number(e.target.value))}
                  />
                  <span>{benchRpm} RPM</span>
                </div>
                <div className="bench-row">
                  <label>Flag Alert Injector:</label>
                  <div className="flag-select-pills">
                    {(['GREEN', 'YELLOW', 'VSC', 'SC', 'RED'] as const).map((fl) => (
                      <button
                        key={fl}
                        className={`flag-chip ${benchFlag === fl ? 'active' : ''}`}
                        onClick={() => setBenchFlag(fl)}
                      >
                        {fl}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
