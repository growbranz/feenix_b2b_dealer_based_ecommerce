"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Camera, Battery, Monitor, Speaker, Zap, Cpu, Fingerprint, Smartphone, Mic, ArrowRight } from "lucide-react"
import Link from "next/link"

const categories = [
  { icon: Camera, name: "Camera", count: "12,500+", href: "/categories/camera", color: "from-blue-500 to-blue-600" },
  { icon: Battery, name: "Battery", count: "15,800+", href: "/categories/battery", color: "from-green-500 to-green-600" },
  { icon: Monitor, name: "Display", count: "18,200+", href: "/categories/display", color: "from-purple-500 to-purple-600" },
  { icon: Speaker, name: "Speaker", count: "8,900+", href: "/categories/speaker", color: "from-pink-500 to-pink-600" },
  { icon: Zap, name: "Charging Port", count: "11,300+", href: "/categories/charging-port", color: "from-orange-500 to-orange-600" },
  { icon: Cpu, name: "Motherboard", count: "7,600+", href: "/categories/motherboard", color: "from-indigo-500 to-indigo-600" },
  { icon: Fingerprint, name: "Fingerprint", count: "5,400+", href: "/categories/fingerprint", color: "from-red-500 to-red-600" },
  { icon: Smartphone, name: "Back Panel", count: "9,100+", href: "/categories/back-panel", color: "from-teal-500 to-teal-600" },
  { icon: Mic, name: "Microphone", count: "4,200+", href: "/categories/microphone", color: "from-cyan-500 to-cyan-600" },
]

export function Categories() {
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
          {categories.map((category, index) => (
            <motion.div
              key={category.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -8 }}
            >
              <Link href={category.href}>
                <div className="bg-white rounded-2xl p-6 border-2 border-slate-200 hover:border-blue-600/50 transition-all duration-300 hover:shadow-xl hover:shadow-blue-600/10 group h-full">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className={`w-14 h-14 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center mb-4 shadow-lg group-hover:shadow-xl transition-shadow`}
                  >
                    <category.icon className="h-7 w-7 text-white" />
                  </motion.div>
                  <h3 className="font-semibold font-poppins text-lg mb-2 group-hover:text-blue-600 transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-sm text-slate-600">{category.count} Products</p>
                </div>
              </Link>
            </motion.div>
          ))}
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
