import { ArrowRight, CloudRain, GitCompareArrows, Sparkles } from 'lucide-react'
import type { DriverState, RaceSnapshot } from '../types'

interface StrategyHorizonProps {
  snapshot: RaceSnapshot
  driver: DriverState
  onOpenStrategy: () => void
}

export function StrategyHorizon({ snapshot, driver, onOpenStrategy }: StrategyHorizonProps) {
  const remaining = snapshot.totalLaps - snapshot.lap
  const pitLap = Math.min(snapshot.totalLaps - 3, snapshot.lap + 2)

  return (
    <section className="panel strategy-horizon">
      <div className="strategy-header">
        <div>
          <span className="eyebrow">PREDICTIVE MODEL · 48K MONTE CARLO RUNS</span>
          <h2>Strategy horizon</h2>
        </div>
        <div className="strategy-callout">
          <span className="ai-glyph"><Sparkles size={13} /></span>
          <div><small>RECOMMENDED WINDOW</small><b>BOX L{pitLap}–{pitLap + 1} · HARD</b></div>
        </div>
        <button className="text-action" onClick={onOpenStrategy}>FULL STRATEGY <ArrowRight size={13} /></button>
      </div>

      <div className="horizon-body">
        <div className="horizon-y-axis"><span>+4s</span><span>0s</span><span>−4s</span></div>
        <div className="horizon-chart">
          <svg viewBox="0 0 800 112" preserveAspectRatio="none" aria-label="Projected race position delta">
            <defs>
              <linearGradient id="orangeArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#ff7a18" stopOpacity="0.3" />
                <stop offset="1" stopColor="#ff7a18" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="greenArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#37d7a2" stopOpacity="0.16" />
                <stop offset="1" stopColor="#37d7a2" stopOpacity="0" />
              </linearGradient>
            </defs>
            {[18, 56, 94].map((y) => <line key={y} x1="0" y1={y} x2="800" y2={y} stroke="#29303a" strokeWidth="1" strokeDasharray="3 6" />)}
            {[100, 200, 300, 400, 500, 600, 700].map((x) => <line key={x} x1={x} y1="0" x2={x} y2="112" stroke="#1a2028" strokeWidth="1" />)}
            <path d="M 0 48 C 90 45, 140 52, 205 57 C 235 60, 260 76, 295 71 C 375 58, 460 48, 525 43 C 610 36, 685 30, 800 20 L 800 112 L 0 112 Z" fill="url(#orangeArea)" />
            <path d="M 0 48 C 90 45, 140 52, 205 57 C 235 60, 260 76, 295 71 C 375 58, 460 48, 525 43 C 610 36, 685 30, 800 20" fill="none" stroke="#ff8627" strokeWidth="2.6" vectorEffect="non-scaling-stroke" />
            <path d="M 0 56 C 110 57, 186 48, 256 45 C 335 42, 400 48, 476 55 C 568 63, 678 58, 800 64" fill="none" stroke="#ef4d55" strokeWidth="1.7" strokeDasharray="6 4" vectorEffect="non-scaling-stroke" />
            <path d="M 0 66 C 140 62, 215 64, 310 58 C 410 51, 502 49, 600 43 C 692 38, 740 39, 800 34" fill="none" stroke="#35d4c7" strokeWidth="1.4" strokeDasharray="2 4" vectorEffect="non-scaling-stroke" />
            <line x1="254" y1="0" x2="254" y2="112" stroke="#f3f5f8" strokeOpacity="0.58" strokeWidth="1" strokeDasharray="3 3" />
            <circle cx="254" cy="74" r="4" fill="#ff8627" stroke="#fff" strokeWidth="1.5" />
          </svg>
          <span className="pit-marker" style={{ left: '31.7%' }}><i /> BOX L{pitLap}</span>
          <span className="rain-marker"><CloudRain size={11} /> RAIN 18%</span>
          <div className="chart-laps">
            <span>L{snapshot.lap}</span><span>L{snapshot.lap + 5}</span><span>L{snapshot.lap + 10}</span><span>L{snapshot.lap + 15}</span><span>L{snapshot.totalLaps}</span>
          </div>
        </div>
        <div className="horizon-summary">
          <span><small>FINISH PROB.</small><b className="positive">P1 · 42%</b></span>
          <span><small>NET GAIN</small><b>+2.8s</b></span>
          <span><small>LAPS LEFT</small><b>{remaining}</b></span>
        </div>
      </div>

      <div className="stint-comparison">
        <div className="comparison-label"><GitCompareArrows size={13} /><span>{driver.code}</span></div>
        <div className="stint-track">
          <span className="stint stint-medium" style={{ width: `${Math.max(24, (pitLap - snapshot.lap) * 8)}%` }}><i>M</i> CURRENT</span>
          <span className="stint stint-hard"><i>H</i> TO FLAG</span>
        </div>
        <div className="legend-lines">
          <span><i style={{ background: '#ff8627' }} /> Optimized</span>
          <span><i style={{ background: '#ef4d55' }} /> Schumacher</span>
          <span><i style={{ background: '#35d4c7' }} /> Hamilton</span>
        </div>
      </div>
    </section>
  )
}
