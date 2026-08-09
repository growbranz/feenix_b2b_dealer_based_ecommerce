"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Upload, X, Image as ImageIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface ImageUploadProps {
  value?: string | null
  onChange: (url: string | null) => void
  className?: string
  disabled?: boolean
}

export function ImageUpload({
  value,
  onChange,
  className,
  disabled = false,
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = React.useState(false)
  const [isUploading, setIsUploading] = React.useState(false)
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
    const file = e.dataTransfer.files[0]
    if (file) handleFileUpload(file)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFileUpload(file)
  }

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file")
      return
    }

    setIsUploading(true)
    try {
      // TODO: Implement Supabase storage upload
      // For now, create a local preview
      const reader = new FileReader()
      reader.onloadend = () => {
        onChange(reader.result as string)
      }
      reader.readAsDataURL(file)
    } catch (error) {
      console.error("Upload error:", error)
      alert("Failed to upload image")
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemove = () => {
    onChange(null)
    if (inputRef.current) {
      inputRef.current.value = ""
    }
  }

  return (
    <div className={cn("w-full", className)}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled}
      />

      {(value && !isUploading) ? (
        <div className="relative group">
          <div className="relative h-48 w-48 overflow-hidden rounded-2xl border-2 border-border/50">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value}
              alt="Profile"
              className="h-full w-full object-cover"
            />
          </div>
          <Button
            variant="destructive"
            size="icon"
            onClick={handleRemove}
            disabled={disabled}
            className="absolute right-2 top-2 h-8 w-8 rounded-full opacity-0 transition-opacity group-hover:opacity-100"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <motion.div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={cn(
            "flex h-48 w-48 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-colors",
            isDragging
              ? "border-primary bg-primary/5"
              : "border-border/50 bg-muted/30 hover:border-primary/50 hover:bg-primary/5",
            disabled && "cursor-not-allowed opacity-50"
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
                {isDragging ? (
                  <Upload className="h-6 w-6 text-primary" />
                ) : (
                  <ImageIcon className="h-6 w-6 text-muted-foreground" />
                )}
              </div>
              <p className="text-sm font-medium text-foreground">
                {isDragging ? "Drop image" : "Upload logo"}
              </p>
              <p className="text-xs text-muted-foreground">
                PNG, JPG up to 5MB
              </p>
            </>
          )}
        </motion.div>
      )}
    </div>
  )
}
