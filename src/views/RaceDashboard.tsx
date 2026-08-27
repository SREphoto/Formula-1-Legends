import { useState } from 'react'
import type { DriverState, RaceSnapshot, WorkerCommand } from '../types'
import { DriverTelemetryPanel } from '../components/DriverTelemetryPanel'
import { StrategyHorizon } from '../components/StrategyHorizon'
import { TimingTower } from '../components/TimingTower'
import { TrackMap } from '../components/TrackMap'

interface RaceDashboardProps {
  snapshot: RaceSnapshot
  selectedDriver: DriverState
  selectedDriverId: string
  onSelectDriver: (driverId: string) => void
  sendCommand: (command: WorkerCommand) => void
  onOpenStrategy: () => void
  onNotify: (title: string, message: string, tone?: 'success' | 'warning') => void
}

export function RaceDashboard({
  snapshot,
  selectedDriver,
  selectedDriverId,
  onSelectDriver,
  sendCommand,
  onOpenStrategy,
  onNotify,
}: RaceDashboardProps) {
  const [leftCollapsed, setLeftCollapsed] = useState(false)
  const [rightCollapsed, setRightCollapsed] = useState(false)
  const [bottomCollapsed, setBottomCollapsed] = useState(false)

  const layoutClasses = [
    'race-dashboard',
    leftCollapsed ? 'left-collapsed' : '',
    rightCollapsed ? 'right-collapsed' : '',
    bottomCollapsed ? 'bottom-collapsed' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <main className={layoutClasses}>
      <TimingTower
        drivers={snapshot.drivers}
        selectedDriverId={selectedDriverId}
        onSelectDriver={onSelectDriver}
        collapsed={leftCollapsed}
        onToggleCollapse={() => setLeftCollapsed(!leftCollapsed)}
      />

      <div className="race-center-column">
        <TrackMap
          snapshot={snapshot}
          selectedDriver={selectedDriver}
          onSelectDriver={onSelectDriver}
          onOpenStrategy={onOpenStrategy}
          sendCommand={sendCommand}
        />
        <StrategyHorizon
          snapshot={snapshot}
          driver={selectedDriver}
          onOpenStrategy={onOpenStrategy}
          collapsed={bottomCollapsed}
          onToggleCollapse={() => setBottomCollapsed(!bottomCollapsed)}
        />
      </div>

      <DriverTelemetryPanel
        driver={selectedDriver}
        sendCommand={sendCommand}
        onNotify={onNotify}
        collapsed={rightCollapsed}
        onToggleCollapse={() => setRightCollapsed(!rightCollapsed)}
      />
    </main>
  )
}
