"use client"

import * as React from "react"
import { motion, useInView } from "framer-motion"
import { Package, Users, Award, ThumbsUp, Headphones } from "lucide-react"

interface StatItemProps {
  value: string
  label: string
  icon: React.ElementType
  suffix?: string
  prefix?: string
}

function useCountUp(target: number, duration: number = 2000) {
  const [count, setCount] = React.useState(0)
  const ref = React.useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true })
  const hasAnimated = React.useRef(false)

  React.useEffect(() => {
    if (!isInView || hasAnimated.current) return
    hasAnimated.current = true

    const start = performance.now()
    const animate = (now: number) => {
      const progress = Math.min((now - start) / duration, 1)
      // easeOutQuart
      const eased = 1 - Math.pow(1 - progress, 4)
      setCount(Math.round(eased * target * 10) / 10)
      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }
    requestAnimationFrame(animate)
  }, [isInView, target, duration])

  return { count, ref }
}

function StatItem({ value, label, icon: Icon, suffix = "", prefix = "" }: StatItemProps) {
  const numeric = parseFloat(value.replace(/[^0-9.]/g, ""))
  const isDecimal = value.includes(".")
  const { count, ref } = useCountUp(numeric)
  const display = count.toLocaleString(undefined, {
    minimumFractionDigits: isDecimal ? 1 : 0,
    maximumFractionDigits: isDecimal ? 1 : 0,
  })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center text-center p-8 rounded-3xl bg-white border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all"
    >
      <div className="p-4 rounded-2xl bg-blue-50 text-blue-600 mb-4">
        <Icon className="h-7 w-7" />
      </div>
      <div className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
        {prefix}{display}{suffix}
      </div>
      <div className="mt-2 text-sm font-medium text-slate-600">{label}</div>
    </motion.div>
  )
}

const stats = [
  { value: "25000", label: "Products", icon: Package, suffix: "+" },
  { value: "5000", label: "Verified Dealers", icon: Users, suffix: "+" },
  { value: "100", label: "Brands", icon: Award, suffix: "+" },
  { value: "99.9", label: "Customer Satisfaction", icon: ThumbsUp, suffix: "%" },
  { value: "24", label: "Support", icon: Headphones, suffix: "/7" },
]

export function StatsBar() {
  return (
    <section className="py-16 lg:py-24 bg-slate-50/80">
      <div className="container-premium">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-6">
          {stats.map((stat, index) => (
            <StatItem key={stat.label} {...stat} />
          ))}
        </div>
      </div>
    </section>
  )
}
