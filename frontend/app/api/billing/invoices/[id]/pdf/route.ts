import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { buildSimpleInvoicePdf } from "@/lib/finance/invoice-pdf"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true } },
        subscription: { include: { plan: true } },
      },
    })

    if (!invoice || invoice.userId !== session.user.id) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 })
    }

    const lines = [
      "Impact Hub Nairobi",
      "INVOICE",
      `Number: ${invoice.invoiceNumber}`,
      `Date: ${invoice.createdAt.toLocaleDateString("en-KE")}`,
      `Bill to: ${invoice.user.name || invoice.user.email}`,
      `Amount: ${invoice.currency} ${Number(invoice.amount).toLocaleString()}`,
      `Status: ${invoice.status}`,
      invoice.dueDate ? `Due: ${invoice.dueDate.toLocaleDateString("en-KE")}` : "",
      invoice.paidAt ? `Paid: ${invoice.paidAt.toLocaleDateString("en-KE")}` : "",
      invoice.subscription?.plan ? `Plan: ${invoice.subscription.plan.name}` : "",
    ].filter(Boolean)

    const pdfBytes = buildSimpleInvoicePdf(lines)
    const pdfPath = `/api/billing/invoices/${invoice.id}/pdf`

    if (!invoice.pdfUrl) {
      await prisma.invoice.update({
        where: { id: invoice.id },
        data: { pdfUrl: pdfPath },
      })
    }

    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${invoice.invoiceNumber}.pdf"`,
      },
    })
  } catch (error) {
    console.error("[INVOICE PDF]", error)
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 })
  }
}
