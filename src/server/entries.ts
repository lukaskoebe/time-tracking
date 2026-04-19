import { createServerFn } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'
import { and, desc, eq, gte, isNull, lt, lte } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { timeEntry } from '@/lib/db/schema'

async function requireUser() {
  const request = getRequest()
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session) throw new Error('Unauthorized')
  return session.user
}

export const getTodayEntries = createServerFn({ method: 'GET' }).handler(async () => {
  const user = await requireUser()
  const now = new Date()
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000)

  return db.query.timeEntry.findMany({
    where: and(
      eq(timeEntry.userId, user.id),
      gte(timeEntry.startTime, startOfDay),
      lt(timeEntry.startTime, endOfDay),
    ),
    with: { project: true },
    orderBy: [desc(timeEntry.startTime)],
  })
})

export const getWeekEntries = createServerFn({ method: 'GET' }).handler(async () => {
  const user = await requireUser()
  const now = new Date()
  const dayOfWeek = now.getDay()
  const startOfWeek = new Date(now)
  startOfWeek.setDate(now.getDate() - dayOfWeek)
  startOfWeek.setHours(0, 0, 0, 0)
  const endOfWeek = new Date(startOfWeek.getTime() + 7 * 24 * 60 * 60 * 1000)

  return db.query.timeEntry.findMany({
    where: and(
      eq(timeEntry.userId, user.id),
      gte(timeEntry.startTime, startOfWeek),
      lte(timeEntry.startTime, endOfWeek),
    ),
    with: { project: true },
    orderBy: [desc(timeEntry.startTime)],
  })
})

export const getEntriesForRange = createServerFn({ method: 'GET' })
  .inputValidator((data: { start: string; end: string }) => data)
  .handler(async ({ data }) => {
    const user = await requireUser()
    return db.query.timeEntry.findMany({
      where: and(
        eq(timeEntry.userId, user.id),
        gte(timeEntry.startTime, new Date(data.start)),
        lt(timeEntry.startTime, new Date(data.end)),
      ),
      with: { project: true },
      orderBy: [desc(timeEntry.startTime)],
    })
  })

export const getRunningEntry = createServerFn({ method: 'GET' }).handler(async () => {
  const user = await requireUser()
  return (
    (await db.query.timeEntry.findFirst({
      where: and(eq(timeEntry.userId, user.id), isNull(timeEntry.endTime)),
      with: { project: true },
    })) ?? null
  )
})

export const startTimer = createServerFn({ method: 'POST' })
  .inputValidator(
    (data: { projectId?: string | null; description?: string }) => data,
  )
  .handler(async ({ data }) => {
    const user = await requireUser()

    // Stop any currently running timer
    const running = await db.query.timeEntry.findFirst({
      where: and(eq(timeEntry.userId, user.id), isNull(timeEntry.endTime)),
    })
    if (running) {
      await db
        .update(timeEntry)
        .set({ endTime: new Date() })
        .where(eq(timeEntry.id, running.id))
    }

    const [entry] = await db
      .insert(timeEntry)
      .values({
        userId: user.id,
        projectId: data.projectId ?? null,
        description: data.description ?? '',
        startTime: new Date(),
      })
      .returning()
    return entry
  })

export const stopTimer = createServerFn({ method: 'POST' })
  .inputValidator((data: { entryId: string }) => data)
  .handler(async ({ data }) => {
    const user = await requireUser()
    const [entry] = await db
      .update(timeEntry)
      .set({ endTime: new Date() })
      .where(
        and(eq(timeEntry.id, data.entryId), eq(timeEntry.userId, user.id)),
      )
      .returning()
    return entry
  })

export const deleteEntry = createServerFn({ method: 'POST' })
  .inputValidator((data: { entryId: string }) => data)
  .handler(async ({ data }) => {
    const user = await requireUser()
    await db
      .delete(timeEntry)
      .where(
        and(eq(timeEntry.id, data.entryId), eq(timeEntry.userId, user.id)),
      )
    return { success: true }
  })

export const createManualEntry = createServerFn({ method: 'POST' })
  .inputValidator(
    (data: {
      projectId?: string | null
      description?: string
      startTime: string
      endTime: string
    }) => data,
  )
  .handler(async ({ data }) => {
    const user = await requireUser()
    const startTime = new Date(data.startTime)
    const endTime = new Date(data.endTime)
    if (endTime <= startTime) throw new Error('End time must be after start time')
    const [entry] = await db
      .insert(timeEntry)
      .values({
        userId: user.id,
        projectId: data.projectId ?? null,
        description: data.description ?? '',
        startTime,
        endTime,
      })
      .returning()
    return entry
  })
