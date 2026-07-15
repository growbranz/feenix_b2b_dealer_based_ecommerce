import { DashboardCard } from "@/components/shared/dashboard-card"
import { Package, ShoppingCart, TrendingUp, ShoppingBag, DollarSign, Clock, AlertTriangle, Warehouse } from "lucide-react"

export default function DealerPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="mt-2 text-muted-foreground">Welcome to your dealer dashboard</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          title="My Products"
          value="142"
          description="Products listed by you"
          icon={Package}
          trend={{ value: 8, isPositive: true }}
        />
        <DashboardCard
          title="Orders"
          value="89"
          description="Orders received"
          icon={ShoppingCart}
          trend={{ value: 12, isPositive: true }}
        />
        <DashboardCard
          title="Sales"
          value="$12,345"
          description="Total sales revenue"
          icon={TrendingUp}
          trend={{ value: 15, isPositive: true }}
        />
        <DashboardCard
          title="Purchases"
          value="34"
          description="Purchases made"
          icon={ShoppingBag}
          trend={{ value: 5, isPositive: true }}
        />
        <DashboardCard
          title="Revenue"
          value="$8,234"
          description="Net revenue"
          icon={DollarSign}
          trend={{ value: 18, isPositive: true }}
        />
        <DashboardCard
          title="Pending Orders"
          value="12"
          description="Orders pending"
          icon={Clock}
          trend={{ value: 3, isPositive: false }}
        />
        <DashboardCard
          title="Low Stock"
          value="8"
          description="Products low on stock"
          icon={AlertTriangle}
          trend={{ value: 2, isPositive: false }}
        />
        <DashboardCard
          title="Inventory"
          value="1,245"
          description="Items in inventory"
          icon={Warehouse}
          trend={{ value: 10, isPositive: true }}
        />
      </div>
    </div>
  )
}
