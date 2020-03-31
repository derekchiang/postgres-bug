require('dotenv').config()

const { setupSlonikMigrator } = require('@slonik/migrator')
const { createPool } = require('slonik')

// in an existing slonik project, this would usually be setup in another module
const slonik = createPool(process.env.POSTGRES_CONNECTION_STRING)

const migrator = setupSlonikMigrator({
  migrationsTableName: 'test_migrations',
  migrationsPath: __dirname + '/migrations',
  slonik,
  mainModule: module,
})

module.exports = { slonik, migrator }