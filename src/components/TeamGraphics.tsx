import type { SVGProps } from 'react'
import { Sparkles, Trophy, Zap, Radio } from 'lucide-react'

export interface TeamGraphicProps extends SVGProps<SVGSVGElement> {
  size?: number
  color?: string
  accentColor?: string
}

export interface TeamMetaInfo {
  code: string
  teamShort: string
  name: string
  primaryColor: string
  secondaryColor: string
  accentColor: string
  driverNumbers: string
  primaryDriverId: string
  secondaryDriverId: string
  primaryDriverName: string
  secondaryDriverName: string
  points: number
  championshipRank: number
}

export const TEAMS_META: Record<string, TeamMetaInfo> = {
  MCL: {
    code: 'MCL',
    teamShort: 'MCL',
    name: 'McLaren Formula 1 Team',
    primaryColor: '#ff8000',
    secondaryColor: '#12171f',
    accentColor: '#47c7fc',
    driverNumbers: '#4 NOR / #81 PIA',
    primaryDriverId: 'nor',
    secondaryDriverId: 'pia',
    primaryDriverName: 'Lando Norris',
    secondaryDriverName: 'Oscar Piastri',
    points: 312,
    championshipRank: 1,
  },
  FER: {
    code: 'FER',
    teamShort: 'FER',
    name: 'Scuderia Ferrari HP',
    primaryColor: '#e8002d',
    secondaryColor: '#1a0508',
    accentColor: '#ffe600',
    driverNumbers: '#16 LEC / #44 HAM',
    primaryDriverId: 'lec',
    secondaryDriverId: 'ham',
    primaryDriverName: 'Charles Leclerc',
    secondaryDriverName: 'Lewis Hamilton',
    points: 295,
    championshipRank: 2,
  },
  RBR: {
    code: 'RBR',
    teamShort: 'RBR',
    name: 'Oracle Red Bull Racing',
    primaryColor: '#1e41ff',
    secondaryColor: '#0a102a',
    accentColor: '#ff1801',
    driverNumbers: '#1 VER / #30 LAW',
    primaryDriverId: 'ver',
    secondaryDriverId: 'law',
    primaryDriverName: 'Max Verstappen',
    secondaryDriverName: 'Liam Lawson',
    points: 274,
    championshipRank: 3,
  },
  MER: {
    code: 'MER',
    teamShort: 'MER',
    name: 'Mercedes-AMG PETRONAS F1 Team',
    primaryColor: '#00d2be',
    secondaryColor: '#0e1719',
    accentColor: '#c8ccce',
    driverNumbers: '#63 RUS / #12 ANT',
    primaryDriverId: 'rus',
    secondaryDriverId: 'ant',
    primaryDriverName: 'George Russell',
    secondaryDriverName: 'Kimi Antonelli',
    points: 240,
    championshipRank: 4,
  },
  AMR: {
    code: 'AMR',
    teamShort: 'AST',
    name: 'Aston Martin Aramco F1 Team',
    primaryColor: '#006f62',
    secondaryColor: '#081714',
    accentColor: '#cedc00',
    driverNumbers: '#14 ALO / #18 STR',
    primaryDriverId: 'alo',
    secondaryDriverId: 'str',
    primaryDriverName: 'Fernando Alonso',
    secondaryDriverName: 'Lance Stroll',
    points: 182,
    championshipRank: 5,
  },
  AST: {
    code: 'AST',
    teamShort: 'AST',
    name: 'Aston Martin Aramco F1 Team',
    primaryColor: '#006f62',
    secondaryColor: '#081714',
    accentColor: '#cedc00',
    driverNumbers: '#14 ALO / #18 STR',
    primaryDriverId: 'alo',
    secondaryDriverId: 'str',
    primaryDriverName: 'Fernando Alonso',
    secondaryDriverName: 'Lance Stroll',
    points: 182,
    championshipRank: 5,
  },
  WIL: {
    code: 'WIL',
    teamShort: 'WIL',
    name: 'Williams Racing',
    primaryColor: '#005aff',
    secondaryColor: '#051026',
    accentColor: '#00a0de',
    driverNumbers: '#55 SAI / #23 ALB',
    primaryDriverId: 'sai',
    secondaryDriverId: 'alb',
    primaryDriverName: 'Carlos Sainz',
    secondaryDriverName: 'Alexander Albon',
    points: 94,
    championshipRank: 6,
  },
  ALP: {
    code: 'ALP',
    teamShort: 'ALP',
    name: 'BWT Alpine F1 Team',
    primaryColor: '#0090ff',
    secondaryColor: '#071529',
    accentColor: '#ff87bc',
    driverNumbers: '#10 GAS / #7 DOO',
    primaryDriverId: 'gas',
    secondaryDriverId: 'doo',
    primaryDriverName: 'Pierre Gasly',
    secondaryDriverName: 'Jack Doohan',
    points: 62,
    championshipRank: 7,
  },
  RB: {
    code: 'RB',
    teamShort: 'VCARB',
    name: 'Visa Cash App RB F1 Team',
    primaryColor: '#6692ff',
    secondaryColor: '#0e1633',
    accentColor: '#ffffff',
    driverNumbers: '#22 TSU / #6 HAD',
    primaryDriverId: 'tsu',
    secondaryDriverId: 'had',
    primaryDriverName: 'Yuki Tsunoda',
    secondaryDriverName: 'Isack Hadjar',
    points: 58,
    championshipRank: 8,
  },
  VCARB: {
    code: 'VCARB',
    teamShort: 'VCARB',
    name: 'Visa Cash App RB F1 Team',
    primaryColor: '#6692ff',
    secondaryColor: '#0e1633',
    accentColor: '#ffffff',
    driverNumbers: '#22 TSU / #6 HAD',
    primaryDriverId: 'tsu',
    secondaryDriverId: 'had',
    primaryDriverName: 'Yuki Tsunoda',
    secondaryDriverName: 'Isack Hadjar',
    points: 58,
    championshipRank: 8,
  },
  SAU: {
    code: 'SAU',
    teamShort: 'SAU',
    name: 'Stake F1 Team Kick Sauber',
    primaryColor: '#52e252',
    secondaryColor: '#091c09',
    accentColor: '#111111',
    driverNumbers: '#27 HUL / #5 BOR',
    primaryDriverId: 'hul',
    secondaryDriverId: 'bor',
    primaryDriverName: 'Nico Hülkenberg',
    secondaryDriverName: 'Gabriel Bortoleto',
    points: 36,
    championshipRank: 10,
  },
  HAA: {
    code: 'HAA',
    teamShort: 'HAS',
    name: 'MoneyGram Haas F1 Team',
    primaryColor: '#b6babd',
    secondaryColor: '#17191a',
    accentColor: '#e6002b',
    driverNumbers: '#31 OCO / #87 BEA',
    primaryDriverId: 'oco',
    secondaryDriverId: 'bea',
    primaryDriverName: 'Esteban Ocon',
    secondaryDriverName: 'Oliver Bearman',
    points: 44,
    championshipRank: 9,
  },
  HAS: {
    code: 'HAS',
    teamShort: 'HAS',
    name: 'MoneyGram Haas F1 Team',
    primaryColor: '#b6babd',
    secondaryColor: '#17191a',
    accentColor: '#e6002b',
    driverNumbers: '#31 OCO / #87 BEA',
    primaryDriverId: 'oco',
    secondaryDriverId: 'bea',
    primaryDriverName: 'Esteban Ocon',
    secondaryDriverName: 'Oliver Bearman',
    points: 44,
    championshipRank: 9,
  },
}

export function getTeamMeta(teamCodeOrName?: string): TeamMetaInfo {
  if (!teamCodeOrName) return TEAMS_META.MCL
  const upper = teamCodeOrName.toUpperCase()
  if (TEAMS_META[upper]) return TEAMS_META[upper]
  for (const meta of Object.values(TEAMS_META)) {
    if (
      upper.includes(meta.code) ||
      upper.includes(meta.teamShort) ||
      upper.includes(meta.name.toUpperCase()) ||
      meta.name.toUpperCase().includes(upper)
    ) {
      return meta
    }
  }
  return TEAMS_META.MCL
}

/* ==========================================================================
   10 Dedicated Vector SVG Team Logos & Emblems
   ========================================================================== */

/** McLaren Papaya Speedmark / Dynamic Swoop */
export function McLarenLogo({ size = 24, color = '#ff8000', accentColor = '#47c7fc', ...props }: TeamGraphicProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <defs>
        <linearGradient id="mcl-swoop-grad" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={color} />
          <stop offset="100%" stopColor="#e65c00" />
        </linearGradient>
      </defs>
      {/* Dynamic angled speedmark */}
      <path
        d="M6 25C14 26 24 22 29 11C31 7 30 5 28 6C24 8 16 14 10 20C8 22 6 24 6 25Z"
        fill="url(#mcl-swoop-grad)"
      />
      <path
        d="M12 28C19 28 27 24 31 15C32 13 32 10 30 11C26 14 18 20 12 25L12 28Z"
        fill={accentColor}
        fillOpacity="0.8"
      />
      {/* Modern angled racing tick */}
      <path d="M4 14L8 10L14 16L10 20L4 14Z" fill={color} fillOpacity="0.3" />
    </svg>
  )
}

/** Ferrari Prancing Stallion Shield with Italian Tricolore */
export function FerrariLogo({ size = 24, color = '#e8002d', accentColor = '#ffe600', ...props }: TeamGraphicProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      {/* Shield Frame */}
      <path
        d="M8 5C14 5 18 3 18 3C18 3 22 5 28 5C28 17 22 28 18 32C14 28 8 17 8 5Z"
        fill={color}
        stroke="#ffffff"
        strokeWidth="1.2"
      />
      {/* Tricolore Banner on top */}
      <path d="M10 6H15V9H10V6Z" fill="#009246" />
      <path d="M15 6H21V9H15V6Z" fill="#ffffff" />
      <path d="M21 6H26V9H21V6Z" fill="#ce2b37" />
      {/* Canary Yellow Center Field */}
      <path d="M11 10H25C24.5 19 20 25 18 28C16 25 11.5 19 11 10Z" fill={accentColor} />
      {/* Stylized Prancing Stallion Silhouette */}
      <path
        d="M18 13C17.5 12 16.5 13 16 14.5C15.5 16 16.5 17 17 18C16 19 15.5 21 16 23C16.5 24 17.5 24.5 18 23.5C18.5 22.5 18 21 18.5 20C19.5 21 20.5 20 20 18.5C19.5 17 18.5 16 18.5 14.5C18.5 13.5 18.5 13 18 13Z"
        fill="#111111"
      />
      <circle cx="17.2" cy="14" r="0.6" fill="#ffe600" />
    </svg>
  )
}

/** Oracle Red Bull Racing Charging Bull with Kinetic Arcs */
export function RedBullLogo({ size = 24, color = '#1e41ff', accentColor = '#ff1801', ...props }: TeamGraphicProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      {/* Solar Core */}
      <circle cx="18" cy="18" r="9" fill="#ffd600" />
      {/* Left Raging Bull */}
      <path
        d="M6 18C8 16 11 15 14 17C15 15 17 14 18 16C17 18 15 19 14 21C12 22 9 21 7 19L6 18Z"
        fill={accentColor}
      />
      {/* Right Charging Bull */}
      <path
        d="M30 18C28 16 25 15 22 17C21 15 19 14 18 16C19 18 21 19 22 21C24 22 27 21 29 19L30 18Z"
        fill={accentColor}
      />
      {/* High-speed kinetic diagonal streaks */}
      <path d="M4 26L12 26L16 23L8 23L4 26Z" fill={color} />
      <path d="M20 26L28 26L32 23L24 23L20 26Z" fill={color} />
      <path d="M14 10L22 10L20 8L16 8L14 10Z" fill={accentColor} />
    </svg>
  )
}

/** Mercedes Three-Pointed Star & Cyan Petronas Streak */
export function MercedesLogo({ size = 24, color = '#00d2be', accentColor = '#c8ccce', ...props }: TeamGraphicProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      {/* Outer Titanium Ring */}
      <circle cx="18" cy="18" r="14" stroke={accentColor} strokeWidth="1.8" fill="#080c10" />
      {/* Three Pointed Star */}
      <path d="M18 5L19.5 17L18 18L16.5 17L18 5Z" fill="#ffffff" />
      <path d="M18 18L29 24.5L19 20L18 18Z" fill="#d8e0e4" />
      <path d="M18 18L7 24.5L17 20L18 18Z" fill="#a4b0b8" />
      <path d="M18 5L18 18L19.5 17Z" fill="#ffffff" />
      {/* Petronas Cyan Kinetic Slash */}
      <path d="M4 27L12 31L18 31L10 27H4Z" fill={color} />
      <path d="M22 31L28 31L32 27L26 27L22 31Z" fill={color} />
    </svg>
  )
}

/** Aston Martin Aerodynamic Wings & Lime Accent */
export function AstonMartinLogo({ size = 24, color = '#006f62', accentColor = '#cedc00', ...props }: TeamGraphicProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      {/* Dual Swept Aero Wings */}
      <path
        d="M3 17C9 13 14 13 18 16C22 13 27 13 33 17C29 21 23 21 18 18C13 21 7 21 3 17Z"
        fill={color}
        stroke="#ffffff"
        strokeWidth="1.2"
      />
      {/* Wing Feathers / Venturi vanes */}
      <path d="M6 16.5L14 17M22 17L30 16.5M8 18.5L15 18.5M21 18.5L28 18.5" stroke="#ffffff" strokeWidth="0.9" />
      {/* Central Enamel Emblem */}
      <rect x="13" y="15" width="10" height="6" rx="1.5" fill="#042621" stroke={accentColor} strokeWidth="1" />
      {/* Lime AMR Velocity Highlight */}
      <path d="M15 18H21" stroke={accentColor} strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

/** Williams Racing Forward-Velocity 'W' Cyan Streaks */
export function WilliamsLogo({ size = 24, color = '#005aff', accentColor = '#00a0de', ...props }: TeamGraphicProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      {/* Dynamic Angled W Chevrons */}
      <path d="M4 9L9 27H13L16 16L18 22L20 16L23 27H27L32 9H27L24 20L21 9H15L12 20L9 9H4Z" fill={color} />
      {/* Cyan Speed Trail */}
      <path d="M13 23L16 12L18 18L20 12L23 23H20L18 17L16 23H13Z" fill={accentColor} />
      {/* Precision Red Accent Line */}
      <path d="M6 29L30 29L28 31L4 31L6 29Z" fill="#eb2337" />
    </svg>
  )
}

/** Alpine Arrow 'A' with French Tricolore & BWT Pink */
export function AlpineLogo({ size = 24, color = '#0090ff', accentColor = '#ff87bc', ...props }: TeamGraphicProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      {/* Angled Stylized A-Arrow */}
      <path d="M6 28L18 6L30 28H23L18 18L13 28H6Z" fill={color} />
      {/* Central Speed Spear */}
      <path d="M18 12L21 24H15L18 12Z" fill="#ffffff" />
      {/* BWT Neon Pink Aero Winglet */}
      <path d="M11 22H25L23 25H13L11 22Z" fill={accentColor} />
      {/* French Flag Speed Flash */}
      <path d="M14 26H16.5V28H14V26Z" fill="#002395" />
      <path d="M16.5 26H19.5V28H16.5V26Z" fill="#ffffff" />
      <path d="M19.5 26H22V28H19.5V26Z" fill="#ed2939" />
    </svg>
  )
}

/** Racing Bulls (VCARB) Dynamic Charging Bull */
export function RacingBullsLogo({ size = 24, color = '#6692ff', accentColor = '#ffffff', ...props }: TeamGraphicProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <circle cx="18" cy="18" r="14" fill="#0c1433" stroke={color} strokeWidth="1.5" />
      {/* Charging Bull Silhouette */}
      <path
        d="M10 19C11 16 14 15 17 16C19 14 22 13 25 15C23 18 20 19 19 22C16 23 13 22 10 19Z"
        fill={accentColor}
      />
      <path d="M17 16L20 12L21 14L19 16H17Z" fill={color} />
      {/* Red Bull Kinetic Horn */}
      <path d="M23 14C25 12 27 12 28 10C27 12 26 14 24 15L23 14Z" fill="#ff1801" />
      {/* Dynamic Speed Chevron */}
      <path d="M8 26L28 26L26 28L6 28L8 26Z" fill={color} />
    </svg>
  )
}

/** Kick Sauber Neon Acid Green Claw & Carbon Blade */
export function KickSauberLogo({ size = 24, color = '#52e252', accentColor = '#111111', ...props }: TeamGraphicProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      {/* Hexagonal Shield */}
      <path d="M18 4L31 11V25L18 32L5 25V11L18 4Z" fill={accentColor} stroke={color} strokeWidth="1.6" />
      {/* Dynamic S / Claw Slash */}
      <path
        d="M12 11H24L21 16H15L17 20H24L21 25H9L12 20H18L16 16H10L12 11Z"
        fill={color}
      />
      {/* Carbon Blade Accent */}
      <path d="M7 18L13 24H16L10 18H7Z" fill="#ffffff" fillOpacity="0.4" />
      <path d="M29 18L23 12H20L26 18H29Z" fill="#ffffff" fillOpacity="0.4" />
    </svg>
  )
}

/** Haas High-Precision CNC Machine Emblem */
export function HaasLogo({ size = 24, color = '#b6babd', accentColor = '#e6002b', ...props }: TeamGraphicProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      {/* Outer CNC Rounded Block */}
      <rect x="5" y="6" width="26" height="24" rx="4" fill="#14171a" stroke={color} strokeWidth="1.6" />
      {/* Haas Red Racing Square */}
      <rect x="9" y="10" width="8" height="16" rx="2" fill={accentColor} />
      {/* Haas Bold 'H' Cutout Bars */}
      <path d="M13 10V26M21 10V26M21 18H27M27 10V26" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" />
      {/* Speed Hash */}
      <path d="M7 27L11 27M25 27L29 27" stroke={accentColor} strokeWidth="1.8" />
    </svg>
  )
}

/** Unified Team Logo Badge Component */
export function TeamLogoBadge({
  teamCode = 'MCL',
  size = 28,
  glow = true,
  className = '',
}: {
  teamCode?: string
  size?: number
  glow?: boolean
  className?: string
}) {
  const meta = getTeamMeta(teamCode)
  const code = meta.code

  let LogoComponent = McLarenLogo
  if (code === 'FER') LogoComponent = FerrariLogo
  else if (code === 'RBR') LogoComponent = RedBullLogo
  else if (code === 'MER') LogoComponent = MercedesLogo
  else if (code === 'AMR' || code === 'AST') LogoComponent = AstonMartinLogo
  else if (code === 'WIL') LogoComponent = WilliamsLogo
  else if (code === 'ALP') LogoComponent = AlpineLogo
  else if (code === 'RB' || code === 'VCARB') LogoComponent = RacingBullsLogo
  else if (code === 'SAU') LogoComponent = KickSauberLogo
  else if (code === 'HAA' || code === 'HAS') LogoComponent = HaasLogo

  return (
    <div
      className={`team-logo-badge ${className}`}
      style={{
        width: size,
        height: size,
        '--badge-primary': meta.primaryColor,
        '--badge-accent': meta.accentColor,
        boxShadow: glow ? `0 0 16px ${meta.primaryColor}40` : undefined,
      } as React.CSSProperties}
    >
      <LogoComponent size={size} color={meta.primaryColor} accentColor={meta.accentColor} />
    </div>
  )
}

/* ==========================================================================
   Modern Movement & Angled Stripes Components
   ========================================================================== */

/** Large Angled Velocity Stripes Background Container */
export function TeamAngledBackdrop({
  teamCode = 'MCL',
  intensity = 'medium',
  className = '',
}: {
  teamCode?: string
  intensity?: 'subtle' | 'medium' | 'vibrant'
  className?: string
}) {
  const meta = getTeamMeta(teamCode)
  const alpha = intensity === 'vibrant' ? '0.22' : intensity === 'medium' ? '0.12' : '0.06'

  return (
    <div
      className={`team-angled-backdrop ${className}`}
      style={{
        '--team-primary': meta.primaryColor,
        '--team-secondary': meta.secondaryColor,
        '--team-accent': meta.accentColor,
        '--team-alpha': alpha,
      } as React.CSSProperties}
      aria-hidden="true"
    >
      {/* Layer 1: Large -20° Angled Racing Chevrons */}
      <div className="backdrop-angled-stripes" />
      {/* Layer 2: Animated Aerodynamic Flow Speed Lines */}
      <div className="backdrop-motion-streaks">
        <span className="streak s1" />
        <span className="streak s2" />
        <span className="streak s3" />
        <span className="streak s4" />
      </div>
      {/* Layer 3: High-Tech Telemetry Grid Overlay */}
      <div className="backdrop-telemetry-grid" />
    </div>
  )
}

/** High-Impact Motorsport Banner with Large Angled Stripes & Movement Styling */
export function TeamBanner({
  teamCode = 'MCL',
  title,
  subtitle,
  compact = false,
  showStandings = true,
  className = '',
}: {
  teamCode?: string
  title?: string
  subtitle?: string
  compact?: boolean
  showStandings?: boolean
  className?: string
}) {
  const meta = getTeamMeta(teamCode)

  return (
    <div
      className={`team-banner-card ${compact ? 'compact' : ''} ${className}`}
      style={{
        '--team-primary': meta.primaryColor,
        '--team-secondary': meta.secondaryColor,
        '--team-accent': meta.accentColor,
      } as React.CSSProperties}
    >
      {/* Layered Angled Livery Stripes */}
      <div className="banner-angled-stripes">
        <div className="stripe-primary" />
        <div className="stripe-accent" />
        <div className="stripe-dark" />
      </div>

      {/* Speed Motion Streaks */}
      <div className="banner-motion-trail" />

      {/* Banner Content Hierarchy */}
      <div className="banner-content-inner">
        <div className="banner-logo-block">
          <TeamLogoBadge teamCode={meta.code} size={compact ? 36 : 48} />
          <div className="banner-text-block">
            <span className="banner-eyebrow">
              <Sparkles size={11} className="eyebrow-sparkle" />
              FIA CONSTRUCTOR · 2026 WORLD CHAMPIONSHIP
            </span>
            <h2 className="banner-team-name">{title || meta.name}</h2>
            <div className="banner-drivers-row">
              <span className="driver-car-numbers">
                <Radio size={12} className="live-radio-icon" />
                {meta.driverNumbers}
              </span>
              {subtitle && <span className="banner-subtitle-badge">{subtitle}</span>}
            </div>
          </div>
        </div>

        {showStandings && (
          <div className="banner-stats-block">
            <div className="banner-stat-item">
              <span className="stat-label"><Trophy size={11} /> WCC RANK</span>
              <strong className="stat-value">P{meta.championshipRank}</strong>
            </div>
            <div className="banner-stat-item">
              <span className="stat-label"><Zap size={11} /> POINTS</span>
              <strong className="stat-value">{meta.points} <small>PTS</small></strong>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
