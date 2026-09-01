import { getAdminAppBaseUrl } from "@/lib/app-url"
import { getMemberTypeLabel } from "@/lib/member-segmentation"
import { parseMemberSocialLinks } from "@/lib/member-social-links"
import { getEmailStaffTo } from "./config"
import { sendEmail, type SendEmailResult } from "./send"
import {
  emailDetailCard,
  emailParagraph,
  escapeHtml,
  layoutEmail,
} from "./templates"

export type ConnectApplicationPayload = {
  name?: string | null
  email: string
  memberId?: string
  memberType?: string | null
  organization?: string | null
  role?: string | null
  sector?: string | null
  location?: string | null
  phone?: string | null
  linkedin?: string | null
  goals?: string[]
  availability?: string[]
  skills?: string[]
  bio?: string | null
}

type ProfileForConnectEmail = {
  memberType?: string | null
  organization?: string | null
  role?: string | null
  industry?: string | null
  location?: string | null
  phone?: string | null
  interests?: string[] | null
  availability?: string[] | null
  skills?: string[] | null
  bio?: string | null
  socialLinks?: unknown
  user: {
    id: string
    name?: string | null
    email: string
    image?: string | null
  }
}

export function connectApplicationPayloadFromProfile(
  profile: ProfileForConnectEmail
): ConnectApplicationPayload {
  return {
    memberId: profile.user.id,
    name: profile.user.name,
    email: profile.user.email,
    memberType: profile.memberType,
    organization: profile.organization,
    role: profile.role,
    sector: profile.industry,
    location: profile.location,
    phone: profile.phone,
    linkedin: parseMemberSocialLinks(profile.socialLinks).linkedin,
    goals: profile.interests ?? [],
    availability: profile.availability ?? [],
    skills: profile.skills ?? [],
    bio: profile.bio,
  }
}

export function connectApplicationDetailRows(params: ConnectApplicationPayload) {
  const memberType = getMemberTypeLabel(params.memberType) || params.memberType || "—"
  return [
    { label: "Name", value: escapeHtml(params.name?.trim() || "—") },
    { label: "Email", value: escapeHtml(params.email) },
    { label: "I am a…", value: escapeHtml(memberType) },
    { label: "Organisation", value: escapeHtml(params.organization?.trim() || "—") },
    { label: "Role", value: escapeHtml(params.role?.trim() || "—") },
    { label: "Sector", value: escapeHtml(params.sector?.trim() || "—") },
    { label: "Location", value: escapeHtml(params.location?.trim() || "—") },
    { label: "Phone", value: escapeHtml(params.phone?.trim() || "—") },
    { label: "LinkedIn", value: escapeHtml(params.linkedin?.trim() || "—") },
    {
      label: "Here for",
      value: escapeHtml((params.goals ?? []).filter(Boolean).join(" · ") || "—"),
    },
    {
      label: "Open to",
      value: escapeHtml((params.availability ?? []).filter(Boolean).join(" · ") || "—"),
    },
    {
      label: "Skills",
      value: escapeHtml((params.skills ?? []).filter(Boolean).join(" · ") || "—"),
    },
    { label: "Intro", value: escapeHtml(params.bio?.trim() || "—") },
  ]
}

export function buildConnectApplicationPlainText(params: ConnectApplicationPayload): string {
  const memberType = getMemberTypeLabel(params.memberType) || params.memberType || "—"
  return [
    "Connect application",
    "",
    `${params.name?.trim() || "New member"} <${params.email}>`,
    `Type: ${memberType}`,
    `Organisation: ${params.organization?.trim() || "—"}`,
    `Role: ${params.role?.trim() || "—"}`,
    `Sector: ${params.sector?.trim() || "—"}`,
    `Location: ${params.location?.trim() || "—"}`,
    `Phone: ${params.phone?.trim() || "—"}`,
    params.linkedin?.trim() ? `LinkedIn: ${params.linkedin.trim()}` : "",
    `Here for: ${(params.goals ?? []).join(", ") || "—"}`,
    `Open to: ${(params.availability ?? []).join(", ") || "—"}`,
    `Skills: ${(params.skills ?? []).join(", ") || "—"}`,
    params.bio?.trim() ? `\nIntro:\n${params.bio.trim()}` : "",
  ]
    .filter((line) => line !== "")
    .join("\n")
}

export async function sendConnectApplicationStaffEmail(
  params: ConnectApplicationPayload
): Promise<SendEmailResult> {
  const reviewUrl = params.memberId
    ? `${getAdminAppBaseUrl()}/dashboard/community/members/${params.memberId}`
    : `${getAdminAppBaseUrl()}/dashboard/community/members`

  const bodyHtml = `
    ${emailParagraph("A new <strong>Connect</strong> member finished onboarding. Review their profile below.")}
    ${emailDetailCard(connectApplicationDetailRows(params), { title: "Member profile" })}
  `

  return sendEmail({
    to: getEmailStaffTo(),
    subject: `[Account] New member — ${params.email}`,
    html: layoutEmail({
      preheader: `${params.name?.trim() || params.email} joined Connect`,
      title: "New member",
      eyebrow: "Community",
      bodyHtml,
      ctaLabel: "Open member",
      ctaUrl: reviewUrl,
    }),
    text: `${buildConnectApplicationPlainText(params)}\n\n${reviewUrl}`,
    replyTo: params.email,
    emailCategory: "requests",
  })
}
