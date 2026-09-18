import "server-only"

import { sendEmail, getEmailStaffTo, isEmailConfigured } from "@/lib/email"
import {
  emailGreeting,
  emailParagraph,
  layoutEmail,
  escapeHtml,
} from "@/lib/email/templates"
import { MAINTENANCE_UNTIL_LABEL } from "@/lib/maintenance"
import { capturePendingRegistrationJson } from "@/lib/pending-registration-store"

export async function queueRegistrationDuringOutage(input: {
  email: string
  firstName?: string | null
  lastName?: string | null
  name?: string | null
  organisational?: boolean
}): Promise<{ ok: true; filePath: string | null } | { ok: false; error: string }> {
  const captured = await capturePendingRegistrationJson(input)
  const { signup, json } = captured
  const name = signup.name
  const intent =
    signup.membershipIntent === "organisational"
      ? "Organisational membership"
      : "Community / Connect"

  if (!isEmailConfigured()) {
    return captured.filePath
      ? { ok: true, filePath: captured.filePath }
      : { ok: false, error: "Email is not configured" }
  }

  const staffTo = getEmailStaffTo()
  const filename = `${signup.id}.json`

  const staff = await sendEmail({
    to: staffTo,
    subject: `[New account] ${name || signup.email}`,
    skipConfiguredCc: true,
    replyTo: signup.email,
    attachments: [
      {
        filename,
        content: json,
        contentType: "application/json",
        encoding: "utf8",
      },
    ],
    html: layoutEmail({
      title: "New account created during maintenance",
      preheader: `${signup.email} submitted membership details.`,
      bodyHtml:
        emailParagraph(
          `A new member submitted account details while the platform is in maintenance. Their record is attached as JSON. Create the account when the database is back — they were told to return <strong>${escapeHtml(MAINTENANCE_UNTIL_LABEL)}</strong>.`
        ) +
        `<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:16px 0;">
          <tr><td style="padding:8px 0;font-size:14px;"><strong>Name</strong><br />${escapeHtml(name || "—")}</td></tr>
          <tr><td style="padding:8px 0;font-size:14px;"><strong>Email</strong><br />${escapeHtml(signup.email)}</td></tr>
          <tr><td style="padding:8px 0;font-size:14px;"><strong>Intent</strong><br />${escapeHtml(intent)}</td></tr>
          <tr><td style="padding:8px 0;font-size:14px;"><strong>Submitted</strong><br />${escapeHtml(signup.submittedAt)}</td></tr>
        </table>` +
        emailParagraph(`JSON file: <code>${escapeHtml(filename)}</code>`),
    }),
    text: [
      "New account created during maintenance.",
      `Name: ${name || "—"}`,
      `Email: ${signup.email}`,
      `Intent: ${intent}`,
      `Submitted: ${signup.submittedAt}`,
      `Ask them to return ${MAINTENANCE_UNTIL_LABEL}.`,
      "",
      json,
    ].join("\n"),
  })

  const applicant = await sendEmail({
    to: signup.email,
    subject: "Your Impact Hub Nairobi account — come back Monday",
    skipConfiguredCc: true,
    html: layoutEmail({
      title: "Come back Monday to access your account",
      preheader: `We'll be ready by ${MAINTENANCE_UNTIL_LABEL}.`,
      bodyHtml:
        emailGreeting(name) +
        emailParagraph(
          "Thanks for creating your Impact Hub Nairobi membership. We have your details."
        ) +
        emailParagraph(
          `The platform is under maintenance. Please return <strong>${escapeHtml(MAINTENANCE_UNTIL_LABEL)}</strong> to access your account.`
        ),
    }),
    text: [
      name ? `Hi ${name},` : "Hi there,",
      "",
      "Thanks for creating your Impact Hub Nairobi membership. We have your details.",
      `The platform is under maintenance. Please return ${MAINTENANCE_UNTIL_LABEL} to access your account.`,
    ].join("\n"),
  })

  if (staff.ok || applicant.ok || captured.filePath) {
    return { ok: true, filePath: captured.filePath }
  }

  return {
    ok: false,
    error: staff.error || applicant.error || "Could not save or send the signup",
  }
}
