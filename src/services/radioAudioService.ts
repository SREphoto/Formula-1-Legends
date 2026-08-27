/**
 * Web Audio API Synthesis Engine for F1 Team Radio Transmissions
 * Generates realistic push-to-talk (PTT) beep tones, VHF bandpass filters,
 * frequency crunch distortion, cockpit static hiss, and speech audio playback.
 */

class RadioAudioService {
  private audioCtx: AudioContext | null = null
  private activeSource: AudioNode | null = null
  private noiseNode: AudioNode | null = null
  private isCurrentlyPlaying = false
  private activeTransmissionId: string | null = null
  private onStateChangeListeners: Set<(isPlaying: boolean, id: string | null) => void> = new Set()

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

  public subscribe(listener: (isPlaying: boolean, id: string | null) => void): () => void {
    this.onStateChangeListeners.add(listener)
    return () => this.onStateChangeListeners.delete(listener)
  }

  private notifyListeners(isPlaying: boolean, id: string | null) {
    this.isCurrentlyPlaying = isPlaying
    this.activeTransmissionId = isPlaying ? id : null
    this.onStateChangeListeners.forEach((listener) => listener(isPlaying, this.activeTransmissionId))
  }

  /**
   * Generates a non-linear distortion curve for cockpit radio frequency crunch / saturation.
   */
  private makeDistortionCurve(amount = 20): Float32Array {
    const k = amount
    const nSamples = 44100
    const curve = new Float32Array(nSamples)
    const deg = Math.PI / 180
    for (let i = 0; i < nSamples; ++i) {
      const x = (i * 2) / nSamples - 1
      curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x))
    }
    return curve
  }

  /**
   * Plays the iconic F1 PTT (Push-To-Talk) two-tone beep.
   */
  private playPttBeep(ctx: AudioContext, startTime: number, isIntro = true): number {
    const freq1 = isIntro ? 1850 : 2200
    const freq2 = isIntro ? 2300 : 1750
    const duration = 0.045

    const osc1 = ctx.createOscillator()
    const osc2 = ctx.createOscillator()
    const gainNode = ctx.createGain()

    osc1.type = 'sine'
    osc1.frequency.setValueAtTime(freq1, startTime)

    osc2.type = 'sine'
    osc2.frequency.setValueAtTime(freq2, startTime + duration)

    gainNode.gain.setValueAtTime(0, startTime)
    gainNode.gain.linearRampToValueAtTime(0.18, startTime + 0.005)
    gainNode.gain.setValueAtTime(0.18, startTime + duration * 2 - 0.005)
    gainNode.gain.linearRampToValueAtTime(0, startTime + duration * 2)

    osc1.connect(gainNode)
    osc2.connect(gainNode)
    gainNode.connect(ctx.destination)

    osc1.start(startTime)
    osc1.stop(startTime + duration)
    osc2.start(startTime + duration)
    osc2.stop(startTime + duration * 2)

    return duration * 2
  }

  /**
   * Generates continuous background radio static and engine rumble.
   */
  private createRadioStaticNode(ctx: AudioContext, duration: number, startTime: number): AudioNode {
    const bufferSize = ctx.sampleRate * duration
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)

    // Generate pink-ish filtered static noise
    let b0 = 0
    let b1 = 0
    let b2 = 0
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1
      b0 = 0.99886 * b0 + white * 0.0555179
      b1 = 0.99332 * b1 + white * 0.0750759
      b2 = 0.969 * b2 + white * 0.153852
      data[i] = (b0 + b1 + b2 + white * 0.5362) * 0.06
    }

    const noiseSource = ctx.createBufferSource()
    noiseSource.buffer = buffer

    // Radio bandpass filter
    const bandpass = ctx.createBiquadFilter()
    bandpass.type = 'bandpass'
    bandpass.frequency.setValueAtTime(1400, startTime)
    bandpass.Q.setValueAtTime(1.8, startTime)

    const gainNode = ctx.createGain()
    gainNode.gain.setValueAtTime(0.04, startTime)
    gainNode.gain.setValueAtTime(0.04, startTime + duration - 0.1)
    gainNode.gain.linearRampToValueAtTime(0, startTime + duration)

    noiseSource.connect(bandpass)
    bandpass.connect(gainNode)
    gainNode.connect(ctx.destination)

    noiseSource.start(startTime)
    noiseSource.stop(startTime + duration)

    return noiseSource
  }

  /**
   * Plays a team radio transmission with simulated F1 radio acoustics.
   * @param id Unique ID of the radio message
   * @param text Transcript text to speak or simulate
   * @param speaker Speaker name / role
   * @param durationSec Approximate duration of the transmission
   * @param audioUrl Optional real OpenF1 audio URL
   */
  public async playRadioTransmission({
    id,
    text,
    speaker,
    durationSec = 3.5,
  }: {
    id: string
    text: string
    speaker?: string
    durationSec?: number
    audioUrl?: string
  }): Promise<void> {
    // If already playing this message, stop it
    if (this.isCurrentlyPlaying && this.activeTransmissionId === id) {
      this.stop()
      return
    }

    this.stop()

    try {
      const ctx = this.getAudioContext()
      const now = ctx.currentTime
      this.notifyListeners(true, id)

      // 1. Play Intro PTT Beep
      const beepDuration = this.playPttBeep(ctx, now, true)
      const totalDuration = durationSec + beepDuration + 0.3

      // 2. Start Background Static Noise Loop
      this.noiseNode = this.createRadioStaticNode(ctx, totalDuration, now)

      // 3. Speech Synthesis with Vocal Acoustics (if Web Speech API supported)
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel()

        const utterance = new SpeechSynthesisUtterance(text)
        utterance.rate = 1.05
        utterance.pitch = speaker?.includes('Lando') ? 1.15 : speaker?.includes('Max') ? 0.95 : 1.0

        // Select voice based on speaker if available
        const voices = window.speechSynthesis.getVoices()
        const englishVoices = voices.filter((v) => v.lang.startsWith('en'))
        if (englishVoices.length > 0) {
          utterance.voice = englishVoices[Math.floor(Math.random() * englishVoices.length)]
        }

        setTimeout(() => {
          if (this.isCurrentlyPlaying && this.activeTransmissionId === id) {
            window.speechSynthesis.speak(utterance)
          }
        }, beepDuration * 1000 + 40)
      }

      // 4. Schedule Outro Beep and Transmission End
      setTimeout(() => {
        if (this.isCurrentlyPlaying && this.activeTransmissionId === id) {
          const outroTime = ctx.currentTime
          this.playPttBeep(ctx, outroTime, false)
          setTimeout(() => {
            this.stop()
          }, 300)
        }
      }, totalDuration * 1000)
    } catch (err) {
      console.warn('Web Audio Radio playback error:', err)
      this.stop()
    }
  }

  /**
   * Stops any currently playing radio audio or speech.
   */
  public stop(): void {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }
    if (this.activeSource) {
      try {
        (this.activeSource as AudioBufferSourceNode).stop()
      } catch {
        // Source might already be stopped
      }
      this.activeSource = null
    }
    this.notifyListeners(false, null)
  }

  public getIsPlaying(): boolean {
    return this.isCurrentlyPlaying
  }

  public getActiveId(): string | null {
    return this.activeTransmissionId
  }
}

export const radioAudioService = new RadioAudioService()
