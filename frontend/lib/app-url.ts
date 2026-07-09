export function getAppBaseUrl(): string {
  const configured =
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    process.env.AUTH_URL?.trim() ||
    process.env.VERCEL_URL?.trim()

  if (configured) {
    const withProtocol = configured.startsWith("http") ? configured : `https://${configured}`
    return withProtocol.replace(/\/$/, "")
  }

  if (typeof window !== "undefined") {
    return window.location.origin.replace(/\/$/, "")
  }

  return "http://localhost:3000"
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

export function getNewsArticleUrl(postId: string): string {
  return `${getAppBaseUrl()}/news/${postId}`
}

export function getCommunityOpportunityUrl(opportunityId: string): string {
  return `${getAppBaseUrl()}/resources/opportunities/${opportunityId}`
}

export function getDashboardBookingUrl(bookingId: string): string {
  return `${getAppBaseUrl()}/dashboard/bookings/${bookingId}`
}

export function getCommunityMemberProfileUrl(memberId: string): string {
  return `${getAppBaseUrl()}/community/${memberId}`
}

export function getNewsletterUnsubscribeUrl(token: string): string {
  return `${getAppBaseUrl()}/newsletter/unsubscribe?token=${encodeURIComponent(token)}`
}
