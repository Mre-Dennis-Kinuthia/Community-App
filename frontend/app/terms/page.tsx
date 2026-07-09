import Link from "next/link"
import { HUB_PUBLIC_EMAIL } from "@/lib/hub-contact"
import { LegalLink, LegalSection, PublicPageShell } from "@/components/public/public-page-shell"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Terms of Service — Impact Hub Nairobi",
  description: "Terms and conditions for using the Impact Hub Nairobi community platform.",
}

export default function TermsPage() {
  return (
    <PublicPageShell title="Terms of Service" updated="May 2026">
      <LegalSection title="1. Acceptance of terms">
        <p>
          By creating an account or using the Impact Hub Nairobi community platform, you agree to
          these Terms of Service. If you do not agree, please do not use the platform.
        </p>
      </LegalSection>

      <LegalSection title="2. Use of the platform">
        <p>
          The platform supports Impact Hub Nairobi members and partners to access programs, book
          workspace, register for events, connect with the community, and engage with resources.
          Use the platform only for lawful purposes.
        </p>
      </LegalSection>

      <LegalSection title="3. Account responsibilities">
        <p>
          You are responsible for your account credentials and activity under your account. Notify
          us promptly of any unauthorised use.
        </p>
      </LegalSection>

      <LegalSection title="4. Workspace bookings">
        <p>
          Bookings are subject to availability and Impact Hub Nairobi policies. Cancellation terms
          are communicated at booking. Repeated no-shows may restrict booking privileges.
        </p>
      </LegalSection>

      <LegalSection title="5. Community conduct">
        <p>
          Members engage respectfully. Harassment, discrimination, spam, or abusive behaviour may
          result in suspension or termination.
        </p>
      </LegalSection>

      <LegalSection title="6. Intellectual property">
        <p>
          Content you post remains yours. By posting, you grant Impact Hub Nairobi a non-exclusive
          licence to display it within the platform. IHN branding and materials remain our property.
        </p>
      </LegalSection>

      <LegalSection title="7. Limitation of liability">
        <p>
          The platform is provided &ldquo;as is.&rdquo; To the fullest extent permitted by law,
          Impact Hub Nairobi is not liable for indirect or consequential damages from your use of
          the platform.
        </p>
      </LegalSection>

      <LegalSection title="8. Modifications">
        <p>
          We may update these Terms. Continued use after changes are posted constitutes acceptance.
          Material changes may be communicated by email.
        </p>
      </LegalSection>

      <LegalSection title="9. Governing law">
        <p>These Terms are governed by the laws of Kenya. Disputes are resolved in Nairobi courts.</p>
      </LegalSection>

      <LegalSection title="10. Contact">
        <p>
          Questions about these Terms:{" "}
          <LegalLink href={`mailto:${HUB_PUBLIC_EMAIL}`}>{HUB_PUBLIC_EMAIL}</LegalLink>.
        </p>
      </LegalSection>

      <p className="border-t border-[#edeff2] pt-6 text-[#1c395c]/75">
        See also our{" "}
        <Link href="/privacy" className="font-medium text-[#812926] hover:underline">
          Privacy Policy
        </Link>
        .
      </p>
    </PublicPageShell>
  )
}
