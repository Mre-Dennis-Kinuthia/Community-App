"use client"

import type React from "react"
import Link from "next/link"
import { DashboardNav } from "@/components/dashboard-nav"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { User, Settings, LogOut, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useState, useEffect } from "react"
import { handleLogout } from "@/app/actions/auth-actions"
import { MobileNav } from "@/components/mobile-nav"
import { MobileBottomNav } from "@/components/mobile-bottom-nav"
import { NotificationCenter } from "@/components/notification-center"
import { GlobalSearch } from "@/components/global-search"

export function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-4">
            <MobileNav />
            <Link href="/dashboard" className="font-bold text-primary hover:opacity-80 transition-opacity">
              Impact Hub Nairobi
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden md:block">
              <GlobalSearch />
            </div>
            <NotificationCenter />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="min-h-[44px] min-w-[44px]"
              aria-label="Toggle theme"
            >
              {mounted && theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative min-h-[44px] min-w-[44px] rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/placeholder-user.jpg" alt="User" />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">John Doe</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      demo@impacthub.co.ke
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer text-destructive focus:text-destructive"
                  onClick={() => handleLogout()}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
      <div className="container grid flex-1 gap-8 md:grid-cols-[220px_1fr]">
        <aside className="hidden w-[220px] flex-col border-r border-border/50 bg-sidebar/30 md:flex">
          <DashboardNav />
        </aside>
        <main id="main-content" className="flex w-full flex-1 flex-col overflow-hidden py-8 px-4 md:px-8 pb-20 md:pb-8">
          {children}
        </main>
      </div>
      <MobileBottomNav />
    </div>
  )
}

export default DashboardLayout
