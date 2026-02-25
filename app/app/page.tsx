import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { db } from "@/drizzle/db";
import { JobInfoTable } from "@/drizzle/schema";
import Jobinfoform from "@/features/JobInfos/components/jobinfoform";
import { getJobInfosUserTag } from "@/features/JobInfos/dbCache";
import { getCurrentUser } from "@/services/clerk/getCurrentUser";
import { desc, eq } from "drizzle-orm";
import { Loader2Icon, RefreshCcwIcon } from "lucide-react";
import { cacheTag } from "next/cache";
import Link from "next/link";
import { Suspense } from "react";

const App = () => {
  return (
    <Suspense
      fallback={
        <Loader2Icon className="flex animate-spin h-full items-center justify-center" />
      }
    >
      <JobInfo />
    </Suspense>
  );
};

async function JobInfo() {
  const { userId, redirectToSignIn } = await getCurrentUser();

  if (!userId) {
    redirectToSignIn();
    return null;
  }

  const jobInfos = await getJobInfos(userId);

  if (jobInfos.length === 0) {
    return <NoJobInfos />;
  }

  return (
    <div className="w-full h-full">
      <div className="w-full flex items-center justify-between">
        <h2 className="text-xl font-semibold">Interview Environments</h2>

        <Button asChild>
          <Link href="/app/job-info/new">Create Job Environment</Link>
        </Button>
      </div>
      <div className="w-full grid grid-cols-1 max-[500px]:grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-6">
        {jobInfos.map((jobInfo) => (
          <div className="h-[150px] p-2 sm:h-[200px] rounded-lg bg-primary/10">
            <div className="h-[150px] p-2  rounded-lg bg-orange-500/20">
              <h1 className="text-lg text-white font-bold">
                {jobInfo.jobTitle}
              </h1>
              <h3 className="text-white text-sm">{jobInfo.description}</h3>
              <h3 className="text-white text-sm">{jobInfo.experiencelevel}</h3>
            </div>
            <p className=" text-xs mt-2">
              {jobInfo.name} - {jobInfo.jobTitle} - {jobInfo.experiencelevel}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function NoJobInfos() {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <h1 className="text-4xl font-bold mb-4">Welcome to ResumeStack</h1>
      <p className="text-md">Set up your first Interview Environment</p>
      <Card className="  flex my-6 items-center justify-center border-dashed border-2 border-gray-300 text-gray-500">
        <CardContent>
          <h3 className="mb-4 text-lg font-semibold">
            Create your first Interview Environment
          </h3>
          <Jobinfoform />
        </CardContent>
      </Card>
    </div>
  );
}

async function getJobInfos(userId: string) {
  "use cache";
  cacheTag(getJobInfosUserTag(userId));

  return db.query.JobInfoTable.findMany({
    where: eq(JobInfoTable.userId, userId),
    orderBy: desc(JobInfoTable.updatedAt),
  });
}

export default App;
