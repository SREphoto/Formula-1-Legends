import { useEffect, useRef, useState } from 'react'
import { radioAudioService } from '../services/radioAudioService'

interface AudioWaveformVisualizerProps {
  isPlaying: boolean
  barCount?: number
  height?: number
  teamColor?: string
  mode?: 'bars' | 'wave' | 'compact'
  showFrequencyHz?: boolean
}

export function AudioWaveformVisualizer({
  isPlaying,
  barCount = 18,
  height = 28,
  teamColor = '#ff8000',
  mode = 'bars',
  showFrequencyHz = false,
}: AudioWaveformVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [activeLevel, setActiveLevel] = useState(0)

  useEffect(() => {
    let animFrame: number
    const buffer = new Uint8Array(barCount * 2)
    let phase = 0

    const draw = () => {
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const w = canvas.width
      const h = canvas.height
      ctx.clearRect(0, 0, w, h)

      if (isPlaying) {
        radioAudioService.getFrequencyData(buffer)
        let totalEnergy = 0
        for (let i = 0; i < barCount; i++) {
          totalEnergy += buffer[i] || 0
        }
        const hasRealAudio = totalEnergy > 10

        phase += 0.15
        const barWidth = Math.max(2, (w - (barCount - 1) * 2) / barCount)

        for (let i = 0; i < barCount; i++) {
          let value = 0
          if (hasRealAudio) {
            value = (buffer[i] || 0) / 255
          } else {
            // Procedural natural speech vocal formants simulation
            const harmonic1 = Math.sin(phase + i * 0.45) * 0.35 + 0.35
            const harmonic2 = Math.sin(phase * 1.6 - i * 0.3) * 0.25 + 0.25
            const formant = Math.sin((i / barCount) * Math.PI) // Peak in mid-range vocal frequencies
            value = (harmonic1 + harmonic2) * formant * 0.95
          }

          value = Math.max(0.08, Math.min(1.0, value))
          const barHeight = value * (h - 4)
          const x = i * (barWidth + 2)
          const y = h - barHeight

          // Draw gradient bar
          const grad = ctx.createLinearGradient(0, h, 0, 0)
          grad.addColorStop(0, `${teamColor}40`)
          grad.addColorStop(0.6, teamColor)
          grad.addColorStop(1, '#ffffff')

          ctx.fillStyle = grad
          ctx.beginPath()
          ctx.roundRect(x, y, barWidth, barHeight, [2, 2, 0, 0])
          ctx.fill()

          // Draw top peak cap
          ctx.fillStyle = '#ffffff'
          ctx.fillRect(x, Math.max(0, y - 2), barWidth, 1.5)
        }

        setActiveLevel(hasRealAudio ? totalEnergy / (barCount * 255) : 0.65)
        animFrame = requestAnimationFrame(draw)
      } else {
        // Idle state: subtle minimum baseline dots
        ctx.fillStyle = 'rgba(108, 122, 146, 0.25)'
        const barWidth = Math.max(2, (w - (barCount - 1) * 2) / barCount)
        for (let i = 0; i < barCount; i++) {
          const x = i * (barWidth + 2)
          ctx.fillRect(x, h - 3, barWidth, 2)
        }
        setActiveLevel(0)
      }
    }

    draw()

    return () => {
      if (animFrame) cancelAnimationFrame(animFrame)
    }
  }, [isPlaying, barCount, teamColor])

  return (
    <div className={`audio-waveform-container mode-${mode} ${isPlaying ? 'broadcasting' : 'idle'}`}>
      <canvas
        ref={canvasRef}
        width={barCount * 8}
        height={height}
        className="waveform-canvas"
        style={{ width: `${barCount * 7}px`, height: `${height}px` }}
      />
      {showFrequencyHz && isPlaying && (
        <div className="audio-live-hud-strip">
          <span className="live-db-stat">{(activeLevel * 100).toFixed(0)}% MOD</span>
          <span className="live-vhf-band">500Hz - 2.8kHz</span>
        </div>
      )}
    </div>
  )
}
