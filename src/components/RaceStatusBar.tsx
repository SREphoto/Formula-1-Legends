import { CloudSun, FastForward, Pause, Play, RotateCcw, Wifi } from 'lucide-react'
import type { RaceSnapshot, WorkerCommand } from '../types'
import { formatRaceTime } from '../utils/format'

interface RaceStatusBarProps {
  snapshot: RaceSnapshot
  paused: boolean
  speed: number
  onPausedChange: (paused: boolean) => void
  onSpeedChange: (speed: number) => void
  sendCommand: (command: WorkerCommand) => void
}

export function RaceStatusBar({
  snapshot,
  paused,
  speed,
  onPausedChange,
  onSpeedChange,
  sendCommand,
}: RaceStatusBarProps) {
  const togglePause = () => {
    const next = !paused
    onPausedChange(next)
    sendCommand({ type: 'PLAYBACK', paused: next })
  }

  const cycleSpeed = () => {
    const next = speed === 1 ? 2 : speed === 2 ? 4 : 1
    onSpeedChange(next)
    sendCommand({ type: 'PLAYBACK', speed: next })
  }

  return (
    <section className="race-status-bar" aria-label="Race status">
      <div className="race-identity">
        <div className="live-pill"><span /> LIVE</div>
        <div>
          <strong>BRITISH GRAND PRIX</strong>
          <span>ROUND 10 · SILVERSTONE CIRCUIT</span>
        </div>
      </div>

      <div className="race-progress-block">
        <div className="lap-counter">
          <span>LAP</span>
          <strong>{snapshot.lap}</strong>
          <em>/ {snapshot.totalLaps}</em>
        </div>
        <div className="race-progress-track">
          <span style={{ width: `${(snapshot.lap / snapshot.totalLaps) * 100}%` }} />
        </div>
      </div>

      <div className="race-clock">
        <span>RACE TIME</span>
        <strong>{formatRaceTime(snapshot.elapsed)}</strong>
      </div>

      <div className="weather-strip">
        <CloudSun size={21} strokeWidth={1.6} />
        <div><b>{snapshot.airTemp.toFixed(0)}°</b><small>AIR</small></div>
        <div><b>{snapshot.trackTemp.toFixed(0)}°</b><small>TRACK</small></div>
        <div><b>{Math.round(snapshot.rainfall)}%</b><small>RAIN</small></div>
      </div>

      <div className="track-state">
        <Wifi size={14} />
        <span className="green-flag" />
        <b>{snapshot.raceStatus}</b>
      </div>

      <div className="playback-controls">
        <button className="icon-button subtle" aria-label="Restart replay" title="Restart replay">
          <RotateCcw size={15} />
        </button>
        <button className="pause-button" onClick={togglePause} aria-label={paused ? 'Resume simulation' : 'Pause simulation'}>
          {paused ? <Play size={16} fill="currentColor" /> : <Pause size={16} fill="currentColor" />}
        </button>
        <button className="speed-button" onClick={cycleSpeed} title="Simulation speed">
          <FastForward size={14} /> {speed}×
        </button>
      </div>
    </section>
  )
}
