import {
  Activity,
  Building2,
  HelpCircle,
  Radio,
  SlidersHorizontal,
  Sparkles,
} from 'lucide-react'
import type { AppView } from '../types'
import {
  F1SteeringWheelIcon,
  F1SuperlicenseIcon,
  F1TelemetryWaveIcon,
} from './F1Icons'
import type { PaddockCredentials } from './ParallaxAuthScreen'

interface AppHeaderProps {
  activeView: AppView
  onViewChange: (view: AppView) => void
  onHelp?: () => void
  credentials?: PaddockCredentials | null
  onOpenAuth?: () => void
}

const navItems: { id: AppView; label: string; icon: React.ElementType }[] = [
  { id: 'race', label: 'Race Center', icon: Radio },
  { id: 'strategy', label: 'Strategy', icon: F1TelemetryWaveIcon },
  { id: 'car', label: 'Car Lab', icon: SlidersHorizontal },
  { id: 'wheel', label: 'Cockpit Wheel', icon: F1SteeringWheelIcon },
  { id: 'hq', label: 'Team HQ', icon: Building2 },
  { id: 'telemetry', label: 'Live Telemetry', icon: Activity },
]

export function AppHeader({
  activeView,
  onViewChange,
  onHelp,
  credentials,
  onOpenAuth,
}: AppHeaderProps) {
  const teamColor = credentials?.teamColor || '#ff8000'
  const teamName = credentials?.teamName || 'MCLAREN F1'
  const roleTitle = credentials?.roleTitle || 'LEAD STRATEGIST'
  const badgeId = credentials?.badgeId || 'FIA-2026-MCL-7742'

  return (
    <header className="app-header">
      <button className="brand" onClick={() => onViewChange('race')} aria-label="Formula 1 2026 home">
        <span className="brand-mark" aria-hidden="true" style={{ background: teamColor }}>
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
        {navItems.map(({ id, label, icon: IconComponent }) => (
          <button
            key={id}
            className={`nav-item ${activeView === id ? 'active' : ''}`}
            onClick={() => onViewChange(id)}
          >
            <IconComponent size={15} />
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

        {/* Interactive Paddock Credentials & Auth Pass Trigger */}
        <button
          type="button"
          className="profile-chip interactive-auth-chip"
          onClick={onOpenAuth}
          title={`Paddock Access Pass: ${badgeId} — Click to reconfigure credentials`}
          aria-label="Paddock credentials and role profile"
        >
          <span className="profile-badge" style={{ background: teamColor, borderColor: credentials?.teamSecondaryColor || '#fff' }}>
            <F1SuperlicenseIcon size={14} color="#ffd700" />
          </span>
          <span className="profile-text">
            <b>{teamName.substring(0, 14).toUpperCase()}</b>
            <small>{roleTitle.toUpperCase()}</small>
          </span>
        </button>
      </div>
    </header>
  )
}

