/**
 * Utility functions for news posts
 */

/**
 * Calculate reading time in minutes based on content
 * Assumes average reading speed of 200 words per minute
 */
export function calculateReadingTime(content: string): number {
  // Strip HTML tags
  const text = content.replace(/<[^>]*>/g, ' ')
  
  // Count words (split by whitespace and filter empty strings)
  const words = text.trim().split(/\s+/).filter(word => word.length > 0)
  const wordCount = words.length
  
  // Calculate reading time (200 words per minute)
  const wordsPerMinute = 200
  const readingTime = Math.ceil(wordCount / wordsPerMinute)
  
  // Minimum 1 minute
  return Math.max(1, readingTime)
}

/**
 * Generate a URL-friendly slug from a title
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
}

/**
 * Ensure slug is unique by appending a number if needed
 */
export async function ensureUniqueSlug(
  slug: string,
  existingIds: string[],
  generateUnique: (baseSlug: string, counter: number) => Promise<string | null>
): Promise<string> {
  let uniqueSlug = slug
  let counter = 1
  
  while (existingIds.includes(uniqueSlug)) {
    const nextSlug = await generateUnique(slug, counter)
    if (nextSlug && !existingIds.includes(nextSlug)) {
      uniqueSlug = nextSlug
      break
    }
    uniqueSlug = `${slug}-${counter}`
    counter++
  }
  
  return uniqueSlug
}
