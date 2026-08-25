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
  return (
    <main className="race-dashboard">
      <TimingTower drivers={snapshot.drivers} selectedDriverId={selectedDriverId} onSelectDriver={onSelectDriver} />
      <div className="race-center-column">
        <TrackMap snapshot={snapshot} selectedDriver={selectedDriver} onSelectDriver={onSelectDriver} />
        <StrategyHorizon snapshot={snapshot} driver={selectedDriver} onOpenStrategy={onOpenStrategy} />
      </div>
      <DriverTelemetryPanel driver={selectedDriver} sendCommand={sendCommand} onNotify={onNotify} />
    </main>
  )
}
