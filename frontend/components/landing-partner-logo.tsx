import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils"

export type LandingPartner = {
  name: string
  logo: string
  href?: string
}

type LandingPartnerLogoProps = {
  partner: LandingPartner
  className?: string
}

export function LandingPartnerLogo({ partner, className }: LandingPartnerLogoProps) {
  const content = (
    <div
      className={cn(
        "group flex h-24 flex-col items-center justify-center gap-2 rounded-md border border-[#edeff2] bg-white px-4 py-4 shadow-sm transition-all hover:border-[#812926]/20 hover:shadow-md",
        className
      )}
    >
      <div className="relative flex h-12 w-full max-w-[150px] items-center justify-center">
        <Image
          src={partner.logo}
          alt={partner.name}
          width={150}
          height={48}
          unoptimized
          className="max-h-11 w-auto max-w-full object-contain transition-transform duration-200 group-hover:scale-[1.03]"
        />
      </div>
      <span className="sr-only">{partner.name}</span>
    </div>
  )

  if (partner.href) {
    return (
      <Link
        href={partner.href}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#812926] focus-visible:ring-offset-2"
        aria-label={`${partner.name} (opens in new tab)`}
      >
        {content}
      </Link>
    )
  }

  return content
}
