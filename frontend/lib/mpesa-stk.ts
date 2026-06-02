/**
 * Safaricom Daraja STK Push (Lipa Na M-Pesa Online).
 * When env vars are missing, callers should auto-complete membership in stub mode.
 */

function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "")
  if (digits.startsWith("254")) return digits
  if (digits.startsWith("0")) return `254${digits.slice(1)}`
  if (digits.length === 9) return `254${digits}`
  return digits
}

export function isDarajaConfigured(): boolean {
  return Boolean(
    process.env.MPESA_CONSUMER_KEY &&
      process.env.MPESA_CONSUMER_SECRET &&
      process.env.MPESA_SHORTCODE &&
      process.env.MPESA_PASSKEY
  )
}

async function getAccessToken(): Promise<string> {
  const key = process.env.MPESA_CONSUMER_KEY!
  const secret = process.env.MPESA_CONSUMER_SECRET!
  const auth = Buffer.from(`${key}:${secret}`).toString("base64")
  const base =
    process.env.MPESA_ENV === "production"
      ? "https://api.safaricom.co.ke"
      : "https://sandbox.safaricom.co.ke"

  const res = await fetch(`${base}/oauth/v1/generate?grant_type=client_credentials`, {
    headers: { Authorization: `Basic ${auth}` },
  })
  const data = (await res.json()) as { access_token?: string; errorMessage?: string }
  if (!res.ok || !data.access_token) {
    throw new Error(data.errorMessage || "Failed to get M-Pesa access token")
  }
  return data.access_token
}

export async function initiateMpesaStkPush(params: {
  phoneNumber: string
  amount: number
  accountReference: string
  transactionDesc: string
}): Promise<
  | { ok: true; checkoutRequestId: string; merchantRequestId: string }
  | { ok: false; error: string }
> {
  try {
    const token = await getAccessToken()
    const shortcode = process.env.MPESA_SHORTCODE!
    const passkey = process.env.MPESA_PASSKEY!
    const base =
      process.env.MPESA_ENV === "production"
        ? "https://api.safaricom.co.ke"
        : "https://sandbox.safaricom.co.ke"

    const timestamp = new Date()
      .toISOString()
      .replace(/[-:TZ.]/g, "")
      .slice(0, 14)
    const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString("base64")

    const callbackUrl =
      process.env.MPESA_CALLBACK_URL?.trim() ||
      `${process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "")}/api/billing/mpesa/callback`

    const body = {
      BusinessShortCode: shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: Math.round(params.amount),
      PartyA: normalizePhone(params.phoneNumber),
      PartyB: shortcode,
      PhoneNumber: normalizePhone(params.phoneNumber),
      CallBackURL: callbackUrl,
      AccountReference: params.accountReference,
      TransactionDesc: params.transactionDesc,
    }

    const res = await fetch(`${base}/mpesa/stkpush/v1/processrequest`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    const data = (await res.json()) as {
      CheckoutRequestID?: string
      MerchantRequestID?: string
      errorMessage?: string
      ResponseDescription?: string
    }

    if (!res.ok || !data.CheckoutRequestID) {
      return {
        ok: false,
        error: data.errorMessage || data.ResponseDescription || "STK push failed",
      }
    }

    return {
      ok: true,
      checkoutRequestId: data.CheckoutRequestID,
      merchantRequestId: data.MerchantRequestID || "",
    }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "STK push failed" }
  }
}
