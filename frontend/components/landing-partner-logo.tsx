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
        "group flex h-24 flex-col items-center justify-center gap-2 rounded-md border border-border bg-card px-4 py-5 transition-colors",
        "hover:border-foreground/20",
        className
      )}
    >
      <div className="relative flex h-10 w-full max-w-[140px] items-center justify-center text-muted-foreground">
        <Image
          src={partner.logo}
          alt={partner.name}
          width={140}
          height={40}
          className={cn(
            "max-h-9 w-auto object-contain",
            "opacity-[0.55] grayscale contrast-[0.92]",
            "transition-all duration-300 ease-out",
            "group-hover:opacity-[0.88] group-hover:grayscale-[0.35] group-hover:contrast-100",
            "dark:opacity-[0.5] dark:brightness-[1.15] dark:contrast-[0.9]",
            "dark:group-hover:opacity-[0.92] dark:group-hover:brightness-100"
          )}
        />
      </div>
      <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70 transition-colors group-hover:text-muted-foreground">
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
        className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md"
        aria-label={`${partner.name} (opens in new tab)`}
      >
        {content}
      </Link>
    )
  }

  return content
}
