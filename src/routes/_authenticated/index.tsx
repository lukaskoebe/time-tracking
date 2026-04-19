import { createFileRoute } from '@tanstack/react-router'
import { useLiveQuery } from 'dexie-react-hooks'
import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { getProjects } from '@/server/projects'
import { getEntriesForRange, getRunningEntry } from '@/server/entries'
import { seedFromLoaderData } from '@/lib/offline-mutations'
import { localDb } from '@/lib/local-db'
import { TimerCard } from '@/components/timer-card'
import { EntryList } from '@/components/entry-list'
import { ManualEntryDialog } from '@/components/manual-entry-dialog'
import { FloralDecoration } from '@/components/floral-decoration'
import { getDurationSeconds, formatTotalTime } from '@/lib/utils'
import { Route as AuthRoute } from '@/routes/_authenticated'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'

type Period = 'day' | 'week' | 'month'

function getRange(period: Period, offset: number): { start: Date; end: Date } {
  const now = new Date()
  if (period === 'day') {
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset)
    return { start, end: new Date(start.getTime() + 86_400_000) }
  }
  if (period === 'week') {
    // Monday-based week
    const dow = (now.getDay() + 6) % 7 // 0=Mon … 6=Sun
    const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dow + offset * 7)
    return { start: monday, end: new Date(monday.getTime() + 7 * 86_400_000) }
  }
  // month
  const start = new Date(now.getFullYear(), now.getMonth() + offset, 1)
  const end = new Date(now.getFullYear(), now.getMonth() + offset + 1, 1)
  return { start, end }
}

function getPeriodLabel(period: Period, offset: number): string {
  const { start, end } = getRange(period, offset)
  if (period === 'day') {
    if (offset === 0) return 'Today'
    if (offset === -1) return 'Yesterday'
    if (offset === 1) return 'Tomorrow'
    return start.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
  }
  if (period === 'week') {
    const endDay = new Date(end.getTime() - 1)
    const startStr = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    const endStr = endDay.toLocaleDateString('en-US', {
      month: start.getMonth() !== endDay.getMonth() ? 'short' : undefined,
      day: 'numeric',
    })
    return `${startStr} – ${endStr}`
  }
  return start.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

function groupByDay(entries: Array<{ startTime: string | Date; [key: string]: unknown }>) {
  const map = new Map<string, typeof entries>()
  for (const e of entries) {
    const d = new Date(e.startTime)
    const key = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(e)
  }
  return [...map.entries()].sort((a, b) => b[0].localeCompare(a[0]))
}

function dayLabel(dateKey: string): string {
  const [y, m, d] = dateKey.split('-').map(Number)
  const date = new Date(y, m, d)
  const today = new Date()
  const yesterday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1)
  if (date.toDateString() === today.toDateString()) return 'Today'
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday'
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
}

export const Route = createFileRoute('/_authenticated/')({
  loader: async () => {
    try {
      const now = new Date()
      // Seed current month + previous month to cover week/month views
      const rangeStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString()
      const rangeEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString()
      const [entries, runningEntry, projects] = await Promise.all([
        getEntriesForRange({ data: { start: rangeStart, end: rangeEnd } }),
        getRunningEntry(),
        getProjects(),
      ])
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

  const [period, setPeriod] = useState<Period>('day')
  const [offset, setOffset] = useState(0)

  const range = useMemo(() => {
    const { start, end } = getRange(period, offset)
    return { start: start.toISOString(), end: end.toISOString() }
  }, [period, offset])

  const periodLabel = useMemo(() => getPeriodLabel(period, offset), [period, offset])

  function handlePeriodChange(p: Period) {
    setPeriod(p)
    setOffset(0)
  }

  const entries = useLiveQuery(async () => {
    const raw = await localDb.entries
      .filter(
        (e) =>
          e.userId === userId &&
          e.startTime >= range.start &&
          e.startTime < range.end &&
          e.syncStatus !== 'pending_delete',
      )
      .toArray()
    raw.sort((a, b) => b.startTime.localeCompare(a.startTime))

    const projectIds = [...new Set(raw.map((e) => e.projectId).filter(Boolean))] as string[]
    const projs = await localDb.projects.bulkGet(projectIds)
    const pMap = Object.fromEntries(projs.filter(Boolean).map((p) => [p!.id, p!]))

    return raw.map((e) => ({ ...e, project: e.projectId ? (pMap[e.projectId] ?? null) : null }))
  }, [userId, range])

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

  const grouped = useMemo(
    () => (period !== 'day' ? groupByDay(safeEntries as never) : null),
    [period, safeEntries],
  )

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 sm:py-8">
      {/* Header */}
      <div className="relative mb-7">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
              Dashboard
            </h1>
          </div>
          {totalSeconds > 0 && (
            <div className="text-right">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                {period === 'day' ? 'Total' : period === 'week' ? 'This week' : 'This month'}
              </p>
              <p className="font-heading text-2xl font-bold tabular-nums sm:text-3xl">
                {formatTotalTime(totalSeconds)}
              </p>
            </div>
          )}
        </div>
        <FloralDecoration variant="branch" className="mt-3 h-10 w-full opacity-80" />
      </div>

      {/* Timer (always for current day) */}
      <div className="mb-6">
        <TimerCard userId={userId} projects={safeProjects} runningEntry={runningEntry ?? null} />
      </div>

      {/* Tabs + navigation */}
      <div className="mb-4 flex items-center gap-2">
        <Tabs value={period} onValueChange={(v) => handlePeriodChange(v as Period)} className="flex-1">
          <TabsList className="w-full">
            <TabsTrigger value="day" className="flex-1">Day</TabsTrigger>
            <TabsTrigger value="week" className="flex-1">Week</TabsTrigger>
            <TabsTrigger value="month" className="flex-1">Month</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Period label + prev/next */}
      <div className="mb-4 flex items-center justify-between px-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => setOffset((o) => o - 1)}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm font-medium">{periodLabel}</span>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => setOffset((o) => o + 1)}
          disabled={offset >= 0}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Entry list */}
      {period === 'day' ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Entries
            </h2>
            <ManualEntryDialog userId={userId} projects={safeProjects} />
          </div>
          <EntryList entries={safeEntries} totalSeconds={totalSeconds} label={periodLabel} />
        </div>
      ) : grouped && grouped.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border py-16 text-center">
          <p className="text-sm text-muted-foreground">No entries for this period.</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-end px-1">
            <ManualEntryDialog userId={userId} projects={safeProjects} />
          </div>
          {grouped?.map(([dateKey, dayEntries]) => {
            const dayCompleted = (dayEntries as typeof safeEntries).filter((e) => e.endTime !== null)
            const dayTotal = dayCompleted.reduce(
              (acc, e) => acc + getDurationSeconds(e.startTime, e.endTime),
              0,
            )
            return (
              <EntryList
                key={dateKey}
                entries={dayEntries as typeof safeEntries}
                totalSeconds={dayTotal}
                label={dayLabel(dateKey)}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
