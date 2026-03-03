"use server";

import { getCurrentUser } from "@/services/clerk/getCurrentUser";
import { cacheTag } from "next/cache";
import { getJobInfoIdTag } from "../JobInfos/dbCache";
import { db } from "@/drizzle/db";
import { and, eq } from "drizzle-orm";
import { JobInfoTable } from "@/drizzle/schema/jobinfo";
import { insertInterview, updateInterviewDB } from "./db";
import { getInterviewIdTag, getInterviewsGlobalTag } from "./dbcache";
import { duration } from "drizzle-orm/gel-core";
import { InterviewTable } from "@/drizzle/schema";
import { use } from "react";

export async function CreateInterview({
  jobInfoId,
}: {
  jobInfoId: string;
}): Promise<
  | {
      error: true;
      message: string;
    }
  | {
      error: false;
      interviewId: string;
    }
> {
  const { userId } = await getCurrentUser();

  if (!userId) {
    return {
      error: true,
      message: "Unauthorized: you must be signed in to create an interview",
    };
  }

  // check Permissions
  // Rate Limiting

  // jobInfoId validation
  const jobInfo = await getJobInfo(jobInfoId, userId);
  if (!jobInfo) {
    return {
      error: true,
      message: "Job Info not found or you don't have access to it",
    };
  }
  // Create Interview in DB

  const interview = await insertInterview({
    jobInfoId,
    duration: "00:00:00",
  });

  return {
    error: false,
    interviewId: interview.id,
  };
}

export async function updateInterview(
  id: string,
  data: {
    humeChatId?: string;
    duration?: string;
  },
) {
  const { userId } = await getCurrentUser();

  if (!userId) {
    return {
      error: true,
      message: "Unauthorized: you must be signed in to update an interview",
    };
  }

  const interview = await getInterview(id, userId);
  if (!interview) {
    return {
      error: true,
      message: "Interview not found or you don't have access to it",
    };
  }

  await updateInterviewDB(id, data);
}

async function getJobInfo(id: string, userId: string) {
  "use cache";
  cacheTag(getJobInfoIdTag(id));

  return db.query.JobInfoTable.findFirst({
    where: and(eq(JobInfoTable.id, id), eq(JobInfoTable.userId, userId)),
  });
}

async function getInterview(id: string, userId: string) {
  "use cache";
  cacheTag(getInterviewIdTag(id));

  const result = await db.query.InterviewTable.findFirst({
    where: eq(InterviewTable.id, id),
    with: {
      jobInfo: {
        columns: {
          id: true,
          userId: true,
        },
      },
    },
  });

  if (result == null) return null
  cacheTag(getJobInfoIdTag(result.jobInfo.id)  )

  if (result.jobInfo.userId !== userId) {
    return null;
  } 

  return result;

}
