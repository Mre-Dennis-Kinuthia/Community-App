/** Support tickets store `member` as `"Name <email>"`, not a bare address. */

export function supportTicketsMatchingEmailWhere(email: string) {
  const normalized = email.toLowerCase().trim()
  return {
    OR: [
      { member: { contains: normalized, mode: "insensitive" as const } },
      { description: { contains: normalized, mode: "insensitive" as const } },
    ],
  }
}
