"use client"

import { useEffect, useState } from "react"
import { validateRegistrationAnswers } from "@/lib/event-questions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Loader2 } from "lucide-react"
import { toast } from "@/lib/toast"
import type { RegistrationQuestion } from "@/lib/event-questions"

interface EventRegistrationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  eventTitle: string
  questions: RegistrationQuestion[]
  isWaitlist: boolean
  isPaid: boolean
  priceLabel: string | null
  loading: boolean
  onSubmit: (answers: Record<string, string>) => void
}

export function EventRegistrationDialog({
  open,
  onOpenChange,
  eventTitle,
  questions,
  isWaitlist,
  isPaid,
  priceLabel,
  loading,
  onSubmit,
}: EventRegistrationDialogProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({})

  useEffect(() => {
    if (open) setAnswers({})
  }, [open, eventTitle])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const validationError = validateRegistrationAnswers(questions, answers)
    if (validationError) {
      toast.error(validationError)
      return
    }
    onSubmit(answers)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {isWaitlist ? "Join waitlist" : "Register"} for {eventTitle}
            </DialogTitle>
            <DialogDescription>
              {isPaid && priceLabel && (
                <span className="block font-medium text-foreground mt-1">
                  Ticket: {priceLabel} — pay at venue (online payment coming soon)
                </span>
              )}
              {isWaitlist
                ? "You'll be notified if a spot opens."
                : "Complete the form to secure your spot."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {questions.map((q) => (
              <div key={q.id} className="space-y-2">
                <Label>
                  {q.label}
                  {q.required && <span className="text-red-500 ml-1">*</span>}
                </Label>
                {q.type === "textarea" ? (
                  <Textarea
                    value={answers[q.id] ?? ""}
                    onChange={(e) =>
                      setAnswers({ ...answers, [q.id]: e.target.value })
                    }
                    required={q.required}
                  />
                ) : q.type === "select" ? (
                  <Select
                    value={answers[q.id] ?? ""}
                    onValueChange={(v) => setAnswers({ ...answers, [q.id]: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      {(q.options ?? []).map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    value={answers[q.id] ?? ""}
                    onChange={(e) =>
                      setAnswers({ ...answers, [q.id]: e.target.value })
                    }
                    required={q.required}
                  />
                )}
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : isWaitlist ? (
                "Join waitlist"
              ) : (
                "Confirm registration"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
