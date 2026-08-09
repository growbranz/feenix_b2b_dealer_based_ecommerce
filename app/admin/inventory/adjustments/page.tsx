import { PageHeader } from "@/components/shared/page-header"
import { Badge } from "@/components/ui/badge"
import { getInventoryLedger } from "@/lib/inventory/data"
import { dateFormatter } from "@/lib/utils"
import { SlidersHorizontal } from "lucide-react"

export default async function AdminInventoryAdjustmentsPage() {
  const { data: ledger } = await getInventoryLedger({
    movementType: "ADJUSTMENT",
    limit: 50,
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Stock Adjustments"
        description="Manual and system stock corrections"
        breadcrumb={[
          { label: "Admin", href: "/admin" },
          { label: "Inventory", href: "/admin/inventory" },
          { label: "Adjustments" },
        ]}
      />

      {ledger.length === 0 ? (
        <div className="rounded-md border p-8 text-center text-slate-500">
          <SlidersHorizontal className="mx-auto mb-2 h-8 w-8" />
          No adjustments found.
        </div>
      ) : (
        <div className="overflow-hidden rounded-md border">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-600">
              <tr>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Product</th>
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
                  <td className="px-4 py-3 text-slate-600">{entry.previous_quantity}</td>
                  <td className="px-4 py-3 text-slate-600">{entry.updated_quantity}</td>
                  <td className="px-4 py-3 text-slate-600 max-w-sm truncate">
                    {entry.reason || "-"}
                  </td>
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
