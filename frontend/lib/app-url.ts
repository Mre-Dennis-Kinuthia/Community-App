function normalizePublicOrigin(value: string): string {
  const withProtocol = value.startsWith("http") ? value : `https://${value}`
  return withProtocol.replace(/\/$/, "")
}

export function getAppBaseUrl(): string {
  const configured =
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    process.env.AUTH_URL?.trim() ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim() ||
    process.env.VERCEL_URL?.trim()

  if (configured) {
    return normalizePublicOrigin(configured)
  }

  if (typeof window !== "undefined") {
    return window.location.origin.replace(/\/$/, "")
  }

  return "http://localhost:3000"
}

export function getAdminAppBaseUrl(): string {
  const configured =
    process.env.NEXT_PUBLIC_ADMIN_APP_URL?.trim() ||
    process.env.ADMIN_APP_URL?.trim()

  if (configured) {
    const withProtocol = configured.startsWith("http") ? configured : `https://${configured}`
    return withProtocol.replace(/\/$/, "")
  }

  return "http://localhost:3001"
}

/** Public privacy policy path (no trailing slash). */
export const PRIVACY_POLICY_PATH = "/privacy"

/** Public terms of service path (no trailing slash). */
export const TERMS_OF_SERVICE_PATH = "/terms"

export function getPrivacyPolicyUrl(): string {
  return `${getAppBaseUrl()}${PRIVACY_POLICY_PATH}`
}

export function getTermsOfServiceUrl(): string {
  return `${getAppBaseUrl()}${TERMS_OF_SERVICE_PATH}`
}

export function getNewsArticleUrl(post: { id: string; slug?: string | null } | string): string {
  if (typeof post === "string") {
    return `${getAppBaseUrl()}/news/${post}`
  }
  return `${getAppBaseUrl()}/news/${post.slug || post.id}`
}

export function getCommunityOpportunityUrl(opportunityId: string): string {
  return `${getAppBaseUrl()}/resources/opportunities/${opportunityId}`
}

export function getDashboardBookingUrl(bookingId: string): string {
  return `${getAppBaseUrl()}/dashboard/bookings/${bookingId}`
}

export function getCommunityMemberProfileUrl(member: {
  id: string
  slug?: string | null
  profile?: { slug?: string | null } | null
}): string {
  const slug = member.slug ?? member.profile?.slug ?? null
  return `${getAppBaseUrl()}/community/${slug || member.id}`
}

export function getNewsletterUnsubscribeUrl(token: string): string {
  return `${getAppBaseUrl()}/newsletter/unsubscribe?token=${encodeURIComponent(token)}`
}
