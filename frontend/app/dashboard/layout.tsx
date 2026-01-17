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
import { User, Settings, LogOut, ChevronLeft, ChevronRight } from "lucide-react"
import { signOut } from "next-auth/react"
import { MobileNav } from "@/components/mobile-nav"
import { MobileBottomNav } from "@/components/mobile-bottom-nav"
import { NotificationCenter } from "@/components/notification-center"
import { GlobalSearch } from "@/components/global-search"
import { SidebarProvider, useSidebar } from "@/components/sidebar-context"
import { cn } from "@/lib/utils"
import { useSession } from "@/lib/use-session"

function DashboardLayoutContent({
  children,
}: {
  children: React.ReactNode
}) {
  const { isCollapsed, toggleSidebar } = useSidebar()
  const { user } = useSession()

  // Get user initials for avatar fallback
  const getInitials = (name?: string | null, email?: string | null) => {
    if (name) {
      const parts = name.trim().split(" ")
      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
      }
      return name.substring(0, 2).toUpperCase()
    }
    if (email) {
      return email.substring(0, 2).toUpperCase()
    }
    return "U"
  }

  const userInitials = getInitials(user?.name, user?.email)
  const displayName = user?.name || "User"
  const displayEmail = user?.email || ""

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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative min-h-[44px] min-w-[44px] rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.image || "/placeholder-user.jpg"} alt={displayName} />
                    <AvatarFallback>{userInitials}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{displayName}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {displayEmail}
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
                  onClick={() => signOut({ callbackUrl: "/login" })}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
      <div className="flex flex-1 relative">
        <aside className={cn(
          "hidden fixed left-0 top-16 bottom-0 flex-col border-r border-border/50 bg-sidebar/30 md:flex z-30 overflow-y-auto scrollbar-thin",
          "transition-[width] duration-300 ease-in-out",
          isCollapsed ? "w-[64px]" : "w-[220px]"
        )}>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className={cn(
              "absolute -right-4 top-4 z-10 h-8 w-8 rounded-full border border-border/70 bg-background/90 shadow-sm",
              "transition-colors duration-200 hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            )}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
          <DashboardNav />
        </aside>
        <main 
          id="main-content" 
          className={cn(
            "flex w-full flex-1 flex-col overflow-hidden py-8 px-4 md:px-8 pb-20 md:pb-8 container",
            "transition-[margin-left] duration-300 ease-in-out will-change-[margin-left]",
            isCollapsed ? "md:ml-[64px]" : "md:ml-[220px]"
          )}
        >
          {children}
        </main>
      </div>
      <MobileBottomNav />
    </div>
  )
}

export function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <DashboardLayoutContent>
        {children}
      </DashboardLayoutContent>
    </SidebarProvider>
  )
}

export default DashboardLayout
