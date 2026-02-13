import { pgEnum, pgTable, uuid, varchar } from "drizzle-orm/pg-core";
import { createdAt, id, updatedAt } from "../schemaHelpers";
import { relations } from "drizzle-orm";
import { JobInfoTable } from "./jobinfo";

// enum is used to restrict the experience level to only 3 values and also create a new enum type in postgres database for experience level column in job info table
export const questionDifficulties = ["easy", "medium", "hard"] as const;
export type QuestionDifficulty = (typeof questionDifficulties)[number];
export const questionDifficultyEnum = pgEnum(
  "question_difficulty",
  questionDifficulties,
);

export const QuestionTable = pgTable("questions", {
  id,
  jobInfoId: uuid()
    .references(() => JobInfoTable.id, { onDelete: "cascade" })
    .notNull(),
  text: varchar().notNull(),
  difficulty: questionDifficultyEnum().notNull(),
  createdAt,
  updatedAt,
});

export const questionRelations = relations(QuestionTable, ({ one, many }) => ({
  jobInfoId: one(JobInfoTable, {
    fields: [QuestionTable.jobInfoId],
    references: [JobInfoTable.id],
  }),
}));
