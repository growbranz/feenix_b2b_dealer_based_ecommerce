"use client"

import { cn, currencyFormatter } from "@/lib/utils"
import { ChatAvatar } from "./chat-avatar"
import { FileText, MapPin, ShoppingBag, Receipt, FileSpreadsheet, CreditCard, ArrowUpRight, Truck, ShieldCheck, MessageSquareText } from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"

interface MessageBubbleProps {
  message: any
  currentUserId: string
  showAvatar?: boolean
  className?: string
}

function formatMessageTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
}

function QuotationCard({ content, metadata, isMe }: { content: string; metadata: any; isMe: boolean }) {
  const hasDelivery = metadata?.delivery_days !== undefined && metadata?.delivery_days !== null
  const hasWarranty = !!metadata?.warranty

  return (
    <div className="w-72 max-w-full overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-sm dark:border-blue-900/50 dark:bg-slate-900">
      <div className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-white">
        <FileSpreadsheet className="h-4 w-4" />
        <span className="text-xs font-semibold uppercase tracking-wide">Quotation</span>
      </div>
      <div className="space-y-3 px-4 py-3">
        {metadata?.price !== undefined && metadata?.price !== null && (
          <div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              {currencyFormatter(Number(metadata.price))}
            </p>
            <p className="text-xs text-slate-400">Price</p>
          </div>
        )}
        {(hasDelivery || hasWarranty) && (
          <div className="grid grid-cols-2 gap-3 border-t border-slate-100 pt-3 dark:border-slate-800">
            {hasDelivery && (
              <div className="flex items-start gap-1.5">
                <Truck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-500" />
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{metadata.delivery_days} Days</p>
                  <p className="text-[11px] text-slate-400">Delivery</p>
                </div>
              </div>
            )}
            {hasWarranty && (
              <div className="flex items-start gap-1.5">
                <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{metadata.warranty}</p>
                  <p className="text-[11px] text-slate-400">Warranty</p>
                </div>
              </div>
            )}
          </div>
        )}
        {metadata?.remarks && (
          <div className="flex items-start gap-1.5 border-t border-slate-100 pt-3 dark:border-slate-800">
            <MessageSquareText className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
            <p className="text-xs text-slate-500 dark:text-slate-400">{metadata.remarks}</p>
          </div>
        )}
        {metadata?.enquiry_id && (
          <Link
            href={`/dealer/my-enquiries/${metadata.enquiry_id}`}
            className="mt-1 flex items-center justify-center gap-1.5 rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100 dark:bg-blue-950/40 dark:text-blue-300"
          >
            View Enquiry
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>
    </div>
  )
}

function renderMessageContent(message: any, isMe: boolean) {
  const { message_type, content, metadata } = message

  if (message.deleted_at) {
    return <span className="italic text-slate-400">This message was deleted</span>
  }

  switch (message_type) {
    case "image":
      return (
        <a href={metadata?.publicUrl} target="_blank" rel="noreferrer" className="block overflow-hidden rounded-2xl shadow-sm">
          <img
            src={metadata?.publicUrl}
            alt={metadata?.fileName || "Image"}
            className="max-h-64 max-w-xs object-cover"
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
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
        >
          <FileText className="h-4 w-4 text-blue-500" />
          <span className="text-sm">{metadata?.fileName || "PDF Document"}</span>
        </a>
      )
    case "invoice":
      return (
        <Link
          href={`/api/invoices/${metadata?.invoice_id}/pdf`}
          target="_blank"
          className="flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2.5 text-emerald-700 shadow-sm hover:bg-emerald-100"
        >
          <Receipt className="h-4 w-4" />
          <span className="text-sm font-medium">{content || "Invoice"}</span>
        </Link>
      )
    case "quotation":
      return <QuotationCard content={content} metadata={metadata} isMe={isMe} />
    case "order_link":
      return (
        <Link
          href={`/orders/${metadata?.order_id}`}
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
        >
          <ShoppingBag className="h-4 w-4 text-blue-500" />
          <span className="text-sm">{content || `Order #${metadata?.order_id?.slice(0, 8)}`}</span>
        </Link>
      )
    case "payment_link":
      return (
        <Link
          href={`/orders/${metadata?.order_id}/pay`}
          className="flex items-center gap-2 rounded-xl border border-amber-100 bg-amber-50 px-3 py-2.5 text-amber-700 shadow-sm hover:bg-amber-100"
        >
          <CreditCard className="h-4 w-4" />
          <span className="text-sm font-medium">{content || "Payment Link"}</span>
        </Link>
      )
    case "location":
      return (
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <MapPin className="h-4 w-4 text-blue-500" />
          <span className="text-sm">{content || "Location"}</span>
        </div>
      )
    case "text":
    default:
      return <p className="whitespace-pre-wrap text-sm leading-relaxed">{content}</p>
  }
}

const CARD_TYPES = new Set(["image", "pdf", "invoice", "quotation", "order_link", "payment_link", "location"])

export function MessageBubble({ message, currentUserId, showAvatar = true, className }: MessageBubbleProps) {
  const isMe = message.sender_id === currentUserId
  const isCard = CARD_TYPES.has(message.message_type) && !message.deleted_at

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("flex w-full gap-2.5", isMe ? "flex-row-reverse" : "flex-row", className)}
    >
      {showAvatar && !isMe ? (
        <ChatAvatar name={message.sender?.name} url={message.sender?.avatar_url} size="sm" />
      ) : (
        <div className="w-8 shrink-0" />
      )}

      <div className={cn("flex max-w-[75%] flex-col", isMe ? "items-end" : "items-start")}>
        {isCard ? (
          renderMessageContent(message, isMe)
        ) : (
          <div
            className={cn(
              "rounded-2xl px-4 py-2.5 shadow-sm",
              isMe
                ? "rounded-br-md bg-gradient-to-br from-blue-600 to-indigo-600 text-white"
                : "rounded-bl-md border border-slate-100 bg-white text-slate-800 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
            )}
          >
            {renderMessageContent(message, isMe)}
          </div>
        )}
        <div className="mt-1 flex items-center gap-1.5 px-1 text-[10px] text-slate-400">
          <span>{formatMessageTime(message.created_at)}</span>
          {message.status === "read" && isMe && <span className="text-blue-500">✓✓</span>}
          {message.status === "sent" && isMe && <span className="text-[10px]">✓</span>}
          {message.edited_at && <span className="italic">edited</span>}
        </div>
      </div>
    </motion.div>
  )
}
