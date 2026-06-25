import { getEmailStaffTo } from "./config"
import { sendEmail, type SendEmailResult } from "./send"
import {
  escapeHtml,
  layoutEmail,
  emailGreeting,
  emailParagraph,
  emailDetailCard,
  emailMutedNote,
} from "./templates"
import { getAppBaseUrl } from "@/lib/app-url"
import {
  ORGANISATIONAL_DISCOVERY_CALL_URL,
  ORGANISATIONAL_PLAN_NAME,
  ORGANISATIONAL_RESPONSE_SLA,
} from "@/lib/membership-inquiry"

export type OrganisationalRegistrationPayload = {
  email: string
  name?: string | null
}

function memberLabel(params: OrganisationalRegistrationPayload): string {
  return params.name?.trim()
    ? `${escapeHtml(params.name.trim())} (${escapeHtml(params.email)})`
    : escapeHtml(params.email)
}

export function buildOrganisationalRegistrationPlainText(
  params: OrganisationalRegistrationPayload
): string {
  return [
    `${ORGANISATIONAL_PLAN_NAME} membership — new platform registration`,
    "",
    params.name?.trim() ? `Name: ${params.name.trim()}` : "",
    `Email: ${params.email}`,
    "",
    "Follow up to scope bespoke partnership engagement.",
  ]
    .filter(Boolean)
    .join("\n")
}

export async function sendOrganisationalRegistrationStaffEmail(
  params: OrganisationalRegistrationPayload
): Promise<SendEmailResult> {
  const submitted = new Intl.DateTimeFormat("en-KE", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Africa/Nairobi",
  }).format(new Date())

  const bodyHtml = `
    ${emailParagraph(
      `New <strong>${escapeHtml(ORGANISATIONAL_PLAN_NAME)}</strong> member registered on the platform. Please follow up ${escapeHtml(ORGANISATIONAL_RESPONSE_SLA)} to discuss scope and pricing.`
    )}
    ${emailMutedNote(`${escapeHtml(submitted)} (Nairobi)`)}
    ${emailDetailCard([{ label: "Member", value: memberLabel(params) }], { title: "Registration" })}
    ${emailMutedNote(
      `Optional partnership call: <a href="${escapeHtml(ORGANISATIONAL_DISCOVERY_CALL_URL)}" style="color:#A6192E;font-weight:600;text-decoration:none;">Community Office Hours</a>`
    )}
  `

  return sendEmail({
    to: getEmailStaffTo(),
    subject: `[Membership] ${ORGANISATIONAL_PLAN_NAME} — registration — ${params.email}`,
    html: layoutEmail({
      preheader: `New ${ORGANISATIONAL_PLAN_NAME} registration`,
      title: "Organisational registration",
      eyebrow: "Membership",
      bodyHtml,
    }),
    text: buildOrganisationalRegistrationPlainText(params),
    replyTo: params.email,
  })
}

export async function sendOrganisationalRegistrationWelcomeEmail(
  params: OrganisationalRegistrationPayload
): Promise<SendEmailResult> {
  const firstName = params.name?.trim().split(/\s+/)[0]
  const appUrl = getAppBaseUrl()
  const onboardingUrl = `${appUrl}/onboarding?intent=organisational`

  const bodyHtml = `
    ${emailGreeting(firstName)}
    ${emailParagraph(
      `Welcome to Impact Hub Nairobi. Your account for <strong>${escapeHtml(ORGANISATIONAL_PLAN_NAME)}</strong> membership is ready.`
    )}
    ${emailParagraph(
      `Sign in and complete your profile (including your organisation) so our partnerships team can tailor your engagement. We typically respond ${escapeHtml(ORGANISATIONAL_RESPONSE_SLA)}.`
    )}
    ${emailDetailCard(
      [{ label: "Next step", value: "Complete your organisation profile" }],
      { title: "Getting started" }
    )}
    ${emailMutedNote(
      `You may also book a short call: <a href="${escapeHtml(ORGANISATIONAL_DISCOVERY_CALL_URL)}" style="color:#A6192E;font-weight:600;text-decoration:none;">Community Office Hours</a>`
    )}
  `

  return sendEmail({
    to: params.email,
    subject: `Welcome — ${ORGANISATIONAL_PLAN_NAME} membership`,
    html: layoutEmail({
      preheader: `Complete your profile — we respond ${ORGANISATIONAL_RESPONSE_SLA}`,
      title: "You're registered",
      eyebrow: "Membership",
      bodyHtml,
      ctaLabel: "Complete your profile",
      ctaUrl: onboardingUrl,
    }),
    text: [
      firstName ? `Hi ${firstName},` : "Hi,",
      `Your ${ORGANISATIONAL_PLAN_NAME} account is ready. Complete your profile: ${onboardingUrl}`,
      `Our partnerships team will follow up ${ORGANISATIONAL_RESPONSE_SLA}.`,
      `Optional call: ${ORGANISATIONAL_DISCOVERY_CALL_URL}`,
    ].join("\n"),
  })
}
