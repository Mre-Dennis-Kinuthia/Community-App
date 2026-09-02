import type { StoredImageCategory } from "@/lib/stored-image"
import { cn } from "@/lib/utils"

/** Face-friendly crop for circular member photos (head + shoulders, not chest-centered). */
export const avatarImageClassName =
  "aspect-square size-full object-cover object-[50%_20%] bg-muted"

/** Upload preview matches live avatar framing. */
export const profilePhotoPreviewClassName = avatarImageClassName

/** Small rectangular thumbnails (e.g. project tile). */
export const thumbnailImageClassName = "size-full object-contain object-center"

/** CSS classes for upload previews — preserves aspect ratio, no stretch. */
export function getImagePreviewClasses(
  category: StoredImageCategory,
  previewClassName?: string
) {
  switch (category) {
    case "profile":
      return {
        container: cn(
          "relative size-32 shrink-0 overflow-hidden rounded-full border border-border bg-muted",
          previewClassName
        ),
        img: profilePhotoPreviewClassName,
      }
    case "partner_logo":
      return {
        container: cn(
          "relative flex h-28 w-full max-w-xs items-center justify-center overflow-hidden rounded-md border border-border bg-muted p-4",
          previewClassName
        ),
        img: "max-h-full max-w-full object-contain object-center",
      }
    case "event_cover":
    case "news_cover":
    case "project_cover":
      return {
        container: cn(
          "relative w-full max-w-2xl overflow-hidden rounded-md border border-border bg-muted aspect-[16/9]",
          previewClassName
        ),
        img: "size-full object-contain object-center",
      }
    default:
      return {
        container: cn(
          "relative w-full max-w-xl overflow-hidden rounded-md border border-border bg-muted aspect-[4/3]",
          previewClassName
        ),
        img: "size-full object-contain object-center",
      }
  }
}
