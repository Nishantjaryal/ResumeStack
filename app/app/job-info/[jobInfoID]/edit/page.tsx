import BackLink from "@/components/BackLink";
import { Card, CardContent } from "@/components/ui/card";
import { db } from "@/drizzle/db";
import { JobInfoTable } from "@/drizzle/schema";
import Jobinfoform from "@/features/JobInfos/components/jobinfoform";
import { getJobInfoIdTag } from "@/features/JobInfos/dbCache";
import { getCurrentUser } from "@/services/clerk/getCurrentUser";
import { and, eq } from "drizzle-orm";
import { cacheTag } from "next/cache";
import { notFound } from "next/navigation";
import { Suspense } from "react";

async function getJobInfo(id: string, userId: string) {
  "use cache";
  cacheTag(getJobInfoIdTag(id));

  return db.query.JobInfoTable.findFirst({
    where: and(eq(JobInfoTable.id, id), eq(JobInfoTable.userId, userId)),
  });
}

const NewJobInfoPage = async ({
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

      <div className="w-full max-w-6xl">
        <h1 className="text-3xl font-bold ">Edit Job Environment</h1>
        <p className="text-gray-600 mb-6 ">
          Fill in the details below to update this job environment.
        </p>
        <Card>
          <CardContent>
            <Suspense
              fallback={
                <div className="h-48 w-full bg-gray-200 animate-pulse rounded-md"></div>
              }
            >
              <SuspendedJobInfoForm jobinfoID={jobInfoID} />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

async function SuspendedJobInfoForm({ jobinfoID }: { jobinfoID: string }) {
  const { userId, redirectToSignIn } = await getCurrentUser();

  if (!userId) {
    redirectToSignIn();
    return null;
  }

  const jobInfo = await getJobInfo(jobinfoID, userId);

  if (!jobInfo) {
    notFound();
  }

  const payload = {
    id: jobInfo.id,
    name: jobInfo.name,
    title: jobInfo.jobTitle,
    experienceLevel: jobInfo.experiencelevel,
    description: jobInfo.description,
  };

  return <Jobinfoform jobinfo={payload} />;
}

export default NewJobInfoPage;
