import Link from "next/link"
import { HUB_CONTACT_EMAIL } from "@/lib/hub-contact"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Policy — Impact Hub Nairobi",
  description: "How Impact Hub Nairobi collects, uses, and protects your personal information.",
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container px-4 py-16 max-w-3xl mx-auto">
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="gap-2 -ml-3">
              <ArrowLeft className="h-4 w-4" />
              Back to home
            </Button>
          </Link>
        </div>

        <h1 className="text-4xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-muted-foreground mb-10">Last updated: May 2026</p>

        <div className="space-y-8 text-sm leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold mb-3">1. Information We Collect</h2>
            <p className="text-muted-foreground">
              We collect information you provide directly when you create an account, complete your
              profile, book workspace, register for events, or contact us. This includes your name,
              email address, profile information, and payment details where applicable.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">2. How We Use Your Information</h2>
            <p className="text-muted-foreground">
              We use the information we collect to provide and improve our platform services,
              process bookings and payments, send updates about events and programs you've
              registered for, and facilitate connections within the Impact Hub Nairobi community.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">3. Data Sharing</h2>
            <p className="text-muted-foreground">
              We do not sell your personal information. We may share your information with
              service providers who assist us in operating the platform, subject to confidentiality
              obligations. Your public profile information (name, bio, skills) is visible to other
              members within the community directory.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">4. Data Security</h2>
            <p className="text-muted-foreground">
              We implement appropriate technical and organisational measures to protect your
              personal information against unauthorised access, alteration, disclosure, or
              destruction. Passwords are stored using industry-standard hashing.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">5. Data Retention</h2>
            <p className="text-muted-foreground">
              We retain your personal information for as long as your account is active or as
              needed to provide services. You may request deletion of your account and associated
              data at any time.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">6. Your Rights</h2>
            <p className="text-muted-foreground">
              You have the right to access, correct, or delete your personal information. You may
              also request a copy of the data we hold about you. To exercise any of these rights,
              contact us at{" "}
              <a href={`mailto:${HUB_CONTACT_EMAIL}`} className="text-primary hover:underline">
                {HUB_CONTACT_EMAIL}
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">7. Cookies</h2>
            <p className="text-muted-foreground">
              We use session cookies necessary for authentication and platform functionality. We do
              not use third-party advertising or tracking cookies.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">8. Contact</h2>
            <p className="text-muted-foreground">
              For privacy-related questions, contact Impact Hub Nairobi at{" "}
              <a href={`mailto:${HUB_CONTACT_EMAIL}`} className="text-primary hover:underline">
                {HUB_CONTACT_EMAIL}
              </a>{" "}
              or visit{" "}
              <Link
                href="https://nairobi.impacthub.net"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                nairobi.impacthub.net
              </Link>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
