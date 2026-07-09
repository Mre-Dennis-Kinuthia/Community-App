import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import type { OrganisationalInquiryPayload } from "@/lib/email/membership-organisational-inquiry"
import { buildOrganisationalInquiryPlainText } from "@/lib/email/membership-organisational-inquiry"
import { queueOrganisationalInquiryEmails } from "@/lib/membership-organisational-inquiry"
import { IMPACT_SECTORS, PRIMARY_ROLES } from "@/lib/member-segmentation"
import { normalizeLinkedInUrl } from "@/lib/member-social-links"
import {
  HOW_HEARD_OPTIONS,
  ORGANISATIONAL_DISCOVERY_CALL_URL,
  ORGANISATIONAL_PLAN_NAME,
  ORGANISATION_TEAM_SIZES,
  ORGANISATION_TYPES,
  ORGANISATIONAL_PARTNERSHIP_INTERESTS,
  TARGET_START,
} from "@/lib/membership-inquiry"

export const ORGANISATIONAL_INQUIRY_TICKET_CATEGORY = "organisational-inquiry"

const roleValues = [...PRIMARY_ROLES] as [string, ...string[]]
const sectorValues = [...IMPACT_SECTORS] as [string, ...string[]]
const orgTypeValues = [...ORGANISATION_TYPES] as [string, ...string[]]
const teamSizeValues = [...ORGANISATION_TEAM_SIZES] as [string, ...string[]]
const interestValues = [...ORGANISATIONAL_PARTNERSHIP_INTERESTS] as [string, ...string[]]
const startValues = [...TARGET_START] as [string, ...string[]]
const heardValues = [...HOW_HEARD_OPTIONS] as [string, ...string[]]

const schema = z
  .object({
    fullName: z.string().min(2, "Enter your full name").max(120),
    email: z.string().email("Enter a valid email address"),
    phone: z.string().min(7, "Enter a phone number").max(40),
    location: z.string().min(2, "Enter your city").max(120),
    organizationName: z.string().min(2, "Enter your organisation name").max(160),
    organizationType: z.enum(orgTypeValues, { message: "Select organisation type" }),
    organizationDescription: z
      .string()
      .min(25, "Describe your organisation (at least 25 characters)")
      .max(800),
    role: z.enum(roleValues, { message: "Select your role" }),
    sector: z.enum(sectorValues, { message: "Select your sector" }),
    teamSize: z.enum(teamSizeValues, { message: "Select team size" }),
    partnershipInterests: z
      .array(z.enum(interestValues))
      .min(1, "Pick at least one partnership interest"),
    targetStart: z.enum(startValues, { message: "Select when you want to start" }),
    partnershipGoals: z
      .string()
      .min(15, "Tell us what you hope to achieve (at least 15 characters)")
      .max(500),
    linkedinUrl: z.string().max(300).optional(),
    websiteUrl: z.string().max(300).optional(),
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

function toPayload(data: z.infer<typeof schema>): OrganisationalInquiryPayload {
  return {
    fullName: data.fullName.trim(),
    email: data.email.toLowerCase().trim(),
    phone: data.phone.trim(),
    location: data.location.trim(),
    organizationName: data.organizationName.trim(),
    organizationType: data.organizationType,
    organizationDescription: data.organizationDescription.trim(),
    role: data.role,
    sector: data.sector,
    teamSize: data.teamSize,
    partnershipInterests: data.partnershipInterests,
    targetStart: data.targetStart,
    partnershipGoals: data.partnershipGoals.trim(),
    linkedinUrl: data.linkedinUrl?.trim()
      ? normalizeLinkedInUrl(data.linkedinUrl) ?? undefined
      : undefined,
    websiteUrl: normalizeWebsite(data.websiteUrl),
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
          ? "Application submitted. Check your email for next steps."
          : "Application saved. Our partnerships team will follow up — confirmation email could not be sent (mail not configured).",
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
