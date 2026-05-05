import { db } from "@/drizzle/db";
import { InterviewTable, JobInfoTable } from "@/drizzle/schema";
import { getCurrentUser } from "@/services/clerk/getCurrentUser";
import { hasPermission } from "@/services/clerk/hasPermissions";
import { and, count, eq, isNotNull } from "drizzle-orm";

export async function canCreateInterview(){
    const res = await Promise.any([
        hasPermission("Unlimited_interviews")
        .then( bool => bool || Promise.reject("No permission")),

        Promise.all([hasPermission("Interview"), getUserInterviewCount()]).then(([hasPermission,c])=>{
            if(hasPermission && c<1) return true
            return Promise.reject("No permission or already used")
        }),
        
    ]).catch(()=> false);
    return res;
}

async function getUserInterviewCount(){
    const { userId } = await getCurrentUser();
    if(!userId) return 0;

    return getInterviewCount(userId);
}

async function getInterviewCount(userId: string){
    const [{count:c}] = await db.select({count: count()})
    .from(InterviewTable)
    .innerJoin(JobInfoTable, eq(InterviewTable.jobInfoId, JobInfoTable.id))
    .where(and(eq(JobInfoTable.userId, userId), isNotNull(InterviewTable.humeChatId)))

    return c;
}