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
