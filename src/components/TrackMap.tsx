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

/**
 * Authentic Silverstone Grand Prix Circuit 2D Geometry (ViewBox 0 0 760 460)
 * 18 Verified Corners: Abbey -> Village -> Loop -> Wellington -> Brooklands -> Luffield -> Copse -> Maggotts/Becketts -> Stowe -> Vale -> Club
 */
const CIRCUIT_PATH = 'M 190 370 L 340 360 C 390 355 440 330 480 290 C 500 270 515 245 525 210 C 540 160 570 120 565 80 C 560 50 510 40 470 55 C 445 65 440 95 445 125 C 448 150 435 180 410 205 L 260 270 C 210 290 160 305 115 295 C 80 285 65 245 65 200 C 65 150 90 105 150 95 L 320 105 C 370 105 420 95 470 80 C 530 65 590 55 640 70 C 685 85 710 125 710 170 C 710 215 680 250 635 275 L 480 370 C 410 410 330 445 250 445 C 190 445 140 430 115 390 C 100 365 110 340 135 330 C 150 325 155 350 165 365 Z'

export function TrackMap({ snapshot, selectedDriver, onSelectDriver, onOpenStrategy, sendCommand }: TrackMapProps) {
  const pathRef = useRef<SVGPathElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const [viewMode, setViewMode] = useState<'3d' | 'map' | 'radar'>('3d')
  const [cameraMode, setCameraMode] = useState<'broadcast' | 'onboard'>('broadcast')
  const [radarOverlayActive, setRadarOverlayActive] = useState(true)
  const [zoomScale, setZoomScale] = useState(1)

  const handleZoomIn = () => setZoomScale((prev) => Math.min(2.5, +(prev + 0.25).toFixed(2)))
  const handleZoomOut = () => setZoomScale((prev) => Math.max(0.75, +(prev - 0.25).toFixed(2)))
  const handleZoomReset = () => setZoomScale(1)

  const getCarPoint = (progress: number) => {
    const path = pathRef.current
    if (!path) return { x: 190, y: 370 }
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
          <span className="eyebrow">AUTHENTIC FIA GRAND PRIX CIRCUIT</span>
          <h2>Silverstone <small>LIVE · 5.891 KM · 18 TURNS</small></h2>
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
            <div className="track-location-label label-stowe" style={{ left: '38%', top: '88%' }}>STOWE (T15)</div>
            <div className="track-location-label label-copse" style={{ left: '46%', top: '14%' }}>COPSE (T9)</div>
            <div className="track-location-label label-maggotts" style={{ left: '76%', top: '24%' }}>MAGGOTTS<br />&amp; BECKETTS (T10-14)</div>
            <div className="track-location-label label-club" style={{ left: '16%', top: '74%' }}>VALE &amp; CLUB (T16-18)</div>
            <div className="track-location-label label-brooklands" style={{ left: '6%', top: '42%' }}>LUFFIELD (T7)</div>
            <div className="track-location-label label-loop" style={{ left: '65%', top: '10%' }}>VILLAGE &amp; THE LOOP (T3-4)</div>

            <div className="sector-label sector-one" style={{ left: '45%', top: '48%' }}>S1</div>
            <div className="sector-label sector-two" style={{ left: '68%', top: '56%' }}>S2</div>
            <div className="sector-label sector-three" style={{ left: '26%', top: '78%' }}>S3</div>

            <svg
              className="circuit-svg"
              viewBox="0 0 760 460"
              role="img"
              aria-label="Authentic Silverstone Grand Prix Circuit map"
              style={{
                transform: `scale(${zoomScale})`,
                transformOrigin: 'center center',
                transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
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

              {/* Asphalt Runoffs & Track Width */}
              <path d={CIRCUIT_PATH} fill="none" stroke="#000" strokeOpacity="0.8" strokeWidth="38" filter="url(#trackShadow)" />
              <path d={CIRCUIT_PATH} fill="none" stroke="#676d75" strokeOpacity="0.42" strokeWidth="31" />
              <path d={CIRCUIT_PATH} fill="none" stroke="#eceff2" strokeOpacity="0.38" strokeWidth="27" strokeDasharray="2 10" />
              <path ref={pathRef} d={CIRCUIT_PATH} fill="none" stroke="url(#roadGradient)" strokeWidth="23" />
              <path d={CIRCUIT_PATH} fill="none" stroke="#090b0e" strokeOpacity="0.48" strokeWidth="4" />
              <path d={CIRCUIT_PATH} fill="none" stroke="#f54646" strokeOpacity="0.68" strokeWidth="2.2" strokeDasharray="88 550" strokeDashoffset="-405" />

              {/* Hamilton Straight Start / Finish Line */}
              <g className="start-finish-line" transform="translate(240 367) rotate(-5)">
                <rect x="-2" y="-16" width="4" height="32" fill="#f3f4f5" />
                <rect x="-2" y="-16" width="4" height="5" fill="#15181c" />
                <rect x="-2" y="-6" width="4" height="5" fill="#15181c" />
                <rect x="-2" y="4" width="4" height="5" fill="#15181c" />
              </g>

              {/* DRS Zones */}
              <g className="drs-zone" opacity="0.88">
                {/* DRS 1: Wellington Straight */}
                <path d="M 400 215 L 260 270 L 160 300" fill="none" stroke="#32d6a0" strokeWidth="3.2" strokeLinecap="round" />
                <text x="275" y="250" fill="#45e0ad" fontSize="9" fontWeight="700" letterSpacing="1.4">DRS 1 · WELLINGTON</text>

                {/* DRS 2: Hangar Straight */}
                <path d="M 630 275 L 480 370 L 330 435" fill="none" stroke="#32d6a0" strokeWidth="3.2" strokeLinecap="round" />
                <text x="495" y="340" fill="#45e0ad" fontSize="9" fontWeight="700" letterSpacing="1.4">DRS 2 · HANGAR</text>

                {/* DRS 3: Hamilton Straight */}
                <path d="M 190 370 L 340 360" fill="none" stroke="#32d6a0" strokeWidth="3.2" strokeLinecap="round" />
                <text x="235" y="395" fill="#45e0ad" fontSize="9" fontWeight="700" letterSpacing="1.4">DRS 3 · PIT STRAIGHT</text>
              </g>

              {/* Real Cars on Circuit */}
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
            <div className="track-zoom-rail">
              <button onClick={handleZoomIn} title="Zoom In">+</button>
              <span onClick={handleZoomReset} title="Reset Zoom" style={{ cursor: 'pointer' }}>{Math.round(zoomScale * 100)}%</span>
              <button onClick={handleZoomOut} title="Zoom Out">−</button>
            </div>
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
