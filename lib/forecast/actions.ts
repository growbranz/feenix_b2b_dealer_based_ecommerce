"use server"

import { supabaseAdmin } from "@/lib/supabase/admin"
import { requireAdmin } from "@/lib/auth/auth.helpers"
import type { ForecastResult, InventoryRequirement, LowStockPrediction } from "@/types/forecast"

const db = supabaseAdmin as any

function isInRange(iso: string, from?: string, to?: string) {
  const d = new Date(iso)
  if (from && d < new Date(from)) return false
  if (to && d > new Date(to)) return false
  return true
}

function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
}

function linearRegression(values: number[]) {
  const n = values.length
  if (n === 0) return { slope: 0, intercept: 0 }
  const x = Array.from({ length: n }, (_, i) => i)
  const sumX = x.reduce((a, b) => a + b, 0)
  const sumY = values.reduce((a, b) => a + b, 0)
  const sumXY = x.reduce((acc, xi, i) => acc + xi * values[i], 0)
  const sumXX = x.reduce((acc, xi) => acc + xi * xi, 0)
  const denom = n * sumXX - sumX * sumX
  if (denom === 0) return { slope: 0, intercept: sumY / n }
  const slope = (n * sumXY - sumX * sumY) / denom
  const intercept = (sumY - slope * sumX) / n
  return { slope, intercept }
}

export async function forecastRevenue(filters: { from?: string; to?: string; months?: number } = {}): Promise<ForecastResult> {
  await requireAdmin()
  const { data, error } = await db.from("payments").select("amount, created_at").in("status", ["CAPTURED", "PAID"])
  if (error) throw error

  const months = (data || [])
    .filter((p: any) => isInRange(p.created_at, filters.from, filters.to))
    .reduce((acc: Record<string, number>, p: any) => {
      const key = monthKey(new Date(p.created_at))
      acc[key] = (acc[key] || 0) + Number(p.amount || 0)
      return acc
    }, {})

  const sortedKeys = Object.keys(months).sort()
  const values = sortedKeys.map((k) => months[k])
  const { slope, intercept } = linearRegression(values)
  const nextIndex = values.length
  const nextValue = Math.max(0, intercept + slope * nextIndex)

  const forecast = sortedKeys.map((k, i) => ({
    label: k,
    actual: values[i],
    predicted: Math.max(0, intercept + slope * i),
    lower: Math.max(0, intercept + slope * i - nextValue * 0.1),
    upper: intercept + slope * i + nextValue * 0.1,
  }))

  const lastActual = values[values.length - 1] || 0
  const growthRate = lastActual > 0 ? ((nextValue - lastActual) / lastActual) * 100 : 0

  return {
    forecast,
    nextPeriodValue: nextValue,
    growthRate: Number(growthRate.toFixed(2)),
    confidenceInterval: { lower: nextValue * 0.9, upper: nextValue * 1.1 },
  }
}

export async function forecastSales(filters: { from?: string; to?: string } = {}): Promise<ForecastResult> {
  await requireAdmin()
  const { data, error } = await db.from("orders").select("created_at")
  if (error) throw error

  const months = (data || [])
    .filter((o: any) => isInRange(o.created_at, filters.from, filters.to))
    .reduce((acc: Record<string, number>, o: any) => {
      const key = monthKey(new Date(o.created_at))
      acc[key] = (acc[key] || 0) + 1
      return acc
    }, {})

  const sortedKeys = Object.keys(months).sort()
  const values = sortedKeys.map((k) => months[k])
  const { slope, intercept } = linearRegression(values)
  const nextIndex = values.length
  const nextValue = Math.max(0, intercept + slope * nextIndex)
  const forecast = sortedKeys.map((k, i) => ({
    label: k,
    actual: values[i],
    predicted: Math.max(0, intercept + slope * i),
    lower: Math.max(0, intercept + slope * i - nextValue * 0.1),
    upper: intercept + slope * i + nextValue * 0.1,
  }))
  const lastActual = values[values.length - 1] || 0
  const growthRate = lastActual > 0 ? ((nextValue - lastActual) / lastActual) * 100 : 0

  return {
    forecast,
    nextPeriodValue: nextValue,
    growthRate: Number(growthRate.toFixed(2)),
    confidenceInterval: { lower: nextValue * 0.9, upper: nextValue * 1.1 },
  }
}

export async function predictInventoryRequirements(filters: { from?: string; to?: string } = {}): Promise<InventoryRequirement[]> {
  await requireAdmin()
  const [{ data: inventory }, { data: products }] = await Promise.all([
    db.from("inventory").select("*"),
    db.from("products").select("id, title"),
  ])
  const productMap = Object.fromEntries((products || []).map((p: any) => [p.id, p.title]))

  let orderItems: any[] = []
  try {
    const { data } = await db.from("order_items").select("*")
    orderItems = data || []
  } catch (e) {}

  const fromDate = filters.from ? new Date(filters.from) : new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
  const toDate = filters.to ? new Date(filters.to) : new Date()
  const days = Math.max(1, (toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24))

  const demandByProduct: Record<string, number> = {}
  for (const item of orderItems) {
    if (isInRange(item.created_at, filters.from, filters.to)) {
      demandByProduct[item.product_id] = (demandByProduct[item.product_id] || 0) + Number(item.quantity || 1)
    }
  }

  const result: InventoryRequirement[] = []
  for (const inv of inventory || []) {
    const demand = demandByProduct[inv.product_id] || 0
    const daily = demand / days
    const predicted30 = daily * 30
    const available = inv.available_stock || 0
    const low = inv.low_stock_limit || 5
    const suggested = Math.max(0, Math.ceil(predicted30 - available + low))
    result.push({
      productId: inv.product_id,
      productName: productMap[inv.product_id] || inv.product_id,
      predictedDemand: Number(predicted30.toFixed(2)),
      currentStock: available,
      suggestedReorder: suggested,
    })
  }
  return result.sort((a, b) => b.suggestedReorder - a.suggestedReorder).slice(0, 50)
}

export async function predictLowStock(filters: { from?: string; to?: string } = {}): Promise<LowStockPrediction[]> {
  await requireAdmin()
  const [{ data: inventory }, { data: products }] = await Promise.all([
    db.from("inventory").select("*"),
    db.from("products").select("id, title"),
  ])
  const productMap = Object.fromEntries((products || []).map((p: any) => [p.id, p.title]))

  let orderItems: any[] = []
  try {
    const { data } = await db.from("order_items").select("*")
    orderItems = data || []
  } catch (e) {}

  const fromDate = filters.from ? new Date(filters.from) : new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
  const toDate = filters.to ? new Date(filters.to) : new Date()
  const days = Math.max(1, (toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24))

  const demandByProduct: Record<string, number> = {}
  for (const item of orderItems) {
    if (isInRange(item.created_at, filters.from, filters.to)) {
      demandByProduct[item.product_id] = (demandByProduct[item.product_id] || 0) + Number(item.quantity || 1)
    }
  }

  const result: LowStockPrediction[] = []
  for (const inv of inventory || []) {
    const available = inv.available_stock || 0
    if (available <= 0) continue
    const demand = demandByProduct[inv.product_id] || 0
    const daily = demand / days
    if (daily <= 0) continue
    const daysUntil = available / daily
    if (daysUntil > 60) continue
    result.push({
      productId: inv.product_id,
      productName: productMap[inv.product_id] || inv.product_id,
      daysUntilStockout: Number(daysUntil.toFixed(1)),
      confidence: 0.7,
    })
  }
  return result.sort((a, b) => a.daysUntilStockout - b.daysUntilStockout)
}

export async function seasonalDemand(filters: { years?: number } = {}): Promise<ForecastResult> {
  await requireAdmin()
  const { data, error } = await db.from("payments").select("amount, created_at").in("status", ["CAPTURED", "PAID"])
  if (error) throw error

  const since = new Date()
  since.setFullYear(since.getFullYear() - (filters.years || 2))
  const monthly: Record<number, number[]> = {}
  for (const p of data || []) {
    const d = new Date(p.created_at)
    if (d < since) continue
    const m = d.getMonth()
    monthly[m] = monthly[m] || []
    monthly[m].push(Number(p.amount || 0))
  }

  const labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  const forecast = Array.from({ length: 12 }, (_, i) => ({
    label: labels[i],
    actual: monthly[i]?.length ? monthly[i].reduce((a: number, b: number) => a + b, 0) / monthly[i].length : 0,
    predicted: monthly[i]?.length ? monthly[i].reduce((a: number, b: number) => a + b, 0) / monthly[i].length : 0,
  }))

  const values = forecast.map((f) => f.predicted)
  const { slope, intercept } = linearRegression(values)
  const next = Math.max(0, intercept + slope * 12)
  return { forecast, nextPeriodValue: next, growthRate: 0 }
}
