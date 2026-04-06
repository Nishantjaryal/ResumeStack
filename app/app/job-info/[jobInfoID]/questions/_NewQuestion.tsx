import BackLink from "@/components/BackLink";
import { JobInfoTable } from "@/drizzle/schema";

const NewQuestionClientPage = ({ jobinfo }: { jobinfo: Pick<typeof JobInfoTable.$inferSelect, 'id' | 'name' | 'jobTitle' | 'description'> }) => {
  return (
    <div>
        <BackLink takeTo={`/app/job-info/${jobinfo.id}/interview`} Text="Interviews" />
        <Controls/>
    </div>
  );
}

function Controls(){
    return (
        <div>Controls</div>
    );
}

export default NewQuestionClientPage