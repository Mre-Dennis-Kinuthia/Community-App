import { z } from "zod"
import { isStoredImageRef } from "@/lib/stored-image"

/** URLs, legacy base64 previews, or /api/images/{id} references. */
export const imageRefSchema = z
  .union([
    z.string().url(),
    z.string().regex(/^data:image\/[\w+.-]+;base64,/, "Invalid image data URL"),
    z.string().refine(isStoredImageRef, "Invalid stored image path"),
  ])
  .optional()
  .nullable()
