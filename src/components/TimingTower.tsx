import { ChevronDown, ChevronLeft, Minimize2, Radio } from 'lucide-react'
import { useState } from 'react'
import type { DriverState } from '../types'
import { formatGap } from '../utils/format'
import { TeamLogoBadge } from './TeamGraphics'

interface TimingTowerProps {
  drivers: DriverState[]
  selectedDriverId: string
  onSelectDriver: (driverId: string) => void
  collapsed?: boolean
  onToggleCollapse?: () => void
}

const compoundLetter: Record<DriverState['tire'], string> = {
  SOFT: 'S',
  MEDIUM: 'M',
  HARD: 'H',
  INTERMEDIATE: 'I',
  WET: 'W',
}

export function TireBadge({ compound, small = false }: { compound: DriverState['tire']; small?: boolean }) {
  return (
    <span className={`tire-badge tire-${compound.toLowerCase()} ${small ? 'small' : ''}`} title={compound}>
      {compoundLetter[compound]}
    </span>
  )
}

export function TimingTower({
  drivers,
  selectedDriverId,
  onSelectDriver,
  collapsed = false,
  onToggleCollapse,
}: TimingTowerProps) {
  const [gapMode, setGapMode] = useState<'leader' | 'interval'>('leader')
  const [session, setSession] = useState<'Race' | 'Qualifying' | 'Practice'>('Race')
  const [showSessionMenu, setShowSessionMenu] = useState(false)

  if (collapsed) {
    return (
      <div className="panel-collapsed-rail left-rail">
        <button className="expand-rail-btn" onClick={onToggleCollapse} title="Expand Leaderboard & Timing Tower">
          <ChevronLeft size={16} />
          <span className="vertical-text">LEADERBOARD · P1 {drivers[0]?.code}</span>
        </button>
      </div>
    )
  }

  return (
    <aside className="panel timing-tower">
      <div className="panel-title-row timing-title">
        <div>
          <span className="eyebrow">LIVE CLASSIFICATION</span>
          <h2>Timing tower</h2>
        </div>
        <div className="timing-title-actions">
          <div style={{ position: 'relative' }}>
            <button
              className="mini-select"
              onClick={() => setShowSessionMenu(!showSessionMenu)}
              title="Switch Session View"
            >
              <span>{session}</span>
              <ChevronDown size={12} />
            </button>
            {showSessionMenu && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '4px',
                  background: '#131822',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '6px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.7)',
                  zIndex: 100,
                  display: 'flex',
                  flexDirection: 'column',
                  minWidth: '110px',
                  overflow: 'hidden',
                }}
              >
                {(['Race', 'Qualifying', 'Practice'] as const).map((s) => (
                  <button
                    key={s}
                    style={{
                      padding: '8px 12px',
                      background: session === s ? 'rgba(255,128,0,0.15)' : 'none',
                      border: 'none',
                      color: session === s ? 'var(--papaya)' : '#fff',
                      textAlign: 'left',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                    onClick={() => {
                      setSession(s)
                      setShowSessionMenu(false)
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
          {onToggleCollapse && (
            <button className="panel-collapse-trigger" onClick={onToggleCollapse} title="Collapse timing tower">
              <Minimize2 size={13} />
            </button>
          )}
        </div>
      </div>

      <div className="timing-toolbar">
        <div className="segment-control compact">
          <button
            className={gapMode === 'leader' ? 'active' : ''}
            onClick={() => setGapMode('leader')}
            title="Gap to Race Leader (P1)"
          >
            GAP TO P1
          </button>
          <button
            className={gapMode === 'interval' ? 'active' : ''}
            onClick={() => setGapMode('interval')}
            title="Interval to Car Directly Ahead"
          >
            INTERVAL
          </button>
        </div>
        <span className="timing-sync"><i /> LIVE 10 HZ</span>
      </div>

      <div className="tower-columns" aria-hidden="true">
        <span>POS</span><span>DRIVER</span><span>TYRE</span><span>{gapMode === 'leader' ? 'GAP TO P1' : 'INTERVAL'}</span>
      </div>

      <div className="driver-list">
        {drivers.map((driver) => {
          const selected = driver.id === selectedDriverId
          const displayedGap = gapMode === 'leader' ? driver.gap : driver.interval
          return (
            <button
              key={driver.id}
              className={`driver-row ${selected ? 'selected' : ''} ${driver.isManaged ? 'managed' : ''}`}
              onClick={() => onSelectDriver(driver.id)}
              style={{ '--team-color': driver.teamColor, '--team-secondary': driver.secondaryColor } as React.CSSProperties}
            >
              <div className="driver-row-angled-stripes" />
              <span className="driver-position">{driver.position}</span>
              <span className="driver-accent" />
              <div className="tower-team-logo">
                <TeamLogoBadge teamCode={driver.teamShort} size={15} glow={false} />
              </div>
              <span className="driver-identity">
                <span className="driver-code-line">
                  <b>{driver.code}</b>
                  {driver.isManaged && <Radio size={10} className="managed-radio" />}
                </span>
                <small>{driver.lastName}</small>
              </span>
              <span className="driver-tire">
                <TireBadge compound={driver.tire} small />
                <small>{driver.tireAge}L</small>
              </span>
              <span className={`driver-gap ${driver.position === 1 ? 'leader' : ''}`}>
                {driver.pitStatus === 'PITTING' ? <em>PIT</em> : formatGap(displayedGap)}
              </span>
              <span className="sector-dots" aria-label={`Sector ${driver.sector}`}>
                {[1, 2, 3].map((sector) => (
                  <i key={sector} className={sector < driver.sector ? 'purple' : sector === driver.sector ? 'green' : ''} />
                ))}
              </span>
            </button>
          )
        })}
      </div>

      <div className="tower-legend">
        <span><i className="legend-dot purple" /> Fastest</span>
        <span><i className="legend-dot green" /> Personal best</span>
        <span><i className="legend-dot yellow" /> Slower</span>
      </div>
    </aside>
  )
}
