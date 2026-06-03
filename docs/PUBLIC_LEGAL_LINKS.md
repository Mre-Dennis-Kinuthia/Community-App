# Public privacy policy & terms of service URLs

The Community App serves legal pages at fixed paths (no login required):

| Document | Path | Example (production) |
|----------|------|----------------------|
| Privacy Policy | `/privacy` | `https://YOUR-APP-DOMAIN/privacy` |
| Terms of Service | `/terms` | `https://YOUR-APP-DOMAIN/terms` |

Set **`NEXT_PUBLIC_APP_URL`** in Vercel (and locally in `.env.local`) to your public member-app origin **without** a trailing slash, e.g. `https://impacthubnairobi-app.vercel.app` or a custom domain you control.

Full URLs are then:

- Privacy: `{NEXT_PUBLIC_APP_URL}/privacy`
- Terms: `{NEXT_PUBLIC_APP_URL}/terms`

## Google OAuth consent screen

In [Google Cloud Console](https://console.cloud.google.com/) → **APIs & Services** → **OAuth consent screen**:

1. **Application privacy policy link** → `{NEXT_PUBLIC_APP_URL}/privacy`
2. **Application terms of service link** → `{NEXT_PUBLIC_APP_URL}/terms`

**Authorized domains:** Google only accepts a root domain you own (e.g. `impacthub.net`), not `*.vercel.app`. If you use a Vercel default hostname for the app, you can still use those `/privacy` and `/terms` URLs on the consent screen in many setups, but domain verification may require a custom domain on `impacthub.net`. See [GOOGLE_WORKSPACE_EMAIL.md](./GOOGLE_WORKSPACE_EMAIL.md) for details.

## In the app

- Home footer links to `/privacy` and `/terms`
- Login and register show the same links
- `GET /sitemap.xml` includes both pages for crawlers
