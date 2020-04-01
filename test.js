require('dotenv').config()

const { migrator } = require('./migrate')

const pgp = require('pg-promise')()
const { TransactionMode, isolationLevel } = pgp.txMode
const db = pgp(process.env.POSTGRES_CONNECTION_STRING)

const range = (n) => {
  return [...Array(n).keys()]
}

async function createUser() {
  const mode = new TransactionMode({
    tiLevel: isolationLevel.serializable,
    // tiLevel: isolationLevel.readCommitted,
  })

  await db.tx({ mode }, async (t) => {
    const userCount = await t.one('SELECT count(*) FROM users', [], c => +c.count)
    if (userCount == 0) {
      await t.none('INSERT INTO users DEFAULT VALUES')
    }
  })
}

async function countUsers() {
  return await db.one('SELECT count(*) FROM users', [], c => +c.count)
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
      console.log(err)
    }
    return expect(countUsers()).resolves.toBe(1)
  })
})
