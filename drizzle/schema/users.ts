import { pgTable, varchar } from "drizzle-orm/pg-core";
import { createdAt, updatedAt } from "../schemaHelpers";
import { JobInfoTable } from "./jobinfo";
import { relations } from "drizzle-orm";

// user table
export const UsersTable = pgTable("users", {
  id: varchar().primaryKey(), // we dont use uuid because clerk doesn't
  email: varchar().notNull().unique(),
  imageUrl: varchar().notNull(),
  name: varchar().notNull(),
  createdAt: createdAt,
  updatedAt: updatedAt,
});

export const userRelations = relations(UsersTable, ({ many }) => ({
  jobInfo: many(JobInfoTable),
}));
