/**
 * Ultra-Realistic F1 Team Radio Audio & Voice Synthesis Service
 * 
 * Provides broadcast-quality motorsport voice communications:
 * 1. Strict blacklisting of robotic, comedic, alien, and novelty legacy voices.
 * 2. Natural / Neural / Enhanced voice prioritization (Apple Siri/Enhanced, Google Natural, Microsoft Natural).
 * 3. Driver and Race Engineer persona profiling (British/European/Australian accents, tailored cadence and natural pitch).
 * 4. Procedural VHF Radio Audio DSP: Dual-tone Rogers PTT beeps, squelch gate keying clicks,
 *    ducked background cockpit static hiss, and squelch release burst tails.
 * 5. Multiple radio acoustic profiles: 'authentic' (VHF radio), 'studio' (ultra-clear), and 'raw' (cockpit ambiance).
 * 6. Direct OpenF1 MP3/AAC audio clip playback support with automatic fallback.
 */

export type RadioAudioMode = 'authentic' | 'studio' | 'raw'

export interface SpeakerPersona {
  role: 'engineer' | 'driver'
  preferredLocales: string[]
  preferredNames: string[]
  rate: number
  pitch: number
}

// Strictly exclude vintage novelty, comedic, and robotic synthesizer voices
const NOVELTY_VOICE_BLACKLIST = [
  'bad news',
  'bahh',
  'bells',
  'boing',
  'bubbles',
  'cellos',
  'deranged',
  'good news',
  'hysterical',
  'pipe organ',
  'trinoids',
  'whisper',
  'zarvox',
  'albert',
  'fred',
  'junior',
  'kathy',
  'ralph',
  'wobble',
  'jester',
  'organ',
  'sin-ji',
  'tink',
  'espeak',
  'robot',
  'grandma',
  'grandpa',
  'reed',
  'eddy',
  'flo',
  'rocko',
  'shelley',
  'sandy',
  'whisper',
]

// Priority keywords for high-definition, neural, and natural voices
const NATURAL_VOICE_KEYWORDS = [
  'natural',
  'neural',
  'enhanced',
  'online',
  'premium',
  'siri',
  'google',
  'daniel',
  'oliver',
  'george',
  'arthur',
  'ryan',
  'guy',
  'serena',
  'samantha',
  'karen',
  'hazel',
  'fiona',
  'martha',
  'rishi',
  'tessa',
]

export class RadioAudioService {
  private audioCtx: AudioContext | null = null
  private noiseGainNode: GainNode | null = null
  private noiseSourceNode: AudioBufferSourceNode | null = null
  private isCurrentlyPlaying = false
  private activeTransmissionId: string | null = null
  private onStateChangeListeners: Set<(isPlaying: boolean, id: string | null) => void> = new Set()

  private radioMode: RadioAudioMode = 'authentic'
  private masterVolume = 0.8
  private squelchStaticVolume = 0.025
  private cachedVoices: SpeechSynthesisVoice[] = []
  private voicesLoaded = false

  constructor() {
    this.initVoiceCache()
  }

  /**
   * Initializes and listens for asynchronous voice loading from browser Web Speech API.
   */
  private initVoiceCache() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return

    const load = () => {
      const all = window.speechSynthesis.getVoices()
      if (all && all.length > 0) {
        this.cachedVoices = all.filter((v) => {
          const lowerName = v.name.toLowerCase()
          return !NOVELTY_VOICE_BLACKLIST.some((b) => lowerName.includes(b))
        })
        this.voicesLoaded = true
      }
    }

    load()
    if ('onvoiceschanged' in window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = load
    }
  }

  private getAudioContext(): AudioContext {
    if (!this.audioCtx) {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
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

  public setRadioMode(mode: RadioAudioMode) {
    this.radioMode = mode
  }

  public getRadioMode(): RadioAudioMode {
    return this.radioMode
  }

  public setMasterVolume(vol: number) {
    this.masterVolume = Math.max(0, Math.min(1, vol))
  }

  public setSquelchStaticVolume(vol: number) {
    this.squelchStaticVolume = Math.max(0, Math.min(0.2, vol))
  }

  /**
   * Identifies the speaker's role and tone requirements.
   */
  private getSpeakerPersona(speaker?: string): SpeakerPersona {
    if (!speaker) {
      return {
        role: 'engineer',
        preferredLocales: ['en-GB', 'en-US', 'en'],
        preferredNames: ['Daniel', 'George', 'Oliver', 'Arthur', 'Ryan', 'Google UK English Male'],
        rate: 1.0,
        pitch: 1.0,
      }
    }

    const lower = speaker.toLowerCase()

    // Race Engineers
    if (lower.includes('engineer') || lower.includes('gp') || lower.includes('bono') || lower.includes('joseph') || lower.includes('bozzi') || lower.includes('lamb')) {
      if (lower.includes('gp') || lower.includes('lambiase')) {
        return {
          role: 'engineer',
          preferredLocales: ['en-GB', 'en-IE', 'en'],
          preferredNames: ['Daniel', 'Ryan', 'Arthur', 'George', 'Google UK English Male'],
          rate: 0.98,
          pitch: 0.98,
        }
      }
      return {
        role: 'engineer',
        preferredLocales: ['en-GB', 'en-US', 'en'],
        preferredNames: ['Oliver', 'Daniel', 'George', 'Arthur', 'Google UK English Male'],
        rate: 1.0,
        pitch: 1.0,
      }
    }

    // Specific Drivers
    if (lower.includes('norris') || lower.includes('lando')) {
      return {
        role: 'driver',
        preferredLocales: ['en-GB', 'en'],
        preferredNames: ['Daniel', 'Oliver', 'George', 'Google UK English Male', 'en-GB'],
        rate: 1.02,
        pitch: 1.01,
      }
    }
    if (lower.includes('piastri') || lower.includes('oscar')) {
      return {
        role: 'driver',
        preferredLocales: ['en-AU', 'en-GB', 'en'],
        preferredNames: ['Karen', 'Russell', 'Google Australian English', 'Daniel', 'en-AU'],
        rate: 0.98,
        pitch: 0.99,
      }
    }
    if (lower.includes('verstappen') || lower.includes('max')) {
      return {
        role: 'driver',
        preferredLocales: ['en-GB', 'en-US', 'en'],
        preferredNames: ['Ryan', 'Daniel', 'Arthur', 'Google US English', 'en-US'],
        rate: 1.02,
        pitch: 0.98,
      }
    }
    if (lower.includes('hamilton') || lower.includes('lewis')) {
      return {
        role: 'driver',
        preferredLocales: ['en-GB', 'en'],
        preferredNames: ['Arthur', 'Daniel', 'George', 'Google UK English Male', 'en-GB'],
        rate: 0.97,
        pitch: 0.98,
      }
    }
    if (lower.includes('leclerc') || lower.includes('charles')) {
      return {
        role: 'driver',
        preferredLocales: ['en-GB', 'en-US', 'en'],
        preferredNames: ['Daniel', 'Oliver', 'Ryan', 'en-GB'],
        rate: 1.01,
        pitch: 1.01,
      }
    }
    if (lower.includes('russell') || lower.includes('george')) {
      return {
        role: 'driver',
        preferredLocales: ['en-GB', 'en'],
        preferredNames: ['George', 'Oliver', 'Daniel', 'Google UK English Male', 'en-GB'],
        rate: 1.0,
        pitch: 1.0,
      }
    }
    if (lower.includes('alonso') || lower.includes('fernando')) {
      return {
        role: 'driver',
        preferredLocales: ['en-GB', 'en-US', 'en'],
        preferredNames: ['Ryan', 'Arthur', 'Daniel', 'en-US'],
        rate: 1.02,
        pitch: 0.98,
      }
    }

    // Default Driver
    return {
      role: 'driver',
      preferredLocales: ['en-GB', 'en-US', 'en-AU', 'en'],
      preferredNames: ['Daniel', 'Oliver', 'Arthur', 'Ryan', 'George'],
      rate: 1.0,
      pitch: 1.0,
    }
  }

  /**
   * Evaluates available voices and selects the highest-scoring natural human voice.
   */
  public selectBestVoice(speaker?: string): SpeechSynthesisVoice | null {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null

    let voices = this.cachedVoices
    if (!this.voicesLoaded || voices.length === 0) {
      const live = window.speechSynthesis.getVoices()
      voices = live.filter((v) => {
        const lowerName = v.name.toLowerCase()
        return !NOVELTY_VOICE_BLACKLIST.some((b) => lowerName.includes(b))
      })
    }

    if (voices.length === 0) return null

    const persona = this.getSpeakerPersona(speaker)
    const englishVoices = voices.filter((v) => v.lang.startsWith('en'))
    const candidates = englishVoices.length > 0 ? englishVoices : voices

    let bestVoice: SpeechSynthesisVoice | null = null
    let highestScore = -999

    for (const voice of candidates) {
      const lowerName = voice.name.toLowerCase()
      let score = 0

      // Bonus for preferred persona names
      if (persona.preferredNames.some((n) => lowerName.includes(n.toLowerCase()))) {
        score += 60
      }

      // Bonus for preferred locale
      if (persona.preferredLocales.some((loc) => voice.lang.toLowerCase().startsWith(loc.toLowerCase()))) {
        score += 30
      }

      // High bonus for Natural / Enhanced / Neural / Siri
      if (NATURAL_VOICE_KEYWORDS.some((kw) => lowerName.includes(kw))) {
        score += 45
      }

      // Favor standard English
      if (voice.lang === 'en-GB' || voice.lang === 'en_GB') score += 20
      if (voice.lang === 'en-US' || voice.lang === 'en_US') score += 15
      if (voice.lang === 'en-AU' || voice.lang === 'en_AU') score += 18

      // Default system voice baseline
      if (voice.default) score += 10

      if (score > highestScore) {
        highestScore = score
        bestVoice = voice
      }
    }

    return bestVoice || candidates[0] || null
  }

  /**
   * Plays the authentic F1 Roger Push-to-Talk (PTT) chirp.
   */
  private playPttRogerBeep(ctx: AudioContext, startTime: number, isIntro = true): number {
    const freq1 = isIntro ? 1850 : 2200
    const freq2 = isIntro ? 2300 : 1750
    const toneDuration = 0.038

    const osc1 = ctx.createOscillator()
    const osc2 = ctx.createOscillator()
    const gainNode = ctx.createGain()
    const filter = ctx.createBiquadFilter()

    filter.type = 'bandpass'
    filter.frequency.setValueAtTime(2100, startTime)
    filter.Q.setValueAtTime(3.0, startTime)

    osc1.type = 'sine'
    osc1.frequency.setValueAtTime(freq1, startTime)

    osc2.type = 'sine'
    osc2.frequency.setValueAtTime(freq2, startTime + toneDuration)

    const baseVol = this.masterVolume * 0.22
    gainNode.gain.setValueAtTime(0, startTime)
    gainNode.gain.linearRampToValueAtTime(baseVol, startTime + 0.004)
    gainNode.gain.setValueAtTime(baseVol, startTime + toneDuration * 2 - 0.005)
    gainNode.gain.linearRampToValueAtTime(0, startTime + toneDuration * 2)

    osc1.connect(filter)
    osc2.connect(filter)
    filter.connect(gainNode)
    gainNode.connect(ctx.destination)

    osc1.start(startTime)
    osc1.stop(startTime + toneDuration)
    osc2.start(startTime + toneDuration)
    osc2.stop(startTime + toneDuration * 2)

    // Play subtle mic switch click transient
    this.playMicSwitchClick(ctx, startTime)

    return toneDuration * 2
  }

  /**
   * Mechanical microswitch tactile keying click
   */
  private playMicSwitchClick(ctx: AudioContext, startTime: number) {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    const filter = ctx.createBiquadFilter()

    osc.type = 'square'
    osc.frequency.setValueAtTime(3400, startTime)
    osc.frequency.exponentialRampToValueAtTime(300, startTime + 0.015)

    filter.type = 'highpass'
    filter.frequency.setValueAtTime(1600, startTime)

    gain.gain.setValueAtTime(this.masterVolume * 0.12, startTime)
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.018)

    osc.connect(filter)
    filter.connect(gain)
    gain.connect(ctx.destination)

    osc.start(startTime)
    osc.stop(startTime + 0.02)
  }

  /**
   * Squelch tail burst: characteristic "ksssh" when releasing the radio mic
   */
  private playSquelchTailBurst(ctx: AudioContext, startTime: number) {
    if (this.radioMode === 'studio') return

    const duration = 0.09
    const bufferSize = Math.floor(ctx.sampleRate * duration)
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)

    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1
    }

    const noise = ctx.createBufferSource()
    noise.buffer = buffer

    const filter = ctx.createBiquadFilter()
    filter.type = 'bandpass'
    filter.frequency.setValueAtTime(1800, startTime)
    filter.Q.setValueAtTime(2.2, startTime)

    const gain = ctx.createGain()
    const burstVol = this.masterVolume * (this.radioMode === 'raw' ? 0.08 : 0.04)
    gain.gain.setValueAtTime(burstVol, startTime)
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration)

    noise.connect(filter)
    filter.connect(gain)
    gain.connect(ctx.destination)

    noise.start(startTime)
    noise.stop(startTime + duration)
  }

  /**
   * Generates warm, subtle VHF bandpass static noise with dynamic speech ducking.
   */
  private startVhfStaticAmbiance(ctx: AudioContext, startTime: number): { gain: GainNode; source: AudioBufferSourceNode } {
    const duration = 20 // Continuous loop buffer
    const bufferSize = ctx.sampleRate * duration
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)

    // Pink-ish filtered thermal noise
    let b0 = 0, b1 = 0, b2 = 0
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1
      b0 = 0.99886 * b0 + white * 0.045
      b1 = 0.99332 * b1 + white * 0.065
      b2 = 0.969 * b2 + white * 0.12
      data[i] = (b0 + b1 + b2 + white * 0.4) * 0.05
    }

    const noiseSource = ctx.createBufferSource()
    noiseSource.buffer = buffer
    noiseSource.loop = true

    // VHF Squelch bandpass filter (500Hz - 2800Hz)
    const bandpass = ctx.createBiquadFilter()
    bandpass.type = 'bandpass'
    bandpass.frequency.setValueAtTime(1550, startTime)
    bandpass.Q.setValueAtTime(1.6, startTime)

    const gainNode = ctx.createGain()
    const targetStaticVol = this.radioMode === 'raw' ? this.squelchStaticVolume * 1.5 : this.radioMode === 'authentic' ? this.squelchStaticVolume : 0

    gainNode.gain.setValueAtTime(0, startTime)
    gainNode.gain.linearRampToValueAtTime(targetStaticVol * this.masterVolume, startTime + 0.06)

    noiseSource.connect(bandpass)
    bandpass.connect(gainNode)
    gainNode.connect(ctx.destination)

    noiseSource.start(startTime)

    this.noiseGainNode = gainNode
    this.noiseSourceNode = noiseSource

    return { gain: gainNode, source: noiseSource }
  }

  /**
   * Smoothly ducks background radio noise while voice speech is active.
   */
  private duckStaticNoise(isSpeaking: boolean) {
    if (!this.audioCtx || !this.noiseGainNode || this.radioMode === 'studio') return
    const now = this.audioCtx.currentTime
    const baseVol = (this.radioMode === 'raw' ? this.squelchStaticVolume * 1.5 : this.squelchStaticVolume) * this.masterVolume
    const target = isSpeaking ? baseVol * 0.25 : baseVol
    this.noiseGainNode.gain.setTargetAtTime(target, now, 0.08)
  }

  /**
   * Plays a team radio transmission using high-definition speech synthesis and authentic VHF acoustics.
   */
  public async playRadioTransmission({
    id,
    text,
    speaker,
    durationSec = 3.5,
    audioUrl,
  }: {
    id: string
    text: string
    speaker?: string
    durationSec?: number
    audioUrl?: string
  }): Promise<void> {
    // If clicking the currently active message, stop it
    if (this.isCurrentlyPlaying && this.activeTransmissionId === id) {
      this.stop()
      return
    }

    this.stop()

    try {
      const ctx = this.getAudioContext()
      const now = ctx.currentTime
      this.notifyListeners(true, id)

      // 1. Play Intro Roger PTT Chirp
      const beepDuration = this.radioMode !== 'studio' ? this.playPttRogerBeep(ctx, now, true) : 0.05

      // 2. Start Ducked VHF Static Noise Loop
      if (this.radioMode !== 'studio') {
        this.startVhfStaticAmbiance(ctx, now)
      }

      // 3. Audio URL direct playback (if real OpenF1 audio clip provided)
      if (audioUrl) {
        try {
          const audio = new Audio(audioUrl)
          audio.volume = this.masterVolume
          audio.onended = () => {
            if (this.isCurrentlyPlaying && this.activeTransmissionId === id) {
              this.finishTransmission(ctx, id)
            }
          }
          audio.onerror = () => {
            // Fallback to speech synthesis if audio URL fails
            this.speakUtterance(ctx, id, text, speaker, beepDuration, durationSec)
          }
          await audio.play()
          return
        } catch {
          // Fall through to TTS
        }
      }

      // 4. Ultra-Clear Natural Speech Synthesis
      this.speakUtterance(ctx, id, text, speaker, beepDuration, durationSec)
    } catch (err) {
      console.warn('Radio audio playback error:', err)
      this.stop()
    }
  }

  /**
   * Synthesizes natural, human-quality voice with synchronized lifecycle handlers.
   */
  private speakUtterance(
    ctx: AudioContext,
    id: string,
    text: string,
    speaker: string | undefined,
    beepDuration: number,
    fallbackDurationSec: number
  ) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      // Fallback timer if Web Speech is not supported
      setTimeout(() => {
        if (this.isCurrentlyPlaying && this.activeTransmissionId === id) {
          this.finishTransmission(ctx, id)
        }
      }, fallbackDurationSec * 1000 + 300)
      return
    }

    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    const persona = this.getSpeakerPersona(speaker)
    const bestVoice = this.selectBestVoice(speaker)

    if (bestVoice) {
      utterance.voice = bestVoice
    }

    utterance.rate = persona.rate
    utterance.pitch = persona.pitch
    utterance.volume = this.masterVolume

    let hasEnded = false

    utterance.onstart = () => {
      this.duckStaticNoise(true)
    }

    utterance.onend = () => {
      if (hasEnded) return
      hasEnded = true
      this.duckStaticNoise(false)
      this.finishTransmission(ctx, id)
    }

    utterance.onerror = (e) => {
      if (hasEnded) return
      hasEnded = true
      console.warn('Speech synthesis utterance error:', e)
      this.stop()
    }

    // Schedule speech start right after the PTT Roger chirp finishes
    setTimeout(() => {
      if (this.isCurrentlyPlaying && this.activeTransmissionId === id) {
        window.speechSynthesis.speak(utterance)
      }
    }, beepDuration * 1000 + 30)

    // Safety timeout in case browser drops speech onend event
    const maxSafetyDuration = Math.max(8000, fallbackDurationSec * 2200)
    setTimeout(() => {
      if (!hasEnded && this.isCurrentlyPlaying && this.activeTransmissionId === id) {
        hasEnded = true
        this.finishTransmission(ctx, id)
      }
    }, maxSafetyDuration)
  }

  /**
   * Concludes a transmission with authentic squelch burst and outro Roger chirp.
   */
  private finishTransmission(ctx: AudioContext, id: string) {
    if (!this.isCurrentlyPlaying || this.activeTransmissionId !== id) return

    const now = ctx.currentTime
    if (this.radioMode !== 'studio') {
      this.playSquelchTailBurst(ctx, now)
      this.playPttRogerBeep(ctx, now + 0.05, false)
    }

    setTimeout(() => {
      if (this.activeTransmissionId === id) {
        this.stop()
      }
    }, 280)
  }

  /**
   * Instantly stops any playing voice or radio transmission.
   */
  public stop(): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }

    if (this.noiseSourceNode) {
      try {
        this.noiseSourceNode.stop()
        this.noiseSourceNode.disconnect()
      } catch {
        // Node already stopped
      }
      this.noiseSourceNode = null
    }

    this.noiseGainNode = null
    this.notifyListeners(false, null)
  }

  /**
   * Helper to audition / test voice quality.
   */
  public testTransmission(speaker = 'Will Joseph (Race Engineer)', sampleText = 'Radio check, radio check. Loud and clear, box box this lap.'): void {
    this.playRadioTransmission({
      id: 'test-transmission',
      text: sampleText,
      speaker,
      durationSec: 3.5,
    })
  }

  public getIsPlaying(): boolean {
    return this.isCurrentlyPlaying
  }

  public getActiveId(): string | null {
    return this.activeTransmissionId
  }

  public getAvailableVoices(): SpeechSynthesisVoice[] {
    return this.cachedVoices
  }
}

export const radioAudioService = new RadioAudioService()

