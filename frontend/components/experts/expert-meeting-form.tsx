"use client"

import { useMemo, useState } from "react"
import useSWR from "swr"
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
import {
  EXPERT_MEETING_FORMATS,
  EXPERT_REQUEST_TYPES,
  expertRequestTypeLabel,
  meetingFormatLabel,
  meetingRequestSchema,
} from "@/lib/experts"
import { formatNairobiSlot } from "@/lib/expert-availability"
import { toast } from "@/lib/toast"
import { cn } from "@/lib/utils"

type ExpertMeetingFormProps = {
  expertId: string
  expertName: string
  availabilityEnabled?: boolean
}

type AvailabilityResponse = {
  enabled: boolean
  durationMinutes: number
  slots: Array<{ start: string; end: string }>
}

export function ExpertMeetingForm({
  expertId,
  expertName,
  availabilityEnabled = false,
}: ExpertMeetingFormProps) {
  const [topic, setTopic] = useState("")
  const [message, setMessage] = useState("")
  const [preferredTimes, setPreferredTimes] = useState("")
  const [scheduledAt, setScheduledAt] = useState("")
  const [meetingFormat, setMeetingFormat] = useState<(typeof EXPERT_MEETING_FORMATS)[number]>("virtual")
  const [requestType, setRequestType] = useState<(typeof EXPERT_REQUEST_TYPES)[number]>("clinic")
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState<"request" | "booked" | null>(null)
  const [agenda, setAgenda] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const { data: availability } = useSWR<AvailabilityResponse>(
    availabilityEnabled ? `/api/experts/${expertId}/availability` : null,
    async (url) => {
      const res = await fetch(url)
      if (!res.ok) throw new Error("Could not load availability")
      return res.json()
    }
  )

  const slots = availability?.slots ?? []
  const groupedSlots = useMemo(() => {
    const groups = new Map<string, typeof slots>()
    for (const slot of slots) {
      const day = new Intl.DateTimeFormat("en-KE", {
        timeZone: "Africa/Nairobi",
        weekday: "short",
        month: "short",
        day: "numeric",
      }).format(new Date(slot.start))
      const list = groups.get(day) ?? []
      list.push(slot)
      groups.set(day, list)
    }
    return Array.from(groups.entries())
  }, [slots])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const parsed = meetingRequestSchema.safeParse({
      topic,
      message,
      preferredTimes,
      scheduledAt: scheduledAt || undefined,
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
      const booked = json.meeting?.status === "confirmed"
      setAgenda(typeof json.meeting?.agenda === "string" ? json.meeting.agenda : null)
      setSent(booked ? "booked" : "request")
      toast.success(booked ? `Session booked with ${expertName}` : `Request sent to ${expertName}`)
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
      <div className="space-y-3 rounded-md border border-border bg-muted/30 p-4 text-sm">
        <p className="font-medium">{sent === "booked" ? "Session booked" : "Request sent"}</p>
        <p className="text-muted-foreground">
          {sent === "booked"
            ? `${expertName} has the session on their dashboard. A prep agenda is ready for both of you.`
            : `${expertName} will follow up by email to confirm next steps.`}
        </p>
        {agenda ? (
          <pre className="max-h-56 overflow-auto whitespace-pre-wrap rounded-md border border-border bg-background p-3 text-xs leading-relaxed text-muted-foreground">
            {agenda}
          </pre>
        ) : null}
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

      {availabilityEnabled && groupedSlots.length > 0 ? (
        <div className="space-y-2">
          <Label>Pick a time ({availability?.durationMinutes ?? 45} min · EAT)</Label>
          <div className="max-h-56 space-y-3 overflow-auto rounded-md border border-border p-2">
            {groupedSlots.map(([day, daySlots]) => (
              <div key={day} className="space-y-1.5">
                <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  {day}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {daySlots.map((slot) => {
                    const label = new Intl.DateTimeFormat("en-KE", {
                      timeZone: "Africa/Nairobi",
                      hour: "numeric",
                      minute: "2-digit",
                    }).format(new Date(slot.start))
                    const active = scheduledAt === slot.start
                    return (
                      <button
                        key={slot.start}
                        type="button"
                        onClick={() => setScheduledAt(active ? "" : slot.start)}
                        className={cn(
                          "rounded-full border px-2.5 py-1 text-xs",
                          active
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border text-muted-foreground hover:border-primary/40"
                        )}
                      >
                        {label}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
          {scheduledAt ? (
            <p className="text-xs text-muted-foreground">{formatNairobiSlot(scheduledAt)} EAT</p>
          ) : (
            <p className="text-xs text-muted-foreground">
              Choose a slot to book immediately, or leave it blank and suggest another time.
            </p>
          )}
        </div>
      ) : null}

      {!scheduledAt ? (
        <div className="space-y-2">
          <Label htmlFor="times">Preferred times {availabilityEnabled ? "(if none of the slots work)" : "(optional)"}</Label>
          <Input
            id="times"
            value={preferredTimes}
            onChange={(e) => setPreferredTimes(e.target.value)}
            placeholder="e.g. Thursday afternoon or Friday morning"
          />
        </div>
      ) : null}

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
        {scheduledAt ? "Book session" : "Send request"}
      </Button>
    </form>
  )
}
