To reproduce the issue, create an `.env` file with your Postgres connection string, like this:

```
POSTGRES_CONNECTION_STRING=postgresql://orm-user:123456@localhost:5432/orm-db
```

Then run:

```
npm install
npm run test
```
