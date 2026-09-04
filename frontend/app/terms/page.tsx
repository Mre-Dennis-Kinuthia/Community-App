import Link from "next/link"
import { HUB_MAILING_ADDRESS, HUB_PUBLIC_EMAIL, HUB_PUBLIC_PHONE } from "@/lib/hub-contact"
import { LegalLink, LegalList, LegalSection, PublicPageShell } from "@/components/public/public-page-shell"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Terms of Service — Impact Hub Nairobi",
  description:
    "Terms of Service for the Impact Hub Nairobi community platform, including membership, bookings, payments, community conduct, and account rules.",
}

const LAST_UPDATED = "4 September 2026"

const TOC = [
  ["acceptance", "1. Agreement to these Terms"],
  ["who-we-are", "2. Who we are"],
  ["eligibility", "3. Eligibility"],
  ["the-platform", "4. The Platform"],
  ["accounts", "5. Accounts"],
  ["membership", "6. Membership"],
  ["community", "7. Community, directory and networking"],
  ["events", "8. Events, programmes and applications"],
  ["workspace", "9. Workspace, bookings and visitors"],
  ["payments", "10. Fees and payments"],
  ["content", "11. Your content"],
  ["ip", "12. Our intellectual property"],
  ["conduct", "13. Acceptable use"],
  ["communications", "14. Communications"],
  ["third-parties", "15. Third-party services"],
  ["mobile", "16. Mobile applications"],
  ["disclaimers", "17. Disclaimers"],
  ["liability", "18. Limitation of liability"],
  ["indemnity", "19. Indemnity"],
  ["suspension", "20. Suspension and termination"],
  ["changes", "21. Changes"],
  ["general", "22. General"],
  ["governing-law", "23. Governing law"],
  ["contact", "24. Contact"],
] as const

export default function TermsPage() {
  return (
    <PublicPageShell title="Terms of Service" updated={LAST_UPDATED}>
      <p>
        These Terms of Service (the <strong>&ldquo;Terms&rdquo;</strong>) govern access to and use
        of the Impact Hub Nairobi community platform, including the website at{" "}
        <LegalLink href="https://www.impacthubnairobi.com">www.impacthubnairobi.com</LegalLink>,
        related web applications, APIs, and any official mobile application (together, the{" "}
        <strong>&ldquo;Platform&rdquo;</strong>).
      </p>
      <p>
        By creating an account, accepting an invitation, ticking the Terms checkbox, signing in, or
        otherwise using the Platform, you agree to these Terms and to our{" "}
        <Link href="/privacy" className="font-medium text-[#812926] hover:underline">
          Privacy Policy
        </Link>
        . If you do not agree, do not use the Platform.
      </p>
      <p>
        If you use the Platform on behalf of an organisation, you confirm that you have authority to
        bind that organisation, and <strong>&ldquo;you&rdquo;</strong> includes both you and that
        organisation.
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

      <LegalSection id="acceptance" title="1. Agreement to these Terms">
        <p>
          These Terms form a legally binding agreement between you and Impact Hub Nairobi
          (&ldquo;IHN&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;). Additional
          terms may apply to specific products — for example workspace house rules, event tickets,
          membership plans, or programme participation agreements. If those terms conflict with
          these Terms for that product only, the product-specific terms prevail for that product.
        </p>
        <p>
          We may refuse, suspend, or limit access where reasonably necessary to protect the
          community, comply with law, or operate the Platform safely.
        </p>
      </LegalSection>

      <LegalSection id="who-we-are" title="2. Who we are">
        <p>
          The Platform is operated by <strong>Impact Hub Nairobi</strong>, a community, programmes,
          and workspace operator based in Nairobi, Kenya, and part of the global Impact Hub
          network. Impact Hub Nairobi is independently operated and is not the operator of other
          Impact Hub locations unless we say so in writing.
        </p>
        <p>
          Registered / mailing address: {HUB_MAILING_ADDRESS}.
          <br />
          Public contact:{" "}
          <LegalLink href={`mailto:${HUB_PUBLIC_EMAIL}`}>{HUB_PUBLIC_EMAIL}</LegalLink>
          {" · "}
          <LegalLink href={`tel:+254708298856`}>{HUB_PUBLIC_PHONE}</LegalLink>
        </p>
      </LegalSection>

      <LegalSection id="eligibility" title="3. Eligibility and capacity">
        <p>You may use the Platform only if all of the following are true:</p>
        <LegalList>
          <li>you are at least 18 years old;</li>
          <li>you have legal capacity to enter a binding contract;</li>
          <li>
            you are not prohibited from using the Platform under Kenyan law or the laws of your
            country of residence;
          </li>
          <li>
            if you register as an organisational member or partner, you are duly authorised to act
            for that organisation.
          </li>
        </LegalList>
        <p>
          The Platform is not directed at children. We do not knowingly create member accounts for
          anyone under 18.
        </p>
      </LegalSection>

      <LegalSection id="the-platform" title="4. The Platform">
        <p>
          The Platform helps members and partners of Impact Hub Nairobi to, among other things:
        </p>
        <LegalList>
          <li>create a member profile and appear in the community directory;</li>
          <li>connect with other members, follow projects, and share ventures;</li>
          <li>register for events, programmes, and community activities;</li>
          <li>book coworking desks, meeting rooms, and related workspace resources;</li>
          <li>check in, host visitors, and manage related workspace activity;</li>
          <li>apply for or manage membership plans (including paid tiers);</li>
          <li>receive news, notifications, and operational communications;</li>
          <li>pay invoices and membership or booking fees through approved providers.</li>
        </LegalList>
        <p>
          Features may change, be limited by membership tier, or depend on availability at our
          physical locations. We do not guarantee that any particular feature will remain available
          or that workspace, events, or programmes will have capacity.
        </p>
        <p>
          The Platform is a community and operations tool. It is not a bank, payment institution,
          investment adviser, law firm, or employment agency. Listings, member profiles, projects,
          and conversations are not offers, endorsements, or due-diligence by IHN unless we
          expressly say so.
        </p>
      </LegalSection>

      <LegalSection id="accounts" title="5. Accounts and security">
        <p>
          You must provide accurate information when you register and keep your profile reasonably
          up to date. You are responsible for activity under your account, including bookings,
          messages, and payments initiated while signed in.
        </p>
        <LegalList>
          <li>Keep your password confidential and use a strong, unique password.</li>
          <li>Do not share your login or allow others to impersonate you.</li>
          <li>
            Notify us promptly at{" "}
            <LegalLink href={`mailto:${HUB_PUBLIC_EMAIL}`}>{HUB_PUBLIC_EMAIL}</LegalLink> if you
            suspect unauthorised access.
          </li>
          <li>One person per member account unless we agree otherwise in writing.</li>
        </LegalList>
        <p>
          We may require email verification before certain features are available. We may disable
          accounts that appear abandoned, compromised, or created through automated or abusive
          means.
        </p>
        <p>
          You may delete your account from Profile settings where that option is available, or by
          contacting us. Deletion is described further in the Privacy Policy. Some records (for
          example invoices, attendance, or legally required logs) may be retained as permitted by
          law.
        </p>
      </LegalSection>

      <LegalSection id="membership" title="6. Membership plans and organisational accounts">
        <p>
          Free community access, paid plans (such as Star Connect), and organisational / partnership
          memberships may have different benefits, fees, and approval steps. Plan descriptions on
          the Platform are invitations to treat and may be updated.
        </p>
        <p>
          Paid membership is not activated until we (or our payment provider) confirm successful
          payment and any required approval. We may decline or reverse a plan where payment fails,
          information is misleading, or the applicant does not meet plan criteria.
        </p>
        <p>
          Organisational membership does not automatically grant every employee an individual
          Platform account. Named users must register or be invited. The organisation is responsible
          for its authorised users&apos; compliance with these Terms.
        </p>
        <p>
          Membership of the Platform is separate from any licence to use another Impact Hub
          worldwide, unless a written network arrangement says otherwise.
        </p>
      </LegalSection>

      <LegalSection id="community" title="7. Community directory, connections and projects">
        <p>
          Profile fields you submit (such as name, photo, organisation, role, sector, skills,
          interests, bio, and LinkedIn URL) may be visible to other authenticated members in the
          directory and on your public member profile, except fields we designate as staff-only
          (for example your mobile number).
        </p>
        <p>
          You must not harvest, scrape, or use other members&apos; contact details for unsolicited
          marketing, recruiting spam, or any purpose unrelated to genuine community collaboration.
          Connection and follow tools are for professional community use, not bulk outreach.
        </p>
        <p>
          Project, venture, and investment-interest information is provided by members. IHN does not
          warrant its accuracy, completeness, or fitness for any investment or commercial decision.
          You deal with other members at your own risk.
        </p>
      </LegalSection>

      <LegalSection id="events" title="8. Events, programmes and applications">
        <p>
          Event registration, programme applications, and related forms may be subject to capacity,
          eligibility, tickets, or additional rules published for that activity. We may change
          speakers, venue, format, or timing, or cancel an activity, and will take reasonable steps
          to notify registered participants.
        </p>
        <p>
          Unless a specific event policy says otherwise, Platform registration does not guarantee
          entry if you arrive late, violate house rules, or if the event is full. Photographs or
          recordings may be taken at public community events; if you do not wish to appear, tell
          event staff on arrival.
        </p>
        <p>
          Confidential information shared in closed programmes, working groups, or member sessions
          must not be disclosed outside that context without permission.
        </p>
      </LegalSection>

      <LegalSection id="workspace" title="9. Workspace bookings, check-in and visitors">
        <p>
          Desk, room, and space bookings are subject to availability, membership entitlements,
          opening hours, and Impact Hub Nairobi house rules. A booking is confirmed only when the
          Platform shows confirmation and any required payment has succeeded.
        </p>
        <LegalList>
          <li>
            Cancellation and no-show rules are shown at booking or in the applicable membership
            policy. Repeated no-shows or misuse may restrict booking privileges.
          </li>
          <li>
            You must use rooms only for the booked purpose and leave spaces in a reasonable
            condition.
          </li>
          <li>
            Check-in, desk assignment, and access-control features exist for operations and safety.
            Circumventing them is prohibited.
          </li>
          <li>
            If you host a visitor, you are responsible for that visitor while on the premises and
            for providing accurate visitor details.
          </li>
        </LegalList>
        <p>
          Physical access to the hub is a licence, not a tenancy, unless a separate written
          occupancy agreement says otherwise.
        </p>
      </LegalSection>

      <LegalSection id="payments" title="10. Fees, payments and taxes">
        <p>
          Fees for membership, bookings, events, or other products are displayed before you pay.
          Unless stated otherwise, amounts are in Kenyan Shillings (KES) and may include applicable
          taxes.
        </p>
        <p>
          Card and M-Pesa payments are processed by approved third-party providers (currently
          including Paystack). We do not store full payment-card numbers on the Platform. Your use
          of a payment provider is also subject to that provider&apos;s terms.
        </p>
        <p>
          You authorise us and the provider to charge the selected method for the amounts you
          confirm. Failed, reversed, or fraudulent payments may result in cancelled bookings or
          suspended membership.
        </p>
        <p>
          Refunds, if any, follow the policy shown at purchase, the applicable membership or
          booking rules, and Kenyan consumer law that cannot be excluded. Chargebacks made in bad
          faith may be treated as a breach of these Terms.
        </p>
        <p>
          Invoices, receipts, and payment-method last-four digits may be stored for accounting,
          tax, and dispute handling.
        </p>
      </LegalSection>

      <LegalSection id="content" title="11. Your content">
        <p>
          You retain ownership of content you submit (profiles, photos, bios, projects, comments,
          applications, and similar) (<strong>&ldquo;User Content&rdquo;</strong>). You grant IHN a
          worldwide, non-exclusive, royalty-free licence to host, store, reproduce, display, and
          communicate User Content as needed to operate the Platform, moderate the community, and
          (where you have made it visible) show it to other members.
        </p>
        <p>
          You represent that you have all rights needed to submit User Content, that it is accurate
          to the best of your knowledge, and that it does not infringe others&apos; rights or
          applicable law.
        </p>
        <p>
          We may remove or restrict User Content that violates these Terms, house rules, or law, or
          that we reasonably consider harmful to the community. We are not obliged to pre-screen
          content.
        </p>
      </LegalSection>

      <LegalSection id="ip" title="12. Impact Hub intellectual property">
        <p>
          The Platform, including software, design, databases, logos, and documentation, is owned
          by IHN or its licensors. Impact Hub names and marks are used under applicable brand
          arrangements with the Impact Hub network and remain the property of their respective
          owners.
        </p>
        <p>
          You receive a limited, revocable, non-transferable licence to use the Platform for your
          own lawful membership purposes. You may not copy, scrape, reverse engineer (except where
          the law allows), or use our marks in a way that suggests endorsement without permission.
        </p>
      </LegalSection>

      <LegalSection id="conduct" title="13. Acceptable use and community standards">
        <p>You agree not to:</p>
        <LegalList>
          <li>
            harass, threaten, discriminate against, or abuse any person, or post hateful, obscene,
            or sexually exploitative content;
          </li>
          <li>impersonate another person or misrepresent your affiliation;</li>
          <li>
            upload malware, attempt unauthorised access, probe, or disrupt the Platform or other
            members&apos; devices;
          </li>
          <li>
            use bots, scrapers, or automated sign-ups except with our written consent;
          </li>
          <li>
            send spam, pyramid schemes, or unsolicited advertising through Platform tools;
          </li>
          <li>
            use the directory or messaging to process personal data of others for purposes they
            would not reasonably expect;
          </li>
          <li>violate export, sanctions, anti-bribery, or other applicable laws;</li>
          <li>
            use the hub or Platform for illegal activity, including fraud, money laundering, or
            infringement of intellectual property.
          </li>
        </LegalList>
        <p>
          We may investigate reports, cooperate with law enforcement where required, and take
          action including warnings, feature limits, suspension, or termination.
        </p>
      </LegalSection>

      <LegalSection id="communications" title="14. Communications">
        <p>
          We send service messages that are necessary to operate your account (for example
          verification, booking confirmations, payment receipts, security alerts, and membership
          notices). These are not marketing and you cannot opt out of them while you have an
          account, except by closing the account.
        </p>
        <p>
          Newsletters and optional promotional messages are sent only where permitted by law.
          Community members are subscribed to the Impact Hub Nairobi newsletter when they join; you
          can unsubscribe at any time using the link in those emails. Unsubscribing from the
          newsletter does not stop service messages while your account remains open.
        </p>
      </LegalSection>

      <LegalSection id="third-parties" title="15. Third-party services and links">
        <p>
          The Platform may link to or embed third-party services (for example payment checkout,
          maps, calendar links, or social networks). Those services are not under our control. Your
          use of them is governed by their terms and privacy notices. We are not responsible for
          third-party content, availability, or practices, except to the extent the law requires.
        </p>
      </LegalSection>

      <LegalSection id="mobile" title="16. Mobile applications">
        <p>
          If you use an official Impact Hub Nairobi mobile app, these Terms apply in addition to
          the app store&apos;s terms. App stores (such as Apple or Google) are not parties to these
          Terms and have no obligation to provide maintenance or support for the app. In-app
          purchases, if offered, will be described in the app or store listing.
        </p>
      </LegalSection>

      <LegalSection id="disclaimers" title="17. Disclaimers">
        <p>
          The Platform is provided on an <strong>&ldquo;as is&rdquo;</strong> and{" "}
          <strong>&ldquo;as available&rdquo;</strong> basis. To the fullest extent permitted by
          law, we disclaim implied warranties of merchantability, fitness for a particular purpose,
          title, and non-infringement.
        </p>
        <p>
          We do not warrant uninterrupted or error-free operation, that defects will be corrected
          immediately, or that the Platform is free of harmful components. Internet, hosting, and
          payment-provider outages may affect availability.
        </p>
        <p>
          Nothing in these Terms excludes liability that Kenyan law does not allow to be excluded,
          including liability for fraud or for death or personal injury caused by negligence where
          such exclusion is prohibited.
        </p>
      </LegalSection>

      <LegalSection id="liability" title="18. Limitation of liability">
        <p>
          You use the Platform, hub facilities booked through it, and any dealings with other
          members, partners, or third parties <strong>entirely at your own risk</strong>. IHN does
          not control member-to-member interactions and is not a party to them.
        </p>
        <p>
          To the maximum extent permitted by the laws of Kenya, Impact Hub Nairobi and its
          officers, directors, employees, contractors, volunteers, and agents (
          <strong>&ldquo;IHN Parties&rdquo;</strong>) have{" "}
          <strong>no liability of any kind</strong> to you or any third party, whether in contract,
          tort (including negligence), misrepresentation, strict liability, statute, equity, or
          otherwise, and whether arising from the Platform, these Terms, membership, bookings,
          events, programmes, payments, content, downtime, data loss, or any other matter.
        </p>
        <p>Without limiting the previous paragraph, the IHN Parties are not liable for:</p>
        <LegalList>
          <li>
            any loss or damage, whether direct, indirect, incidental, special, consequential,
            exemplary, or punitive;
          </li>
          <li>
            lost profits, revenue, savings, business, opportunity, goodwill, or data; business
            interruption; or cost of substitute services;
          </li>
          <li>
            personal injury, property damage, or other harm occurring on or off the premises,
            except where Kenyan law does not allow that exclusion;
          </li>
          <li>
            acts or omissions of other members, visitors, partners, payment providers (including
            Paystack and M-Pesa operators), hosting providers, or any third party;
          </li>
          <li>
            unavailability, errors, delays, security incidents, or unauthorised access, to the
            extent exclusion is permitted.
          </li>
        </LegalList>
        <p>
          If, despite the above, a court or tribunal holds that an IHN Party has any liability that
          cannot be excluded, then to the maximum extent the law allows that remaining liability
          is limited to <strong>Kenya Shillings zero (KES 0)</strong>, or if a zero cap is not
          permitted, to the <strong>lowest amount the applicable law requires</strong>. You agree
          that this allocation of risk is a fundamental basis of these Terms and that we would not
          provide the Platform on a free or paid basis without it.
        </p>
        <p>
          Nothing in this section excludes or limits liability that Kenyan law does not permit to
          be excluded or limited, including (where such a prohibition applies) liability for fraud
          or for death or personal injury caused by negligence.
        </p>
      </LegalSection>

      <LegalSection id="indemnity" title="19. Indemnity">
        <p>
          You will indemnify and hold harmless IHN from reasonable losses, damages, and costs
          (including reasonable legal fees) arising from: (a) your User Content; (b) your breach of
          these Terms; (c) your misuse of the Platform or hub premises; or (d) your violation of
          law or third-party rights, except to the extent caused by our wilful misconduct.
        </p>
      </LegalSection>

      <LegalSection id="suspension" title="20. Suspension and termination">
        <p>
          You may stop using the Platform at any time and may request account deletion as described
          above. We may suspend or terminate access immediately if you materially breach these
          Terms, if required by law, or if we discontinue the Platform.
        </p>
        <p>
          On termination, your licence to use the Platform ends. Provisions that by their nature
          should survive (including intellectual property, disclaimers, liability limits, indemnity,
          and governing law) remain in effect.
        </p>
      </LegalSection>

      <LegalSection id="changes" title="21. Changes to these Terms">
        <p>
          We may update these Terms to reflect changes in the Platform, law, or our operations. The
          &ldquo;Last updated&rdquo; date will change. For material changes, we will take
          reasonable steps to notify you (for example by email or an in-product notice).
        </p>
        <p>
          Continued use after the updated Terms take effect constitutes acceptance. If you do not
          agree, you must stop using the Platform and may delete your account.
        </p>
      </LegalSection>

      <LegalSection id="general" title="22. General">
        <LegalList>
          <li>
            <strong>Entire agreement.</strong> These Terms, the Privacy Policy, and any
            product-specific terms you accept are the entire agreement for the Platform.
          </li>
          <li>
            <strong>Severability.</strong> If a provision is unenforceable, the rest remains in
            effect.
          </li>
          <li>
            <strong>No waiver.</strong> Failure to enforce a provision is not a waiver.
          </li>
          <li>
            <strong>Assignment.</strong> You may not assign these Terms without our consent. We may
            assign them in connection with a reorganisation, transfer of operations, or similar
            event.
          </li>
          <li>
            <strong>Force majeure.</strong> We are not liable for delay or failure caused by events
            beyond our reasonable control.
          </li>
          <li>
            <strong>Language.</strong> These Terms are in English. If translated, the English
            version prevails to the extent permitted by law.
          </li>
        </LegalList>
      </LegalSection>

      <LegalSection id="governing-law" title="23. Governing law and disputes">
        <p>
          These Terms are governed by the laws of the Republic of Kenya, without regard to conflict
          of law rules. Subject to any non-waivable consumer rights in your country of residence,
          the courts of Nairobi, Kenya have exclusive jurisdiction over disputes arising from these
          Terms or the Platform.
        </p>
        <p>
          Before filing a claim, you agree to contact us and attempt to resolve the dispute in good
          faith for at least thirty (30) days, unless urgent injunctive relief is needed.
        </p>
      </LegalSection>

      <LegalSection id="contact" title="24. Contact">
        <p>
          Questions about these Terms:{" "}
          <LegalLink href={`mailto:${HUB_PUBLIC_EMAIL}`}>{HUB_PUBLIC_EMAIL}</LegalLink>
          <br />
          {HUB_MAILING_ADDRESS}
          <br />
          {HUB_PUBLIC_PHONE}
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
