"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Camera, Battery, Monitor, Speaker, Zap, Cpu, Fingerprint, Smartphone, Mic, Package, Settings, Wrench, ArrowRight, LucideIcon } from "lucide-react"
import Link from "next/link"
import type { CategoryWithCount } from "@/types/website"

const categoryIconMap: Record<string, LucideIcon> = {
  camera: Camera,
  battery: Battery,
  monitor: Monitor,
  speaker: Speaker,
  zap: Zap,
  cpu: Cpu,
  fingerprint: Fingerprint,
  smartphone: Smartphone,
  mic: Mic,
  package: Package,
  settings: Settings,
  wrench: Wrench,
}

const categoryColors = [
  "from-blue-500 to-blue-600",
  "from-green-500 to-green-600",
  "from-purple-500 to-purple-600",
  "from-pink-500 to-pink-600",
  "from-orange-500 to-orange-600",
  "from-indigo-500 to-indigo-600",
  "from-red-500 to-red-600",
  "from-teal-500 to-teal-600",
  "from-cyan-500 to-cyan-600",
  "from-emerald-500 to-emerald-600",
  "from-violet-500 to-violet-600",
  "from-rose-500 to-rose-600",
]

interface CategoriesClientProps {
  categories: CategoryWithCount[]
}

export function CategoriesClient({ categories }: CategoriesClientProps) {
  if (categories.length === 0) {
    return null
  }

  return (
    <section className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold font-poppins mb-4">Popular Categories</h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Browse through our extensive collection of mobile spare parts
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {categories.map((category, index) => {
            const Icon = category.icon ? categoryIconMap[category.icon] : null
            const color = categoryColors[index % categoryColors.length]
            
            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -8 }}
              >
                <Link href={`/categories/${category.slug}`}>
                  <div className="bg-white rounded-2xl p-6 border-2 border-slate-200 hover:border-blue-600/50 transition-all duration-300 hover:shadow-xl hover:shadow-blue-600/10 group h-full">
                    {Icon ? (
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        className={`w-14 h-14 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-4 shadow-lg group-hover:shadow-xl transition-shadow`}
                      >
                        <Icon className="h-7 w-7 text-white" />
                      </motion.div>
                    ) : category.image ? (
                      <div className="w-14 h-14 rounded-xl bg-slate-100 mb-4 flex items-center justify-center overflow-hidden">
                        <img src={category.image} alt={category.name} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        className={`w-14 h-14 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-4 shadow-lg group-hover:shadow-xl transition-shadow`}
                      >
                        <Package className="h-7 w-7 text-white" />
                      </motion.div>
                    )}
                    <h3 className="font-semibold font-poppins text-lg mb-2 group-hover:text-blue-600 transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-sm text-slate-600">{category.product_count.toLocaleString()} Products</p>
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-center mt-12"
        >
          <Link href="/categories">
            <button className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors shadow-lg shadow-blue-600/25">
              View All Categories
              <ArrowRight className="h-4 w-4" />
            </button>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
