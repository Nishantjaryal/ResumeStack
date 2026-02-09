import { pgTable, varchar } from "drizzle-orm/pg-core";
import { createdAt, id, updatedAt } from "../schemaHelpers";
import { UsersTable } from "./users";
import { JobInfoTable } from "./jobinfo";


export const InterviewTable = pgTable("interview", {
    id,
    jobInfoId: varchar().references(() => JobInfoTable.id, { onDelete: "cascade" }).notNull(),
    duration: varchar().notNull(),
    humeChatId: varchar().notNull(),
    createdAt,
    updatedAt
})