import { prisma } from "@/lib/prisma"
import { sendAccountDeletedEmail } from "@/lib/email/messages"

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

/**
 * Permanently remove a community member, clean up non-cascaded records, notify by email,
 * and verify the user row no longer exists.
 */
export async function deleteMemberAccount(
  userId: string,
  options: DeleteMemberAccountOptions = {}
): Promise<DeleteMemberAccountResult> {
  const { deletedBy = "admin", notify = true } = options

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true },
  })

  if (!user) {
    throw new Error("Member not found")
  }

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

  await prisma.$transaction(async (tx) => {
    await tx.connection.deleteMany({
      where: { OR: [{ fromUserId: userId }, { toUserId: userId }] },
    })

    await tx.follow.deleteMany({
      where: { OR: [{ followerId: userId }, { followingId: userId }] },
    })

    await tx.eventRegistration.updateMany({
      where: { userId },
      data: { userId: null },
    })

    await tx.programApplication.updateMany({
      where: { userId },
      data: { userId: null },
    })

    await tx.newsPostComment.deleteMany({
      where: { authorId: userId },
    })

    await tx.storedImage.deleteMany({
      where: { userId },
    })

    await tx.verificationToken.deleteMany({
      where: { identifier: user.email },
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
  })

  const stillExists = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  })

  if (stillExists) {
    throw new Error("Account deletion failed — user record still exists")
  }

  return {
    email: user.email,
    name: user.name,
    deleted: true,
    emailSent,
  }
}
