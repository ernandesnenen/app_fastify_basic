import knex, { type Knex } from 'knex'
import { env } from './env/index'

if (!process.env.DATABASE_URL) {
  throw Error('DATABASE_URL  NOT FOUND')
}

export const config: Knex.Config = {
  client: 'sqlite3',
  connection: {
    filename: env.DATABASE_URL,
  },
  useNullAsDefault: true,
  migrations: {
    extension: 'ts',
    directory: './database/migrations',
  },
}
export const db = knex(config)
