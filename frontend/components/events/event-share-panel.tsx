"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Copy, Check, Share2 } from "lucide-react"
import { toast } from "@/lib/toast"
import { getEventPublicUrl, getEventShareText } from "@/lib/event-url"
import { SHARE_PLATFORM_META, type SharePlatformId } from "@/lib/event-platform"
import { PlatformIcon } from "@/components/platform-icon"
import { cn } from "@/lib/utils"

interface EventSharePanelProps {
  event: {
    id: string
    title: string
    startDate?: string | Date
    slug?: string | null
    shortCode?: string | null
  }
  variant?: "inline" | "card"
  className?: string
}

const SHARE_PLATFORMS: SharePlatformId[] = ["whatsapp", "twitter", "linkedin", "facebook"]

export function EventSharePanel({
  event,
  variant = "card",
  className,
}: EventSharePanelProps) {
  const [copied, setCopied] = useState(false)
  const url = getEventPublicUrl(event)
  const shareText = getEventShareText(event.title, event.startDate)

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
        await navigator.share({ title: event.title, text: shareText, url })
        return
      } catch {
        // cancelled or unsupported
      }
    }
    await copyLink()
  }

  const openShare = (platform: SharePlatformId) => {
    const encodedUrl = encodeURIComponent(url)
    const encodedText = encodeURIComponent(shareText)
    const links: Record<SharePlatformId, string> = {
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
        {SHARE_PLATFORMS.map((platform) => {
          const meta = SHARE_PLATFORM_META[platform]
          return (
            <Button
              key={platform}
              type="button"
              variant="outline"
              size="sm"
              className="gap-1.5 pl-2"
              onClick={() => openShare(platform)}
            >
              <PlatformIcon src={meta.icon} alt={meta.label} size={18} />
              {meta.label}
            </Button>
          )
        })}
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
          Short link — opens the correct event page for anyone.
        </p>
      </div>
      {content}
    </div>
  )
}
