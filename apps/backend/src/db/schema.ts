import { integer, pgTable, varchar } from "drizzle-orm/pg-core";

// This is just an example schema, feel free to change this
export const usersTable = pgTable("users", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    name: varchar({ length: 255 }).notNull(),
    age: integer().notNull(),
    email: varchar({ length: 255 }).notNull().unique(),
});
