"use server";

import { getCurrentUser } from "@/services/clerk/getCurrentUser";
import { cacheTag } from "next/cache";
import { getJobInfoIdTag } from "../JobInfos/dbCache";
import { db } from "@/drizzle/db";
import { and, eq } from "drizzle-orm";
import { JobInfoTable } from "@/drizzle/schema/jobinfo";
import { insertInterview, updateInterviewDB } from "./db";
import { getInterviewIdTag } from "./dbcache";
import { InterviewTable } from "@/drizzle/schema";
import { canCreateInterview } from "./permissions";
import arcjet, { request, tokenBucket } from "@arcjet/next";
import { env } from "@/data/env/server";
import { generateAiInterviewFeedback } from "@/services/ai/interviews";

const aj = arcjet({
  characteristics: ["userId"],
  key : env.ARCJET_KEY,
  rules: [
    tokenBucket({
      capacity: 20,
      refillRate: 5, 
      interval: "1d",
      mode : "LIVE"
    })
  ],
})

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

  if(!await canCreateInterview()) {
    return {
      error: true,
      message: "You have reached the limit of interviews you can create. Please upgrade your plan to create more interviews.",
    };
  }
  // Rate Limiting

  const decision = await aj.protect(await request(),{
    userId,
    requested: 1,
  })
  if(decision.isDenied()){
    return{
      error: true,
      message: "Rate limit exceeded. Please try again later.",
    }
  }

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
          description: true,
          experiencelevel: true,
          jobTitle: true,
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


export async function generateInterViewFeedback(interviewId: string) {
   const { userId,user } = await getCurrentUser({alldata: true});

  if (!userId || !user) {
    return {
      error: true,
      message: "Unauthorized: you must be signed in to update an interview",
    };
  }

  const interview = await getInterview(interviewId, userId);
  if (!interview) {
    return {
      error: true,
      message: "Interview not found or you don't have access to it",
    };
  }


  const feedback = await generateAiInterviewFeedback({
    humeChatId: interview.humeChatId!,
    jobInfo: interview.jobInfo,
    userName: user.name
  })

  if(feedback == null){
    return{
      error: true,
      message: "Failed to generate feedback. Please try again later.",
    }
  }

  if (typeof feedback !== "string") {
    return {
      error: true,
      message: feedback.message,
    };
  }

  await updateInterviewDB(interviewId, { feedback });

  return {
    error: false,
    message: "Feedback generated successfully",
  }
}