import { useEffect, useRef, useState } from 'react'
import { CloudRain, Compass, Gauge, Radio, Wind } from 'lucide-react'

interface DopplerRadarOverlayProps {
  rainfall: number
  trackTemp?: number
  airTemp?: number
  onRainfallChange?: (rainfall: number) => void
  showControls?: boolean
  compact?: boolean
}

export function DopplerRadarOverlay({
  rainfall,
  trackTemp = 28,
  airTemp = 21,
  onRainfallChange,
  showControls = true,
  compact = false,
}: DopplerRadarOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [sweepAngle, setSweepAngle] = useState(0)

  // Precipitation intensity descriptor
  const getPrecipitationLabel = (rain: number) => {
    if (rain <= 5) return { label: 'CLEAR / NO RAIN', dbz: '5–15 dBZ', color: '#38bdf8', rate: '0.0 mm/h' }
    if (rain <= 30) return { label: 'LIGHT DRIZZLE', dbz: '20–30 dBZ', color: '#22c55e', rate: '1.2 mm/h' }
    if (rain <= 60) return { label: 'MODERATE RAIN', dbz: '35–45 dBZ', color: '#eab308', rate: '3.6 mm/h' }
    if (rain <= 85) return { label: 'HEAVY DOWNPOUR', dbz: '50–55 dBZ', color: '#f97316', rate: '8.4 mm/h' }
    return { label: 'EXTREME MONSOON', dbz: '60–75 dBZ', color: '#ec4899', rate: '18.0 mm/h' }
  }

  const precipInfo = getPrecipitationLabel(rainfall)

  useEffect(() => {
    let animFrame: number
    const startTime = performance.now()
    const sweepPeriodMs = 3200 // 3.2s per 360 rotation

    const render = (time: number) => {
      const elapsed = time - startTime
      const angle = ((elapsed % sweepPeriodMs) / sweepPeriodMs) * Math.PI * 2
      setSweepAngle(angle)

      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const width = canvas.width
      const height = canvas.height
      const centerX = width / 2
      const centerY = height / 2
      const maxRadius = Math.min(centerX, centerY) * 0.94

      ctx.clearRect(0, 0, width, height)

      // 1. Draw Rain Density Heatmap Cells (if rainfall > 0)
      if (rainfall > 3) {
        const rainFactor = rainfall / 100
        const windOffset = (elapsed * 0.015) % width

        // Weather cell 1 (Main rain band)
        const c1X = centerX + Math.sin(elapsed * 0.0003) * 60 - 30 + (windOffset % 120 - 60)
        const c1Y = centerY + Math.cos(elapsed * 0.0004) * 40 - 20
        const r1 = maxRadius * (0.35 + rainFactor * 0.55)
        const grad1 = ctx.createRadialGradient(c1X, c1Y, 0, c1X, c1Y, r1)

        if (rainfall > 70) {
          grad1.addColorStop(0, 'rgba(236, 72, 153, 0.55)') // Severe pink/magenta
          grad1.addColorStop(0.25, 'rgba(239, 68, 68, 0.45)') // Red
          grad1.addColorStop(0.55, 'rgba(234, 179, 8, 0.35)') // Yellow
          grad1.addColorStop(0.85, 'rgba(34, 197, 94, 0.22)') // Green
          grad1.addColorStop(1, 'rgba(34, 197, 94, 0)')
        } else if (rainfall > 40) {
          grad1.addColorStop(0, 'rgba(239, 68, 68, 0.42)') // Red core
          grad1.addColorStop(0.35, 'rgba(234, 179, 8, 0.35)') // Yellow
          grad1.addColorStop(0.7, 'rgba(34, 197, 94, 0.22)') // Green
          grad1.addColorStop(1, 'rgba(34, 197, 94, 0)')
        } else {
          grad1.addColorStop(0, 'rgba(234, 179, 8, 0.32)') // Yellow core
          grad1.addColorStop(0.45, 'rgba(34, 197, 94, 0.25)') // Green
          grad1.addColorStop(0.8, 'rgba(56, 189, 248, 0.15)') // Cyan
          grad1.addColorStop(1, 'rgba(56, 189, 248, 0)')
        }

        ctx.fillStyle = grad1
        ctx.beginPath()
        ctx.arc(c1X, c1Y, r1, 0, Math.PI * 2)
        ctx.fill()

        // Weather cell 2 (Secondary trailing convective cell)
        const c2X = centerX - 80 + Math.cos(elapsed * 0.0005) * 50
        const c2Y = centerY + 60 + Math.sin(elapsed * 0.0006) * 40
        const r2 = maxRadius * (0.25 + rainFactor * 0.35)
        const grad2 = ctx.createRadialGradient(c2X, c2Y, 0, c2X, c2Y, r2)
        grad2.addColorStop(0, 'rgba(34, 197, 94, 0.35)')
        grad2.addColorStop(0.6, 'rgba(56, 189, 248, 0.2)')
        grad2.addColorStop(1, 'rgba(56, 189, 248, 0)')
        ctx.fillStyle = grad2
        ctx.beginPath()
        ctx.arc(c2X, c2Y, r2, 0, Math.PI * 2)
        ctx.fill()
      }

      // 2. Range Rings
      const ringSteps = [0.25, 0.5, 0.75, 1.0]
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.18)'
      ctx.lineWidth = 1.2
      ctx.setLineDash([4, 4])

      ringSteps.forEach((step) => {
        const r = maxRadius * step
        ctx.beginPath()
        ctx.arc(centerX, centerY, r, 0, Math.PI * 2)
        ctx.stroke()
      })

      // Crosshairs
      ctx.beginPath()
      ctx.moveTo(centerX - maxRadius, centerY)
      ctx.lineTo(centerX + maxRadius, centerY)
      ctx.moveTo(centerX, centerY - maxRadius)
      ctx.lineTo(centerX, centerY + maxRadius)
      ctx.stroke()
      ctx.setLineDash([])

      // 3. Rotating Doppler Radar Sweep Beam & Phosphor Trail
      const beamGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, maxRadius)
      beamGrad.addColorStop(0, 'rgba(56, 189, 248, 0.35)')
      beamGrad.addColorStop(0.8, 'rgba(34, 197, 94, 0.25)')
      beamGrad.addColorStop(1, 'rgba(0, 242, 170, 0.05)')

      // Draw phosphor fading sweep fan (previous 45 degrees)
      const fanAngle = Math.PI / 4
      ctx.save()
      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.arc(centerX, centerY, maxRadius, angle - fanAngle, angle)
      ctx.closePath()
      ctx.fillStyle = beamGrad
      ctx.fill()
      ctx.restore()

      // Bright sweep leading edge line
      const lineX = centerX + Math.cos(angle) * maxRadius
      const lineY = centerY + Math.sin(angle) * maxRadius
      const edgeGrad = ctx.createLinearGradient(centerX, centerY, lineX, lineY)
      edgeGrad.addColorStop(0, '#ffffff')
      edgeGrad.addColorStop(0.3, '#38bdf8')
      edgeGrad.addColorStop(1, '#00f2aa')

      ctx.strokeStyle = edgeGrad
      ctx.lineWidth = 2.4
      ctx.shadowColor = '#00f2aa'
      ctx.shadowBlur = 8
      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.lineTo(lineX, lineY)
      ctx.stroke()
      ctx.shadowBlur = 0

      // Center Antenna Node
      ctx.fillStyle = '#00f2aa'
      ctx.beginPath()
      ctx.arc(centerX, centerY, 4, 0, Math.PI * 2)
      ctx.fill()

      animFrame = requestAnimationFrame(render)
    }

    animFrame = requestAnimationFrame(render)
    return () => cancelAnimationFrame(animFrame)
  }, [rainfall])

  return (
    <div className={`doppler-radar-overlay-container ${compact ? 'is-compact' : ''}`}>
      <canvas ref={canvasRef} width={600} height={600} className="doppler-radar-canvas" />

      {/* Cardinal Direction Notches */}
      <div className="radar-cardinal card-n">N · 0°</div>
      <div className="radar-cardinal card-e">E · 90°</div>
      <div className="radar-cardinal card-s">S · 180°</div>
      <div className="radar-cardinal card-w">W · 270°</div>

      {/* Distance Ring Markers */}
      <span className="radar-ring-tag ring-5k">5 KM</span>
      <span className="radar-ring-tag ring-10k">10 KM</span>
      <span className="radar-ring-tag ring-15k">15 KM</span>
      <span className="radar-ring-tag ring-20k">20 KM</span>

      {/* Live Doppler Telemetry Badge */}
      <div className="doppler-hud-header">
        <div className="hud-badge-title">
          <Radio size={14} className="radar-pulse-icon" />
          <span>DOPPLER WEATHER RADAR</span>
          <span className="live-sweep-badge">
            <i className="sweep-dot" style={{ transform: `rotate(${((sweepAngle * 180) / Math.PI).toFixed(0)}deg)` }} />
            SCANNING
          </span>
        </div>

        <div className="hud-precip-status" style={{ borderLeftColor: precipInfo.color }}>
          <strong style={{ color: precipInfo.color }}>{precipInfo.label}</strong>
          <small>
            REFLECTIVITY: <b>{precipInfo.dbz}</b> · INTENSITY: <b>{precipInfo.rate}</b>
          </small>
        </div>
      </div>

      {/* Atmospheric Strip */}
      <div className="radar-atmos-strip">
        <div className="atmos-item">
          <Wind size={13} />
          <span>WIND: <strong>21 KM/H · 225° SW</strong></span>
        </div>
        <div className="atmos-item">
          <Compass size={13} />
          <span>AIR: <strong>{airTemp.toFixed(1)}°C</strong></span>
        </div>
        <div className="atmos-item">
          <Gauge size={13} />
          <span>TRACK: <strong>{trackTemp.toFixed(1)}°C</strong></span>
        </div>
      </div>

      {/* Doppler dBZ Color Palette Legend */}
      <div className="doppler-dbz-legend">
        <span className="legend-title">dBZ REFLECTIVITY:</span>
        <div className="dbz-gradient-bar">
          <span className="dbz-step s1">15</span>
          <span className="dbz-step s2">25</span>
          <span className="dbz-step s3">35</span>
          <span className="dbz-step s4">45</span>
          <span className="dbz-step s5">55</span>
          <span className="dbz-step s6">65+</span>
        </div>
      </div>

      {/* Interactive Rain Level Controls */}
      {showControls && onRainfallChange && (
        <div className="radar-interactive-controls">
          <div className="controls-label">
            <CloudRain size={14} />
            <span>SIMULATE PRECIPITATION: <strong>{Math.round(rainfall)}%</strong></span>
          </div>
          <div className="preset-buttons">
            <button className={rainfall === 0 ? 'active' : ''} onClick={() => onRainfallChange(0)}>
              DRY (0%)
            </button>
            <button className={rainfall === 25 ? 'active' : ''} onClick={() => onRainfallChange(25)}>
              DRIZZLE (25%)
            </button>
            <button className={rainfall === 60 ? 'active' : ''} onClick={() => onRainfallChange(60)}>
              RAIN (60%)
            </button>
            <button className={rainfall === 95 ? 'active' : ''} onClick={() => onRainfallChange(95)}>
              MONSOON (95%)
            </button>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={rainfall}
            onChange={(e) => onRainfallChange(Number(e.target.value))}
            className="radar-rain-slider"
          />
        </div>
      )}
    </div>
  )
}
