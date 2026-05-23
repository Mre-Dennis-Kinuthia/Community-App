/**
 * Transactional email via Resend HTTP API (no SDK required).
 */

export async function sendPasswordResetEmail(params: {
  to: string
  resetUrl: string
}): Promise<{ ok: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.EMAIL_FROM || "noreply@impacthubnairobi.org"

  if (!apiKey) {
    console.warn("[EMAIL] RESEND_API_KEY not set — skipping password reset email")
    return { ok: false, error: "Email service not configured" }
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [params.to],
      subject: "Reset your Impact Hub Nairobi password",
      html: `
        <p>You requested a password reset for your Impact Hub Nairobi account.</p>
        <p><a href="${params.resetUrl}">Reset your password</a></p>
        <p>This link expires in 1 hour. If you did not request this, you can ignore this email.</p>
      `,
    }),
  })

  if (!res.ok) {
    const body = await res.text().catch(() => "")
    console.error("[EMAIL] Resend error:", res.status, body)
    return { ok: false, error: "Failed to send email" }
  }

  return { ok: true }
}
