# Vercel Deployment Setup

## Required Environment Variables

Make sure to set these in your Vercel project settings:

1. **DATABASE_URL** - Your Neon database connection string
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add: `DATABASE_URL` = `postgresql://neondb_owner:password@ep-xxx-xxx.region.aws.neon.tech/neondb?sslmode=require`

2. **AUTH_SECRET** - Secret for Auth.js (JWT signing)
   - Generate with: `openssl rand -base64 32`
   - Add to Vercel environment variables

## Build Configuration

The project is configured to:
- Generate Prisma Client automatically (`postinstall` script)
- Use webpack instead of Turbopack (better Prisma compatibility)
- Include Prisma files in the build output

## Troubleshooting

If you see "DATABASE_URL is not set" during build:
- Make sure DATABASE_URL is set in Vercel environment variables
- The build will use a placeholder Prisma client during static analysis
- At runtime, the real DATABASE_URL will be used
