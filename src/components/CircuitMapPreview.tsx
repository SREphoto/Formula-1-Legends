import { useEffect, useRef, useState } from 'react'
import {
  Compass,
  Layers,
  MapPin,
  Radio,
  Trophy,
  Zap,
} from 'lucide-react'
import { getCircuitInfo, type CircuitCorner } from '../data/circuitData'
import type { OpenF1Driver } from '../services/openf1Service'
import { DopplerRadarOverlay } from './DopplerRadarOverlay'

interface CircuitMapPreviewProps {
  circuitKey: number
  meetingName: string
  location?: string
  country?: string
  driver1?: OpenF1Driver
  driver2?: OpenF1Driver
  maxSpeed1?: number
  maxSpeed2?: number
}

export function CircuitMapPreview({
  circuitKey,
  meetingName,
  location,
  country,
  driver1,
  driver2,
}: CircuitMapPreviewProps) {
  const circuit = getCircuitInfo(circuitKey)
  const pathRef = useRef<SVGPathElement>(null)
  const [hoveredCorner, setHoveredCorner] = useState<CircuitCorner | null>(null)
  const [showRadar, setShowRadar] = useState(false)

  // Animated Car Positions along the SVG path
  const [car1Pos, setCar1Pos] = useState<{ x: number; y: number }>({ x: circuit.startFinish.x, y: circuit.startFinish.y })
  const [car2Pos, setCar2Pos] = useState<{ x: number; y: number }>({ x: circuit.startFinish.x, y: circuit.startFinish.y })
  const [lapProgress, setLapProgress] = useState(0)

  useEffect(() => {
    let animFrame: number
    const startTime = performance.now()
    const lapDurationMs = 16000 // 16s simulated loop lap

    const animate = (time: number) => {
      const elapsed = time - startTime
      const progress1 = ((elapsed % lapDurationMs) / lapDurationMs)
      // Driver 2 is 0.08 of a lap behind (gap ~ 1.2s)
      const progress2 = (((elapsed - 1200) % lapDurationMs + lapDurationMs) % lapDurationMs) / lapDurationMs

      setLapProgress(progress1)

      const path = pathRef.current
      if (path) {
        try {
          const totalLen = path.getTotalLength()
          if (totalLen > 0) {
            const p1 = path.getPointAtLength(progress1 * totalLen)
            const p2 = path.getPointAtLength(progress2 * totalLen)
            setCar1Pos({ x: p1.x, y: p1.y })
            setCar2Pos({ x: p2.x, y: p2.y })
          }
        } catch {
          // Fallback if path not yet initialized
        }
      }

      animFrame = requestAnimationFrame(animate)
    }

    animFrame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animFrame)
  }, [circuitKey])

  return (
    <div className="circuit-map-preview-card">
      <div className="circuit-preview-header">
        <div className="circuit-meta-title">
          <div className="circuit-flag-pin">
            <MapPin size={16} className="circuit-pin-icon" />
            <span className="circuit-country-tag">{country || circuit.country}</span>
          </div>
          <h3 className="circuit-name-display">{circuit.circuitName}</h3>
          <span className="circuit-location-sub">
            {location || circuit.location} · {meetingName}
          </span>
        </div>

        <div className="circuit-quick-specs">
          <div className="circuit-stat-pill">
            <Compass size={13} />
            <span>LENGTH: <strong>{circuit.lengthKm.toFixed(3)} KM</strong></span>
          </div>
          <div className="circuit-stat-pill">
            <Layers size={13} />
            <span>TURNS: <strong>{circuit.turnsCount}</strong></span>
          </div>
          <div className="circuit-stat-pill drs">
            <Zap size={13} />
            <span>DRS ZONES: <strong>{circuit.drsZonesCount}</strong></span>
          </div>
          <button
            className={`circuit-stat-pill radar-pill ${showRadar ? 'active' : ''}`}
            onClick={() => setShowRadar(!showRadar)}
            title="Toggle Doppler radar weather overlay"
          >
            <Radio size={13} />
            <span>RADAR: <strong>{showRadar ? 'ON' : 'OFF'}</strong></span>
          </button>
        </div>
      </div>

      <div className="circuit-svg-container">
        {showRadar && (
          <div className="circuit-preview-radar-layer">
            <DopplerRadarOverlay compact={true} showControls={false} rainfall={45} />
          </div>
        )}

        {/* Corner Tooltip Overlay */}
        {hoveredCorner && (
          <div
            className="circuit-corner-tooltip"
            style={{
              left: `${(hoveredCorner.x / 500) * 100}%`,
              top: `${(hoveredCorner.y / 400) * 100}%`,
            }}
          >
            <span className="tooltip-corner-num">T{hoveredCorner.number}</span>
            {hoveredCorner.name && <span className="tooltip-corner-name">{hoveredCorner.name}</span>}
          </div>
        )}

        <svg
          viewBox={circuit.viewBox}
          className="circuit-preview-svg"
          role="img"
          aria-label={`${circuit.circuitName} track layout`}
        >
          <defs>
            <filter id="trackGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="carGlowDot" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <linearGradient id="circuitTrackGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="50%" stopColor="#818cf8" />
              <stop offset="100%" stopColor="#e879f9" />
            </linearGradient>
            <linearGradient id="drsGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00f2aa" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
          </defs>

          {/* Grid lines background effect */}
          <pattern id="previewGrid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#161c28" strokeWidth="0.8" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#previewGrid)" rx="6" />

          {/* Track Underlay & Shadow */}
          <path
            d={circuit.path}
            fill="none"
            stroke="#070a0f"
            strokeWidth="24"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.8"
          />

          {/* Outer Curb boundary */}
          <path
            d={circuit.path}
            fill="none"
            stroke="#20293a"
            strokeWidth="14"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Main Racing Line with Sector Color Gradient & pathRef */}
          <path
            ref={pathRef}
            d={circuit.path}
            fill="none"
            stroke="url(#circuitTrackGrad)"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#trackGlow)"
          />

          {/* DRS Activation Zones */}
          {circuit.drsPaths?.map((drsD, idx) => (
            <g key={idx} className="drs-preview-zone">
              <path
                d={drsD}
                fill="none"
                stroke="url(#drsGrad)"
                strokeWidth="10"
                strokeLinecap="round"
                strokeOpacity="0.85"
              />
              <path
                d={drsD}
                fill="none"
                stroke="#fff"
                strokeWidth="2.5"
                strokeDasharray="4 6"
                strokeLinecap="round"
              />
            </g>
          ))}

          {/* Start / Finish Line */}
          <g
            className="circuit-start-finish-badge"
            transform={`translate(${circuit.startFinish.x} ${circuit.startFinish.y}) rotate(${
              circuit.startFinish.angle || 0
            })`}
          >
            <line x1="-2" y1="-14" x2="-2" y2="14" stroke="#ffffff" strokeWidth="3.5" />
            <rect x="1" y="-14" width="3" height="28" fill="#ff3b30" />
          </g>

          {/* Interactive Turn Markers */}
          {circuit.corners?.map((c) => (
            <g
              key={c.number}
              className="circuit-turn-node"
              transform={`translate(${c.x} ${c.y})`}
              onMouseEnter={() => setHoveredCorner(c)}
              onMouseLeave={() => setHoveredCorner(null)}
            >
              <circle r="9" fill="#0d121c" stroke="#38bdf8" strokeWidth="1.5" />
              <circle r="4" fill="#38bdf8" />
              <text
                x="0"
                y="3"
                textAnchor="middle"
                fontSize="8"
                fontWeight="900"
                fill="#ffffff"
                fontFamily="sans-serif"
                pointerEvents="none"
              >
                {c.number}
              </text>
            </g>
          ))}

          {/* Animated On-Track Car Position Dot: Driver 2 (Rival) */}
          {driver2 && (
            <g
              className="live-track-car-dot car-rival"
              transform={`translate(${car2Pos.x} ${car2Pos.y})`}
              filter="url(#carGlowDot)"
            >
              <circle r="12" fill="none" stroke={`#${driver2.team_colour}`} strokeWidth="1.5" opacity="0.4">
                <animate attributeName="r" values="8;14;8" dur="1.8s" repeatCount="indefinite" />
              </circle>
              <circle r="5" fill={`#${driver2.team_colour}`} stroke="#fff" strokeWidth="1.5" />
              <g transform="translate(8 -12)" className="car-map-tag">
                <rect x="0" y="0" width="48" height="15" rx="3" fill="#0b0e14" stroke={`#${driver2.team_colour}`} strokeWidth="1" />
                <text x="5" y="11" fill="#fff" fontSize="8" fontWeight="900">
                  #{driver2.driver_number} {driver2.name_acronym}
                </text>
              </g>
            </g>
          )}

          {/* Animated On-Track Car Position Dot: Driver 1 (Leader / Reference) */}
          {driver1 && (
            <g
              className="live-track-car-dot car-leader"
              transform={`translate(${car1Pos.x} ${car1Pos.y})`}
              filter="url(#carGlowDot)"
            >
              <circle r="14" fill="none" stroke={`#${driver1.team_colour}`} strokeWidth="2" opacity="0.6">
                <animate attributeName="r" values="9;16;9" dur="1.4s" repeatCount="indefinite" />
              </circle>
              <circle r="6" fill={`#${driver1.team_colour}`} stroke="#fff" strokeWidth="2" />
              <g transform="translate(8 -14)" className="car-map-tag">
                <rect x="0" y="0" width="52" height="16" rx="3" fill="#0b0e14" stroke={`#${driver1.team_colour}`} strokeWidth="1" />
                <text x="5" y="11.5" fill="#fff" fontSize="8.5" fontWeight="900">
                  #{driver1.driver_number} {driver1.name_acronym}
                </text>
              </g>
            </g>
          )}
        </svg>

        {/* Floating Track Map Legends & Live Telemetry Strip */}
        <div className="circuit-bottom-strip">
          <div className="circuit-legend-group">
            <span className="legend-chip s1">SECTOR 1</span>
            <span className="legend-chip s2">SECTOR 2</span>
            <span className="legend-chip s3">SECTOR 3</span>
            <span className="legend-chip drs">DRS ZONES ({circuit.drsZonesCount})</span>
            <span className="legend-chip live-progress">
              LIVE LAP: <strong>{(lapProgress * 100).toFixed(0)}%</strong>
            </span>
          </div>

          <div className="lap-record-badge">
            <Trophy size={12} className="trophy-icon" />
            <span className="lap-record-label">
              LAP RECORD: <strong>{circuit.lapRecord.time}</strong> ({circuit.lapRecord.driver},{' '}
              {circuit.lapRecord.year})
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
