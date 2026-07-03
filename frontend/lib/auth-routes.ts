/** Default destination after sign-in when no ?redirect= is provided */
export const DEFAULT_POST_LOGIN_PATH = "/onboarding"

/** Primary authenticated app entry (onboarding gate lives in dashboard layout) */
export const APP_HOME_PATH = "/dashboard"

export const AUTH_PAGE_PATHS = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/accept-invite",
] as const

/** Marketing home — signed-in members should not stay here */
export const MARKETING_HOME_PATH = "/"

const AUTH_PAGE_SET = new Set<string>(AUTH_PAGE_PATHS)

export function isAuthPagePath(pathname: string): boolean {
  return AUTH_PAGE_SET.has(pathname)
}

/**
 * Accept only same-origin relative paths for post-login redirects.
 * Rejects auth/marketing loops and protocol-relative URLs.
 */
export function safeRedirectPath(
  path: string | null | undefined
): string | null {
  if (!path?.trim()) return null

  let decoded = path.trim()
  try {
    if (decoded.includes("%")) decoded = decodeURIComponent(decoded)
  } catch {
    return null
  }

  if (!decoded.startsWith("/") || decoded.startsWith("//")) return null

  const pathname = decoded.split("?")[0]?.split("#")[0] ?? ""
  if (
    pathname === MARKETING_HOME_PATH ||
    isAuthPagePath(pathname)
  ) {
    return null
  }

  return decoded
}

/** Where to send an already-signed-in user leaving auth or marketing pages */
export function resolveAuthenticatedRedirect(
  redirectParam: string | null | undefined,
  callbackUrlParam: string | null | undefined
): string {
  return (
    safeRedirectPath(redirectParam) ??
    safeRedirectPath(callbackUrlParam) ??
    APP_HOME_PATH
  )
}
