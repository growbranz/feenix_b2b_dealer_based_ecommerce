"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, ZoomIn } from "lucide-react"
import { cn } from "@/lib/utils"

export interface ProductGalleryProps {
  images: string[]
  alt?: string
  className?: string
}

export function ProductGallery({ images, alt = "Product image", className }: ProductGalleryProps) {
  const [currentIndex, setCurrentIndex] = React.useState(0)
  const [isZoomed, setIsZoomed] = React.useState(false)

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  if (images.length === 0) {
    return (
      <div className={cn("aspect-square bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100", className)}>
        <p className="text-slate-500">No images available</p>
      </div>
    )
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="relative aspect-square bg-slate-50 rounded-2xl overflow-hidden group border border-slate-100 shadow-[0_4px_24px_-10px_rgba(30,41,59,0.06)]">
        <img
          src={images[currentIndex]}
          alt={`${alt} ${currentIndex + 1}`}
          className={cn(
            "w-full h-full object-cover transition-transform duration-300",
            isZoomed ? "scale-150 cursor-zoom-out" : "cursor-zoom-in"
          )}
          onClick={() => setIsZoomed(!isZoomed)}
        />
        {images.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-md shadow-sm rounded-full hover:bg-white hover:shadow-md transition-all"
              onClick={prevImage}
            >
              <ChevronLeft className="h-4 w-4 text-slate-700" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-md shadow-sm rounded-full hover:bg-white hover:shadow-md transition-all"
              onClick={nextImage}
            >
              <ChevronRight className="h-4 w-4 text-slate-700" />
            </Button>
          </>
        )}
        <div className="absolute bottom-2 right-2">
          <Button
            variant="ghost"
            size="icon"
            className="bg-white/90 backdrop-blur-md shadow-sm rounded-full hover:bg-white hover:shadow-md transition-all"
            onClick={() => setIsZoomed(!isZoomed)}
          >
            <ZoomIn className="h-4 w-4 text-slate-700" />
          </Button>
        </div>
        <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-medium text-slate-700 shadow-sm">
          {currentIndex + 1} / {images.length}
        </div>
      </div>
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={cn(
                "flex-shrink-0 w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all",
                index === currentIndex ? "border-blue-600 ring-2 ring-blue-600/20" : "border-transparent hover:border-blue-200 hover:ring-2 hover:ring-blue-200/30"
              )}
            >
              <img
                src={image}
                alt={`${alt} thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
