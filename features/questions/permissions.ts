import { db } from "@/drizzle/db";
import {  JobInfoTable, QuestionTable } from "@/drizzle/schema";
import { getCurrentUser } from "@/services/clerk/getCurrentUser";
import { hasAnyPermission } from "@/services/clerk/getPermissions";
import { count, eq } from "drizzle-orm";

const TECHNICAL_QUESTION_LIMIT = 20

const UNLIMITED_TECHNICAL_QUESTION_FEATURES = [
    "Unlimited_Technical_Questions",
    "unlimited_technical_questions",
] as const

const LIMITED_TECHNICAL_QUESTION_FEATURES = [
    "20_questions",
] as const

export async function canCreateQuestion(userId?: string){
    const res = await Promise.any([
        hasAnyPermission([...UNLIMITED_TECHNICAL_QUESTION_FEATURES])
        .then( bool => bool || Promise.reject("No permission")),

        Promise.all([hasAnyPermission([...LIMITED_TECHNICAL_QUESTION_FEATURES]), getUserQuestionCount(userId)]).then(([hasPermission,c])=>{
            if(hasPermission && c<TECHNICAL_QUESTION_LIMIT) return true
            return Promise.reject("No permission or already used")
        }),
        
    ]).catch(()=> false);
    return res;
}

async function getUserQuestionCount(userId?: string){
    const currentUserId = userId ?? (await getCurrentUser()).userId;
    if(!currentUserId) return 0;

    return getUserTechnicalQuestionCount(currentUserId);
}

async function getUserTechnicalQuestionCount(userId: string){
    const [{count:c}] = await db.select({count: count()})
    .from(QuestionTable)
    .innerJoin(JobInfoTable, eq(QuestionTable.jobInfoId, JobInfoTable.id))
    .where(eq(JobInfoTable.userId, userId))

    return c;
}