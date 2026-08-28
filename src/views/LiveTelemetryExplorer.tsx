import { useEffect, useMemo, useState } from 'react'
import {
  Activity,
  ArrowRightLeft,
  AudioWaveform,
  Crosshair,
  Gauge,
  Layers,
  MapPin,
  Radio,
  Satellite,
  Square,
  ThermometerSun,
  Tv,
  Volume2,
  VolumeX,
  Zap,
} from 'lucide-react'
import { AudioWaveformVisualizer } from '../components/AudioWaveformVisualizer'
import { CircuitMapPreview } from '../components/CircuitMapPreview'
import {
  DEFAULT_DRIVERS,
  DEFAULT_MEETINGS,
  generateSyntheticGpsTrace,
  generateSyntheticLapTelemetry,
  getSampleStints,
  getSampleTeamRadio,
  type OpenF1Driver,
  type OpenF1LocationSample,
  type OpenF1Meeting,
} from '../services/openf1Service'
import { radioAudioService, type RadioAudioMode } from '../services/radioAudioService'
import { soundEngine } from '../services/soundEngine'
import { SplineTrackProjector, type Point3D } from '../utils/splineProjection'

export function LiveTelemetryExplorer() {
  const [selectedMeeting, setSelectedMeeting] = useState<OpenF1Meeting>(DEFAULT_MEETINGS[0])
  const [driver1Num, setDriver1Num] = useState<number>(4) // Norris
  const [driver2Num, setDriver2Num] = useState<number>(1) // Verstappen
  const [activeTab, setActiveTab] = useState<'telemetry' | 'stints' | 'radio' | 'gps' | 'weather'>('telemetry')
  const [activeRadioPlaying, setActiveRadioPlaying] = useState<string | null>(null)
  const [radioAcousticMode, setRadioAcousticMode] = useState<RadioAudioMode>(radioAudioService.getRadioMode())
  const [isEngineSoundActive, setIsEngineSoundActive] = useState(false)
  const [gpsSampleIdx, setGpsSampleIdx] = useState<number>(32)

  useEffect(() => {
    const unsubscribeRadio = radioAudioService.subscribe((isPlaying, id) => {
      setActiveRadioPlaying(isPlaying ? id : null)
    })
    const unsubscribeSound = soundEngine.subscribe((isRunning) => {
      setIsEngineSoundActive(isRunning)
    })
    return () => {
      unsubscribeRadio()
      unsubscribeSound()
      radioAudioService.stop()
      soundEngine.stop()
    }
  }, [])

  const driver1: OpenF1Driver = useMemo(
    () => DEFAULT_DRIVERS.find((d) => d.driver_number === driver1Num) || DEFAULT_DRIVERS[0],
    [driver1Num],
  )
  const driver2: OpenF1Driver = useMemo(
    () => DEFAULT_DRIVERS.find((d) => d.driver_number === driver2Num) || DEFAULT_DRIVERS[4],
    [driver2Num],
  )

  const telemetry1 = useMemo(() => generateSyntheticLapTelemetry(driver1Num), [driver1Num])
  const telemetry2 = useMemo(() => generateSyntheticLapTelemetry(driver2Num), [driver2Num])

  const stints1 = useMemo(() => getSampleStints(driver1Num), [driver1Num])
  const stints2 = useMemo(() => getSampleStints(driver2Num), [driver2Num])

  const radio1 = useMemo(() => getSampleTeamRadio(driver1Num), [driver1Num])
  const radio2 = useMemo(() => getSampleTeamRadio(driver2Num), [driver2Num])

  // Track max speeds
  const maxSpeed1 = useMemo(() => Math.max(...telemetry1.map((t) => t.speed)), [telemetry1])
  const maxSpeed2 = useMemo(() => Math.max(...telemetry2.map((t) => t.speed)), [telemetry2])

  // Spline Track Projection Setup for Silverstone Circuit
  const silverstoneSplinePoints: Point3D[] = useMemo(
    () => [
      { x: -140, y: 0, z: 330 },
      { x: 150, y: 1.5, z: 330 },
      { x: 380, y: 3.2, z: 330 },
      { x: 420, y: 6.5, z: 280 },
      { x: 360, y: 8.1, z: 220 },
      { x: 415, y: 12.4, z: 140 },
      { x: 290, y: 9.8, z: 60 },
      { x: 210, y: 5.2, z: 125 },
      { x: 125, y: 2.1, z: 140 },
      { x: 100, y: 0.8, z: 190 },
      { x: 165, y: 0, z: 260 },
    ],
    [],
  )

  const projector = useMemo(() => new SplineTrackProjector(silverstoneSplinePoints, 14.0, 300), [silverstoneSplinePoints])

  const gpsTrace1: OpenF1LocationSample[] = useMemo(() => generateSyntheticGpsTrace(driver1Num, 120), [driver1Num])
  const gpsTrace2: OpenF1LocationSample[] = useMemo(() => generateSyntheticGpsTrace(driver2Num, 120), [driver2Num])

  const currentGps1 = gpsTrace1[gpsSampleIdx % gpsTrace1.length] || gpsTrace1[0]
  const currentGps2 = gpsTrace2[gpsSampleIdx % gpsTrace2.length] || gpsTrace2[0]

  const projection1 = useMemo(
    () => projector.projectPoint({ x: currentGps1.x, y: currentGps1.y, z: currentGps1.z }),
    [projector, currentGps1],
  )
  const projection2 = useMemo(
    () => projector.projectPoint({ x: currentGps2.x, y: currentGps2.y, z: currentGps2.z }),
    [projector, currentGps2],
  )

  // Live telemetry feed to procedural V6 SoundEngine
  useEffect(() => {
    if (!isEngineSoundActive) return
    let sampleIdx = 0
    const interval = setInterval(() => {
      const sample = telemetry1[sampleIdx % telemetry1.length]
      soundEngine.updateTelemetry({
        rpm: sample.rpm,
        throttle: sample.throttle,
        brake: sample.brake,
        speed: sample.speed,
        isErsActive: sample.drs > 0,
      })
      sampleIdx += 1
    }, 150)

    return () => clearInterval(interval)
  }, [isEngineSoundActive, telemetry1])

  const toggleEngineSound = () => {
    if (isEngineSoundActive) {
      soundEngine.stop()
    } else {
      soundEngine.start()
    }
  }

  const handlePlayRadio = (id: string, text: string, speaker: string, durationSec = 3.5) => {
    radioAudioService.playRadioTransmission({
      id,
      text,
      speaker,
      durationSec,
    })
  }

  const handleStopRadio = () => {
    radioAudioService.stop()
  }

  return (
    <div className="live-telemetry-workspace">
      {/* Top Banner & Session Selector */}
      <div className="live-telemetry-header">
        <div className="telemetry-title-badge">
          <Radio size={20} className="telemetry-live-beacon" />
          <div>
            <h2 className="workspace-main-title">OPENF1 REAL-TIME TELEMETRY EXPLORER</h2>
            <p className="workspace-sub-title">
              Official Session Telemetry, Speed Traces, Gear Selection & Pit Strategy Analytics
            </p>
          </div>
        </div>

        {/* Action Controls & Grand Prix Selector */}
        <div className="header-controls-cluster">
          {/* TV Broadcast Sync Status Badge */}
          <div className="tv-sync-status-badge" title="Live Broadcast Delay Buffer">
            <Tv size={14} className="tv-icon" />
            <span>DELAY: <strong>{radioAudioService.getBroadcastDelaySec()}s</strong></span>
          </div>

          {/* Procedural Engine Audio Toggle */}
          <button
            type="button"
            className={`engine-sound-toggle-btn ${isEngineSoundActive ? 'active' : ''}`}
            onClick={toggleEngineSound}
            title={isEngineSoundActive ? 'Stop V6 Engine Sound' : 'Start Procedural V6 Turbo-Hybrid Engine Audio'}
          >
            {isEngineSoundActive ? <Volume2 size={15} /> : <VolumeX size={15} />}
            <span>{isEngineSoundActive ? 'V6 ENGINE LIVE' : 'START V6 AUDIO'}</span>
          </button>

          {/* Grand Prix Selector */}
          <div className="gp-session-picker">
            <span className="picker-label">GRAND PRIX MEETING (24 ROUNDS)</span>
            <select
              className="f1-select-control"
              value={selectedMeeting.meeting_key}
              onChange={(e) => {
                const m = DEFAULT_MEETINGS.find((item) => item.meeting_key === Number(e.target.value))
                if (m) setSelectedMeeting(m)
              }}
            >
              {DEFAULT_MEETINGS.map((m, idx) => (
                <option key={m.meeting_key} value={m.meeting_key}>
                  R{idx + 1}: {m.year} {m.meeting_name} ({m.circuit_short_name})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Interactive Circuit Map Preview with On-Track Car Position Dots */}
      <CircuitMapPreview
        circuitKey={selectedMeeting.circuit_key}
        meetingName={selectedMeeting.meeting_name}
        location={selectedMeeting.location}
        country={selectedMeeting.country_name}
        driver1={driver1}
        driver2={driver2}
        maxSpeed1={maxSpeed1}
        maxSpeed2={maxSpeed2}
      />

      {/* Driver Head-to-Head Comparison Selector */}
      <div className="driver-comparison-deck">
        {/* Driver 1 Card */}
        <div className="driver-select-card primary" style={{ borderColor: `#${driver1.team_colour}` }}>
          <div className="driver-card-tag" style={{ background: `#${driver1.team_colour}` }}>
            DRIVER 1 (REFERENCE)
          </div>
          <div className="driver-card-content">
            <span className="driver-huge-number" style={{ color: `#${driver1.team_colour}` }}>
              #{driver1.driver_number}
            </span>
            <div className="driver-info">
              <strong className="driver-full-name">{driver1.full_name}</strong>
              <span className="driver-team-tag">{driver1.team_name}</span>
            </div>
            <select
              className="driver-quick-select"
              value={driver1Num}
              onChange={(e) => setDriver1Num(Number(e.target.value))}
            >
              {DEFAULT_DRIVERS.map((d) => (
                <option key={d.driver_number} value={d.driver_number}>
                  #{d.driver_number} {d.full_name} ({d.team_name})
                </option>
              ))}
            </select>
          </div>
          <div className="driver-stat-strip">
            <span>TOP SPEED: <strong>{maxSpeed1} KM/H</strong></span>
            <span>BEST LAP: <strong>1:27.097</strong></span>
          </div>
        </div>

        {/* VS Badge */}
        <div className="vs-comparison-badge">
          <ArrowRightLeft size={18} />
          <span>HEAD TO HEAD</span>
        </div>

        {/* Driver 2 Card */}
        <div className="driver-select-card rival" style={{ borderColor: `#${driver2.team_colour}` }}>
          <div className="driver-card-tag" style={{ background: `#${driver2.team_colour}` }}>
            DRIVER 2 (COMPARISON)
          </div>
          <div className="driver-card-content">
            <span className="driver-huge-number" style={{ color: `#${driver2.team_colour}` }}>
              #{driver2.driver_number}
            </span>
            <div className="driver-info">
              <strong className="driver-full-name">{driver2.full_name}</strong>
              <span className="driver-team-tag">{driver2.team_name}</span>
            </div>
            <select
              className="driver-quick-select"
              value={driver2Num}
              onChange={(e) => setDriver2Num(Number(e.target.value))}
            >
              {DEFAULT_DRIVERS.map((d) => (
                <option key={d.driver_number} value={d.driver_number}>
                  #{d.driver_number} {d.full_name} ({d.team_name})
                </option>
              ))}
            </select>
          </div>
          <div className="driver-stat-strip">
            <span>TOP SPEED: <strong>{maxSpeed2} KM/H</strong></span>
            <span>BEST LAP: <strong>1:27.241</strong></span>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="telemetry-subtabs">
        <button
          type="button"
          className={`subtab-btn ${activeTab === 'telemetry' ? 'active' : ''}`}
          onClick={() => setActiveTab('telemetry')}
        >
          <Activity size={15} />
          <span>LAP TELEMETRY OVERLAY</span>
        </button>
        <button
          type="button"
          className={`subtab-btn ${activeTab === 'stints' ? 'active' : ''}`}
          onClick={() => setActiveTab('stints')}
        >
          <Layers size={15} />
          <span>TIRE STINT STRATEGY</span>
        </button>
        <button
          type="button"
          className={`subtab-btn ${activeTab === 'radio' ? 'active' : ''}`}
          onClick={() => setActiveTab('radio')}
        >
          <Volume2 size={15} />
          <span>TEAM RADIO COMMS</span>
        </button>
        <button
          type="button"
          className={`subtab-btn ${activeTab === 'gps' ? 'active' : ''}`}
          onClick={() => setActiveTab('gps')}
        >
          <Satellite size={15} />
          <span>GPS TRACK PROJECTION</span>
        </button>
        <button
          type="button"
          className={`subtab-btn ${activeTab === 'weather' ? 'active' : ''}`}
          onClick={() => setActiveTab('weather')}
        >
          <ThermometerSun size={15} />
          <span>TRACK ATMOSPHERE</span>
        </button>
      </div>

      {/* Main Analysis Body */}
      {activeTab === 'telemetry' && (
        <div className="telemetry-charts-stack">
          {/* Speed Chart */}
          <div className="chart-card">
            <div className="chart-header">
              <div className="chart-title-group">
                <Gauge size={16} />
                <h4>SPEED PROFILE TRACE (KM/H)</h4>
              </div>
              <div className="chart-legend">
                <span className="legend-item" style={{ color: `#${driver1.team_colour}` }}>
                  ● #{driver1.driver_number} {driver1.name_acronym} ({driver1.team_name})
                </span>
                <span className="legend-item" style={{ color: `#${driver2.team_colour}` }}>
                  ● #{driver2.driver_number} {driver2.name_acronym} ({driver2.team_name})
                </span>
              </div>
            </div>

            <div className="svg-chart-wrapper">
              <svg viewBox="0 0 1000 240" className="telemetry-svg" preserveAspectRatio="none">
                {/* Horizontal Gridlines */}
                <line x1="40" y1="40" x2="980" y2="40" stroke="#1c2432" strokeDasharray="3 3" />
                <text x="15" y="44" fill="#6c7a92" fontSize="10">300</text>

                <line x1="40" y1="110" x2="980" y2="110" stroke="#1c2432" strokeDasharray="3 3" />
                <text x="15" y="114" fill="#6c7a92" fontSize="10">200</text>

                <line x1="40" y1="180" x2="980" y2="180" stroke="#1c2432" strokeDasharray="3 3" />
                <text x="15" y="184" fill="#6c7a92" fontSize="10">100</text>

                {/* Driver 1 Path */}
                <path
                  d={telemetry1
                    .map((t, idx) => {
                      const x = 50 + (idx / (telemetry1.length - 1)) * 920
                      const y = 220 - ((t.speed - 60) / 280) * 190
                      return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`
                    })
                    .join(' ')}
                  fill="none"
                  stroke={`#${driver1.team_colour}`}
                  strokeWidth="2.8"
                  strokeLinecap="round"
                />

                {/* Driver 2 Path */}
                <path
                  d={telemetry2
                    .map((t, idx) => {
                      const x = 50 + (idx / (telemetry2.length - 1)) * 920
                      const y = 220 - ((t.speed - 60) / 280) * 190
                      return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`
                    })
                    .join(' ')}
                  fill="none"
                  stroke={`#${driver2.team_colour}`}
                  strokeWidth="2.2"
                  strokeDasharray="4 2"
                  strokeLinecap="round"
                />

                {/* Corner Markers */}
                <text x="170" y="235" fill="#8e9bb0" fontSize="10">TURN 1 (ABBEY)</text>
                <text x="440" y="235" fill="#8e9bb0" fontSize="10">COPSE (T9)</text>
                <text x="710" y="235" fill="#8e9bb0" fontSize="10">HANGAR STRAIGHT / STOWE</text>
              </svg>
            </div>
          </div>

          {/* Throttle & Brake Chart */}
          <div className="chart-card">
            <div className="chart-header">
              <div className="chart-title-group">
                <Zap size={16} />
                <h4>THROTTLE & BRAKE INPUT APEX TRACES (%)</h4>
              </div>
            </div>
            <div className="svg-chart-wrapper">
              <svg viewBox="0 0 1000 130" className="telemetry-svg" preserveAspectRatio="none">
                <line x1="40" y1="20" x2="980" y2="20" stroke="#1c2432" strokeDasharray="2 2" />
                <text x="10" y="24" fill="#30d158" fontSize="10">100%</text>

                <line x1="40" y1="100" x2="980" y2="100" stroke="#1c2432" />
                <text x="15" y="104" fill="#6c7a92" fontSize="10">0%</text>

                {/* Throttle line */}
                <path
                  d={telemetry1
                    .map((t, idx) => {
                      const x = 50 + (idx / (telemetry1.length - 1)) * 920
                      const y = 100 - (t.throttle / 100) * 80
                      return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`
                    })
                    .join(' ')}
                  fill="none"
                  stroke="#30d158"
                  strokeWidth="2"
                />

                {/* Brake line */}
                <path
                  d={telemetry1
                    .map((t, idx) => {
                      const x = 50 + (idx / (telemetry1.length - 1)) * 920
                      const y = 100 - (t.brake / 100) * 80
                      return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`
                    })
                    .join(' ')}
                  fill="none"
                  stroke="#ff3b30"
                  strokeWidth="2"
                />
              </svg>
            </div>
            <div className="pedal-legend">
              <span className="legend-throttle">🟢 THROTTLE 100%</span>
              <span className="legend-brake">🔴 BRAKE PRESSURE</span>
            </div>
          </div>
        </div>
      )}

      {/* Stints View */}
      {activeTab === 'stints' && (
        <div className="stints-stack">
          <div className="stint-card">
            <h4 style={{ color: `#${driver1.team_colour}` }}>
              #{driver1.driver_number} {driver1.full_name} — TIRE COMPOUND TIMELINE
            </h4>
            <div className="stint-bars-container">
              {stints1.map((s) => (
                <div
                  key={s.stint_number}
                  className={`stint-bar-segment ${s.compound.toLowerCase()}`}
                  style={{ flex: s.lap_end - s.lap_start + 1 }}
                >
                  <span className="stint-badge">STINT {s.stint_number}: {s.compound}</span>
                  <span className="stint-laps">LAPS {s.lap_start} → {s.lap_end}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="stint-card">
            <h4 style={{ color: `#${driver2.team_colour}` }}>
              #{driver2.driver_number} {driver2.full_name} — TIRE COMPOUND TIMELINE
            </h4>
            <div className="stint-bars-container">
              {stints2.map((s) => (
                <div
                  key={s.stint_number}
                  className={`stint-bar-segment ${s.compound.toLowerCase()}`}
                  style={{ flex: s.lap_end - s.lap_start + 1 }}
                >
                  <span className="stint-badge">STINT {s.stint_number}: {s.compound}</span>
                  <span className="stint-laps">LAPS {s.lap_start} → {s.lap_end}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Team Radio View */}
      {activeTab === 'radio' && (
        <div className="radio-workspace-container">
          {/* Active Radio Frequency HUD Banner */}
          <div className="radio-frequency-hud">
            <div className="radio-hud-status">
              <AudioWaveform size={18} className={`radio-wave-beacon ${activeRadioPlaying ? 'broadcasting' : ''}`} />
              <div>
                <span className="radio-freq-channel">VHF PIT-TO-CAR ENCRYPTED CHANNEL · 462.550 MHz</span>
                <p className="radio-freq-desc">
                  {activeRadioPlaying ? 'LIVE TRANSMISSION ACTIVE · AUDIO SYNTHESIS & SQUELCH FILTER ENGAGED' : 'STANDBY · SQUELCH GATE ARMED'}
                </p>
              </div>
            </div>

            <div className="radio-acoustic-modes" style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', color: '#8d99ae', fontWeight: 600 }}>ACOUSTICS:</span>
              {[
                { id: 'authentic' as RadioAudioMode, label: '📻 Authentic VHF' },
                { id: 'studio' as RadioAudioMode, label: '🎙️ Studio HD' },
                { id: 'raw' as RadioAudioMode, label: '🏎️ Cockpit Raw' },
              ].map(({ id, label }) => (
                <button
                  key={id}
                  type="button"
                  style={{
                    padding: '3px 8px',
                    fontSize: '11px',
                    borderRadius: '4px',
                    border: radioAcousticMode === id ? '1px solid #ff8000' : '1px solid #283244',
                    background: radioAcousticMode === id ? 'rgba(255,128,0,0.15)' : '#10141c',
                    color: radioAcousticMode === id ? '#ff8000' : '#8d99ae',
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                  onClick={() => {
                    setRadioAcousticMode(id)
                    radioAudioService.setRadioMode(id)
                  }}
                >
                  {label}
                </button>
              ))}
              <button
                type="button"
                style={{
                  padding: '3px 8px',
                  fontSize: '11px',
                  borderRadius: '4px',
                  border: '1px solid #30d158',
                  background: 'rgba(48,209,88,0.12)',
                  color: '#30d158',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
                onClick={() => radioAudioService.testTransmission('Will Joseph (Race Engineer)', 'Radio check, radio check. Loud and clear, pit confirm.')}
                title="Test Team Radio Voice"
              >
                TEST COMMS
              </button>
            </div>

            {activeRadioPlaying && (
              <div className="radio-live-controls">
                <AudioWaveformVisualizer
                  isPlaying={true}
                  barCount={20}
                  height={24}
                  teamColor="#00f0ff"
                  showFrequencyHz={true}
                />
                <button
                  type="button"
                  className="radio-abort-btn"
                  onClick={handleStopRadio}
                  title="Cut Transmission"
                >
                  <Square size={12} />
                  <span>STOP AUDIO</span>
                </button>
              </div>
            )}
          </div>

          <div className="radio-comms-grid">
            <div className="radio-driver-col">
              <h4 style={{ color: `#${driver1.team_colour}` }}>
                #{driver1.driver_number} {driver1.name_acronym} PIT WALL COMMS
              </h4>
              <div className="radio-messages-list">
                {radio1.map((r, i) => (
                  <div key={i} className={`radio-msg-card ${activeRadioPlaying === `d1-${i}` ? 'active-transmission' : ''}`}>
                    <div className="radio-msg-header">
                      <span className="radio-time">{r.time}</span>
                      <span className="radio-speaker">{r.speaker}</span>
                      {activeRadioPlaying === `d1-${i}` ? (
                        <button
                          type="button"
                          className="play-radio-btn playing"
                          onClick={handleStopRadio}
                        >
                          <Square size={11} />
                          <span>STOP</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="play-radio-btn"
                          onClick={() => handlePlayRadio(`d1-${i}`, r.text, r.speaker, r.audioDurationSec)}
                        >
                          <Volume2 size={13} />
                          <span>AUDIO CLIP</span>
                        </button>
                      )}
                    </div>
                    <p className="radio-transcript">"{r.text}"</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="radio-driver-col">
              <h4 style={{ color: `#${driver2.team_colour}` }}>
                #{driver2.driver_number} {driver2.name_acronym} PIT WALL COMMS
              </h4>
              <div className="radio-messages-list">
                {radio2.map((r, i) => (
                  <div key={i} className={`radio-msg-card ${activeRadioPlaying === `d2-${i}` ? 'active-transmission' : ''}`}>
                    <div className="radio-msg-header">
                      <span className="radio-time">{r.time}</span>
                      <span className="radio-speaker">{r.speaker}</span>
                      {activeRadioPlaying === `d2-${i}` ? (
                        <button
                          type="button"
                          className="play-radio-btn playing"
                          onClick={handleStopRadio}
                        >
                          <Square size={11} />
                          <span>STOP</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="play-radio-btn"
                          onClick={() => handlePlayRadio(`d2-${i}`, r.text, r.speaker, r.audioDurationSec)}
                        >
                          <Volume2 size={13} />
                          <span>AUDIO CLIP</span>
                        </button>
                      )}
                    </div>
                    <p className="radio-transcript">"{r.text}"</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* GPS Spline Track Projection View */}
      {activeTab === 'gps' && (
        <div className="gps-projection-workspace">
          {/* GPS Scrubber Header */}
          <div className="gps-scrubber-card">
            <div className="gps-scrubber-top">
              <div className="gps-title-group">
                <Satellite size={18} className="satellite-icon active" />
                <div>
                  <h4>REAL OPENF1 GPS COORDINATE SPLINE PROJECTOR</h4>
                  <p>Translating raw 3D Cartesian (X, Y, Z) telemetry into normalized track ribbon progress &amp; lateral racing line deviation.</p>
                </div>
              </div>
              <div className="gps-sample-chip">
                <Crosshair size={13} />
                <span>FRAME {gpsSampleIdx + 1} / {gpsTrace1.length}</span>
              </div>
            </div>

            <div className="gps-slider-wrapper">
              <input
                type="range"
                min={0}
                max={gpsTrace1.length - 1}
                value={gpsSampleIdx}
                onChange={(e) => setGpsSampleIdx(Number(e.target.value))}
                className="gps-lap-slider"
              />
              <div className="gps-slider-ticks">
                <span>START / FINISH (0%)</span>
                <span>SECTOR 1 (33%)</span>
                <span>SECTOR 2 (66%)</span>
                <span>FINAL CHICANE (100%)</span>
              </div>
            </div>
          </div>

          {/* Side-by-Side Driver Projection Matrix */}
          <div className="gps-drivers-grid">
            {/* Driver 1 GPS Card */}
            <div className="gps-driver-card" style={{ borderColor: `#${driver1.team_colour}` }}>
              <div className="gps-card-header" style={{ background: `linear-gradient(90deg, rgba(${parseInt(driver1.team_colour.slice(0, 2), 16)}, ${parseInt(driver1.team_colour.slice(2, 4), 16)}, ${parseInt(driver1.team_colour.slice(4, 6), 16)}, 0.15), transparent)` }}>
                <span className="gps-card-tag" style={{ color: `#${driver1.team_colour}` }}>
                  #{driver1.driver_number} {driver1.full_name} ({driver1.team_name})
                </span>
                <span className={`gps-track-status ${projection1.isOnTrack ? 'on-track' : 'off-track'}`}>
                  {projection1.isOnTrack ? '✅ ON TRACK' : '⚠️ TRACK LIMITS EXCEEDED'}
                </span>
              </div>

              <div className="gps-metrics-grid">
                <div className="gps-metric-item">
                  <span className="metric-label"><MapPin size={12} /> RAW GPS (X, Y, Z)</span>
                  <strong className="metric-val">[{currentGps1.x.toFixed(1)}, {currentGps1.y.toFixed(1)}, {currentGps1.z.toFixed(1)}]</strong>
                  <small>OpenF1 Cartesian Coordinates</small>
                </div>
                <div className="gps-metric-item">
                  <span className="metric-label">SPLINE PROGRESS (t)</span>
                  <strong className="metric-val" style={{ color: `#${driver1.team_colour}` }}>{(projection1.t * 100).toFixed(2)}%</strong>
                  <small>Normalized parameter t = {projection1.t.toFixed(4)}</small>
                </div>
                <div className="gps-metric-item">
                  <span className="metric-label">LATERAL DELTA</span>
                  <strong className="metric-val">{projection1.lateralOffset >= 0 ? `+${projection1.lateralOffset.toFixed(2)}m` : `${projection1.lateralOffset.toFixed(2)}m`}</strong>
                  <small>{projection1.lateralOffset >= 0 ? 'Left of Racing Line' : 'Right of Racing Line'}</small>
                </div>
                <div className="gps-metric-item">
                  <span className="metric-label">SPLINE DISTANCE</span>
                  <strong className="metric-val">{projection1.distance.toFixed(2)} m</strong>
                  <small>Distance to Center Ribbon</small>
                </div>
              </div>
            </div>

            {/* Driver 2 GPS Card */}
            <div className="gps-driver-card" style={{ borderColor: `#${driver2.team_colour}` }}>
              <div className="gps-card-header" style={{ background: `linear-gradient(90deg, rgba(${parseInt(driver2.team_colour.slice(0, 2), 16)}, ${parseInt(driver2.team_colour.slice(2, 4), 16)}, ${parseInt(driver2.team_colour.slice(4, 6), 16)}, 0.15), transparent)` }}>
                <span className="gps-card-tag" style={{ color: `#${driver2.team_colour}` }}>
                  #{driver2.driver_number} {driver2.full_name} ({driver2.team_name})
                </span>
                <span className={`gps-track-status ${projection2.isOnTrack ? 'on-track' : 'off-track'}`}>
                  {projection2.isOnTrack ? '✅ ON TRACK' : '⚠️ TRACK LIMITS EXCEEDED'}
                </span>
              </div>

              <div className="gps-metrics-grid">
                <div className="gps-metric-item">
                  <span className="metric-label"><MapPin size={12} /> RAW GPS (X, Y, Z)</span>
                  <strong className="metric-val">[{currentGps2.x.toFixed(1)}, {currentGps2.y.toFixed(1)}, {currentGps2.z.toFixed(1)}]</strong>
                  <small>OpenF1 Cartesian Coordinates</small>
                </div>
                <div className="gps-metric-item">
                  <span className="metric-label">SPLINE PROGRESS (t)</span>
                  <strong className="metric-val" style={{ color: `#${driver2.team_colour}` }}>{(projection2.t * 100).toFixed(2)}%</strong>
                  <small>Normalized parameter t = {projection2.t.toFixed(4)}</small>
                </div>
                <div className="gps-metric-item">
                  <span className="metric-label">LATERAL DELTA</span>
                  <strong className="metric-val">{projection2.lateralOffset >= 0 ? `+${projection2.lateralOffset.toFixed(2)}m` : `${projection2.lateralOffset.toFixed(2)}m`}</strong>
                  <small>{projection2.lateralOffset >= 0 ? 'Left of Racing Line' : 'Right of Racing Line'}</small>
                </div>
                <div className="gps-metric-item">
                  <span className="metric-label">SPLINE DISTANCE</span>
                  <strong className="metric-val">{projection2.distance.toFixed(2)} m</strong>
                  <small>Distance to Center Ribbon</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Weather View */}
      {activeTab === 'weather' && (
        <div className="weather-telemetry-grid">
          <div className="weather-metric-card">
            <span className="weather-label">TRACK TEMPERATURE</span>
            <strong className="weather-value">38.4 <small>°C</small></strong>
            <span className="weather-sub">Optimal tire heat range</span>
          </div>
          <div className="weather-metric-card">
            <span className="weather-label">AIR TEMPERATURE</span>
            <strong className="weather-value">24.1 <small>°C</small></strong>
            <span className="weather-sub">Dry ambient</span>
          </div>
          <div className="weather-metric-card">
            <span className="weather-label">WIND SPEED & DIRECTION</span>
            <strong className="weather-value">12.8 <small>KM/H</small></strong>
            <span className="weather-sub">Tailwind into Stowe (Turn 15)</span>
          </div>
          <div className="weather-metric-card">
            <span className="weather-label">RAIN RISK</span>
            <strong className="weather-value">0 <small>%</small></strong>
            <span className="weather-sub">0.0 mm / min precipitation</span>
          </div>
        </div>
      )}
    </div>
  )
}
