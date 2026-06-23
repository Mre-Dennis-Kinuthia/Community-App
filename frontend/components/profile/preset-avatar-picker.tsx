"use client"

import Image from "next/image"
import { cn } from "@/lib/utils"
import { PRESET_AVATARS, isPresetAvatarPath } from "@/lib/preset-avatars"

type PresetAvatarPickerProps = {
  value: string
  onChange: (path: string) => void
  className?: string
}

export function PresetAvatarPicker({ value, onChange, className }: PresetAvatarPickerProps) {
  const selected = isPresetAvatarPath(value) ? value : ""

  return (
    <div className={cn("space-y-2", className)}>
      <p className="text-sm font-medium">Choose an avatar</p>
      <p className="text-xs text-muted-foreground">
        Pick a character for your community profile — or upload your own photo below.
      </p>
      <div
        className="grid grid-cols-4 gap-2 sm:grid-cols-6"
        role="radiogroup"
        aria-label="Preset avatars"
      >
        {PRESET_AVATARS.map((avatar) => {
          const isSelected = selected === avatar.path
          return (
            <button
              key={avatar.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              aria-label={avatar.label}
              title={avatar.label}
              onClick={() => onChange(avatar.path)}
              className={cn(
                "group relative aspect-square overflow-hidden rounded-full border-2 transition-all",
                "hover:scale-105 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                isSelected
                  ? "border-primary ring-2 ring-primary/30 scale-105 shadow-md"
                  : "border-border/80 hover:border-primary/50"
              )}
            >
              <Image
                src={avatar.path}
                alt=""
                fill
                sizes="(max-width: 640px) 20vw, 72px"
                className="object-cover"
              />
            </button>
          )
        })}
      </div>
    </div>
  )
}
