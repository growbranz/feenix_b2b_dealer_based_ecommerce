import { DashboardCard } from "@/components/shared/dashboard-card"
import { Users, Package, ShoppingCart, DollarSign, Clock, CreditCard, Warehouse, TrendingUp } from "lucide-react"

export default function AdminPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="mt-2 text-muted-foreground">Welcome to the admin dashboard</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          title="Total Dealers"
          value="156"
          description="Active dealers on platform"
          icon={Users}
          trend={{ value: 12, isPositive: true }}
        />
        <DashboardCard
          title="Total Products"
          value="2,847"
          description="Products listed"
          icon={Package}
          trend={{ value: 8, isPositive: true }}
        />
        <DashboardCard
          title="Total Orders"
          value="1,234"
          description="Orders processed"
          icon={ShoppingCart}
          trend={{ value: 15, isPositive: true }}
        />
        <DashboardCard
          title="Revenue"
          value="$45,678"
          description="Total revenue"
          icon={DollarSign}
          trend={{ value: 22, isPositive: true }}
        />
        <DashboardCard
          title="Pending Orders"
          value="45"
          description="Orders awaiting processing"
          icon={Clock}
          trend={{ value: 5, isPositive: false }}
        />
        <DashboardCard
          title="Pending Payments"
          value="23"
          description="Payments pending"
          icon={CreditCard}
          trend={{ value: 3, isPositive: false }}
        />
        <DashboardCard
          title="Inventory"
          value="8,542"
          description="Items in stock"
          icon={Warehouse}
          trend={{ value: 10, isPositive: true }}
        />
        <DashboardCard
          title="Today's Sales"
          value="$3,456"
          description="Sales today"
          icon={TrendingUp}
          trend={{ value: 18, isPositive: true }}
        />
      </div>
    </div>
  )
}
