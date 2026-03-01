import BackLink from "@/components/BackLink";
import { Card, CardContent } from "@/components/ui/card";
import Jobinfoform from "@/features/JobInfos/components/jobinfoform";

const NewJobInfoPage = () => {
  return (
    <div className="flex flex-col justify-center items-center">
      <div className="w-full max-w-6xl">
        <BackLink takeTo="/app" Text="App" />
      </div>

      <div className="w-full max-w-6xl">
        <h1 className="text-3xl font-bold ">Create New Job Environment</h1>
        <p className="text-gray-600 mb-6 ">
          Fill in the details below to create a new job environment.
        </p>
        <Card>
          <CardContent>
            <Jobinfoform />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NewJobInfoPage;
