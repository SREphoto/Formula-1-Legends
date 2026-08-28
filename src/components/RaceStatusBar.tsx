import { CloudSun, FastForward, Pause, Play, Sliders, Tv, X } from 'lucide-react'
import { useState } from 'react'
import type { RaceSnapshot, WorkerCommand } from '../types'
import { formatRaceTime } from '../utils/format'

interface RaceStatusBarProps {
  snapshot: RaceSnapshot
  paused: boolean
  speed: number
  onPausedChange: (paused: boolean) => void
  onSpeedChange: (speed: number) => void
  sendCommand: (command: WorkerCommand) => void
  broadcastDelaySec?: number
  onBroadcastDelayChange?: (sec: number) => void
}

export function RaceStatusBar({
  snapshot,
  paused,
  speed,
  onPausedChange,
  onSpeedChange,
  sendCommand,
  broadcastDelaySec = 0,
  onBroadcastDelayChange,
}: RaceStatusBarProps) {
  const [showSyncModal, setShowSyncModal] = useState(false)

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

  const handleSetDelay = (sec: number) => {
    const clamped = Math.max(0, Math.min(90, sec))
    if (onBroadcastDelayChange) {
      onBroadcastDelayChange(clamped)
    }
  }

  const getPresetLabel = () => {
    if (broadcastDelaySec === 0) return 'LIVE (0s)'
    if (broadcastDelaySec === 20) return 'F1 TV (20s)'
    if (broadcastDelaySec === 35) return 'SKY/ESPN (35s)'
    if (broadcastDelaySec === 60) return 'STREAM (60s)'
    return `${broadcastDelaySec}s DELAY`
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

      {/* TV Broadcast Synchronization Delay Scrubber Trigger */}
      <div className="tv-sync-control-wrapper">
        <button
          type="button"
          className={`tv-sync-pill-btn ${broadcastDelaySec > 0 ? 'delayed' : 'live-raw'}`}
          onClick={() => setShowSyncModal(!showSyncModal)}
          title="Adjust broadcast delay synchronization"
        >
          <Tv size={13} className="tv-icon" />
          <span className="tv-sync-label">SYNC: <strong>{getPresetLabel()}</strong></span>
          <Sliders size={11} className="tv-sliders-icon" />
        </button>

        {showSyncModal && (
          <div className="tv-sync-popover" onClick={(e) => e.stopPropagation()}>
            <div className="sync-popover-header">
              <div className="sync-header-title">
                <Tv size={14} />
                <strong>BROADCAST DELAY SYNC</strong>
              </div>
              <button
                type="button"
                className="close-popover-btn"
                onClick={() => setShowSyncModal(false)}
                aria-label="Close sync controls"
              >
                <X size={13} />
              </button>
            </div>

            <p className="sync-popover-desc">
              Synchronize on-track 3D cars, live telemetry, and pit radio with your live TV broadcast feed.
            </p>

            <div className="sync-slider-row">
              <div className="sync-slider-header">
                <span>BUFFER OFFSET</span>
                <strong>{broadcastDelaySec} SECONDS</strong>
              </div>
              <input
                type="range"
                min={0}
                max={90}
                step={1}
                value={broadcastDelaySec}
                onChange={(e) => handleSetDelay(Number(e.target.value))}
                className="sync-range-slider"
              />
              <div className="sync-range-ticks">
                <span>0s (LIVE)</span>
                <span>30s</span>
                <span>60s</span>
                <span>90s (MAX)</span>
              </div>
            </div>

            <div className="sync-presets-grid">
              {[
                { label: '0s Raw', sec: 0, tag: 'Zero Delay' },
                { label: '20s F1TV', sec: 20, tag: 'F1 TV Pro' },
                { label: '35s Sky/ESPN', sec: 35, tag: 'Live Cable TV' },
                { label: '60s Web', sec: 60, tag: 'OTT Stream' },
              ].map(({ label, sec, tag }) => (
                <button
                  key={sec}
                  type="button"
                  className={`sync-preset-btn ${broadcastDelaySec === sec ? 'active' : ''}`}
                  onClick={() => handleSetDelay(sec)}
                >
                  <strong>{label}</strong>
                  <small>{tag}</small>
                </button>
              ))}
            </div>
          </div>
        )}
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

