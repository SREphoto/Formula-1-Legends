import { useCallback, useEffect, useRef, useState } from 'react'
import type { RaceSnapshot, WorkerCommand } from '../types'

export function useRaceSimulation() {
  const [snapshot, setSnapshot] = useState<RaceSnapshot | null>(null)
  const workerRef = useRef<Worker | null>(null)

  useEffect(() => {
    const worker = new Worker(new URL('../engine/workers/PhysicsWorker.ts', import.meta.url), { type: 'module' })
    workerRef.current = worker
    worker.onmessage = (event: MessageEvent<RaceSnapshot>) => setSnapshot(event.data)
    worker.postMessage({ type: 'INIT' } satisfies WorkerCommand)

    return () => {
      worker.terminate()
      workerRef.current = null
    }
  }, [])

  const sendCommand = useCallback((command: WorkerCommand) => {
    workerRef.current?.postMessage(command)
  }, [])

  return { snapshot, sendCommand }
}
