import { db } from "@/drizzle/db";
import { JobInfoTable } from "@/drizzle/schema";
import { getJobInfoIdTag } from "@/features/JobInfos/dbCache";
import { getCurrentUser } from "@/services/clerk/getCurrentUser";
import { and, eq } from "drizzle-orm";
import { cacheTag } from "next/cache";

const CreateInterview = async ({
  params,
}: {
  params: Promise<{ jobInfoID: string }>;
}) => {

    const { jobInfoID } = await params;



    const { userId, redirectToSignIn, user } = await getCurrentUser({alldata: true});
    
      if (!userId || user===null) {
        redirectToSignIn();
        return null;
      }


    const jobInfo = await getJobInfo(jobInfoID, userId);
    


  return (
    <div>CreateInterview</div>
  )
}

async function getJobInfo(id: string, userId: string) {
  "use cache";
  cacheTag(getJobInfoIdTag(id));

  return db.query.JobInfoTable.findFirst({
    where: and(eq(JobInfoTable.id, id), eq(JobInfoTable.userId, userId)),
  });
}

export default CreateInterview  