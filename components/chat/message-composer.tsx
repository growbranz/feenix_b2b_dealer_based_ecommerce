"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Paperclip, Send, X, File } from "lucide-react"
import { cn } from "@/lib/utils"

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
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)

  function autoResize() {
    const el = textareaRef.current
    if (!el) return
    el.style.height = "auto"
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`
  }

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setText(e.target.value)
    onTyping()
    if (typingTimeout.current) clearTimeout(typingTimeout.current)
    typingTimeout.current = setTimeout(() => {
      // typing stopped
    }, 1000)
  }

  React.useEffect(() => {
    autoResize()
  }, [text])

  function submitMessage() {
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
    requestAnimationFrame(() => textareaRef.current?.focus())
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    submitMessage()
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      submitMessage()
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) setSelectedFile(file)
    e.target.value = ""
  }

  const canSend = !disabled && !isUploading && (!!text.trim() || !!selectedFile)

  return (
    <form onSubmit={handleSubmit} className="border-t border-slate-100 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
      {selectedFile && (
        <div className="mb-2 flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-700 dark:bg-slate-800">
          <File className="h-4 w-4 shrink-0 text-blue-500" />
          <span className="flex-1 truncate">{selectedFile.name}</span>
          <button
            type="button"
            onClick={() => setSelectedFile(null)}
            className="rounded p-0.5 text-slate-500 hover:bg-slate-200 hover:text-slate-700"
            aria-label="Remove attachment"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
      <div className="flex items-end gap-2">
        <label
          className={cn(
            "flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300",
            (disabled || isUploading) && "pointer-events-none opacity-50"
          )}
          title="Attach a file"
        >
          <Paperclip className="h-5 w-5" />
          <span className="sr-only">Attach a file</span>
          <input
            type="file"
            accept="image/*,.pdf"
            className="hidden"
            onChange={handleFileChange}
            disabled={disabled || isUploading}
            aria-label="Attach a file"
          />
        </label>
        <div className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 transition-colors focus-within:border-blue-400 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500/15 dark:border-slate-700 dark:bg-slate-800">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            rows={1}
            className="max-h-[120px] w-full resize-none bg-transparent text-sm leading-relaxed text-slate-800 placeholder:text-slate-400 focus:outline-none dark:text-slate-100"
            disabled={disabled || isUploading}
            aria-label="Type a message"
          />
        </div>
        <Button
          type="submit"
          size="icon"
          className="h-10 w-10 shrink-0 rounded-full border-0 bg-gradient-to-r from-blue-700 to-blue-500 text-white shadow-md shadow-blue-500/20 hover:shadow-blue-500/35"
          disabled={!canSend}
          aria-label="Send message"
        >
          {isUploading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <Send className="h-4 w-4" />}
        </Button>
      </div>
    </form>
  )
}
