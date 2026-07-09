import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import type { OrganisationalInquiryPayload } from "@/lib/email/membership-organisational-inquiry"
import { buildOrganisationalInquiryPlainText } from "@/lib/email/membership-organisational-inquiry"
import { queueOrganisationalInquiryEmails } from "@/lib/membership-organisational-inquiry"
import { IMPACT_SECTORS } from "@/lib/member-segmentation"
import {
  HOW_HEARD_OPTIONS,
  ORGANISATIONAL_AUDIENCE_REACH,
  ORGANISATIONAL_BUDGET_BANDS,
  ORGANISATIONAL_CONTACT_ROLES,
  ORGANISATIONAL_DISCOVERY_CALL_URL,
  ORGANISATIONAL_ENGAGEMENT_MODELS,
  ORGANISATIONAL_ENGAGEMENT_TIMELINE,
  ORGANISATIONAL_GEOGRAPHIC_SCOPE,
  ORGANISATIONAL_PLAN_NAME,
  ORGANISATION_TEAM_SIZES,
  ORGANISATION_TYPES,
} from "@/lib/membership-inquiry"

export const ORGANISATIONAL_INQUIRY_TICKET_CATEGORY = "organisational-inquiry"

const orgTypeValues = [...ORGANISATION_TYPES] as [string, ...string[]]
const scopeValues = [...ORGANISATIONAL_GEOGRAPHIC_SCOPE] as [string, ...string[]]
const sectorValues = [...IMPACT_SECTORS] as [string, ...string[]]
const scaleValues = [...ORGANISATION_TEAM_SIZES] as [string, ...string[]]
const modelValues = [...ORGANISATIONAL_ENGAGEMENT_MODELS] as [string, ...string[]]
const audienceValues = [...ORGANISATIONAL_AUDIENCE_REACH] as [string, ...string[]]
const timelineValues = [...ORGANISATIONAL_ENGAGEMENT_TIMELINE] as [string, ...string[]]
const budgetValues = [...ORGANISATIONAL_BUDGET_BANDS] as [string, ...string[]]
const roleValues = [...ORGANISATIONAL_CONTACT_ROLES] as [string, ...string[]]
const heardValues = [...HOW_HEARD_OPTIONS] as [string, ...string[]]

const schema = z
  .object({
    organizationName: z.string().min(2, "Enter your organisation name").max(160),
    organizationType: z.enum(orgTypeValues, { message: "Select organisation type" }),
    organizationMandate: z
      .string()
      .min(25, "Describe your mandate and programmes (at least 25 characters)")
      .max(800),
    geographicScope: z.enum(scopeValues, { message: "Select geographic scope" }),
    focusSectors: z
      .array(z.enum(sectorValues))
      .min(1, "Select at least one focus sector")
      .max(3, "Select up to three sectors"),
    staffScale: z.enum(scaleValues, { message: "Select team or programme scale" }),
    websiteUrl: z.string().max(300).optional(),
    engagementModels: z
      .array(z.enum(modelValues))
      .min(1, "Select at least one engagement model"),
    audienceReach: z
      .array(z.enum(audienceValues))
      .min(1, "Select at least one audience you want to reach"),
    engagementTimeline: z.enum(timelineValues, {
      message: "Select partnership timeline",
    }),
    partnershipObjectives: z
      .string()
      .min(15, "Describe what success looks like (at least 15 characters)")
      .max(500),
    budgetBand: z.enum(budgetValues).optional(),
    fullName: z.string().min(2, "Enter the primary contact name").max(120),
    contactRole: z.enum(roleValues, { message: "Select your role" }),
    email: z.string().email("Enter a valid work email"),
    phone: z.string().min(7, "Enter a phone number").max(40),
    location: z.string().min(2, "Enter your city").max(120),
    howHeard: z.enum(heardValues).optional(),
    referralName: z.string().max(120).optional(),
    message: z.string().max(500).optional(),
    consent: z.literal(true, {
      errorMap: () => ({ message: "Please confirm we may contact you" }),
    }),
  })
  .superRefine((data, ctx) => {
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

function toPayload(data: z.infer<typeof schema>): OrganisationalInquiryPayload {
  return {
    organizationName: data.organizationName.trim(),
    organizationType: data.organizationType,
    organizationMandate: data.organizationMandate.trim(),
    geographicScope: data.geographicScope,
    focusSectors: data.focusSectors,
    staffScale: data.staffScale,
    websiteUrl: normalizeWebsite(data.websiteUrl),
    engagementModels: data.engagementModels,
    audienceReach: data.audienceReach,
    engagementTimeline: data.engagementTimeline,
    partnershipObjectives: data.partnershipObjectives.trim(),
    budgetBand: data.budgetBand,
    fullName: data.fullName.trim(),
    contactRole: data.contactRole,
    email: data.email.toLowerCase().trim(),
    phone: data.phone.trim(),
    location: data.location.trim(),
    howHeard: data.howHeard,
    referralName: data.referralName?.trim(),
    message: data.message?.trim(),
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = schema.parse(await request.json())
    const payload = toPayload(data)

    await prisma.supportTicket.create({
      data: {
        member: `${payload.fullName} <${payload.email}>`,
        subject: `${ORGANISATIONAL_PLAN_NAME} partnership — ${payload.organizationName}`,
        description: buildOrganisationalInquiryPlainText(payload),
        status: "open",
        priority: "high",
        category: ORGANISATIONAL_INQUIRY_TICKET_CATEGORY,
      },
    })

    const emailsQueued = queueOrganisationalInquiryEmails(payload)

    return NextResponse.json(
      {
        message: emailsQueued
          ? "Partnership inquiry submitted. Check your email for next steps."
          : "Inquiry saved. Our partnerships team will follow up — confirmation email could not be sent (mail not configured).",
        emailsQueued,
        discoveryCallUrl: ORGANISATIONAL_DISCOVERY_CALL_URL,
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
    console.error("[ORGANISATIONAL INQUIRY]", error)
    return NextResponse.json(
      { error: "Could not submit. Please try again or email our team." },
      { status: 500 }
    )
  }
}
