import { CloudSun, FastForward, Pause, Play } from 'lucide-react'
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
    const next = speed === 1 ? 2 : speed === 2 ? 4 : speed === 4 ? 8 : 1
    onSpeedChange(next)
    sendCommand({ type: 'PLAYBACK', speed: next })
  }

  return (
    <section className="race-status-bar" aria-label="Race status">
      <div className="race-identity">
        <div className="live-pill"><span className="live-pulse-dot" /> LIVE</div>
        <div className="gp-meta">
          <strong>BRITISH GRAND PRIX 2026</strong>
          <span>ROUND 10 · SILVERSTONE GRAND PRIX CIRCUIT</span>
        </div>
      </div>

      <div className="race-progress-block">
        <div className="lap-counter">
          <span className="lap-tag">LAP</span>
          <strong className="current-lap">{snapshot.lap}</strong>
          <span className="total-laps">/ {snapshot.totalLaps}</span>
        </div>
        <div className="race-progress-track">
          <div
            className="race-progress-fill"
            style={{ width: `${Math.min(100, (snapshot.lap / snapshot.totalLaps) * 100)}%` }}
          />
        </div>
      </div>

      <div className="race-clock-block">
        <span className="clock-label">SESSION ELAPSED</span>
        <strong className="clock-time">{formatRaceTime(snapshot.elapsed)}</strong>
      </div>

      <div className="weather-strip">
        <CloudSun size={20} className="weather-icon" />
        <div className="weather-stat">
          <strong>{snapshot.airTemp.toFixed(0)}°C</strong>
          <small>AIR</small>
        </div>
        <div className="weather-stat">
          <strong>{snapshot.trackTemp.toFixed(0)}°C</strong>
          <small>TRACK</small>
        </div>
        <div className="weather-stat">
          <strong>{Math.round(snapshot.rainfall)}%</strong>
          <small>RAIN</small>
        </div>
      </div>

      <div className="track-state-block">
        <span className="status-flag-indicator green" />
        <strong className="status-text">{snapshot.raceStatus}</strong>
      </div>

      <div className="playback-controls-deck">
        <button
          className={`play-pause-btn ${paused ? 'is-paused' : 'is-running'}`}
          onClick={togglePause}
          aria-label={paused ? 'Resume simulation' : 'Pause simulation'}
        >
          {paused ? <Play size={16} fill="currentColor" /> : <Pause size={16} fill="currentColor" />}
          <span>{paused ? 'RESUME' : 'PAUSE'}</span>
        </button>

        <button className="speed-toggle-btn" onClick={cycleSpeed} title="Toggle simulation speed">
          <FastForward size={14} />
          <strong>{speed}×</strong>
        </button>
      </div>
    </section>
  )
}
