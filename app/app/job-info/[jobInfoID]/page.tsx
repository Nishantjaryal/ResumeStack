import BackLink from "@/components/BackLink";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { db } from "@/drizzle/db";
import { JobInfoTable } from "@/drizzle/schema";
import { getJobInfoIdTag } from "@/features/JobInfos/dbCache";
import { getCurrentUser } from "@/services/clerk/getCurrentUser";
import { and, eq } from "drizzle-orm";
import { cacheTag } from "next/cache";
import Link from "next/link";
import { notFound } from "next/navigation";

const JobInfoPage = async ({
  params,
}: {
  params: Promise<{ jobInfoID: string }>;
}) => {
  const { jobInfoID } = await params;
  const { userId, redirectToSignIn } = await getCurrentUser();

  if (!userId) {
    redirectToSignIn();
    return null;
  }

  const jobInfo = await getJobInfo(jobInfoID, userId);

  if (!jobInfo) {
    notFound();
  }

  const jobInfoOptions = [
    {
      title: "Technical Question",
      description: "Practice role-based technical questions tailored to this job.",
      href: `/app/job-info/${jobInfoID}/question`,
    },
    {
      title: "Interview",
      description: "Run mock interview sessions for this exact role setup.",
      href: `/app/job-info/${jobInfoID}/interview`,
    },
    {
      title: "Resume",
      description: "Generate and refine resume points aligned to this role.",
      href: `/app/job-info/${jobInfoID}/resume`,
    },
    {
      title: "Edit Job Description",
      description: "Update role details and requirements for this environment.",
      href: `/app/job-info/${jobInfoID}/edit`,
    },
  ];

  return (
    <div className="flex flex-col items-center">
      <div className="w-full max-w-6xl">
        <BackLink takeTo="/app" Text="App" />

        <header className="mb-6">
          <Card className="border-none shadow-none">
            <CardHeader>
              <CardTitle className="text-2xl">{jobInfo.jobTitle}</CardTitle>
              <CardDescription>
                {jobInfo.name} • {jobInfo.experiencelevel}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{jobInfo.description}</p>
            </CardContent>
          </Card>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {jobInfoOptions.map((option) => (
            <Link key={option.href} href={option.href}>
              <Card className="h-full hover:bg-accent/40 transition-colors">
                <CardHeader>
                  <CardTitle className="text-lg">{option.title}</CardTitle>
                  <CardDescription>{option.description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

async function getJobInfo(id: string, userId: string) {
  "use cache";
  cacheTag(getJobInfoIdTag(id));

  return db.query.JobInfoTable.findFirst({
    where: and(eq(JobInfoTable.id, id), eq(JobInfoTable.userId, userId)),
  });
}

export default JobInfoPage;