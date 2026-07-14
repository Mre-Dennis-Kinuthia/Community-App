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
  STAR_CONNECT_PRIMARY_NEEDS,
  TARGET_START,
  VENTURE_STAGES,
  WORKSPACE_NEEDS,
} from "@/lib/membership-inquiry"

const roleValues = [...PRIMARY_ROLES] as [string, ...string[]]
const sectorValues = [...IMPACT_SECTORS] as [string, ...string[]]
const stageValues = [...VENTURE_STAGES] as [string, ...string[]]
const workspaceValues = [...WORKSPACE_NEEDS] as [string, ...string[]]
const startValues = [...TARGET_START] as [string, ...string[]]
const needsValues = [...STAR_CONNECT_PRIMARY_NEEDS] as [string, ...string[]]
const heardValues = [...HOW_HEARD_OPTIONS] as [string, ...string[]]

const schema = z
  .object({
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
    primaryNeeds: z
      .array(z.enum(needsValues))
      .min(1, "Pick at least one thing you need from membership"),
    workspaceNeed: z.enum(workspaceValues, { message: "Select workspace needs" }),
    targetStart: z.enum(startValues, { message: "Select when you want to start" }),
    supportNeeded: z
      .string()
      .min(15, "Tell us what support you need (at least 15 characters)")
      .max(500),
    howHeard: z.enum(heardValues).optional(),
    referralName: z.string().max(120).optional(),
    message: z.string().max(500).optional(),
    consent: z.literal(true, {
      errorMap: () => ({ message: "Please confirm we may contact you" }),
    }),
  })
  .superRefine((data, ctx) => {
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
  return {
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
    howHeard: data.howHeard,
    referralName: data.referralName?.trim(),
    message: data.message?.trim(),
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = schema.parse(await request.json())
    const payload = toPayload(data)

    const ticket = await prisma.supportTicket.create({
      data: {
        member: `${payload.fullName} <${payload.email}>`,
        subject: `Star Connect membership — ${payload.organization}`,
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
