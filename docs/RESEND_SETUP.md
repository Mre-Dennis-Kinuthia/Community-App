# Resend email setup (optional)

**Prefer SMTP if you cannot verify a custom domain on Resend** — see [EMAIL_SETUP.md](./EMAIL_SETUP.md) for Brevo or your mailbox host.

Resend requires a domain you control with DNS (SPF/DKIM). It does not support free email domains (Gmail, etc.) as the sending domain.

## Quick Resend steps

1. Sign up at [https://resend.com](https://resend.com) → **API Keys** → create key (`re_...`).
2. **Domains** → add domain (e.g. `impacthubnairobi.org`) → add DNS records → wait for **Verified**.
3. Set on Vercel (both apps):

```env
EMAIL_PROVIDER=resend
RESEND_API_KEY=re_...
EMAIL_FROM="Impact Hub Nairobi <noreply@impacthubnairobi.org>"
```

4. Redeploy and test (password reset, event registration, admin blast).

Full platform variables, cron, and troubleshooting: [EMAIL_SETUP.md](./EMAIL_SETUP.md).
