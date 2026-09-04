import Link from "next/link"
import { HUB_MAILING_ADDRESS, HUB_PUBLIC_EMAIL, HUB_PUBLIC_PHONE } from "@/lib/hub-contact"
import { LegalLink, LegalList, LegalSection, PublicPageShell } from "@/components/public/public-page-shell"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Policy — Impact Hub Nairobi",
  description:
    "How Impact Hub Nairobi collects, uses, shares, and protects personal data on the community platform, and the rights available to you under Kenyan and international privacy law.",
}

const LAST_UPDATED = "4 September 2026"

const TOC = [
  ["controller", "1. Who we are"],
  ["scope", "2. Scope"],
  ["data", "3. Personal data we collect"],
  ["sources", "4. How we obtain data"],
  ["purposes", "5. Why we use data"],
  ["legal-bases", "6. Legal bases"],
  ["directory", "7. Directory and visibility"],
  ["sharing", "8. Sharing and processors"],
  ["transfers", "9. International transfers"],
  ["cookies", "10. Cookies and similar technologies"],
  ["payments", "11. Payments"],
  ["retention", "12. Retention"],
  ["security", "13. Security"],
  ["children", "14. Children"],
  ["rights", "15. Your rights"],
  ["decisions", "16. Automated decisions"],
  ["marketing", "17. Marketing"],
  ["third-party", "18. Third-party sites"],
  ["changes", "19. Changes"],
  ["complaints", "20. Complaints"],
  ["contact", "21. Contact"],
] as const

export default function PrivacyPage() {
  return (
    <PublicPageShell title="Privacy Policy" updated={LAST_UPDATED}>
      <p>
        This Privacy Policy explains how <strong>Impact Hub Nairobi</strong> (&ldquo;IHN&rdquo;,
        &ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;) collects, uses, stores, shares, and
        protects personal data when you use the community platform at{" "}
        <LegalLink href="https://www.impacthubnairobi.com">www.impacthubnairobi.com</LegalLink>,
        related web applications, and any official mobile application (together, the{" "}
        <strong>&ldquo;Platform&rdquo;</strong>).
      </p>
      <p>
        We designed this notice to meet a global standard of transparency, including the Kenya{" "}
        <strong>Data Protection Act, 2019</strong> and the Data Protection (General) Regulations,
        2021, and — where they apply to you — principles aligned with the EU/UK GDPR, and US state
        privacy laws such as the California Consumer Privacy Act (as amended). Some rights apply
        only if the relevant law covers you.
      </p>
      <p>
        Related documents:{" "}
        <Link href="/terms" className="font-medium text-[#812926] hover:underline">
          Terms of Service
        </Link>
        .
      </p>

      <nav aria-label="Contents" className="rounded-lg border border-[#edeff2] bg-white px-5 py-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#812926]">
          Contents
        </p>
        <ol className="grid gap-1 text-sm sm:grid-cols-2">
          {TOC.map(([id, label]) => (
            <li key={id}>
              <a href={`#${id}`} className="text-[#1c395c] hover:text-[#812926] hover:underline">
                {label}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <LegalSection id="controller" title="1. Who we are (data controller)">
        <p>
          Impact Hub Nairobi is the data controller for personal data processed to operate the
          Platform, membership, events, and workspace operations described here.
        </p>
        <p>
          Address: {HUB_MAILING_ADDRESS}
          <br />
          Privacy / general contact:{" "}
          <LegalLink href={`mailto:${HUB_PUBLIC_EMAIL}`}>{HUB_PUBLIC_EMAIL}</LegalLink>
          <br />
          Phone: <LegalLink href="tel:+254708298856">{HUB_PUBLIC_PHONE}</LegalLink>
        </p>
        <p>
          We are part of the global Impact Hub network. Other Impact Hub locations are typically
          independent organisations. We do <strong>not</strong> share your member profile with other
          hubs by default. Sharing with a network programme or partner happens only as described in
          this Policy (for example if you apply to that programme).
        </p>
      </LegalSection>

      <LegalSection id="scope" title="2. Scope">
        <p>This Policy applies to:</p>
        <LegalList>
          <li>members, invited users, and organisational contacts who create a Platform account;</li>
          <li>people who book workspace, register for events, or submit applications or forms;</li>
          <li>newsletter subscribers and people who email or call us;</li>
          <li>visitors you host, where you provide their details for front-desk operations;</li>
          <li>public website visitors (limited technical data such as logs and essential cookies).</li>
        </LegalList>
        <p>
          It does not apply to third-party websites, payment-provider hosted checkout pages, or
          other organisations&apos; processing after you leave the Platform, except for processors
          acting on our instructions.
        </p>
      </LegalSection>

      <LegalSection id="data" title="3. Personal data we collect">
        <p>Depending on how you use the Platform, we may process the following categories:</p>
        <LegalList>
          <li>
            <strong>Identity and contact:</strong> name, email address, phone number, organisation,
            role, location, profile photo.
          </li>
          <li>
            <strong>Account:</strong> hashed password, email verification status, session tokens,
            Terms acceptance timestamp, last active time.
          </li>
          <li>
            <strong>Profile and community:</strong> member type, sector, skills, interests,
            availability, short intro, LinkedIn URL, project and venture information, connections
            and follows.
          </li>
          <li>
            <strong>Membership and billing:</strong> plan or tier, invoices, payment status, payment
            provider references, and limited payment-method metadata (for example card brand and
            last four digits). We do not store full card PAN or CVV.
          </li>
          <li>
            <strong>Workspace operations:</strong> bookings, check-ins, desk assignments, visitor
            records you submit (visitor name and optional email, phone, company, purpose, time).
          </li>
          <li>
            <strong>Events and programmes:</strong> registrations, attendance, application answers,
            and related communications.
          </li>
          <li>
            <strong>Communications:</strong> notification preferences, emails we send and related
            delivery events, support correspondence.
          </li>
          <li>
            <strong>Technical:</strong> IP address, device/browser type, approximate location derived
            from IP, app version, crash or error logs, and security logs (for example rate-limit
            events).
          </li>
          <li>
            <strong>Optional investor metadata</strong> if you choose to provide it (ticket size,
            sector focus, thesis). Treat this as sensitive commercial information; share only what
            you are comfortable making available to authorised community use.
          </li>
        </LegalList>
        <p>
          We do not seek to collect special-category data (for example health, religion, or
          biometric templates) as a core Platform feature. If you include such data in a free-text
          field, we will process it only as needed to host that content and respond to your
          request.
        </p>
      </LegalSection>

      <LegalSection id="sources" title="4. How we obtain data">
        <LegalList>
          <li>
            <strong>Directly from you</strong> — registration, onboarding, profile edits, bookings,
            payments, event sign-up, applications, and support.
          </li>
          <li>
            <strong>From staff or an organisation</strong> — if you are invited as a member or named
            on an organisational account.
          </li>
          <li>
            <strong>Automatically</strong> — cookies, sessions, server logs, and (in the mobile app)
            basic device information needed to run the app.
          </li>
          <li>
            <strong>From payment providers</strong> — confirmation that a payment succeeded or
            failed, and limited card/M-Pesa metadata.
          </li>
          <li>
            <strong>From you about others</strong> — visitor or teammate details you submit. You
            must have a lawful basis to provide another person&apos;s data (typically their
            knowledge and a legitimate operational need).
          </li>
        </LegalList>
      </LegalSection>

      <LegalSection id="purposes" title="5. Why we use personal data">
        <p>We use personal data to:</p>
        <LegalList>
          <li>create and secure your account, verify email, and authenticate sessions;</li>
          <li>complete onboarding and show you in the member directory as you configured;</li>
          <li>process bookings, check-ins, visitors, memberships, invoices, and payments;</li>
          <li>register you for events and programmes and send related operational updates;</li>
          <li>enable connections, follows, project pages, and community features;</li>
          <li>
            notify hub staff of operational events (for example new members, booking payments,
            programme applications) so they can deliver services;
          </li>
          <li>send service emails and, where permitted, newsletters or community news;</li>
          <li>improve safety, prevent fraud and abuse, and debug the Platform;</li>
          <li>comply with legal, tax, accounting, and regulatory duties;</li>
          <li>establish, exercise, or defend legal claims.</li>
        </LegalList>
        <p>We do not sell your personal data.</p>
      </LegalSection>

      <LegalSection id="legal-bases" title="6. Legal bases (Kenya DPA and GDPR-aligned)">
        <p>Where a legal basis is required, we rely on:</p>
        <LegalList>
          <li>
            <strong>Performance of a contract</strong> — providing the account, membership,
            bookings, and features you request (Kenya DPA s.30; GDPR Art. 6(1)(b)).
          </li>
          <li>
            <strong>Consent</strong> — for example accepting these notices at registration,
            optional marketing emails, and certain optional profile fields (s.32; Art. 6(1)(a)).
            You may withdraw consent without affecting processing already carried out.
          </li>
          <li>
            <strong>Legitimate interests</strong> — securing the Platform, preventing abuse,
            limited community matching, and improving services, balanced against your rights
            (s.29; Art. 6(1)(f)).
          </li>
          <li>
            <strong>Legal obligation</strong> — tax, accounting, and responding to lawful requests
            (Art. 6(1)(c) and equivalent Kenyan duties).
          </li>
        </LegalList>
        <p>
          For California residents: we do not “sell” or “share” personal information for
          cross-context behavioural advertising as those terms are defined in the CCPA/CPRA. We
          do not use or disclose sensitive personal information for purposes that require a
          right-to-limit notice beyond providing the services you request.
        </p>
      </LegalSection>

      <LegalSection id="directory" title="7. Community directory and visibility">
        <p>
          Authenticated members can typically see directory information such as your name, photo,
          organisation, role, sector, skills, interests, bio, and LinkedIn profile. Your{" "}
          <strong>mobile number is collected for hub staff operations and is not shown</strong> on
          the public or member directory.
        </p>
        <p>
          Do not post contact details you are unwilling to share with other members. You can edit
          or remove most profile fields in Profile settings. Some operational records (bookings,
          invoices) remain visible to you and to authorised staff.
        </p>
      </LegalSection>

      <LegalSection id="sharing" title="8. Sharing, processors and disclosures">
        <p>We share personal data only as needed:</p>
        <LegalList>
          <li>
            <strong>Other members</strong> — directory and content you choose to make visible;
            connection requests you send or accept.
          </li>
          <li>
            <strong>IHN staff</strong> — community, programmes, space, and finance teams with
            role-based access.
          </li>
          <li>
            <strong>Service providers (processors)</strong> acting on our instructions, including
            cloud hosting and content delivery (for example Vercel), database hosting (for example
            Neon), email delivery, image storage, error/security tooling, and payment processing
            (for example Paystack for card and M-Pesa). They may process data in Kenya or other
            countries where they operate.
          </li>
          <li>
            <strong>Programme or event partners</strong> — only data you submit for that
            application or event, or that is necessary to deliver it.
          </li>
          <li>
            <strong>Professional advisers and authorities</strong> — where required by law, court
            order, or to protect rights, safety, and security.
          </li>
          <li>
            <strong>Business transfers</strong> — if we reorganise, transfer operations, or similar,
            data may transfer to the successor under equivalent protections.
          </li>
        </LegalList>
        <p>
          We require processors to implement appropriate confidentiality and security measures.
          We do not allow them to use your data for their own unrelated marketing.
        </p>
      </LegalSection>

      <LegalSection id="transfers" title="9. International data transfers">
        <p>
          The Platform is operated from Kenya. Hosting, email, and payment providers may store or
          access data in other countries (including the European Economic Area, the United Kingdom,
          and the United States).
        </p>
        <p>
          Where we transfer personal data out of Kenya, we do so in line with the Data Protection
          Act, 2019 (including adequacy, appropriate safeguards, or another lawful transfer
          mechanism). Where GDPR applies, we use appropriate safeguards such as standard
          contractual clauses with processors where required.
        </p>
      </LegalSection>

      <LegalSection id="cookies" title="10. Cookies and similar technologies">
        <p>
          We use <strong>essential</strong> cookies and similar storage to keep you signed in,
          protect against abuse (for example rate limiting), and remember session state. These are
          necessary for the Platform to function.
        </p>
        <p>
          We do <strong>not</strong> use third-party advertising cookies or sell browsing data to
          ad networks. Embedded third-party content (for example maps or payment checkout) may set
          their own cookies under their policies.
        </p>
        <p>
          You can block cookies in your browser; essential cookies cannot be disabled without
          breaking sign-in. The mobile app uses local storage and secure session tokens rather than
          browser cookies.
        </p>
      </LegalSection>

      <LegalSection id="payments" title="11. Payments">
        <p>
          When you pay for membership, bookings, or other fees, you are redirected to or processed
          by a regulated payment provider (currently including Paystack). Card data is entered on
          the provider&apos;s systems. We receive payment status, amount, currency, and limited
          method metadata.
        </p>
        <p>
          The provider is an independent controller or a processor depending on the transaction.
          Read their privacy notice before paying. M-Pesa transactions are also subject to the
          mobile-money operator&apos;s terms.
        </p>
      </LegalSection>

      <LegalSection id="retention" title="12. Retention">
        <p>
          We keep personal data only as long as needed for the purposes above, including:
        </p>
        <LegalList>
          <li>
            <strong>Account and profile</strong> — for the life of the account, then deleted or
            irreversibly anonymised after a short winding-up period unless law requires longer.
          </li>
          <li>
            <strong>Bookings, invoices, and payments</strong> — typically for the statutory
            accounting and tax period in Kenya (often up to seven years).
          </li>
          <li>
            <strong>Security and server logs</strong> — for a limited period to investigate
            incidents and abuse.
          </li>
          <li>
            <strong>Newsletter data</strong> — until you unsubscribe, plus a minimal suppression
            record so we do not email you again.
          </li>
        </LegalList>
        <p>
          When you delete your account from Profile (or we delete it on request), we remove or
          anonymise profile, community, and login data that is not required for legal, security, or
          financial records.
        </p>
      </LegalSection>

      <LegalSection id="security" title="13. Security">
        <p>
          We use technical and organisational measures appropriate to the risk, including HTTPS,
          hashed passwords, role-based staff access, and rate limiting. No method of transmission
          or storage is 100% secure. Please use a unique password and tell us promptly of suspected
          unauthorised access.
        </p>
        <p>
          In the event of a personal-data breach that meets the legal threshold, we will notify the
          Office of the Data Protection Commissioner and affected individuals as required by Kenyan
          law, and other authorities where applicable.
        </p>
      </LegalSection>

      <LegalSection id="children" title="14. Children">
        <p>
          The Platform is for users aged 18 and over. We do not knowingly collect personal data
          from children. If you believe a child has created an account, contact us and we will
          delete it.
        </p>
      </LegalSection>

      <LegalSection id="rights" title="15. Your rights">
        <p>
          Subject to the Kenya Data Protection Act and any other law that applies to you, you may
          have the right to:
        </p>
        <LegalList>
          <li>be informed about how we process your data (this Policy);</li>
          <li>access a copy of personal data we hold about you;</li>
          <li>rectify inaccurate or incomplete data (you can edit much of this in Profile);</li>
          <li>erase data in the circumstances the law allows (including account deletion);</li>
          <li>restrict or object to certain processing;</li>
          <li>data portability, where technically feasible and legally required;</li>
          <li>withdraw consent where processing is based on consent;</li>
          <li>not be subject to a decision based solely on automated processing that produces legal or similarly significant effects, except as the law allows;</li>
          <li>
            lodge a complaint with a supervisory authority (see section 20).
          </li>
        </LegalList>
        <p>
          To exercise rights, email{" "}
          <LegalLink href={`mailto:${HUB_PUBLIC_EMAIL}`}>{HUB_PUBLIC_EMAIL}</LegalLink> from your
          account email, or use in-product tools (Profile edit, notification settings, account
          deletion, newsletter unsubscribe). We may need to verify your identity. We will respond
          within the time required by applicable law (under the Kenya DPA, generally without undue
          delay and within statutory limits).
        </p>
        <p>
          We may refuse or charge a reasonable fee for requests that are manifestly unfounded,
          excessive, or repetitive, as the law permits.
        </p>
      </LegalSection>

      <LegalSection id="decisions" title="16. Automated processing">
        <p>
          We may use limited automated logic to assign membership tiers from plan payments, send
          reminders, or recommend community content. These processes do not produce legal effects
          comparable to credit scoring or automated refusal of a fundamental right. Staff remain
          involved in programme admissions, partnership decisions, and enforcement actions.
        </p>
      </LegalSection>

      <LegalSection id="marketing" title="17. Marketing and newsletters">
        <p>
          Transactional and service messages (verification, bookings, payments, security) are sent
          because they are necessary to perform the contract.
        </p>
        <p>
          Community members are subscribed to the Impact Hub Nairobi newsletter when they create or
          activate an account (lawful bases: contract and consent given at registration). Newsletter
          emails include an unsubscribe link. Unsubscribing from the newsletter does not stop
          service messages while your account remains open.
        </p>
        <p>
          Other marketing emails are sent only with a lawful basis (typically additional consent)
          and include an unsubscribe mechanism.
        </p>
      </LegalSection>

      <LegalSection id="third-party" title="18. Third-party sites and SDKs">
        <p>
          Links, maps, calendars, and payment pages are operated by third parties with their own
          privacy notices. The mobile app may use platform services provided by Apple or Google
          (for example push delivery). Those providers process data under their terms.
        </p>
      </LegalSection>

      <LegalSection id="changes" title="19. Changes to this Policy">
        <p>
          We may update this Policy from time to time. The &ldquo;Last updated&rdquo; date will
          change. For material changes, we will take reasonable steps to notify you (email or
          in-product notice). Continued use after the effective date means you acknowledge the
          updated Policy.
        </p>
      </LegalSection>

      <LegalSection id="complaints" title="20. Complaints and supervisory authorities">
        <p>
          Please contact us first so we can try to resolve your concern. You also have the right to
          complain to:
        </p>
        <LegalList>
          <li>
            <strong>Kenya:</strong> Office of the Data Protection Commissioner (ODPC) —{" "}
            <LegalLink href="https://www.odpc.go.ke">www.odpc.go.ke</LegalLink>
          </li>
          <li>
            <strong>EEA/UK:</strong> your local data protection authority, if GDPR/UK GDPR applies
            to the processing.
          </li>
        </LegalList>
      </LegalSection>

      <LegalSection id="contact" title="21. Contact">
        <p>
          Data controller: Impact Hub Nairobi
          <br />
          {HUB_MAILING_ADDRESS}
          <br />
          <LegalLink href={`mailto:${HUB_PUBLIC_EMAIL}`}>{HUB_PUBLIC_EMAIL}</LegalLink>
          {" · "}
          {HUB_PUBLIC_PHONE}
          <br />
          Website:{" "}
          <LegalLink href="https://nairobi.impacthub.net">nairobi.impacthub.net</LegalLink>
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
