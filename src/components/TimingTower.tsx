import { ChevronDown, Radio } from 'lucide-react'
import { useState } from 'react'
import type { DriverState } from '../types'
import { formatGap } from '../utils/format'

interface TimingTowerProps {
  drivers: DriverState[]
  selectedDriverId: string
  onSelectDriver: (driverId: string) => void
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

export function TimingTower({ drivers, selectedDriverId, onSelectDriver }: TimingTowerProps) {
  const [gapMode, setGapMode] = useState<'leader' | 'interval'>('leader')

  return (
    <aside className="panel timing-tower">
      <div className="panel-title-row timing-title">
        <div>
          <span className="eyebrow">LIVE CLASSIFICATION</span>
          <h2>Timing tower</h2>
        </div>
        <button className="mini-select">
          <span>Race</span><ChevronDown size={12} />
        </button>
      </div>

      <div className="timing-toolbar">
        <div className="segment-control compact">
          <button className={gapMode === 'leader' ? 'active' : ''} onClick={() => setGapMode('leader')}>GAP</button>
          <button className={gapMode === 'interval' ? 'active' : ''} onClick={() => setGapMode('interval')}>INT</button>
        </div>
        <span className="timing-sync"><i /> 10 HZ</span>
      </div>

      <div className="tower-columns" aria-hidden="true">
        <span>POS</span><span>DRIVER</span><span>TYRE</span><span>{gapMode === 'leader' ? 'GAP' : 'INT'}</span>
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
              style={{ '--team-color': driver.teamColor } as React.CSSProperties}
            >
              <span className="driver-position">{driver.position}</span>
              <span className="driver-accent" />
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
