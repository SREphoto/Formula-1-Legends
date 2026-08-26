import {
  Building2,
  ChevronDown,
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
  { id: 'hq', label: 'Team HQ', icon: Building2 },
]

export function AppHeader({ activeView, onViewChange, onHelp }: AppHeaderProps) {
  return (
    <header className="app-header">
      <button className="brand" onClick={() => onViewChange('race')} aria-label="Formula 1 Legends home">
        <span className="brand-mark" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <span className="brand-copy">
          <strong>F1 LEGENDS</strong>
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
            <span>HOW TO PLAY</span>
          </button>
        )}
        <div className="simulation-health" title="Deterministic physics worker online">
          <span className="health-dot" />
          <span><b>SIM</b> ONLINE</span>
        </div>
        <button className="season-chip">
          <Sparkles size={14} />
          <span>LEGENDS · S01</span>
          <ChevronDown size={13} />
        </button>
        <button className="profile-chip" aria-label="Open team profile">
          <span className="profile-badge">MH</span>
          <span className="profile-text"><b>McLAREN</b><small>TEAM PRINCIPAL</small></span>
          <ChevronDown size={14} />
        </button>
      </div>
    </header>
  )
}
