import { ChevronDown, ChevronUp, Maximize2, Minimize2, X } from 'lucide-react'
import { useState, type ReactNode, type KeyboardEvent } from 'react'

export interface ContextFocusCardProps {
  title: string
  eyebrow?: string
  icon?: ReactNode
  badge?: ReactNode
  summary?: ReactNode
  children: ReactNode
  defaultExpanded?: boolean
  allowFocusModal?: boolean
  className?: string
  accentColor?: string
  onToggle?: (expanded: boolean) => void
}

export function ContextFocusCard({
  title,
  eyebrow,
  icon,
  badge,
  summary,
  children,
  defaultExpanded = true,
  allowFocusModal = true,
  className = '',
  accentColor,
  onToggle,
}: ContextFocusCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded)
  const [modalOpen, setModalOpen] = useState(false)

  const handleToggle = () => {
    const next = !expanded
    setExpanded(next)
    if (onToggle) onToggle(next)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'BUTTON') return
      e.preventDefault()
      handleToggle()
    }
  }

  return (
    <>
      <div
        className={`context-focus-card ${expanded ? 'expanded' : 'compact'} ${className}`}
        style={{ ...(accentColor ? ({ '--card-accent': accentColor } as React.CSSProperties) : {}) }}
        tabIndex={0}
        onKeyDown={handleKeyDown}
      >
        {/* Card Header Bar */}
        <div className="focus-card-header" onClick={handleToggle}>
          <div className="header-identity">
            {icon && <span className="focus-card-icon">{icon}</span>}
            <div className="header-titles">
              {eyebrow && <span className="focus-card-eyebrow">{eyebrow}</span>}
              <h3 className="focus-card-title">{title}</h3>
            </div>
          </div>

          <div className="header-actions" onClick={(e) => e.stopPropagation()}>
            {badge && <div className="focus-card-badge">{badge}</div>}

            {allowFocusModal && (
              <button
                type="button"
                className="focus-tool-btn"
                onClick={() => setModalOpen(true)}
                title="Open Focus Inspection Modal (Full Deep-Dive)"
              >
                <Maximize2 size={13} />
              </button>
            )}

            <button
              type="button"
              className="focus-toggle-btn"
              onClick={handleToggle}
              title={expanded ? 'Collapse to Compact Context Summary' : 'Expand Deep-Dive Focus View'}
            >
              {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>
        </div>

        {/* Compact Summary Strip (rendered when collapsed) */}
        {!expanded && summary && <div className="focus-card-summary-strip" onClick={handleToggle}>{summary}</div>}

        {/* Expanded Deep-Dive Body */}
        {expanded && <div className="focus-card-body">{children}</div>}
      </div>

      {/* Holographic Fullscreen Focus Inspection Modal */}
      {modalOpen && (
        <div className="focus-modal-backdrop" onClick={() => setModalOpen(false)}>
          <div
            className="focus-modal-card"
            style={{ ...(accentColor ? ({ '--card-accent': accentColor } as React.CSSProperties) : {}) }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div className="modal-identity">
                {icon && <span className="focus-card-icon modal">{icon}</span>}
                <div>
                  {eyebrow && <span className="focus-card-eyebrow">{eyebrow} · DEEP-DIVE INSPECTION</span>}
                  <h2 className="focus-modal-title">{title}</h2>
                </div>
              </div>
              <div className="modal-controls">
                {badge && <div className="focus-card-badge">{badge}</div>}
                <button
                  type="button"
                  className="modal-close-btn"
                  onClick={() => setModalOpen(false)}
                  title="Close Focus Modal (Esc)"
                >
                  <Minimize2 size={14} />
                  <X size={16} />
                </button>
              </div>
            </div>
            <div className="focus-modal-body">{children}</div>
          </div>
        </div>
      )}
    </>
  )
}
