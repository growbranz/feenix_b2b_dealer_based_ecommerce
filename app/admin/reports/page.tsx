import { PageHeader } from "@/components/shared/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  getInventoryMovementSummary,
  getProductMovementReport,
  getDealerInventoryReport,
} from "@/lib/inventory/data"
import { currencyFormatter, dateFormatter } from "@/lib/utils"
import { BarChart3, TrendingUp, Package } from "lucide-react"
import { ReportsPage as ComprehensiveReportsPage } from "@/components/analytics/reports-page"

export default async function ReportsPage() {
  const [movement, fastMoving, dealerReport] = await Promise.all([
    getInventoryMovementSummary(14),
    getProductMovementReport("fast", 10),
    getDealerInventoryReport(),
  ])

  const totalIn = movement.reduce((sum, d) => sum + d.in, 0)
  const totalOut = movement.reduce((sum, d) => sum + d.out, 0)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        description="Inventory and sales analytics"
        breadcrumb={[{ label: "Admin", href: "/admin" }, { label: "Reports" }]}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total In (14d)</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalIn}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Out (14d)</CardTitle>
            <TrendingUp className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOut}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Top Movers</CardTitle>
            <Package className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fastMoving.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Dealers</CardTitle>
            <BarChart3 className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dealerReport.length}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Daily Movement (last 14 days)</h2>
          {movement.length === 0 ? (
            <p className="text-slate-500">No movement data yet.</p>
          ) : (
            <div className="overflow-hidden rounded-md border">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-left text-slate-600">
                  <tr>
                    <th className="px-4 py-3 font-medium">Date</th>
                    <th className="px-4 py-3 font-medium">In</th>
                    <th className="px-4 py-3 font-medium">Out</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {movement.map((day) => (
                    <tr key={day.date} className="hover:bg-slate-50">
                      <td className="px-4 py-3">{day.date}</td>
                      <td className="px-4 py-3 text-emerald-600">+{day.in}</td>
                      <td className="px-4 py-3 text-rose-600">-{day.out}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Top Moving Products</h2>
          {fastMoving.length === 0 ? (
            <p className="text-slate-500">No sales data yet.</p>
          ) : (
            <div className="overflow-hidden rounded-md border">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-left text-slate-600">
                  <tr>
                    <th className="px-4 py-3 font-medium">Product</th>
                    <th className="px-4 py-3 font-medium">Qty</th>
                    <th className="px-4 py-3 font-medium">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {fastMoving.map((product) => (
                    <tr key={product.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium">{product.title}</td>
                      <td className="px-4 py-3">{product.total_quantity}</td>
                      <td className="px-4 py-3">{currencyFormatter(product.total_value)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Dealer Inventory Value</h2>
        {dealerReport.length === 0 ? (
          <p className="text-slate-500">No dealer inventory data yet.</p>
        ) : (
          <div className="overflow-hidden rounded-md border">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-slate-600">
                <tr>
                  <th className="px-4 py-3 font-medium">Dealer</th>
                  <th className="px-4 py-3 font-medium">Total Stock</th>
                  <th className="px-4 py-3 font-medium">Reserved</th>
                  <th className="px-4 py-3 font-medium">Value</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {dealerReport.map((dealer) => (
                  <tr key={dealer.dealer_id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium">{dealer.dealer_name}</td>
                    <td className="px-4 py-3">{dealer.total_stock}</td>
                    <td className="px-4 py-3">{dealer.reserved_stock}</td>
                    <td className="px-4 py-3">{currencyFormatter(dealer.total_value)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ComprehensiveReportsPage />
    </div>
  )
}
