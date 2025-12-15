import fastify from 'fastify'
import cookie from '@fastify/cookie'
import { transactionsRotes } from './routes/transactions'

export const app = fastify()

app.register(cookie)
app.register(transactionsRotes, {
  prefix: 'transactions',
})
