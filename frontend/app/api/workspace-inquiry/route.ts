import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
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

export async function POST(request: NextRequest) {
  try {
    const json = await request.json()
    const data = inquirySchema.parse(json)

    const subject =
      data.inquiryType === "event-space" ? "Event space inquiry (up to 70 PAX)" : "Private office inquiry"

    const description = [
      `Type: ${data.inquiryType}`,
      `Workspace: ${data.workspaceId}`,
      `Phone: ${data.phone}`,
      data.inquiryType === "event-space" && data.expectedAttendees != null
        ? `Expected guests: ${data.expectedAttendees}`
        : "",
      data.preferredDate ? `Preferred date: ${data.preferredDate}` : "",
      data.eventTitle ? `Event title: ${data.eventTitle}` : "",
      data.message ? `\nDetails:\n${data.message}` : "",
    ]
      .filter(Boolean)
      .join("\n")

    await prisma.supportTicket.create({
      data: {
        member: `${data.name} <${data.email}>`,
        subject,
        description,
        status: "open",
        priority: "medium",
        category: "workspace-inquiry",
      },
    })

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
