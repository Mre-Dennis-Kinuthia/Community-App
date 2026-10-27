import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { getAdminAppBaseUrl } from "@/lib/app-url"
import { sendEmailInBackground, sendSupportTicketStaffEmail } from "@/lib/email"
import { prisma } from "@/lib/prisma"
import { clientIpFromRequest, rateLimit } from "@/lib/rate-limit"
import { notifyStaffSupportTicketCreated } from "@/lib/staff-alerts"

const membershipDetailsSchema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(120),
  email: z.string().trim().email("Enter a valid email address").max(254).toLowerCase(),
})

export async function POST(request: NextRequest) {
  const limited = rateLimit(`membership-details:${clientIpFromRequest(request)}`, {
    limit: 5,
    windowMs: 60 * 60 * 1000,
  })

  if ("retryAfterSec" in limited) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      {
        status: 429,
        headers: { "Retry-After": String(limited.retryAfterSec) },
      }
    )
  }

  try {
    const data = membershipDetailsSchema.parse(await request.json())
    const subject = "Impact Hub Nairobi membership details request"
    const description = [
      "Request: More information about joining the Impact Hub Nairobi community",
      `Name: ${data.name}`,
      `Email: ${data.email}`,
      "Source: Offers page",
    ].join("\n")

    const ticket = await prisma.supportTicket.create({
      data: {
        member: `${data.name} <${data.email}>`,
        subject,
        description,
        status: "open",
        priority: "medium",
        category: "membership-inquiry",
      },
    })

    void notifyStaffSupportTicketCreated(ticket)
    sendEmailInBackground(
      () =>
        sendSupportTicketStaffEmail({
          member: ticket.member,
          subject: ticket.subject,
          description: ticket.description,
          priority: ticket.priority,
          category: ticket.category,
          ticketUrl: `${getAdminAppBaseUrl()}/dashboard/support`,
          replyTo: data.email,
        }),
      "membership-details-inquiry"
    )

    return NextResponse.json(
      { message: "Your request has been sent. Our team will email you membership details." },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0]?.message || "Invalid form data" }, { status: 400 })
    }

    console.error("[MEMBERSHIP DETAILS INQUIRY]", error)
    return NextResponse.json(
      { error: "Could not submit your request. Please try again." },
      { status: 500 }
    )
  }
}
