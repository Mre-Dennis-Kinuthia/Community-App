"use client"

import { useState } from "react"
import { Loader2, Mail } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { sendMemberEmail } from "@/lib/connection-client"
import { toast } from "@/lib/toast"

type MemberEmailDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  memberId: string
  memberName: string
}

export function MemberEmailDialog({
  open,
  onOpenChange,
  memberId,
  memberName,
}: MemberEmailDialogProps) {
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [sending, setSending] = useState(false)

  const reset = () => {
    setSubject("")
    setMessage("")
  }

  const handleOpenChange = (next: boolean) => {
    if (!next && !sending) reset()
    onOpenChange(next)
  }

  const handleSend = async () => {
    const trimmedSubject = subject.trim()
    const trimmedMessage = message.trim()
    if (!trimmedSubject || !trimmedMessage) {
      toast.error("Missing details", "Add a subject and message before sending.")
      return
    }

    setSending(true)
    try {
      const result = await sendMemberEmail(memberId, {
        subject: trimmedSubject,
        message: trimmedMessage,
      })
      if (!result.ok) {
        throw new Error(result.error || "Could not send email")
      }
      toast.success("Email sent", `Your message was sent to ${memberName}.`)
      reset()
      onOpenChange(false)
    } catch (error) {
      toast.error(
        "Email failed",
        error instanceof Error ? error.message : "Please try again."
      )
    } finally {
      setSending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md gap-0 p-0">
        <DialogHeader className="border-b border-border px-4 py-4 text-left">
          <DialogTitle className="flex items-center gap-2 text-base">
            <Mail className="h-4 w-4 text-primary" aria-hidden />
            Email {memberName}
          </DialogTitle>
          <DialogDescription className="text-xs">
            Sent through Impact Hub Nairobi. They can reply directly to your email.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 px-4 py-4">
          <div className="space-y-1.5">
            <Label htmlFor="member-email-subject">Subject</Label>
            <Input
              id="member-email-subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Quick intro or collaboration idea"
              maxLength={200}
              disabled={sending}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="member-email-message">Message</Label>
            <Textarea
              id="member-email-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write your message…"
              rows={5}
              maxLength={5000}
              disabled={sending}
              className="resize-none"
            />
          </div>
        </div>

        <DialogFooter className="border-t border-border px-4 py-3 sm:justify-end">
          <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={sending}>
            Cancel
          </Button>
          <Button type="button" onClick={() => void handleSend()} disabled={sending}>
            {sending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                Sending…
              </>
            ) : (
              "Send email"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
