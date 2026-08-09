import { PageHeader } from "@/components/shared/page-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getLowStockAlerts } from "@/lib/inventory/data"
import { markAlertRead, deleteAlert } from "@/lib/inventory/actions"
import { dateFormatter } from "@/lib/utils"
import { Bell } from "lucide-react"

function levelColor(level: string) {
  switch (level) {
    case "CRITICAL":
      return "bg-red-100 text-red-700"
    case "LOW":
      return "bg-yellow-100 text-yellow-700"
    case "RECOMMENDED":
      return "bg-blue-100 text-blue-700"
    default:
      return "bg-slate-100 text-slate-700"
  }
}

export default async function AdminLowStockAlertsPage() {
  const { data: alerts } = await getLowStockAlerts({ limit: 100 })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Low Stock Alerts"
        description="Products approaching or below configured thresholds"
        breadcrumb={[
          { label: "Admin", href: "/admin" },
          { label: "Inventory", href: "/admin/inventory" },
          { label: "Alerts" },
        ]}
      />

      {alerts.length === 0 ? (
        <div className="rounded-md border p-8 text-center text-slate-500">
          <Bell className="mx-auto mb-2 h-8 w-8" />
          No low-stock alerts.
        </div>
      ) : (
        <div className="overflow-hidden rounded-md border">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-600">
              <tr>
                <th className="px-4 py-3 font-medium">Created</th>
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium">Level</th>
                <th className="px-4 py-3 font-medium">Current</th>
                <th className="px-4 py-3 font-medium">Threshold</th>
                <th className="px-4 py-3 font-medium">Dealer</th>
                <th className="px-4 py-3 font-medium">Warehouse</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {alerts.map((alert) => (
                <tr key={alert.id} className={alert.is_read ? "opacity-60" : ""}>
                  <td className="px-4 py-3 text-slate-600">
                    {dateFormatter(alert.created_at)}
                  </td>
                  <td className="px-4 py-3 font-medium">
                    {(alert as any).product?.title || "Unknown"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge className={levelColor(alert.alert_level)}>
                      {alert.alert_level}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{alert.current_stock}</td>
                  <td className="px-4 py-3 text-slate-600">{alert.threshold}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {(alert as any).dealer?.business_name || (alert as any).dealer?.name || "-"}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {(alert as any).warehouse?.name || "-"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {!alert.is_read && (
                        <form action={markAlertRead.bind(null, alert.id)}>
                          <Button type="submit" size="sm" variant="outline">
                            Mark read
                          </Button>
                        </form>
                      )}
                      <form action={deleteAlert.bind(null, alert.id)}>
                        <Button type="submit" size="sm" variant="ghost" className="text-red-600">
                          Delete
                        </Button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
