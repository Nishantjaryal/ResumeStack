import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import AppPricingTable from "@/services/clerk/components/pricingTable";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Image from "next/image";

const Home = () => {
  return (
    <main className="min-h-screen bg-background">
      <header className="w-full border-b bg-card/60 backdrop-blur-sm">
        <div className="container flex flex-wrap items-center justify-between gap-4 py-4">
          <div>
            <h1 className="text-xl font-semibold tracking-tight md:text-2xl">ResumeStack</h1>
            <p className="text-sm font-medium text-muted-foreground">
              Build better resumes, faster
            </p>
          </div>

          <div className="flex items-center gap-2">
            <SignedOut>
              <SignInButton mode="modal">
                <Button size="sm">Sign in</Button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <UserButton  />
            </SignedIn>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="container py-8 md:py-10">
        <section className="space-y-8">
          <div className="flex gap-4 flex-wrap justify-between items-center">
          <div className="max-w-2xl space-y-4">
            <p className="inline-flex w-fit rounded-full border px-3 bg-blue-600 py-1 text-white text-xs font-medium text-muted-foreground">
              ⭐ Complete Interview Prep Solution
            </p>
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
              Land more interviews with focused resume workflows
            </h2>
            <p className="text-muted-foreground md:text-lg">
              Manage job-specific resume details, stay organized, and upgrade when
              you are ready for advanced features.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <SignedOut>
                <SignInButton mode="modal">
                  <Button>Start free</Button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <Button className="border bg-blue-400 hover:bg-blue-500 text-white" asChild variant="secondary">
                  <Link href="/app">Go to dashboard</Link>
                </Button>
              </SignedIn>
            </div>
          </div>

          <div > <Image src={"/1.png"} alt="" width={500} height={500}  /></div>
</div>
          <Card className="w-full">
            <CardHeader className="space-y-1">
              <CardTitle></CardTitle>
              <CardDescription>
              </CardDescription>
            </CardHeader>
            <CardContent>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
};

export default Home;
