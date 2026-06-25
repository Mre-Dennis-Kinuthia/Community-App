import { readFile } from "fs/promises"
import path from "path"
import { PDFDocument, rgb, StandardFonts, type PDFPage, type PDFFont } from "pdf-lib"
import { HUB_CONTACT_EMAIL } from "@/lib/hub-contact"

export const INVOICE_BRAND = {
  primary: rgb(166 / 255, 25 / 255, 46 / 255),
  primaryDark: rgb(128 / 255, 43 / 255, 43 / 255),
  primaryLight: rgb(253 / 255, 242 / 255, 244 / 255),
  text: rgb(24 / 255, 24 / 255, 27 / 255),
  textMuted: rgb(113 / 255, 113 / 255, 122 / 255),
  border: rgb(228 / 255, 228 / 255, 231 / 255),
  success: rgb(22 / 255, 163 / 255, 74 / 255),
  warning: rgb(234 / 255, 88 / 255, 12 / 255),
  white: rgb(1, 1, 1),
} as const

const COMPANY = {
  name: "Impact Hub Nairobi",
  tagline: "Innovation · Connection · Impact",
  address: "Ikigai Nairobi, Westlands, Nairobi, Kenya",
  website: "nairobi.impacthub.net",
  email: HUB_CONTACT_EMAIL,
} as const

export type InvoicePdfInput = {
  invoiceNumber: string
  issuedAt: Date
  dueDate?: Date | null
  paidAt?: Date | null
  status: string
  currency: string
  amount: number
  billToName: string
  billToEmail: string
  planName?: string | null
  lineDescription?: string | null
}

export type InvoiceRecordForPdf = {
  invoiceNumber: string
  createdAt: Date
  dueDate: Date | null
  paidAt: Date | null
  status: string
  currency: string
  amount: unknown
  user: { name: string | null; email: string }
  subscription?: { plan: { name: string } | null } | null
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-KE", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "Africa/Nairobi",
  })
}

function formatMoney(currency: string, amount: number): string {
  return `${currency} ${amount.toLocaleString("en-KE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

function statusLabel(status: string): string {
  return status.charAt(0).toUpperCase() + status.slice(1)
}

function statusColor(status: string) {
  switch (status.toLowerCase()) {
    case "paid":
      return INVOICE_BRAND.success
    case "overdue":
      return INVOICE_BRAND.primary
    case "cancelled":
      return INVOICE_BRAND.textMuted
    default:
      return INVOICE_BRAND.warning
  }
}

async function tryLoadLogo(pdfDoc: PDFDocument) {
  try {
    const logoPath = path.join(process.cwd(), "public/brand/impact-hub-nairobi-logo.png")
    const bytes = await readFile(logoPath)
    return await pdfDoc.embedPng(bytes)
  } catch {
    return null
  }
}

function drawLabelValue(
  page: PDFPage,
  font: PDFFont,
  fontBold: PDFFont,
  x: number,
  y: number,
  label: string,
  value: string,
  valueColor = INVOICE_BRAND.text
) {
  page.drawText(label.toUpperCase(), {
    x,
    y,
    size: 8,
    font: fontBold,
    color: INVOICE_BRAND.primary,
  })
  page.drawText(value, {
    x,
    y: y - 16,
    size: 12,
    font: fontBold,
    color: valueColor,
    maxWidth: 220,
  })
}

export async function buildBrandedInvoicePdf(input: InvoicePdfInput): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create()
  const page = pdfDoc.addPage([612, 792])
  const { width, height } = page.getSize()

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  const logo = await tryLoadLogo(pdfDoc)

  const margin = 48
  const headerHeight = 88

  page.drawRectangle({
    x: 0,
    y: height - headerHeight,
    width,
    height: headerHeight,
    color: INVOICE_BRAND.primaryDark,
  })
  page.drawRectangle({
    x: 0,
    y: height - headerHeight + 4,
    width,
    height: headerHeight - 4,
    color: INVOICE_BRAND.primary,
  })

  if (logo) {
    const logoWidth = 132
    const logoHeight = (logo.height / logo.width) * logoWidth
    page.drawImage(logo, {
      x: margin,
      y: height - headerHeight + (headerHeight - logoHeight) / 2 + 2,
      width: logoWidth,
      height: logoHeight,
    })
  } else {
    page.drawText(COMPANY.name, {
      x: margin,
      y: height - 52,
      size: 18,
      font: fontBold,
      color: INVOICE_BRAND.white,
    })
    page.drawText(COMPANY.tagline, {
      x: margin,
      y: height - 68,
      size: 9,
      font,
      color: INVOICE_BRAND.white,
    })
  }

  const invoiceTitle = "INVOICE"
  page.drawText(invoiceTitle, {
    x: width - margin - fontBold.widthOfTextAtSize(invoiceTitle, 26),
    y: height - 50,
    size: 26,
    font: fontBold,
    color: INVOICE_BRAND.white,
  })

  let y = height - headerHeight - 36

  drawLabelValue(page, font, fontBold, margin, y, "Invoice no.", input.invoiceNumber)
  drawLabelValue(
    page,
    font,
    fontBold,
    width / 2 + 8,
    y,
    "Issue date",
    formatDate(input.issuedAt)
  )

  y -= 40
  if (input.dueDate) {
    drawLabelValue(page, font, fontBold, margin, y, "Due date", formatDate(input.dueDate))
  }
  drawLabelValue(
    page,
    font,
    fontBold,
    width / 2 + 8,
    y,
    "Status",
    statusLabel(input.status),
    statusColor(input.status)
  )

  if (input.paidAt) {
    y -= 40
    drawLabelValue(page, font, fontBold, margin, y, "Paid on", formatDate(input.paidAt))
  }

  y -= 52

  const billToHeight = 78
  page.drawRectangle({
    x: margin,
    y: y - billToHeight,
    width: width - margin * 2,
    height: billToHeight,
    color: INVOICE_BRAND.primaryLight,
    borderColor: INVOICE_BRAND.border,
    borderWidth: 1,
  })
  page.drawText("BILL TO", {
    x: margin + 16,
    y: y - 22,
    size: 9,
    font: fontBold,
    color: INVOICE_BRAND.primary,
  })
  page.drawText(input.billToName, {
    x: margin + 16,
    y: y - 40,
    size: 13,
    font: fontBold,
    color: INVOICE_BRAND.text,
    maxWidth: width - margin * 2 - 32,
  })
  page.drawText(input.billToEmail, {
    x: margin + 16,
    y: y - 58,
    size: 11,
    font,
    color: INVOICE_BRAND.textMuted,
    maxWidth: width - margin * 2 - 32,
  })

  y -= billToHeight + 28

  const tableWidth = width - margin * 2
  const colDesc = margin + 14
  const colAmount = width - margin - 14
  const amountText = formatMoney(input.currency, input.amount)
  const description =
    input.lineDescription ||
    (input.planName ? `${input.planName} membership` : "Impact Hub Nairobi membership & services")

  page.drawRectangle({
    x: margin,
    y: y - 30,
    width: tableWidth,
    height: 30,
    color: INVOICE_BRAND.primary,
  })
  page.drawText("Description", {
    x: colDesc,
    y: y - 20,
    size: 10,
    font: fontBold,
    color: INVOICE_BRAND.white,
  })
  const amountHeader = "Amount"
  page.drawText(amountHeader, {
    x: colAmount - fontBold.widthOfTextAtSize(amountHeader, 10),
    y: y - 20,
    size: 10,
    font: fontBold,
    color: INVOICE_BRAND.white,
  })

  const rowHeight = 52
  y -= 30
  page.drawRectangle({
    x: margin,
    y: y - rowHeight,
    width: tableWidth,
    height: rowHeight,
    color: INVOICE_BRAND.white,
    borderColor: INVOICE_BRAND.border,
    borderWidth: 1,
  })
  page.drawText(description, {
    x: colDesc,
    y: y - 22,
    size: 11,
    font,
    color: INVOICE_BRAND.text,
    maxWidth: colAmount - colDesc - 28,
  })
  page.drawText(amountText, {
    x: colAmount - fontBold.widthOfTextAtSize(amountText, 11),
    y: y - 22,
    size: 11,
    font: fontBold,
    color: INVOICE_BRAND.text,
  })

  y -= rowHeight + 28

  const totalBandWidth = 248
  const totalBandHeight = 48
  const totalLabel = input.status.toLowerCase() === "paid" ? "Total paid" : "Total due"
  page.drawRectangle({
    x: width - margin - totalBandWidth,
    y: y - totalBandHeight,
    width: totalBandWidth,
    height: totalBandHeight,
    color: INVOICE_BRAND.primaryLight,
    borderColor: INVOICE_BRAND.border,
    borderWidth: 1,
  })
  page.drawText(totalLabel.toUpperCase(), {
    x: width - margin - totalBandWidth + 16,
    y: y - 18,
    size: 9,
    font: fontBold,
    color: INVOICE_BRAND.primary,
  })
  page.drawText(amountText, {
    x: width - margin - totalBandWidth + 16,
    y: y - 38,
    size: 18,
    font: fontBold,
    color: INVOICE_BRAND.primaryDark,
  })

  const footerY = 64
  page.drawLine({
    start: { x: margin, y: footerY + 30 },
    end: { x: width - margin, y: footerY + 30 },
    thickness: 1,
    color: INVOICE_BRAND.border,
  })
  page.drawText(COMPANY.name, {
    x: margin,
    y: footerY + 12,
    size: 10,
    font: fontBold,
    color: INVOICE_BRAND.primaryDark,
  })
  page.drawText(COMPANY.tagline, {
    x: margin,
    y: footerY - 2,
    size: 8,
    font,
    color: INVOICE_BRAND.textMuted,
  })

  const footerLine = `${COMPANY.address}  ·  ${COMPANY.email}`
  const footerLineWidth = font.widthOfTextAtSize(footerLine, 8)
  page.drawText(footerLine, {
    x: width - margin - footerLineWidth,
    y: footerY + 8,
    size: 8,
    font,
    color: INVOICE_BRAND.textMuted,
  })
  const websiteWidth = font.widthOfTextAtSize(COMPANY.website, 8)
  page.drawText(COMPANY.website, {
    x: width - margin - websiteWidth,
    y: footerY - 6,
    size: 8,
    font,
    color: INVOICE_BRAND.primary,
  })

  return pdfDoc.save()
}

export function invoiceRecordToPdfInput(invoice: InvoiceRecordForPdf): InvoicePdfInput {
  const planName = invoice.subscription?.plan?.name ?? null
  return {
    invoiceNumber: invoice.invoiceNumber,
    issuedAt: invoice.createdAt,
    dueDate: invoice.dueDate,
    paidAt: invoice.paidAt,
    status: invoice.status,
    currency: invoice.currency,
    amount: Number(invoice.amount),
    billToName: invoice.user.name || invoice.user.email,
    billToEmail: invoice.user.email,
    planName,
    lineDescription: planName ? `${planName} membership` : null,
  }
}

/** @deprecated Use buildBrandedInvoicePdf */
export async function buildSimpleInvoicePdf(lines: string[]): Promise<Uint8Array> {
  const amountLine = lines.find((line) => line.startsWith("Amount:"))
  const amountMatch = amountLine?.match(/([A-Z]{3})\s+([\d,]+(?:\.\d+)?)/)
  return buildBrandedInvoicePdf({
    invoiceNumber: lines.find((line) => line.startsWith("Number:"))?.replace("Number: ", "") || "INV",
    issuedAt: new Date(),
    status: lines.find((line) => line.startsWith("Status:"))?.replace("Status: ", "") || "draft",
    currency: amountMatch?.[1] || "KES",
    amount: Number(amountMatch?.[2]?.replace(/,/g, "") || 0),
    billToName: lines.find((line) => line.startsWith("Bill to:"))?.replace("Bill to: ", "") || "Member",
    billToEmail: "",
  })
}
