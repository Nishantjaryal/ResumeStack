import { getCurrentUser } from "@/services/clerk/getCurrentUser";
import { redirect } from "next/navigation";
import { OnboardingClient } from "./_client";

export default async function Onboarding() {
    const {userId,user} = await getCurrentUser({ alldata:true});

    if(userId == null) return redirect('/')// if user is not logged in redirect to home page
    if(user!= null) return redirect('/app') // if user is already in database redirect to home page

    return <div className="container flex flex-col items-center justify-center h-full gap-4">

        <h1 className="text-2xl font-bold">Welcome to the app!</h1>
        <p className="text-center text-muted-foreground">We just need a few more details to get you started.</p>
        <OnboardingClient userId={userId} />

    </div>
}