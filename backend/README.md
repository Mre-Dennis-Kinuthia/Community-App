## Community Platform Backend

This folder is a placeholder for the standalone backend service that will power both the public Community App and the Admin App.

### Planned Responsibilities
- Auth (members + admins)
- Content APIs (news, events, resources)
- Operations (bookings, attendance, billing)
- Audit logs and role-based access control

### Local Development (placeholder)
This service is not wired to production yet. A minimal HTTP server is included for smoke checks.

```bash
node src/index.js
```

Then visit:
- http://localhost:4000/health
