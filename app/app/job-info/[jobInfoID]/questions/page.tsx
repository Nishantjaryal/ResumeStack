import { getCurrentUser } from "@/services/clerk/getCurrentUser";
import { Loader2Icon } from "lucide-react";
import { redirect } from "next/navigation";
import { Suspense } from "react";

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



    return (
        <div>Null</div>
    )
}

export default QuestionsPage;
