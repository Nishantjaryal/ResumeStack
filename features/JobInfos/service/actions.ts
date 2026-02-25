"use server";

import z from "zod";
import { jobInfoFormSchema } from "../schema";
import { getCurrentUser } from "@/services/clerk/getCurrentUser";
import { redirect } from "next/navigation";
import { insertJobInfo, UpdateJobInfo as UpdatejobinfoDB } from "../db";
import { and, eq } from "drizzle-orm";
import { JobInfoTable } from "@/drizzle/schema";
import { db } from "@/drizzle/db";
import { getJobInfoIdTag } from "../dbCache";
import { cacheTag } from "next/cache";

export async function createJobinfo(
  unsafeData: z.infer<typeof jobInfoFormSchema>,
) {
  // Create a new job info record in the database using the validated data
  const { userId } = await getCurrentUser();

  if (!userId) {
    return {
      error: true,
      message: "Permission denied",
    };
  }

  const { success, data } = jobInfoFormSchema.safeParse(unsafeData);

  if (!success) {
    return {
      error: true,
      message: "Invalid data",
    };
  }

  const { title, experienceLevel, ...rest } = data;
  const newJobInfo = await insertJobInfo({
    userId,
    ...rest,
    jobTitle: title,
    experiencelevel: experienceLevel,
  });

  redirect(`/app/job-info/${newJobInfo.id}`);
}
export async function updateJobinfo(
  id: string,
  unsafeData: z.infer<typeof jobInfoFormSchema>,
) {
  // Create a new job info record in the database using the validated data
  const { userId } = await getCurrentUser();

  if (!userId) {
    throw new Error("You don't have permission to perform this action");
  }

  const { success, data } = jobInfoFormSchema.safeParse(unsafeData);

  if (!success) {
    throw new Error("Invalid data");
  }

  const { title, experienceLevel, ...rest } = data;
  const jobInfo = await UpdatejobinfoDB({
    id,
    jobinfo: {
      userId,
      ...rest,
      jobTitle: title,
      experiencelevel: experienceLevel,
    },
  });

  if (!jobInfo) {
    throw new Error("Not found any job with id: " + id);
  }

  redirect(`/app/job-info/${jobInfo.id}`);
}

async function getJobInfo(id: string, userId: string) {
  "use cache";
  cacheTag(getJobInfoIdTag(id));

  const jobInfos = await db.query.JobInfoTable.findFirst({
    where: and(eq(JobInfoTable.id, id), eq(JobInfoTable.userId, userId)),
    with: {
      user: true,
    },
  });

  return jobInfos;
}
