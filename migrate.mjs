/**
 * Standalone migration runner — used by the Docker `migrate` service.
 * Applies all pending Drizzle migrations then exits.
 */
import { drizzle } from 'drizzle-orm/node-postgres'
import { migrate } from 'drizzle-orm/node-postgres/migrator'
import pg from 'pg'

const { Pool } = pg

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const db = drizzle(pool)

console.log('Running database migrations…')
await migrate(db, { migrationsFolder: './drizzle' })
console.log('Migrations complete.')

await pool.end()
