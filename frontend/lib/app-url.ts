export function getAppBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000")
  ).replace(/\/$/, "")
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
