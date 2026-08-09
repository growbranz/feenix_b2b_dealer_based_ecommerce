"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { mockLogs } from "@/components/admin/activity/data"
import { mockDealers } from "@/components/admin/dealers/data"
import { mockProducts } from "@/components/admin/products/data"
import { dateFormatter } from "@/lib/utils"
import { Activity, Clock, AlertTriangle, Package, Users } from "lucide-react"

export function AdminWidgets() {
  const recentLogs = React.useMemo(() => [...mockLogs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 5), [])
  const pendingDealers = mockDealers.filter((d) => d.status === "PENDING")
  const pendingProducts = mockProducts.filter((p) => p.status === "PENDING")
  const lowStock = mockProducts.filter((p) => p.stock < 20)

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="rounded-2xl border-slate-200 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Activity className="h-4 w-4 text-blue-600" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <ul className="space-y-3">
            {recentLogs.map((log) => (
              <li key={log.id} className="flex items-start gap-3 text-sm">
                <Clock className="mt-0.5 h-4 w-4 text-slate-400" />
                <div>
                  <p className="font-medium text-slate-900">{log.action}</p>
                  <p className="text-xs text-slate-500">{dateFormatter(log.timestamp, "long")}</p>
                </div>
              </li>
            ))}
          </ul>
          <Link href="/admin/activity">
            <Button variant="ghost" size="sm" className="mt-4">View all</Button>
          </Link>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-slate-200 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            Pending Approvals
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 pt-0">
          <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-slate-500" />
              <span className="text-sm font-medium text-slate-700">Dealers</span>
            </div>
            <Badge variant="secondary">{pendingDealers.length}</Badge>
          </div>
          <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
            <div className="flex items-center gap-3">
              <Package className="h-5 w-5 text-slate-500" />
              <span className="text-sm font-medium text-slate-700">Products</span>
            </div>
            <Badge variant="secondary">{pendingProducts.length}</Badge>
          </div>
          <Link href="/admin/dealers">
            <Button size="sm" className="w-full">Review Dealers</Button>
          </Link>
          <Link href="/admin/products">
            <Button size="sm" variant="outline" className="w-full">Review Products</Button>
          </Link>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-slate-200 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Package className="h-4 w-4 text-rose-600" />
            Low Stock Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <ul className="space-y-3">
            {lowStock.slice(0, 5).map((p) => (
              <li key={p.id} className="flex items-center justify-between text-sm">
                <span className="text-slate-700">{p.title}</span>
                <Badge className="bg-rose-100 text-rose-700">{p.stock} left</Badge>
              </li>
            ))}
          </ul>
          {lowStock.length === 0 && <p className="text-sm text-slate-500">No low stock products.</p>}
        </CardContent>
      </Card>
    </div>
  )
}
