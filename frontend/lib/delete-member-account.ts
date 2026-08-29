import { prisma } from "@/lib/prisma"
import { sendAccountDeletedEmail } from "@/lib/email/messages"
import { parseStoredImageId } from "@/lib/stored-image"
import { supportTicketsMatchingEmailWhere } from "@/lib/support-ticket-email"

export type DeleteMemberAccountOptions = {
  /** Who initiated the deletion — affects the confirmation email copy. */
  deletedBy?: "self" | "admin"
  /** Send a confirmation email before removing the account. Defaults to true. */
  notify?: boolean
}

export type DeleteMemberAccountResult = {
  email: string
  name: string | null
  deleted: true
  emailSent: boolean
}

function verificationIdentifiersForEmail(email: string): string[] {
  const normalized = email.toLowerCase().trim()
  return [
    normalized,
    `email-verify:${normalized}`,
    `member-invite:${normalized}`,
    `admin-member-access:${normalized}`,
  ]
}

/**
 * Permanently remove a community member and every record that would follow
 * them to a later signup with the same email (events, applications, billing
 * links, newsletter, comments, tokens, founded projects).
 */
export async function deleteMemberAccount(
  userId: string,
  options: DeleteMemberAccountOptions = {}
): Promise<DeleteMemberAccountResult> {
  const { deletedBy = "admin", notify = true } = options

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, image: true },
  })

  if (!user) {
    throw new Error("Member not found")
  }

  const email = user.email.toLowerCase().trim()

  let emailSent = false
  if (notify) {
    const emailResult = await sendAccountDeletedEmail({
      to: user.email,
      name: user.name,
      deletedBy,
    })
    if (!emailResult.ok) {
      throw new Error(
        `Could not send account deletion email to ${user.email}. Account was not deleted. (${emailResult.error})`
      )
    }
    emailSent = true
  }

  const emailMatch = { equals: email, mode: "insensitive" as const }

  await prisma.$transaction(
    async (tx) => {
      await tx.connection.deleteMany({
        where: { OR: [{ fromUserId: userId }, { toUserId: userId }] },
      })

      await tx.follow.deleteMany({
        where: { OR: [{ followerId: userId }, { followingId: userId }] },
      })

      await tx.eventRegistration.deleteMany({
        where: { OR: [{ userId }, { email: emailMatch }] },
      })

      await tx.programApplication.deleteMany({
        where: { OR: [{ userId }, { email: emailMatch }] },
      })

      await tx.newsPostComment.deleteMany({
        where: { OR: [{ authorId: userId }, { authorEmail: emailMatch }] },
      })

      const profileImageId = parseStoredImageId(user.image)
      await tx.storedImage.deleteMany({
        where: {
          OR: [{ userId }, ...(profileImageId ? [{ id: profileImageId }] : [])],
        },
      })

      await tx.verificationToken.deleteMany({
        where: { identifier: { in: verificationIdentifiersForEmail(email) } },
      })

      await tx.newsletterSend.deleteMany({
        where: { OR: [{ userId }, { email: emailMatch }] },
      })

      await tx.newsletterSubscriber.deleteMany({
        where: { email: emailMatch },
      })

      await tx.membershipPaymentLink.deleteMany({
        where: { OR: [{ userId }, { recipientEmail: emailMatch }] },
      })

      const foundedProjects = await tx.project.findMany({
        where: { founderId: userId },
        select: { id: true },
      })
      const projectIds = foundedProjects.map((p) => p.id)
      if (projectIds.length > 0) {
        await tx.mediaAsset.deleteMany({
          where: { projectId: { in: projectIds } },
        })
        await tx.project.deleteMany({
          where: { id: { in: projectIds } },
        })
      }

      await tx.supportTicket.deleteMany({
        where: supportTicketsMatchingEmailWhere(email),
      })

      await tx.session.deleteMany({
        where: { userId },
      })

      await tx.account.deleteMany({
        where: { userId },
      })

      await tx.user.delete({
        where: { id: userId },
      })
    },
    { timeout: 30_000 }
  )

  const stillExists = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  })

  if (stillExists) {
    throw new Error("Account deletion failed — user record still exists")
  }

  const emailStillTaken = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  })

  if (emailStillTaken) {
    throw new Error("Account deletion failed — email is still linked to a user")
  }

  return {
    email: user.email,
    name: user.name,
    deleted: true,
    emailSent,
  }
}
