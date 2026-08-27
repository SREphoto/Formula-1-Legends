/**
 * Zero-dependency Web Audio API procedural sound synthesizer
 * for ultra-realistic Formula 1 steering wheel tactile interactions:
 * - Mechanical microswitch button click (crisp high-frequency transient + low body)
 * - Rotary dial heavy mechanical detent clunk
 * - Magnetic paddle shifter snap (carbon lever snap + spring resonance)
 * - Pit limiter / shift beep alert
 * - Team radio transmission tone
 */

class WheelAudioEngine {
  private ctx: AudioContext | null = null
  private enabled: boolean = true
  private volume: number = 0.65

  private getContext(): AudioContext | null {
    if (!this.enabled) return null
    try {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
        if (AudioCtx) {
          this.ctx = new AudioCtx()
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume()
      }
      return this.ctx
    } catch {
      return null
    }
  }

  public setEnabled(enabled: boolean) {
    this.enabled = enabled
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol))
  }

  /**
   * Crisp tactile microswitch button click
   */
  public playButtonClick() {
    const ctx = this.getContext()
    if (!ctx) return

    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    const filter = ctx.createBiquadFilter()

    // Fast pitch sweep (2400Hz -> 600Hz in 18ms) gives authentic mechanical click transient
    osc.type = 'triangle'
    osc.frequency.setValueAtTime(2600, now)
    osc.frequency.exponentialRampToValueAtTime(320, now + 0.024)

    // Highpass filter for crisp switch snap
    filter.type = 'bandpass'
    filter.frequency.setValueAtTime(2200, now)
    filter.Q.setValueAtTime(3.5, now)

    // Sharp exponential decay
    gain.gain.setValueAtTime(this.volume * 0.45, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.028)

    osc.connect(filter)
    filter.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now)
    osc.stop(now + 0.03)

    // Secondary subtle tactile body thud (sub-harmonic)
    const bodyOsc = ctx.createOscillator()
    const bodyGain = ctx.createGain()
    bodyOsc.type = 'sine'
    bodyOsc.frequency.setValueAtTime(160, now)
    bodyOsc.frequency.exponentialRampToValueAtTime(60, now + 0.035)

    bodyGain.gain.setValueAtTime(this.volume * 0.35, now)
    bodyGain.gain.exponentialRampToValueAtTime(0.001, now + 0.038)

    bodyOsc.connect(bodyGain)
    bodyGain.connect(ctx.destination)

    bodyOsc.start(now)
    bodyOsc.stop(now + 0.04)
  }

  /**
   * Heavy mechanical rotary switch detent clunk
   */
  public playRotaryClick() {
    const ctx = this.getContext()
    if (!ctx) return

    const now = ctx.currentTime

    // Detent click transient
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    const filter = ctx.createBiquadFilter()

    osc.type = 'square'
    osc.frequency.setValueAtTime(1400, now)
    osc.frequency.exponentialRampToValueAtTime(180, now + 0.03)

    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(2800, now)

    gain.gain.setValueAtTime(this.volume * 0.4, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035)

    osc.connect(filter)
    filter.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now)
    osc.stop(now + 0.04)

    // Solid detent body resonance
    const thud = ctx.createOscillator()
    const thudGain = ctx.createGain()
    thud.type = 'triangle'
    thud.frequency.setValueAtTime(240, now)
    thud.frequency.exponentialRampToValueAtTime(80, now + 0.04)

    thudGain.gain.setValueAtTime(this.volume * 0.5, now)
    thudGain.gain.exponentialRampToValueAtTime(0.001, now + 0.045)

    thud.connect(thudGain)
    thudGain.connect(ctx.destination)

    thud.start(now)
    thud.stop(now + 0.05)
  }

  /**
   * Carbon fiber magnetic paddle shifter snap
   */
  public playPaddleShift(isUpshift: boolean) {
    const ctx = this.getContext()
    if (!ctx) return

    const now = ctx.currentTime

    // Sharp magnetic release snap
    const snapOsc = ctx.createOscillator()
    const snapGain = ctx.createGain()
    const snapFilter = ctx.createBiquadFilter()

    snapOsc.type = 'sawtooth'
    const startFreq = isUpshift ? 3200 : 2800
    const endFreq = isUpshift ? 450 : 380
    snapOsc.frequency.setValueAtTime(startFreq, now)
    snapOsc.frequency.exponentialRampToValueAtTime(endFreq, now + 0.035)

    snapFilter.type = 'bandpass'
    snapFilter.frequency.setValueAtTime(isUpshift ? 2600 : 2200, now)
    snapFilter.Q.setValueAtTime(2.8, now)

    snapGain.gain.setValueAtTime(this.volume * 0.6, now)
    snapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.045)

    snapOsc.connect(snapFilter)
    snapFilter.connect(snapGain)
    snapGain.connect(ctx.destination)

    snapOsc.start(now)
    snapOsc.stop(now + 0.05)

    // Carbon plate tactile rebound resonance
    const plateOsc = ctx.createOscillator()
    const plateGain = ctx.createGain()
    plateOsc.type = 'triangle'
    plateOsc.frequency.setValueAtTime(isUpshift ? 380 : 320, now)
    plateOsc.frequency.exponentialRampToValueAtTime(110, now + 0.06)

    plateGain.gain.setValueAtTime(this.volume * 0.45, now)
    plateGain.gain.exponentialRampToValueAtTime(0.001, now + 0.065)

    plateOsc.connect(plateGain)
    plateGain.connect(ctx.destination)

    plateOsc.start(now)
    plateOsc.stop(now + 0.07)
  }

  /**
   * Shift point / Pit limiter audible indicator beep
   */
  public playBeep(freq = 1800, duration = 0.06) {
    const ctx = this.getContext()
    if (!ctx) return

    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(freq, now)

    gain.gain.setValueAtTime(0, now)
    gain.gain.linearRampToValueAtTime(this.volume * 0.35, now + 0.005)
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now)
    osc.stop(now + duration + 0.01)
  }

  /**
   * Authentic Formula 1 team radio transmission keying beep
   */
  public playRadioTone() {
    const ctx = this.getContext()
    if (!ctx) return

    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(1050, now)
    osc.frequency.setValueAtTime(1450, now + 0.04)

    gain.gain.setValueAtTime(0, now)
    gain.gain.linearRampToValueAtTime(this.volume * 0.35, now + 0.005)
    gain.gain.setValueAtTime(this.volume * 0.35, now + 0.07)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now)
    osc.stop(now + 0.1)
  }
}

export const wheelAudio = new WheelAudioEngine()
