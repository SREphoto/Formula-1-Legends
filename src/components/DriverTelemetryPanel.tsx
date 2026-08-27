import {
  Activity,
  Award,
  BatteryCharging,
  ChevronRight,
  CircleDot,
  Flame,
  Fuel,
  Gauge,
  Headphones,
  Minimize2,
  Play,
  Radio,
  Send,
  Sparkles,
  Square,
  Thermometer,
  X,
  Zap,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import type { DriverState, ErsMode, PaceMode, TireCompound, WorkerCommand } from '../types'
import { formatLapTime } from '../utils/format'
import { TireBadge } from './TimingTower'
import { getSampleTeamRadio } from '../services/openf1Service'
import { radioAudioService } from '../services/radioAudioService'

interface DriverTelemetryPanelProps {
  driver: DriverState
  sendCommand: (command: WorkerCommand) => void
  onNotify: (title: string, message: string, tone?: 'success' | 'warning') => void
  collapsed?: boolean
  onToggleCollapse?: () => void
}

const pitCompounds: TireCompound[] = ['SOFT', 'MEDIUM', 'HARD', 'INTERMEDIATE']

function MetricCard({
  icon: Icon,
  label,
  value,
  unit,
  max = 100,
  tone = 'cyan',
  detail,
}: {
  icon: typeof Zap
  label: string
  value: number
  unit: string
  max?: number
  tone?: 'cyan' | 'orange' | 'green' | 'purple' | 'red'
  detail?: string
}) {
  const percent = Math.max(0, Math.min(100, (value / max) * 100))
  return (
    <div className={`metric-card tone-${tone}`}>
      <div className="metric-header">
        <span className="metric-label"><Icon size={12} /> {label}</span>
        {detail && <span className="metric-detail">{detail}</span>}
      </div>
      <div className="metric-value-row">
        <span className="metric-number">{value.toFixed(unit === '°C' || unit === 'mm' ? (unit === 'mm' ? 2 : 0) : 1)}</span>
        <span className="metric-unit">{unit}</span>
      </div>
      <div className="metric-progress-bar">
        <div className={`metric-progress-fill fill-${tone}`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  )
}

function TireCornerCard({
  corner,
  surface,
  core,
  wear,
  compound,
}: {
  corner: 'FL' | 'FR' | 'RL' | 'RR'
  surface: number
  core: number
  wear: number
  compound: TireCompound
}) {
  const heatStatus = surface > 115 ? 'HOT' : surface < 88 ? 'COLD' : 'OPT'
  const heatClass = surface > 115 ? 'temp-hot' : surface < 88 ? 'temp-cold' : 'temp-optimal'
  const wearRemaining = Math.max(0, Math.min(100, 100 - wear))

  return (
    <div className={`tire-corner-card ${heatClass}`}>
      <div className="tire-corner-top">
        <span className="corner-tag">{corner}</span>
        <span className="corner-heat-status">{heatStatus}</span>
        <TireBadge compound={compound} small />
      </div>

      <div className="tire-temps-display">
        <div className="temp-stat">
          <span className="temp-label">SURF</span>
          <span className="temp-val">{surface.toFixed(0)}°C</span>
        </div>
        <div className="temp-stat core">
          <span className="temp-label">CORE</span>
          <span className="temp-val">{core.toFixed(0)}°C</span>
        </div>
      </div>

      <div className="tire-wear-section">
        <div className="wear-meta">
          <small>LIFE</small>
          <strong>{wearRemaining.toFixed(0)}%</strong>
        </div>
        <div className="wear-bar">
          <div
            className={`wear-bar-fill ${wearRemaining < 30 ? 'critical' : wearRemaining < 60 ? 'warning' : 'healthy'}`}
            style={{ width: `${wearRemaining}%` }}
          />
        </div>
      </div>
    </div>
  )
}

export function DriverTelemetryPanel({
  driver,
  sendCommand,
  onNotify,
  collapsed = false,
  onToggleCollapse,
}: DriverTelemetryPanelProps) {
  const [tab, setTab] = useState<'telemetry' | 'radio'>('telemetry')
  const [pitCompound, setPitCompound] = useState<TireCompound>('HARD')
  const [showCommandModal, setShowCommandModal] = useState(false)
  const [playingRadioId, setPlayingRadioId] = useState<string | null>(null)

  useEffect(() => {
    return radioAudioService.subscribe((isPlaying, id) => {
      setPlayingRadioId(isPlaying ? id : null)
    })
  }, [])

  const rpm = Math.min(15000, Math.max(7200, 6800 + driver.speed * 22))
  const gear = Math.max(1, Math.min(8, Math.round(driver.speed / 43)))
  const throttle = Math.max(8, Math.min(100, 108 - (330 - driver.speed) * 0.78))
  const brake = Math.max(0, Math.min(100, 100 - throttle * 1.35))

  const radioMessages = useMemo(() => {
    return getSampleTeamRadio(driver.number)
  }, [driver.number])

  const setPace = (paceMode: PaceMode) => {
    sendCommand({ type: 'DRIVER_COMMAND', driverId: driver.id, paceMode })
    onNotify('PACE DIRECTIVE SENT', `${driver.code} set to ${paceMode} pace.`, paceMode === 'ATTACK' ? 'warning' : 'success')
  }

  const setErs = (ersMode: ErsMode) => {
    sendCommand({ type: 'DRIVER_COMMAND', driverId: driver.id, ersMode })
    onNotify('ERS PROGRAM UPDATED', `${driver.code}: ${ersMode} mode active.`, 'success')
  }

  const togglePit = () => {
    if (driver.boxThisLap) {
      sendCommand({ type: 'PIT_COMMAND', driverId: driver.id, compound: pitCompound, cancel: true })
      onNotify('PIT CALL ABORTED', `${driver.code} will stay out this lap.`, 'warning')
    } else {
      sendCommand({ type: 'PIT_COMMAND', driverId: driver.id, compound: pitCompound })
      onNotify('BOX BOX CONFIRMED', `${driver.code} pitted for ${pitCompound} tires.`, 'success')
    }
  }

  const handlePlayRadio = (msg: { text: string; speaker: string; audioDurationSec: number }, index: number) => {
    const id = `radio-${driver.id}-${index}`
    if (playingRadioId === id) {
      radioAudioService.stop()
    } else {
      radioAudioService.playRadioTransmission({
        id,
        text: msg.text,
        speaker: msg.speaker,
        durationSec: msg.audioDurationSec,
      })
    }
  }

  const rpmPercent = Math.max(0, Math.min(1, (rpm - 7000) / 8000))
  const activeLeds = Math.round(rpmPercent * 8)

  if (collapsed) {
    return (
      <div className="panel-collapsed-rail right-rail">
        <button className="expand-rail-btn" onClick={onToggleCollapse} title="Expand Telemetry & Radio Panel">
          <ChevronRight size={16} />
          <span className="vertical-text">TELEMETRY · #{driver.number} {driver.code}</span>
        </button>
      </div>
    )
  }

  return (
    <aside className="panel telemetry-panel">
      {/* Driver Identity Card & Panel Controls */}
      <div className="driver-hero" style={{ '--team-color': driver.teamColor } as React.CSSProperties}>
        <div className="driver-number-badge">#{driver.number}</div>
        <div className="driver-hero-details">
          <div className="driver-team-line">
            <span className="country-flag">{driver.nationality}</span>
            <span className="team-name">{driver.team}</span>
          </div>
          <h2 className="driver-fullname">
            <span className="first-name">{driver.firstName}</span>
            <span className="last-name">{driver.lastName}</span>
          </h2>
          <div className="driver-status-chips">
            <span className="position-chip">P{driver.position}</span>
            <span className="stint-chip">{driver.tireAge} LAPS ON {driver.tire}</span>
            <span className={`status-pill ${driver.pitStatus !== 'NONE' ? 'pitting' : 'on-track'}`}>
              {driver.pitStatus === 'NONE' ? 'ON TRACK' : driver.pitStatus.replace('_', ' ')}
            </span>
          </div>
        </div>
        <div className="driver-hero-actions">
          <div className="driver-rating-badge">
            <Award size={14} />
            <span className="rating-num">{driver.rating}</span>
            <small>OVR</small>
          </div>
          {onToggleCollapse && (
            <button className="panel-collapse-trigger" onClick={onToggleCollapse} title="Collapse telemetry panel">
              <Minimize2 size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="telemetry-tabs">
        <button
          className={`telemetry-tab-btn ${tab === 'telemetry' ? 'active' : ''}`}
          onClick={() => setTab('telemetry')}
        >
          <Activity size={14} /> LIVE TELEMETRY
        </button>
        <button
          className={`telemetry-tab-btn ${tab === 'radio' ? 'active' : ''}`}
          onClick={() => setTab('radio')}
        >
          <Headphones size={14} /> TEAM RADIO
          <span className={`radio-live-dot ${playingRadioId ? 'pulsing' : ''}`} />
        </button>
      </div>

      {tab === 'telemetry' ? (
        <div className="telemetry-scroll">
          {/* Digital Cockpit Gauges */}
          <div className="cockpit-gauge-panel">
            {/* RPM LED Tachometer Bar */}
            <div className="rpm-tachometer">
              <div className="rpm-labels">
                <span>ENGINE TACHOMETER</span>
                <strong>{Math.round(rpm / 100) * 100} <small>RPM</small></strong>
              </div>
              <div className="tachometer-leds">
                {[0, 1, 2, 3, 4, 5, 6, 7].map((led) => {
                  const isActive = led < activeLeds
                  const ledColor = led < 3 ? 'green' : led < 6 ? 'yellow' : 'red'
                  return <i key={led} className={`led ${ledColor} ${isActive ? 'active' : ''}`} />
                })}
              </div>
            </div>

            {/* Speed & Gear Readout */}
            <div className="speed-gear-grid">
              <div className="speed-display">
                <span className="gauge-label">SPEED</span>
                <div className="gauge-num-row">
                  <strong className="digital-speed">{Math.round(driver.speed)}</strong>
                  <span className="digital-unit">KM/H</span>
                </div>
              </div>
              <div className="gear-display">
                <span className="gauge-label">GEAR</span>
                <strong className="digital-gear">{gear}</strong>
              </div>
            </div>

            {/* Throttle & Brake Bars */}
            <div className="pedal-bars-grid">
              <div className="pedal-bar-row">
                <span className="pedal-tag">THR</span>
                <div className="pedal-track">
                  <div className="pedal-fill throttle" style={{ width: `${throttle}%` }} />
                </div>
                <strong className="pedal-pct">{Math.round(throttle)}%</strong>
              </div>
              <div className="pedal-bar-row">
                <span className="pedal-tag">BRK</span>
                <div className="pedal-track">
                  <div className="pedal-fill brake" style={{ width: `${brake}%` }} />
                </div>
                <strong className="pedal-pct">{Math.round(brake)}%</strong>
              </div>
            </div>
          </div>

          {/* 4-Corner Tire Thermal Matrix */}
          <section className="telemetry-block">
            <div className="block-title-row">
              <span className="block-title"><Thermometer size={14} /> TIRE THERMAL MATRIX</span>
              <span className="status-badge-opt"><Sparkles size={11} /> OPTIMAL WINDOW (90–110°C)</span>
            </div>
            <div className="tires-quad-grid">
              <TireCornerCard corner="FL" surface={driver.tireSurfaceTemp + 1.4} core={driver.tireCoreTemp + 0.5} wear={driver.tireWear + 0.8} compound={driver.tire} />
              <TireCornerCard corner="FR" surface={driver.tireSurfaceTemp + 2.2} core={driver.tireCoreTemp + 0.9} wear={driver.tireWear + 1.2} compound={driver.tire} />
              <TireCornerCard corner="RL" surface={driver.tireSurfaceTemp - 1.5} core={driver.tireCoreTemp - 0.6} wear={driver.tireWear - 0.4} compound={driver.tire} />
              <TireCornerCard corner="RR" surface={driver.tireSurfaceTemp - 0.7} core={driver.tireCoreTemp - 0.2} wear={driver.tireWear} compound={driver.tire} />
            </div>
          </section>

          {/* Car Systems & Powertrain */}
          <section className="telemetry-block">
            <div className="block-title-row">
              <span className="block-title"><Gauge size={14} /> POWERTRAIN &amp; CAR SYSTEMS</span>
              <span className="telemetry-hz">10 HZ LIVE</span>
            </div>
            <div className="systems-cards-grid">
              <MetricCard icon={BatteryCharging} label="ERS HYBRID STORE" value={driver.ers} unit="%" tone={driver.ers < 20 ? 'red' : 'cyan'} detail={driver.ersMode} />
              <MetricCard icon={Fuel} label="FUEL REMAINING" value={driver.fuel} unit="kg" max={50} tone="orange" detail="-0.34 kg/lap" />
              <MetricCard icon={Flame} label="FRONT BRAKES" value={driver.brakeTempFront} unit="°C" max={1000} tone={driver.brakeTempFront > 750 ? 'red' : 'orange'} detail="CARBON ROTOR" />
              <MetricCard icon={Flame} label="REAR BRAKES" value={driver.brakeTempRear} unit="°C" max={1000} tone="orange" detail="BBW REAR" />
              <MetricCard icon={Activity} label="ICE ENGINE WEAR" value={driver.engineWear} unit="%" tone="purple" detail="POWER UNIT #1" />
              <MetricCard icon={CircleDot} label="PLANK WEAR" value={driver.plankWear} unit="mm" max={1.0} tone={driver.plankWear > 0.8 ? 'red' : 'green'} detail="FIA LIMIT 1.0mm" />
            </div>
          </section>

          {/* Lap Time Analysis */}
          <div className="lap-metrics-card">
            <div className="lap-stat">
              <span className="lap-label">LAST LAP</span>
              <strong className="lap-val">{formatLapTime(driver.lastLap)}</strong>
            </div>
            <div className="lap-stat pb">
              <span className="lap-label">PERSONAL BEST</span>
              <strong className="lap-val purple">{formatLapTime(driver.bestLap)}</strong>
            </div>
            <div className="lap-stat">
              <span className="lap-label">DELTA TO PB</span>
              <strong className="lap-val delta">+{Math.max(0, driver.lastLap - driver.bestLap).toFixed(3)}s</strong>
            </div>
          </div>
        </div>
      ) : (
        <div className="radio-panel-content">
          <div className="radio-header">
            <div className="radio-tag">
              <Radio size={14} />
              <span>CAR #{driver.number} · PIT WALL TEAM RADIO</span>
            </div>
            <span className="radio-live-indicator"><i /> LIVE FEED</span>
          </div>

          <div className="radio-message-list">
            {radioMessages.map((msg, index) => {
              const msgId = `radio-${driver.id}-${index}`
              const isPlaying = playingRadioId === msgId
              return (
                <div className={`radio-card ${isPlaying ? 'playing' : ''}`} key={index}>
                  <div className="radio-card-top">
                    <span className="radio-speaker-badge">{msg.speaker}</span>
                    <span className="radio-lap-tag">{msg.time}</span>
                  </div>
                  <p className="radio-transcript-quote">"{msg.text}"</p>
                  <div className="radio-audio-controls">
                    <button
                      className={`radio-audio-play-btn ${isPlaying ? 'playing' : ''}`}
                      onClick={() => handlePlayRadio(msg, index)}
                    >
                      {isPlaying ? <Square size={12} /> : <Play size={12} />}
                      <span>{isPlaying ? 'STOP TRANSMISSION' : 'PLAY RADIO AUDIO'}</span>
                    </button>
                    {isPlaying && (
                      <div className="radio-wave-bars">
                        <span /><span /><span /><span /><span />
                      </div>
                    )}
                    <span className="radio-duration">{msg.audioDurationSec}s</span>
                  </div>
                </div>
              )
            })}
          </div>

          <button className="radio-action-btn" onClick={() => onNotify('RADIO CHECK', 'Pit wall strategy confirmation transmitted.', 'success')}>
            <Send size={13} /> TRANSMIT STRATEGY DIRECTIVE
          </button>
        </div>
      )}

      {/* Floating Tactical Command Bar & Modal Trigger */}
      <div className="tactical-command-dock-bar">
        <div className="command-bar-info">
          <span className="command-bar-status-dot" />
          <div>
            <strong>PACE: {driver.paceMode} · ERS: {driver.ersMode}</strong>
            <small>{driver.boxThisLap ? `BOX THIS LAP (${pitCompound})` : 'STRATEGY ON SCHEDULE'}</small>
          </div>
        </div>
        <button
          className="dock-command-trigger-btn"
          onClick={() => setShowCommandModal(true)}
        >
          <Zap size={14} />
          <span>⚡ RACE COMMAND</span>
        </button>
      </div>

      {/* Strategic Command Modal / Slide-Up Drawer */}
      {showCommandModal && (
        <div className="command-modal-backdrop" onClick={() => setShowCommandModal(false)}>
          <div className="command-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="command-modal-header">
              <div className="modal-title">
                <span className="live-pulse-dot" />
                <strong>RACE ENGINEER COMMAND DOCK</strong>
              </div>
              <button className="close-modal-btn" onClick={() => setShowCommandModal(false)}>
                <X size={16} />
              </button>
            </div>

            <div className="command-modal-body">
              {/* Pace Mode Directive */}
              <div className="command-section">
                <div className="command-section-label">PACE DIRECTIVE</div>
                <div className="segmented-command-buttons">
                  {(['CONSERVE', 'BALANCED', 'ATTACK'] as PaceMode[]).map((mode) => (
                    <button
                      key={mode}
                      className={`command-btn ${driver.paceMode === mode ? 'active' : ''} mode-${mode.toLowerCase()}`}
                      onClick={() => setPace(mode)}
                    >
                      {mode === 'CONSERVE' && '🐢 CONSERVE'}
                      {mode === 'BALANCED' && '⚖️ BALANCED'}
                      {mode === 'ATTACK' && '⚡ ATTACK'}
                    </button>
                  ))}
                </div>
              </div>

              {/* ERS Deployment Mode */}
              <div className="command-section">
                <div className="command-section-label">ERS DEPLOYMENT PROGRAM</div>
                <div className="segmented-command-buttons">
                  {(['HARVEST', 'BALANCED', 'DEPLOY'] as ErsMode[]).map((mode) => (
                    <button
                      key={mode}
                      className={`command-btn ${driver.ersMode === mode ? 'active' : ''} ers-${mode.toLowerCase()}`}
                      onClick={() => setErs(mode)}
                    >
                      {mode === 'HARVEST' && '🔋 HARVEST'}
                      {mode === 'BALANCED' && '⚖️ BALANCED'}
                      {mode === 'DEPLOY' && '🚀 OVERTAKE'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pit Stop Call */}
              <div className="command-section pit-section">
                <div className="command-section-label">PIT STOP TARGET COMPOUND</div>
                <div className="compound-selector-row">
                  {pitCompounds.map((compound) => (
                    <button
                      key={compound}
                      className={`compound-pill-btn ${pitCompound === compound ? 'active' : ''}`}
                      onClick={() => setPitCompound(compound)}
                    >
                      <TireBadge compound={compound} small />
                      <span>{compound}</span>
                    </button>
                  ))}
                </div>

                <button
                  className={`box-action-button ${driver.boxThisLap ? 'cancel-mode' : 'confirm-mode'}`}
                  onClick={togglePit}
                >
                  <div className="box-btn-main">
                    <strong>{driver.boxThisLap ? '❌ CANCEL PIT STOP' : '🏎️ BOX THIS LAP'}</strong>
                    <small>{driver.boxThisLap ? 'CAR WILL STAY OUT' : `FIT NEW ${pitCompound} TYRES`}</small>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  )
}
