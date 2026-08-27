/**
 * Procedural V6 Turbo-Hybrid Motorsport & Aeroacoustic Sound Synthesizer
 * Synthesizes real-time ICE combustion harmonics, turbocharger spool whine,
 * MGU-K electrical deployment whir, tire skid screeching, and wind tunnel airflow whoosh.
 */

export interface TelemetryAudioState {
  rpm: number
  throttle: number
  brake: number
  speed: number
  isErsActive?: boolean
}

class SoundEngine {
  private audioCtx: AudioContext | null = null
  private isRunning = false
  private isMuted = false

  // ICE Nodes
  private masterGain: GainNode | null = null
  private iceGain: GainNode | null = null
  private iceOscillators: OscillatorNode[] = []
  private iceFilter: BiquadFilterNode | null = null
  private iceDistortion: WaveShaperNode | null = null

  // Turbo Nodes
  private turboGain: GainNode | null = null
  private turboOsc: OscillatorNode | null = null

  // MGU-K Nodes
  private mgukGain: GainNode | null = null
  private mgukOsc: OscillatorNode | null = null

  // Tire Skid Nodes
  private skidGain: GainNode | null = null
  private skidNoiseSource: AudioNode | null = null

  // Wind Tunnel Aeroacoustic Nodes
  private windGain: GainNode | null = null
  private windFilter: BiquadFilterNode | null = null
  private windNoiseSource: AudioNode | null = null

  private listeners: Set<(isRunning: boolean, isMuted: boolean) => void> = new Set()

  private getAudioContext(): AudioContext {
    if (!this.audioCtx) {
      const AudioContextClass =
        window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      this.audioCtx = new AudioContextClass()
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume()
    }
    return this.audioCtx
  }

  public subscribe(listener: (isRunning: boolean, isMuted: boolean) => void): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  private notify() {
    this.listeners.forEach((l) => l(this.isRunning, this.isMuted))
  }

  private makeDistortionCurve(amount = 25): Float32Array {
    const k = amount
    const nSamples = 44100
    const buffer = new ArrayBuffer(nSamples * Float32Array.BYTES_PER_ELEMENT)
    const curve = new Float32Array(buffer)
    const deg = Math.PI / 180
    for (let i = 0; i < nSamples; ++i) {
      const x = (i * 2) / nSamples - 1
      curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x))
    }
    return curve
  }

  /**
   * Initializes and starts the Web Audio synthesis nodes.
   */
  public start(): void {
    if (this.isRunning) return

    try {
      const ctx = this.getAudioContext()
      const now = ctx.currentTime

      // Master Gain
      this.masterGain = ctx.createGain()
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.16, now)
      this.masterGain.connect(ctx.destination)

      // 1. ICE (Internal Combustion Engine) V6 Synthesis
      this.iceGain = ctx.createGain()
      this.iceGain.gain.setValueAtTime(0.3, now)

      this.iceFilter = ctx.createBiquadFilter()
      this.iceFilter.type = 'lowpass'
      this.iceFilter.frequency.setValueAtTime(1800, now)
      this.iceFilter.Q.setValueAtTime(2.5, now)

      this.iceDistortion = ctx.createWaveShaper()
      this.iceDistortion.curve = this.makeDistortionCurve(18) as Float32Array<ArrayBuffer>
      this.iceDistortion.oversample = '2x'

      const harmonics = [1, 1.5, 2, 3, 4.5, 6]
      const harmonicGains = [0.4, 0.25, 0.3, 0.15, 0.08, 0.04]

      this.iceOscillators = harmonics.map((mult, index) => {
        const osc = ctx.createOscillator()
        osc.type = index % 2 === 0 ? 'sawtooth' : 'triangle'
        osc.frequency.setValueAtTime(120 * mult, now)

        const hGain = ctx.createGain()
        hGain.gain.setValueAtTime(harmonicGains[index], now)

        osc.connect(hGain)
        if (this.iceDistortion) hGain.connect(this.iceDistortion)
        osc.start()
        return osc
      })

      if (this.iceDistortion && this.iceFilter && this.iceGain && this.masterGain) {
        this.iceDistortion.connect(this.iceFilter)
        this.iceFilter.connect(this.iceGain)
        this.iceGain.connect(this.masterGain)
      }

      // 2. Turbocharger Spool Whine (High frequency sine sweep)
      this.turboGain = ctx.createGain()
      this.turboGain.gain.setValueAtTime(0.001, now)

      this.turboOsc = ctx.createOscillator()
      this.turboOsc.type = 'sine'
      this.turboOsc.frequency.setValueAtTime(3200, now)

      const turboFilter = ctx.createBiquadFilter()
      turboFilter.type = 'bandpass'
      turboFilter.frequency.setValueAtTime(4500, now)
      turboFilter.Q.setValueAtTime(4.0, now)

      if (this.turboGain && this.masterGain) {
        this.turboOsc.connect(turboFilter)
        turboFilter.connect(this.turboGain)
        this.turboGain.connect(this.masterGain)
      }
      this.turboOsc.start()

      // 3. 350kW MGU-K Electric Motor Whir
      this.mgukGain = ctx.createGain()
      this.mgukGain.gain.setValueAtTime(0.001, now)

      this.mgukOsc = ctx.createOscillator()
      this.mgukOsc.type = 'triangle'
      this.mgukOsc.frequency.setValueAtTime(950, now)

      const mgukFilter = ctx.createBiquadFilter()
      mgukFilter.type = 'bandpass'
      mgukFilter.frequency.setValueAtTime(1400, now)
      mgukFilter.Q.setValueAtTime(3.0, now)

      if (this.mgukGain && this.masterGain) {
        this.mgukOsc.connect(mgukFilter)
        mgukFilter.connect(this.mgukGain)
        this.mgukGain.connect(this.masterGain)
      }
      this.mgukOsc.start()

      // 4. Tire Skid Noise Generator
      const bufferSize = ctx.sampleRate * 2
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
      const output = noiseBuffer.getChannelData(0)
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1
      }

      const whiteNoise = ctx.createBufferSource()
      whiteNoise.buffer = noiseBuffer
      whiteNoise.loop = true

      const skidFilter = ctx.createBiquadFilter()
      skidFilter.type = 'bandpass'
      skidFilter.frequency.setValueAtTime(950, now)
      skidFilter.Q.setValueAtTime(3.5, now)

      this.skidGain = ctx.createGain()
      this.skidGain.gain.setValueAtTime(0.0, now)

      whiteNoise.connect(skidFilter)
      if (this.masterGain) {
        skidFilter.connect(this.skidGain)
        this.skidGain.connect(this.masterGain)
      }
      whiteNoise.start()
      this.skidNoiseSource = whiteNoise

      // 5. Wind Tunnel Aeroacoustic Noise Generator
      const windNoise = ctx.createBufferSource()
      windNoise.buffer = noiseBuffer
      windNoise.loop = true

      this.windFilter = ctx.createBiquadFilter()
      this.windFilter.type = 'bandpass'
      this.windFilter.frequency.setValueAtTime(650, now)
      this.windFilter.Q.setValueAtTime(1.8, now)

      this.windGain = ctx.createGain()
      this.windGain.gain.setValueAtTime(0.0, now)

      windNoise.connect(this.windFilter)
      if (this.masterGain) {
        this.windFilter.connect(this.windGain)
        this.windGain.connect(this.masterGain)
      }
      windNoise.start()
      this.windNoiseSource = windNoise

      this.isRunning = true
      this.notify()
    } catch {
      this.isRunning = false
    }
  }

  /**
   * Updates synthesis parameters from real-time telemetry.
   */
  public updateTelemetry(telemetry: TelemetryAudioState): void {
    if (!this.isRunning || !this.audioCtx) return

    const { rpm, throttle, brake, speed, isErsActive } = telemetry
    const now = this.audioCtx.currentTime

    // ICE fundamental firing frequency = (RPM / 60) * 3
    const firingFreq = Math.max(25, (rpm / 60) * 3)
    const harmonics = [1, 1.5, 2, 3, 4.5, 6]

    this.iceOscillators.forEach((osc, index) => {
      osc.frequency.setTargetAtTime(firingFreq * harmonics[index], now, 0.035)
    })

    if (this.iceFilter) {
      const targetCutoff = 1200 + (rpm / 15000) * 3400 + throttle * 1200
      this.iceFilter.frequency.setTargetAtTime(targetCutoff, now, 0.04)
    }

    if (this.iceGain) {
      const targetGain = 0.15 + (throttle / 100) * 0.45 + (rpm / 15000) * 0.25
      this.iceGain.gain.setTargetAtTime(targetGain, now, 0.04)
    }

    // Turbocharger spool
    if (this.turboOsc && this.turboGain) {
      const turboFreq = 2200 + throttle * 4800 + (rpm / 15000) * 1800
      const targetTurboGain = (throttle / 100) * 0.12
      this.turboOsc.frequency.setTargetAtTime(turboFreq, now, 0.08)
      this.turboGain.gain.setTargetAtTime(targetTurboGain, now, 0.08)
    }

    // 350kW MGU-K Electric deployment
    if (this.mgukOsc && this.mgukGain) {
      const mgukFreq = 650 + (speed / 360) * 2400
      const targetMgukGain = isErsActive ? 0.09 + (speed / 360) * 0.06 : 0.005
      this.mgukOsc.frequency.setTargetAtTime(mgukFreq, now, 0.05)
      this.mgukGain.gain.setTargetAtTime(targetMgukGain, now, 0.05)
    }

    // Tire Skid Screech
    if (this.skidGain) {
      const isSkidding = brake > 60 && speed > 100
      const targetSkidGain = isSkidding ? ((brake - 60) / 40) * 0.08 : 0
      this.skidGain.gain.setTargetAtTime(targetSkidGain, now, 0.04)
    }
  }

  /**
   * Updates wind tunnel aeroacoustic noise based on airspeed and active aero state.
   */
  public updateWindTunnel(speedKmh: number, activeAeroMode: 'CORNER' | 'STRAIGHT', active = true): void {
    if (!this.isRunning || !this.audioCtx) return

    const now = this.audioCtx.currentTime
    if (this.windGain && this.windFilter) {
      if (!active || speedKmh < 10) {
        this.windGain.gain.setTargetAtTime(0.0, now, 0.06)
        return
      }

      const speedNormalized = Math.min(1.0, speedKmh / 350)
      const baseFreq = 400 + speedNormalized * 1800
      // In Straight Mode (low drag), flow attaches with less turbulent roar
      const dragFactor = activeAeroMode === 'STRAIGHT' ? 0.65 : 1.0

      const targetCutoff = baseFreq * (activeAeroMode === 'STRAIGHT' ? 1.2 : 0.9)
      const targetGain = Math.min(0.22, 0.03 + speedNormalized * 0.18 * dragFactor)

      this.windFilter.frequency.setTargetAtTime(targetCutoff, now, 0.05)
      this.windGain.gain.setTargetAtTime(targetGain, now, 0.05)
    }
  }

  /**
   * Stops all active audio nodes.
   */
  public stop(): void {
    if (!this.isRunning) return

    this.iceOscillators.forEach((osc) => {
      try {
        osc.stop()
      } catch {
        // Already stopped
      }
    })
    this.iceOscillators = []

    if (this.turboOsc) {
      try {
        this.turboOsc.stop()
      } catch {
        // Already stopped
      }
      this.turboOsc = null
    }

    if (this.mgukOsc) {
      try {
        this.mgukOsc.stop()
      } catch {
        // Already stopped
      }
      this.mgukOsc = null
    }

    if (this.skidNoiseSource) {
      try {
        (this.skidNoiseSource as AudioBufferSourceNode).stop()
      } catch {
        // Already stopped
      }
      this.skidNoiseSource = null
    }

    if (this.windNoiseSource) {
      try {
        (this.windNoiseSource as AudioBufferSourceNode).stop()
      } catch {
        // Already stopped
      }
      this.windNoiseSource = null
    }

    this.isRunning = false
    this.notify()
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted
    if (this.masterGain && this.audioCtx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.16, this.audioCtx.currentTime)
    }
    this.notify()
    return this.isMuted
  }

  public getIsRunning(): boolean {
    return this.isRunning
  }

  public getIsMuted(): boolean {
    return this.isMuted
  }
}

export const soundEngine = new SoundEngine()
