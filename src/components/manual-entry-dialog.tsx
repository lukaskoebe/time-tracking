import type React from 'react'
import { useState } from 'react'
import { useRouter } from '@tanstack/react-router'
import { Plus } from 'lucide-react'
import { createManualEntry } from '@/server/entries'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { getDurationSeconds, formatTotalTime } from '@/lib/utils'

interface Project {
  id: string
  name: string
  color: string
}

interface ManualEntryDialogProps {
  projects: Project[]
  defaultDate?: string // YYYY-MM-DD
}

function toLocalISODate(date: Date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function ManualEntryDialog({
  projects,
  defaultDate,
}: ManualEntryDialogProps) {
  const router = useRouter()
  const today = defaultDate ?? toLocalISODate(new Date())

  const [open, setOpen] = useState(false)
  const [description, setDescription] = useState('')
  const [projectId, setProjectId] = useState<string>('')
  const [date, setDate] = useState(today)
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('10:00')
  const [loading, setLoading] = useState(false)

  const startISO = date && startTime ? `${date}T${startTime}:00` : ''
  const endISO = date && endTime ? `${date}T${endTime}:00` : ''
  const durationSecs =
    startISO && endISO && new Date(endISO) > new Date(startISO)
      ? getDurationSeconds(startISO, endISO)
      : null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!startISO || !endISO) return
    if (new Date(endISO) <= new Date(startISO)) {
      toast.error('End time must be after start time')
      return
    }
    setLoading(true)
    try {
      await createManualEntry({
        data: {
          description: description.trim(),
          projectId: projectId || null,
          startTime: new Date(startISO).toISOString(),
          endTime: new Date(endISO).toISOString(),
        },
      })
      await router.invalidate()
      setOpen(false)
      setDescription('')
      setProjectId('')
      setDate(today)
      setStartTime('09:00')
      setEndTime('10:00')
      toast.success('Entry added')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to add entry')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Plus className="h-3.5 w-3.5" />
          Add entry
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add time entry</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="me-description">What did you work on?</Label>
            <Input
              id="me-description"
              placeholder="Description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label>Project</Label>
            <Select value={projectId} onValueChange={setProjectId}>
              <SelectTrigger>
                <SelectValue placeholder="No project" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    <div className="flex items-center gap-2">
                      <span
                        className="inline-block h-2 w-2 rounded-full"
                        style={{ background: p.color }}
                      />
                      {p.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="me-date">Date</Label>
            <Input
              id="me-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="me-start">Start time</Label>
              <Input
                id="me-start"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="me-end">End time</Label>
              <Input
                id="me-end"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
              />
            </div>
          </div>

          {durationSecs !== null && (
            <p className="text-sm text-muted-foreground">
              Duration:{' '}
              <span className="font-medium text-foreground">
                {formatTotalTime(durationSecs)}
              </span>
            </p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !date || !startTime || !endTime}
            >
              {loading ? 'Saving…' : 'Save entry'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
