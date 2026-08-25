import {
  ArrowDownRight,
  ArrowRight,
  ChevronRight,
  CloudRain,
  Info,
  Medal,
  Radio,
  ShieldAlert,
  Sparkles,
  TimerReset,
  TrendingUp,
  Umbrella,
  Users,
  Wind,
  Zap,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import type { DriverState, RaceSnapshot, TireCompound, WorkerCommand } from '../types'
import { TireBadge } from '../components/TimingTower'
import { formatLapTime } from '../utils/format'

interface StrategyWorkspaceProps {
  snapshot: RaceSnapshot
  selectedDriver: DriverState
  onSelectDriver: (id: string) => void
  sendCommand: (command: WorkerCommand) => void
  onNotify: (title: string, message: string, tone?: 'success' | 'warning') => void
}

type Plan = 'A' | 'B' | 'C'

const planMeta: Record<Plan, { name: string; compound: TireCompound; risk: string; finish: string; delta: string }> = {
  A: { name: 'ONE STOP · CONTROL', compound: 'HARD', risk: 'LOW RISK', finish: 'P1', delta: '+2.8s' },
  B: { name: 'TWO STOP · ATTACK', compound: 'SOFT', risk: 'MED RISK', finish: 'P2', delta: '+0.9s' },
  C: { name: 'RAIN COVER', compound: 'INTERMEDIATE', risk: 'VARIABLE', finish: 'P4', delta: '−5.1s' },
}

export function StrategyWorkspace({ snapshot, selectedDriver, onSelectDriver, sendCommand, onNotify }: StrategyWorkspaceProps) {
  const [plan, setPlan] = useState<Plan>('A')
  const [pitLap, setPitLap] = useState(snapshot.lap + 2)
  const [compound, setCompound] = useState<TireCompound>('HARD')
  const managedDrivers = snapshot.drivers.filter((driver) => driver.isManaged)
  const leader = snapshot.drivers[0]
  const meta = planMeta[plan]
  const finishChance = plan === 'A' ? 42 : plan === 'B' ? 31 : 12
  const lapsLeft = snapshot.totalLaps - snapshot.lap

  const weatherBars = useMemo(() => [8, 7, 9, 12, 18, 28, 38, 31, 22, 16, 12, 9], [])

  const activatePlan = () => {
    sendCommand({ type: 'PIT_COMMAND', driverId: selectedDriver.id, compound })
    onNotify('STRATEGY A ACTIVATED', `${selectedDriver.code}: box lap ${pitLap}, fit ${compound.toLowerCase()} tyres.`, 'success')
  }

  return (
    <main className="workspace strategy-workspace">
      <div className="workspace-heading">
        <div>
          <span className="eyebrow">LIVE DECISION ENGINE · LAP {snapshot.lap}</span>
          <h1>Race strategy</h1>
          <p>Compare outcomes, monitor crossover points and commit your pit window.</p>
        </div>
        <div className="driver-switcher">
          {managedDrivers.map((driver) => (
            <button key={driver.id} className={driver.id === selectedDriver.id ? 'active' : ''} onClick={() => onSelectDriver(driver.id)} style={{ '--team-color': driver.teamColor } as React.CSSProperties}>
              <span className="switch-number">{driver.number}</span>
              <span><small>CAR {driver.position}</small><b>{driver.code}</b></span>
              <TireBadge compound={driver.tire} small />
            </button>
          ))}
        </div>
      </div>

      <div className="strategy-workspace-grid">
        <section className="panel strategy-plans-panel">
          <div className="workspace-panel-title">
            <div><span className="eyebrow">SCENARIO MODEL</span><h2>Strategy plans</h2></div>
            <span className="model-live"><i /> LIVE</span>
          </div>
          <div className="strategy-plan-list">
            {(Object.keys(planMeta) as Plan[]).map((key) => {
              const item = planMeta[key]
              return (
                <button key={key} className={`strategy-plan-card ${plan === key ? 'active' : ''}`} onClick={() => { setPlan(key); setCompound(item.compound) }}>
                  <span className="plan-letter">{key}</span>
                  <span className="plan-main"><small>{item.risk}</small><b>{item.name}</b><em>Projected finish <strong>{item.finish}</strong></em></span>
                  <TireBadge compound={item.compound} />
                  <span className={item.delta.startsWith('+') ? 'plan-delta positive' : 'plan-delta negative'}>{item.delta}</span>
                  <ChevronRight size={15} />
                </button>
              )
            })}
          </div>

          <div className="strategy-confidence">
            <div className="confidence-ring"><span>87<small>%</small></span></div>
            <div><small>MODEL CONFIDENCE</small><b>High-confidence window</b><p>Based on 48,240 simulations using live degradation and traffic.</p></div>
          </div>

          <div className="model-variables">
            <span><i><Wind size={13} /></i><small>TRACK EVOLUTION</small><b>+1.2%</b></span>
            <span><i><Users size={13} /></i><small>PIT TRAFFIC</small><b>LOW</b></span>
            <span><i><Zap size={13} /></i><small>SC RISK</small><b>18%</b></span>
          </div>
        </section>

        <section className="panel strategy-model-panel">
          <div className="workspace-panel-title">
            <div><span className="eyebrow">PLAN {plan} · PROJECTED RACE DELTA</span><h2>Position forecast</h2></div>
            <div className="forecast-legend"><span><i className="orange" />{selectedDriver.code}</span><span><i className="red" />{leader.id === selectedDriver.id ? 'SCH' : leader.code}</span><span><i className="cyan" />HAM</span></div>
          </div>

          <div className="forecast-summary-row">
            <div><small>PROJECTED FINISH</small><b className="big-position">{meta.finish}</b><span className="positive"><TrendingUp size={13} /> +{Math.max(0, selectedDriver.position - Number(meta.finish.slice(1)))} POS</span></div>
            <div><small>RACE TIME DELTA</small><b>{meta.delta}</b><span>vs. stay out</span></div>
            <div><small>WIN PROBABILITY</small><b>{finishChance}%</b><span>+8.4 pts</span></div>
            <div><small>PIT LOSS</small><b>22.6s</b><span>green flag</span></div>
          </div>

          <div className="large-forecast-chart">
            <div className="chart-axis"><span>+8s</span><span>+4s</span><span>0s</span><span>−4s</span><span>−8s</span></div>
            <div className="forecast-canvas">
              <svg viewBox="0 0 900 250" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="forecastArea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ff7a18" stopOpacity="0.32" /><stop offset="1" stopColor="#ff7a18" stopOpacity="0" /></linearGradient>
                  <filter id="lineGlow"><feGaussianBlur stdDeviation="3" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
                </defs>
                {[20, 72, 124, 176, 228].map((y) => <line key={y} x1="0" x2="900" y1={y} y2={y} stroke="#28303a" strokeDasharray="4 6" />)}
                {[0, 112, 225, 337, 450, 562, 675, 787, 899].map((x) => <line key={x} x1={x} x2={x} y1="0" y2="250" stroke="#1d232b" />)}
                <path d="M 0 125 C 90 119 160 125 220 143 C 248 152 273 190 310 181 C 388 163 426 127 494 104 C 588 71 676 59 760 40 C 816 29 850 27 900 20 L 900 250 L 0 250 Z" fill="url(#forecastArea)" />
                <path d="M 0 125 C 90 119 160 125 220 143 C 248 152 273 190 310 181 C 388 163 426 127 494 104 C 588 71 676 59 760 40 C 816 29 850 27 900 20" fill="none" stroke="#ff8424" strokeWidth="3" filter="url(#lineGlow)" vectorEffect="non-scaling-stroke" />
                <path d="M 0 126 C 105 132 183 121 264 116 C 340 111 405 115 485 130 C 574 145 655 151 733 156 C 803 160 847 157 900 166" fill="none" stroke="#ee4b53" strokeWidth="2" strokeDasharray="7 5" vectorEffect="non-scaling-stroke" />
                <path d="M 0 140 C 105 147 181 141 267 130 C 340 121 421 112 501 119 C 590 125 675 112 754 106 C 819 101 853 103 900 98" fill="none" stroke="#35d4c7" strokeWidth="1.8" strokeDasharray="3 5" vectorEffect="non-scaling-stroke" />
                <rect x="250" y="0" width="72" height="250" fill="#ff7a18" opacity="0.055" />
                <line x1="286" x2="286" y1="0" y2="250" stroke="#ff9b50" strokeDasharray="3 4" />
                <circle cx="286" cy="186" r="5" fill="#ff8424" stroke="#fff" strokeWidth="2" />
              </svg>
              <div className="pit-window-band" style={{ left: '27.7%', width: '8%' }}><span>PIT WINDOW</span></div>
              <div className="forecast-laps"><span>L{snapshot.lap}</span><span>L{snapshot.lap + 3}</span><span>L{snapshot.lap + 6}</span><span>L{snapshot.lap + 9}</span><span>L{snapshot.lap + 12}</span><span>L{snapshot.lap + 15}</span><span>L{snapshot.lap + 18}</span><span>L{snapshot.totalLaps}</span></div>
            </div>
          </div>

          <div className="stint-plan-editor">
            <div className="stint-editor-label"><span>STINT PLAN</span><small>{lapsLeft} LAPS REMAINING</small></div>
            <div className="editable-stint-track">
              <span className="current-medium" style={{ width: `${((pitLap - snapshot.lap) / lapsLeft) * 100}%` }}><TireBadge compound={selectedDriver.tire} small /> {pitLap - snapshot.lap} LAPS</span>
              <span className={`next-${compound.toLowerCase()}`}><TireBadge compound={compound} small /> {snapshot.totalLaps - pitLap} LAPS · TO FLAG</span>
              <i className="pit-handle" style={{ left: `${((pitLap - snapshot.lap) / lapsLeft) * 100}%` }} />
            </div>
          </div>
        </section>

        <aside className="strategy-side-column">
          <section className="panel commit-strategy-card">
            <div className="recommendation-ribbon"><Sparkles size={13} /> AI RECOMMENDED</div>
            <div className="commit-title"><span>PLAN {plan}</span><b>{meta.name}</b><small>Undercut protection against {leader.id === selectedDriver.id ? 'Schumacher' : leader.lastName}</small></div>

            <label className="pit-lap-control">
              <span><small>PIT LAP</small><b>LAP {pitLap}</b></span>
              <input type="range" min={snapshot.lap + 1} max={Math.min(snapshot.lap + 8, snapshot.totalLaps - 2)} value={pitLap} onChange={(event) => setPitLap(Number(event.target.value))} />
              <span className="range-labels"><i>L{snapshot.lap + 1}</i><i>OPTIMAL</i><i>L{Math.min(snapshot.lap + 8, snapshot.totalLaps - 2)}</i></span>
            </label>

            <div className="compound-selector-block">
              <small>NEXT COMPOUND</small>
              <div className="large-compound-options">
                {(['SOFT', 'MEDIUM', 'HARD', 'INTERMEDIATE'] as TireCompound[]).map((item) => (
                  <button key={item} className={compound === item ? 'active' : ''} onClick={() => setCompound(item)}><TireBadge compound={item} /><span>{item === 'INTERMEDIATE' ? 'INTER' : item}</span></button>
                ))}
              </div>
            </div>

            <div className="pit-outcome-list">
              <span><i><ArrowDownRight size={14} /></i><small>REJOIN POSITION</small><b>P4 <em>+7.2s clean air</em></b></span>
              <span><i><TimerReset size={14} /></i><small>STOP TARGET</small><b>2.18s <em>P74 confidence</em></b></span>
              <span><i><Medal size={14} /></i><small>FINISH RANGE</small><b>P1–P3 <em>78% probability</em></b></span>
            </div>

            <button className="activate-plan-button" onClick={activatePlan}>
              <span>ACTIVATE PLAN {plan}<small>BOX LAP {pitLap} · FIT {compound}</small></span><ArrowRight size={18} />
            </button>
            <p className="commit-note"><Info size={12} /> Driver and pit crew will be notified immediately.</p>
          </section>

          <section className="panel weather-window-card">
            <div className="side-card-heading"><span><CloudRain size={15} /> WEATHER WINDOW</span><b>18% RAIN</b></div>
            <div className="weather-radar-mini">
              <div className="radar-rings"><i /><i /><i /><span className="rain-cell one" /><span className="rain-cell two" /><b>+</b></div>
              <div className="rain-timeline">
                {weatherBars.map((bar, index) => <span key={index}><i style={{ height: `${bar}px` }} /><small>{index % 3 === 0 ? `+${index * 2}m` : ''}</small></span>)}
              </div>
            </div>
            <div className="weather-alert"><Umbrella size={14} /><span><b>Light rain possible in 18 min</b><small>Turn 6 · confidence 64%</small></span></div>
          </section>

          <section className="panel rival-watch-card">
            <div className="side-card-heading"><span><Radio size={15} /> RIVAL WATCH</span><b>LIVE</b></div>
            {[snapshot.drivers.find((d) => d.id === 'sch'), snapshot.drivers.find((d) => d.id === 'ham')].filter(Boolean).map((rival) => rival && (
              <div className="rival-row" key={rival.id}>
                <span className="rival-color" style={{ background: rival.teamColor }} />
                <span><small>P{rival.position} · {rival.teamShort}</small><b>{rival.code}</b></span>
                <TireBadge compound={rival.tire} small />
                <span><small>LAST</small><b>{formatLapTime(rival.lastLap)}</b></span>
                <ShieldAlert size={14} className={rival.boxThisLap ? 'warning' : ''} />
              </div>
            ))}
          </section>
        </aside>
      </div>
    </main>
  )
}
