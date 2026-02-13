import { pgTable, uuid, varchar } from "drizzle-orm/pg-core";
import { createdAt, id, updatedAt } from "../schemaHelpers";
import { JobInfoTable } from "./jobinfo";
import { relations } from "drizzle-orm";

export const InterviewTable = pgTable("interview", {
  id,
  jobInfoId: uuid()
    .references(() => JobInfoTable.id, { onDelete: "cascade" })
    .notNull(),
  duration: varchar().notNull(),
  humeChatId: varchar(),
  createdAt,
  feedback: varchar(),
  updatedAt,
});

export const interviewRelations = relations(InterviewTable, ({ one }) => ({
  jobInfo: one(JobInfoTable, {
    fields: [InterviewTable.jobInfoId],
    references: [JobInfoTable.id],
  }),
}));
