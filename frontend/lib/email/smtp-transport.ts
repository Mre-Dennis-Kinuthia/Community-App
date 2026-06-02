import nodemailer from "nodemailer"
import type SMTPTransport from "nodemailer/lib/smtp-transport"
import { refreshGoogleAccessToken } from "./google-oauth"

/** Third-party relays we do not use — production mail is Gmail / Google Workspace OAuth. */
const DISALLOWED_SMTP_HOST = /brevo|sendinblue/i

export function isDisallowedSmtpHost(host: string): boolean {
  return DISALLOWED_SMTP_HOST.test(host)
}

/** Google OAuth2 (no App Password). Requires mail.google.com refresh token. */
export function isGoogleOAuthSmtpConfigured(): boolean {
  return Boolean(
    process.env.SMTP_USER?.trim() &&
      process.env.GOOGLE_CLIENT_ID?.trim() &&
      process.env.GOOGLE_CLIENT_SECRET?.trim() &&
      process.env.GOOGLE_REFRESH_TOKEN?.trim()
  )
}

/** App-password SMTP (e.g. smtp.gmail.com). Brevo/Sendinblue hosts are ignored. */
export function isSmtpPasswordConfigured(): boolean {
  const host = process.env.SMTP_HOST?.trim()
  if (!host || isDisallowedSmtpHost(host)) return false
  return Boolean(host && process.env.SMTP_USER?.trim() && process.env.SMTP_PASS?.trim())
}

export function isSmtpConfigured(): boolean {
  return isGoogleOAuthSmtpConfigured() || isSmtpPasswordConfigured()
}

export function getSmtpTransportLabel(): string | null {
  if (isGoogleOAuthSmtpConfigured()) return "Gmail (Google OAuth)"
  if (isSmtpPasswordConfigured()) {
    const host = process.env.SMTP_HOST?.trim() ?? ""
    if (/gmail|google/i.test(host)) return "Gmail SMTP"
    return "SMTP"
  }
  return null
}

let lastSmtpSetupError: string | null = null

export function getLastSmtpSetupError(): string | null {
  return lastSmtpSetupError
}

export async function createSmtpTransport(): Promise<
  nodemailer.Transporter<SMTPTransport.SentMessageInfo> | null
> {
  lastSmtpSetupError = null
  const user = process.env.SMTP_USER?.trim()
  if (!user) return null

  if (isGoogleOAuthSmtpConfigured()) {
    const token = await refreshGoogleAccessToken()
    if (!token.ok) {
      lastSmtpSetupError = token.error
      console.error("[EMAIL] Google token refresh failed:", token.error)
      return null
    }

    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user,
        clientId: process.env.GOOGLE_CLIENT_ID!.trim(),
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!.trim(),
        refreshToken: process.env.GOOGLE_REFRESH_TOKEN!.trim(),
        accessToken: token.accessToken,
      },
    })
  }

  const host = process.env.SMTP_HOST?.trim()
  const pass = process.env.SMTP_PASS?.trim()
  if (!host || !pass) return null

  if (isDisallowedSmtpHost(host)) {
    console.warn(
      "[EMAIL] Brevo/Sendinblue SMTP is not used. Set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN, and SMTP_USER for Gmail. See docs/GOOGLE_WORKSPACE_EMAIL.md"
    )
    return null
  }

  const port = parseInt(process.env.SMTP_PORT || "587", 10)
  const secure = process.env.SMTP_SECURE === "true" || port === 465

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  })
}
