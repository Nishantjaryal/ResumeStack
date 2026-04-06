import { db } from "@/drizzle/db";
import {  JobInfoTable, QuestionTable } from "@/drizzle/schema";
import { getCurrentUser } from "@/services/clerk/getCurrentUser";
import { hasPermission } from "@/services/clerk/getPermissions";
import { count, eq } from "drizzle-orm";

export async function canCreateQuestion(){
    const res = await Promise.any([
        hasPermission("Unlimited_Technical_Questions")
        .then( bool => bool || Promise.reject("No permission")),

        Promise.all([hasPermission("20_questions"), getUserQuestionCount()]).then(([hasPermission,c])=>{
            if(hasPermission && c<5) return true
            return Promise.reject("No permission or already used")
        }),
        
    ]).catch(()=> false);
    return res;
}

async function getUserQuestionCount(){
    const { userId } = await getCurrentUser();
    if(!userId) return 0;

    return getUserTechnicalQuestionCount(userId);
}

async function getUserTechnicalQuestionCount(userId: string){
    const [{count:c}] = await db.select({count: count()})
    .from(QuestionTable)
    .innerJoin(JobInfoTable, eq(QuestionTable.jobInfoId, JobInfoTable.id))
    .where(eq(JobInfoTable.userId, userId))

    return c;
}