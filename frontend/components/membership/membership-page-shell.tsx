import type { ReactNode } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"

interface MembershipPageShellProps {
  children: ReactNode
  backHref?: string
  backLabel?: string
}

export function MembershipPageShell({
  children,
  backHref = "/#membership",
  backLabel = "Membership",
}: MembershipPageShellProps) {
  return (
    <div className="min-h-screen bg-[#faf9f6] px-4 py-8 md:py-12">
      <div className="mx-auto max-w-lg space-y-6">
        <div className="flex items-center justify-between gap-4">
          <Logo href="/" />
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="text-[#1c395c] hover:bg-[#edeff2]/60 hover:text-[#0a1f38]"
          >
            <Link href={backHref}>
              <ArrowLeft className="mr-1.5 h-4 w-4" />
              {backLabel}
            </Link>
          </Button>
        </div>
        {children}
      </div>
    </div>
  )
}

export const MEMBERSHIP_PRIMARY_BTN =
  "w-full bg-[#812926] hover:bg-[#6b2120] text-white" as const

export const MEMBERSHIP_LINK = "text-[#812926] hover:underline" as const
