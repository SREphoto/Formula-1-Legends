import type { SVGProps } from 'react'

export interface F1IconProps extends SVGProps<SVGSVGElement> {
  size?: number
  color?: string
}

/** 2026 Ground Effect Aerodynamic Racecar Silhouette with Active Wing Flaps */
export function F1CarAeroIcon({ size = 16, color = 'currentColor', ...props }: F1IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M2 14.5L5 13L9 11L14 10.5L18 11.5L22 13.5V15.5L18 14.5L13 14L8 15L2 16.5V14.5Z" fill={color} fillOpacity="0.25" />
      <path d="M2 14.5L5 13L9 11L14 10.5L18 11.5L22 13.5" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      {/* Front active wing element */}
      <path d="M18 9.5L22 10.5M19 12L22 12.5" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
      {/* Halo & Cockpit */}
      <path d="M10 11L11.5 8H13.5L15 10.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* Rear Wing & Endplate */}
      <path d="M3 9.5H6.5V14.5H3V9.5Z" stroke={color} strokeWidth="1.4" />
      <path d="M2.5 8H7M2.5 10.5H7" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      {/* Aerodynamic streamline airflow */}
      <path d="M1 18C4 18 7 16.5 11 16.5C15 16.5 18 18 23 18" stroke={color} strokeWidth="1.2" strokeDasharray="2 2" strokeOpacity="0.7" />
    </svg>
  )
}

/** 1.6L V6 Turbo-Hybrid ICE with Twin Exhaust Manifold & Turbocharger */
export function F1EngineV6Icon({ size = 16, color = 'currentColor', ...props }: F1IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      {/* Engine block */}
      <rect x="5" y="7" width="14" height="12" rx="2" fill={color} fillOpacity="0.15" stroke={color} strokeWidth="1.6" />
      {/* V6 Cylinder Banks (V-angle lines) */}
      <path d="M8 9L10 14M16 9L14 14" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      {/* Turbocharger housing */}
      <circle cx="12" cy="5" r="3" fill={color} fillOpacity="0.2" stroke={color} strokeWidth="1.5" />
      <path d="M12 3.5V6.5M10.5 5H13.5" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
      {/* Exhaust manifold ports */}
      <path d="M2 10H5M2 13H5M2 16H5M19 10H22M19 13H22M19 16H22" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      {/* Crankcase bottom */}
      <path d="M8 19H16V21H8V19Z" fill={color} fillOpacity="0.3" stroke={color} strokeWidth="1.2" />
    </svg>
  )
}

/** 350kW MGU-K Hybrid Electrical System with High-Voltage Conduit */
export function F1MguKIcon({ size = 16, color = 'currentColor', ...props }: F1IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      {/* Battery / Inverter unit */}
      <rect x="4" y="5" width="16" height="14" rx="2" fill={color} fillOpacity="0.15" stroke={color} strokeWidth="1.6" />
      {/* High-Voltage Lightning Arc */}
      <path d="M13 3L8 12H13L11 21L17 11H12L14 3H13Z" fill={color} stroke={color} strokeWidth="1.2" strokeLinejoin="round" />
      {/* Motor terminals */}
      <circle cx="7" cy="8" r="1.2" fill={color} />
      <circle cx="7" cy="16" r="1.2" fill={color} />
      <path d="M2 8H4M2 16H4" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

/** Pirelli Motorsport Racing Tire with Compound Rim Strip */
export function F1TireCompoundIcon({
  size = 16,
  color = 'currentColor',
  compoundColor,
  ...props
}: F1IconProps & { compoundColor?: string }) {
  const stripe = compoundColor ?? color
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      {/* Outer Tire Tread */}
      <circle cx="12" cy="12" r="9.5" stroke={color} strokeWidth="2.2" fill={color} fillOpacity="0.1" />
      {/* Compound Color Sidewall Stripe */}
      <circle cx="12" cy="12" r="7" stroke={stripe} strokeWidth="1.8" strokeDasharray="9 2" />
      {/* Magnesium Wheel Rim */}
      <circle cx="12" cy="12" r="4.2" fill={color} fillOpacity="0.25" stroke={color} strokeWidth="1.4" />
      {/* Center Nut & Spokes */}
      <circle cx="12" cy="12" r="1.5" fill={color} />
      <path d="M12 8V10M12 14V16M8 12H10M14 12H16" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}

/** Digital Telemetry Waveform Oscilloscope */
export function F1TelemetryWaveIcon({ size = 16, color = 'currentColor', ...props }: F1IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      {/* Screen frame */}
      <rect x="3" y="4" width="18" height="16" rx="2.5" fill={color} fillOpacity="0.1" stroke={color} strokeWidth="1.5" />
      {/* Telemetry live trace */}
      <path
        d="M5 13H8L10 7L13 17L15 11L17 14H19"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Grid lines */}
      <line x1="3" y1="12" x2="21" y2="12" stroke={color} strokeWidth="0.8" strokeOpacity="0.3" strokeDasharray="2 2" />
      <line x1="12" y1="4" x2="12" y2="20" stroke={color} strokeWidth="0.8" strokeOpacity="0.3" strokeDasharray="2 2" />
    </svg>
  )
}

/** Circuit Topography Spline & Elevation Map */
export function F1TrackElevationIcon({ size = 16, color = 'currentColor', ...props }: F1IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      {/* Track circuit ribbon */}
      <path
        d="M4 16C3 13 4 8 8 6C12 4 17 5 19 8C21 11 20 15 17 17C14 19 9 20 6 18C4 16.6 4 14 6 12C8 10 13 11 15 13"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Elevation gradient markers */}
      <circle cx="8" cy="6" r="2" fill={color} fillOpacity="0.3" stroke={color} strokeWidth="1.2" />
      <circle cx="19" cy="8" r="1.5" fill={color} />
      <circle cx="6" cy="18" r="1.5" fill={color} />
    </svg>
  )
}

/** Rapid Pneumatic Wheel Gun & Pit Stop Jack */
export function F1PitStopCrewIcon({ size = 16, color = 'currentColor', ...props }: F1IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      {/* Pneumatic wheel gun body */}
      <path d="M4 8H12V13H8L6 18H3L5 13H4V8Z" fill={color} fillOpacity="0.2" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
      {/* Drive socket */}
      <rect x="12" y="9.5" width="4" height="2" rx="0.5" fill={color} stroke={color} strokeWidth="1" />
      {/* Torque reaction bar */}
      <path d="M16 10.5H21M19 7.5L21 10.5L19 13.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* High-pressure air hose coil */}
      <path d="M4.5 18C4.5 20 6 21 8 21C10 21 11 19.5 13 19.5" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}

/** Carbon Formula 1 Steering Wheel with OLED Display */
export function F1SteeringWheelIcon({ size = 16, color = 'currentColor', ...props }: F1IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      {/* Ergonomic carbon butterfly wheel frame */}
      <path
        d="M4 7C3 9 3 15 4 17C5 19 7 19 8 16L9 13H15L16 16C17 19 19 19 20 17C21 15 21 9 20 7C19 5 17 5 15 6L14 8H10L9 6C7 5 5 5 4 7Z"
        fill={color}
        fillOpacity="0.15"
        stroke={color}
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      {/* Center OLED telemetry display */}
      <rect x="9.5" y="9" width="5" height="3" rx="0.6" fill={color} fillOpacity="0.3" stroke={color} strokeWidth="1" />
      {/* Top shift LED row */}
      <circle cx="10" cy="7.2" r="0.7" fill={color} />
      <circle cx="12" cy="7.2" r="0.7" fill={color} />
      <circle cx="14" cy="7.2" r="0.7" fill={color} />
      {/* Thumb rotary dials */}
      <circle cx="6.5" cy="11.5" r="1.2" fill={color} stroke={color} strokeWidth="0.8" />
      <circle cx="17.5" cy="11.5" r="1.2" fill={color} stroke={color} strokeWidth="0.8" />
    </svg>
  )
}

/** VHF Radio Broadcast Tower with Acoustic Squelch Wave Burst */
export function F1RadioSquelchIcon({ size = 16, color = 'currentColor', ...props }: F1IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      {/* Radio mast */}
      <path d="M12 2V18M9 22H15M8 18H16M7 10L12 6L17 10" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="6" r="2" fill={color} />
      {/* Broadcast radiation waves */}
      <path d="M6 4C4 6 4 9 6 11M18 4C20 6 20 9 18 11" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M3 2C0.5 5 0.5 11 3 14M21 2C23.5 5 23.5 11 21 14" stroke={color} strokeWidth="1.3" strokeLinecap="round" strokeOpacity="0.6" />
    </svg>
  )
}

/** FIA Official Superlicense & Paddock Pass Badge */
export function F1SuperlicenseIcon({ size = 16, color = 'currentColor', ...props }: F1IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      {/* Shield badge */}
      <path
        d="M12 2L4 5V11C4 16.5 7.5 21.5 12 23C16.5 21.5 20 16.5 20 11V5L12 2Z"
        fill={color}
        fillOpacity="0.18"
        stroke={color}
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      {/* Laurel wreath leaves */}
      <path d="M8 11C8 14 9.5 16 12 16.5C14.5 16 16 14 16 11" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
      {/* FIA Star emblem */}
      <path
        d="M12 6.5L13.2 9.5H16.5L13.8 11.2L14.8 14.2L12 12.5L9.2 14.2L10.2 11.2L7.5 9.5H10.8L12 6.5Z"
        fill={color}
      />
    </svg>
  )
}

/** 40-Probe Pitot Kiel Aero-Rake Grid Matrix */
export function F1KielProbeIcon({ size = 16, color = 'currentColor', ...props }: F1IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      {/* Titanium Grid Outer Frame */}
      <rect x="3" y="4" width="18" height="16" rx="2" fill={color} fillOpacity="0.1" stroke={color} strokeWidth="1.6" />
      {/* Grid struts */}
      <line x1="3" y1="9" x2="21" y2="9" stroke={color} strokeWidth="1.2" />
      <line x1="3" y1="15" x2="21" y2="15" stroke={color} strokeWidth="1.2" />
      <line x1="9" y1="4" x2="9" y2="20" stroke={color} strokeWidth="1.2" />
      <line x1="15" y1="4" x2="15" y2="20" stroke={color} strokeWidth="1.2" />
      {/* Kiel Probe Transducer Tips */}
      <circle cx="6" cy="6.5" r="1.2" fill={color} />
      <circle cx="12" cy="6.5" r="1.2" fill={color} />
      <circle cx="18" cy="6.5" r="1.2" fill={color} />
      <circle cx="6" cy="12" r="1.2" fill={color} />
      <circle cx="12" cy="12" r="1.2" fill={color} />
      <circle cx="18" cy="12" r="1.2" fill={color} />
      <circle cx="6" cy="17.5" r="1.2" fill={color} />
      <circle cx="12" cy="17.5" r="1.2" fill={color} />
      <circle cx="18" cy="17.5" r="1.2" fill={color} />
    </svg>
  )
}

/** Ground-Effect Downforce & Porpoising Vortex Oscillator */
export function F1PorpoisingIcon({ size = 16, color = 'currentColor', ...props }: F1IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      {/* Chassis Plank Base */}
      <line x1="2" y1="5" x2="22" y2="5" stroke={color} strokeWidth="2" strokeLinecap="round" />
      {/* Underfloor ground-effect venturi curves */}
      <path d="M2 8C7 8 9 13 14 13C19 13 20 9 22 9" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
      {/* Oscillating sine wave suction arrows */}
      <path d="M5 17L8 14L11 17L14 14L17 17L20 14" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* Downforce load vectors */}
      <path d="M7 19V22M12 18V22M17 19V22" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

/** High-Octane Chequered Victory Flag */
export function F1FlagChequeredIcon({ size = 16, color = 'currentColor', ...props }: F1IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      {/* Flagpole */}
      <path d="M4 3V22" stroke={color} strokeWidth="2" strokeLinecap="round" />
      {/* Chequered flag banner */}
      <path
        d="M4 4C8 2.5 12 5.5 16 4C18 3.2 19 3.5 21 4.5V15C19 14 18 13.7 16 14.5C12 16 8 13 4 14.5V4Z"
        fill={color}
        fillOpacity="0.15"
        stroke={color}
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      {/* Chequered pattern blocks */}
      <rect x="5.5" y="4.5" width="3.5" height="3" fill={color} />
      <rect x="12.5" y="4.5" width="3.5" height="3" fill={color} />
      <rect x="9" y="7.5" width="3.5" height="3" fill={color} />
      <rect x="16" y="7.5" width="3.5" height="3" fill={color} />
      <rect x="5.5" y="10.5" width="3.5" height="3" fill={color} />
      <rect x="12.5" y="10.5" width="3.5" height="3" fill={color} />
    </svg>
  )
}

/** Wind Tunnel Streamline Injection Nozzles */
export function F1WindTunnelIcon({ size = 16, color = 'currentColor', ...props }: F1IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      {/* Nozzle manifold */}
      <rect x="2" y="6" width="4" height="12" rx="1" fill={color} stroke={color} strokeWidth="1.5" />
      {/* Emitter ports */}
      <circle cx="4" cy="9" r="0.8" fill="#fff" />
      <circle cx="4" cy="12" r="0.8" fill="#fff" />
      <circle cx="4" cy="15" r="0.8" fill="#fff" />
      {/* Streamline flow vectors */}
      <path d="M6 9C10 9 13 7 18 7C20 7 21 8 22 9" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
      <path d="M6 12C11 12 14 12 18 12C20 12 21 12 22 12" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
      <path d="M6 15C10 15 13 17 18 17C20 17 21 16 22 15" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}
