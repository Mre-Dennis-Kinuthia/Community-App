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
        "group flex h-20 flex-col items-center justify-center gap-2 rounded-md border border-border bg-card px-4 py-4 transition-colors hover:bg-muted/40",
        className
      )}
    >
      <div className="relative flex h-9 w-full max-w-[130px] items-center justify-center">
        <Image
          src={partner.logo}
          alt={partner.name}
          width={130}
          height={36}
          className={cn(
            "max-h-8 w-auto object-contain opacity-60 grayscale transition-all duration-200",
            "group-hover:opacity-90 group-hover:grayscale-0"
          )}
        />
      </div>
      <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        {partner.name}
      </span>
    </div>
  )

  if (partner.href) {
    return (
      <Link
        href={partner.href}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        aria-label={`${partner.name} (opens in new tab)`}
      >
        {content}
      </Link>
    )
  }

  return content
}
