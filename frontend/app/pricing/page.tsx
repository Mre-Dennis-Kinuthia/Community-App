import Link from "next/link"
import { ArrowRight, CheckCircle2 } from "lucide-react"
import { LandingHeader } from "@/components/landing/landing-header"
import { MembershipPricingCards } from "@/components/landing/membership-pricing-cards"
import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"
import { GENERAL_MEMBER_BENEFITS, VAT_DISCLAIMER } from "@/lib/workspace-pricing"
import { getLandingFooterPlatformLinks } from "@/lib/public-nav-links"
import { HUB_PUBLIC_EMAIL, HUB_PUBLIC_PHONE, HUB_PUBLIC_PHONE_HREF } from "@/lib/hub-contact"

export const metadata = {
  title: "Membership pricing | Impact Hub Nairobi",
  description:
    "Connect is free. Star Connect lists all workspace rates. Organisation / Company is for partnerships. Prices exclude 16% VAT.",
}

export default function PricingPage() {
  const footerLinks = getLandingFooterPlatformLinks()

  return (
    <div className="landing-page min-h-screen bg-[#faf9f6]">
      <LandingHeader />
      <main>
        <section className="landing-section">
          <div className="container max-w-5xl px-4">
            <p className="section-label mb-3">Membership</p>
            <h1 className="section-title text-balance">
              Membership and workspace pricing
            </h1>
            <p className="section-lead mt-4 max-w-2xl text-pretty">
              Connect is free. Star Connect has every workspace rate. Organisation / Company is for
              partnerships.
            </p>
            <p className="mt-3 max-w-2xl text-xs leading-relaxed text-muted-foreground">
              {VAT_DISCLAIMER}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/booking">
                  Book a Day Pass
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/#membership">View memberships</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="landing-section-alt landing-section">
          <div className="container px-4">
            <MembershipPricingCards detail showVatNote={false} syncHash />
          </div>
        </section>

        <section className="landing-section">
          <div className="container max-w-5xl px-4">
            <h2 className="section-title text-xl md:text-2xl">General member benefits</h2>
            <p className="section-lead mt-2 max-w-2xl">
              Depending on the selected package, members may receive:
            </p>
            <ul className="landing-panel mt-6 grid gap-2 px-5 py-5 sm:grid-cols-2">
              {GENERAL_MEMBER_BENEFITS.map((line) => (
                <li key={line} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#edeff2] py-10">
        <div className="container flex flex-col items-center gap-4 px-4 text-center text-xs text-muted-foreground">
          <Logo href="/" />
          <nav className="flex flex-wrap justify-center gap-x-4 gap-y-2">
            {footerLinks.map((link) => (
              <Link key={link.href} href={link.href} className="hover:text-foreground">
                {link.label}
              </Link>
            ))}
          </nav>
          <p>
            <a href={`mailto:${HUB_PUBLIC_EMAIL}`} className="hover:text-foreground">
              {HUB_PUBLIC_EMAIL}
            </a>
            {" · "}
            <a href={HUB_PUBLIC_PHONE_HREF} className="hover:text-foreground">
              {HUB_PUBLIC_PHONE}
            </a>
          </p>
        </div>
      </footer>
    </div>
  )
}
