import { PageHeader } from "@/components/shared/page-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getInventoryTransfers } from "@/lib/inventory/data"
import { approveTransfer, rejectTransfer } from "@/lib/inventory/actions"
import { dateFormatter } from "@/lib/utils"
import { Package } from "lucide-react"

function statusColor(status: string) {
  switch (status) {
    case "PENDING":
      return "bg-yellow-100 text-yellow-700"
    case "APPROVED":
    case "COMPLETED":
      return "bg-green-100 text-green-700"
    case "REJECTED":
    case "CANCELLED":
      return "bg-red-100 text-red-700"
    case "IN_TRANSIT":
      return "bg-blue-100 text-blue-700"
    default:
      return "bg-slate-100 text-slate-700"
  }
}

export default async function AdminInventoryTransfersPage() {
  const { data: transfers } = await getInventoryTransfers({ limit: 50 })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventory Transfers"
        description="Approve or reject dealer/warehouse stock transfers"
        breadcrumb={[
          { label: "Admin", href: "/admin" },
          { label: "Inventory", href: "/admin/inventory" },
          { label: "Transfers" },
        ]}
      />

      {transfers.length === 0 ? (
        <div className="rounded-md border p-8 text-center text-slate-500">
          <Package className="mx-auto mb-2 h-8 w-8" />
          No transfers found.
        </div>
      ) : (
        <div className="overflow-hidden rounded-md border">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-600">
              <tr>
                <th className="px-4 py-3 font-medium">Created</th>
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium">From</th>
                <th className="px-4 py-3 font-medium">To</th>
                <th className="px-4 py-3 font-medium">Qty</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {transfers.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-slate-600">
                    {dateFormatter(t.created_at)}
                  </td>
                  <td className="px-4 py-3 font-medium">
                    {(t as any).product?.title || "Unknown"}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {(t as any).from_dealer?.business_name ||
                      (t as any).from_warehouse?.name ||
                      "-"}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {(t as any).to_dealer?.business_name ||
                      (t as any).to_warehouse?.name ||
                      "-"}
                  </td>
                  <td className="px-4 py-3 font-medium">{t.quantity}</td>
                  <td className="px-4 py-3">
                    <Badge className={statusColor(t.status)}>{t.status}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    {t.status === "PENDING" && (
                      <div className="flex items-center gap-2">
                        <form action={approveTransfer.bind(null, t.id)}>
                          <Button type="submit" size="sm" variant="outline">
                            Approve
                          </Button>
                        </form>
                        <form action={rejectTransfer.bind(null, t.id)}>
                          <Button type="submit" size="sm" variant="ghost" className="text-red-600">
                            Reject
                          </Button>
                        </form>
                      </div>
                    )}
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
