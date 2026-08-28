import { CheckCircle2, TriangleAlert, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { AppHeader } from './components/AppHeader'
import { OnboardingOverlay } from './components/OnboardingOverlay'
import { ParallaxAuthScreen, type PaddockCredentials } from './components/ParallaxAuthScreen'
import { RaceStatusBar } from './components/RaceStatusBar'
import { useRaceSimulation } from './hooks/useRaceSimulation'
import { radioAudioService } from './services/radioAudioService'
import type { AppView } from './types'
import { CarLab } from './views/CarLab'
import { HQDashboard } from './views/HQDashboard'
import { LiveTelemetryExplorer } from './views/LiveTelemetryExplorer'
import { RaceDashboard } from './views/RaceDashboard'
import { SteeringWheelLab } from './views/SteeringWheelLab'
import { StrategyWorkspace } from './views/StrategyWorkspace'
import { getTeamMeta } from './components/TeamGraphics'

interface ToastState {
  id: number
  title: string
  message: string
  tone: 'success' | 'warning'
}

function App() {
  const { snapshot, sendCommand } = useRaceSimulation()
  const [activeView, setActiveView] = useState<AppView>('race')
  const [paused, setPaused] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [toast, setToast] = useState<ToastState | null>(null)
  const [broadcastDelaySec, setBroadcastDelaySec] = useState<number>(() => {
    try {
      const saved = window.sessionStorage.getItem('f1l-broadcast-delay-sec')
      return saved ? Number(saved) : radioAudioService.getBroadcastDelaySec()
    } catch {
      return 0
    }
  })

  const handleBroadcastDelayChange = (sec: number) => {
    setBroadcastDelaySec(sec)
    radioAudioService.setBroadcastDelaySec(sec)
    try {
      window.sessionStorage.setItem('f1l-broadcast-delay-sec', String(sec))
    } catch {
      // session storage fallback
    }
    notify(
      'BROADCAST DELAY SYNC',
      sec === 0
        ? 'Live real-time feed active (0s delay).'
        : `Broadcast delay set to ${sec}s for TV synchronization.`,
      'success',
    )
  }

  // Paddock Credential Authentication State
  const [credentials, setCredentials] = useState<PaddockCredentials | null>(() => {
    try {
      const saved = window.sessionStorage.getItem('f1l-paddock-creds')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })

  // Sticky selected driver initialization matching chosen team
  const [selectedDriverId, setSelectedDriverId] = useState<string>(() => {
    try {
      const savedDriver = window.sessionStorage.getItem('f1l-selected-driver-id')
      if (savedDriver) return savedDriver
      const savedCreds = window.sessionStorage.getItem('f1l-paddock-creds')
      if (savedCreds) {
        const parsed = JSON.parse(savedCreds)
        if (parsed.primaryDriverId) return parsed.primaryDriverId
        if (parsed.teamCode) return getTeamMeta(parsed.teamCode).primaryDriverId
      }
    } catch {
      // session storage fallback
    }
    return 'nor'
  })

  const [showAuthScreen, setShowAuthScreen] = useState<boolean>(() => {
    try {
      return window.sessionStorage.getItem('f1l-auth-completed') !== '1'
    } catch {
      return true
    }
  })

  const [showGuide, setShowGuide] = useState(() => {
    try {
      return window.sessionStorage.getItem('f1l-guide-seen') !== '1'
    } catch {
      return true
    }
  })

  // Synchronize player managed team with physics simulation worker
  const isSnapshotReady = snapshot !== null
  const teamCode = credentials?.teamCode
  useEffect(() => {
    if (isSnapshotReady && teamCode) {
      sendCommand({ type: 'SET_MANAGED_TEAM', teamShort: teamCode })
    }
  }, [isSnapshotReady, teamCode, sendCommand])

  const handleAuthenticate = (creds: PaddockCredentials) => {
    setCredentials(creds)
    const teamMeta = getTeamMeta(creds.teamCode)
    const primaryDriver = creds.primaryDriverId || teamMeta.primaryDriverId

    setSelectedDriverId(primaryDriver)
    sendCommand({ type: 'SET_MANAGED_TEAM', teamShort: creds.teamCode })

    try {
      window.sessionStorage.setItem('f1l-paddock-creds', JSON.stringify(creds))
      window.sessionStorage.setItem('f1l-selected-driver-id', primaryDriver)
      window.sessionStorage.setItem('f1l-auth-completed', '1')
    } catch {
      // Session storage unavailable
    }
    setShowAuthScreen(false)
    notify(
      'PADDOCK CLEARANCE GRANTED',
      `Welcome to the pit wall, ${creds.userName}. ${creds.roleTitle} authorization active for ${creds.teamName}. Lead Driver: ${teamMeta.primaryDriverName}.`,
      'success',
    )
  }

  const handleSelectDriver = (driverId: string) => {
    setSelectedDriverId(driverId)
    try {
      window.sessionStorage.setItem('f1l-selected-driver-id', driverId)
    } catch {
      // Ignore storage errors
    }
  }

  const closeGuide = () => {
    try {
      window.sessionStorage.setItem('f1l-guide-seen', '1')
    } catch {
      /* sessionStorage unavailable */
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
      <span className="build-chip" aria-hidden="true">BUILD R26</span>
      <AppHeader
        activeView={activeView}
        onViewChange={setActiveView}
        onHelp={() => setShowGuide(true)}
        credentials={credentials}
        onOpenAuth={() => setShowAuthScreen(true)}
      />
      <RaceStatusBar
        snapshot={snapshot}
        paused={paused}
        speed={speed}
        onPausedChange={setPaused}
        onSpeedChange={setSpeed}
        sendCommand={sendCommand}
        broadcastDelaySec={broadcastDelaySec}
        onBroadcastDelayChange={handleBroadcastDelayChange}
      />

      {activeView === 'race' && (
        <RaceDashboard
          snapshot={snapshot}
          selectedDriver={selectedDriver}
          selectedDriverId={selectedDriverId}
          onSelectDriver={handleSelectDriver}
          sendCommand={sendCommand}
          onOpenStrategy={() => setActiveView('strategy')}
          onNotify={notify}
        />
      )}
      {activeView === 'strategy' && (
        <StrategyWorkspace
          snapshot={snapshot}
          selectedDriver={selectedDriver}
          onSelectDriver={handleSelectDriver}
          sendCommand={sendCommand}
          onNotify={notify}
        />
      )}
      {activeView === 'car' && <CarLab selectedDriver={selectedDriver} onNotify={notify} />}
      {activeView === 'wheel' && (
        <SteeringWheelLab
          selectedDriver={selectedDriver}
          sendCommand={sendCommand}
          onNotify={notify}
        />
      )}
      {activeView === 'hq' && <HQDashboard onNotify={notify} credentials={credentials} />}
      {activeView === 'telemetry' && <LiveTelemetryExplorer />}

      {/* 3D Parallax Paddock Auth & Credential Portal */}
      {showAuthScreen && (
        <ParallaxAuthScreen
          onAuthenticate={handleAuthenticate}
          onClose={() => setShowAuthScreen(false)}
          isReopen={!!credentials}
          currentCredentials={credentials}
        />
      )}

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
