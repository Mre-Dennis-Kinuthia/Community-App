import { beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => {
  const transaction = {
    emailActionToken: {
      deleteMany: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
      updateMany: vi.fn(),
    },
  }

  return {
    transaction,
    prisma: {
      user: {
        findUnique: vi.fn(),
      },
      $transaction: vi.fn(
        (callback: (tx: typeof transaction) => Promise<unknown>) =>
          callback(transaction)
      ),
    },
    issueEmailActionToken: vi.fn(),
    isEmailConfigured: vi.fn(),
    sendEmailInBackground: vi.fn(),
    activateVerifiedRegistration: vi.fn(),
  }
})

vi.mock("@/lib/prisma", () => ({ prisma: mocks.prisma }))
vi.mock("@/lib/email-action-tokens", () => ({
  hashEmailActionToken: (token: string) => `hash:${token}`,
  issueEmailActionToken: mocks.issueEmailActionToken,
}))
vi.mock("@/lib/app-url", () => ({ getAppBaseUrl: () => "https://example.test" }))
vi.mock("@/lib/email/send", () => ({
  isEmailConfigured: mocks.isEmailConfigured,
  sendEmailInBackground: mocks.sendEmailInBackground,
}))
vi.mock("@/lib/email/messages", () => ({
  sendEmailVerificationEmail: vi.fn(),
}))
vi.mock("@/lib/registration-activation", () => ({
  activateVerifiedRegistration: mocks.activateVerifiedRegistration,
}))

import {
  consumeEmailVerificationToken,
  issueEmailVerificationForEmail,
} from "@/lib/email-verification"

describe("consumeEmailVerificationToken", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useRealTimers()
  })

  it("issues verification links that expire after one hour", async () => {
    const now = new Date("2026-11-18T12:00:00.000Z")
    vi.useFakeTimers()
    vi.setSystemTime(now)
    mocks.prisma.user.findUnique.mockResolvedValue({
      id: "user-1",
      email: "member@example.org",
      name: "Member",
      emailVerified: null,
    })
    mocks.isEmailConfigured.mockReturnValue(true)
    mocks.issueEmailActionToken.mockResolvedValue({
      token: "one-time-token",
      tokenHash: "hash:one-time-token",
    })

    await issueEmailVerificationForEmail("member@example.org")

    expect(mocks.issueEmailActionToken).toHaveBeenCalledWith({
      purpose: "member-email-verification",
      subjectId: "user-1",
      expiresAt: new Date(now.getTime() + 60 * 60 * 1000),
    })
  })

  it("accepts a valid token once and rejects its replay", async () => {
    let tokenAvailable = true
    mocks.prisma.user.findUnique.mockResolvedValue({ id: "user-1" })
    mocks.transaction.emailActionToken.deleteMany.mockImplementation(
      async ({ where }: { where: { tokenHash: string; expiresAt: { gt: Date } } }) => {
        expect(where.tokenHash).toBe("hash:one-time-token")
        expect(where.expiresAt.gt).toBeInstanceOf(Date)
        if (!tokenAvailable) return { count: 0 }
        tokenAvailable = false
        return { count: 1 }
      }
    )
    mocks.transaction.user.findUnique.mockResolvedValue({ emailVerified: null })
    mocks.transaction.user.updateMany.mockResolvedValue({ count: 1 })

    const firstUse = await consumeEmailVerificationToken(
      "member@example.org",
      "one-time-token"
    )
    const replay = await consumeEmailVerificationToken(
      "member@example.org",
      "one-time-token"
    )

    expect(firstUse).toEqual({ ok: true, userId: "user-1" })
    expect(replay).toEqual({ ok: false, reason: "invalid" })
    expect(mocks.activateVerifiedRegistration).toHaveBeenCalledTimes(1)
  })
})
