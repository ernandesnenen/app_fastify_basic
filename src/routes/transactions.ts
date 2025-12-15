import type { FastifyInstance } from 'fastify'

import { z } from 'zod'
import { randomUUID } from 'crypto'
import { db } from '../configdatabase'
import { checkSessionIdExist } from '../middlewares/check-session-id-exist'

export async function transactionsRotes(app: FastifyInstance) {
  app.get(
    '/',
    {
      preHandler: [checkSessionIdExist],
    },
    async (req) => {
      const { sessionId } = req.cookies

      const transactions = await db('transactions')
        .where('session_id', sessionId)
        .select('*')

      return {
        transactions,
      }
    },
  ) // teste ok

  app.get('/:id', { preHandler: [checkSessionIdExist] }, async (req) => {
    const { sessionId } = req.cookies
    const getTransacrionParamSchema = z.object({
      id: z.string().uuid(),
    })
    const { id } = getTransacrionParamSchema.parse(req.params)
    const transaction = await db('transactions')
      .where({
        session_Id: sessionId,
        id,
      })
      .first()

    return {
      transaction,
    }
  })

  app.get('/summary', { preHandler: [checkSessionIdExist] }, async (req) => {
    const { sessionId } = req.cookies
    const summary = await db('transactions')
      .where('session_Id', sessionId)
      .sum('amount as amount')
      .first()

    return {
      summary,
    }
  })

  app.post('/', async (req, reply) => {
    const createTransactionBodySchema = z.object({
      title: z.string(),
      amount: z.number(),
      type: z.enum(['credit', 'debit']),
    })

    const { title, amount, type } = createTransactionBodySchema.parse(req.body)

    let sessionId = req.cookies.sessionId

    if (!sessionId) {
      sessionId = randomUUID()
      reply.cookie('sessionId', sessionId, {
        path: '/',
        maxAge: 60 * 60 * 24 * 3, // 3 days
      })
    }

    await db('transactions').insert({
      id: randomUUID(),
      title,
      amount: type === 'credit' ? amount : amount * -1,
      session_id: sessionId,
    })

    return reply.status(201).send()
  }) // teste ok
}
