import { hasPermission } from "@/services/clerk/hasPermissions";

export async function canRunResumeAnalysis() {
  return hasPermission("unlimited_resume_reviews")
}
