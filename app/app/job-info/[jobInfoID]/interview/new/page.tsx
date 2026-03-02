import { db } from "@/drizzle/db";
import { JobInfoTable } from "@/drizzle/schema";
import { getJobInfoIdTag } from "@/features/JobInfos/dbCache";
import { getCurrentUser } from "@/services/clerk/getCurrentUser";
import { and, eq } from "drizzle-orm";
import { cacheTag } from "next/cache";
import { fetchAccessToken } from "hume";
import { env } from "@/data/env/server";
import { VoiceProvider } from "@humeai/voice-react";
import StartCall from "./_startCall";

const CreateInterview = async ({
  params,
}: {
  params: Promise<{ jobInfoID: string }>;
}) => {
  const { jobInfoID } = await params;

  const { userId, redirectToSignIn, user } = await getCurrentUser({
    alldata: true,
  });

  if (!userId || !user) {
    redirectToSignIn();
    return null;
  }

  const jobInfo = await getJobInfo(jobInfoID, userId);

  if (!jobInfo) {
    return null;
  }

  
  const accessToken = await fetchAccessToken({
    apiKey: String(env.HUME_API_KEY),
    secretKey: String(env.HUME_SECRET_KEY),
  });


  return <VoiceProvider>
      <StartCall accessToken={accessToken} jobInfo={jobInfo} user={user} />
  </VoiceProvider>
};

async function getJobInfo(id: string, userId: string) {
  "use cache";
  cacheTag(getJobInfoIdTag(id));

  return db.query.JobInfoTable.findFirst({
    where: and(eq(JobInfoTable.id, id), eq(JobInfoTable.userId, userId)),
  });
}

export default CreateInterview;
