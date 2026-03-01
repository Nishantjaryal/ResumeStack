import { db } from "@/drizzle/db";
import { JobInfoTable } from "@/drizzle/schema";
import { reValidateJobInfoCache } from "./dbCache";
import { eq } from "drizzle-orm";

export async function insertJobInfo(jobinfo: typeof JobInfoTable.$inferInsert) {
    const [newJobInfo] = await db.insert(JobInfoTable).values(jobinfo)
    .returning({
        id: JobInfoTable.id,
        userId: JobInfoTable.userId,
    }) // Return the inserted record with the generated ID


    reValidateJobInfoCache(newJobInfo)

    return newJobInfo
}
export async function UpdateJobInfo({id, jobinfo}: {id: string, jobinfo: Partial<typeof JobInfoTable.$inferInsert>}) {
    const [UpdateJobInfo] = await db.update(JobInfoTable).set(jobinfo).where(eq (JobInfoTable.id, id))
    .returning({
        id: JobInfoTable.id,
        userId: JobInfoTable.userId,
    }) // Return the inserted record with the generated ID

    if (UpdateJobInfo) {
        reValidateJobInfoCache(UpdateJobInfo)
    }

    return UpdateJobInfo
}