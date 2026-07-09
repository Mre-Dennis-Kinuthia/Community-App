"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ORGANISATIONAL_DISCOVERY_CALL_URL,
  ORGANISATIONAL_PLAN_NAME,
  ORGANISATIONAL_REGISTER_PATH,
  ORGANISATIONAL_RESPONSE_SLA,
} from "@/lib/membership-inquiry"
import { HUB_PUBLIC_EMAIL } from "@/lib/hub-contact"
import { ArrowRight, Building2, Calendar, CheckCircle2 } from "lucide-react"
import {
  MEMBERSHIP_LINK,
  MEMBERSHIP_PRIMARY_BTN,
  MembershipPageShell,
} from "@/components/membership/membership-page-shell"

const STEPS = [
  "Create your free platform account",
  "Complete your profile with organisation details",
  "Our partnerships team scopes your bespoke engagement",
] as const

export default function OrganisationalMembershipPage() {
  return (
    <MembershipPageShell>
      <Card className="auth-page-card border-[#edeff2] bg-white shadow-sm">
        <CardHeader className="space-y-3 pb-2">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#812926]/10">
            <Building2 className="h-5 w-5 text-[#812926]" aria-hidden />
          </div>
          <div>
            <p className="section-label text-left">{ORGANISATIONAL_PLAN_NAME} membership</p>
            <CardTitle className="text-2xl text-[#0a1f38]">Join as an organisation</CardTitle>
            <CardDescription className="mt-2 text-base leading-relaxed text-[#1c395c]/80">
              Institutions and partners register on the platform — no lengthy application. We tailor
              pricing and programs after you sign up.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <ol className="space-y-3">
            {STEPS.map((step, i) => (
              <li key={step} className="flex gap-3 text-sm leading-relaxed text-[#1c395c]">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#f3f5f8] text-xs font-semibold text-[#812926]">
                  {i + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>

          <ul className="space-y-2 rounded-md border border-[#edeff2] bg-[#f3f5f8]/60 p-4 text-sm text-[#1c395c]/85">
            {[
              "Bespoke engagement & co-design",
              "Program & event co-creation",
              "Network access across ventures and investors",
              "Dedicated partnership manager",
            ].map((item) => (
              <li key={item} className="flex gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#812926]" aria-hidden />
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <Button asChild size="lg" className={MEMBERSHIP_PRIMARY_BTN}>
            <Link href={ORGANISATIONAL_REGISTER_PATH}>
              Register on the platform
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>

          <p className="text-center text-xs text-[#1c395c]/70">
            Our partnerships team typically responds {ORGANISATIONAL_RESPONSE_SLA} after you
            complete your profile.
          </p>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button variant="outline" asChild className="flex-1 border-[#edeff2] bg-white">
              <a
                href={ORGANISATIONAL_DISCOVERY_CALL_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Calendar className="mr-2 h-4 w-4" />
                Book a call
              </a>
            </Button>
            <Button variant="ghost" asChild className="flex-1 text-[#1c395c]">
                <a href={`mailto:${HUB_PUBLIC_EMAIL}`}>Email partnerships</a>
            </Button>
          </div>

          <p className="text-center text-sm text-[#1c395c]/75">
            Already have an account?{" "}
            <Link href="/login" className={MEMBERSHIP_LINK}>
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </MembershipPageShell>
  )
}
