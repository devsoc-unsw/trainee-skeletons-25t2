import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import "dotenv/config";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
});

// This is what you'll be using to interact with the database, you can import it into other
// files (usually .service.ts files to keep everything abstracted)
const db = drizzle({ client: pool });

export default db;
