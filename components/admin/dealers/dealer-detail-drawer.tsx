"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { dateFormatter } from "@/lib/utils"
import type { AdminDealer } from "./data"
import { mockActivities } from "./data"
import { DealerStatusBadge } from "./status-badge"
import {
  X,
  Building2,
  User,
  CreditCard,
  FileText,
  MapPin,
  Phone,
  Mail,
  Package,
  ShoppingCart,
  Calendar,
  Clock,
} from "lucide-react"

interface DealerDetailDrawerProps {
  dealer: AdminDealer | null
  onClose: () => void
}

export function DealerDetailDrawer({ dealer, onClose }: DealerDetailDrawerProps) {
  const activities = dealer ? mockActivities[dealer.id] || [] : []

  return (
    <AnimatePresence>
      {dealer && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            aria-hidden="true"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="fixed inset-y-0 right-0 z-50 w-full max-w-md overflow-y-auto border-l border-slate-200 bg-white shadow-2xl"
          >
            <div className="flex h-16 items-center justify-between border-b px-6">
              <h2 className="text-lg font-semibold text-slate-900">Dealer Details</h2>
              <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close drawer">
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="space-y-6 p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-lg font-bold text-white">
                  {dealer.business_name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{dealer.business_name}</h3>
                  <p className="text-sm text-slate-500">{dealer.owner_name}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <DealerStatusBadge status={dealer.status} />
                    <Badge variant="secondary" className="text-xs font-medium capitalize">
                      {dealer.business_type}
                    </Badge>
                  </div>
                </div>
              </div>

              <Card className="rounded-2xl border-slate-200 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-slate-500" />
                    Company Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 pt-0 text-sm">
                  <DetailRow icon={User} label="Owner" value={dealer.owner_name} />
                  <DetailRow icon={CreditCard} label="GST" value={dealer.gst} />
                  <DetailRow icon={FileText} label="PAN" value={dealer.pan} />
                  <DetailRow icon={Phone} label="Phone" value={dealer.phone} />
                  <DetailRow icon={Mail} label="Email" value={dealer.email} />
                </CardContent>
              </Card>

              <Card className="rounded-2xl border-slate-200 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-slate-500" />
                    Address
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 text-sm text-slate-600">
                  <p>{dealer.address}</p>
                  <p className="mt-1">
                    {dealer.city}, {dealer.state} - {dealer.pincode}
                  </p>
                </CardContent>
              </Card>

              <div className="grid grid-cols-2 gap-4">
                <MetricCard icon={Package} label="Products" value={dealer.products_count} color="text-blue-600" />
                <MetricCard icon={ShoppingCart} label="Orders" value={dealer.orders_count} color="text-emerald-600" />
              </div>

              <Card className="rounded-2xl border-slate-200 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-slate-500" />
                    Registration
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 text-sm text-slate-600">
                  <p>{dateFormatter(dealer.registered_at, "long")}</p>
                </CardContent>
              </Card>

              <Card className="rounded-2xl border-slate-200 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold">Activity Timeline</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="space-y-4">
                    {activities.length === 0 ? (
                      <p className="text-sm text-slate-500">No activity recorded.</p>
                    ) : (
                      activities.map((activity) => (
                        <li key={activity.id} className="flex gap-3">
                          <span className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                            <Clock className="h-4 w-4" />
                          </span>
                          <div>
                            <p className="text-sm font-medium text-slate-900">{activity.action}</p>
                            <p className="text-xs text-slate-500">
                              {new Date(activity.timestamp).toLocaleString("en-US", {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                            <p className="text-xs text-slate-400">{activity.actor}</p>
                          </div>
                        </li>
                      ))
                    )}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType
  label: string
  value: string
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 h-4 w-4 text-slate-400" />
      <div>
        <p className="text-xs font-medium text-slate-400">{label}</p>
        <p className="text-slate-700">{value}</p>
      </div>
    </div>
  )
}

function MetricCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType
  label: string
  value: number
  color: string
}) {
  return (
    <Card className="rounded-2xl border-slate-200 shadow-sm">
      <CardContent className="flex items-center gap-3 p-4">
        <span className={cn("flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100", color)}>
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <p className="text-2xl font-bold text-slate-900">{value}</p>
          <p className="text-xs text-slate-500">{label}</p>
        </div>
      </CardContent>
    </Card>
  )
}
