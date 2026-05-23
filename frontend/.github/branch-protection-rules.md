# Branch protection — Community-App (member web)

Configure in GitHub → **Settings** → **Branches** → **Branch protection rules** for `main` and `develop`.

> If this repository’s root is `Community-App` with the Next.js app in `frontend/`, ensure the CI workflow path matches (workflow lives in `frontend/.github/workflows/ci.yml`).

## Required settings

1. **Require a pull request before merging**
2. **Require approvals:** 1 (recommend 2 on `main`)
3. **Require status checks to pass:** `CI / quality`
4. **Require branches to be up to date before merging**
5. **Do not allow bypassing the above settings**
6. **Dismiss stale pull request approvals when new commits are pushed**
7. **Restrict who can push to matching branches** (no direct pushes to `main` / `develop`)
8. **Include administrators** in restrictions

## Related

- Shared staging & env vars: [SETUP.md](../../SETUP.md)
- Admin repo protection: [Community-app-admin/.github/branch-protection-rules.md](../../../Community-app-admin/.github/branch-protection-rules.md)
- Launch checklist: [LAUNCH_SIGNOFF.md](../../../LAUNCH_SIGNOFF.md)
