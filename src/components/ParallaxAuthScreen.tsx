import { useState, useRef, useEffect, useMemo } from 'react'
import {
  ShieldCheck,
  Fingerprint,
  Cpu,
  Wind,
  Activity,
  Layers,
  ChevronRight,
  Sparkles,
  Zap,
} from 'lucide-react'
import {
  F1CarAeroIcon,
  F1SteeringWheelIcon,
  F1TelemetryWaveIcon,
  F1EngineV6Icon,
} from './F1Icons'
import { TeamLogoBadge, TEAMS_META, type TeamMetaInfo } from './TeamGraphics'
import { soundEngine } from '../services/soundEngine'

export interface PaddockCredentials {
  teamName: string
  teamCode: string
  teamColor: string
  teamSecondaryColor: string
  primaryDriverId: string
  roleTitle: string
  roleId: 'strategist' | 'aero' | 'telemetry' | 'fia'
  userName: string
  badgeId: string
  securityClearance: string
}

export interface ParallaxAuthScreenProps {
  onAuthenticate: (credentials: PaddockCredentials) => void
  onClose?: () => void
  isReopen?: boolean
  currentCredentials?: PaddockCredentials | null
}

const TEAMS_LIST: TeamMetaInfo[] = [
  TEAMS_META.MCL,
  TEAMS_META.FER,
  TEAMS_META.RBR,
  TEAMS_META.MER,
  TEAMS_META.AMR,
  TEAMS_META.WIL,
  TEAMS_META.ALP,
  TEAMS_META.RB,
  TEAMS_META.SAU,
  TEAMS_META.HAA,
]

const ROLES_LIST = [
  {
    id: 'strategist',
    title: 'Lead Race Strategist',
    eyebrow: 'PIT WALL & STRATEGY TACTICS',
    icon: <Activity size={15} />,
    desc: 'Live telemetry, pit stop delta optimization, fuel/tyre degradation modeling.',
  },
  {
    id: 'aero',
    title: 'Chief Aerodynamicist',
    eyebrow: '2026 ACTIVE AERO & CFD LAB',
    icon: <Wind size={15} />,
    desc: 'Z-Mode / X-Mode active wing pitch, ground-effect balance, Aero-Rake wake analysis.',
  },
  {
    id: 'telemetry',
    title: 'Telemetry Systems Engineer',
    eyebrow: '350kW MGU-K & SENSORS',
    icon: <Cpu size={15} />,
    desc: 'High-voltage inverter flows, 100 Hz simulation stream, steering wheel OLED sync.',
  },
  {
    id: 'fia',
    title: 'FIA Technical Delegate',
    eyebrow: 'SCRUTINEERING & REGULATIONS',
    icon: <ShieldCheck size={15} />,
    desc: 'FIA Article 3.4/3.5 verification, 768kg minimum mass, plank wear audits.',
  },
] as const

export function ParallaxAuthScreen({
  onAuthenticate,
  onClose,
  isReopen = false,
  currentCredentials,
}: ParallaxAuthScreenProps) {
  // Initialize team selection with sticky current credentials if available
  const initialTeam = useMemo(() => {
    if (currentCredentials?.teamCode && TEAMS_META[currentCredentials.teamCode]) {
      return TEAMS_META[currentCredentials.teamCode]
    }
    return TEAMS_LIST[0]
  }, [currentCredentials])

  const [selectedTeam, setSelectedTeam] = useState<TeamMetaInfo>(initialTeam)
  const [selectedRole, setSelectedRole] = useState<(typeof ROLES_LIST)[number]>(() => {
    if (currentCredentials?.roleId) {
      const found = ROLES_LIST.find((r) => r.id === currentCredentials.roleId)
      if (found) return found
    }
    return ROLES_LIST[0]
  })
  const [userName, setUserName] = useState<string>(currentCredentials?.userName || 'PADDOCK OPERATOR')
  const [isScanning, setIsScanning] = useState(false)
  const [scanProgress, setScanProgress] = useState(0)
  const [authenticated, setAuthenticated] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)

  // 3D Parallax Mouse Tracking Coordinates
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 })

  useEffect(() => {
    let animFrame = 0

    const updateParallax = () => {
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.08
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.08

      const card = cardRef.current
      if (card) {
        const rotX = -mouseRef.current.y * 14
        const rotY = mouseRef.current.x * 18
        card.style.transform = `perspective(1200px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(12px)`
      }

      animFrame = requestAnimationFrame(updateParallax)
    }

    animFrame = requestAnimationFrame(updateParallax)
    return () => cancelAnimationFrame(animFrame)
  }, [])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2
    mouseRef.current.targetX = x
    mouseRef.current.targetY = y
  }

  const handleMouseLeave = () => {
    mouseRef.current.targetX = 0
    mouseRef.current.targetY = 0
  }

  // Simulated Biometric FIA Chip Scan
  const triggerBiometricScan = () => {
    if (isScanning || authenticated) return
    setIsScanning(true)
    setScanProgress(0)

    try {
      if (!soundEngine.getIsRunning()) soundEngine.start()
    } catch {
      // Audio autoplay fallback
    }

    let progress = 0
    const interval = setInterval(() => {
      progress += 12
      setScanProgress(Math.min(100, progress))

      if (progress >= 100) {
        clearInterval(interval)
        setIsScanning(false)
        setAuthenticated(true)

        // Complete Authentication with rich credentials
        setTimeout(() => {
          onAuthenticate({
            teamName: selectedTeam.name,
            teamCode: selectedTeam.code,
            teamColor: selectedTeam.primaryColor,
            teamSecondaryColor: selectedTeam.accentColor,
            primaryDriverId: selectedTeam.primaryDriverId,
            roleTitle: selectedRole.title,
            roleId: selectedRole.id,
            userName: userName || 'PADDOCK OPERATOR',
            badgeId: `FIA-2026-${selectedTeam.code}-${Math.floor(1000 + Math.random() * 9000)}`,
            securityClearance: 'LEVEL 5 · ALL-ACCESS PADDOCK & TELEMETRY PASS',
          })
        }, 600)
      }
    }, 45)
  }

  const credentialsPayload: PaddockCredentials = useMemo(
    () => ({
      teamName: selectedTeam.name,
      teamCode: selectedTeam.code,
      teamColor: selectedTeam.primaryColor,
      teamSecondaryColor: selectedTeam.accentColor,
      primaryDriverId: selectedTeam.primaryDriverId,
      roleTitle: selectedRole.title,
      roleId: selectedRole.id,
      userName: userName || 'PADDOCK OPERATOR',
      badgeId: `FIA-2026-${selectedTeam.code}-7742`,
      securityClearance: 'LEVEL 5 · ALL-ACCESS PADDOCK & TELEMETRY PASS',
    }),
    [selectedTeam, selectedRole, userName],
  )

  return (
    <div
      className="parallax-auth-viewport"
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={
        {
          '--auth-team-primary': selectedTeam.primaryColor,
          '--auth-team-accent': selectedTeam.accentColor,
          '--auth-team-secondary': selectedTeam.secondaryColor,
        } as React.CSSProperties
      }
    >
      {/* Layer 0: Background Circuit Spline & Large Angled Stripes */}
      <div className="parallax-layer layer-deep-topo" />
      <div className="parallax-layer layer-angled-motion-stripes" />
      <div className="parallax-layer layer-scanlines" />

      {/* Layer 1: Dynamic Speed Streaks & Digital Oscilloscope Beams */}
      <div className="parallax-layer layer-light-beams">
        <div className="beam beam-1" />
        <div className="beam beam-2" />
        <div className="beam beam-3" />
      </div>

      {/* Header Badge */}
      <div className="auth-top-branding">
        <div className="auth-brand-pill">
          <TeamLogoBadge teamCode={selectedTeam.code} size={20} glow={false} />
          <span>FIA FORMULA 1 WORLD CHAMPIONSHIP · 2026 SEASON</span>
        </div>
        {isReopen && onClose && (
          <button className="auth-skip-btn" onClick={onClose}>
            RETURN TO SIMULATOR
          </button>
        )}
      </div>

      {/* Main 2-Column Parallax Stage */}
      <div className="auth-content-container">
        {/* Left Column: Interactive 3D Holographic Pass Card */}
        <div className="auth-pass-showcase">
          <div className="pass-card-3d-wrapper" ref={cardRef}>
            <div className="f1-superlicense-pass-card">
              {/* Foil Holographic Sheen Layer */}
              <div className="card-foil-sheen" />

              {/* Large Angled Racing Livery Background */}
              <div className="card-angled-livery-stripes">
                <div className="card-stripe c1" />
                <div className="card-stripe c2" />
                <div className="card-stripe c3" />
              </div>

              {/* Pass Header */}
              <div className="pass-header-strip">
                <div className="fia-seal">
                  <TeamLogoBadge teamCode={selectedTeam.code} size={26} />
                  <div>
                    <strong>FEDERATION INTERNATIONALE DE L&apos;AUTOMOBILE</strong>
                    <small>OFFICIAL PADDOCK &amp; TELEMETRY ACCESS PASS</small>
                  </div>
                </div>
                <span className="pass-season-badge">2026</span>
              </div>

              {/* Pass Body Profile */}
              <div className="pass-card-body">
                <div className="pass-chip-row">
                  <div className="smart-chip-gold">
                    <span className="chip-wire w1" />
                    <span className="chip-wire w2" />
                    <span className="chip-wire w3" />
                  </div>
                  <div className="pass-nfc-indicator">
                    <Zap size={14} className="nfc-pulse" />
                    <span>ENCRYPTED TELEMETRY LINK</span>
                  </div>
                </div>

                <div className="pass-holder-info">
                  <span className="pass-eyebrow">CREDENTIAL HOLDER</span>
                  <h2 className="pass-holder-name">{userName.toUpperCase() || 'PADDOCK OPERATOR'}</h2>
                  <span className="pass-role-badge">{selectedRole.title.toUpperCase()}</span>
                </div>

                <div className="pass-team-row">
                  <div className="team-pill-swatch" style={{ background: selectedTeam.primaryColor }} />
                  <div className="team-meta">
                    <strong>{selectedTeam.name}</strong>
                    <small>DRIVERS: {selectedTeam.driverNumbers}</small>
                  </div>
                </div>

                <div className="pass-technical-specs">
                  <div className="spec-item">
                    <span>CLEARANCE</span>
                    <strong>FIA LEVEL 5</strong>
                  </div>
                  <div className="spec-item">
                    <span>SECURITY HASH</span>
                    <strong>0x7F26_PU350KW</strong>
                  </div>
                  <div className="spec-item">
                    <span>ACTIVE AERO</span>
                    <strong>Z/X COMPLIANT</strong>
                  </div>
                </div>
              </div>

              {/* Pass Footer Barcode */}
              <div className="pass-barcode-footer">
                <div className="simulated-barcode" />
                <span className="badge-serial">FIA-2026-{selectedTeam.code}-9841-SEC</span>
              </div>
            </div>
          </div>

          <div className="pass-interaction-hint">
            <span>✦ MOVE MOUSE TO TILT 3D HOLOGRAPHIC FOIL PASS</span>
          </div>
        </div>

        {/* Right Column: Interactive Credential Configurator & Biometric Gate */}
        <div className="auth-configurator-panel">
          <div className="configurator-header">
            <span className="config-eyebrow">MOTORSPORT ACCESS GATEWAY</span>
            <h1 className="config-title">Paddock &amp; Telemetry Command Center</h1>
            <p className="config-subtitle">
              Select your constructor team, configure your engineering role, and authorize access to real-time 100 Hz vehicle kinematics.
            </p>
          </div>

          {/* 1. Team Selector Grid with Modern Angled Stripes & Vector Logos */}
          <div className="config-section">
            <span className="section-label">
              <Layers size={13} /> SELECT CONSTRUCTOR TEAM (10 OFFICIAL TEAMS)
            </span>
            <div className="team-selector-grid-modern">
              {TEAMS_LIST.map((t) => {
                const isSelected = selectedTeam.code === t.code
                return (
                  <button
                    key={t.code}
                    type="button"
                    className={`team-card-select-btn ${isSelected ? 'active' : ''}`}
                    style={
                      {
                        '--btn-primary': t.primaryColor,
                        '--btn-accent': t.accentColor,
                        '--btn-secondary': t.secondaryColor,
                      } as React.CSSProperties
                    }
                    onClick={() => setSelectedTeam(t)}
                  >
                    {/* Angled Racing Livery Stripes Underlay */}
                    <div className="btn-angled-stripes">
                      <span className="stripe-s1" />
                      <span className="stripe-s2" />
                    </div>

                    <div className="btn-content-wrap">
                      <div className="btn-logo-wrap">
                        <TeamLogoBadge teamCode={t.code} size={24} glow={isSelected} />
                      </div>
                      <div className="btn-team-text">
                        <strong className="btn-team-name">{t.teamShort}</strong>
                        <span className="btn-driver-numbers">{t.driverNumbers}</span>
                      </div>
                      {isSelected && <span className="selected-glow-dot" />}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* 2. Engineering Role Selector */}
          <div className="config-section">
            <span className="section-label">
              <Sparkles size={13} /> SELECT OPERATIONAL ROLE
            </span>
            <div className="role-selector-cards">
              {ROLES_LIST.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  className={`role-select-card ${selectedRole.id === r.id ? 'active' : ''}`}
                  onClick={() => setSelectedRole(r)}
                >
                  <div className="role-icon-wrap">{r.icon}</div>
                  <div className="role-text-wrap">
                    <span className="role-eyebrow">{r.eyebrow}</span>
                    <strong className="role-name">{r.title}</strong>
                    <p className="role-desc">{r.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 3. Operator Name Input */}
          <div className="config-section">
            <span className="section-label">OPERATOR IDENTIFIER / CALLSIGN</span>
            <input
              type="text"
              className="operator-name-input"
              value={userName}
              maxLength={24}
              placeholder="ENTER CALLSIGN..."
              onChange={(e) => setUserName(e.target.value)}
            />
          </div>

          {/* 4. Biometric Authorization Trigger & Enter Button */}
          <div className="auth-actions-group">
            <button
              type="button"
              className={`biometric-scan-btn ${isScanning ? 'scanning' : ''} ${authenticated ? 'authenticated' : ''}`}
              onClick={triggerBiometricScan}
              disabled={isScanning || authenticated}
            >
              <div className="scan-icon-container">
                <Fingerprint size={24} />
                {isScanning && <div className="laser-scan-bar" />}
              </div>
              <div className="scan-text-container">
                <strong>
                  {authenticated
                    ? `AUTHENTICATED FOR ${selectedTeam.name.toUpperCase()} ✓`
                    : isScanning
                      ? `AUTHENTICATING FIA CHIP... ${scanProgress}%`
                      : `SCAN BIOMETRIC CHIP & JOIN ${selectedTeam.teamShort.toUpperCase()}`}
                </strong>
                <small>ENCRYPTED FIA SMART LICENSE BIO-VERIFICATION</small>
              </div>
            </button>

            <button
              type="button"
              className="direct-enter-btn"
              onClick={() => onAuthenticate(credentialsPayload)}
            >
              <span>ENTER PADDOCK WITH {selectedTeam.teamShort.toUpperCase()}</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Footer Feature Badges */}
      <div className="auth-footer-features">
        <div className="feature-pill">
          <F1CarAeroIcon size={14} color="#38bdf8" />
          <span>2026 ACTIVE AERO CAD</span>
        </div>
        <div className="feature-pill">
          <F1EngineV6Icon size={14} color="#ff8000" />
          <span>350kW MGU-K HYBRID PU</span>
        </div>
        <div className="feature-pill">
          <F1SteeringWheelIcon size={14} color="#30d158" />
          <span>3D COCKPIT WHEEL LAB</span>
        </div>
        <div className="feature-pill">
          <F1TelemetryWaveIcon size={14} color="#c084fc" />
          <span>100 Hz PHYSICS WORKER</span>
        </div>
      </div>
    </div>
  )
}
