"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  forecastRevenue,
  forecastSales,
  predictInventoryRequirements,
  predictLowStock,
  seasonalDemand,
} from "@/lib/forecast/actions"
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

const forecastTypes = [
  { key: "revenue", label: "Revenue Forecast" },
  { key: "sales", label: "Sales Forecast" },
  { key: "inventory", label: "Inventory Requirements" },
  { key: "low-stock", label: "Low Stock Prediction" },
  { key: "seasonal", label: "Seasonal Demand" },
] as const

export function ForecastDashboard() {
  const [type, setType] = React.useState<typeof forecastTypes[number]["key"]>("revenue")
  const [from, setFrom] = React.useState("")
  const [to, setTo] = React.useState("")
  const [data, setData] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(false)

  async function load() {
    setLoading(true)
    try {
      const filters: any = {}
      if (from) filters.from = from
      if (to) filters.to = to
      let result: any
      switch (type) {
        case "revenue":
          result = await forecastRevenue(filters)
          break
        case "sales":
          result = await forecastSales(filters)
          break
        case "inventory":
          result = await predictInventoryRequirements(filters)
          break
        case "low-stock":
          result = await predictLowStock(filters)
          break
        case "seasonal":
          result = await seasonalDemand(filters)
          break
      }
      setData(result)
    } catch (e: any) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    load()
  }, [type])

  const current = forecastTypes.find((t) => t.key === type)

  return (
    <div className="space-y-6">
      <div className="rounded-xl border bg-white p-4 shadow-sm dark:bg-slate-900">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="mb-1 block text-xs text-slate-500">Forecast</label>
            <select
              className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-900"
              value={type}
              onChange={(e) => setType(e.target.value as any)}
            >
              {forecastTypes.map((t) => (
                <option key={t.key} value={t.key}>{t.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-slate-500">From</label>
            <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div>
            <label className="mb-1 block text-xs text-slate-500">To</label>
            <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
          <div className="flex items-end">
            <Button onClick={load} disabled={loading} className="w-full">
              {loading ? "Loading..." : "Run Forecast"}
            </Button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : data ? (
        <div className="space-y-4">
          {(type === "revenue" || type === "sales" || type === "seasonal") && (
            <>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-lg border p-4">
                  <p className="text-xs text-slate-500">Next Period Forecast</p>
                  <p className="text-xl font-bold">₹{Math.round(data.nextPeriodValue || 0).toLocaleString("en-IN")}</p>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-xs text-slate-500">Growth Rate</p>
                  <p className="text-xl font-bold">{data.growthRate}%</p>
                </div>
                {data.confidenceInterval && (
                  <div className="rounded-lg border p-4">
                    <p className="text-xs text-slate-500">Confidence Range</p>
                    <p className="text-xl font-bold">₹{Math.round(data.confidenceInterval.lower).toLocaleString("en-IN")} - ₹{Math.round(data.confidenceInterval.upper).toLocaleString("en-IN")}</p>
                  </div>
                )}
              </div>
              <div className="rounded-xl border bg-white p-4 shadow-sm dark:bg-slate-900">
                <h3 className="mb-4 text-sm font-semibold">{current?.label}</h3>
                <ResponsiveContainer width="100%" height={300}>
                  {type === "seasonal" ? (
                    <BarChart data={data.forecast}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Bar dataKey="predicted" fill="#f97316" />
                    </BarChart>
                  ) : (
                    <AreaChart data={data.forecast}>
                      <defs>
                        <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Area type="monotone" dataKey="actual" stroke="#3b82f6" fillOpacity={0} strokeWidth={2} />
                      <Area type="monotone" dataKey="predicted" stroke="#f97316" fill="url(#colorForecast)" />
                    </AreaChart>
                  )}
                </ResponsiveContainer>
              </div>
            </>
          )}

          {(type === "inventory" || type === "low-stock") && (
            <div className="overflow-x-auto rounded-xl border bg-white dark:bg-slate-900">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800">
                  <tr>
                    {type === "inventory" ? (
                      <><th className="px-4 py-3">Product</th><th className="px-4 py-3">Predicted 30d Demand</th><th className="px-4 py-3">Current Stock</th><th className="px-4 py-3">Suggested Reorder</th></>
                    ) : (
                      <><th className="px-4 py-3">Product</th><th className="px-4 py-3">Days Until Stockout</th><th className="px-4 py-3">Confidence</th></>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {data.slice(0, 100).map((row: any, idx: number) => (
                    <tr key={idx} className="border-t">
                      {type === "inventory" ? (
                        <>
                          <td className="px-4 py-3">{row.productName}</td>
                          <td className="px-4 py-3">{row.predictedDemand}</td>
                          <td className="px-4 py-3">{row.currentStock}</td>
                          <td className="px-4 py-3">{row.suggestedReorder}</td>
                        </>
                      ) : (
                        <>
                          <td className="px-4 py-3">{row.productName}</td>
                          <td className="px-4 py-3">{row.daysUntilStockout}</td>
                          <td className="px-4 py-3">{Math.round((row.confidence || 0) * 100)}%</td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <p className="text-center text-slate-500">No forecast data.</p>
      )}
    </div>
  )
}
