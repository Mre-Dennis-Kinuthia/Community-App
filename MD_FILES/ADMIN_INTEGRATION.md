# Admin App Integration Guide

This document explains how the Admin App connects to and manages data from the Community App.

## ✅ What's Been Set Up

### 1. Admin API Routes (Community App)

Created admin API endpoints in the Community App:

- ✅ `POST /api/admin/auth/login` - Admin authentication
- ✅ `GET /api/admin/dashboard/metrics` - Dashboard statistics
- ✅ `GET /api/admin/members` - List all members
- ✅ `POST /api/admin/members` - Create member
- ✅ `GET /api/admin/bookings` - List all bookings

### 2. API Client (Admin App)

Created centralized API client (`lib/api-client.ts`) with methods for:
- Dashboard metrics
- Members (CRUD)
- Events (CRUD)
- News (CRUD)
- Resources (CRUD)
- Bookings (CRUD)
- Projects (CRUD)
- Partners (CRUD)

### 3. Authentication

- Updated admin auth context to call Community App's login API
- Admin login now authenticates against `AdminUser` table in database

### 4. Dashboard Integration

- Updated admin dashboard to fetch real metrics from Community App
- Displays actual member counts, bookings, events, revenue

## 🔧 Configuration Required

### Admin App `.env.local`

```env
NEXT_PUBLIC_COMMUNITY_APP_URL=http://localhost:3000
```

For production:
```env
NEXT_PUBLIC_COMMUNITY_APP_URL=https://your-community-app.vercel.app
```

## 📋 Next Steps

### Immediate (High Priority)

1. **Create Admin User in Database**
   
   **Option 1: Using the script (Recommended)**
   ```bash
   cd Community-App/frontend
   npm run admin:create admin@impacthub.co.ke your-password super_admin
   ```
   
   **Option 2: Manual SQL**
   ```sql
   INSERT INTO admin_users (id, email, name, password, role)
   VALUES (
     'admin-1',
     'admin@impacthub.co.ke',
     'Admin User',
     '$2a$10$hashed_password_here', -- Use bcrypt to hash password
     'super_admin'
   );
   ```

2. **Add Remaining Admin API Routes**
   - [ ] `PUT /api/admin/members/:id` - Update member
   - [ ] `DELETE /api/admin/members/:id` - Delete member
   - [ ] `GET /api/admin/events` - List events
   - [ ] `POST /api/admin/events` - Create event
   - [ ] `PUT /api/admin/events/:id` - Update event
   - [ ] `DELETE /api/admin/events/:id` - Delete event
   - [ ] `GET /api/admin/news` - List news posts
   - [ ] `POST /api/admin/news` - Create news post
   - [ ] `PUT /api/admin/news/:id` - Update news post
   - [ ] `DELETE /api/admin/news/:id` - Delete news post
   - [ ] `GET /api/admin/resources` - List resources
   - [ ] `POST /api/admin/resources` - Create resource
   - [ ] `PUT /api/admin/resources/:id` - Update resource
   - [ ] `DELETE /api/admin/resources/:id` - Delete resource
   - [ ] `GET /api/admin/projects` - List projects
   - [ ] `POST /api/admin/projects` - Create project
   - [ ] `PUT /api/admin/projects/:id` - Update project
   - [ ] `DELETE /api/admin/projects/:id` - Delete project
   - [ ] `GET /api/admin/partners` - List partners
   - [ ] `POST /api/admin/partners` - Create partner
   - [ ] `PUT /api/admin/partners/:id` - Update partner
   - [ ] `DELETE /api/admin/partners/:id` - Delete partner

3. **Update Admin Pages to Use Real Data**
   - [ ] Members page - Fetch from API
   - [ ] Events page - Fetch from API
   - [ ] News page - Fetch from API
   - [ ] Resources page - Fetch from API
   - [ ] Bookings page - Fetch from API
   - [ ] Projects page - Fetch from API
   - [ ] Partners page - Fetch from API

4. **CORS Configuration** ✅
   - ✅ Added CORS headers in `next.config.mjs`
   - ✅ Allows requests from Admin App (configurable via `ADMIN_APP_URL` env var)

### Medium Priority

5. **Implement Full RBAC**
   - Add permission checking to all admin routes
   - Restrict access based on admin role
   - Add role checks in middleware

6. **Add Audit Logging**
   - Log all admin actions
   - Track who made what changes
   - Store in `AuditLog` table

7. **Add Rate Limiting**
   - Rate limit admin endpoints
   - Prevent abuse

### Future Enhancements

8. **Session Management**
   - Use Auth.js for admin sessions
   - Implement refresh tokens
   - Add session timeout

9. **File Uploads**
   - Handle image uploads for events/news
   - Store in Vercel Blob or S3
   - Add upload endpoints

10. **Bulk Operations**
    - Bulk import/export
    - Bulk actions (delete, update)

## 🧪 Testing

### Test Admin Login

1. Create admin user in database (see above)
2. Start Community App: `cd Community-App/frontend && npm run dev`
3. Start Admin App: `cd Community-app-admin && npm run dev -- -p 3001`
4. Login at http://localhost:3001/login with admin credentials
5. Verify dashboard shows real data

### Test API Endpoints

```bash
# Test admin login
curl -X POST http://localhost:3000/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@impacthub.co.ke","password":"your-password"}'

# Test dashboard metrics (requires auth)
curl http://localhost:3000/api/admin/dashboard/metrics

# Test members list (requires auth)
curl http://localhost:3000/api/admin/members
```

## 🔒 Security Notes

1. **Authentication**: All admin routes require authentication
2. **Authorization**: Check admin role before allowing operations
3. **CORS**: Configure CORS to allow only Admin App domain
4. **Rate Limiting**: Add rate limiting to prevent abuse
5. **Input Validation**: All inputs are validated with Zod
6. **SQL Injection**: Protected by Prisma
7. **XSS**: Sanitize all user inputs

## 📚 Documentation

- See `Community-app-admin/README_ADMIN_SETUP.md` for detailed setup
- See `BACKEND_TODO.md` for full backend implementation plan
- See `BACKEND_STRATEGY.md` for architecture decisions
