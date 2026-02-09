import { pgTable, varchar } from "drizzle-orm/pg-core";
import { createdAt, updatedAt } from "../schemaHelpers";
import { User } from "lucide-react";
import { JobInfoTable } from "./jobinfo";
import { relations } from "drizzle-orm";


// user table
export const UsersTable = pgTable("user",{
    id: varchar().primaryKey(),
    email: varchar().notNull().unique(),
    imageUrl: varchar().notNull(),
    name: varchar(),
    createdAt: createdAt,
    updatedAt: updatedAt,
})


export const userRelations = relations(UsersTable, ({ many }) => ({
    jobInfo: many(JobInfoTable)
}))