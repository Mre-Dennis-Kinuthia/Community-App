import type { ReactNode } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Logo } from "@/components/logo"

interface PublicPageShellProps {
  title: string
  updated?: string
  children: ReactNode
}

export function PublicPageShell({ title, updated, children }: PublicPageShellProps) {
  return (
    <div className="min-h-screen bg-[#faf9f6]">
      <div className="container mx-auto max-w-3xl px-4 py-10 md:py-14">
        <div className="mb-8 flex items-center justify-between gap-4">
          <Logo href="/" variant="compact" />
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#812926] hover:underline"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Back to home
          </Link>
        </div>

        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#812926]">
          Impact Hub Nairobi
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-[#0a1f38] md:text-4xl">{title}</h1>
        {updated ? (
          <p className="mt-2 text-sm text-[#1c395c]/70">Last updated: {updated}</p>
        ) : null}

        <div className="prose-ihn mt-10 space-y-8 text-sm leading-relaxed text-[#1c395c]">
          {children}
        </div>
      </div>
    </div>
  )
}

export function LegalSection({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <section>
      <h2 className="mb-3 text-xl font-semibold text-[#0a1f38]">{title}</h2>
      <div className="space-y-3 text-[#1c395c]/90">{children}</div>
    </section>
  )
}

export function LegalLink({
  href,
  children,
}: {
  href: string
  children: ReactNode
}) {
  return (
    <a href={href} className="font-medium text-[#812926] hover:underline">
      {children}
    </a>
  )
}
