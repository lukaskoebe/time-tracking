import Dexie, { type EntityTable } from 'dexie'

export type SyncStatus = 'synced' | 'pending' | 'pending_stop' | 'pending_delete'

export interface LocalProject {
  id: string
  name: string
  color: string
  userId: string
  createdAt: string
  syncStatus: SyncStatus
}

export interface LocalEntry {
  id: string
  projectId: string | null
  userId: string
  description: string
  startTime: string   // ISO string
  endTime: string | null  // ISO string or null (null = running)
  createdAt: string
  syncStatus: SyncStatus
}

// Use the Dexie 4 recommended type-cast approach (avoids class extension mapping issues)
export const localDb = new Dexie('time_tracking_db') as Dexie & {
  projects: EntityTable<LocalProject, 'id'>
  entries: EntityTable<LocalEntry, 'id'>
}

localDb.version(1).stores({
  projects: 'id, userId, syncStatus, createdAt',
  entries:  'id, userId, startTime, createdAt, syncStatus',
})
