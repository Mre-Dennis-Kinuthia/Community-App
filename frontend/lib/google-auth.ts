/** Google OAuth sign-in (NextAuth) — separate from Gmail SMTP OAuth. */

export function googleSignInErrorMessage(code: string | null): string | null {
  if (!code) return null
  switch (code) {
    case "OAuthSignin":
    case "OAuthCallback":
      return "Google sign-in could not be completed. Add your site URL under Authorized redirect URIs in Google Cloud Console."
    case "OAuthAccountNotLinked":
      return "This email already has a password account. Sign in with email and password instead."
    case "AccessDenied":
      return "Google sign-in was cancelled."
    case "Configuration":
      return "Google sign-in is not configured (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, AUTH_SECRET on Vercel)."
    default:
      return "Sign-in failed. Try again or use email and password."
  }
}
