"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"
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
import { EXPERT_MEETING_FORMATS, EXPERT_REQUEST_TYPES, expertRequestTypeLabel, meetingFormatLabel, meetingRequestSchema } from "@/lib/experts"
import { toast } from "@/lib/toast"

type ExpertMeetingFormProps = {
  expertId: string
  expertName: string
}

export function ExpertMeetingForm({ expertId, expertName }: ExpertMeetingFormProps) {
  const [topic, setTopic] = useState("")
  const [message, setMessage] = useState("")
  const [preferredTimes, setPreferredTimes] = useState("")
  const [meetingFormat, setMeetingFormat] = useState<(typeof EXPERT_MEETING_FORMATS)[number]>("virtual")
  const [requestType, setRequestType] = useState<(typeof EXPERT_REQUEST_TYPES)[number]>("clinic")
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const parsed = meetingRequestSchema.safeParse({
      topic,
      message,
      preferredTimes,
      meetingFormat,
      requestType,
    })
    if (!parsed.success) {
      setError(parsed.error.errors[0]?.message || "Please complete the form")
      return
    }
    setError(null)
    setSubmitting(true)
    try {
      const res = await fetch(`/api/experts/${expertId}/meetings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(typeof json.error === "string" ? json.error : "Could not send request")
      }
      setSent(true)
      toast.success(`Request sent to ${expertName}`)
    } catch (err) {
      const text = err instanceof Error ? err.message : "Could not send request"
      setError(text)
      toast.error(text)
    } finally {
      setSubmitting(false)
    }
  }

  if (sent) {
    return (
      <div className="rounded-md border border-border bg-muted/30 p-4 text-sm">
        <p className="font-medium">Request sent</p>
        <p className="mt-1 text-muted-foreground">
          {expertName} will follow up by email to confirm next steps.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="request-type">I am interested in</Label>
        <Select
          value={requestType}
          onValueChange={(value) => setRequestType(value as typeof requestType)}
        >
          <SelectTrigger id="request-type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {EXPERT_REQUEST_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {expertRequestTypeLabel(type)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="topic">Topic</Label>
        <Input
          id="topic"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="e.g. Fundraising for a climate venture"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="format">Meeting format</Label>
        <Select
          value={meetingFormat}
          onValueChange={(value) => setMeetingFormat(value as typeof meetingFormat)}
        >
          <SelectTrigger id="format">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {EXPERT_MEETING_FORMATS.map((format) => (
              <SelectItem key={format} value={format}>
                {meetingFormatLabel(format)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="times">Preferred times (optional)</Label>
        <Input
          id="times"
          value={preferredTimes}
          onChange={(e) => setPreferredTimes(e.target.value)}
          placeholder="e.g. Thursday afternoon or Friday morning"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="message">What do you need support with?</Label>
        <Textarea
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Share a little context so the expert can prepare."
          rows={5}
          required
        />
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Button type="submit" className="w-full" disabled={submitting}>
        {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        Send request
      </Button>
    </form>
  )
}
