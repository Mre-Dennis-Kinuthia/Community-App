import { describe, expect, it } from "vitest"
import {
  isOnboardingComplete,
  validateOnboardingStep1,
  validateOnboardingStep2,
} from "@/lib/member-segmentation"

const complete = {
  memberType: "entrepreneur",
  industry: "Climate & Energy",
  role: "Founder / Co-founder",
  organization: "Acme Ventures",
  bio: "We build climate tools for East African smallholders and cities.",
  interests: ["Find collaborators"],
  availability: ["Open to collaboration"],
  phone: "+254712345678",
  location: "Nairobi, Kenya",
  skills: ["Product"],
  linkedin: "https://www.linkedin.com/in/jane",
  image: "/avatars/preset-1.png",
}

describe("Connect onboarding completeness", () => {
  it("requires location, photo, skills, and LinkedIn for a complete profile", () => {
    expect(isOnboardingComplete(complete)).toBe(true)
    expect(isOnboardingComplete({ ...complete, location: "" })).toBe(false)
    expect(isOnboardingComplete({ ...complete, image: "" })).toBe(false)
    expect(isOnboardingComplete({ ...complete, skills: [] })).toBe(false)
    expect(isOnboardingComplete({ ...complete, linkedin: "" })).toBe(false)
  })

  it("blocks step 1 without location or photo", () => {
    expect(
      validateOnboardingStep1({
        memberType: "entrepreneur",
        sector: "Climate & Energy",
        role: "Founder / Co-founder",
        organization: "Acme",
        location: "",
        image: "/a.png",
      })
    ).toMatch(/city or country/i)
    expect(
      validateOnboardingStep1({
        memberType: "entrepreneur",
        sector: "Climate & Energy",
        role: "Founder / Co-founder",
        organization: "Acme",
        location: "Nairobi",
        image: "",
      })
    ).toMatch(/photo or pick an avatar/i)
  })

  it("blocks step 2 without skills or LinkedIn", () => {
    expect(
      validateOnboardingStep2({
        goals: ["Find collaborators"],
        availability: ["Open to collaboration"],
        bio: complete.bio,
        linkedin: "",
        skills: ["Product"],
      })
    ).toMatch(/LinkedIn/i)
    expect(
      validateOnboardingStep2({
        goals: ["Find collaborators"],
        availability: ["Open to collaboration"],
        bio: complete.bio,
        linkedin: "linkedin.com/in/jane",
        skills: [],
      })
    ).toMatch(/skill/i)
  })
})
