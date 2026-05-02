import BackLink from "@/components/BackLink2";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/drizzle/db";
import { InterviewTable } from "@/drizzle/schema";
import {  getInterviewsUserTag } from "@/features/interviews/dbcache";
import { getJobInfoIdTag } from "@/features/JobInfos/dbCache";
import { getCurrentUser } from "@/services/clerk/getCurrentUser";
import { and, desc, eq, isNotNull } from "drizzle-orm";
import { cacheTag } from "next/cache";
import Link from "next/link";
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

  return (
    <div className="w-full max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Interviews</h1>
        <Button asChild>
          <Link href={`/app/job-info/${jobinfoID}/interview/new`}>New Interview</Link>
        </Button>
      </div>

      {InterViewInfo.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            No interviews yet. Create your first interview.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {InterViewInfo.map((interview) => (
            <Link
              key={interview.id}
              href={`/app/job-info/${jobinfoID}/interview/${interview.id}`}
              className="block"
            >
              <Card className="h-full transition-colors hover:bg-muted/50">
                <CardHeader>
                  <CardTitle className="text-base">Interview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1 text-sm text-muted-foreground">
                  <p>Duration: {interview.duration}</p>
                  <p>Chat ID: {interview.humeChatId ?? "N/A"}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
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