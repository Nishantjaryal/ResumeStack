import { db } from "@/drizzle/db";
import { JobInfoTable } from "@/drizzle/schema";
import { getJobInfoIdTag } from "@/features/JobInfos/dbCache";
import { canCreateQuestion } from "@/features/questions/permissions";
import { getCurrentUser } from "@/services/clerk/getCurrentUser";
import { and, eq } from "drizzle-orm";
import { Loader2Icon } from "lucide-react";
import { cacheTag } from "next/cache";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import NewQuestionClientPage from "./_NewQuestion";

const QuestionsPage = async ({
  params,
}: {
  params: Promise<{ jobInfoID: string }>;
}) => {
  const { jobInfoID } = await params;

  return (
    <Suspense
      fallback={
        <Loader2Icon className="animate-spin h-6 w-6 text-muted-foreground" />
      }
    >
      <SuspendedComponent jobInfoID={jobInfoID} />

    </Suspense>
  );
};

async function SuspendedComponent({ jobInfoID }: { jobInfoID: string }) {

    const { userId, redirectToSignIn } = await getCurrentUser();

    if (!userId) {
      redirectToSignIn();
      return null;
    }

    if (!await canCreateQuestion()) return redirect("/app/upgrade");

    const jobInfo  = await getJobInfo(jobInfoID, userId);
    if(jobInfo == null) return notFound();


    return <NewQuestionClientPage jobinfo={jobInfo} />
}

async function getJobInfo(id: string, userId: string) {
  "use cache";
  cacheTag(getJobInfoIdTag(id));

  return db.query.JobInfoTable.findFirst({
    where: and(eq(JobInfoTable.id, id), eq(JobInfoTable.userId, userId)),
  });
}

export default QuestionsPage;
