"use client"

import { motion } from "framer-motion"
import { Wrench, Settings, Truck, Package, ShieldCheck, Zap, Cpu, CheckCircle2 } from "lucide-react"
import { ReactNode } from "react"

const floatingIcons = [
  { Icon: Wrench, top: "8%", left: "10%", delay: 0, color: "bg-blue-500" },
  { Icon: Settings, top: "18%", right: "15%", delay: 0.2, color: "bg-slate-700" },
  { Icon: Truck, top: "62%", left: "6%", delay: 0.4, color: "bg-blue-600" },
  { Icon: Package, top: "78%", right: "10%", delay: 0.6, color: "bg-sky-500" },
  { Icon: ShieldCheck, top: "45%", left: "14%", delay: 0.8, color: "bg-emerald-500" },
  { Icon: Zap, top: "55%", right: "6%", delay: 1.0, color: "bg-amber-500" },
  { Icon: Cpu, top: "32%", right: "22%", delay: 1.2, color: "bg-violet-500" },
]

const stats = [
  { label: "25,000+", sub: "Products" },
  { label: "5,000+", sub: "Dealers" },
  { label: "99.9%", sub: "Uptime" },
  { label: "24/7", sub: "Support" },
]

const trustBadges = ["Secure Payments", "Verified Dealers", "Fast Response"]

export function AuthHero({ children }: { children: ReactNode }) {
  return (
    <div className="relative hidden lg:flex lg:w-[45%] xl:w-[42%] flex-col justify-between overflow-hidden bg-slate-900 p-10 xl:p-14 text-white">
      {/* Animated gradient mesh */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-[120%] h-[120%] rounded-full bg-gradient-radial from-blue-600/25 via-slate-900/0 to-transparent blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[80%] h-[80%] rounded-full bg-gradient-radial from-sky-500/15 via-slate-900/0 to-transparent blur-3xl" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-blue-500/10 blur-[100px]" />
      </div>

      {/* Floating icons */}
      {floatingIcons.map(({ Icon, top, left, right, delay, color }, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, scale: 0.6, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.3 + delay, duration: 0.7 }}
          style={{ top, left, right }}
          className="absolute"
        >
          <motion.div
            animate={{ y: [0, -12, 0], rotate: [0, 4, -4, 0] }}
            transition={{ duration: 5 + idx, repeat: Infinity, ease: "easeInOut" }}
            className={`${color} p-3 rounded-2xl shadow-lg shadow-black/20 bg-opacity-10 backdrop-blur-md border border-white/10`}
          >
            <Icon className="h-6 w-6 text-white" />
          </motion.div>
        </motion.div>
      ))}

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.2) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-2 text-2xl font-extrabold tracking-tight"
        >
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-sky-400 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <Zap className="h-5 w-5 text-white" />
          </div>
          Feenix Repair
        </motion.div>
      </div>

      <div className="relative z-10 my-auto max-w-md">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-4xl xl:text-5xl font-extrabold leading-[1.1] tracking-tight mb-6"
        >
          Powering the Future of{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-sky-200">
            B2B Repair Commerce
          </span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.35 }}
          className="text-lg text-slate-300 leading-relaxed mb-8"
        >
          Join India&apos;s largest marketplace for genuine mobile spare parts, repair tools, and verified dealer networks.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="grid grid-cols-2 gap-4"
        >
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl bg-white/5 border border-white/10 p-4 backdrop-blur-md"
            >
              <div className="text-2xl font-bold text-white">{stat.label}</div>
              <div className="text-sm text-slate-400">{stat.sub}</div>
            </div>
          ))}
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.65 }}
        className="relative z-10 flex flex-wrap items-center gap-3"
      >
        {trustBadges.map((badge) => (
          <div key={badge} className="flex items-center gap-1.5 text-xs text-slate-300">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            {badge}
          </div>
        ))}
      </motion.div>

      <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-slate-900 to-transparent pointer-events-none" />
    </div>
  )
}

export function AuthSplitLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex bg-slate-50">
      <AuthHero children={undefined} />
      <main className="flex-1 lg:w-[55%] xl:w-[58%] flex items-center justify-center p-6 sm:p-10 relative">
        {children}
      </main>
    </div>
  )
}
