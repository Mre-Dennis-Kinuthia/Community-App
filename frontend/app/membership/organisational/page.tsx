"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Logo } from "@/components/logo"
import {
  ORGANISATIONAL_DISCOVERY_CALL_URL,
  ORGANISATIONAL_PLAN_NAME,
  ORGANISATIONAL_REGISTER_PATH,
  ORGANISATIONAL_RESPONSE_SLA,
} from "@/lib/membership-inquiry"
import { HUB_CONTACT_EMAIL } from "@/lib/hub-contact"
import { ArrowLeft, ArrowRight, Building2, Calendar, CheckCircle2 } from "lucide-react"

const STEPS = [
  "Create your free platform account",
  "Complete your profile with organisation details",
  "Our partnerships team scopes your bespoke engagement",
] as const

export default function OrganisationalMembershipPage() {
  return (
    <div className="min-h-screen bg-muted/30 px-4 py-8 md:py-12">
      <div className="mx-auto max-w-lg space-y-6">
        <div className="flex items-center justify-between gap-4">
          <Logo href="/" variant="compact" />
          <Button variant="ghost" size="sm" asChild>
            <Link href="/#membership">
              <ArrowLeft className="mr-1.5 h-4 w-4" />
              Membership
            </Link>
          </Button>
        </div>

        <Card className="border-border/90 shadow-sm">
          <CardHeader className="space-y-3 pb-2">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10">
              <Building2 className="h-5 w-5 text-primary" aria-hidden />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {ORGANISATIONAL_PLAN_NAME} membership
              </p>
              <CardTitle className="text-2xl">Join as an organisation</CardTitle>
              <CardDescription className="mt-2 text-base leading-relaxed">
                Institutions and partners register on the platform — no lengthy application. We
                tailor pricing and programs after you sign up.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <ol className="space-y-3">
              {STEPS.map((step, i) => (
                <li key={step} className="flex gap-3 text-sm leading-relaxed">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold">
                    {i + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>

            <ul className="space-y-2 rounded-lg border bg-muted/40 p-4 text-sm text-muted-foreground">
              {[
                "Bespoke engagement & co-design",
                "Program & event co-creation",
                "Network access across ventures and investors",
                "Dedicated partnership manager",
              ].map((item) => (
                <li key={item} className="flex gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <Button asChild size="lg" className="w-full">
              <Link href={ORGANISATIONAL_REGISTER_PATH}>
                Register on the platform
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>

            <p className="text-center text-xs text-muted-foreground">
              Our partnerships team typically responds {ORGANISATIONAL_RESPONSE_SLA} after you
              complete your profile.
            </p>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Button variant="outline" asChild className="flex-1">
                <a
                  href={ORGANISATIONAL_DISCOVERY_CALL_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  Book a call
                </a>
              </Button>
              <Button variant="ghost" asChild className="flex-1">
                <a href={`mailto:${HUB_CONTACT_EMAIL}`}>Email partnerships</a>
              </Button>
            </div>

            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
