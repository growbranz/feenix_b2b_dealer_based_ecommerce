"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { getPendingApprovals, getLowStockProducts } from "@/lib/admin/dashboard-service"
import { dateFormatter } from "@/lib/utils"
import { Activity, Clock, AlertTriangle, Package, Users } from "lucide-react"

export function AdminWidgets() {
  const [pendingApprovals, setPendingApprovals] = React.useState({ pendingDealers: 0, pendingProducts: 0 })
  const [lowStockProducts, setLowStockProducts] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    async function loadData() {
      try {
        const [approvals, lowStock] = await Promise.all([
          getPendingApprovals(),
          getLowStockProducts(5),
        ])
        setPendingApprovals(approvals)
        setLowStockProducts(lowStock)
      } catch (error) {
        console.error("Error loading widget data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  if (loading) {
    return (
      <div className="grid gap-6 lg:grid-cols-3">
        {[...Array(3)].map((_, index) => (
          <Card key={index} className="rounded-2xl border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <div className="h-6 w-32 bg-slate-100 rounded animate-pulse" />
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-12 bg-slate-100 rounded animate-pulse" />
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

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
          <p className="text-sm text-slate-500 text-center py-4">See Recent Activities panel</p>
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
            <Badge variant="secondary">{pendingApprovals.pendingDealers}</Badge>
          </div>
          <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
            <div className="flex items-center gap-3">
              <Package className="h-5 w-5 text-slate-500" />
              <span className="text-sm font-medium text-slate-700">Products</span>
            </div>
            <Badge variant="secondary">{pendingApprovals.pendingProducts}</Badge>
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
          {lowStockProducts.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-4">No low stock products</p>
          ) : (
            <ul className="space-y-3">
              {lowStockProducts.map((p) => (
                <li key={p.id} className="flex items-center justify-between text-sm">
                  <span className="text-slate-700">{p.title}</span>
                  <Badge className="bg-rose-100 text-rose-700">{p.stock} left</Badge>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
