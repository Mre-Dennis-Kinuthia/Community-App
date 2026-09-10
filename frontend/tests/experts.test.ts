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
  buildExpertProfileSyncData,
  DEFAULT_EIR_TITLE,
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
    expect(expert.industry).toBeNull()
    expect(expert.location).toBeNull()
  })

  it("prefers the linked member profile on community expert cards", () => {
    const expert = mapPublicExpert({
      id: "1",
      slug: "amina",
      name: "Admin Name",
      title: "Climate advisor",
      organization: "Old org",
      industry: "Other",
      location: null,
      bio: "Admin-written bio that should yield to the member intro.",
      photoUrl: "/admin.jpg",
      expertise: ["Climate"],
      initiatives: [],
      bookingUrl: null,
      linkedInUrl: null,
      isFeatured: false,
      user: {
        name: "Amina Otieno",
        image: "/amina.jpg",
        profile: {
          bio: "I support climate ventures across Hub programmes.",
          organization: "AECF",
          industry: "Climate & Energy",
          location: "Nairobi",
          skills: ["Fundraising"],
          socialLinks: { linkedin: "https://www.linkedin.com/in/amina" },
        },
      },
    })
    expect(expert.name).toBe("Amina Otieno")
    expect(expert.photoUrl).toBe("/amina.jpg")
    expect(expert.organization).toBe("AECF")
    expect(expert.industry).toBe("Climate & Energy")
    expect(expert.location).toBe("Nairobi")
    expect(expert.bio).toContain("climate ventures")
    expect(expert.expertise).toEqual(["Climate", "Fundraising"])
    expect(expert.linkedInUrl).toContain("linkedin.com/in/amina")
  })

  it("copies member profile fields onto the EIR record", () => {
    const patch = buildExpertProfileSyncData(
      { title: DEFAULT_EIR_TITLE, expertise: ["Climate"] },
      {
        name: "Amina Otieno",
        image: "/amina.jpg",
        bio: "I support climate ventures across Hub programmes.",
        role: "Program / Project Lead",
        organization: "AECF",
        industry: "Climate & Energy",
        location: "Nairobi",
        skills: ["Fundraising"],
        linkedInUrl: "https://www.linkedin.com/in/amina",
      }
    )
    expect(patch.name).toBe("Amina Otieno")
    expect(patch.photoUrl).toBe("/amina.jpg")
    expect(patch.title).toBe("Program / Project Lead")
    expect(patch.organization).toBe("AECF")
    expect(patch.industry).toBe("Climate & Energy")
    expect(patch.location).toBe("Nairobi")
    expect(patch.expertise).toEqual(["Climate", "Fundraising"])
    expect(patch.linkedInUrl).toContain("linkedin.com/in/amina")
  })

  it("does not overwrite a custom EIR title with the member role", () => {
    const patch = buildExpertProfileSyncData(
      { title: "Climate advisor", expertise: [] },
      { role: "Program / Project Lead" }
    )
    expect(patch.title).toBeUndefined()
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
