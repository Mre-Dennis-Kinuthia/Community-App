import { z } from "zod"

export type MemberSocialLinks = {
  linkedin?: string
}

export const memberSocialLinksSchema = z
  .object({
    linkedin: z.union([z.string(), z.null()]).optional(),
  })
  .optional()
  .nullable()

/** Parse JSON from MemberProfile.socialLinks */
export function parseMemberSocialLinks(raw: unknown): MemberSocialLinks {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {}
  const record = raw as Record<string, unknown>
  const linkedin = typeof record.linkedin === "string" ? record.linkedin.trim() : ""
  return linkedin ? { linkedin } : {}
}

/** Normalize user input to a canonical LinkedIn profile URL, or null if empty/invalid. */
export function normalizeLinkedInUrl(input: string): string | null {
  const trimmed = input.trim()
  if (!trimmed) return null

  let candidate = trimmed
  if (!/^https?:\/\//i.test(candidate)) {
    candidate = `https://${candidate.replace(/^\/+/, "")}`
  }

  try {
    const url = new URL(candidate)
    const host = url.hostname.replace(/^www\./i, "").toLowerCase()
    if (host !== "linkedin.com" && !host.endsWith(".linkedin.com")) {
      return null
    }
    const path = url.pathname.replace(/\/+$/, "") || "/"
    if (path === "/" || path === "/in" || path === "/company") {
      return null
    }
    url.hash = ""
    url.search = ""
    return url.toString().replace(/\/$/, "")
  } catch {
    return null
  }
}

export function validateLinkedInInput(input: string): string | null {
  if (!input.trim()) return null
  if (!normalizeLinkedInUrl(input)) {
    return "Enter a valid LinkedIn profile URL (e.g. linkedin.com/in/yourname)."
  }
  return null
}

/** Build payload for Prisma JSON column from optional linkedin string. */
export function socialLinksFromInput(
  links: MemberSocialLinks | null | undefined
): MemberSocialLinks | null {
  if (links === null) return null
  if (!links) return null
  const linkedin = links.linkedin ? normalizeLinkedInUrl(links.linkedin) : null
  if (!linkedin) return null
  return { linkedin }
}
