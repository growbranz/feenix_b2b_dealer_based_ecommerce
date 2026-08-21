"use client"

import { cn, currencyFormatter } from "@/lib/utils"
import { ChatAvatar } from "./chat-avatar"
import { FileText, Image, MapPin, ShoppingBag, Receipt, FileSpreadsheet, CreditCard, AlertTriangle } from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"

interface MessageBubbleProps {
  message: any
  currentUserId: string
  showAvatar?: boolean
}

function formatMessageTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
}

function renderMessageContent(message: any) {
  const { message_type, content, metadata } = message

  if (message.deleted_at) {
    return <span className="italic text-slate-400">This message was deleted</span>
  }

  switch (message_type) {
    case "image":
      return (
        <a href={metadata?.publicUrl} target="_blank" rel="noreferrer">
          <img
            src={metadata?.publicUrl}
            alt={metadata?.fileName || "Image"}
            className="max-h-64 max-w-xs rounded-md object-cover"
          />
        </a>
      )
    case "pdf":
      return (
        <a
          href={metadata?.publicUrl}
          download={metadata?.fileName}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 rounded-md bg-slate-100 px-3 py-2 text-slate-700 hover:bg-slate-200"
        >
          <FileText className="h-4 w-4" />
          <span className="text-sm">{metadata?.fileName || "PDF Document"}</span>
        </a>
      )
    case "invoice":
      return (
        <Link
          href={`/api/invoices/${metadata?.invoice_id}/pdf`}
          target="_blank"
          className="flex items-center gap-2 rounded-md bg-emerald-50 px-3 py-2 text-emerald-700 hover:bg-emerald-100"
        >
          <Receipt className="h-4 w-4" />
          <span className="text-sm">{content || "Invoice"}</span>
        </Link>
      )
    case "quotation":
      return (
        <div className="rounded-md bg-blue-50 px-3 py-2 text-blue-800">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="h-4 w-4" />
            <span className="font-medium">{content || "Quotation"}</span>
          </div>
          {metadata?.price !== undefined && metadata?.price !== null && (
            <p className="mt-1 text-sm">Price: {currencyFormatter(Number(metadata.price))}</p>
          )}
          {metadata?.delivery_days !== undefined && metadata?.delivery_days !== null && (
            <p className="text-sm">Delivery: {metadata.delivery_days} days</p>
          )}
          {metadata?.warranty && <p className="text-sm">Warranty: {metadata.warranty}</p>}
          {metadata?.remarks && <p className="text-xs opacity-80">{metadata.remarks}</p>}
        </div>
      )
    case "order_link":
      return (
        <Link
          href={`/orders/${metadata?.order_id}`}
          className="flex items-center gap-2 rounded-md bg-slate-100 px-3 py-2 text-slate-700 hover:bg-slate-200"
        >
          <ShoppingBag className="h-4 w-4" />
          <span className="text-sm">{content || `Order #${metadata?.order_id?.slice(0, 8)}`}</span>
        </Link>
      )
    case "payment_link":
      return (
        <Link
          href={`/orders/${metadata?.order_id}/pay`}
          className="flex items-center gap-2 rounded-md bg-amber-50 px-3 py-2 text-amber-700 hover:bg-amber-100"
        >
          <CreditCard className="h-4 w-4" />
          <span className="text-sm">{content || "Payment Link"}</span>
        </Link>
      )
    case "location":
      return (
        <div className="flex items-center gap-2 text-slate-600">
          <MapPin className="h-4 w-4" />
          <span className="text-sm">{content || "Location"}</span>
        </div>
      )
    case "text":
    default:
      return <p className="whitespace-pre-wrap text-sm leading-relaxed">{content}</p>
  }
}

export function MessageBubble({ message, currentUserId, showAvatar = true }: MessageBubbleProps) {
  const isMe = message.sender_id === currentUserId

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("flex w-full gap-3", isMe ? "flex-row-reverse" : "flex-row")}
    >
      {showAvatar && !isMe ? (
        <ChatAvatar name={message.sender?.name} url={message.sender?.avatar_url} size="sm" />
      ) : (
        <div className="w-8" />
      )}

      <div className={cn("flex max-w-[75%] flex-col", isMe ? "items-end" : "items-start")}>
        <div
          className={cn(
            "rounded-2xl px-4 py-2.5 shadow-sm",
            isMe
              ? "rounded-br-md bg-orange-500 text-white"
            : "rounded-bl-md bg-white text-slate-800"
          )}
        >
          {renderMessageContent(message)}
        </div>
        <div className="mt-1 flex items-center gap-1.5 text-[10px] text-slate-400">
          <span>{formatMessageTime(message.created_at)}</span>
          {message.status === "read" && isMe && <span className="text-[10px]">✓✓</span>}
          {message.status === "sent" && isMe && <span className="text-[10px]">✓</span>}
          {message.edited_at && <span className="italic">edited</span>}
        </div>
      </div>
    </motion.div>
  )
}
