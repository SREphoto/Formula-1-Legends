import { CalendarClock, Eye, Flag, SlidersHorizontal, Wrench } from 'lucide-react'

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
    <div className="onboarding-backdrop" role="dialog" aria-modal="true" aria-label="How to play">
      <div className="onboarding-card">

        {/* Hero Banner */}
        <div className="onboarding-hero">
          <div className="onboarding-hero-inner">
            <div className="onboarding-hero-flag">
              <Flag size={28} className="hero-flag-icon" />
            </div>
            <div className="onboarding-hero-text">
              <span className="onboarding-eyebrow">F1 LEGENDS · RACE COMMAND</span>
              <h2 className="onboarding-title">You are the race engineer</h2>
              <p className="onboarding-subtitle">
                A driver and car are selected for you. Keep the pace up, keep the tyres alive,
                and call the pit stop on the right lap — that is the whole game.
              </p>
            </div>
          </div>
        </div>

        {/* Step Cards */}
        <div className="onboarding-body">
          {STEPS.map(({ icon: Icon, title, text }, idx) => (
            <div key={title} className="guide-step">
              <div className="step-num">{idx + 1}</div>
              <div className="step-icon-wrap">
                <Icon size={16} />
              </div>
              <div className="step-content">
                <b className="step-title">{title}</b>
                <span className="step-desc">{text}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer CTA */}
        <div className="onboarding-footer">
          <button className="got-it-btn" onClick={onClose} autoFocus>
            <Flag size={14} />
            START WATCHING THE RACE
          </button>
        </div>

      </div>
    </div>
  )
}
