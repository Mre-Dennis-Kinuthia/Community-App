import type { ReactNode } from "react"
import Image from "next/image"
import { Logo } from "@/components/logo"
import { LANDING_IMAGES } from "@/lib/landing-assets"

interface AuthPageShellProps {
  children: ReactNode
  title: string
  subtitle: string
  panelEyebrow?: string
  panelTitle?: string
  panelDescription?: string
}

export function AuthPageShell({
  children,
  title,
  subtitle,
  panelEyebrow = "Impact Hub Nairobi",
  panelTitle = "For Impact Startups & Innovators",
  panelDescription =
    "Inclusive and sustainable innovation at scale — programs, workspace, events, and a local-to-global impact community.",
}: AuthPageShellProps) {
  return (
    <div className="auth-page fixed inset-0 flex flex-col overflow-hidden bg-[#faf9f6] lg:flex-row">
      <div className="auth-page-panel relative hidden h-full w-full shrink-0 overflow-hidden lg:flex lg:w-[44%] xl:w-[42%]">
        <Image
          src={LANDING_IMAGES.authPanel}
          alt=""
          fill
          priority
          sizes="44vw"
          className="object-cover"
          unoptimized
        />
        <div className="auth-page-panel__overlay absolute inset-0" aria-hidden />
        <div className="relative z-10 flex h-full flex-col justify-end p-10 xl:p-12">
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#ffd546]">
            {panelEyebrow}
          </p>
          <h2 className="mt-3 max-w-md text-2xl font-semibold leading-tight text-white xl:text-3xl">
            {panelTitle}
          </h2>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-white/85">{panelDescription}</p>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col items-center justify-center overflow-y-auto overscroll-contain px-4 py-6 sm:px-6 lg:py-8">
        <div className="auth-page-mobile-hero relative mb-4 h-20 w-full max-w-md shrink-0 overflow-hidden rounded-md sm:h-24 lg:hidden">
          <Image
            src={LANDING_IMAGES.authPanel}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
            unoptimized
          />
          <div className="auth-page-panel__overlay absolute inset-0" aria-hidden />
          <div className="relative z-10 flex h-full items-end p-4">
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#ffd546]">
              {panelEyebrow}
            </p>
          </div>
        </div>

        <Logo href="/" className="mb-4 shrink-0" />
        <div className="mb-4 w-full max-w-md shrink-0 text-center lg:text-left">
          <h1 className="text-2xl font-semibold tracking-tight text-[#0a1f38]">{title}</h1>
          <p className="mt-2 text-sm leading-relaxed text-[#1c395c]/80">{subtitle}</p>
        </div>
        <div className="auth-page-card w-full max-w-md rounded-md border border-[#edeff2] bg-white p-6 shadow-sm sm:p-8">
          {children}
        </div>
      </div>
    </div>
  )
}
