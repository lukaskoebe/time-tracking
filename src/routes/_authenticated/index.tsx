import { createFileRoute } from '@tanstack/react-router'
import { getProjects } from '@/server/projects'
import { getTodayEntries, getRunningEntry } from '@/server/entries'
import { TimerCard } from '@/components/timer-card'
import { EntryList } from '@/components/entry-list'
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
  const totalSeconds = completedEntries.reduce((acc, entry) => {
    return acc + getDurationSeconds(entry.startTime, entry.endTime)
  }, 0)

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      {/* Header */}
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{today}</p>
        </div>
        {totalSeconds > 0 && (
          <div className="text-right">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              Today
            </p>
            <p className="font-heading text-2xl font-bold tabular-nums">
              {formatTotalTime(totalSeconds)}
            </p>
          </div>
        )}
      </div>

      {/* Timer */}
      <div className="mb-8">
        <TimerCard projects={projects} runningEntry={runningEntry} />
      </div>

      {/* Entry list */}
      <EntryList entries={entries} totalSeconds={totalSeconds} />
    </div>
  )
}
