import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import { syncAll } from '@/server/sync'
import { pushPending, seedFromLoaderData } from './offline-mutations'

export type SyncState = 'idle' | 'syncing' | 'error' | 'offline'

interface SyncContextValue {
  syncState: SyncState
  isOnline: boolean
  pendingCount: number
  triggerSync: () => void
}

const SyncContext = createContext<SyncContextValue>({
  syncState: 'idle',
  isOnline: true,
  pendingCount: 0,
  triggerSync: () => {},
})

export function useSyncContext() {
  return useContext(SyncContext)
}

export function SyncProvider({
  children,
}: {
  children: React.ReactNode
  userId: string
}) {
  // Start as true for SSR — navigator.onLine exists in Node 22 but is always false,
  // which causes hydration mismatches. Update on the client in useEffect.
  const [isOnline, setIsOnline] = useState(true)
  const [syncState, setSyncState] = useState<SyncState>('idle')
  const [pendingCount, setPendingCount] = useState(0)
  const syncingRef = useRef(false)

  // Poll pending count every few seconds
  useEffect(() => {
    let cancelled = false
    async function update() {
      const { localDb } = await import('./local-db')
      const ec = await localDb.entries.filter((e) => e.syncStatus !== 'synced').count()
      const pc = await localDb.projects.filter((p) => p.syncStatus !== 'synced').count()
      if (!cancelled) setPendingCount(ec + pc)
    }
    update()
    const id = setInterval(update, 4000)
    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [syncState])

  const triggerSync = useCallback(async () => {
    if (syncingRef.current || !isOnline) return
    syncingRef.current = true
    setSyncState('syncing')
    try {
      await pushPending()
      const { projects, entries } = await syncAll()
      await seedFromLoaderData(projects, entries)
      setPendingCount(0)
      setSyncState('idle')
    } catch {
      setSyncState('error')
    } finally {
      syncingRef.current = false
    }
  }, [isOnline])

  // Sync actual online state after hydration + listen for changes
  useEffect(() => {
    setIsOnline(navigator.onLine)
    function handleOnline() { setIsOnline(true) }
    function handleOffline() { setIsOnline(false); setSyncState('offline') }
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Auto-sync on mount and whenever we come back online
  useEffect(() => {
    if (isOnline) triggerSync()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOnline])

  return (
    <SyncContext.Provider value={{ syncState, isOnline, pendingCount, triggerSync }}>
      {children}
    </SyncContext.Provider>
  )
}
