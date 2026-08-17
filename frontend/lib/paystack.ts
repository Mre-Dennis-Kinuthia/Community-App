import { createHmac, randomBytes } from "crypto"
import { getAppBaseUrl } from "@/lib/app-url"

const PAYSTACK_BASE = "https://api.paystack.co"

export function isPaystackConfigured(): boolean {
  return Boolean(process.env.PAYSTACK_SECRET_KEY?.trim())
}

export function requirePaystackSecret(): string {
  const key = process.env.PAYSTACK_SECRET_KEY?.trim()
  if (!key) {
    throw new Error("Paystack is not configured. Set PAYSTACK_SECRET_KEY.")
  }
  return key
}

/** Convert KES (or major units) to the smallest currency unit Paystack expects. */
export function toPaystackAmount(amountMajor: number): number {
  return Math.round(Number(amountMajor) * 100)
}

export function generatePaystackReference(prefix = "ihn"): string {
  return `${prefix}_${randomBytes(12).toString("hex")}`
}

export type PaystackInitializeParams = {
  email: string
  amountKes: number
  reference: string
  callbackUrl: string
  metadata?: Record<string, unknown>
  currency?: string
}

export type PaystackInitializeResult = {
  authorizationUrl: string
  accessCode: string
  reference: string
}

async function paystackFetch<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const secret = requirePaystackSecret()
  const res = await fetch(`${PAYSTACK_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  })
  const data = (await res.json()) as {
    status: boolean
    message?: string
    data?: T
  }
  if (!res.ok || !data.status || data.data == null) {
    throw new Error(data.message || `Paystack request failed (${res.status})`)
  }
  return data.data
}

export async function initializeTransaction(
  params: PaystackInitializeParams
): Promise<PaystackInitializeResult> {
  const data = await paystackFetch<{
    authorization_url: string
    access_code: string
    reference: string
  }>("/transaction/initialize", {
    method: "POST",
    body: JSON.stringify({
      email: params.email,
      amount: toPaystackAmount(params.amountKes),
      currency: params.currency ?? "KES",
      reference: params.reference,
      callback_url: params.callbackUrl,
      metadata: params.metadata ?? {},
    }),
  })

  return {
    authorizationUrl: data.authorization_url,
    accessCode: data.access_code,
    reference: data.reference,
  }
}

export type PaystackVerifyResult = {
  status: string
  reference: string
  amount: number
  currency: string
  paidAt: string | null
  channel: string | null
  metadata: Record<string, unknown> | null
}

export async function verifyTransaction(reference: string): Promise<PaystackVerifyResult> {
  const data = await paystackFetch<{
    status: string
    reference: string
    amount: number
    currency: string
    paid_at?: string | null
    channel?: string | null
    metadata?: Record<string, unknown> | null
  }>(`/transaction/verify/${encodeURIComponent(reference)}`)

  return {
    status: data.status,
    reference: data.reference,
    amount: data.amount,
    currency: data.currency,
    paidAt: data.paid_at ?? null,
    channel: data.channel ?? null,
    metadata: data.metadata ?? null,
  }
}

/** Paystack signs webhooks with HMAC SHA512 of the raw body using the secret key. */
export function verifyWebhookSignature(rawBody: string, signature: string | null): boolean {
  if (!signature) return false
  const secret = process.env.PAYSTACK_SECRET_KEY?.trim()
  if (!secret) return false
  const hash = createHmac("sha512", secret).update(rawBody).digest("hex")
  return hash === signature
}

export function paystackCallbackUrl(query?: Record<string, string>): string {
  const base = `${getAppBaseUrl()}/api/billing/paystack/callback`
  if (!query || Object.keys(query).length === 0) return base
  const params = new URLSearchParams(query)
  return `${base}?${params.toString()}`
}
