import { createServerFn } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'
import { and, desc, eq, gte, isNull } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { project, timeEntry } from '@/lib/db/schema'

async function requireUser() {
  const request = getRequest()
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session) throw new Error('Unauthorized')
  return session.user
}

/** Pull all projects + last 90 days of entries for the current user. */
export const syncAll = createServerFn({ method: 'GET' }).handler(async () => {
  const user = await requireUser()
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - 90)

  const [projects, entries] = await Promise.all([
    db.query.project.findMany({
      where: eq(project.userId, user.id),
      orderBy: (p, { asc }) => [asc(p.createdAt)],
    }),
    db.query.timeEntry.findMany({
      where: and(eq(timeEntry.userId, user.id), gte(timeEntry.startTime, cutoff)),
      with: { project: true },
      orderBy: [desc(timeEntry.startTime)],
    }),
  ])

  return { projects, entries, userId: user.id }
})

/**
 * Upsert an entry with a client-generated ID.
 * Used to sync offline-created entries (both running and completed).
 */
export const upsertEntry = createServerFn({ method: 'POST' })
  .inputValidator(
    (data: {
      id: string
      projectId?: string | null
      description?: string
      startTime: string
      endTime?: string | null
    }) => data,
  )
  .handler(async ({ data }) => {
    const user = await requireUser()

    // If creating a running timer, stop any existing one first
    if (!data.endTime) {
      await db
        .update(timeEntry)
        .set({ endTime: new Date() })
        .where(and(eq(timeEntry.userId, user.id), isNull(timeEntry.endTime)))
    }

    const [entry] = await db
      .insert(timeEntry)
      .values({
        id: data.id,
        userId: user.id,
        projectId: data.projectId ?? null,
        description: data.description ?? '',
        startTime: new Date(data.startTime),
        endTime: data.endTime ? new Date(data.endTime) : null,
      })
      .onConflictDoUpdate({
        target: timeEntry.id,
        set: { endTime: data.endTime ? new Date(data.endTime) : null },
      })
      .returning()
    return entry
  })

/**
 * Create a project with a client-generated ID.
 */
export const upsertProject = createServerFn({ method: 'POST' })
  .inputValidator((data: { id: string; name: string; color: string }) => data)
  .handler(async ({ data }) => {
    const user = await requireUser()
    const [created] = await db
      .insert(project)
      .values({ id: data.id, name: data.name, color: data.color, userId: user.id })
      .onConflictDoNothing()
      .returning()
    return created
  })
