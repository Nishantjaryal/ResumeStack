import { pgEnum, pgTable, uuid, varchar } from "drizzle-orm/pg-core";
import { createdAt, id, updatedAt } from "../schemaHelpers";
import { relations } from "drizzle-orm";
import { JobInfoTable } from "./jobinfo";

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
  feedback: varchar(),
  updatedAt,
});

export const questionRelations = relations(QuestionTable, ( {one,many} )=>({
    jobInfoId: one(JobInfoTable, {
        fields: [QuestionTable.jobInfoId],
        references: [JobInfoTable.id]
    })
}))
