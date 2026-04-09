import { createFileRoute } from '@tanstack/react-router'
import { useLiveQuery } from 'dexie-react-hooks'
import { useMemo } from 'react'
import { Trash2, Sprout } from 'lucide-react'
import { getProjects } from '@/server/projects'
import { getWeekEntries } from '@/server/entries'
import { seedFromLoaderData } from '@/lib/offline-mutations'
import { offlineDeleteProject } from '@/lib/offline-mutations'
import { localDb } from '@/lib/local-db'
import { getDurationSeconds, formatTotalTime } from '@/lib/utils'
import { CreateProjectDialog } from '@/components/create-project-dialog'
import { FloralDecoration } from '@/components/floral-decoration'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useState } from 'react'
import { Route as AuthRoute } from '@/routes/_authenticated'

export const Route = createFileRoute('/_authenticated/projects')({
  loader: async () => {
    try {
      const [projects, weekEntries] = await Promise.all([getProjects(), getWeekEntries()])
      seedFromLoaderData(projects, weekEntries).catch(() => {})
    } catch {
      // Offline – use local DB
    }
  },
  component: ProjectsPage,
})

function ProjectsPage() {
  const { user } = AuthRoute.useRouteContext()
  const userId = user.id
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const weekRange = useMemo(() => {
    const now = new Date()
    const start = new Date(now)
    start.setDate(now.getDate() - now.getDay())
    start.setHours(0, 0, 0, 0)
    return {
      start: start.toISOString(),
      end: new Date(start.getTime() + 7 * 86_400_000).toISOString(),
    }
  }, [])

  const projects = useLiveQuery(
    () =>
      localDb.projects
        .filter((p) => p.userId === userId && p.syncStatus !== 'pending_delete')
        .toArray()
        .then((ps) => ps.sort((a, b) => a.createdAt.localeCompare(b.createdAt))),
    [userId],
  )

  const weekEntries = useLiveQuery(
    () =>
      localDb.entries
        .filter(
          (e) =>
            e.userId === userId &&
            e.startTime >= weekRange.start &&
            e.startTime < weekRange.end &&
            e.syncStatus !== 'pending_delete',
        )
        .toArray(),
    [userId, weekRange],
  )

  const secondsByProject = useMemo(() => {
    const map: Record<string, number> = {}
    for (const e of weekEntries ?? []) {
      if (!e.projectId || !e.endTime) continue
      map[e.projectId] = (map[e.projectId] ?? 0) + getDurationSeconds(e.startTime, e.endTime)
    }
    return map
  }, [weekEntries])

  async function handleDelete(projectId: string) {
    setDeletingId(projectId)
    try {
      await offlineDeleteProject(projectId)
      toast.success('Project deleted')
    } catch {
      toast.error('Failed to delete project')
    } finally {
      setDeletingId(null)
    }
  }

  const safeProjects = projects ?? []

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 sm:py-8">
      <div className="relative mb-7">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
              Projects
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {safeProjects.length === 0
                ? 'No projects yet'
                : `${safeProjects.length} project${safeProjects.length !== 1 ? 's' : ''}`}
            </p>
          </div>
          <CreateProjectDialog userId={userId} />
        </div>
        <FloralDecoration variant="branch" className="mt-3 h-10 w-full opacity-80" />
      </div>

      {safeProjects.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border py-20 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-secondary">
            <Sprout className="h-6 w-6 text-secondary-foreground" />
          </div>
          <p className="font-semibold">Plant your first project</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Create a project to organise your time
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {safeProjects.map((project) => {
            const weekSeconds = secondsByProject[project.id] ?? 0
            const isPending = project.syncStatus === 'pending'
            return (
              <div
                key={project.id}
                className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
              >
                <div
                  className="absolute left-0 top-0 h-full w-1.5 rounded-l-2xl"
                  style={{ background: project.color }}
                />
                <div className="pl-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span
                        className="h-3 w-3 shrink-0 rounded-full"
                        style={{ background: project.color }}
                      />
                      <h3 className="font-semibold leading-none">{project.name}</h3>
                      {isPending && (
                        <span className="text-[10px] text-amber-500 font-medium">offline</span>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:text-destructive"
                      disabled={deletingId === project.id}
                      onClick={() => handleDelete(project.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <div className="mt-4 flex items-end gap-1">
                    <span className="font-heading text-2xl font-bold tabular-nums">
                      {weekSeconds > 0 ? formatTotalTime(weekSeconds) : '—'}
                    </span>
                    {weekSeconds > 0 && (
                      <span className="mb-0.5 text-xs text-muted-foreground">this week</span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
