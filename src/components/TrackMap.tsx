import { Camera, ChevronRight, CloudRain, Cuboid, Flag, Map, Maximize2, Radio, RadioTower, Sparkles, Video } from 'lucide-react'
import { lazy, Suspense, useRef, useState } from 'react'
import type { DriverState, RaceSnapshot, WorkerCommand } from '../types'
import { DopplerRadarOverlay } from './DopplerRadarOverlay'

const RaceScene3D = lazy(() => import('./RaceScene3D').then((module) => ({ default: module.RaceScene3D })))

interface TrackMapProps {
  snapshot: RaceSnapshot
  selectedDriver: DriverState
  onSelectDriver: (driverId: string) => void
  onOpenStrategy: () => void
  sendCommand?: (command: WorkerCommand) => void
}

const CIRCUIT_PATH = 'M 128 316 C 91 286 77 237 101 200 C 120 171 155 174 171 143 C 185 115 154 94 179 64 C 209 30 272 41 302 73 C 329 102 353 117 389 98 C 430 77 450 36 500 45 C 547 53 558 90 542 116 C 524 145 485 149 472 177 C 458 207 493 224 532 213 C 575 201 621 214 645 246 C 669 279 653 317 616 330 C 579 344 558 317 522 325 C 486 334 476 373 434 380 C 391 388 364 354 324 348 C 283 342 255 374 213 370 C 170 366 151 338 128 316 Z'

export function TrackMap({ snapshot, selectedDriver, onSelectDriver, onOpenStrategy, sendCommand }: TrackMapProps) {
  const pathRef = useRef<SVGPathElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const [viewMode, setViewMode] = useState<'3d' | 'map' | 'radar'>('3d')
  const [cameraMode, setCameraMode] = useState<'broadcast' | 'onboard'>('broadcast')
  const [radarOverlayActive, setRadarOverlayActive] = useState(true)

  const getCarPoint = (progress: number) => {
    const path = pathRef.current
    if (!path) return { x: 128, y: 316 }
    const length = path.getTotalLength()
    const point = path.getPointAtLength((((progress % 1) + 1) % 1) * length)
    return { x: point.x, y: point.y }
  }

  const requestFullscreen = () => stageRef.current?.requestFullscreen?.()

  const handleRainfallChange = (rainfall: number) => {
    sendCommand?.({ type: 'WEATHER', rainfall })
  }

  return (
    <section className={`panel track-panel view-${viewMode} camera-${cameraMode}`}>
      <div className="track-panel-header">
        <div>
          <span className="eyebrow">INTERACTIVE RACE WORLD</span>
          <h2>Silverstone <small>LIVE · 5.891 KM</small></h2>
        </div>
        <div className="track-controls">
          <div className="segment-control view-selector">
            <button className={viewMode === '3d' ? 'active' : ''} onClick={() => setViewMode('3d')}>
              <Cuboid size={14} /> 3D RACE
            </button>
            <button className={viewMode === 'map' ? 'active' : ''} onClick={() => setViewMode('map')}>
              <Map size={14} /> MAP
            </button>
            <button className={viewMode === 'radar' ? 'active radar-btn' : 'radar-btn'} onClick={() => setViewMode('radar')}>
              <Radio size={14} /> DOPPLER RADAR
            </button>
          </div>

          {viewMode !== 'radar' && (
            <button
              className={`icon-button radar-toggle-chip ${radarOverlayActive ? 'active' : ''}`}
              onClick={() => setRadarOverlayActive(!radarOverlayActive)}
              title="Toggle Doppler radar precipitation overlay"
            >
              <CloudRain size={15} />
            </button>
          )}

          <button
            disabled={viewMode !== '3d'}
            className={`icon-button ${viewMode === '3d' && cameraMode === 'broadcast' ? 'active' : ''}`}
            onClick={() => setCameraMode('broadcast')}
            title="Trackside chase camera"
          >
            <Video size={15} />
          </button>
          <button
            disabled={viewMode !== '3d'}
            className={`icon-button ${viewMode === '3d' && cameraMode === 'onboard' ? 'active' : ''}`}
            onClick={() => setCameraMode('onboard')}
            title="Onboard camera"
          >
            <Camera size={15} />
          </button>
          <button className="icon-button" title="Fullscreen" onClick={requestFullscreen}>
            <Maximize2 size={15} />
          </button>
        </div>
      </div>

      <div className="track-stage" ref={stageRef}>
        {viewMode === '3d' && (
          <Suspense fallback={<div className="scene-loader"><i /><strong>BUILDING 3D RACE WORLD</strong><span>Loading cars, circuit and grandstands…</span></div>}>
            <RaceScene3D
              drivers={snapshot.drivers}
              selectedDriverId={selectedDriver.id}
              cameraMode={cameraMode}
              onSelectDriver={onSelectDriver}
              rainfall={snapshot.rainfall}
              showDopplerRadar={radarOverlayActive}
            />
          </Suspense>
        )}

        {viewMode === 'map' && (
          <>
            {/* Background Doppler Radar Sweep & Precipitation Heatmap under 2D track */}
            {radarOverlayActive && (
              <div className="track-map-radar-layer">
                <DopplerRadarOverlay
                  rainfall={snapshot.rainfall}
                  trackTemp={snapshot.trackTemp}
                  airTemp={snapshot.airTemp}
                  onRainfallChange={handleRainfallChange}
                  showControls={false}
                  compact={true}
                />
              </div>
            )}

            <div className="track-grid" />
            <div className="track-location-label label-stowe">STOWE</div>
            <div className="track-location-label label-copse">COPSE</div>
            <div className="track-location-label label-maggotts">MAGGOTTS<br />&amp; BECKETTS</div>
            <div className="track-location-label label-club">CLUB</div>
            <div className="sector-label sector-one">S1</div>
            <div className="sector-label sector-two">S2</div>
            <div className="sector-label sector-three">S3</div>

            <svg className="circuit-svg" viewBox="0 0 760 430" role="img" aria-label="Live Silverstone circuit map">
              <defs>
                <filter id="trackShadow" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="7" /></filter>
                <filter id="carGlow" x="-100%" y="-100%" width="300%" height="300%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
                <linearGradient id="roadGradient" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#2b3038" /><stop offset="0.52" stopColor="#191d23" /><stop offset="1" stopColor="#30343b" />
                </linearGradient>
              </defs>

              <path d={CIRCUIT_PATH} fill="none" stroke="#000" strokeOpacity="0.8" strokeWidth="38" filter="url(#trackShadow)" />
              <path d={CIRCUIT_PATH} fill="none" stroke="#676d75" strokeOpacity="0.42" strokeWidth="31" />
              <path d={CIRCUIT_PATH} fill="none" stroke="#eceff2" strokeOpacity="0.38" strokeWidth="27" strokeDasharray="2 10" />
              <path ref={pathRef} d={CIRCUIT_PATH} fill="none" stroke="url(#roadGradient)" strokeWidth="23" />
              <path d={CIRCUIT_PATH} fill="none" stroke="#090b0e" strokeOpacity="0.48" strokeWidth="4" />
              <path d={CIRCUIT_PATH} fill="none" stroke="#f54646" strokeOpacity="0.68" strokeWidth="2.2" strokeDasharray="88 550" strokeDashoffset="-405" />

              <g className="start-finish-line" transform="translate(119 307) rotate(-43)">
                <rect x="-2" y="-16" width="4" height="32" fill="#f3f4f5" />
                <rect x="-2" y="-16" width="4" height="5" fill="#15181c" /><rect x="-2" y="-6" width="4" height="5" fill="#15181c" /><rect x="-2" y="4" width="4" height="5" fill="#15181c" />
              </g>

              <g className="drs-zone" opacity="0.85">
                <path d="M 207 52 C 243 37 279 48 302 73" fill="none" stroke="#32d6a0" strokeWidth="3" strokeLinecap="round" />
                <text x="230" y="29" fill="#45e0ad" fontSize="9" fontWeight="700" letterSpacing="1.4">DRS 1</text>
                <path d="M 576 337 C 552 323 537 321 522 325" fill="none" stroke="#32d6a0" strokeWidth="3" strokeLinecap="round" />
                <text x="562" y="363" fill="#45e0ad" fontSize="9" fontWeight="700" letterSpacing="1.4">DRS 2</text>
              </g>

              {snapshot.drivers.slice().reverse().map((driver) => {
                const point = getCarPoint(driver.progress)
                const isSelected = driver.id === selectedDriver.id
                return (
                  <g key={driver.id} className={`map-car ${isSelected ? 'selected' : ''}`} transform={`translate(${point.x} ${point.y})`} onClick={() => onSelectDriver(driver.id)} role="button" aria-label={`Select ${driver.firstName} ${driver.lastName}`}>
                    {isSelected && <circle r="13" fill="none" stroke={driver.teamColor} strokeOpacity="0.34" strokeWidth="2"><animate attributeName="r" values="10;16;10" dur="2s" repeatCount="indefinite" /></circle>}
                    <circle r={isSelected ? 7 : 4.5} fill={driver.teamColor} stroke={isSelected ? '#fff' : '#0a0c10'} strokeWidth={isSelected ? 2 : 1.5} filter={isSelected ? 'url(#carGlow)' : undefined} />
                    {isSelected && (
                      <g transform="translate(10 -20)" className="map-driver-tag">
                        <rect x="0" y="0" rx="3" width="58" height="23" fill="#0b0e13" stroke={driver.teamColor} strokeWidth="1" />
                        <text x="8" y="15.5" fill="#fff" fontSize="11" fontWeight="800">P{driver.position} · {driver.code}</text>
                      </g>
                    )}
                  </g>
                )
              })}
            </svg>
            <div className="track-zoom-rail"><button>+</button><span /><button>−</button></div>
          </>
        )}

        {viewMode === 'radar' && (
          <div className="full-radar-view">
            <DopplerRadarOverlay
              rainfall={snapshot.rainfall}
              trackTemp={snapshot.trackTemp}
              airTemp={snapshot.airTemp}
              onRainfallChange={handleRainfallChange}
              showControls={true}
            />
          </div>
        )}

        {viewMode === '3d' && (
          <button className="race-action-prompt" onClick={onOpenStrategy}>
            <span className="action-prompt-icon"><Sparkles size={16} /></span>
            <span><small>NEXT DECISION</small><b>PIT WINDOW IN 2 LAPS</b><em>Hard tyre · projected P1</em></span>
            <ChevronRight size={17} />
          </button>
        )}

        <div className="track-card race-control-card">
          <span className="card-icon green"><Flag size={14} /></span>
          <div><small>RACE CONTROL</small><b>TRACK CLEAR</b></div>
          <i className="pulse-dot" />
        </div>

        <div className="track-card speed-trap-card">
          <span className="card-icon"><RadioTower size={14} /></span>
          <div><small>LIVE · {selectedDriver.code}</small><b>{Math.round(selectedDriver.speed)} <em>KM/H</em></b></div>
        </div>

        {viewMode === '3d' && (
          <div className="driver-3d-hud" style={{ '--hud-color': selectedDriver.teamColor } as React.CSSProperties}>
            <span className="hud-position">P{selectedDriver.position}</span>
            <div><small>FOCUS CAR</small><b>{selectedDriver.code}</b></div>
            <span><small>TYRE</small><b>{selectedDriver.tire.charAt(0)} · {selectedDriver.tireAge}L</b></span>
            <span><small>ERS</small><b>{selectedDriver.ers.toFixed(0)}%</b></span>
            <span><small>SPEED</small><b>{Math.round(selectedDriver.speed)}</b></span>
          </div>
        )}
      </div>
    </section>
  )
}
