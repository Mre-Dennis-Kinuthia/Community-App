import Link from "next/link"
import { HUB_PUBLIC_EMAIL } from "@/lib/hub-contact"
import { LegalLink, LegalSection, PublicPageShell } from "@/components/public/public-page-shell"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Policy — Impact Hub Nairobi",
  description: "How Impact Hub Nairobi collects, uses, and protects your personal information.",
}

export default function PrivacyPage() {
  return (
    <PublicPageShell title="Privacy Policy" updated="May 2026">
      <LegalSection title="1. Information we collect">
        <p>
          We collect information you provide when you create an account, complete your profile,
          book workspace, register for events, apply for membership, or contact us. This may include
          your name, email, profile details, organisation, and payment information where applicable.
        </p>
      </LegalSection>

      <LegalSection title="2. How we use your information">
        <p>
          We use your information to provide platform services, process bookings and payments, send
          updates about events and programs you join, and help you connect with Impact Hub
          Nairobi&apos;s innovation community.
        </p>
      </LegalSection>

      <LegalSection title="3. Data sharing">
        <p>
          We do not sell your personal information. We may share data with service providers who
          help us operate the platform under confidentiality obligations. Profile information you
          choose to make visible may appear in the community directory for other members.
        </p>
      </LegalSection>

      <LegalSection title="4. Data security">
        <p>
          We use appropriate technical and organisational measures to protect your information.
          Passwords are stored using industry-standard hashing.
        </p>
      </LegalSection>

      <LegalSection title="5. Data retention">
        <p>
          We retain your information while your account is active or as needed to provide services.
          You may request deletion of your account and associated data at any time.
        </p>
      </LegalSection>

      <LegalSection title="6. Your rights">
        <p>
          You may access, correct, or delete your personal information, or request a copy of data we
          hold. Contact us at <LegalLink href={`mailto:${HUB_PUBLIC_EMAIL}`}>{HUB_PUBLIC_EMAIL}</LegalLink>.
        </p>
      </LegalSection>

      <LegalSection title="7. Cookies">
        <p>
          We use session cookies required for authentication and platform functionality. We do not
          use third-party advertising or tracking cookies.
        </p>
      </LegalSection>

      <LegalSection title="8. Contact">
        <p>
          For privacy questions, email{" "}
          <LegalLink href={`mailto:${HUB_PUBLIC_EMAIL}`}>{HUB_PUBLIC_EMAIL}</LegalLink> or visit{" "}
          <LegalLink href="https://nairobi.impacthub.net">nairobi.impacthub.net</LegalLink>.
        </p>
      </LegalSection>

      <p className="border-t border-[#edeff2] pt-6 text-[#1c395c]/75">
        See also our{" "}
        <Link href="/terms" className="font-medium text-[#812926] hover:underline">
          Terms of Service
        </Link>
        .
      </p>
    </PublicPageShell>
  )
}
