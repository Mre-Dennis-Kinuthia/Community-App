"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { ChevronLeft, ChevronRight, Maximize2, ImageIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface ImageGalleryProps {
  images: string[]
  spaceName: string
  /** Smaller gallery for booking flow (less vertical space). */
  compact?: boolean
  className?: string
}

export function ImageGallery({ images, spaceName, compact = false, className }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const nextImage = () => {
    setSelectedIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setSelectedIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  const frameClass = compact
    ? "aspect-[16/9] max-h-[220px] w-full sm:max-h-[260px] lg:max-h-[300px]"
    : "aspect-video w-full"

  if (images.length === 0) {
    return (
      <div
        className={cn(
          "flex w-full items-center justify-center overflow-hidden rounded-xl border border-border/80 bg-muted",
          frameClass,
          className
        )}
      >
        <ImageIcon className="h-8 w-8 text-muted-foreground" />
      </div>
    )
  }

  return (
    <>
      <div className={cn("w-full min-w-0", className)}>
        <div
          className={cn(
            "group relative w-full overflow-hidden rounded-xl border border-border/80 bg-muted",
            frameClass
          )}
        >
          {images[selectedIndex] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={images[selectedIndex]}
              alt={`${spaceName} — photo ${selectedIndex + 1} of ${images.length}`}
              className="h-full w-full object-cover object-center"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <ImageIcon className="h-12 w-12 text-muted-foreground" />
            </div>
          )}

          {images.length > 1 && (
            <>
              <Button
                type="button"
                variant="secondary"
                size="icon"
                className="absolute left-2 top-1/2 h-9 w-9 -translate-y-1/2 bg-background/90 shadow-sm sm:opacity-0 sm:group-hover:opacity-100 sm:transition-opacity"
                onClick={prevImage}
                aria-label="Previous photo"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="icon"
                className="absolute right-2 top-1/2 h-9 w-9 -translate-y-1/2 bg-background/90 shadow-sm sm:opacity-0 sm:group-hover:opacity-100 sm:transition-opacity"
                onClick={nextImage}
                aria-label="Next photo"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <span className="absolute left-2 top-2 rounded-md bg-background/85 px-2 py-0.5 text-xs font-medium tabular-nums shadow-sm">
                {selectedIndex + 1} / {images.length}
              </span>
            </>
          )}

          <Button
            type="button"
            variant="secondary"
            size="icon"
            className="absolute bottom-2 right-2 h-9 w-9 bg-background/90 shadow-sm sm:opacity-0 sm:group-hover:opacity-100 sm:transition-opacity"
            onClick={() => setIsFullscreen(true)}
            aria-label="View fullscreen"
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>

        {images.length > 1 && (
          <div className="mt-2 flex gap-2 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {images.map((image, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setSelectedIndex(index)}
                aria-label={`Show photo ${index + 1}`}
                aria-current={selectedIndex === index}
                className={cn(
                  "h-14 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition-colors sm:h-16 sm:w-24",
                  selectedIndex === index
                    ? "border-primary ring-1 ring-primary/20"
                    : "border-border opacity-80 hover:opacity-100"
                )}
              >
                {image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={image}
                    alt=""
                    className="h-full w-full object-cover object-center"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-muted">
                    <ImageIcon className="h-5 w-5 text-muted-foreground" />
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
        <DialogContent className="max-h-[90vh] max-w-[min(100vw-2rem,56rem)] gap-0 overflow-hidden p-0">
          <div className="relative flex min-h-[200px] max-h-[85vh] w-full items-center justify-center bg-black/95">
            {images[selectedIndex] && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={images[selectedIndex]}
                alt={`${spaceName} — fullscreen`}
                className="max-h-[85vh] w-full object-contain object-center"
              />
            )}
            {images.length > 1 && (
              <>
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  className="absolute left-2 top-1/2 h-10 w-10 -translate-y-1/2"
                  onClick={prevImage}
                  aria-label="Previous photo"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  className="absolute right-2 top-1/2 h-10 w-10 -translate-y-1/2"
                  onClick={nextImage}
                  aria-label="Next photo"
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
                <p className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-md bg-background/90 px-3 py-1 text-sm font-medium tabular-nums">
                  {selectedIndex + 1} / {images.length}
                </p>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
