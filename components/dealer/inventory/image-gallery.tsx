"use client"

import * as React from "react"
import { motion, Reorder } from "framer-motion"
import { Upload, X, GripVertical, Image as ImageIcon, Star, ZoomIn } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface ImageGalleryProps {
  images: string[]
  onChange: (images: string[]) => void
  maxImages?: number
  disabled?: boolean
  showPrimaryBadge?: boolean
}

export function ImageGallery({
  images,
  onChange,
  maxImages = 5,
  disabled = false,
  showPrimaryBadge = true,
}: ImageGalleryProps) {
  const [isDragging, setIsDragging] = React.useState(false)
  const [isUploading, setIsUploading] = React.useState(false)
  const [previewImage, setPreviewImage] = React.useState<string | null>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const files = Array.from(e.dataTransfer.files)
    handleFiles(files)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    handleFiles(files)
  }

  const handleFiles = async (files: File[]) => {
    const imageFiles = files.filter((f) => f.type.startsWith("image/"))
    if (imageFiles.length === 0) {
      alert("Please upload image files")
      return
    }

    if (images.length + imageFiles.length > maxImages) {
      alert(`Maximum ${maxImages} images allowed`)
      return
    }

    setIsUploading(true)
    try {
      // TODO: Implement Supabase storage upload with compression
      // For now, create local previews
      const newImages = await Promise.all(
        imageFiles.map(
          (file) =>
            new Promise<string>((resolve) => {
              const reader = new FileReader()
              reader.onloadend = () => resolve(reader.result as string)
              reader.readAsDataURL(file)
            })
        )
      )
      onChange([...images, ...newImages])
    } catch (error) {
      console.error("Upload error:", error)
      alert("Failed to upload images")
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemove = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    onChange(newImages)
  }

  const handleSetPrimary = (index: number) => {
    const newImages = [images[index], ...images.filter((_, i) => i !== index)]
    onChange(newImages)
  }

  const handleReorder = (newImages: string[]) => {
    onChange(newImages)
  }

  return (
    <div className="space-y-4">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || images.length >= maxImages}
      />

      <motion.div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 transition-colors",
          isDragging
            ? "border-primary bg-primary/5"
            : "border-border/50 bg-muted/30 hover:border-primary/50 hover:bg-primary/5",
          (disabled || images.length >= maxImages) && "cursor-not-allowed opacity-50"
        )}
      >
        {isUploading ? (
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span className="text-sm text-muted-foreground">Uploading...</span>
          </div>
        ) : (
          <>
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Upload className="h-6 w-6 text-primary" />
            </div>
            <p className="text-sm font-medium text-foreground">
              {isDragging ? "Drop images" : "Upload images"}
            </p>
            <p className="text-xs text-muted-foreground">
              PNG, JPG up to 5MB each (max {maxImages})
            </p>
          </>
        )}
      </motion.div>

      {images.length > 0 && (
        <Reorder.Group
          axis="y"
          values={images}
          onReorder={handleReorder}
          className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4"
        >
          {images.map((image, index) => (
            <Reorder.Item
              key={image}
              value={image}
              id={image}
              className="relative aspect-square"
            >
              <div className="relative h-full w-full overflow-hidden rounded-xl border border-border/50 bg-muted group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image}
                  alt={`Product image ${index + 1}`}
                  className="h-full w-full object-cover"
                />

                {/* Primary Badge */}
                {showPrimaryBadge && index === 0 && (
                  <Badge className="absolute left-2 top-2 bg-primary text-primary-foreground">
                    Primary
                  </Badge>
                )}

                {/* Actions Overlay */}
                <div className="absolute inset-0 flex items-center justify-between p-2 opacity-0 transition-opacity hover:opacity-100 hover:bg-black/20">
                  <div className="cursor-grab active:cursor-grabbing">
                    <GripVertical className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex gap-1">
                    {showPrimaryBadge && index !== 0 && (
                      <Button
                        variant="secondary"
                        size="icon"
                        className="h-8 w-8 rounded-full"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleSetPrimary(index)
                        }}
                        disabled={disabled}
                      >
                        <Star className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="secondary"
                      size="icon"
                      className="h-8 w-8 rounded-full"
                      onClick={(e) => {
                        e.stopPropagation()
                        setPreviewImage(image)
                      }}
                      disabled={disabled}
                    >
                      <ZoomIn className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      className="h-8 w-8 rounded-full"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRemove(index)
                      }}
                      disabled={disabled}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Index Badge */}
                <div className="absolute bottom-2 left-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-xs font-medium text-white">
                  {index + 1}
                </div>
              </div>
            </Reorder.Item>
          ))}
        </Reorder.Group>
      )}

      {/* Image Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewImage}
              alt="Preview"
              className="max-h-[90vh] w-auto rounded-lg"
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2 h-8 w-8 rounded-full bg-white/10 text-white hover:bg-white/20"
              onClick={(e) => {
                e.stopPropagation()
                setPreviewImage(null)
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
