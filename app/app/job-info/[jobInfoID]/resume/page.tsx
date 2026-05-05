import { canRunResumeAnalysis } from "@/features/resumeAnalyses/permissions"
import { Loader2Icon } from "lucide-react"
import { redirect } from "next/navigation"
import { Suspense } from "react"
import { ResumePageClient } from "./_client"
import BackLink from "@/components/BackLink2"

export default async function ResumePage({
  params,
}: {
  params: Promise<{ jobInfoID: string }>
}) {
  const { jobInfoID } = await params

  return (
    <div className="container py-4 space-y-4 h-screen-header flex flex-col items-start">
      <BackLink takeTo={`/app/job-info/${jobInfoID}`} Text="Job Info" />
      <Suspense
        fallback={<Loader2Icon className="animate-spin size-24 m-auto" />}
      >
        <SuspendedComponent jobInfoId={jobInfoID} />
      </Suspense>
    </div>
  )
}

async function SuspendedComponent({ jobInfoId }: { jobInfoId: string }) {
  if (!(await canRunResumeAnalysis())) return redirect("/app/upgrade")

  return <ResumePageClient jobInfoId={jobInfoId} />
}
