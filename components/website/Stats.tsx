"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Users, Package, ShoppingCart, Heart, HeadphonesIcon, TrendingUp } from "lucide-react"

const stats = [
  { icon: Users, value: "5000+", label: "Verified Dealers", color: "from-blue-500 to-blue-600" },
  { icon: Package, value: "100K+", label: "Products Listed", color: "from-green-500 to-green-600" },
  { icon: ShoppingCart, value: "50K+", label: "Orders Completed", color: "from-purple-500 to-purple-600" },
  { icon: Heart, value: "99%", label: "Happy Dealers", color: "from-pink-500 to-pink-600" },
  { icon: HeadphonesIcon, value: "24x7", label: "Support Available", color: "from-orange-500 to-orange-600" },
  { icon: TrendingUp, value: "200%", label: "Growth Rate", color: "from-indigo-500 to-indigo-600" },
]

export function Stats() {
  return (
    <section className="py-20 bg-gradient-to-b from-white to-slate-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold font-poppins mb-4">Our Impact in Numbers</h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Trusted by thousands of dealers across India, we're transforming the mobile spare parts industry
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -8 }}
            >
              <div className="bg-white rounded-2xl p-8 border-2 border-slate-200 hover:border-blue-600/50 transition-all duration-300 hover:shadow-xl hover:shadow-blue-600/10 group">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-6 shadow-lg group-hover:shadow-xl transition-shadow`}
                >
                  <stat.icon className="h-8 w-8 text-white" />
                </motion.div>
                <div className="text-4xl font-bold font-poppins bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="text-slate-600 font-medium">{stat.label}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
