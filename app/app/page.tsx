import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { db } from "@/drizzle/db";
import { JobInfoTable } from "@/drizzle/schema";
import Jobinfoform from "@/features/JobInfos/components/jobinfoform";
import { getJobInfosUserTag } from "@/features/JobInfos/dbCache";
import { getCurrentUser } from "@/services/clerk/getCurrentUser";
import { desc, eq } from "drizzle-orm";
import { Loader2Icon } from "lucide-react";
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

function truncateWords(str:string, numWords:number) {
  // Split the string into an array of words using space as a delimiter.
  // Using a regular expression (/\s+/) handles multiple consecutive spaces gracefully.
  const words:Array<string> = str.trim().split(/\s+/);
  
  // If the string has fewer words than the limit, return the original string.
  if (words.length <= numWords) {
    return str;
  }
  
  // Use slice() to get the first 'numWords' elements of the array.
  const truncatedWords = words.slice(0, numWords);
  
  // Join the selected words back into a single string with spaces.
  const truncatedString = truncatedWords.join(' ');
  
  // Optionally, add an ellipsis (...) to the end.
  return truncatedString + '...';
}

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
    <div className="flex h-full w-full flex-col gap-6">
      <section className="rounded-2xl border border-border bg-card/80 p-6 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Your workspace
            </p>
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Interview Environments
            </h2>
            <p className="text-sm text-muted-foreground sm:text-base">
              Keep each job organized with its own resume details, questions, and prep notes.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button asChild>
              <Link href="/app/job-info/new">Create Job Environment</Link>
            </Button>

          </div>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl border border-border bg-background px-4 py-3">
            <p className="text-xs font-medium text-muted-foreground">Active Environments</p>
            <p className="text-xl font-semibold text-foreground">{jobInfos.length}</p>
          </div>
          <div className="rounded-xl border border-border bg-background px-4 py-3">
            <p className="text-xs font-medium text-muted-foreground">Last Updated</p>
            <p className="text-xl font-semibold text-foreground">Recently</p>
          </div>
          <div className="rounded-xl border border-border bg-background px-4 py-3">
            <p className="text-xs font-medium text-muted-foreground">Interview Flow</p>
            <p className="text-xl font-semibold text-foreground">Structured</p>
          </div>
      
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {jobInfos.map((jobInfo) => (
          <Link
            href={`/app/job-info/${jobInfo.id}`}
            key={jobInfo.id}
            className="group"
          >
            <div className="flex h-full flex-col justify-between rounded-2xl border border-border bg-card p-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
              <div className="space-y-3">
                <div className="inline-flex w-fit items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  {jobInfo.experiencelevel}
                </div>
                <h3 className="text-lg font-semibold text-foreground">
                  {jobInfo.jobTitle}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {truncateWords(jobInfo.description, 16)}
                </p>
              </div>
              <div className="mt-4 flex items-center justify-between text-xs font-medium text-muted-foreground">
                <span>{jobInfo.name}</span>
                <span>Open</span>
              </div>
            </div>
          </Link>
        ))}
      </section>
    </div>
  );
}

function NoJobInfos() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Welcome to ResumeStack
        </h1>
        <p className="text-sm text-muted-foreground sm:text-base">
          Set up your first interview environment to start tracking roles.
        </p>
      </div>
      <Card className="w-full max-w-xl border-dashed border-border bg-card/60 text-muted-foreground">
        <CardContent className="flex flex-col gap-4 p-6">
          <h3 className="text-lg font-semibold text-foreground">
            Create your first interview environment
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
