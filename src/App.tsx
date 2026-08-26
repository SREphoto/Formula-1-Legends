import { CheckCircle2, TriangleAlert, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { AppHeader } from './components/AppHeader'
import { OnboardingOverlay } from './components/OnboardingOverlay'
import { RaceStatusBar } from './components/RaceStatusBar'
import { useRaceSimulation } from './hooks/useRaceSimulation'
import type { AppView } from './types'
import { CarLab } from './views/CarLab'
import { HQDashboard } from './views/HQDashboard'
import { RaceDashboard } from './views/RaceDashboard'
import { StrategyWorkspace } from './views/StrategyWorkspace'

interface ToastState {
  id: number
  title: string
  message: string
  tone: 'success' | 'warning'
}

function App() {
  const { snapshot, sendCommand } = useRaceSimulation()
  const [activeView, setActiveView] = useState<AppView>('race')
  const [selectedDriverId, setSelectedDriverId] = useState('sen')
  const [paused, setPaused] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [toast, setToast] = useState<ToastState | null>(null)
  const [showGuide, setShowGuide] = useState(() => {
    try {
      return window.sessionStorage.getItem('f1l-guide-seen') !== '1'
    } catch {
      return true
    }
  })

  const closeGuide = () => {
    try {
      window.sessionStorage.setItem('f1l-guide-seen', '1')
    } catch {
      /* sessionStorage unavailable — guide just closes for this render */
    }
    setShowGuide(false)
  }

  const selectedDriver = useMemo(
    () => snapshot?.drivers.find((driver) => driver.id === selectedDriverId) ?? snapshot?.drivers[0],
    [snapshot, selectedDriverId],
  )

  useEffect(() => {
    if (!toast) return
    const timeout = window.setTimeout(() => setToast(null), 3900)
    return () => window.clearTimeout(timeout)
  }, [toast])

  const notify = (title: string, message: string, tone: 'success' | 'warning' = 'success') => {
    setToast({ id: Date.now(), title, message, tone })
  }

  if (!snapshot || !selectedDriver) {
    return (
      <div className="app-loading">
        <div className="loading-brand"><span className="brand-mark"><i /><i /><i /></span><strong>F1 LEGENDS</strong></div>
        <div className="loading-track"><i /></div>
        <span>INITIALIZING 100 HZ PHYSICS ENGINE</span>
      </div>
    )
  }

  return (
    <div className="app-shell">
      <AppHeader activeView={activeView} onViewChange={setActiveView} onHelp={() => setShowGuide(true)} />
      <RaceStatusBar
        snapshot={snapshot}
        paused={paused}
        speed={speed}
        onPausedChange={setPaused}
        onSpeedChange={setSpeed}
        sendCommand={sendCommand}
      />

      {activeView === 'race' && (
        <RaceDashboard
          snapshot={snapshot}
          selectedDriver={selectedDriver}
          selectedDriverId={selectedDriverId}
          onSelectDriver={setSelectedDriverId}
          sendCommand={sendCommand}
          onOpenStrategy={() => setActiveView('strategy')}
          onNotify={notify}
        />
      )}
      {activeView === 'strategy' && (
        <StrategyWorkspace
          snapshot={snapshot}
          selectedDriver={selectedDriver}
          onSelectDriver={setSelectedDriverId}
          sendCommand={sendCommand}
          onNotify={notify}
        />
      )}
      {activeView === 'car' && <CarLab selectedDriver={selectedDriver} onNotify={notify} />}
      {activeView === 'hq' && <HQDashboard onNotify={notify} />}

      {showGuide && <OnboardingOverlay onClose={closeGuide} />}

      {toast && (
        <div className={`app-toast ${toast.tone}`} key={toast.id} role="status">
          <span className="toast-icon">{toast.tone === 'success' ? <CheckCircle2 size={19} /> : <TriangleAlert size={19} />}</span>
          <div><b>{toast.title}</b><span>{toast.message}</span></div>
          <button onClick={() => setToast(null)} aria-label="Dismiss notification"><X size={15} /></button>
          <i className="toast-timer" />
        </div>
      )}
    </div>
  )
}

export default App
