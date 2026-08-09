"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Paperclip, Send, X, File } from "lucide-react"

interface MessageComposerProps {
  onSend: (text: string) => void
  onTyping: () => void
  onUpload: (file: File) => Promise<void>
  disabled?: boolean
  isUploading?: boolean
}

export function MessageComposer({ onSend, onTyping, onUpload, disabled, isUploading }: MessageComposerProps) {
  const [text, setText] = React.useState("")
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null)
  const typingTimeout = React.useRef<NodeJS.Timeout | null>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setText(e.target.value)
    onTyping()
    if (typingTimeout.current) clearTimeout(typingTimeout.current)
    typingTimeout.current = setTimeout(() => {
      // typing stopped
    }, 1000)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (isUploading) return
    if (selectedFile) {
      onUpload(selectedFile).then(() => {
        setSelectedFile(null)
      })
      return
    }
    const trimmed = text.trim()
    if (!trimmed) return
    onSend(trimmed)
    setText("")
    inputRef.current?.focus()
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) setSelectedFile(file)
    e.target.value = ""
  }

  return (
    <form onSubmit={handleSubmit} className="border-t bg-white p-3 dark:bg-slate-900">
      {selectedFile && (
        <div className="mb-2 flex items-center gap-2 rounded-md bg-slate-100 px-3 py-2 text-sm text-slate-700 dark:bg-slate-800">
          <File className="h-4 w-4" />
          <span className="flex-1 truncate">{selectedFile.name}</span>
          <button type="button" onClick={() => setSelectedFile(null)} className="text-slate-500 hover:text-slate-700">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
      <div className="flex items-end gap-2">
        <label className="flex h-10 cursor-pointer items-center justify-center rounded-full bg-slate-100 px-3 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300">
          <Paperclip className="h-5 w-5" />
          <input type="file" accept="image/*,.pdf" className="hidden" onChange={handleFileChange} disabled={disabled || isUploading} />
        </label>
        <Input
          ref={inputRef}
          value={text}
          onChange={handleChange}
          placeholder="Type a message..."
          className="flex-1 rounded-full bg-slate-50 px-4 dark:bg-slate-800"
          disabled={disabled || isUploading}
        />
        <Button type="submit" size="icon" className="rounded-full" disabled={disabled || isUploading || (!text.trim() && !selectedFile)}>
          {isUploading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <Send className="h-4 w-4" />}
        </Button>
      </div>
    </form>
  )
}
