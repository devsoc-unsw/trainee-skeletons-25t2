# Backend
## First Time Set Up
- Make sure you have an `.env` file with the database URL
```env
export DATABASE_URL=postgresql://postgres:postgres@localhost:5432/postgres

```
## Modifying the SQL Schema
1. Navigate to the schema file at `src/db/schema.ts` and make your schema modifications
2. Generate a new migration file and then perform the migration using the following commands
```bash
pnpm drizzle-kit generate
pnpm drizzle-kit migrate
```
3. Alternatively, you can just run `pnpm drizzle-kit push` to directly push any schema changes, though make sure to generate the schema once you are done with your feature
4. Visit the [Drizzle Documentation](https://orm.drizzle.team/docs/overview) for further documentation on how to use Drizzle

## Project Structure
The backend follows a layered architecture, being split into `routes`, `controllers` and `services`.
- `routes/`: Defines the API endpoints and handles HTTP request routing. Each route file typically imports the relevant controller(s).
- `controllers/`: Contains the logic for handling requests, acting as an intermediary between routes and services. Controllers process input, call service methods, and return responses.
- `services/`: Encapsulates business logic and operations, often interacting with the database layer. Services are called by controllers to perform core application tasks.
- `db/`: Manages database access, schema definitions, and connections. This is where you’ll find the schema and database utility files.
- `tests/`: Where unit or integration tests are written to test various parts of the code base
- `index.ts`: The entry point of the backend application. It sets up the Express server, loads routes, and starts listening for requests.
