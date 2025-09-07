# Backend

## First Time Set Up

- Make sure you have an `.env` file with the database URL

```env
export DATABASE_URL=postgresql://postgres:postgres@localhost:5432/postgres
export GOOGLE_PLACES_API_KEY=API_KEY
export USE_MOCK_RESTAURANTS=false
export REDIS_HOST=localhost
export REDIS_PORT=6379

```

## Starting/Stopping the Database

- `docker compose up -d` to start the database as a background process
- `docker compose down` to stop the database and remove the docker image
- Database tables are persisted between starts/stops. If you want to clear the db, delete the `data` directory that gets created in the root directory of the project (not the backend root directory!)

## Modifying the SQL Schema

1. Make sure the database is actually running in the previous step
1. Navigate to the schema file at `src/db/schema.ts` and make your schema modifications
1. Generate a new migration file and then perform the migration using the following commands

```bash
pnpm run db:generate
pnpm run db:migrate
```

4. Alternatively, you can just run `pnpm run db:push` to directly push any schema changes, though make sure to generate the schema once you are done with your feature
5. Visit the [Drizzle Documentation](https://orm.drizzle.team/docs/overview) for further documentation on how to use Drizzle

## Project Structure

The backend follows an architecture that has it's modules split by domain.

- `db/`: Manages database access, schema definitions, and connections. This is where you’ll find the schema and database utility files.
- `restaurants/`: Logic to call the Google Places API
- `rooms/`: Logic to create game rooms
- `test/`: Where unit or integration tests are written to test various parts of the code base
- `config.ts`: Centralised point for where environment variables are defined and exported
- `server.ts`: Logic for setting up the express and socket.io server to be exported
- `types.ts`: Common types that are shared across the application
- `index.ts`: The entry point of the backend application. It sets up the Express server, loads routes, and starts listening for requests.
