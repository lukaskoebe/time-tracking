import { useEffect, useState } from 'react'
import { Play, Square } from 'lucide-react'
import { offlineStartTimer, offlineStopTimer } from '@/lib/offline-mutations'
import { formatDuration, getDurationSeconds } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'

interface Project {
  id: string
  name: string
  color: string
}

interface RunningEntry {
  id: string
  description: string
  startTime: Date | string
  project: Project | null
  syncStatus?: string
}

interface TimerCardProps {
  userId: string
  projects: Project[]
  runningEntry: RunningEntry | null
}

function LiveTimer({ startTime }: { startTime: Date | string }) {
  const [elapsed, setElapsed] = useState(() => getDurationSeconds(startTime))

  useEffect(() => {
    const interval = setInterval(() => setElapsed(getDurationSeconds(startTime)), 1000)
    return () => clearInterval(interval)
  }, [startTime])

  return (
    <span className="font-mono text-4xl font-semibold tabular-nums tracking-tight">
      {formatDuration(elapsed)}
    </span>
  )
}

export function TimerCard({ userId, projects, runningEntry }: TimerCardProps) {
  const [description, setDescription] = useState('')
  const [projectId, setProjectId] = useState<string>('')
  const [loading, setLoading] = useState(false)

  async function handleStart() {
    setLoading(true)
    try {
      await offlineStartTimer(userId, {
        description: description.trim(),
        projectId: projectId || null,
      })
      setDescription('')
      setProjectId('')
    } catch {
      toast.error('Failed to start timer')
    } finally {
      setLoading(false)
    }
  }

  async function handleStop() {
    if (!runningEntry) return
    setLoading(true)
    try {
      await offlineStopTimer(userId, runningEntry.id)
    } catch {
      toast.error('Failed to stop timer')
    } finally {
      setLoading(false)
    }
  }

  if (runningEntry) {
    return (
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              {runningEntry.project && (
                <span
                  className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ background: runningEntry.project.color }}
                />
              )}
              <span className="text-sm font-medium text-muted-foreground">
                {runningEntry.project?.name ?? 'No project'}
              </span>
              {runningEntry.syncStatus === 'pending' && (
                <span className="text-[10px] text-amber-500 font-medium">offline</span>
              )}
            </div>
            <p className="mt-1 truncate text-base font-medium">
              {runningEntry.description || (
                <span className="text-muted-foreground italic">No description</span>
              )}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <LiveTimer startTime={runningEntry.startTime} />
            <Button
              onClick={handleStop}
              disabled={loading}
              size="lg"
              variant="destructive"
              className="gap-2 rounded-full px-5"
            >
              <Square className="h-4 w-4 fill-current" />
              Stop
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex gap-3">
        <Input
          placeholder="What are you working on?"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !loading) handleStart()
          }}
          className="flex-1"
        />
        <Select value={projectId} onValueChange={setProjectId}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="No project" />
          </SelectTrigger>
          <SelectContent>
            {projects.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                <div className="flex items-center gap-2">
                  <span className="inline-block h-2 w-2 rounded-full" style={{ background: p.color }} />
                  {p.name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          onClick={handleStart}
          disabled={loading}
          size="default"
          className="gap-2 rounded-lg px-5"
        >
          <Play className="h-4 w-4 fill-current" />
          Start
        </Button>
      </div>
    </div>
  )
}
