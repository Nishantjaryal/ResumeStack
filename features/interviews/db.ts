import { InterviewTable } from "@/drizzle/schema";
import { db } from "@/drizzle/db";
import { reValidateInterviewCache } from "./dbcache";
import { eq } from "drizzle-orm";

export async function insertInterview(
  InterviewData: typeof InterviewTable.$inferInsert,
) {
  const [result] = await db
    .insert(InterviewTable)
    .values(InterviewData)
    .returning({
      id: InterviewTable.id,
      jobInfoId: InterviewTable.jobInfoId,
    });

  reValidateInterviewCache(result);

  return result;
}


export async function updateInterviewDB(
    id: string,
  InterviewData: Partial<typeof InterviewTable.$inferInsert>,
) {
  const [result] = await db
    .update(InterviewTable)
    .set(InterviewData)
    .where(eq(InterviewTable.id, id))
    .returning({
      id: InterviewTable.id,
      jobInfoId: InterviewTable.jobInfoId,
    });

  reValidateInterviewCache(result);

  return result;
}