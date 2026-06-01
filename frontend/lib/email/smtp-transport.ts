import nodemailer from "nodemailer"
import type SMTPTransport from "nodemailer/lib/smtp-transport"

/** Google OAuth2 (no App Password). Requires mail.google.com refresh token. */
export function isGoogleOAuthSmtpConfigured(): boolean {
  return Boolean(
    process.env.SMTP_USER?.trim() &&
      process.env.GOOGLE_CLIENT_ID?.trim() &&
      process.env.GOOGLE_CLIENT_SECRET?.trim() &&
      process.env.GOOGLE_REFRESH_TOKEN?.trim()
  )
}

export function isSmtpPasswordConfigured(): boolean {
  return Boolean(
    process.env.SMTP_HOST?.trim() &&
      process.env.SMTP_USER?.trim() &&
      process.env.SMTP_PASS?.trim()
  )
}

export function isSmtpConfigured(): boolean {
  return isSmtpPasswordConfigured() || isGoogleOAuthSmtpConfigured()
}

export function createSmtpTransport(): nodemailer.Transporter<SMTPTransport.SentMessageInfo> | null {
  const user = process.env.SMTP_USER?.trim()
  if (!user) return null

  if (isGoogleOAuthSmtpConfigured()) {
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user,
        clientId: process.env.GOOGLE_CLIENT_ID!.trim(),
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!.trim(),
        refreshToken: process.env.GOOGLE_REFRESH_TOKEN!.trim(),
      },
    })
  }

  const host = process.env.SMTP_HOST?.trim()
  const pass = process.env.SMTP_PASS?.trim()
  if (!host || !pass) return null

  const port = parseInt(process.env.SMTP_PORT || "587", 10)
  const secure = process.env.SMTP_SECURE === "true" || port === 465

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  })
}
