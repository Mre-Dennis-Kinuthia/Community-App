/**
 * Smoke-test Paystack integration (API + optional DB checkout).
 * Run: npx tsx scripts/test-paystack.ts
 */
import { config } from "dotenv"
import { resolve } from "path"
import { createHmac } from "crypto"

config({ path: resolve(__dirname, "../.env.local") })
config({ path: resolve(__dirname, "../.env") })

import { prisma } from "../lib/prisma"
import {
  generatePaystackReference,
  initializeTransaction,
  isPaystackConfigured,
  paystackCallbackUrl,
  verifyTransaction,
  verifyWebhookSignature,
} from "../lib/paystack"
import { startPaystackCheckout } from "../lib/paystack-checkout"
import { getAppBaseUrl } from "../lib/app-url"

const TEST_EMAIL = process.env.PAYSTACK_TEST_EMAIL?.trim() || "test@impacthub.net"

async function step(name: string, fn: () => Promise<void>) {
  process.stdout.write(`• ${name}… `)
  try {
    await fn()
    console.log("OK")
    return true
  } catch (err) {
    console.log("FAIL")
    throw err
  }
}

async function stepOptional(name: string, fn: () => Promise<void>) {
  process.stdout.write(`• ${name}… `)
  try {
    await fn()
    console.log("OK")
    return true
  } catch (err) {
    console.log("SKIP")
    console.log(`  reason: ${err instanceof Error ? err.message : String(err)}`)
    return false
  }
}

async function main() {
  console.log("Paystack integration test\n")

  await step("Paystack secret key configured", async () => {
    if (!isPaystackConfigured()) {
      throw new Error("PAYSTACK_SECRET_KEY is missing")
    }
  })

  await step("App base URL resolves", async () => {
    const base = getAppBaseUrl()
    if (!base.startsWith("http")) {
      throw new Error(`Invalid base URL: ${base}`)
    }
    console.log(`\n  base=${base}`)
    console.log(`  callback=${paystackCallbackUrl()}`)
  })

  await step("Webhook signature verification", async () => {
    const body = JSON.stringify({ event: "charge.success", data: { reference: "test_ref" } })
    const secret = process.env.PAYSTACK_SECRET_KEY!.trim()
    const sig = createHmac("sha512", secret).update(body).digest("hex")
    if (!verifyWebhookSignature(body, sig)) {
      throw new Error("Valid signature rejected")
    }
    if (verifyWebhookSignature(body, "bad-signature")) {
      throw new Error("Invalid signature accepted")
    }
  })

  let reference = ""
  let authorizationUrl = ""

  await step("Initialize transaction via Paystack API", async () => {
    reference = generatePaystackReference("ihn_test")
    const result = await initializeTransaction({
      email: TEST_EMAIL,
      amountKes: 100,
      reference,
      callbackUrl: paystackCallbackUrl(),
      metadata: { type: "membership", smokeTest: true },
    })
    authorizationUrl = result.authorizationUrl
    if (!authorizationUrl.includes("paystack")) {
      throw new Error(`Unexpected authorization URL: ${authorizationUrl}`)
    }
    console.log(`\n  reference=${reference}`)
    console.log(`  checkout=${authorizationUrl}`)
  })

  await step("Verify pending transaction", async () => {
    const verified = await verifyTransaction(reference)
    if (verified.reference !== reference) {
      throw new Error(`Reference mismatch: ${verified.reference}`)
    }
    if (!["success", "pending", "abandoned", "failed"].includes(verified.status)) {
      throw new Error(`Unexpected status: ${verified.status}`)
    }
    console.log(`\n  status=${verified.status}`)
  })

  const dbReady = await stepOptional("Database connection", async () => {
    await prisma.$queryRaw`SELECT 1`
  })

  let cleanedPaymentId: string | null = null

  if (dbReady) {
    await step("startPaystackCheckout (membership smoke)", async () => {
      const user = await prisma.user.findFirst({
        where: { email: { not: "" } },
        select: { id: true, email: true },
        orderBy: { createdAt: "asc" },
      })
      if (!user?.email) {
        throw new Error("No user in database — skip checkout DB test or seed a user")
      }

      const checkout = await startPaystackCheckout(prisma, {
        userId: user.id,
        email: user.email,
        amount: 100,
        metadata: {
          type: "membership",
          successPath: "/billing?paid=1",
          smokeTest: true,
        },
        paymentMeta: { smokeTest: true },
      })

      cleanedPaymentId = checkout.paymentId
      if (!checkout.authorizationUrl.includes("paystack")) {
        throw new Error("Missing Paystack checkout URL from DB flow")
      }
      console.log(`\n  user=${user.email}`)
      console.log(`  paymentId=${checkout.paymentId}`)
    })

    if (cleanedPaymentId) {
      await step("Cleanup smoke-test payment row", async () => {
        await prisma.payment.delete({ where: { id: cleanedPaymentId! } })
      })
    }
  }

  await step("Webhook route rejects invalid signature", async () => {
    const res = await fetch("http://localhost:3000/api/billing/paystack/webhook", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-paystack-signature": "invalid",
      },
      body: JSON.stringify({ event: "charge.success", data: { reference: "fake" } }),
    })
    if (res.status !== 401) {
      throw new Error(`Expected 401, got ${res.status}`)
    }
  })

  await step("Webhook route accepts valid signature", async () => {
    const body = JSON.stringify({
      event: "charge.success",
      data: { reference: "ihn_missing_payment_ref" },
    })
    const sig = createHmac("sha512", process.env.PAYSTACK_SECRET_KEY!.trim())
      .update(body)
      .digest("hex")
    const res = await fetch("http://localhost:3000/api/billing/paystack/webhook", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-paystack-signature": sig,
      },
      body,
    })
    const json = (await res.json()) as { received?: boolean; ok?: boolean; error?: string }
    if (res.status !== 200) {
      throw new Error(`Expected 200, got ${res.status}: ${JSON.stringify(json)}`)
    }
    if (!json.received) {
      throw new Error("Webhook did not acknowledge receipt")
    }
    console.log(`\n  ok=${json.ok} error=${json.error ?? "none"}`)
  })

  console.log("\nAll Paystack checks passed.")
  console.log("\nManual step: open the checkout URL in a browser and pay with Paystack test card:")
  console.log("  Card: 4084 0840 8408 4081  CVV: 408  Expiry: any future date  OTP: 123456")
  console.log(`\n${authorizationUrl}`)
}

main()
  .catch((err) => {
    console.error("\nError:", err instanceof Error ? err.message : err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
