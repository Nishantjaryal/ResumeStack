import { auth } from "@clerk/nextjs/server"

type Permission = "unlimited_resume_reviews" | "Unlimited_Technical_Questions" | "Unlimited_interviews" | "single_resume_analysis" | "20_questions" | "Interview"


export async function hasPermission(permission: Permission){
    const { has } = await auth()
    return has({ feature: permission })
}