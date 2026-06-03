import Link from "next/link"
import { PRIVACY_POLICY_PATH, TERMS_OF_SERVICE_PATH } from "@/lib/app-url"
import { cn } from "@/lib/utils"

type LegalLinksProps = {
  className?: string
  /** Show “By continuing…” copy (register / Google sign-in). */
  showAgreement?: boolean
}

export function LegalLinks({ className, showAgreement = false }: LegalLinksProps) {
  const terms = (
    <Link href={TERMS_OF_SERVICE_PATH} className="text-primary hover:underline">
      Terms of Service
    </Link>
  )
  const privacy = (
    <Link href={PRIVACY_POLICY_PATH} className="text-primary hover:underline">
      Privacy Policy
    </Link>
  )

  if (showAgreement) {
    return (
      <p className={cn("text-center text-xs text-muted-foreground leading-relaxed", className)}>
        By creating an account or signing in, you agree to our {terms} and {privacy}.
      </p>
    )
  }

  return (
    <p className={cn("text-center text-xs text-muted-foreground", className)}>
      {privacy}
      <span className="mx-2 text-muted-foreground/60" aria-hidden>
        ·
      </span>
      {terms}
    </p>
  )
}
