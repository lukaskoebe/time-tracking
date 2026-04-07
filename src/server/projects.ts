import { createServerFn } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'
import { and, eq } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { project } from '@/lib/db/schema'

async function requireUser() {
  const request = getRequest()
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session) throw new Error('Unauthorized')
  return session.user
}

export const getProjects = createServerFn({ method: 'GET' }).handler(async () => {
  const user = await requireUser()
  return db.query.project.findMany({
    where: eq(project.userId, user.id),
    orderBy: (p, { asc }) => [asc(p.createdAt)],
  })
})

export const createProject = createServerFn({ method: 'POST' })
  .inputValidator((data: { name: string; color: string }) => data)
  .handler(async ({ data }) => {
    const user = await requireUser()
    const [created] = await db
      .insert(project)
      .values({ name: data.name, color: data.color, userId: user.id })
      .returning()
    return created
  })

export const deleteProject = createServerFn({ method: 'POST' })
  .inputValidator((data: { projectId: string }) => data)
  .handler(async ({ data }) => {
    const user = await requireUser()
    await db
      .delete(project)
      .where(and(eq(project.id, data.projectId), eq(project.userId, user.id)))
    return { success: true }
  })
