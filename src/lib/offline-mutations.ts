/**
 * Offline-aware mutation wrappers.
 * Each function writes optimistically to local Dexie DB first,
 * then attempts a server call. On failure the record stays pending
 * and will be synced next time the app is online.
 */
import { localDb, type LocalEntry, type LocalProject } from './local-db'

/** UUID v4 — uses crypto.randomUUID when available, falls back to getRandomValues. */
function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  // Fallback: build UUID v4 from random bytes
  const b = new Uint8Array(16)
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(b)
  } else {
    for (let i = 0; i < 16; i++) b[i] = (Math.random() * 256) | 0
  }
  b[6] = (b[6] & 0x0f) | 0x40
  b[8] = (b[8] & 0x3f) | 0x80
  return [...b]
    .map((v, i) => ([4, 6, 8, 10].includes(i) ? '-' : '') + v.toString(16).padStart(2, '0'))
    .join('')
}
import { startTimer, stopTimer, deleteEntry, createManualEntry } from '@/server/entries'
import { createProject, deleteProject } from '@/server/projects'
import { upsertEntry, upsertProject } from '@/server/sync'

// ─── Entries ────────────────────────────────────────────────────────────────

export async function offlineStartTimer(
  userId: string,
  data: { projectId?: string | null; description?: string },
): Promise<LocalEntry> {
  const id = generateId()
  const now = new Date().toISOString()

  // Stop any currently running timer locally
  const running = await localDb.entries.filter((e) => e.endTime === null).first()
  if (running) {
    await localDb.entries.update(running.id, {
      endTime: now,
      syncStatus: running.syncStatus === 'pending' ? 'pending' : 'pending_stop',
    })
  }

  const local: LocalEntry = {
    id,
    userId,
    projectId: data.projectId ?? null,
    description: data.description ?? '',
    startTime: now,
    endTime: null,
    createdAt: now,
    syncStatus: 'pending',
  }
  await localDb.entries.put(local)

  // Attempt server call
  try {
    const entry = await startTimer({ data: { projectId: data.projectId, description: data.description } })
    // Replace the local pending entry with the server-confirmed one
    await localDb.entries.delete(id)
    await localDb.entries.put({
      id: entry.id,
      userId: entry.userId,
      projectId: entry.projectId ?? null,
      description: entry.description,
      startTime: new Date(entry.startTime).toISOString(),
      endTime: entry.endTime ? new Date(entry.endTime).toISOString() : null,
      createdAt: new Date(entry.createdAt).toISOString(),
      syncStatus: 'synced',
    })
    if (running?.syncStatus === 'synced') {
      // server already stopped it; mark local as synced
      await localDb.entries.update(running.id, { endTime: now, syncStatus: 'synced' })
    }
    return { ...local, id: entry.id, syncStatus: 'synced' }
  } catch {
    return local
  }
}

export async function offlineStopTimer(
  _userId: string,
  entryId: string,
): Promise<void> {
  const now = new Date().toISOString()
  const local = await localDb.entries.get(entryId)
  if (!local) return

  const wasPending = local.syncStatus === 'pending'
  await localDb.entries.update(entryId, {
    endTime: now,
    syncStatus: wasPending ? 'pending' : 'pending_stop',
  })

  try {
    await stopTimer({ data: { entryId } })
    await localDb.entries.update(entryId, { syncStatus: 'synced' })
  } catch {
    // stays pending_stop, will sync later
  }
}

export async function offlineDeleteEntry(entryId: string): Promise<void> {
  const local = await localDb.entries.get(entryId)
  if (!local) return

  if (local.syncStatus === 'pending') {
    // Never reached server — just delete locally
    await localDb.entries.delete(entryId)
    return
  }

  await localDb.entries.update(entryId, { syncStatus: 'pending_delete' })
  try {
    await deleteEntry({ data: { entryId } })
    await localDb.entries.delete(entryId)
  } catch {
    // stays pending_delete
  }
}

export async function offlineCreateManualEntry(
  userId: string,
  data: {
    projectId?: string | null
    description?: string
    startTime: string
    endTime: string
  },
): Promise<LocalEntry> {
  const id = generateId()
  const now = new Date().toISOString()

  const local: LocalEntry = {
    id,
    userId,
    projectId: data.projectId ?? null,
    description: data.description ?? '',
    startTime: data.startTime,
    endTime: data.endTime,
    createdAt: now,
    syncStatus: 'pending',
  }
  await localDb.entries.put(local)

  try {
    const entry = await createManualEntry({ data })
    await localDb.entries.delete(id)
    await localDb.entries.put({
      id: entry.id,
      userId: entry.userId,
      projectId: entry.projectId ?? null,
      description: entry.description,
      startTime: new Date(entry.startTime).toISOString(),
      endTime: entry.endTime ? new Date(entry.endTime).toISOString() : null,
      createdAt: new Date(entry.createdAt).toISOString(),
      syncStatus: 'synced',
    })
    return { ...local, id: entry.id, syncStatus: 'synced' }
  } catch {
    return local
  }
}

// ─── Projects ────────────────────────────────────────────────────────────────

export async function offlineCreateProject(
  userId: string,
  data: { name: string; color: string },
): Promise<LocalProject> {
  const id = generateId()
  const now = new Date().toISOString()

  const local: LocalProject = {
    id,
    userId,
    name: data.name,
    color: data.color,
    createdAt: now,
    syncStatus: 'pending',
  }
  await localDb.projects.put(local)

  try {
    const proj = await createProject({ data })
    await localDb.projects.delete(id)
    await localDb.projects.put({
      id: proj.id,
      userId: proj.userId,
      name: proj.name,
      color: proj.color,
      createdAt: new Date(proj.createdAt).toISOString(),
      syncStatus: 'synced',
    })
    return { ...local, id: proj.id, syncStatus: 'synced' }
  } catch {
    return local
  }
}

export async function offlineDeleteProject(projectId: string): Promise<void> {
  const local = await localDb.projects.get(projectId)
  if (!local) return

  if (local.syncStatus === 'pending') {
    await localDb.projects.delete(projectId)
    // Also remove entries linked to it locally
    const linked = await localDb.entries.filter((e) => e.projectId === projectId).toArray()
    await localDb.entries.bulkDelete(linked.map((e) => e.id))
    return
  }

  await localDb.projects.update(projectId, { syncStatus: 'pending_delete' })
  try {
    await deleteProject({ data: { projectId } })
    await localDb.projects.delete(projectId)
  } catch {
    // stays pending_delete
  }
}

// ─── Seed local DB from loader data ─────────────────────────────────────────

type ServerProject = {
  id: string; name: string; color: string; userId: string; createdAt: Date | string
}
type ServerEntry = {
  id: string; projectId: string | null; userId: string; description: string
  startTime: Date | string; endTime: Date | string | null; createdAt: Date | string
  project?: { id: string; name: string; color: string } | null
}

export async function seedFromLoaderData(
  projects: ServerProject[],
  entries: ServerEntry[],
) {
  await localDb.transaction('rw', localDb.projects, localDb.entries, async () => {
    const serverProjectIds = new Set(projects.map((p) => p.id))
    const serverEntryIds = new Set(entries.map((e) => e.id))

    // Remove synced records that no longer exist on server
    const localProjects = await localDb.projects.where('syncStatus').equals('synced').toArray()
    const localEntries  = await localDb.entries.where('syncStatus').equals('synced').toArray()
    const staleProjIds  = localProjects.filter((p) => !serverProjectIds.has(p.id)).map((p) => p.id)
    const staleEntryIds = localEntries.filter((e) => !serverEntryIds.has(e.id)).map((e) => e.id)
    if (staleProjIds.length)  await localDb.projects.bulkDelete(staleProjIds)
    if (staleEntryIds.length) await localDb.entries.bulkDelete(staleEntryIds)

    // Upsert server records (only overwrite synced ones)
    await localDb.projects.bulkPut(
      projects.map((p) => ({
        id: p.id,
        name: p.name,
        color: p.color,
        userId: p.userId,
        createdAt: new Date(p.createdAt).toISOString(),
        syncStatus: 'synced' as const,
      })),
    )
    await localDb.entries.bulkPut(
      entries.map((e) => ({
        id: e.id,
        userId: e.userId,
        projectId: e.projectId,
        description: e.description,
        startTime: new Date(e.startTime).toISOString(),
        endTime: e.endTime ? new Date(e.endTime).toISOString() : null,
        createdAt: new Date(e.createdAt).toISOString(),
        syncStatus: 'synced' as const,
      })),
    )
  })
}

// ─── Push pending items to server ───────────────────────────────────────────

export async function pushPending(): Promise<void> {
  // Pending project creates
  const pendingProjects = await localDb.projects.where('syncStatus').equals('pending').toArray()
  for (const p of pendingProjects) {
    try {
      await upsertProject({ data: { id: p.id, name: p.name, color: p.color } })
      await localDb.projects.update(p.id, { syncStatus: 'synced' })
    } catch {
      return // stop on first network failure
    }
  }

  // Pending project deletes
  const deletedProjects = await localDb.projects.where('syncStatus').equals('pending_delete').toArray()
  for (const p of deletedProjects) {
    try {
      await deleteProject({ data: { projectId: p.id } })
      await localDb.projects.delete(p.id)
    } catch {
      return
    }
  }

  // Pending entry creates / updates
  const pendingEntries = await localDb.entries.where('syncStatus').equals('pending').toArray()
  // Sort: running timers last (so completed ones don't block the running one)
  pendingEntries.sort((a, b) => (a.endTime === null ? 1 : -1) - (b.endTime === null ? 1 : -1))
  for (const e of pendingEntries) {
    try {
      await upsertEntry({
        data: {
          id: e.id,
          projectId: e.projectId,
          description: e.description,
          startTime: e.startTime,
          endTime: e.endTime,
        },
      })
      await localDb.entries.update(e.id, { syncStatus: 'synced' })
    } catch {
      return
    }
  }

  // Pending timer stops
  const pendingStops = await localDb.entries.where('syncStatus').equals('pending_stop').toArray()
  for (const e of pendingStops) {
    try {
      await stopTimer({ data: { entryId: e.id } })
      await localDb.entries.update(e.id, { syncStatus: 'synced' })
    } catch {
      return
    }
  }

  // Pending entry deletes
  const deletedEntries = await localDb.entries.where('syncStatus').equals('pending_delete').toArray()
  for (const e of deletedEntries) {
    try {
      await deleteEntry({ data: { entryId: e.id } })
      await localDb.entries.delete(e.id)
    } catch {
      return
    }
  }
}
