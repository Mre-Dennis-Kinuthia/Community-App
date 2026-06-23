import { z } from "zod"
import { isStoredImageRef } from "@/lib/stored-image"
import { isPresetAvatarPath } from "@/lib/preset-avatars"

/** URLs, legacy base64 previews, stored images, or preset avatar paths. */
export const imageRefSchema = z
  .union([
    z.string().url(),
    z.string().regex(/^data:image\/[\w+.-]+;base64,/, "Invalid image data URL"),
    z.string().refine(isStoredImageRef, "Invalid stored image path"),
    z.string().refine(isPresetAvatarPath, "Invalid preset avatar path"),
  ])
  .optional()
  .nullable()
