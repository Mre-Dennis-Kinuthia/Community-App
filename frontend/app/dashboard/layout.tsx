"use client"

import type React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
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
import { User, LogOut, ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { signOut } from "next-auth/react"
import { useState, useEffect, Suspense } from "react"
import { Logo } from "@/components/logo"
import { MobileBottomNav } from "@/components/mobile-bottom-nav"
import { NotificationCenter } from "@/components/notification-center"
import { GlobalSearch } from "@/components/global-search"
import { SidebarProvider, useSidebar } from "@/components/sidebar-context"
import { cn, getInitials } from "@/lib/utils"
import { useSession } from "@/lib/use-session"
import { getImageDisplayUrl } from "@/lib/stored-image"
import { toast } from "@/lib/toast"

function DashboardLayoutContent({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { isCollapsed, toggleSidebar } = useSidebar()
  const { user, status } = useSession()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [onboardingChecked, setOnboardingChecked] = useState(false)
  const [redirectingToOnboarding, setRedirectingToOnboarding] = useState(false)
  const [profileImage, setProfileImage] = useState<string | null>(null)

  useEffect(() => {
    if (status !== "authenticated" || !user?.id) return
    void fetch("/api/me/activity", { method: "POST", credentials: "include" })
  }, [status, user?.id])

  // Block dashboard until onboarding is verified; redirect if needed
  useEffect(() => {
    if (status === "loading" || !user?.id) return
    let cancelled = false
    if (typeof window !== "undefined" && sessionStorage.getItem("onboardingJustCompleted") === "true") {
      setOnboardingChecked(true)
      return
    }
    fetch("/api/profile", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled) return
        if (data?.profile?.user?.image != null) {
          setProfileImage(data.profile.user.image)
        }
        if (data?.needsOnboarding === true) {
          setRedirectingToOnboarding(true)
          router.replace("/onboarding")
          return
        }
        setOnboardingChecked(true)
      })
      .catch(() => {
        if (!cancelled) setOnboardingChecked(true)
      })
    return () => {
      cancelled = true
    }
  }, [user?.id, status, router])

  useEffect(() => {
    const onProfileImageUpdated = (event: Event) => {
      const url = (event as CustomEvent<{ url: string }>).detail?.url
      if (url) setProfileImage(url)
    }
    window.addEventListener("profile-image-updated", onProfileImageUpdated)
    return () => window.removeEventListener("profile-image-updated", onProfileImageUpdated)
  }, [])

  const canShowDashboard = onboardingChecked && !redirectingToOnboarding
  const showLoading = status === "loading" || !user || !canShowDashboard

  const handleLogout = async () => {
    console.log("[LOGOUT] Logout initiated")
    setIsLoggingOut(true)
    
    try {
      const result = await signOut({ 
        redirect: false,
        callbackUrl: "/",
      })
      
      console.log("[LOGOUT] Sign out result:", result)
      
      // Show success message
      toast.success("Logged out successfully", "You have been signed out.")
      
      // Full reload clears client state and lands on the public marketing home
      window.location.href = "/"
    } catch (error) {
      console.error("[LOGOUT] Logout error:", error)
      toast.error("Logout failed", "There was an error signing you out. Please try again.")
      setIsLoggingOut(false)
    }
  }

  const userInitials = getInitials(user?.name, user?.email)
  const displayName = user?.name || "User"
  const displayEmail = user?.email || ""
  const avatarSrc = getImageDisplayUrl(profileImage ?? user?.image)

  if (showLoading) {
    return (
      <div className="flex h-[100svh] w-full items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" aria-label="Loading" />
        <span className="sr-only">Loading dashboard…</span>
      </div>
    )
  }

  return (
    <div className="flex h-[100svh] flex-col overflow-hidden bg-background">
      <header className="surface-header z-50 flex h-16 shrink-0 overflow-x-hidden border-b border-border">
        <div className="container flex h-full min-w-0 items-center justify-between gap-4 px-4 md:px-6">
          <div className="flex min-w-0 shrink items-center gap-4">
            <Logo href="/dashboard" />
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <div className="hidden md:block">
              <GlobalSearch />
            </div>
            <NotificationCenter />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative min-h-[44px] min-w-[44px] rounded-full transition-colors duration-200 ease-out hover:bg-muted/60"
                >
                  <Avatar className="h-8 w-8 transition-transform duration-200 ease-out">
                    {avatarSrc ? (
                      <AvatarImage src={avatarSrc} alt={displayName} />
                    ) : null}
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
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer text-destructive focus:text-destructive"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  {isLoggingOut ? "Logging out..." : "Log out"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
      <div className="flex min-h-0 flex-1">
        <aside
          className={cn(
            "relative hidden shrink-0 flex-col overflow-hidden border-r border-border bg-sidebar md:flex",
            "transition-[width] duration-300 ease-out",
            isCollapsed ? "w-16" : "w-64 min-w-64"
          )}
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className={cn(
              "absolute -right-3 top-4 z-10 h-7 w-7 rounded-md border border-border bg-background",
              "hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            )}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4 transition-transform duration-200 ease-out" />
            ) : (
              <ChevronLeft className="h-4 w-4 transition-transform duration-200 ease-out" />
            )}
          </Button>
          <div className="min-h-0 flex-1 overflow-y-auto scrollbar-thin">
            <Suspense fallback={null}>
              <DashboardNav />
            </Suspense>
          </div>
        </aside>
        <main
          id="main-content"
          className="container flex min-h-0 min-w-0 flex-1 flex-col overflow-x-hidden overflow-y-auto px-4 py-4 pb-20 md:px-8 md:py-8 md:pb-8"
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
