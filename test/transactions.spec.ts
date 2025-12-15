import { describe, it, beforeAll, afterAll, expect, beforeEach } from 'vitest'
import { execSync } from 'node:child_process'
import request from 'supertest'
import { app } from '../src/app.js'

describe('transactions rotes', () => {
  beforeAll(async () => {
    await app.ready()
  })
  afterAll(async () => {
    await app.close()
  })

  beforeEach(() => {
    execSync('npm run knex migrate:rollback --all')
    execSync('npm run knex migrate:latest')
  })

  it('should be able to create a new  transacation', async () => {
    await request(app.server)
      .post('/transactions')
      .send({
        title: 'new transaction test',
        amount: 3000,
        type: 'credit',
      })
      .expect(201)
  })

  it('should be able to list all transacations', async () => {
    const responseReq = await request(app.server).post('/transactions').send({
      title: 'new transaction test',
      amount: 4000,
      type: 'credit',
    })

    const cookies = responseReq.get('Set-Cookie')
    const listTransactionsResponse = await request(app.server)
      .get('/transactions')
      .set('Cookie', cookies)
      .expect(200)

    expect(listTransactionsResponse.body.transactions).toEqual([
      expect.objectContaining({
        title: 'new transaction test',
        amount: 4000,
      }),
    ])
  })

  it('should be able to seach all transactions and summarize os values of the column amount', async () => {
    const responseReq = await request(app.server).post('/transactions').send({
      title: 'new transaction test',
      amount: 4000,
      type: 'credit',
    })
    const cookieResponse = responseReq.get('Set-Cookie')
    await request(app.server)
      .post('/transactions')
      .set('Cookie', cookieResponse)
      .send({
        title: 'new transaction test',
        amount: 2500,
        type: 'debit',
      })

    const summaryResponse = await request(app.server)
      .get('/transactions/summary')
      .set('Cookie', cookieResponse)
      .expect(200)

    const { summary } = summaryResponse.body

    expect(summary).toEqual(
      expect.objectContaining({
        amount: 1500,
      }),
    )
  })

  it('should be able to seach a transaction for id', async () => {
    const responseReq = await request(app.server).post('/transactions').send({
      title: 'new transaction test',
      amount: 4000,
      type: 'credit',
    })

    const cookies = responseReq.get('Set-Cookie')

    const listTransactionsResponse = await request(app.server)
      .get('/transactions')
      .set('Cookie', cookies)
    const { transactions } = listTransactionsResponse.body

    const id = transactions[0].id

    const transactionResponse = await request(app.server)
      .get(`/transactions/${id}`)
      .set('Cookie', cookies)
      .expect(200)

    const { transaction } = transactionResponse.body

    expect(transaction).toEqual(
      expect.objectContaining({
        title: 'new transaction test',
        amount: 4000,
      }),
    )
  })
})
