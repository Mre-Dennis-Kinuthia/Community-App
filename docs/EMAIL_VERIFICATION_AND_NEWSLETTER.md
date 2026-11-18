# Email Verification and Newsletter Consent

## Member account verification

- New password-based registrations remain pending until the member opens the verification link. The `/verify-email` page automatically posts the token, so there is no second confirmation button. Email security scanners that execute page JavaScript may verify an account when scanning the link.
- Verification tokens are random, stored as SHA-256 hashes, single-use, and expire after one hour. Resending replaces the previous token.
- Credentials sign-in and the shared server-side `auth()` helper reject unverified members. Session refresh and route gates also redirect stale unverified sessions to the verification page.
- Existing accounts with a null `emailVerified` value are backfilled to their original `createdAt` timestamp by the migration. New registrations store their registration intent and defer membership notifications and welcome flows until verification.
- An unverified member can request another link or change their account email after proving the account password.
- Disposable and reserved example/test domains are rejected at registration and newsletter signup. The maintained `disposable-email-domains-js` domain list supplements explicit common disposable domains.

## Staff handoff

Admin-to-member access remains a five-minute, single-use token flow. The member-platform account is created without copying the Admin password hash, and the token is stored as a hash. The migration clears existing member hashes only when they exactly match the linked Admin hash. The existing separate Admin sign-in is unchanged; staff access granted through the handoff is exempt from member email verification.

## Newsletter confirmation

- Public newsletter signup creates a pending record and sends a separate confirmation link. The user must click the page button to confirm; merely opening the URL does not consume the token.
- Newsletter confirmation links expire after 24 hours and are single-use.
- Existing subscribers are backfilled as confirmed to preserve their consent history. Admin-managed imports/reactivations explicitly set `confirmedAt`; public submissions do not.
- Campaign subscriber audiences require `confirmedAt` and no unsubscribe timestamp. Member audiences filter out unverified accounts, and existing unsubscribe records remain respected.

## Database and environment

Apply the tracked PostgreSQL migration before deploying code that uses the new fields/tables. The Admin Prisma schema is synced from the Community schema during its normal schema-sync step.

No new secret is introduced. Persistent shared rate limits HMAC-hash identifiers with `AUTH_SECRET`; the existing database and email-provider configuration are still required. Missing database/email setup must be corrected before enabling registration or newsletter confirmation.

The migration backfills legacy account and subscriber state. Review its effects against a staging database backup first; this assistant did not run it or deploy either application.

## Staging checks

1. Register with a real, reachable address; confirm the next page clearly tells the member to check their email and the account cannot sign in before verification.
2. Open the verification link and confirm the email is verified automatically, then sign in successfully.
3. Try reserved addresses such as `member@example.com` and `member@test.com`, and a disposable address such as `member@mailinator.com`.
4. Resend a verification link, use the email-change form with the account password, and verify that the previous address/token no longer grants access.
5. Submit a newsletter address, confirm that no campaign is sent before opt-in, then explicitly confirm and verify it becomes eligible. Verify unsubscribing removes it from campaign recipients.
6. Exercise the Admin-to-member handoff and verify that the member `password` column does not receive the Admin hash.
7. Check rate limits from multiple application instances and verify the database cleanup removes expired buckets.

## Rollback

The migration is additive apart from backfilling legacy `emailVerified` and newsletter `confirmedAt` values. If application code must be rolled back, leave the added columns and tables in place; do not drop token or rate-limit storage until all active links expire and a reviewed follow-up migration is prepared. Reverting the legacy backfill requires a pre-migration database backup because the prior null state is not distinguishable afterward.
