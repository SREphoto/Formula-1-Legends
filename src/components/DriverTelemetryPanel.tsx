import {
  CircleGauge,
  Headphones,
  MessageSquareText,
  Radio,
  Send,
  Settings2,
  ShieldCheck,
  Thermometer,
  TriangleAlert,
  Wrench,
  Zap,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import type { DriverState, ErsMode, PaceMode, TireCompound, WorkerCommand } from '../types'
import { formatLapTime } from '../utils/format'
import { TireBadge } from './TimingTower'

interface DriverTelemetryPanelProps {
  driver: DriverState
  sendCommand: (command: WorkerCommand) => void
  onNotify: (title: string, message: string, tone?: 'success' | 'warning') => void
}

const pitCompounds: TireCompound[] = ['SOFT', 'MEDIUM', 'HARD', 'INTERMEDIATE']

function MetricBar({ label, value, max = 100, suffix = '%', tone = 'cyan', detail }: { label: string; value: number; max?: number; suffix?: string; tone?: string; detail?: string }) {
  const percent = Math.max(0, Math.min(100, (value / max) * 100))
  return (
    <div className="metric-bar-block">
      <div className="metric-bar-label"><span>{label}</span><span>{detail && <small>{detail}</small>}<b>{value.toFixed(suffix === '°C' ? 0 : 1)}{suffix}</b></span></div>
      <div className="metric-bar"><i className={`fill-${tone}`} style={{ width: `${percent}%` }} /></div>
    </div>
  )
}

function TireTemperature({ position, surface, core, wear, compound }: { position: string; surface: number; core: number; wear: number; compound: TireCompound }) {
  const heat = surface > 112 ? 'hot' : surface < 88 ? 'cold' : 'optimal'
  return (
    <div className={`tire-temperature ${heat}`}>
      <div className="tire-visual">
        <span className="tire-heat-fill" style={{ height: `${Math.max(15, Math.min(100, ((surface - 60) / 70) * 100))}%` }} />
        <i />
      </div>
      <div className="tire-temp-copy">
        <span>{position}</span>
        <b>{surface.toFixed(0)}°</b>
        <small>CORE {core.toFixed(0)}°</small>
      </div>
      <div className="tire-wear-ring" style={{ '--wear': `${100 - wear}%` } as React.CSSProperties}>
        <span>{Math.round(100 - wear)}</span>
      </div>
      <TireBadge compound={compound} small />
    </div>
  )
}

export function DriverTelemetryPanel({ driver, sendCommand, onNotify }: DriverTelemetryPanelProps) {
  const [tab, setTab] = useState<'telemetry' | 'radio'>('telemetry')
  const [pitCompound, setPitCompound] = useState<TireCompound>('HARD')
  const rpm = Math.min(15000, Math.max(7200, 6800 + driver.speed * 22))
  const gear = Math.max(2, Math.min(8, Math.round(driver.speed / 43)))
  const throttle = Math.max(8, Math.min(100, 108 - (330 - driver.speed) * 0.78))

  const radioMessages = useMemo(() => [
    { sender: 'PIT', time: '43:08', message: `Gap to ${driver.position === 1 ? 'Schumacher behind' : 'the car ahead'} is ${Math.max(0.8, driver.interval).toFixed(1)} seconds. Pace is good.` },
    { sender: driver.code, time: '42:31', message: 'Balance is moving toward oversteer in the high speed. Fronts are okay.' },
    { sender: 'PIT', time: '41:54', message: 'Copy. Diff mid minus one. Strat mode six when ready.' },
  ], [driver.code, driver.interval, driver.position])

  const setPace = (paceMode: PaceMode) => {
    sendCommand({ type: 'DRIVER_COMMAND', driverId: driver.id, paceMode })
    onNotify('PACE COMMAND SENT', `${driver.code} switched to ${paceMode.toLowerCase()} pace.`, paceMode === 'ATTACK' ? 'warning' : 'success')
  }

  const setErs = (ersMode: ErsMode) => {
    sendCommand({ type: 'DRIVER_COMMAND', driverId: driver.id, ersMode })
    onNotify('ERS MODE UPDATED', `${driver.code}: ${ersMode.toLowerCase()} program active.`, 'success')
  }

  const togglePit = () => {
    if (driver.boxThisLap) {
      sendCommand({ type: 'PIT_COMMAND', driverId: driver.id, compound: pitCompound, cancel: true })
      onNotify('PIT CALL CANCELLED', `${driver.code} will stay out.`, 'warning')
    } else {
      sendCommand({ type: 'PIT_COMMAND', driverId: driver.id, compound: pitCompound })
      onNotify('BOX CONFIRMED', `${driver.code} will box for ${pitCompound.toLowerCase()} tyres.`, 'success')
    }
  }

  return (
    <aside className="panel telemetry-panel">
      <div className="driver-hero" style={{ '--driver-color': driver.teamColor } as React.CSSProperties}>
        <div className="driver-number">{driver.number}</div>
        <div className="driver-hero-main">
          <div className="driver-overline"><span>{driver.nationality}</span><i />{driver.team}</div>
          <h2><span>{driver.firstName}</span> {driver.lastName}</h2>
          <div className="driver-meta-row">
            <span className="position-chip">P{driver.position}</span>
            <span>{driver.tireAge} LAP STINT</span>
            <span className={driver.pitStatus !== 'NONE' ? 'status-orange' : ''}>{driver.pitStatus === 'NONE' ? 'ON TRACK' : driver.pitStatus.replace('_', ' ')}</span>
          </div>
        </div>
        <div className="driver-rating"><small>OVR</small><b>{driver.rating}</b></div>
      </div>

      <div className="telemetry-tabs">
        <button className={tab === 'telemetry' ? 'active' : ''} onClick={() => setTab('telemetry')}><CircleGauge size={13} /> TELEMETRY</button>
        <button className={tab === 'radio' ? 'active' : ''} onClick={() => setTab('radio')}><Headphones size={13} /> RADIO <i className="unread-dot" /></button>
      </div>

      {tab === 'telemetry' ? (
        <div className="telemetry-scroll">
          <div className="live-readout">
            <div><small>SPEED</small><b>{Math.round(driver.speed)}</b><span>KM/H</span></div>
            <div><small>GEAR</small><b>{gear}</b><span>GEAR</span></div>
            <div><small>RPM</small><b>{Math.round(rpm / 100) * 100}</b><span>REV/MIN</span></div>
          </div>

          <div className="input-telemetry">
            <div><span>THROTTLE</span><div><i className="throttle" style={{ width: `${throttle}%` }} /></div><b>{Math.round(throttle)}%</b></div>
            <div><span>BRAKE</span><div><i className="brake" style={{ width: `${Math.max(0, 100 - throttle * 1.35)}%` }} /></div><b>{Math.round(Math.max(0, 100 - throttle * 1.35))}%</b></div>
          </div>

          <section className="telemetry-section tire-section">
            <div className="subsection-heading">
              <span><Thermometer size={14} /> TYRE THERMALS</span>
              <span className="thermal-status"><i /> WINDOW</span>
            </div>
            <div className="tire-grid">
              <TireTemperature position="FL" surface={driver.tireSurfaceTemp + 1.4} core={driver.tireCoreTemp + 0.5} wear={driver.tireWear + 0.8} compound={driver.tire} />
              <TireTemperature position="FR" surface={driver.tireSurfaceTemp + 2.2} core={driver.tireCoreTemp + 0.9} wear={driver.tireWear + 1.2} compound={driver.tire} />
              <TireTemperature position="RL" surface={driver.tireSurfaceTemp - 1.5} core={driver.tireCoreTemp - 0.6} wear={driver.tireWear - 0.4} compound={driver.tire} />
              <TireTemperature position="RR" surface={driver.tireSurfaceTemp - 0.7} core={driver.tireCoreTemp - 0.2} wear={driver.tireWear} compound={driver.tire} />
            </div>
          </section>

          <section className="telemetry-section systems-section">
            <div className="subsection-heading"><span><Settings2 size={14} /> CAR SYSTEMS</span><span>10 HZ</span></div>
            <div className="systems-grid">
              <MetricBar label="ERS STORE" value={driver.ers} tone={driver.ers < 20 ? 'red' : 'cyan'} detail={driver.ersMode} />
              <MetricBar label="FUEL LOAD" value={driver.fuel} max={50} suffix=" kg" tone="orange" detail="−0.34 kg" />
              <MetricBar label="PLANK" value={driver.plankWear} max={1} suffix=" mm" tone={driver.plankWear > 0.8 ? 'red' : 'green'} detail="LIMIT 1.00" />
              <MetricBar label="ICE WEAR" value={driver.engineWear} tone="purple" detail="UNIT 03" />
            </div>
            <div className="brake-temperatures">
              <span><i className="brake-disc hot" /><small>FRONT BRAKES</small><b>{driver.brakeTempFront.toFixed(0)}°C</b></span>
              <span><i className="brake-disc" /><small>REAR BRAKES</small><b>{driver.brakeTempRear.toFixed(0)}°C</b></span>
            </div>
          </section>

          <div className="lap-performance-row">
            <span><small>LAST LAP</small><b>{formatLapTime(driver.lastLap)}</b></span>
            <span><small>PERSONAL BEST</small><b className="purple-text">{formatLapTime(driver.bestLap)}</b></span>
            <span><small>DELTA</small><b className="negative">+{Math.max(0, driver.lastLap - driver.bestLap).toFixed(3)}</b></span>
          </div>
        </div>
      ) : (
        <div className="radio-panel-content">
          <div className="radio-channel-head"><Radio size={15} /><div><b>CAR {driver.number} · PRIVATE CHANNEL</b><small>ENGINEER ↔ {driver.code}</small></div><span>LIVE</span></div>
          <div className="radio-waveform">{Array.from({ length: 34 }, (_, i) => <i key={i} style={{ height: `${7 + Math.abs(Math.sin(i * 1.7)) * 23}px` }} />)}</div>
          <div className="radio-message-list">
            {radioMessages.map((message, index) => (
              <div className={`radio-message ${message.sender === driver.code ? 'driver' : ''}`} key={`${message.time}-${index}`}>
                <span className="radio-sender">{message.sender}</span>
                <p>{message.message}</p>
                <time>{message.time}</time>
              </div>
            ))}
          </div>
          <button className="radio-compose"><MessageSquareText size={14} /> SEND PRESET MESSAGE <Send size={13} /></button>
        </div>
      )}

      <div className="command-dock">
        <div className="command-dock-heading">
          <div><span className="command-live-dot" /><b>COMMAND DOCK</b></div>
          <span>{driver.isManaged ? <><ShieldCheck size={12} /> TEAM CAR</> : <><TriangleAlert size={12} /> SPECTATOR MODE</>}</span>
        </div>

        <div className="command-row">
          <span className="command-label"><Wrench size={13} /> PACE</span>
          <div className="command-options three">
            {(['CONSERVE', 'BALANCED', 'ATTACK'] as PaceMode[]).map((mode) => (
              <button key={mode} className={driver.paceMode === mode ? 'active' : ''} onClick={() => setPace(mode)}>{mode === 'CONSERVE' ? 'CONSERVE' : mode === 'BALANCED' ? 'BALANCED' : 'ATTACK'}</button>
            ))}
          </div>
        </div>
        <p className="command-hint">How hard your driver pushes — ATTACK is quickest but eats tyres and fuel.</p>

        <div className="command-row">
          <span className="command-label"><Zap size={13} /> ERS</span>
          <div className="command-options three">
            {(['HARVEST', 'BALANCED', 'DEPLOY'] as ErsMode[]).map((mode) => (
              <button key={mode} className={driver.ersMode === mode ? 'active' : ''} onClick={() => setErs(mode)}>{mode === 'BALANCED' ? 'NEUTRAL' : mode}</button>
            ))}
          </div>
        </div>
        <p className="command-hint">Hybrid battery — HARVEST recharges it, DEPLOY spends it on extra speed.</p>

        <div className="pit-command">
          <div className="compound-choice">
            {pitCompounds.map((compound) => (
              <button key={compound} className={pitCompound === compound ? 'active' : ''} onClick={() => setPitCompound(compound)} title={compound}>
                <TireBadge compound={compound} />
              </button>
            ))}
          </div>
          <button className={`box-button ${driver.boxThisLap ? 'cancel' : ''}`} onClick={togglePit}>
            <span>{driver.boxThisLap ? 'CANCEL CALL' : 'BOX THIS LAP'}</span>
            <small>{driver.boxThisLap ? 'PIT WINDOW OPEN' : `FIT ${pitCompound} · ${driver.position === 1 ? 'REJOIN P4' : `REJOIN P${Math.min(20, driver.position + 3)}`}`}</small>
          </button>
        </div>
        <p className="command-hint pit-hint">Pick a tyre colour, then BOX THIS LAP schedules the stop. Soft is fast but wears fast — hard lasts.</p>
      </div>
    </aside>
  )
}
