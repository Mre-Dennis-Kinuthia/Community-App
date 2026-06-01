import Link from "next/link"
import { HUB_CONTACT_EMAIL } from "@/lib/hub-contact"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Terms of Service — Impact Hub Nairobi",
  description: "Terms and conditions for using the Impact Hub Nairobi community platform.",
}

export default function TermsPage() {
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

        <h1 className="text-4xl font-bold mb-2">Terms of Service</h1>
        <p className="text-muted-foreground mb-10">Last updated: May 2026</p>

        <div className="space-y-8 text-sm leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground">
              By creating an account or using the Impact Hub Nairobi community platform, you agree
              to be bound by these Terms of Service. If you do not agree to these terms, do not use
              the platform.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">2. Use of the Platform</h2>
            <p className="text-muted-foreground">
              The platform is provided for Impact Hub Nairobi community members to access programs,
              book workspace, connect with other members, and engage with resources. You agree to
              use the platform only for lawful purposes and in accordance with these terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">3. Account Responsibilities</h2>
            <p className="text-muted-foreground">
              You are responsible for maintaining the confidentiality of your account credentials
              and for all activity that occurs under your account. You agree to notify us
              immediately of any unauthorised use of your account.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">4. Workspace Bookings</h2>
            <p className="text-muted-foreground">
              Workspace bookings are subject to availability and the policies of Impact Hub Nairobi
              and its partner spaces. Cancellation and refund policies will be communicated at the
              time of booking. Repeated no-shows may result in booking privileges being restricted.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">5. Community Conduct</h2>
            <p className="text-muted-foreground">
              Members are expected to engage respectfully with one another. Harassment,
              discrimination, spam, or any form of abusive behaviour is prohibited and may result
              in account suspension or termination.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">6. Intellectual Property</h2>
            <p className="text-muted-foreground">
              Content you post on the platform (profile information, project descriptions, comments)
              remains yours. By posting, you grant Impact Hub Nairobi a non-exclusive licence to
              display that content within the platform. Impact Hub Nairobi's own content, logos,
              and branding remain its property.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">7. Limitation of Liability</h2>
            <p className="text-muted-foreground">
              The platform is provided "as is." Impact Hub Nairobi does not warrant uninterrupted
              or error-free operation. To the fullest extent permitted by law, Impact Hub Nairobi
              is not liable for indirect, incidental, or consequential damages arising from your
              use of the platform.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">8. Modifications</h2>
            <p className="text-muted-foreground">
              We may update these Terms from time to time. Continued use of the platform after
              changes are posted constitutes acceptance of the revised Terms. We will notify
              members of material changes via email.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">9. Governing Law</h2>
            <p className="text-muted-foreground">
              These Terms are governed by the laws of Kenya. Any disputes shall be resolved in the
              courts of Nairobi, Kenya.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">10. Contact</h2>
            <p className="text-muted-foreground">
              For questions about these Terms, contact us at{" "}
              <a href={`mailto:${HUB_CONTACT_EMAIL}`} className="text-primary hover:underline">
                {HUB_CONTACT_EMAIL}
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
