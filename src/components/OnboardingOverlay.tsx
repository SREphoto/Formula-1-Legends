import { CalendarClock, Eye, SlidersHorizontal, Wrench } from 'lucide-react'

interface OnboardingOverlayProps {
  onClose: () => void
}

const STEPS = [
  {
    icon: Eye,
    title: 'WATCH THE RACE',
    text: 'The 3D race world follows the live simulation. Drag to swing the camera, tap any car to make it your focus car, and use the camera buttons for trackside or onboard views.',
  },
  {
    icon: SlidersHorizontal,
    title: 'GIVE ORDERS',
    text: 'The command dock sets how hard your driver pushes (PACE), how the hybrid battery is used (ERS), and which tyre goes on at the next stop. Timing tower and telemetry show the results.',
  },
  {
    icon: CalendarClock,
    title: 'PLAN THE STOP',
    text: 'The Strategy tab projects pit windows, stints and race outcomes. When the numbers look good, commit the plan and it drives the pit call.',
  },
  {
    icon: Wrench,
    title: 'TUNE THE CAR',
    text: 'Car Lab sliders are written in plain English — wings trade straight-line speed for grip, ride height feeds the underfloor, pressures shape the balance. The 3D car and aero readouts react as you drag.',
  },
]

export function OnboardingOverlay({ onClose }: OnboardingOverlayProps) {
  return (
    <div className="onboarding-overlay" role="dialog" aria-modal="true" aria-label="How to play">
      <div className="onboarding-card">
        <span className="eyebrow">F1 LEGENDS · RACE COMMAND</span>
        <h2>You are the race engineer</h2>
        <p>A driver and car are selected for you. Keep the pace up, keep the tyres alive, and call the pit stop on the right lap — that is the whole game.</p>
        <ol className="onboarding-steps">
          {STEPS.map(({ icon: Icon, title, text }) => (
            <li key={title}>
              <span className="onboarding-step-icon"><Icon size={18} /></span>
              <div><b>{title}</b><span>{text}</span></div>
            </li>
          ))}
        </ol>
        <button className="onboarding-cta" onClick={onClose} autoFocus>START WATCHING THE RACE</button>
      </div>
    </div>
  )
}
