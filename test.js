require('dotenv').config()

const { createPool, sql } = require('slonik')
const { createQueryLoggingInterceptor } = require('slonik-interceptor-query-logging')
const { migrator } = require('./migrate')

const pool = createPool(process.env.POSTGRES_CONNECTION_STRING, {
  interceptors: [createQueryLoggingInterceptor()],
})

const range = (n) => {
  return [...Array(n).keys()]
}

async function createUser() {
  try {
    await pool.transaction(async (trx) => {
      await trx.query(sql`SET TRANSACTION ISOLATION LEVEL SERIALIZABLE`)

      const userCount = await countUsers(trx)
      if (userCount === 0) {
        await trx.query(sql`insert into users default values`)
      }
    })
  } catch (err) {

  }
}

async function countUsers(conn) {
  const res = await conn.query(sql`select count(*) from users`)
  return res.rows[0].count
}

describe("serializable transactions", () => {
  beforeAll(async () => {
    await migrator.down()
    await migrator.up()
  })

  test('creating rows in parallel', async () => {
    await Promise.all(range(100).map(createUser))
    await expect(countUsers(pool)).resolves.toBe(1)
  })
})