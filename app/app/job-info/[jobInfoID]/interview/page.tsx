import BackLink from "@/components/BackLink";
import { db } from "@/drizzle/db";
import { InterviewTable } from "@/drizzle/schema";
import {  getInterviewsUserTag } from "@/features/interviews/dbcache";
import { getJobInfoIdTag } from "@/features/JobInfos/dbCache";
import { getCurrentUser } from "@/services/clerk/getCurrentUser";
import { and, desc, eq, isNotNull } from "drizzle-orm";
import { cacheTag } from "next/cache";
import { redirect } from "next/navigation";
import { Suspense } from "react";



const InterviewPage = async ({
  params,
}: {
  params: Promise<{ jobInfoID: string }>;
}) => {
  const { jobInfoID } = await params;

  return (
    <div className="flex flex-col justify-center items-center">
      <div className="w-full max-w-6xl">
        <BackLink takeTo={`/app/job-info/${jobInfoID}`} Text="Job Info" />
      </div>
      <Suspense
        fallback={
          <div className="h-48 w-full bg-gray-200 animate-pulse rounded-md"></div>
        }>
        <Suspendeddata jobinfoID={jobInfoID} />
      </Suspense>
    </div>
  );
};

async function Suspendeddata({ jobinfoID }: { jobinfoID: string }) {
  const { userId, redirectToSignIn } = await getCurrentUser();

  if (!userId) {
    redirectToSignIn();
    return null;
  }

  const InterViewInfo = await getInterviewInfo(jobinfoID, userId);

  if (!InterViewInfo || InterViewInfo.length === 0) {
    redirect(`/app/job-info/${jobinfoID}/interview/new`)
  }

  return (
    <div>
      <h1>{InterViewInfo.map(
        (interview)=>{
            return (
                <div>
                    {interview.humeChatId}
                </div>
            )
        }
      )}</h1>
    </div>
  );
}
export default InterviewPage;


async function getInterviewInfo(id: string, userId: string) {
  "use cache";
  cacheTag(getInterviewsUserTag(id));
  cacheTag(getJobInfoIdTag(id));

  const data = await db.query.InterviewTable.findMany({
    where: and(eq(InterviewTable.jobInfoId, id), isNotNull(InterviewTable.humeChatId)),
    with: {jobInfo: {columns:{userId:true}}},
    orderBy: desc(InterviewTable.updatedAt),
  });

  return data.filter(interview => interview.jobInfo.userId === userId)
}