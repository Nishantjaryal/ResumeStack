import { auth } from "@clerk/nextjs/server"

type Permission =
  | "unlimited_resume_reviews"
  | "Unlimited_Technical_Questions"
  | "unlimited_technical_questions"
  | "Unlimited_interviews"
  | "unlimited_interviews"
  | "single_resume_analysis"
  | "20_questions"
  | "Interview"
  | "interview"


export async function hasPermission(permission: Permission){
    const { has } = await auth()
    return has({ feature: permission })
}

export async function hasAnyPermission(permissions: Permission[]) {
    for (const permission of permissions) {
        if (await hasPermission(permission)) return true
    }

    return false
}