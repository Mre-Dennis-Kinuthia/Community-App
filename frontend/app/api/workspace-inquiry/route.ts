import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import {
  sendWorkspaceInquiryConfirmationEmail,
  sendWorkspaceInquiryStaffEmail,
  sendEmailInBackground,
} from "@/lib/email"
import { getAdminAppBaseUrl } from "@/lib/app-url"
import { z } from "zod"

const inquirySchema = z
  .object({
    workspaceId: z.string().min(1),
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email"),
    phone: z.string().min(1, "Phone is required"),
    message: z.string().optional(),
    inquiryType: z.enum(["private-office", "event-space"]).optional().default("private-office"),
    expectedAttendees: z.number().int().min(1).max(70).optional(),
    preferredDate: z.string().optional(),
    eventTitle: z.string().optional(),
    eventDetails: z.string().optional(),
    cateringNotes: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.inquiryType === "event-space") {
      if (data.expectedAttendees == null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Expected number of guests (1–70) is required for event space requests.",
          path: ["expectedAttendees"],
        })
      }
    }
  })

function formatPreferredDate(value?: string): string | undefined {
  if (!value?.trim()) return undefined
  const parsed = new Date(`${value.trim()}T12:00:00`)
  if (Number.isNaN(parsed.getTime())) return value.trim()
  return new Intl.DateTimeFormat("en-KE", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(parsed)
}

function extractSection(message: string | undefined, heading: string): string | undefined {
  if (!message?.trim()) return undefined
  const pattern = new RegExp(
    `${heading}\\s*:\\s*([\\s\\S]*?)(?=\\n\\s*\\n[A-Z][^\\n]*:|$)`,
    "i"
  )
  const match = message.match(pattern)
  const value = match?.[1]?.trim()
  return value || undefined
}

export async function POST(request: NextRequest) {
  try {
    const json = await request.json()
    const data = inquirySchema.parse(json)

    const workspace = await prisma.workspace.findFirst({
      where: {
        OR: [{ id: data.workspaceId }, { slug: data.workspaceId }],
        deletedAt: null,
      },
      select: { id: true, name: true, location: true, slug: true },
    })

    const isEventSpace = data.inquiryType === "event-space"
    const inquiryLabel = isEventSpace ? "Event space inquiry" : "Private office inquiry"
    const workspaceName = workspace?.name || "Impact Hub Nairobi"
    const preferredDateLabel = formatPreferredDate(data.preferredDate)

    const eventDetails =
      data.eventDetails?.trim() ||
      extractSection(data.message, "Event details") ||
      (!isEventSpace ? data.message?.trim() : undefined)

    const cateringNotes =
      data.cateringNotes?.trim() || extractSection(data.message, "Menu / catering preferences")

    const subject = isEventSpace
      ? `Event space inquiry — ${data.eventTitle?.trim() || data.name}`
      : `Private office inquiry — ${data.name}`

    const descriptionLines = [
      `Inquiry: ${inquiryLabel}`,
      `Workspace: ${workspaceName}`,
      workspace?.location ? `Location: ${workspace.location}` : null,
      `Contact: ${data.name}`,
      `Email: ${data.email}`,
      `Phone: ${data.phone}`,
      isEventSpace && data.expectedAttendees != null
        ? `Expected guests: ${data.expectedAttendees}`
        : null,
      preferredDateLabel ? `Preferred date: ${preferredDateLabel}` : null,
      data.eventTitle?.trim() ? `Event title: ${data.eventTitle.trim()}` : null,
      eventDetails ? `\nEvent / request details:\n${eventDetails}` : null,
      cateringNotes ? `\nCatering preferences:\n${cateringNotes}` : null,
    ].filter(Boolean)

    const ticket = await prisma.supportTicket.create({
      data: {
        member: `${data.name} <${data.email}>`,
        subject,
        description: descriptionLines.join("\n"),
        status: "open",
        priority: isEventSpace ? "high" : "medium",
        category: "workspace-inquiry",
      },
    })

    const { notifyStaffSupportTicketCreated } = await import("@/lib/staff-alerts")
    void notifyStaffSupportTicketCreated({
      ...ticket,
      subject: `${inquiryLabel} · ${workspaceName}`,
    })

    sendEmailInBackground(
      () =>
        sendWorkspaceInquiryConfirmationEmail({
          to: data.email,
          name: data.name,
          inquiryLabel,
        }),
      "workspace-inquiry-confirmation"
    )

    const helpdeskUrl = `${getAdminAppBaseUrl()}/dashboard/support`

    sendEmailInBackground(
      () =>
        sendWorkspaceInquiryStaffEmail({
          inquiryLabel,
          inquiryType: data.inquiryType || "private-office",
          name: data.name,
          email: data.email,
          phone: data.phone,
          workspaceName,
          workspaceLocation: workspace?.location,
          expectedAttendees: data.expectedAttendees,
          preferredDate: preferredDateLabel,
          eventTitle: data.eventTitle?.trim() || undefined,
          eventDetails,
          cateringNotes,
          helpdeskUrl,
        }),
      "workspace-inquiry-staff"
    )

    return NextResponse.json(
      { message: "Inquiry submitted successfully. Our staff will contact you shortly." },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0]?.message || "Invalid input" },
        { status: 400 }
      )
    }
    console.error("[WORKSPACE INQUIRY] Error:", error)
    return NextResponse.json(
      { error: "Failed to submit inquiry. Please try again." },
      { status: 500 }
    )
  }
}
