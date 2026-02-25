import { getCurrentUser } from "@/services/clerk/getCurrentUser";
import { redirect } from "next/navigation";
import { Navbar } from "./_navbar";
import { Toaster } from "@/components/ui/sonner"


interface LayoutProps {
    children: React.ReactNode
}

export default async function AppLayout({children}: LayoutProps) {
    const {userId,user} = await getCurrentUser({ alldata:true});

    if(userId == null) return redirect('/')// if user is not logged in redirect to home page
    if(user == null) return redirect('/onboarding') // if user is already in database redirect to onboardings page

    return <>

        <Navbar />
        <main className="site-content p-4 sm:px-8">{children}</main>
        <Toaster />

    </>
}