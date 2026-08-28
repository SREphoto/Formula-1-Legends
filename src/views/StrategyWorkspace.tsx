import {
  ArrowRight,
  CheckCircle2,
  Compass,
  TrendingUp,
  Wind,
  Zap,
} from 'lucide-react'
import { useState } from 'react'
import type { DriverState, RaceSnapshot, TireCompound, WorkerCommand } from '../types'
import { TireBadge } from '../components/TimingTower'
import { ContextFocusCard } from '../components/ContextFocusCard'
import { F1TelemetryWaveIcon } from '../components/F1Icons'
import { TeamLogoBadge } from '../components/TeamGraphics'

interface StrategyWorkspaceProps {
  snapshot: RaceSnapshot
  selectedDriver: DriverState
  onSelectDriver: (id: string) => void
  sendCommand: (command: WorkerCommand) => void
  onNotify: (title: string, message: string, tone?: 'success' | 'warning') => void
}

type PlanKey = 'A' | 'B' | 'C'

interface StrategyPlan {
  id: PlanKey
  name: string
  subtitle: string
  compound: TireCompound
  stops: number
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH'
  projectedFinish: string
  delta: string
  winProbability: number
  pitWindow: string
  description: string
}

const STRATEGY_PLANS: Record<PlanKey, StrategyPlan> = {
  A: {
    id: 'A',
    name: 'PLAN A · 1-STOP OVERCUT (OPTIMAL)',
    subtitle: 'Medium (Current) → Hard to Flag',
    compound: 'HARD',
    stops: 1,
    riskLevel: 'LOW',
    projectedFinish: 'P1',
    delta: '+2.8s advantage',
    winProbability: 46,
    pitWindow: 'Laps 38 – 42',
    description: 'Extend current stint to overcut competitors, fitting durable Hard tyres to maintain target delta until the chequered flag.',
  },
  B: {
    id: 'B',
    name: 'PLAN B · 2-STOP SPRINT UNDERCUT',
    subtitle: 'Medium → Soft → Soft (Aggressive Attack)',
    compound: 'SOFT',
    stops: 2,
    riskLevel: 'MEDIUM',
    projectedFinish: 'P2',
    delta: '+0.9s advantage',
    winProbability: 32,
    pitWindow: 'Laps 35 & 46',
    description: 'Aggressive 2-stop sprint exploiting fresh Soft compound grip (+1.4s/lap) to make on-track overtakes in DRS zones.',
  },
  C: {
    id: 'C',
    name: 'PLAN C · RAIN CONTINGENCY',
    subtitle: 'Medium → Intermediate (Weather Cover)',
    compound: 'INTERMEDIATE',
    stops: 1,
    riskLevel: 'HIGH',
    projectedFinish: 'P3',
    delta: '-4.2s baseline',
    winProbability: 18,
    pitWindow: 'Lap 44 (On Rain Arrival)',
    description: 'Delay pit stop until track precipitation begins, avoiding an extra stop if rain arrives late in the race.',
  },
}

export function StrategyWorkspace({
  snapshot,
  selectedDriver,
  onSelectDriver,
  sendCommand,
  onNotify,
}: StrategyWorkspaceProps) {
  const [selectedPlan, setSelectedPlan] = useState<PlanKey>('A')
  const managedDrivers = snapshot.drivers.filter((driver) => driver.isManaged)
  const currentPlan = STRATEGY_PLANS[selectedPlan]

  const commitPlan = () => {
    sendCommand({ type: 'PIT_COMMAND', driverId: selectedDriver.id, compound: currentPlan.compound })
    onNotify(
      `STRATEGY ${currentPlan.id} COMMITTED`,
      `${selectedDriver.code} pit window scheduled: ${currentPlan.pitWindow} for ${currentPlan.compound} tyres.`,
      'success',
    )
  }

  // Lap ticks for chart
  const startLap = snapshot.lap
  const lapInterval = Math.max(2, Math.floor((snapshot.totalLaps - startLap) / 6))
  const chartLaps = [
    startLap,
    startLap + lapInterval,
    startLap + lapInterval * 2,
    startLap + lapInterval * 3,
    startLap + lapInterval * 4,
    snapshot.totalLaps,
  ]

  return (
    <main className="workspace strategy-workspace">
      {/* Workspace Header */}
      <div className="workspace-header-bar">
        <div>
          <span className="section-eyebrow">RACE STRATEGY AI DECISION HUB · LAP {snapshot.lap} OF {snapshot.totalLaps}</span>
          <h1 className="workspace-title">Pit Window &amp; Degradation Strategy</h1>
        </div>

        {/* Managed Driver Switcher with Team Graphics */}
        <div className="driver-selector-deck">
          {managedDrivers.map((driver) => {
            const isSelected = driver.id === selectedDriver.id
            return (
              <button
                key={driver.id}
                className={`driver-select-card ${isSelected ? 'active' : ''}`}
                onClick={() => onSelectDriver(driver.id)}
                style={{ '--team-color': driver.teamColor, '--team-secondary': driver.secondaryColor } as React.CSSProperties}
              >
                <div className="driver-select-angled-stripes" />
                <div className="select-badge-row">
                  <span className="select-num">#{driver.number}</span>
                  <TeamLogoBadge teamCode={driver.teamShort} size={18} glow={false} />
                </div>
                <div className="select-meta">
                  <strong>{driver.code} ({driver.shortName})</strong>
                  <small>P{driver.position} · {driver.tireAge}L on {driver.tire}</small>
                </div>
                <TireBadge compound={driver.tire} small />
              </button>
            )
          })}
        </div>
      </div>

      {/* Main Grid: Left Scenario Cards + Right Delta Chart & Timeline */}
      <div className="strategy-main-layout">
        {/* Left Column: Strategy Scenario Plans */}
        <section className="panel strategy-cards-column">
          <div className="card-panel-header">
            <div className="header-text">
              <span className="eyebrow">PREDICTIVE SIMULATIONS (48,000 RUNS)</span>
              <h2>Strategic Options</h2>
            </div>
            <span className="live-status-chip"><i /> REAL-TIME</span>
          </div>

          <div className="plans-stack">
            {(Object.keys(STRATEGY_PLANS) as PlanKey[]).map((key) => {
              const plan = STRATEGY_PLANS[key]
              const isSelected = selectedPlan === key
              return (
                <div
                  key={key}
                  className={`strategy-option-card ${isSelected ? 'active-plan' : ''} risk-${plan.riskLevel.toLowerCase()}`}
                  onClick={() => setSelectedPlan(key)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="plan-card-top">
                    <div className="plan-badge">
                      <span className="plan-letter">{plan.id}</span>
                      <div>
                        <strong>{plan.name}</strong>
                        <small>{plan.subtitle}</small>
                      </div>
                    </div>
                    <span className={`risk-tag risk-${plan.riskLevel.toLowerCase()}`}>{plan.riskLevel} RISK</span>
                  </div>

                  <p className="plan-desc">{plan.description}</p>

                  <div className="plan-kpis-grid">
                    <div className="plan-kpi">
                      <small>TARGET TYRE</small>
                      <div className="compound-target">
                        <TireBadge compound={plan.compound} small />
                        <strong>{plan.compound}</strong>
                      </div>
                    </div>
                    <div className="plan-kpi">
                      <small>PROJ. FINISH</small>
                      <strong className="finish-highlight">{plan.projectedFinish}</strong>
                    </div>
                    <div className="plan-kpi">
                      <small>RACE DELTA</small>
                      <strong className={plan.delta.startsWith('+') ? 'positive-delta' : 'negative-delta'}>{plan.delta}</strong>
                    </div>
                    <div className="plan-kpi">
                      <small>WIN PROB.</small>
                      <strong>{plan.winProbability}%</strong>
                    </div>
                  </div>

                  {isSelected && (
                    <button className="commit-strategy-btn" onClick={(e) => { e.stopPropagation(); commitPlan() }}>
                      <CheckCircle2 size={16} />
                      <span>COMMIT STRATEGY {plan.id} TO CAR #{selectedDriver.number}</span>
                    </button>
                  )}
                </div>
              )
            })}
          </div>

          {/* Model AI Factors Focus Card */}
          <ContextFocusCard
            title="Monte Carlo AI Environmental Factors"
            eyebrow="48,000 NEURAL RUNS"
            icon={<F1TelemetryWaveIcon size={16} color="#38bdf8" />}
            accentColor="#38bdf8"
            defaultExpanded={true}
            summary={
              <div className="compact-kpi-row">
                <span>GRIP: <b>+1.2%</b></span>
                <span>TRAFFIC: <b>CLEAN AIR</b></span>
                <span>SC PROB: <b>18%</b></span>
              </div>
            }
          >
            <div className="ai-factors-card">
              <div className="factor-item">
                <Wind size={15} />
                <div>
                  <small>TRACK EVOLUTION</small>
                  <strong>+1.2% GRIP GAIN</strong>
                </div>
              </div>
              <div className="factor-item">
                <Compass size={15} />
                <div>
                  <small>PIT WINDOW TRAFFIC</small>
                  <strong>CLEAN AIR WINDOW</strong>
                </div>
              </div>
              <div className="factor-item">
                <Zap size={15} />
                <div>
                  <small>SAFETY CAR PROB.</small>
                  <strong>18% CHANCE</strong>
                </div>
              </div>
            </div>
          </ContextFocusCard>
        </section>

        {/* Right Column: High-Contrast Race Delta & Degradation Chart */}
        <section className="panel strategy-chart-column">
          <div className="card-panel-header">
            <div className="header-text">
              <span className="eyebrow">PROJECTED FINISH GAP VS. LEAD RUNNER</span>
              <h2>Race Delta &amp; Pit Window Forecast</h2>
            </div>
            <div className="chart-legend-pills">
              <span className="legend-pill orange"><i /> #{selectedDriver.number} {selectedDriver.code}</span>
              <span className="legend-pill red"><i /> #1 VER</span>
              <span className="legend-pill cyan"><i /> #16 LEC</span>
            </div>
          </div>

          {/* KPI Summary Row */}
          <div className="strategy-summary-cards">
            <div className="summary-card">
              <span className="summary-label">PROJECTED FINISH</span>
              <strong className="summary-val finish">{currentPlan.projectedFinish}</strong>
              <small className="positive-text"><TrendingUp size={11} /> +{Math.max(0, selectedDriver.position - 1)} Positions</small>
            </div>
            <div className="summary-card">
              <span className="summary-label">NET TIME DELTA</span>
              <strong className="summary-val">{currentPlan.delta}</strong>
              <small>vs. baseline stay out</small>
            </div>
            <div className="summary-card">
              <span className="summary-label">WIN PROBABILITY</span>
              <strong className="summary-val win">{currentPlan.winProbability}%</strong>
              <small className="positive-text">+8.4 pts in standings</small>
            </div>
            <div className="summary-card">
              <span className="summary-label">PIT LOSS DELTA</span>
              <strong className="summary-val">22.4s</strong>
              <small>Stationary + Pit Lane</small>
            </div>
          </div>

          {/* SVG Line Chart */}
          <div className="strategy-chart-container">
            <div className="chart-y-axis">
              <span>+10s</span>
              <span>+5s</span>
              <span>0s (LEADER)</span>
              <span>−5s</span>
              <span>−10s</span>
            </div>

            <div className="chart-svg-wrapper">
              <svg viewBox="0 0 900 240" preserveAspectRatio="none" className="strategy-svg-chart">
                <defs>
                  <linearGradient id="planAreaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ff8000" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#ff8000" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Grid Lines */}
                {[20, 68, 120, 172, 220].map((y) => (
                  <line key={y} x1="0" x2="900" y1={y} y2={y} stroke="#1e2634" strokeDasharray="3 4" />
                ))}

                {/* Pit Window Highlighted Zone */}
                <rect x="220" y="0" width="120" height="240" fill="#ff8000" fillOpacity="0.08" />
                <line x1="280" x2="280" y1="0" y2="240" stroke="#ff8000" strokeDasharray="4 4" strokeWidth="1.5" />

                {/* Curve Plan A (Managed Car) */}
                <path
                  d="M 0 120 C 100 115, 180 125, 230 148 C 260 162, 280 190, 310 180 C 400 150, 480 100, 600 70 C 720 40, 820 28, 900 20 L 900 240 L 0 240 Z"
                  fill="url(#planAreaGradient)"
                />
                <path
                  d="M 0 120 C 100 115, 180 125, 230 148 C 260 162, 280 190, 310 180 C 400 150, 480 100, 600 70 C 720 40, 820 28, 900 20"
                  fill="none"
                  stroke="#ff8000"
                  strokeWidth="3.5"
                />

                {/* Rival Car 1 (Verstappen) */}
                <path
                  d="M 0 122 C 120 130, 240 120, 360 118 C 480 115, 600 135, 750 150 C 820 158, 860 162, 900 168"
                  fill="none"
                  stroke="#e8002d"
                  strokeWidth="2"
                  strokeDasharray="6 4"
                />

                {/* Rival Car 2 (Leclerc) */}
                <path
                  d="M 0 138 C 140 144, 280 136, 420 122 C 540 110, 680 116, 800 108 C 850 104, 880 102, 900 98"
                  fill="none"
                  stroke="#00d2be"
                  strokeWidth="2"
                  strokeDasharray="3 3"
                />

                {/* Pit Window Optimal Box Point */}
                <circle cx="280" cy="184" r="6" fill="#ff8000" stroke="#ffffff" strokeWidth="2.5" />
              </svg>

              <div className="chart-pit-tag" style={{ left: '29%' }}>
                <span>OPTIMAL BOX (LAP 40)</span>
              </div>
            </div>

            {/* Clear, well-spaced lap labels */}
            <div className="chart-x-laps">
              {chartLaps.map((lap, i) => (
                <span key={i} className="lap-tick">LAP {lap}</span>
              ))}
            </div>
          </div>

          {/* Stint Degradation & Weather Strip */}
          <div className="strategy-stint-footer">
            <div className="stint-segment">
              <span className="stint-tag">STINT 1 (CURRENT)</span>
              <div className="stint-bar-info">
                <TireBadge compound={selectedDriver.tire} small />
                <strong>{selectedDriver.tire} · {selectedDriver.tireAge} LAPS DONE</strong>
                <span>DEGRADATION: 1.8% / LAP</span>
              </div>
            </div>
            <div className="stint-arrow"><ArrowRight size={18} /></div>
            <div className="stint-segment target">
              <span className="stint-tag">STINT 2 (TARGET)</span>
              <div className="stint-bar-info">
                <TireBadge compound={currentPlan.compound} small />
                <strong>{currentPlan.compound} · {snapshot.totalLaps - 40} LAPS TO FLAG</strong>
                <span className="green-text">PROJECTED DELTA: +0.65s / LAP</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
