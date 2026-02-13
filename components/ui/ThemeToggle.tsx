"use client"

import { useEffect, useState } from "react"
import { Laptop, Moon, Sun, Check } from "lucide-react"
// using next theme for toggling between light and dark mode and system theme 
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const THEME_OPTIONS = [
	{ value: "light", label: "Light", Icon: Sun },
	{ value: "dark", label: "Dark", Icon: Moon },
	{ value: "system", label: "System", Icon: Laptop },
] as const

export function ThemeToggle() {
	const { setTheme, resolvedTheme, theme } = useTheme()
	const [mounted, setMounted] = useState(false)

	useEffect(() => setMounted(true), [])

	const currentTheme = resolvedTheme ?? theme ?? "system"

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="ghost"
					size="icon"
					aria-label="Toggle theme"
					className="relative"
				>
					<Sun className="rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
					<Moon className="absolute rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
					<span className="sr-only">Toggle theme</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent className="flex flex-col gap-1" align="end" sideOffset={10}>
				{THEME_OPTIONS.map(({ value, label, Icon }) => (
					<DropdownMenuItem
						key={value}
						onClick={() => setTheme(value)}
						className={`  ${mounted && currentTheme === value ? "bg-black/10 dark:bg-white/10" : "bg-background"} cursor-pointer`}
					>
						<Icon className="size-4" />
						<span className="flex-1">{label}</span>
						{mounted && currentTheme === value ? (
							<Check className="size-4 text-primary" />
						) : null}
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
