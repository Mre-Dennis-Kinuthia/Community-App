import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const inquirySchema = z.object({
  workspaceId: z.string().min(1),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().min(1, "Phone is required"),
  message: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const json = await request.json()
    const data = inquirySchema.parse(json)

    const description = [
      `Workspace: ${data.workspaceId}`,
      `Phone: ${data.phone}`,
      data.message ? `\nMessage:\n${data.message}` : "",
    ].join("\n")

    await prisma.supportTicket.create({
      data: {
        member: `${data.name} <${data.email}>`,
        subject: "Private Office Inquiry",
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
