import { pgEnum, pgTable, varchar } from "drizzle-orm/pg-core";
import { createdAt, id, updatedAt } from "../schemaHelpers";
import { UsersTable } from "../schema";
import { relations } from "drizzle-orm";
import { QuestionTable } from "./questions";
import { InterviewTable } from "./interview";

// enum is used to restrict the experience level to only 3 values and also create a new enum type in postgres database for experience level column in job info table
export const experienceLevels = ["junior", "mid-level", "senior"] as const;
export type ExperienceLevel = (typeof experienceLevels)[number];
export const experienceLevelEnum = pgEnum(
  "job_info_experience_level",
  experienceLevels,
);

export const JobInfoTable = pgTable("job_info", {
  id,
  jobTitle: varchar(),
  name: varchar().notNull(),
  experiencelevel: experienceLevelEnum().notNull(),
  description: varchar().notNull(),
  userId: varchar() // defining relation between jobs and users, "cascade" means if the user deletes then all the jobs related will also be deleted 
    .references(() => UsersTable.id, { onDelete: "cascade" })
    .notNull(),
  createdAt,
  updatedAt,
});

// specifying that job belongs to single user
export const jobInfoRelations = relations(JobInfoTable, ({ one, many }) => ({
  user: one(UsersTable, {
    fields: [JobInfoTable.userId],
    references: [UsersTable.id],
  }),

  // job can have many relations with questions and interviews
  questions: many(QuestionTable),
  interviews: many(InterviewTable),
}));
