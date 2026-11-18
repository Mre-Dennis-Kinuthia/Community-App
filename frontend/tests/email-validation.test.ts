import { describe, expect, it } from "vitest"
import { validateEmailAddress } from "@/lib/email-validation"

describe("validateEmailAddress", () => {
  it("normalizes a valid address", () => {
    expect(validateEmailAddress(" Member@GMAIL.COM ")).toEqual({
      valid: true,
      email: "member@gmail.com",
    })
  })

  it("rejects malformed, reserved, and disposable addresses", () => {
    expect(validateEmailAddress("not-an-email")).toEqual({
      valid: false,
      reason: "invalid",
    })
    expect(validateEmailAddress("member@example.com")).toEqual({
      valid: false,
      reason: "reserved",
    })
    expect(validateEmailAddress("member@mailinator.com")).toEqual({
      valid: false,
      reason: "disposable",
    })
  })
})
