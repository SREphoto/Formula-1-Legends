import {
  Activity,
  Building2,
  CircleDot,
  Gauge,
  HelpCircle,
  Radio,
  SlidersHorizontal,
  Sparkles,
} from 'lucide-react'
import type { AppView } from '../types'

interface AppHeaderProps {
  activeView: AppView
  onViewChange: (view: AppView) => void
  onHelp?: () => void
}

const navItems: { id: AppView; label: string; icon: typeof Radio }[] = [
  { id: 'race', label: 'Race Center', icon: Radio },
  { id: 'strategy', label: 'Strategy', icon: Gauge },
  { id: 'car', label: 'Car Lab', icon: SlidersHorizontal },
  { id: 'wheel', label: 'Cockpit Wheel', icon: CircleDot },
  { id: 'hq', label: 'Team HQ', icon: Building2 },
  { id: 'telemetry', label: 'Live Telemetry', icon: Activity },
]

export function AppHeader({ activeView, onViewChange, onHelp }: AppHeaderProps) {
  return (
    <header className="app-header">
      <button className="brand" onClick={() => onViewChange('race')} aria-label="Formula 1 2026 home">
        <span className="brand-mark" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <span className="brand-copy">
          <strong>F1 2026</strong>
          <small>RACE COMMAND</small>
        </span>
      </button>

      <nav className="main-nav" aria-label="Main navigation">
        {navItems.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            className={`nav-item ${activeView === id ? 'active' : ''}`}
            onClick={() => onViewChange(id)}
          >
            <Icon size={15} strokeWidth={1.8} />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      <div className="header-actions">
        {onHelp && (
          <button className="help-button" onClick={onHelp} title="How to play">
            <HelpCircle size={14} />
            <span>RACE GUIDE</span>
          </button>
        )}
        <div className="simulation-health" title="100 Hz deterministic physics engine online">
          <span className="health-dot" />
          <span><b>100 HZ</b> SIM</span>
        </div>
        <div className="season-chip">
          <Sparkles size={14} />
          <span>SEASON 2026</span>
        </div>
        <div className="profile-chip" aria-label="Team principal profile">
          <span className="profile-badge">MCL</span>
          <span className="profile-text"><b>McLAREN F1</b><small>TEAM PRINCIPAL</small></span>
        </div>
      </div>
    </header>
  )
}
