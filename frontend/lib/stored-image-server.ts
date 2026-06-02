import "server-only"

import { prisma } from "@/lib/prisma"
import {
  ALLOWED_IMAGE_MIME_TYPES,
  maxBytesForCategory,
  storedImagePath,
  type StoredImageCategory,
} from "@/lib/stored-image"

export async function createStoredImage(input: {
  buffer: Buffer
  mimeType: string
  fileName?: string
  category: StoredImageCategory
  userId?: string
  adminUserId?: string
}) {
  if (!ALLOWED_IMAGE_MIME_TYPES.includes(input.mimeType as (typeof ALLOWED_IMAGE_MIME_TYPES)[number])) {
    throw new Error("Unsupported image type. Use JPEG, PNG, WebP, or GIF.")
  }
  const maxBytes = maxBytesForCategory(input.category)
  if (input.buffer.length > maxBytes) {
    throw new Error(`Image must be smaller than ${Math.round(maxBytes / (1024 * 1024))}MB`)
  }

  const row = await prisma.storedImage.create({
    data: {
      data: input.buffer,
      mimeType: input.mimeType,
      fileName: input.fileName,
      size: input.buffer.length,
      category: input.category,
      userId: input.userId,
      adminUserId: input.adminUserId,
    },
    select: { id: true },
  })

  return { id: row.id, url: storedImagePath(row.id) }
}

export async function getStoredImageBytes(id: string) {
  return prisma.storedImage.findUnique({
    where: { id },
    select: { data: true, mimeType: true, fileName: true },
  })
}
