"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Copy,
  Check,
  Share2,
  MessageCircle,
  Twitter,
  Linkedin,
  Facebook,
} from "lucide-react"
import { toast } from "@/lib/toast"
import { getEventPublicUrl, getEventShareText } from "@/lib/event-url"
import { cn } from "@/lib/utils"

interface EventSharePanelProps {
  eventId: string
  eventTitle: string
  startDate?: string | Date
  variant?: "inline" | "card"
  className?: string
}

export function EventSharePanel({
  eventId,
  eventTitle,
  startDate,
  variant = "card",
  className,
}: EventSharePanelProps) {
  const [copied, setCopied] = useState(false)
  const url = getEventPublicUrl(eventId)
  const shareText = getEventShareText(eventTitle, startDate)

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      toast.success("Event link copied")
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("Could not copy link")
    }
  }

  const shareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: eventTitle, text: shareText, url })
        return
      } catch {
        // cancelled or unsupported
      }
    }
    await copyLink()
  }

  const openShare = (platform: "whatsapp" | "twitter" | "linkedin" | "facebook") => {
    const encodedUrl = encodeURIComponent(url)
    const encodedText = encodeURIComponent(shareText)
    const links: Record<string, string> = {
      whatsapp: `https://wa.me/?text=${encodeURIComponent(`${shareText} ${url}`)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    }
    window.open(links[platform], "_blank", "width=600,height=520,noopener")
  }

  const content = (
    <div className={cn("space-y-3", className)}>
      <div className="flex gap-2">
        <Input
          readOnly
          value={url}
          className="text-xs font-mono bg-muted/50"
          onFocus={(e) => e.target.select()}
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="shrink-0"
          onClick={copyLink}
          aria-label="Copy event link"
        >
          {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="secondary" size="sm" className="gap-1.5" onClick={shareNative}>
          <Share2 className="h-3.5 w-3.5" />
          Share
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-1.5"
          onClick={() => openShare("whatsapp")}
        >
          <MessageCircle className="h-3.5 w-3.5" />
          WhatsApp
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-1.5"
          onClick={() => openShare("twitter")}
        >
          <Twitter className="h-3.5 w-3.5" />
          X
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-1.5"
          onClick={() => openShare("linkedin")}
        >
          <Linkedin className="h-3.5 w-3.5" />
          LinkedIn
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-1.5"
          onClick={() => openShare("facebook")}
        >
          <Facebook className="h-3.5 w-3.5" />
          Facebook
        </Button>
      </div>
    </div>
  )

  if (variant === "inline") {
    return content
  }

  return (
    <div className="rounded-xl border bg-card p-4 space-y-2">
      <div>
        <p className="text-sm font-medium">Share this event</p>
        <p className="text-xs text-muted-foreground">
          Anyone with this link can view the event and register.
        </p>
      </div>
      {content}
    </div>
  )
}
