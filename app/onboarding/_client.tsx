"use client"

import { getUser } from "@/features/users/actions"
import { Loader2Icon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

interface OnboardingClientProps {
    userId: string
}

// obeying latest practices for writing cleaner code
// export function OnboardingClient({userId}: {userId: string}){

export function OnboardingClient({userId}: OnboardingClientProps){


    const router = useRouter()

    // fast poling database, optimised with client level caching
    useEffect(()=>{
        const intervalId = setInterval(async()=>{
            const user = await getUser(userId)
            if (user==null) {
                console.log("User not found in database.")
                return
            }

            router.replace('/app') 
            clearInterval(intervalId) // clear the interval when user is found in database

        }, 250)

        return () => clearInterval(intervalId) // cleanup function to clear interval on component unmount

    },[ userId ]) // dependency array with userId to trigger effect when userId changes


    return <Loader2Icon className="animate-spin" size={24} />
}