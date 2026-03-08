"use client"

import { useClerk, useUser } from "@clerk/nextjs"
import { Book, BookOpenIcon, Container, FileSliders, SpeechIcon } from "lucide-react"

import { ThemeToggle } from "@/components/ui/ThemeToggle"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { useParams, usePathname } from "next/navigation"


const NavLinks = [
    { name: "Interviews", href: "interviews", Icon: SpeechIcon },
    { name: "Questions", href: "questions", Icon: BookOpenIcon },
    { name: "Resume", href: "resume", Icon: FileSliders },
]

export function Navbar() {
    const { user } = useUser()
    const { openUserProfile, signOut } = useClerk()
    const params = useParams()
    const jobInfoId = params.jobInfoID ?? params.jobInfoId ?? params.jobinfoId
    const pathName = usePathname()



    const displayName =
        user?.fullName ??
        [user?.firstName, user?.lastName].filter(Boolean).join(" ") ??
        user?.username ??
        "User"

    const fallback =
        displayName
            .split(" ")
            .filter(Boolean)
            .slice(0, 2)
            .map((name) => name[0])
            .join("")
            .toUpperCase() || "U"

    return (
        <nav className="site-header w-full border-b px-4 sm:px-8">
            <div className="mx-auto flex h-full w-full  items-center justify-between">
                
                <Link href="/app" className="flex items-center gap-2 font-semibold tracking-tight">
                    <Container className="size-6" />
                    <span>ResumeStack</span>
                </Link>
                

                <div className="flex items-center gap-4">

                    {typeof jobInfoId === "string" && (
                        <div className="flex items-center gap-2">
                            {NavLinks.map(({ name, href, Icon }) => {
                                const isActive = pathName.includes(href)
                                return (
                                    <Link
                                        key={href}
                                        href={href}
                                        className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                                            isActive
                                                ? "bg-primary text-primary-foreground"
                                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                        }`}
                                    >
                                        <Icon className="size-4" />
                                        {name}
                                    </Link>
                                )
                            })}
                        </div>
                    )}

                    <ThemeToggle />

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button
                                type="button"
                                aria-label="Open user menu"
                                className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            >
                                <Avatar>
                                    <AvatarImage src={user?.imageUrl} alt={displayName} />
                                    <AvatarFallback>{fallback}</AvatarFallback>
                                </Avatar>
                            </button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem onClick={() => openUserProfile()} className="cursor-pointer">
                                Profile
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={() => signOut({ redirectUrl: "/" })}
                                className="cursor-pointer"
                            >
                                Logout
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </nav>
    )
}