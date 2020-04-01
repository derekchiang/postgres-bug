require('dotenv').config()

const { migrator } = require('./migrate')

const { Pool } = require('pg')
const pool = new Pool({
  connectionString: process.env.POSTGRES_CONNECTION_STRING,
})

const range = (n) => {
  return [...Array(n).keys()]
}

async function createUser() {
  const client = await pool.connect()

  try {
    await client.query('BEGIN TRANSACTION ISOLATION LEVEL SERIALIZABLE;')

    let res = await client.query('SELECT count(*) FROM users')
    const userCount = res.rows[0].count
    if (userCount == 0) {
      await client.query('INSERT INTO users DEFAULT VALUES')
    }

    await client.query('COMMIT')
  } catch (e) {
    await client.query('ROLLBACK')
    throw e
  } finally {
    await client.release()
  }
}

async function countUsers() {
  const client = await pool.connect()

  const res = await client.query('SELECT count(*) FROM users')
  return res.rows[0].count
}

describe("serializable transactions", () => {
  beforeAll(async () => {
    await migrator.down()
    await migrator.up()
  })

  test('creating rows in parallel', async () => {
    try {
      await Promise.all(range(100).map(createUser))
    } catch (err) {
    }
    return expect(countUsers()).resolves.toBe("1")
  })
})
