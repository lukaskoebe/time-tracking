import { useRouter } from '@tanstack/react-router'
import { Trash2 } from 'lucide-react'
import { deleteEntry } from '@/server/entries'
import {
  formatDuration,
  formatTotalTime,
  getDurationSeconds,
} from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useState } from 'react'

interface Project {
  id: string
  name: string
  color: string
}

interface TimeEntry {
  id: string
  description: string
  startTime: Date | string
  endTime: Date | string | null
  project: Project | null
}

interface EntryListProps {
  entries: TimeEntry[]
  totalSeconds: number
}

export function EntryList({ entries, totalSeconds }: EntryListProps) {
  const router = useRouter()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function handleDelete(entryId: string) {
    setDeletingId(entryId)
    try {
      await deleteEntry({ data: { entryId } })
      await router.invalidate()
    } catch {
      toast.error('Failed to delete entry')
    } finally {
      setDeletingId(null)
    }
  }

  if (entries.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border py-16 text-center">
        <p className="text-sm text-muted-foreground">No entries today. Start a timer above!</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Today
        </h2>
        <span className="text-sm font-semibold tabular-nums">
          {formatTotalTime(totalSeconds)}
        </span>
      </div>

      <div className="overflow-hidden rounded-xl border border-border">
        {entries.map((entry, i) => {
          const duration = entry.endTime
            ? getDurationSeconds(entry.startTime, entry.endTime)
            : getDurationSeconds(entry.startTime)
          const isRunning = !entry.endTime

          return (
            <div
              key={entry.id}
              className={`flex items-center gap-3 px-4 py-3 ${
                i !== entries.length - 1 ? 'border-b border-border' : ''
              }`}
            >
              {/* Project dot */}
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{
                  background: entry.project?.color ?? '#71717a',
                }}
              />

              {/* Description + project */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {entry.description || (
                    <span className="text-muted-foreground italic">
                      No description
                    </span>
                  )}
                </p>
                {entry.project && (
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {entry.project.name}
                  </p>
                )}
              </div>

              {/* Running indicator */}
              {isRunning && (
                <Badge
                  variant="secondary"
                  className="shrink-0 text-xs font-medium text-primary bg-primary/10 border-primary/20"
                >
                  Running
                </Badge>
              )}

              {/* Duration */}
              <span className="shrink-0 font-mono text-sm tabular-nums text-foreground">
                {formatDuration(duration)}
              </span>

              {/* Time range */}
              <span className="hidden shrink-0 text-xs text-muted-foreground sm:block">
                {new Date(entry.startTime).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
                {entry.endTime &&
                  ` – ${new Date(entry.endTime).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}`}
              </span>

              {/* Delete */}
              {!isRunning && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
                  disabled={deletingId === entry.id}
                  onClick={() => handleDelete(entry.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
