import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import type { StarConnectInquiryPayload } from "@/lib/email/membership-inquiry"
import { buildStarConnectInquiryPlainText } from "@/lib/email/membership-inquiry"
import { queueStarConnectInquiryEmails } from "@/lib/membership-star-connect"
import { IMPACT_SECTORS, PRIMARY_ROLES } from "@/lib/member-segmentation"
import { normalizeLinkedInUrl } from "@/lib/member-social-links"
import {
  HOW_HEARD_OPTIONS,
  STAR_CONNECT_DISCOVERY_CALL_URL,
  TARGET_START,
  VENTURE_STAGES,
} from "@/lib/membership-inquiry"
import {
  STAR_CONNECT_APPLICATION_IDS,
  TEAM_SIZE_OPTIONS,
  formatStarConnectPlanLine,
  getStarConnectApplication,
  parseStarConnectApplicationId,
  type StarConnectApplicationId,
} from "@/lib/star-connect-applications"

const roleValues = [...PRIMARY_ROLES] as [string, ...string[]]
const sectorValues = [...IMPACT_SECTORS] as [string, ...string[]]
const stageValues = [...VENTURE_STAGES] as [string, ...string[]]
const startValues = [...TARGET_START] as [string, ...string[]]
const heardValues = [...HOW_HEARD_OPTIONS] as [string, ...string[]]
const applicationValues = [...STAR_CONNECT_APPLICATION_IDS] as [
  StarConnectApplicationId,
  ...StarConnectApplicationId[],
]
const teamSizeValues = [...TEAM_SIZE_OPTIONS] as [string, ...string[]]

const schema = z
  .object({
    applicationId: z.enum(applicationValues).optional(),
    fullName: z.string().min(2, "Enter your full name").max(120),
    email: z.string().email("Enter a valid email address"),
    phone: z.string().min(7, "Enter a phone number").max(40),
    location: z.string().min(2, "Enter your city").max(120),
    linkedinUrl: z.string().max(300).optional(),
    websiteUrl: z.string().max(300).optional(),
    organization: z.string().min(2, "Enter your venture name").max(160),
    ventureDescription: z
      .string()
      .min(25, "Add a short description of your venture (at least 25 characters)")
      .max(800),
    role: z.enum(roleValues, { message: "Select your role" }),
    sector: z.enum(sectorValues, { message: "Select your sector" }),
    ventureStage: z.enum(stageValues, { message: "Select your stage" }),
    primaryNeeds: z.array(z.string().min(1)).min(1, "Pick at least one thing you need from membership"),
    workspaceNeed: z.string().min(1, "Select workspace needs"),
    targetStart: z.enum(startValues, { message: "Select when you want to start" }),
    supportNeeded: z
      .string()
      .min(15, "Tell us what support you need (at least 15 characters)")
      .max(500),
    teamSize: z.enum(teamSizeValues).optional(),
    howHeard: z.enum(heardValues).optional(),
    referralName: z.string().max(120).optional(),
    message: z.string().max(500).optional(),
    consent: z.literal(true, {
      errorMap: () => ({ message: "Please confirm we may contact you" }),
    }),
  })
  .superRefine((data, ctx) => {
    const app = getStarConnectApplication(data.applicationId)
    const allowedNeeds = new Set(app.primaryNeeds)
    if (data.primaryNeeds.some((need) => !allowedNeeds.has(need))) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Pick options that match this membership",
        path: ["primaryNeeds"],
      })
    }
    if (!app.workspaceNeeds.includes(data.workspaceNeed)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Select ${app.workspaceLabel.toLowerCase()}`,
        path: ["workspaceNeed"],
      })
    }
    if (app.requiresTeamSize && !data.teamSize) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Select team size",
        path: ["teamSize"],
      })
    }
    if (data.linkedinUrl?.trim() && !normalizeLinkedInUrl(data.linkedinUrl)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Enter a valid LinkedIn URL",
        path: ["linkedinUrl"],
      })
    }
    if (data.websiteUrl?.trim()) {
      try {
        const url = data.websiteUrl.trim().startsWith("http")
          ? data.websiteUrl.trim()
          : `https://${data.websiteUrl.trim()}`
        new URL(url)
      } catch {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Enter a valid website URL",
          path: ["websiteUrl"],
        })
      }
    }
    if (data.howHeard === "Referral from a member" && !data.referralName?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Enter who referred you",
        path: ["referralName"],
      })
    }
  })

function normalizeWebsite(url: string | undefined): string | undefined {
  const t = url?.trim()
  if (!t) return undefined
  return t.startsWith("http") ? t : `https://${t}`
}

function toPayload(data: z.infer<typeof schema>): StarConnectInquiryPayload {
  const applicationId = parseStarConnectApplicationId(data.applicationId)
  return {
    applicationId,
    fullName: data.fullName.trim(),
    email: data.email.toLowerCase().trim(),
    phone: data.phone.trim(),
    location: data.location.trim(),
    linkedinUrl: data.linkedinUrl?.trim()
      ? normalizeLinkedInUrl(data.linkedinUrl) ?? undefined
      : undefined,
    websiteUrl: normalizeWebsite(data.websiteUrl),
    organization: data.organization.trim(),
    ventureDescription: data.ventureDescription.trim(),
    role: data.role,
    sector: data.sector,
    ventureStage: data.ventureStage,
    primaryNeeds: data.primaryNeeds,
    workspaceNeed: data.workspaceNeed,
    targetStart: data.targetStart,
    supportNeeded: data.supportNeeded.trim(),
    teamSize: data.teamSize,
    howHeard: data.howHeard,
    referralName: data.referralName?.trim(),
    message: data.message?.trim(),
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = schema.parse(await request.json())
    const payload = toPayload(data)
    const app = getStarConnectApplication(payload.applicationId)
    const planLine = formatStarConnectPlanLine(app)

    const ticket = await prisma.supportTicket.create({
      data: {
        member: `${payload.fullName} <${payload.email}>`,
        subject: `${planLine} — ${payload.organization}`,
        description: buildStarConnectInquiryPlainText(payload),
        status: "open",
        priority: "high",
        category: "membership-inquiry",
      },
    })

    const { notifyStaffSupportTicketCreated } = await import("@/lib/staff-alerts")
    void notifyStaffSupportTicketCreated(ticket)

    const emailsQueued = queueStarConnectInquiryEmails(payload)

    return NextResponse.json(
      {
        message: emailsQueued
          ? "Application submitted. Check your email to book a discovery call."
          : "Application saved. Our team will follow up — confirmation email could not be sent (mail not configured).",
        emailsQueued,
        discoveryCallUrl: STAR_CONNECT_DISCOVERY_CALL_URL,
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0]?.message || "Invalid form data" },
        { status: 400 }
      )
    }
    console.error("[STAR CONNECT INQUIRY]", error)
    return NextResponse.json(
      { error: "Could not submit. Please try again or email our team." },
      { status: 500 }
    )
  }
}
