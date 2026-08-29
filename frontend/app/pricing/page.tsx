import Link from "next/link"
import { ArrowRight, CheckCircle2 } from "lucide-react"
import { LandingHeader } from "@/components/landing/landing-header"
import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"
import {
  GENERAL_MEMBER_BENEFITS,
  VAT_DISCLAIMER,
  WORKSPACE_PRICING_CATEGORIES,
  WORKSPACE_PRICING_GROUPS,
} from "@/lib/workspace-pricing"
import { getLandingFooterPlatformLinks } from "@/lib/public-nav-links"
import { HUB_PUBLIC_EMAIL, HUB_PUBLIC_PHONE, HUB_PUBLIC_PHONE_HREF } from "@/lib/hub-contact"

export const metadata = {
  title: "Workspace pricing | Impact Hub Nairobi",
  description:
    "Day Pass, flex packs, Community Monthly, Team Community, dedicated desks and private rooms. Prices exclude 16% VAT.",
}

export default function PricingPage() {
  const footerLinks = getLandingFooterPlatformLinks()

  return (
    <div className="landing-page min-h-screen bg-[#faf9f6]">
      <LandingHeader />
      <main>
        <section className="landing-section">
          <div className="container max-w-5xl px-4">
            <p className="section-label mb-3">Workspace pricing</p>
            <h1 className="section-title text-balance">
              Impact Hub Nairobi membership categories
            </h1>
            <p className="section-lead mt-4 max-w-3xl text-pretty">
              The platform still has three memberships: <strong>Connect</strong>,{" "}
              <strong>Star Connect</strong>, and <strong>Organisation / Company</strong>. The
              categories below are the published coworking and space rates.
            </p>
            <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted-foreground">
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

        {WORKSPACE_PRICING_GROUPS.map((group) => {
          const items = WORKSPACE_PRICING_CATEGORIES.filter((c) => c.group === group.id)
          return (
            <section key={group.id} className="landing-section-alt landing-section">
              <div className="container max-w-5xl px-4">
                <h2 className="section-title text-xl md:text-2xl">{group.label}</h2>
                <p className="section-lead mt-2 max-w-2xl">{group.description}</p>
                <div className="mt-8 grid gap-4">
                  {items.map((item) => (
                    <article
                      key={item.id}
                      id={item.id}
                      className="landing-panel scroll-mt-24 px-5 py-6 md:px-7"
                    >
                      <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                        <div>
                          <h3 className="text-base font-semibold text-foreground">{item.name}</h3>
                          <p className="mt-1 text-sm font-medium text-primary">{item.priceLabel}</p>
                          {item.validity ? (
                            <p className="mt-1 text-xs text-muted-foreground">{item.validity}</p>
                          ) : null}
                        </div>
                        {item.href ? (
                          <Button asChild size="sm" variant="outline" className="shrink-0">
                            <Link href={item.href}>
                              {item.href === "/booking" ? "Book" : "Enquire"}
                            </Link>
                          </Button>
                        ) : null}
                      </div>
                      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                        <span className="font-medium text-foreground">Best for: </span>
                        {item.bestFor}
                      </p>
                      <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                        {item.includes.map((line) => (
                          <li key={line} className="flex items-start gap-2 text-sm">
                            <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                            <span>{line}</span>
                          </li>
                        ))}
                      </ul>
                      {item.note ? (
                        <p className="mt-4 text-xs leading-relaxed text-muted-foreground">{item.note}</p>
                      ) : null}
                    </article>
                  ))}
                </div>
              </div>
            </section>
          )
        })}

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
