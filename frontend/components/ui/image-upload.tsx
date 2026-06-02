"use client"

import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Upload, X } from "lucide-react"
import { getImageDisplayUrl, type StoredImageCategory } from "@/lib/stored-image"
import { cn } from "@/lib/utils"
import { toast } from "@/lib/toast"

interface ImageUploadProps {
  label?: string
  description?: string
  value?: string
  onChange: (url: string) => void
  category: StoredImageCategory
  uploadUrl?: string
  className?: string
  previewClassName?: string
  allowClear?: boolean
}

export function ImageUpload({
  label = "Image",
  description,
  value = "",
  onChange,
  category,
  uploadUrl = "/api/images",
  className,
  previewClassName,
  allowClear = true,
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const previewSrc = getImageDisplayUrl(value)

  const handleFile = async (file: File | null) => {
    if (!file) return
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file")
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("category", category)

      const res = await fetch(uploadUrl, {
        method: "POST",
        body: formData,
        credentials: "include",
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data.error || "Upload failed")
      }
      onChange(data.url)
      if (category === "profile") {
        window.dispatchEvent(
          new CustomEvent("profile-image-updated", { detail: { url: data.url } })
        )
      }
      toast.success("Image uploaded")
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed")
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  return (
    <div className={cn("space-y-2", className)}>
      {label ? <Label>{label}</Label> : null}
      {description ? <p className="text-xs text-muted-foreground">{description}</p> : null}

      {previewSrc ? (
        <div className={cn("relative overflow-hidden rounded-md border", previewClassName)}>
          <img src={previewSrc} alt="" className="h-40 w-full object-cover" />
          {allowClear && (
            <Button
              type="button"
              variant="secondary"
              size="icon"
              className="absolute right-2 top-2 h-8 w-8"
              onClick={() => onChange("")}
              aria-label="Remove image"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        <Input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-2"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
          {uploading ? "Uploading…" : previewSrc ? "Replace image" : "Upload image"}
        </Button>
      </div>
    </div>
  )
}
