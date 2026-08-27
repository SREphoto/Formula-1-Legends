/**
 * Procedural V6 Turbo-Hybrid Motorsport Sound Synthesizer
 * Synthesizes real-time ICE combustion harmonics, turbocharger spool whine,
 * MGU-K electrical deployment whir, and tire skid screeching using the Web Audio API.
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

  private listeners: Set<(isRunning: boolean, isMuted: boolean) => void> = new Set()

  private getAudioContext(): AudioContext {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
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

      // 4 harmonic oscillators for V6 firing profile
      const harmonicRatios = [1.0, 1.5, 2.0, 3.0]
      const harmonicGains = [0.45, 0.25, 0.2, 0.1]
      this.iceOscillators = []

      harmonicRatios.forEach((ratio, idx) => {
        const osc = ctx.createOscillator()
        osc.type = idx === 0 ? 'sawtooth' : 'triangle'
        osc.frequency.setValueAtTime(300 * ratio, now)

        const hGain = ctx.createGain()
        hGain.gain.setValueAtTime(harmonicGains[idx], now)

        osc.connect(hGain)
        if (this.iceDistortion) hGain.connect(this.iceDistortion)
        osc.start(now)
        this.iceOscillators.push(osc)
      })

      this.iceDistortion.connect(this.iceFilter)
      this.iceFilter.connect(this.iceGain)
      this.iceGain.connect(this.masterGain)

      // 2. Turbocharger Spool Whine
      this.turboGain = ctx.createGain()
      this.turboGain.gain.setValueAtTime(0.02, now)

      this.turboOsc = ctx.createOscillator()
      this.turboOsc.type = 'sine'
      this.turboOsc.frequency.setValueAtTime(2200, now)
      this.turboOsc.connect(this.turboGain)
      this.turboGain.connect(this.masterGain)
      this.turboOsc.start(now)

      // 3. MGU-K Electrical Deployment Whine
      this.mgukGain = ctx.createGain()
      this.mgukGain.gain.setValueAtTime(0.01, now)

      this.mgukOsc = ctx.createOscillator()
      this.mgukOsc.type = 'sine'
      this.mgukOsc.frequency.setValueAtTime(3600, now)
      this.mgukOsc.connect(this.mgukGain)
      this.mgukGain.connect(this.masterGain)
      this.mgukOsc.start(now)

      // 4. Tire Skid Screech Noise
      const bufferSize = ctx.sampleRate * 2
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
      const data = buffer.getChannelData(0)
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.15
      }

      const noiseSource = ctx.createBufferSource()
      noiseSource.buffer = buffer
      noiseSource.loop = true

      const skidFilter = ctx.createBiquadFilter()
      skidFilter.type = 'bandpass'
      skidFilter.frequency.setValueAtTime(1600, now)
      skidFilter.Q.setValueAtTime(3.0, now)

      this.skidGain = ctx.createGain()
      this.skidGain.gain.setValueAtTime(0, now)

      noiseSource.connect(skidFilter)
      skidFilter.connect(this.skidGain)
      this.skidGain.connect(this.masterGain)
      noiseSource.start(now)
      this.skidNoiseSource = noiseSource

      this.isRunning = true
      this.notify()
    } catch (err) {
      console.warn('Unable to initialize SoundEngine:', err)
      this.stop()
    }
  }

  /**
   * Updates audio parameters in real time based on active telemetry.
   */
  public updateTelemetry({ rpm, throttle, brake, speed, isErsActive }: TelemetryAudioState): void {
    if (!this.isRunning || !this.audioCtx) return

    const now = this.audioCtx.currentTime

    // Fundamental V6 frequency: 3 firing pulses per revolution
    // RPM range 4000 - 13000 -> 200 Hz to 650 Hz fundamental
    const fundamentalFreq = Math.max(120, Math.min(750, (rpm / 60) * 3))

    const harmonicRatios = [1.0, 1.5, 2.0, 3.0]
    this.iceOscillators.forEach((osc, idx) => {
      try {
        osc.frequency.setTargetAtTime(fundamentalFreq * harmonicRatios[idx], now, 0.04)
      } catch {
        // Frequency update boundary check
      }
    })

    // Filter frequency opens up with throttle
    if (this.iceFilter) {
      const targetFilterFreq = 1200 + (throttle / 100) * 2800 + (rpm / 13000) * 1500
      this.iceFilter.frequency.setTargetAtTime(targetFilterFreq, now, 0.05)
    }

    // Turbo Spool Whine (scales with throttle and high RPM)
    if (this.turboOsc && this.turboGain) {
      const turboFreq = 1800 + (rpm / 13000) * 2400 + (throttle / 100) * 800
      const targetTurboGain = (throttle / 100) * 0.05
      this.turboOsc.frequency.setTargetAtTime(turboFreq, now, 0.06)
      this.turboGain.gain.setTargetAtTime(targetTurboGain, now, 0.05)
    }

    // MGU-K Electrical Deployment (increases when ERS active or on full throttle)
    if (this.mgukOsc && this.mgukGain) {
      const mgukFreq = 3200 + (speed / 350) * 2800
      const targetMgukGain = (isErsActive || (throttle > 85 && speed > 180)) ? 0.035 : 0.005
      this.mgukOsc.frequency.setTargetAtTime(mgukFreq, now, 0.05)
      this.mgukGain.gain.setTargetAtTime(targetMgukGain, now, 0.05)
    }

    // Tire Skid Screech on heavy braking (>60%) or sharp turn transitions
    if (this.skidGain) {
      const isSkidding = brake > 60 && speed > 100
      const targetSkidGain = isSkidding ? ((brake - 60) / 40) * 0.08 : 0
      this.skidGain.gain.setTargetAtTime(targetSkidGain, now, 0.04)
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
