import { createFileRoute } from '@tanstack/react-router'
import { useLiveQuery } from 'dexie-react-hooks'
import { useMemo } from 'react'
import { getProjects } from '@/server/projects'
import { getTodayEntries, getRunningEntry } from '@/server/entries'
import { seedFromLoaderData } from '@/lib/offline-mutations'
import { localDb } from '@/lib/local-db'
import { TimerCard } from '@/components/timer-card'
import { EntryList } from '@/components/entry-list'
import { ManualEntryDialog } from '@/components/manual-entry-dialog'
import { FloralDecoration } from '@/components/floral-decoration'
import { getDurationSeconds, formatTotalTime } from '@/lib/utils'
import { Route as AuthRoute } from '@/routes/_authenticated'

export const Route = createFileRoute('/_authenticated/')({
  loader: async () => {
    try {
      const [entries, runningEntry, projects] = await Promise.all([
        getTodayEntries(),
        getRunningEntry(),
        getProjects(),
      ])
      // Merge running entry (may be from a previous day)
      const allEntries = runningEntry && !entries.find((e) => e.id === runningEntry.id)
        ? [...entries, runningEntry]
        : entries
      seedFromLoaderData(projects, allEntries).catch(() => {})
    } catch {
      // Offline – local DB has cached data
    }
  },
  component: DashboardPage,
})

function DashboardPage() {
  const { user } = AuthRoute.useRouteContext()
  const userId = user.id

  const todayRange = useMemo(() => {
    const now = new Date()
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    return {
      start: start.toISOString(),
      end: new Date(start.getTime() + 86_400_000).toISOString(),
    }
  }, [])

  const entries = useLiveQuery(async () => {
    const raw = await localDb.entries
      .filter(
        (e) =>
          e.userId === userId &&
          e.startTime >= todayRange.start &&
          e.startTime < todayRange.end &&
          e.syncStatus !== 'pending_delete',
      )
      .toArray()
    raw.sort((a, b) => b.startTime.localeCompare(a.startTime))

    const projectIds = [...new Set(raw.map((e) => e.projectId).filter(Boolean))] as string[]
    const projs = await localDb.projects.bulkGet(projectIds)
    const pMap = Object.fromEntries(projs.filter(Boolean).map((p) => [p!.id, p!]))

    return raw.map((e) => ({ ...e, project: e.projectId ? (pMap[e.projectId] ?? null) : null }))
  }, [userId, todayRange])

  const runningEntry = useLiveQuery(async () => {
    const entry = await localDb.entries
      .filter((e) => e.userId === userId && e.endTime === null && e.syncStatus !== 'pending_delete')
      .first()
    if (!entry) return null
    const proj = entry.projectId ? await localDb.projects.get(entry.projectId) : null
    return { ...entry, project: proj ?? null }
  }, [userId])

  const projects = useLiveQuery(
    () =>
      localDb.projects
        .filter((p) => p.userId === userId && p.syncStatus !== 'pending_delete')
        .toArray(),
    [userId],
  )

  const safeEntries = entries ?? []
  const safeProjects = projects ?? []
  const completedEntries = safeEntries.filter((e) => e.endTime !== null)
  const totalSeconds = completedEntries.reduce(
    (acc, e) => acc + getDurationSeconds(e.startTime, e.endTime),
    0,
  )

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 sm:py-8">
      <div className="relative mb-7">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
              Dashboard
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">{today}</p>
          </div>
          {totalSeconds > 0 && (
            <div className="text-right">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Today</p>
              <p className="font-heading text-2xl font-bold tabular-nums sm:text-3xl">
                {formatTotalTime(totalSeconds)}
              </p>
            </div>
          )}
        </div>
        <FloralDecoration variant="branch" className="mt-3 h-10 w-full opacity-80" />
      </div>

      <div className="mb-6">
        <TimerCard userId={userId} projects={safeProjects} runningEntry={runningEntry ?? null} />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Today&apos;s entries
          </h2>
          <ManualEntryDialog userId={userId} projects={safeProjects} />
        </div>
        <EntryList entries={safeEntries} totalSeconds={totalSeconds} />
      </div>
    </div>
  )
}
