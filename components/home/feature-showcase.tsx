"use client"

import * as React from "react"
import { motion, useInView, useReducedMotion } from "framer-motion"
import Link from "next/link"
import {
  PackageCheck,
  BadgeCheck,
  Truck,
  ShieldCheck,
  LockKeyhole,
  CreditCard,
  UsersRound,
  Sparkles,
  ArrowRight,
  Smartphone,
  Battery,
  Camera,
  Cable,
  Package,
  Users,
  Award,
  Headphones,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface FeatureCardProps {
  children: React.ReactNode
  className?: string
  variant?: "light" | "dark"
  delay?: number
  reduced: boolean
}

function FeatureCard({ children, className, variant = "light", delay = 0, reduced }: FeatureCardProps) {
  const glowRef = React.useRef<HTMLDivElement>(null)

  const handleMouseMove = React.useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (reduced || !glowRef.current) return
      const rect = event.currentTarget.getBoundingClientRect()
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top
      glowRef.current.style.left = `${x}px`
      glowRef.current.style.top = `${y}px`
      glowRef.current.style.opacity = "1"
    },
    [reduced]
  )

  const handleMouseLeave = React.useCallback(() => {
    if (glowRef.current) glowRef.current.style.opacity = "0"
  }, [])

  return (
    <motion.div
      initial={reduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{
        duration: reduced ? 0 : 0.7,
        delay: reduced ? 0 : delay,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={reduced ? undefined : { y: -6, transition: { duration: 0.25, ease: "easeOut" } }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "relative overflow-hidden rounded-[1.75rem] p-6 lg:p-8 border transition-all duration-300 ease-out",
        variant === "light"
          ? "bg-white/90 border-slate-200/70 shadow-[0_8px_30px_-12px_rgba(15,23,42,0.06)] hover:border-blue-300/80 hover:shadow-[0_16px_45px_-12px_rgba(37,99,235,0.14)]"
          : "bg-slate-900/95 border-white/[0.08] shadow-[0_8px_30px_-12px_rgba(0,0,0,0.18)] hover:border-blue-400/40 hover:shadow-[0_16px_45px_-12px_rgba(37,99,235,0.18)]",
        className
      )}
    >
      {!reduced && (
        <div
          ref={glowRef}
          className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 w-44 h-44 rounded-full bg-blue-500/[0.18] blur-3xl opacity-0 transition-opacity duration-300 will-change-transform"
          style={{ left: "50%", top: "50%" }}
        />
      )}
      {children}
    </motion.div>
  )
}

interface FloatingChip {
  icon: React.ElementType
  label: string
  position: string
  delay: number
}

const floatingParts: FloatingChip[] = [
  { icon: Smartphone, label: "Display", position: "top-0 left-0", delay: 0 },
  { icon: Battery, label: "Battery", position: "top-1 right-4", delay: 0.2 },
  { icon: Camera, label: "Camera", position: "bottom-2 left-6", delay: 0.4 },
  { icon: Cable, label: "Charging", position: "bottom-0 right-0", delay: 0.6 },
]

function FloatingParts({ reduced }: { reduced: boolean }) {
  return (
    <div className="relative h-24 mt-auto w-full max-w-sm">
      {floatingParts.map((part, index) => (
        <motion.div
          key={part.label}
          initial={reduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
          className={cn("absolute", part.position)}
        >
          <motion.div
            animate={reduced ? undefined : { y: [0, -7, 0] }}
            transition={{
              duration: 3 + index * 0.3,
              repeat: Infinity,
              ease: "easeInOut",
              delay: index * 0.2,
            }}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-slate-200 shadow-sm"
          >
            <part.icon className="h-4 w-4 text-blue-600" />
            <span className="text-xs font-semibold text-slate-700">{part.label}</span>
          </motion.div>
        </motion.div>
      ))}
    </div>
  )
}

function DeliveryRoute({ reduced }: { reduced: boolean }) {
  return (
    <div className="mt-auto pt-6 w-full">
      <div className="relative h-10 w-full">
        <div className="absolute top-1/2 left-0 right-0 h-1 -translate-y-1/2 bg-blue-500/20 rounded-full" />
        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-2.5 h-2.5 bg-blue-400 rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-blue-400/70 rounded-full" />
        <div className="absolute top-1/2 right-0 -translate-y-1/2 w-2.5 h-2.5 bg-blue-400 rounded-full" />
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 bg-blue-300 rounded-full shadow-[0_0_14px_rgba(96,165,250,0.9)] z-10"
          style={{ left: reduced ? "50%" : "0%" }}
          animate={reduced ? undefined : { left: ["0%", "100%"] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: "linear" }}
        />
      </div>
      <div className="flex justify-between text-xs font-medium text-blue-200/80 mt-2">
        <span>Dealer</span>
        <span className="hidden sm:inline">Warehouse</span>
        <span>Delivery</span>
      </div>
    </div>
  )
}

function PaymentVisual({ reduced }: { reduced: boolean }) {
  return (
    <div className="mt-auto pt-6 w-full">
      <div className="relative rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 p-5 text-white shadow-lg overflow-hidden">
        <div className="absolute -top-10 -right-10 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
        <div className="relative z-10 flex items-start justify-between">
          <motion.div
            animate={reduced ? undefined : { scale: [1, 1.04, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <CreditCard className="h-8 w-8 text-blue-300" />
          </motion.div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Payment Secured</span>
          </div>
        </div>
        <div className="relative z-10 mt-5">
          <div className="text-xs text-slate-400 uppercase tracking-wider">Amount</div>
          <div className="text-3xl font-bold text-white">₹12,450</div>
        </div>
        <div className="relative z-10 mt-4 flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-300 bg-white/5 px-2 py-1 rounded-md border border-white/10">
            <LockKeyhole className="h-3 w-3" />
            Encrypted
          </span>
          <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-300 bg-white/5 px-2 py-1 rounded-md border border-white/10">
            <BadgeCheck className="h-3 w-3" />
            Verified
          </span>
          <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-300 bg-white/5 px-2 py-1 rounded-md border border-white/10">
            <ShieldCheck className="h-3 w-3" />
            Protected
          </span>
        </div>
      </div>
    </div>
  )
}

interface DealerAvatar {
  initial: string
  className: string
}

const dealerAvatars: DealerAvatar[] = [
  { initial: "M", className: "bg-blue-600" },
  { initial: "T", className: "bg-indigo-500" },
  { initial: "P", className: "bg-sky-500" },
  { initial: "R", className: "bg-slate-600" },
  { initial: "+", className: "bg-blue-400" },
]

function DealerAvatars({ reduced }: { reduced: boolean }) {
  return (
    <div className="mt-auto pt-8 flex flex-col sm:flex-row sm:items-center gap-5">
      <div className="flex -space-x-3">
        {dealerAvatars.map((dealer, index) => (
          <motion.div
            key={index}
            initial={reduced ? false : { opacity: 0, x: -12, scale: 0.8 }}
            whileInView={{ opacity: 1, x: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.4 + index * 0.08, ease: "easeOut" }}
            className={cn(
              "relative flex h-11 w-11 items-center justify-center rounded-full text-sm font-bold text-white ring-2 ring-slate-900",
              dealer.className
            )}
            style={{ zIndex: index + 1 }}
          >
            {dealer.initial}
          </motion.div>
        ))}
      </div>
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5 text-sm font-semibold text-emerald-400">
          <BadgeCheck className="h-4 w-4" />
          5,000+ Verified Dealers
        </div>
        <div className="text-xs text-slate-400">Trusted across India</div>
      </div>
    </div>
  )
}

function useCountUp(target: number, inView: boolean, reduced: boolean, duration = 1800) {
  const [time, setTime] = React.useState(1)

  React.useEffect(() => {
    if (!inView || reduced) return
    const start = performance.now()
    let raf: number

    const tick = (now: number) => {
      const elapsed = now - start
      setTime(Math.min(elapsed, duration))
      if (elapsed < duration) {
        raf = requestAnimationFrame(tick)
      }
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [inView, reduced, duration])

  if (reduced) return target
  const progress = Math.min(time / duration, 1)
  const eased = 1 - Math.pow(1 - progress, 4)
  return Number.isInteger(target)
    ? Math.round(eased * target)
    : parseFloat((eased * target).toFixed(1))
}

interface AnimatedStatProps {
  value: number
  suffix: string
  label: string
  icon: React.ElementType
  delay: number
  reduced: boolean
}

function AnimatedStat({ value, suffix, label, icon: Icon, delay, reduced }: AnimatedStatProps) {
  const ref = React.useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-50px" })
  const count = useCountUp(value, isInView, reduced)
  const display = Number.isInteger(value) ? count.toLocaleString() : count.toFixed(1)

  return (
    <motion.div
      ref={ref}
      initial={reduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: reduced ? 0 : delay * 0.1, ease: "easeOut" }}
      className="flex flex-col items-center text-center"
    >
      <Icon className="h-5 w-5 text-blue-600 mb-2" aria-hidden="true" />
      <div className="text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
        {display}{suffix}
      </div>
      <div className="mt-1 text-sm font-medium text-slate-600">{label}</div>
    </motion.div>
  )
}

const trustMetrics = [
  { value: 25, suffix: "K+", label: "Products Listed", icon: Package },
  { value: 5, suffix: "K+", label: "Verified Dealers", icon: Users },
  { value: 100, suffix: "+", label: "Brands", icon: Award },
  { value: 99.9, suffix: "%", label: "Secure Transactions", icon: ShieldCheck },
  { value: 24, suffix: "/7", label: "Marketplace Support", icon: Headphones },
]

export function FeatureShowcase() {
  const reduced = useReducedMotion() ?? false

  return (
    <section
      id="why-feenix"
      aria-label="Why thousands of dealers trust Feenix Repair"
      className="relative overflow-hidden py-20 lg:py-24 bg-gradient-to-b from-slate-50 via-blue-50/30 to-white"
    >
      {/* Subtle dot grid texture */}
      <div
        className="absolute inset-0 opacity-[0.35] bg-[radial-gradient(circle,#cbd5e1_1px,transparent_1px)] bg-[length:28px_28px]"
        aria-hidden="true"
      />

      {/* Decorative radial glows */}
      <div className="absolute -top-40 -left-20 w-[500px] h-[500px] rounded-full bg-blue-500/[0.08] blur-[120px]" aria-hidden="true" />
      <div className="absolute -bottom-40 -right-20 w-[450px] h-[450px] rounded-full bg-blue-400/[0.08] blur-[100px]" aria-hidden="true" />

      <div className="container-premium relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 lg:mb-14">
          <motion.div
            initial={reduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600/10 border border-blue-600/20 text-blue-700 text-sm font-semibold mb-5"
          >
            <motion.span
              animate={reduced ? undefined : { rotate: [0, 15, -10, 0], scale: [1, 1.15, 1, 1.15, 1] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              aria-hidden="true"
            >
              <Sparkles className="h-4 w-4" />
            </motion.span>
            WHY FEENIX REPAIR
          </motion.div>

          <motion.h2
            initial={reduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-[3.25rem] font-extrabold tracking-tight leading-[1.08] text-slate-900"
          >
            <span className="block">Why Thousands of Dealers Trust</span>
            <span className="block bg-gradient-to-br from-blue-700 via-blue-600 to-blue-500 bg-clip-text text-transparent">
              Feenix Repair
            </span>
          </motion.h2>

          <motion.p
            initial={reduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-4 text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed"
          >
            Everything you need to source, sell and manage genuine mobile spare parts — securely, quickly and at scale.
          </motion.p>
        </div>

        {/* Asymmetric Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 auto-rows-fr">
          {/* Genuine Spare Parts — Large */}
          <FeatureCard variant="light" className="lg:col-span-2 min-h-[320px]" reduced={reduced} delay={0}>
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/[0.10] rounded-full blur-[80px] -translate-y-1/4 translate-x-1/4 pointer-events-none" aria-hidden="true" />
            <div className="relative z-10 h-full flex flex-col">
              <div className="flex items-start justify-between">
                <div className="p-3 rounded-2xl bg-blue-600/10 text-blue-600 border border-blue-500/10">
                  <motion.div whileHover={{ scale: 1.1 }} transition={{ type: "spring", stiffness: 300 }}>
                    <PackageCheck className="h-7 w-7" />
                  </motion.div>
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-600/10 text-blue-700 text-xs font-semibold border border-blue-500/10">
                  <BadgeCheck className="h-3.5 w-3.5" />
                  Quality Verified
                </span>
              </div>
              <div className="mt-6">
                <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Genuine Spare Parts</h3>
                <p className="mt-2 text-slate-600 leading-relaxed max-w-md">
                  Source quality-verified components from trusted suppliers and approved dealers.
                </p>
              </div>
              <FloatingParts reduced={reduced} />
            </div>
          </FeatureCard>

          {/* Lightning Fast Delivery — Medium */}
          <FeatureCard variant="dark" className="lg:col-span-1 min-h-[300px]" reduced={reduced} delay={0.1}>
            <div className="absolute top-0 left-0 w-48 h-48 bg-blue-600/[0.15] rounded-full blur-[80px] -translate-x-1/4 -translate-y-1/4 pointer-events-none" aria-hidden="true" />
            <div className="relative z-10 h-full flex flex-col">
              <div className="flex items-start justify-between">
                <div className="p-3 rounded-2xl bg-blue-500/15 text-blue-300 border border-blue-400/20">
                  <motion.div whileHover={{ x: 8 }} transition={{ type: "spring", stiffness: 300 }}>
                    <Truck className="h-7 w-7" />
                  </motion.div>
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-200 text-xs font-semibold border border-blue-400/20">
                  Pan-India Network
                </span>
              </div>
              <div className="mt-6">
                <h3 className="text-xl font-bold text-white tracking-tight">Lightning Fast Delivery</h3>
                <p className="mt-2 text-slate-300 text-sm leading-relaxed">
                  A nationwide dealer network designed for faster sourcing and fulfilment.
                </p>
              </div>
              <DeliveryRoute reduced={reduced} />
            </div>
          </FeatureCard>

          {/* Secure Payments — Medium */}
          <FeatureCard variant="light" className="lg:col-span-1 min-h-[300px]" reduced={reduced} delay={0.2}>
            <div className="relative z-10 h-full flex flex-col">
              <div className="flex items-start justify-between">
                <div className="p-3 rounded-2xl bg-emerald-600/10 text-emerald-600 border border-emerald-500/10">
                  <motion.div
                    animate={reduced ? undefined : { scale: [1, 1.05, 1] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    whileHover={{ scale: 1.1 }}
                  >
                    <ShieldCheck className="h-7 w-7" />
                  </motion.div>
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-600/10 text-emerald-700 text-xs font-semibold border border-emerald-500/10">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Secured
                </span>
              </div>
              <div className="mt-6">
                <h3 className="text-xl font-bold text-slate-900 tracking-tight">Secure Payments</h3>
                <p className="mt-2 text-slate-600 text-sm leading-relaxed">
                  Protected transactions with secure payment processing powered by Razorpay.
                </p>
              </div>
              <PaymentVisual reduced={reduced} />
            </div>
          </FeatureCard>

          {/* Verified Dealer Network — Large */}
          <FeatureCard variant="dark" className="lg:col-span-2 min-h-[320px]" reduced={reduced} delay={0.3}>
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-600/[0.15] rounded-full blur-[80px] translate-x-1/4 translate-y-1/4 pointer-events-none" aria-hidden="true" />
            <div className="relative z-10 h-full flex flex-col">
              <div className="flex items-start justify-between">
                <div className="p-3 rounded-2xl bg-blue-500/15 text-blue-300 border border-blue-400/20">
                  <motion.div whileHover={{ scale: 1.1 }} transition={{ type: "spring", stiffness: 300 }}>
                    <UsersRound className="h-7 w-7" />
                  </motion.div>
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-200 text-xs font-semibold border border-blue-400/20">
                  <BadgeCheck className="h-3.5 w-3.5" />
                  Business Verified
                </span>
              </div>
              <div className="mt-6">
                <h3 className="text-2xl font-bold text-white tracking-tight">Verified Dealer Network</h3>
                <p className="mt-2 text-slate-300 leading-relaxed max-w-md">
                  Trade confidently with approved businesses across the Feenix Repair marketplace.
                </p>
              </div>
              <DealerAvatars reduced={reduced} />
            </div>
          </FeatureCard>
        </div>

        {/* Trust Metrics Bar */}
        <motion.div
          initial={reduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="mt-14 rounded-3xl bg-white/80 border border-slate-100 shadow-sm p-6 lg:p-8"
        >
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 lg:gap-4">
            {trustMetrics.map((metric, index) => (
              <AnimatedStat
                key={metric.label}
                value={metric.value}
                suffix={metric.suffix}
                label={metric.label}
                icon={metric.icon}
                delay={index}
                reduced={reduced}
              />
            ))}
          </div>
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={reduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="mt-12 text-center"
        >
          <h4 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6">
            Ready to grow your spare parts business?
          </h4>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/products" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto h-12 px-7 rounded-full bg-gradient-to-r from-blue-700 to-blue-500 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/35 border-0 gap-2 group/button">
                Explore Products
                <ArrowRight className="h-4 w-4 transition-transform group-hover/button:translate-x-1" />
              </Button>
            </Link>
            <Link href="/auth/register" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto h-12 px-7 rounded-full border-slate-200 hover:border-blue-200 hover:bg-blue-50/50 gap-2">
                Become a Dealer
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
