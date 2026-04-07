import { createFileRoute } from '@tanstack/react-router'
import { getProjects } from '@/server/projects'
import { getTodayEntries, getRunningEntry } from '@/server/entries'
import { TimerCard } from '@/components/timer-card'
import { EntryList } from '@/components/entry-list'
import { ManualEntryDialog } from '@/components/manual-entry-dialog'
import { FloralDecoration } from '@/components/floral-decoration'
import { getDurationSeconds, formatTotalTime } from '@/lib/utils'

export const Route = createFileRoute('/_authenticated/')({
  loader: async () => {
    const [entries, runningEntry, projects] = await Promise.all([
      getTodayEntries(),
      getRunningEntry(),
      getProjects(),
    ])
    return { entries, runningEntry, projects }
  },
  component: DashboardPage,
})

function DashboardPage() {
  const { entries, runningEntry, projects } = Route.useLoaderData()

  const completedEntries = entries.filter((e) => e.endTime !== null)
  const totalSeconds = completedEntries.reduce(
    (acc, entry) => acc + getDurationSeconds(entry.startTime, entry.endTime),
    0,
  )

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 sm:py-8">
      {/* Header with floral decoration */}
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
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                Today
              </p>
              <p className="font-heading text-2xl font-bold tabular-nums sm:text-3xl">
                {formatTotalTime(totalSeconds)}
              </p>
            </div>
          )}
        </div>
        {/* Subtle floral branch under the heading */}
        <FloralDecoration
          variant="branch"
          className="mt-3 h-10 w-full opacity-80"
        />
      </div>

      {/* Timer */}
      <div className="mb-6">
        <TimerCard projects={projects} runningEntry={runningEntry} />
      </div>

      {/* Entry list with "add entry" button */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Today&apos;s entries
          </h2>
          <ManualEntryDialog projects={projects} />
        </div>
        <EntryList entries={entries} totalSeconds={totalSeconds} />
      </div>
    </div>
  )
}
