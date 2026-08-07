"use client"

import { useCallback, useEffect, useState } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"
import type { AAC_STORY_GALLERY } from "@/lib/aac-program"

type GalleryPhoto = (typeof AAC_STORY_GALLERY)[number]

interface AacGalleryProps {
  photos: readonly GalleryPhoto[]
}

export function AacGallery({ photos }: AacGalleryProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  const close = useCallback(() => setActiveIndex(null), [])
  const prev = useCallback(() => {
    setActiveIndex((i) => (i === null ? null : (i - 1 + photos.length) % photos.length))
  }, [photos.length])
  const next = useCallback(() => {
    setActiveIndex((i) => (i === null ? null : (i + 1) % photos.length))
  }, [photos.length])

  useEffect(() => {
    if (activeIndex === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close()
      if (e.key === "ArrowLeft") prev()
      if (e.key === "ArrowRight") next()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [activeIndex, close, prev, next])

  const [featured, ...rest] = photos

  return (
    <>
      <div className="grid gap-3 lg:grid-cols-12">
        <button
          type="button"
          onClick={() => setActiveIndex(0)}
          className="group relative overflow-hidden rounded-lg border border-[#edeff2] bg-white lg:col-span-7 lg:row-span-2"
        >
          <div className="relative aspect-[16/10] lg:aspect-auto lg:min-h-[28rem]">
            <Image
              src={featured.src}
              alt={featured.alt}
              fill
              sizes="(max-width: 1024px) 100vw, 55vw"
              className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
              unoptimized
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a1f38]/80 via-transparent to-transparent" />
            <p className="absolute bottom-0 left-0 right-0 p-5 text-left text-sm font-medium leading-snug text-white">
              {featured.caption}
            </p>
          </div>
        </button>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:col-span-5">
          {rest.map((photo, i) => (
            <button
              key={photo.src}
              type="button"
              onClick={() => setActiveIndex(i + 1)}
              className="group relative overflow-hidden rounded-lg border border-[#edeff2] bg-white"
            >
              <div className="relative aspect-[4/3]">
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  sizes="(max-width: 640px) 50vw, 20vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  unoptimized
                />
                <div className="absolute inset-0 bg-[#0a1f38]/0 transition-colors group-hover:bg-[#0a1f38]/20" />
              </div>
            </button>
          ))}
        </div>
      </div>

      <Dialog open={activeIndex !== null} onOpenChange={(open) => !open && close()}>
        <DialogContent className="max-w-4xl border-0 bg-[#0a1f38] p-0 text-white sm:rounded-lg">
          <DialogTitle className="sr-only">
            {activeIndex !== null ? photos[activeIndex]?.caption : "Photo gallery"}
          </DialogTitle>
          {activeIndex !== null ? (
            <div className="relative">
              <div className="relative aspect-[16/10] w-full">
                <Image
                  src={photos[activeIndex].src}
                  alt={photos[activeIndex].alt}
                  fill
                  sizes="90vw"
                  className="object-contain"
                  unoptimized
                />
              </div>
              <p className="px-5 py-4 text-sm leading-relaxed text-white/85">
                {photos[activeIndex].caption}
              </p>
              <div className="absolute left-3 top-1/2 -translate-y-1/2">
                <button
                  type="button"
                  onClick={prev}
                  className="rounded-full bg-black/50 p-2 text-white backdrop-blur-sm transition-colors hover:bg-black/70"
                  aria-label="Previous photo"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
              </div>
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <button
                  type="button"
                  onClick={next}
                  className="rounded-full bg-black/50 p-2 text-white backdrop-blur-sm transition-colors hover:bg-black/70"
                  aria-label="Next photo"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
              <p className="absolute bottom-16 right-5 text-xs text-white/50">
                {activeIndex + 1} / {photos.length}
              </p>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  )
}
