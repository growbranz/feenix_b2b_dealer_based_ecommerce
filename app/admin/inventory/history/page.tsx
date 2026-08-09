import { PageHeader } from "@/components/shared/page-header"
import { Badge } from "@/components/ui/badge"
import { getInventoryLedger } from "@/lib/inventory/data"
import { dateFormatter } from "@/lib/utils"
import { Package } from "lucide-react"

function movementColor(type: string) {
  switch (type) {
    case "SALE":
      return "bg-green-100 text-green-700"
    case "RESERVATION":
      return "bg-blue-100 text-blue-700"
    case "RELEASE":
      return "bg-amber-100 text-amber-700"
    case "TRANSFER":
      return "bg-purple-100 text-purple-700"
    case "ADJUSTMENT":
      return "bg-slate-100 text-slate-700"
    default:
      return "bg-gray-100 text-gray-700"
  }
}

export default async function AdminInventoryHistoryPage() {
  const { data: ledger } = await getInventoryLedger({ limit: 50 })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventory History"
        description="Immutable ledger of all stock movements"
        breadcrumb={[
          { label: "Admin", href: "/admin" },
          { label: "Inventory", href: "/admin/inventory" },
          { label: "History" },
        ]}
      />

      {ledger.length === 0 ? (
        <div className="rounded-md border p-8 text-center text-slate-500">
          <Package className="mx-auto mb-2 h-8 w-8" />
          No ledger entries yet.
        </div>
      ) : (
        <div className="overflow-hidden rounded-md border">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-600">
              <tr>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium">Movement</th>
                <th className="px-4 py-3 font-medium">Previous</th>
                <th className="px-4 py-3 font-medium">Updated</th>
                <th className="px-4 py-3 font-medium">Reason</th>
                <th className="px-4 py-3 font-medium">By</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {ledger.map((entry) => (
                <tr key={entry.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-slate-600">
                    {dateFormatter(entry.created_at)}
                  </td>
                  <td className="px-4 py-3 font-medium">
                    {(entry as any).product?.title || "Unknown"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge className={movementColor(entry.movement_type)}>
                      {entry.movement_type}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{entry.previous_quantity}</td>
                  <td className="px-4 py-3 text-slate-600">{entry.updated_quantity}</td>
                  <td className="px-4 py-3 text-slate-600 max-w-xs truncate">{entry.reason || "-"}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {(entry as any).user?.name || "System"}
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
