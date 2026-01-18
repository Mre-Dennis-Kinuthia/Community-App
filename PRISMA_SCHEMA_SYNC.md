# Prisma Schema Auto-Sync

The Prisma schema is automatically kept in sync between the Community App and Admin App.

## How It Works

The Community App's `prisma/schema.prisma` is the **source of truth**. Changes are automatically synced to the Admin App's `prisma/schema.prisma`.

## Usage

### Manual Sync

**From Community App:**
```bash
cd Community-App/frontend
npm run db:sync-schema
```

**From Admin App:**
```bash
cd Community-app-admin
npm run db:sync-schema
```

### Watch Mode (Development)

Automatically syncs whenever the schema changes:

**From Community App:**
```bash
cd Community-App/frontend
npm run db:sync-schema:watch
```

**From Admin App:**
```bash
cd Community-app-admin
npm run db:sync-schema:watch
```

This will:
1. Sync the schema immediately
2. Watch for changes to `Community-App/frontend/prisma/schema.prisma`
3. Automatically sync when changes are detected

Press `Ctrl+C` to stop watching.

## Workflow

### When Making Schema Changes

1. **Edit the schema** in `Community-App/frontend/prisma/schema.prisma`
2. **Sync to Admin App:**
   ```bash
   npm run db:sync-schema
   ```
3. **Generate Prisma Client in both apps:**
   ```bash
   # In Community App
   npm run db:generate
   
   # In Admin App
   cd ../../Community-app-admin
   npm run db:generate
   ```
4. **Run migrations** (from Community App only):
   ```bash
   cd ../../Community-App/frontend
   npm run db:migrate
   ```

### Development Workflow

For active development, use watch mode:

**Terminal 1 (Community App):**
```bash
cd Community-App/frontend
npm run db:sync-schema:watch
```

**Terminal 2 (Community App):**
```bash
cd Community-App/frontend
npm run dev
```

**Terminal 3 (Admin App):**
```bash
cd Community-app-admin
npm run dev
```

Now whenever you change the schema, it will automatically sync to Admin App!

## Git Hooks (Optional)

You can set up a git pre-commit hook to automatically sync before committing:

```bash
# In Community App
cd Community-App/frontend
npm install --save-dev husky
npx husky init
npx husky add .husky/pre-commit "npm run db:sync-schema"
```

This ensures the schema is always synced before committing changes.

## Troubleshooting

### Error: "ENOENT: no such file or directory"

**Cause:** The script can't find the source or target schema file.

**Solution:**
1. Make sure you're running the script from the correct directory
2. Verify both apps exist at the expected paths:
   - `Community-App/frontend/prisma/schema.prisma` (source)
   - `Community-app-admin/prisma/schema.prisma` (target)

### Schema not syncing

**Cause:** Paths might be different than expected.

**Solution:**
1. Check the script paths in:
   - `Community-App/frontend/scripts/sync-prisma-schema.ts`
   - `Community-app-admin/scripts/sync-prisma-schema.ts`
2. Adjust the paths if your directory structure is different

### Watch mode not working

**Cause:** File watching might not work in all environments.

**Solution:**
- Use manual sync: `npm run db:sync-schema`
- Or set up a file watcher in your IDE/editor

## Scripts Reference

### Community App
- `npm run db:sync-schema` - One-time sync
- `npm run db:sync-schema:watch` - Watch mode

### Admin App
- `npm run db:sync-schema` - One-time sync (pulls from Community App)
- `npm run db:sync-schema:watch` - Watch mode

## Best Practices

1. ✅ **Always edit the schema in Community App** (it's the source of truth)
2. ✅ **Sync before generating Prisma Client** in both apps
3. ✅ **Run migrations from Community App only** (they apply to the shared database)
4. ✅ **Use watch mode during active development** for automatic syncing
5. ✅ **Commit schema changes together** (both files should be identical)

## Notes

- The sync script copies the entire schema file, so both files will always be identical
- If you accidentally edit the Admin App's schema directly, it will be overwritten on the next sync
- The sync is one-way: Community App → Admin App (never the reverse)
