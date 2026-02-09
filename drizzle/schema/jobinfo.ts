import { pgEnum, pgTable,varchar } from "drizzle-orm/pg-core";
import { createdAt, id, updatedAt } from "../schemaHelpers";
import { UsersTable } from "../schema";
import { relations } from "drizzle-orm";
import { QuestionTable } from "./questions";
import { Inter } from "next/font/google";
import { InterviewTable } from "./interview";


export const experienceLevels = ["junior", "mid-level", "senior"] as const 
export type ExperienceLevel = typeof experienceLevels[number]
export const experienceLevelEnum = pgEnum("job_info_experience_level", experienceLevels)

export const JobInfoTable = pgTable("job_info", {
id,
jobTitle: varchar(),
name: varchar().notNull(),
experiencelevel: experienceLevelEnum().notNull(),
description: varchar().notNull(),
userId:varchar().references(()=>UsersTable.id, {onDelete:"cascade"}).notNull(),
createdAt,
updatedAt
})



export const jobInfoRelations = relations(JobInfoTable, ({ one,many }) => ({
    user: one(UsersTable, {
        fields: [JobInfoTable.userId],
        references: [UsersTable.id]
    }),

    questions: many(QuestionTable),
    interviews: many(InterviewTable),
}))

