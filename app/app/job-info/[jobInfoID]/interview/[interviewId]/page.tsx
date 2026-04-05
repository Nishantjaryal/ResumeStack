import BackLink from "@/components/BackLink";
import { ActionButton } from "@/components/ui/action-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/drizzle/db";
import { InterviewTable } from "@/drizzle/schema";
import { generateInterViewFeedback } from "@/features/interviews/action";
import { getInterviewIdTag } from "@/features/interviews/dbcache";
import { getJobInfoIdTag } from "@/features/JobInfos/dbCache";
import { getCurrentUser } from "@/services/clerk/getCurrentUser";
import CondencedMessages from "@/services/hume/components/condencedMessages";
import { condencedChatMessages } from "@/services/hume/lib/condensedChatMessages";
import { fetchChatMessages } from "@/services/hume/lib/fetchChatMessages";
import { and, eq } from "drizzle-orm";
import { cacheTag } from "next/cache";
import { notFound } from "next/navigation";

const InterviewPage = async ({
  params,
}: {
  params: Promise<{ jobInfoID: string; interviewId: string }>;
}) => {
  const { jobInfoID, interviewId } = await params;
  const { userId, redirectToSignIn } = await getCurrentUser();

  if (!userId) {
    redirectToSignIn();
    return null;
  }

  const interview = await getInterviewInfo(interviewId, jobInfoID, userId);

  if (!interview) {
    return notFound();
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <BackLink takeTo={`/app/job-info/${jobInfoID}/interview`} Text="Interviews" />

      <div>
        <h1 className="text-2xl font-semibold">Interview Details</h1>
        <p className="text-sm text-muted-foreground">Review your interview session information.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Duration</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">{interview.duration || "N/A"}</CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Hume Chat ID</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground break-all">
            {interview.humeChatId || "N/A"}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Created</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {interview.createdAt ? new Date(interview.createdAt).toLocaleString() : "N/A"}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Last Updated</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {interview.updatedAt ? new Date(interview.updatedAt).toLocaleString() : "N/A"}
          </CardContent>
        </Card>
      </div>



      <Card>
        <CardHeader>
          <CardTitle className="text-base">Feedback</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground whitespace-pre-wrap">
          {interview.feedback ? interview.feedback : <ActionButton action={generateInterViewFeedback.bind(null, interview.id)} >Generate Feedback</ActionButton>}
          {/* {`${console.log(interview.feedback)}`} */}  
          {/* info should be displayed here after updating, can be just dev err */}
        </CardContent>
      </Card>


      <Card>
        <CardHeader>
          <CardTitle className="text-base">Chat</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground whitespace-pre-wrap">
          <Messages interview={interview} />
        </CardContent>
      </Card>
    </div>
  );
};


async function Messages({ interview }: { interview: { humeChatId: string | null } }) {
  const {user, redirectToSignIn} = await getCurrentUser({alldata: true});
  if(!user) {
    redirectToSignIn();
    return null;
  }
  const {humeChatId} = interview;

  if(!humeChatId) {
    return notFound();
  }

  return <CondencedMessages messages={condencedChatMessages(await fetchChatMessages(humeChatId))} user={user} maxFft={0} />;

}


async function getInterviewInfo(interviewId: string, jobInfoID: string, userId: string) {
  "use cache";
  cacheTag(getInterviewIdTag(interviewId));
  cacheTag(getJobInfoIdTag(jobInfoID));

  const interview = await db.query.InterviewTable.findFirst({
    where: and(eq(InterviewTable.id, interviewId), eq(InterviewTable.jobInfoId, jobInfoID)),
    with: { jobInfo: { columns: { userId: true } } },
  });

  if (!interview) {
    return null;
  }

  if (interview.jobInfo.userId !== userId) {
    return null;
  }

  return interview;
}


export default InterviewPage;