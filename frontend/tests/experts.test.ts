import { describe, expect, it } from "vitest"
import {
  expertPublicParamWhere,
  expertPublicPath,
  generateExpertSlug,
  mapPublicExpert,
  meetingFormatLabel,
  meetingRequestSchema,
  expertEventCreateSchema,
  normalizeTagList,
  expertRequestTypeLabel,
  EIR_INVITE_PREFIX,
  EIR_DASHBOARD_PATH,
} from "@/lib/experts"

describe("Experts in Residence", () => {
  it("builds slugs and public paths", () => {
    expect(generateExpertSlug("Dr. Amina Otieno")).toBe("dr-amina-otieno")
    expect(generateExpertSlug("  ")).toBe("expert")
    expect(expertPublicPath({ id: "abc", slug: "amina" })).toBe("/experts/amina")
    expect(expertPublicParamWhere("amina")).toEqual({ slug: "amina" })
  })

  it("hides unpublished internals from the public map", () => {
    const expert = mapPublicExpert({
      id: "1",
      slug: "amina",
      name: "Amina Otieno",
      title: "Climate advisor",
      organization: "Impact Hub Nairobi",
      bio: "Supports climate ventures.",
      photoUrl: null,
      expertise: ["Climate"],
      initiatives: ["Climate action"],
      bookingUrl: "https://calendar.google.com/example",
      linkedInUrl: null,
      isFeatured: true,
      _count: { events: 2 },
    })
    expect(expert).not.toHaveProperty("email")
    expect(expert.eventsCount).toBe(2)
    expect(expert.bookingUrl).toContain("calendar.google.com")
  })

  it("validates meeting requests and virtual events", () => {
    expect(meetingFormatLabel("in-person")).toMatch(/Hub/)
    expect(normalizeTagList([" Climate ", "climate", ""])).toEqual(["Climate"])

    const meeting = meetingRequestSchema.safeParse({
      topic: "Fundraising intro",
      message: "We are preparing a climate seed round and would like 30 minutes.",
      meetingFormat: "virtual",
    })
    expect(meeting.success).toBe(true)
    if (meeting.success) {
      expect(meeting.data.requestType).toBe("clinic")
    }

    const services = meetingRequestSchema.safeParse({
      topic: "Advisory retainer",
      message: "We would like to procure strategy support for a six-month programme.",
      requestType: "services",
    })
    expect(services.success).toBe(true)
    expect(expertRequestTypeLabel("services")).toBe("Services")
    expect(EIR_DASHBOARD_PATH).toBe("/dashboard/eir")
    expect(EIR_INVITE_PREFIX).toBe("eir-invite:")

    const tooShort = meetingRequestSchema.safeParse({
      topic: "Hi",
      message: "Help",
    })
    expect(tooShort.success).toBe(false)

    const event = expertEventCreateSchema.safeParse({
      title: "Office hours",
      description: "Open virtual office hours for members working on climate ventures.",
      startDate: "2026-09-20T10:00",
      visibility: "members",
    })
    expect(event.success).toBe(true)
  })
})
