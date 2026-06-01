# Google Workspace email — complete implementation guide

This guide walks you through sending email from the Impact Hub community platform as `**dennis.ndungu@impacthub.net**`, using **Google OAuth 2.0**. You do not need Brevo, SendGrid, App Passwords, or DNS records on `impacthub.net` for a third-party mail provider.

The application code is **already implemented** in the repository. Your work is entirely configuration: set up a Google Cloud project, obtain a refresh token once, paste values into environment files, test locally, then copy the same values to Vercel.

---

## Before you start

### What you are building

When a member clicks **Forgot password**, registers for an event, or an admin sends an event blast, the server calls `sendEmail()`. That function uses **Nodemailer** to connect to **Google’s mail servers** and send as Dennis’s Workspace mailbox.

Google does not allow the app to use Dennis’s normal login password for this. Instead, you register an “OAuth application” in Google Cloud, Dennis approves it once, and Google gives you a **refresh token**. The app stores that token in environment variables and uses it to obtain short-lived access tokens automatically whenever it needs to send mail.

### What you need ready

- Access to `**dennis.ndungu@impacthub.net`** (you will sign in as Dennis during setup).
- A Google account with permission to create projects in [Google Cloud Console](https://console.cloud.google.com/). If `impacthub.net` is Google Workspace, an admin account is ideal so you can choose **Internal** app type.
- About **20–30 minutes** for the first-time Google setup.
- A password manager or secure note to store the Client ID, Client secret, and refresh token.

### Files you will edit


| File                                           | Purpose                      |
| ---------------------------------------------- | ---------------------------- |
| `Community-App/frontend/.env.local`            | Local env for the member app |
| `Community-app-admin/.env.local`               | Local env for the admin app  |
| Vercel → both projects → Environment Variables | Production                   |


Never commit real secrets to git. The `.env.local` files are gitignored.

---

## Part 1 — Understand what the app expects

The email layer lives in `Community-App/frontend/lib/email/`. The admin app has an identical copy under `Community-app-admin/lib/email/`.

When **all four** of the following are set, the app uses Google OAuth automatically:


| Variable               | What it is                                                                                                 |
| ---------------------- | ---------------------------------------------------------------------------------------------------------- |
| `SMTP_USER`            | The mailbox that sends mail. Use `dennis.ndungu@impacthub.net`.                                            |
| `GOOGLE_CLIENT_ID`     | Public identifier for your OAuth app (from Google Cloud).                                                  |
| `GOOGLE_CLIENT_SECRET` | Secret paired with the Client ID. Keep private.                                                            |
| `GOOGLE_REFRESH_TOKEN` | Long-lived token from the OAuth Playground. Lets the server send mail without Dennis logging in each time. |


You also need:


| Variable         | What it is                                                                                        |
| ---------------- | ------------------------------------------------------------------------------------------------- |
| `EMAIL_PROVIDER` | Set to `smtp` so the app uses SMTP instead of Resend.                                             |
| `EMAIL_FROM`     | Display name and address recipients see, e.g. `Impact Hub Nairobi <dennis.ndungu@impacthub.net>`. |
| `EMAIL_STAFF_TO` | Where workspace inquiry notifications are delivered. Use `dennis.ndungu@impacthub.net`.           |


When using OAuth, **do not set `SMTP_PASS`**. If both OAuth variables and `SMTP_PASS` are present, OAuth takes priority.

Forgot password, event registration emails, admin blasts, and reminders all use this same path. You configure it once.

---

## Part 2 — Create a Google Cloud project

Google groups API access, billing, and OAuth settings under a **project**. You need one project dedicated to this app (or reuse an existing one if you already have Google Sign-In configured).

### Step 2.1 — Open Google Cloud Console

1. In your browser, go to **[https://console.cloud.google.com/](https://console.cloud.google.com/)**
2. Sign in with a Google account that can create projects (your Workspace admin account or Dennis’s account both work for setup).

You should see the Google Cloud dashboard. At the very top of the page, next to the Google Cloud logo, there is a **project selector** dropdown. It may show something like “My First Project” or “Select a project”.

### Step 2.2 — Create a new project

1. Click the **project selector** at the top.
2. In the dialog that opens, click **New project** (top right of the dialog).
3. For **Project name**, enter: `Impact Hub Community App`
4. Leave **Organization** as default if you see it (Workspace organizations often show `impacthub.net` here).
5. Click **Create**.

Google takes a few seconds to create the project. When it finishes, select **Impact Hub Community App** from the project dropdown at the top so all following steps apply to this project.

**Why this matters:** OAuth credentials and API enablement are scoped to a project. If you create credentials under the wrong project, the refresh token will not match the Client ID you put in `.env.local`.

---

## Part 3 — Enable the Gmail API

Before your app can send mail through Google on Dennis’s behalf, Google requires the **Gmail API** to be turned on for your project.

### Step 3.1 — Open the API Library

1. Click the **hamburger menu** (☰) in the top-left corner of Google Cloud Console.
2. Go to **APIs & Services** → **Library**.

You will see a searchable catalog of Google APIs.

### Step 3.2 — Enable Gmail API

1. In the search box, type **Gmail API**.
2. Click the result titled **Gmail API** (by Google).
3. On the Gmail API page, click the blue **Enable** button.

If Enable is already greyed out and you see “Manage”, the API is already enabled — you can continue.

**Why this matters:** Without this, token exchange may succeed but sending mail fails with errors like “Access Not Configured” or “Gmail API has not been used in project …”.

---

## Part 4 — Configure the OAuth consent screen

The **OAuth consent screen** is what Dennis (and Google) see when the app asks permission to send email. You must register your app name, contact email, and the specific permission (**scope**) you need.

### Step 4.1 — Open the consent screen settings

1. In the left sidebar (under **APIs & Services**), click **OAuth consent screen**.

If this is your first OAuth app in the project, Google will ask you to configure the consent screen before you can create credentials.

### Step 4.2 — Choose user type

Google asks: **Internal** or **External**?

- **Internal** — Only available if `impacthub.net` is a Google Workspace organization and you are signed in as a user in that organization. Only people with `@impacthub.net` accounts can authorize the app. This is the simplest option for Impact Hub if you have Workspace admin access. **Choose Internal if it is available.**
- **External** — Available to anyone with a Google account. The app starts in **Testing** mode: only email addresses you explicitly add as **Test users** can sign in. You must add `dennis.ndungu@impacthub.net` as a test user. External is fine if Internal is not offered.

Click **Create** after selecting the user type.

### Step 4.3 — Fill in app information (important: avoid Vercel URLs here)

On the **OAuth consent screen** editor (Edit app registration):

1. **App name:** `Impact Hub Community App`
  This is the name Dennis will see on the Google permission screen.
2. **User support email:** Select your email from the dropdown (or Dennis’s).
3. **App logo:** Optional — leave empty for now.
4. **Application home page:** **Leave empty** for now.
  Do **not** enter `https://impacthubnairobi-app.vercel.app` here. Google will then require you to register that domain under **Authorized domains**, and `***.vercel.app` cannot be registered** — you do not own `vercel.app` as a “top private domain”.
5. **Application privacy policy link:** **Leave empty** for now (or use a URL only on a domain you can register — see below).
6. **Application terms of service link:** **Leave empty** for now.
7. **Authorized domains:** **Leave this section empty** during mail-only setup.
  - Enter **only** a root domain you control, e.g. `impacthub.net` — **not** a full URL, **not** `https://`, **not** a trailing slash.  
  - **Never** enter `impacthubnairobi-app.vercel.app` — Google will show: *“Invalid domain: must be a top private domain”*.  
  - Subdomains on `vercel.app`, `github.io`, etc. are **not** allowed in this field.
8. **Developer contact information:** Enter an email address where Google can reach you about the app.

Click **Save and Continue**.

#### If you already added a Vercel URL and Google shows “Missing domain: impacthubnairobi-app.vercel.app”

1. Go back to **OAuth consent screen** → **Edit app**.
2. **Clear** Application home page, privacy policy, and terms fields if they contain `vercel.app`.
3. Under **Authorized domains**, **remove** any `vercel.app` entry.
4. Save. The blocker should disappear.

You do **not** need `impacthubnairobi-app.vercel.app` on the consent screen to send mail. That URL is only for `NEXT_PUBLIC_APP_URL` in Vercel env vars (links inside emails), not for Google OAuth domain registration.

#### If Google requires an authorized domain

Use a root domain your organization owns, e.g. `**impacthub.net`** (no `www`, no path). Verification may require [Google Search Console](https://search.google.com/search-console) access — ask whoever manages IHN DNS/website. This is separate from Brevo/Resend DNS; it is only for OAuth branding if you add public links later.

If you chose **Internal** (Workspace) app type, Google often does not push authorized domains as hard for server-side mail + Playground setup.

Click **Save and Continue** after fixing the form.

### Step 4.4 — Add the Gmail send scope

Scopes define *what* the app is allowed to do. For sending email via SMTP with OAuth, you need the full Gmail scope.

1. You should now be on the **Scopes** step. Click **Add or Remove Scopes**.
2. In the filter/search box, type **mail** or **gmail**.
3. Find and check the scope whose URL is exactly:
  ```
   https://mail.google.com/
  ```
   The description reads something like: *“Read, compose, send, and permanently delete all your email from Gmail”*.
   This sounds broad, but it is the scope Google requires for SMTP send via OAuth. You are not building a Gmail reader — the app only calls `sendMail`.
4. Click **Update** at the bottom of the scope dialog.
5. Click **Save and Continue**.

**Do not** select only `gmail.send` or read-only scopes unless Google’s documentation for your integration explicitly allows it. For Nodemailer + Gmail SMTP, `https://mail.google.com/` is the reliable choice.

### Step 4.5 — Add test users (External apps only)

If you chose **External** user type:

1. On the **Test users** step, click **Add Users**.
2. Enter: `dennis.ndungu@impacthub.net`
3. Click **Save**, then **Save and Continue**.

In Testing mode, Dennis (and any other test users you add) are the only accounts that can complete authorization. Production members never see this screen — only the server uses the refresh token.

If you chose **Internal**, you may not see a test users step. Continue to the summary and click **Back to Dashboard**.

---

## Part 5 — Create OAuth client credentials

Now you create the **Client ID** and **Client secret** that identify your application to Google. You will paste these into `.env.local` and Vercel.

### Step 5.1 — Open Credentials

1. In the left sidebar, click **Credentials** (under **APIs & Services**).
2. Click **+ Create Credentials** at the top.
3. Select **OAuth client ID**.

If Google asks you to configure the consent screen first, go back to Part 4.

### Step 5.2 — Configure the OAuth client

1. **Application type:** Select **Web application**.
2. **Name:** `Community App Mail`
  (This is only for your reference in the console.)
3. **Authorized JavaScript origins:** Leave empty for this SMTP setup. Origins are for browser JavaScript OAuth flows; the Playground and your server use redirect URIs instead.
4. **Authorized redirect URIs:** Click **+ Add URI** and enter exactly:
  ```
   https://developers.google.com/oauthplayground
  ```
   There must be no trailing slash unless Google adds one automatically. This URI allows Google’s OAuth Playground tool to receive the authorization code on your behalf so you can obtain a refresh token without writing a custom web page.
5. Click **Create**.

### Step 5.3 — Save your Client ID and Client secret

A popup appears with:

- **Your Client ID** — a long string ending in `.apps.googleusercontent.com`
- **Your Client secret** — a shorter secret string

Copy both into a password manager immediately. You can always view the Client ID again in the console, but the Client secret may only be shown once.

Click **OK** to close the popup.

### Reusing an existing Google Sign-In client

If the member app already has **Sign in with Google** configured, you may already have an OAuth Web client with `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in `.env.local`. You can reuse that same client **if** you:

1. Edit the existing client in **Credentials**.
2. Add `https://developers.google.com/oauthplayground` to **Authorized redirect URIs** if it is not there already.
3. Still complete Part 6 to get a **new refresh token** with the `https://mail.google.com/` scope. Login OAuth tokens and mail OAuth tokens are not interchangeable.

---

## Part 6 — Obtain a refresh token (one-time, as Dennis)

The **refresh token** is the piece that lets your server send email 24/7 without Dennis entering a password. You generate it once using Google’s OAuth Playground, signed in as Dennis.

### Step 6.1 — Open OAuth Playground

1. Open a **new browser window** (or use an incognito window if you are often signed into multiple Google accounts).
2. Go to **[https://developers.google.com/oauthplayground](https://developers.google.com/oauthplayground)**
3. Sign in as `**dennis.ndungu@impacthub.net`** when prompted. The refresh token must be issued for the same mailbox listed in `SMTP_USER`.

### Step 6.2 — Use your own OAuth credentials

By default, the Playground uses Google’s demo credentials, which will **not** work with your `.env.local` Client ID. You must switch to yours.

1. In the top-right area of the Playground page, click the **gear icon** ⚙ labeled **OAuth 2.0 configuration**.
2. Check the box **Use your own OAuth credentials**.
3. Paste your **OAuth Client ID** from Part 5.
4. Paste your **OAuth Client secret** from Part 5.
5. Close the configuration panel (click the gear again or click outside the panel).

### Step 6.3 — Select the Gmail scope and authorize

The Playground has two steps on the left: **Step 1** (authorize) and **Step 2** (exchange code for tokens).

**Step 1 — Select and authorize APIs:**

1. At the top of the Playground, click **Reset all settings** (or **Reload**) if you had a failed attempt — this clears bad scopes from a previous session.
2. In the left panel under **Step 1**, find the list of Google APIs. Scroll until you see **Gmail API v1**.
3. Click the small arrow to expand **Gmail API v1** if it is collapsed.
4. Check **only** the single scope whose full URL is exactly:
  ```
   https://mail.google.com/
  ```
   It is often labeled *“Gmail / Read, compose, send, and permanently delete all your email from Gmail”*.
5. **Do not** check the parent **Gmail API v1** row itself if that selects multiple scopes — expand the row and tick only `https://mail.google.com/`.
6. **Critical — custom scope box:** Below the API list there is often a text field for **“Input your own scopes”** or similar. It must be **completely empty**. If you typed `gmail` or `https://www.googleapis.com/auth/gmail.send` there, Google returns:
  ```
   Error 400: invalid_scope
   invalid=[gmail]
  ```
   The word `gmail` alone is **not** a valid scope. Only the full URL `https://mail.google.com/` works for SMTP.
7. Uncheck **every other API** in the list (Drive, Calendar, etc.) from any earlier Playground session.
8. Click the blue button **Authorize APIs**.

Google opens a sign-in / consent window:

1. Select `**dennis.ndungu@impacthub.net`** if asked which account to use.
2. You may see **“Google hasn’t verified this app”**. This is normal for new External apps in Testing mode. Click **Advanced**, then **Go to Impact Hub Community App (unsafe)**.
3. Review the permission (access to Gmail) and click **Allow** or **Continue**.

You return to the Playground. **Step 1** should now show an **Authorization code** in the text box on the right.

#### If you see `Error 400: invalid_scope` with `invalid=[gmail]`

Google received a scope literally named `gmail`, which does not exist. Fix:

1. [OAuth 2.0 Playground](https://developers.google.com/oauthplayground) → **Reset all settings**.
2. Clear the **custom scopes** text box (leave it empty).
3. Expand **Gmail API v1** → check **only** `https://mail.google.com/`.
4. In Google Cloud → **OAuth consent screen** → **Scopes**, confirm `https://mail.google.com/` is listed (Part 4.4).
5. Try **Authorize APIs** again.

Do **not** use shorthand like `gmail`, `gmail.send`, or `mail.google.com` without `https://`.

### Step 6.4 — Exchange the code for tokens

1. Click **Step 2 — Exchange authorization code for tokens** (the button in the left panel under Step 2).
2. The right panel fills with JSON. Look for these fields:
  - `"access_token": "..."` — short-lived; the app refreshes this automatically.
  - `"refresh_token": "1//0g..."` — **this is what you need.** Copy the entire refresh token string, including any characters after `1//`.

Store the refresh token in your password manager. You will paste it into `GOOGLE_REFRESH_TOKEN` in `.env.local` and Vercel.

### If there is no `refresh_token` in the JSON

Google only returns a refresh token the **first** time a user approves a given client + scope combination. If you previously authorized the app without saving the refresh token:

1. Go to **[https://myaccount.google.com/permissions](https://myaccount.google.com/permissions)**
2. Find **Impact Hub Community App** (or your app name) and **Remove access**.
3. Return to the Playground and repeat Steps 6.3 and 6.4.

You should now see a `refresh_token` in the response.

---

## Part 7 — Configure local environment variables

Environment variables tell the running Next.js app how to connect to Google. Local development reads from `.env.local` in each app folder.

### Step 7.1 — Member app (`Community-App/frontend/.env.local`)

Open the file `Community-App/frontend/.env.local` in your editor. Add or update these lines (keep existing lines like `DATABASE_URL` and `AUTH_SECRET` unchanged):

```env
EMAIL_PROVIDER=smtp
SMTP_USER=dennis.ndungu@impacthub.net
EMAIL_FROM=Impact Hub Nairobi <dennis.ndungu@impacthub.net>
EMAIL_STAFF_TO=dennis.ndungu@impacthub.net

GOOGLE_CLIENT_ID=paste-your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=paste-your-client-secret
GOOGLE_REFRESH_TOKEN=paste-your-refresh-token
```

**Important details:**

- Do **not** wrap values in quotes unless your shell requires it. Next.js reads these files directly.
- Do **not** set `SMTP_PASS` when using OAuth.
- `EMAIL_FROM` should use the same email address as `SMTP_USER` unless you have a specific reason to differ (Workspace may restrict sending as aliases you do not own).

### Step 7.2 — Admin app (`Community-app-admin/.env.local`)

Open `Community-app-admin/.env.local` and add the **same** email and Google block. The admin app sends event blasts and reminders through the same mechanism.

Also ensure these existing variables remain set:

```env
DATABASE_URL=...
ADMIN_SESSION_SECRET=...
NEXT_PUBLIC_COMMUNITY_APP_URL=http://localhost:3000
CRON_SECRET=...
```

Both apps must share the same Google OAuth credentials and sender address.

### Step 7.3 — Restart development servers

Environment variables are loaded when the server starts. After saving `.env.local`:

1. Stop the member app dev server if it is running (Ctrl+C in the terminal).
2. Stop the admin app dev server if it is running.
3. Start them again:

```bash
cd Community-App/frontend
npm run dev
```

```bash
cd Community-app-admin
npm run dev
```

---

## Part 8 — Test that email works locally

Testing in two stages — a direct SMTP test script, then the real forgot-password flow — confirms both Google credentials and application wiring.

### Step 8.1 — Run the SMTP test script

The repository includes a script that uses the same transport code as production.

```bash
cd Community-App/frontend
npx tsx --env-file=.env.local scripts/test-smtp.ts dennis.ndungu@impacthub.net
```

**What each line means if it succeeds:**

```
SMTP_USER dennis.ndungu@impacthub.net
```

The script read your mailbox from the environment.

```
Auth: Google OAuth
```

OAuth variables were detected; the script is not using an App Password.

```
Verifying SMTP connection...
Verify OK. Sending test to dennis.ndungu@impacthub.net
```

Nodemailer connected to Gmail and authenticated with your refresh token.

```
Sent: <message-id> 250 2.0.0 OK ...
```

Google accepted the message for delivery. Check Dennis’s inbox and spam folder for **Community App SMTP test**.

**If the script fails**, read the error message carefully:

- `Not configured: set GOOGLE_REFRESH_TOKEN...` — one or more of `SMTP_USER`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN` is missing or empty in `.env.local`.
- `Invalid grant` — refresh token does not match the Client ID/secret, or access was revoked. Repeat Part 6.
- `redirect_uri_mismatch` — you did not add the Playground URI in Part 5. Fix the OAuth client and repeat Part 6.
- `insufficient permissions` — the refresh token was obtained without `https://mail.google.com/`. Revoke and repeat Part 6 with the correct scope.

### Step 8.2 — Test forgot password in the browser

1. Open **[http://localhost:3000/forgot-password](http://localhost:3000/forgot-password)**
2. Enter the email address of an account that was registered with **email and password** (not Google-only sign-in). For example, if `dennis.ndungu@impacthub.net` has a password in the database, use that.
3. Submit the form. The UI always shows a generic success message for security (“If an account exists, we sent a reset link”).
4. Check Dennis’s inbox for **Reset your Impact Hub Nairobi password**.

**Why some accounts never receive reset email:** The forgot-password API only sends mail if the user exists **and** has a password stored. Accounts that only ever signed in with **Sign in with Google** have no password hash, so no email is sent (by design). That is not an email configuration failure.

---

## Part 9 — Deploy to Vercel (production)

Local `.env.local` files are not uploaded to Vercel. You must enter the same values in the Vercel dashboard for each project, then redeploy.

### Step 9.1 — Member app on Vercel

1. Log in to **[https://vercel.com](https://vercel.com)**
2. Open the project for the member app (e.g. **impacthubnairobi-app**).
3. Go to **Settings** → **Environment Variables**.
4. For each row below, click **Add New**, enter the **Key** and **Value**, and select **Production** (and **Preview** if you want email on preview deployments):


| Key                    | Value                                              |
| ---------------------- | -------------------------------------------------- |
| `EMAIL_PROVIDER`       | `smtp`                                             |
| `SMTP_USER`            | `dennis.ndungu@impacthub.net`                      |
| `EMAIL_FROM`           | `Impact Hub Nairobi <dennis.ndungu@impacthub.net>` |
| `EMAIL_STAFF_TO`       | `dennis.ndungu@impacthub.net`                      |
| `GOOGLE_CLIENT_ID`     | (from Part 5)                                      |
| `GOOGLE_CLIENT_SECRET` | (from Part 5)                                      |
| `GOOGLE_REFRESH_TOKEN` | (from Part 6)                                      |
| `NEXT_PUBLIC_APP_URL`  | `https://impacthubnairobi-app.vercel.app`          |


1. Click **Save** after each variable (or use bulk import if your team uses that).

### Step 9.2 — Admin app on Vercel

Repeat the same process for the **admin** Vercel project. Use the same Google and email variables, plus:


| Key                             | Value                                     |
| ------------------------------- | ----------------------------------------- |
| `NEXT_PUBLIC_COMMUNITY_APP_URL` | `https://impacthubnairobi-app.vercel.app` |


The admin app uses this URL in links inside event blast and reminder emails.

### Step 9.3 — Redeploy

New environment variables only apply to **new deployments**.

1. In each Vercel project, open **Deployments**.
2. On the latest deployment, click the **⋯** menu → **Redeploy**.
3. Wait until the status shows **Ready**.

### Step 9.4 — Test production

1. Visit `https://impacthubnairobi-app.vercel.app/forgot-password`
2. Submit a known email/password account.
3. Confirm the message arrives.

If it fails, open the deployment in Vercel → **Logs** or **Functions** and search for `[EMAIL]` or `[FORGOT PASSWORD]` to see the error returned by Google.

---

## Part 10 — Troubleshooting reference

### Email configuration errors


| What you see                                   | What it means                               | What to do                                                                         |
| ---------------------------------------------- | ------------------------------------------- | ---------------------------------------------------------------------------------- |
| `SMTP not configured`                          | Missing env vars                            | Set all OAuth variables and `SMTP_USER`; restart server                            |
| `Invalid grant`                                | Token or client mismatch                    | Revoke app access; repeat Part 6; update Vercel                                    |
| `Access Not Configured`                        | Gmail API off                               | Enable Gmail API (Part 3)                                                          |
| `insufficient permissions`                     | Wrong OAuth scope                           | Revoke; re-authorize with `https://mail.google.com/` only                          |
| `Error 400: invalid_scope` / `invalid=[gmail]` | Custom scope box has `gmail` or wrong scope | Reset Playground; empty custom scope field; select only `https://mail.google.com/` |
| `redirect_uri_mismatch`                        | Playground URI missing                      | Add URI in OAuth client (Part 5); repeat Part 6                                    |
| Authorized domains / `vercel.app` invalid      | Vercel URL on consent screen                | Remove `vercel.app` from home page & Authorized domains; leave those fields empty  |


### Application behavior


| What you see                             | What it means                         | What to do                                          |
| ---------------------------------------- | ------------------------------------- | --------------------------------------------------- |
| Forgot password UI succeeds but no email | User may be Google-only               | Test with an email/password account                 |
| Email goes to spam                       | New sender reputation                 | Normal at first; ask recipients to mark as not spam |
| Works locally but not on Vercel          | Env vars not on Vercel or no redeploy | Copy vars; redeploy both projects                   |


### Google Workspace admin restrictions

Some organizations disable third-party app access or OAuth for Gmail. If authorization fails even after following this guide, ask your Workspace admin whether **Less secure apps**, **App access control**, or **API access** policies block Gmail SMTP OAuth for user mailboxes.

---

## Part 11 — Security notes

- Treat `GOOGLE_CLIENT_SECRET` and `GOOGLE_REFRESH_TOKEN` like passwords. Never commit them to git or paste them in public chat.
- If a token is leaked, revoke access at **[https://myaccount.google.com/permissions](https://myaccount.google.com/permissions)**, delete the OAuth client or rotate the secret in Google Cloud, and generate a new refresh token.
- The refresh token sends mail **as Dennis**. Anyone with the token can send email from that mailbox until it is revoked.
- For External OAuth apps in Testing mode, only listed test users can authorize. That is sufficient for server-side sending once you have the refresh token.

---

## Part 12 — Final checklist

Use this list to confirm you completed every step:

- Created Google Cloud project **Impact Hub Community App**
- Enabled **Gmail API**
- Configured OAuth consent screen with scope `https://mail.google.com/`
- Added test user `dennis.ndungu@impacthub.net` (if External app)
- Created OAuth Web client with redirect URI `https://developers.google.com/oauthplayground`
- Saved Client ID and Client secret
- Obtained refresh token signed in as Dennis via OAuth Playground
- Updated `Community-App/frontend/.env.local`
- Updated `Community-app-admin/.env.local`
- Restarted both dev servers
- `npx tsx --env-file=.env.local scripts/test-smtp.ts` prints `Sent:`
- Forgot password works locally
- Added same variables to both Vercel projects
- Redeployed both Vercel projects
- Forgot password works on production URL

---

## Appendix — App Password alternative (optional)

If your organization later allows **App Passwords** and you prefer not to use OAuth, you can switch without code changes:

1. Enable 2-Step Verification on `dennis.ndungu@impacthub.net`
2. Create an App Password at [https://myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
3. Set in `.env.local`:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=dennis.ndungu@impacthub.net
SMTP_PASS=your-16-character-app-password
SMTP_SECURE=false
```

1. Remove or leave empty `GOOGLE_REFRESH_TOKEN`, `GOOGLE_CLIENT_ID`, and `GOOGLE_CLIENT_SECRET`.

When all OAuth variables are set, OAuth takes priority over App Password.