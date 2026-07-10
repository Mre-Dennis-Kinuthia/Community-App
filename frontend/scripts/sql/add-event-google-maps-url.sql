-- Optional Google Maps share URL for precise event venue pins
ALTER TABLE "events" ADD COLUMN IF NOT EXISTS "google_maps_url" TEXT;
