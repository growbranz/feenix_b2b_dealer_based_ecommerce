"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { ShieldCheck, Award, MessageSquare, Lock, Package, Truck } from "lucide-react"

const features = [
  { icon: ShieldCheck, title: "Verified Dealers", description: "All dealers are thoroughly verified to ensure trust and quality in every transaction", color: "from-blue-500 to-blue-600" },
  { icon: Award, title: "Quality Products", description: "Every part is inspected and certified to meet the highest quality standards", color: "from-green-500 to-green-600" },
  { icon: MessageSquare, title: "Realtime Enquiries", description: "Send enquiries and get instant responses from dealers across India", color: "from-purple-500 to-purple-600" },
  { icon: Lock, title: "Secure Payments", description: "Advanced encryption and secure payment gateways for safe transactions", color: "from-orange-500 to-orange-600" },
  { icon: Package, title: "Inventory Management", description: "Easy-to-use tools to manage your inventory and track orders efficiently", color: "from-pink-500 to-pink-600" },
  { icon: Truck, title: "Fast Delivery", description: "Reliable logistics partners ensure quick and safe delivery across India", color: "from-indigo-500 to-indigo-600" },
]

export function WhyChooseUs() {
  return (
    <section className="py-24 bg-gradient-to-b from-white to-slate-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold font-poppins mb-4">Why Choose Feenix Repair?</h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Experience the difference with our premium B2B marketplace features
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -8 }}
            >
              <div className="bg-white rounded-2xl p-8 border-2 border-slate-200 hover:border-blue-600/50 transition-all duration-300 hover:shadow-xl hover:shadow-blue-600/10 group h-full">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 shadow-lg group-hover:shadow-xl transition-shadow`}
                >
                  <feature.icon className="h-8 w-8 text-white" />
                </motion.div>
                <h3 className="font-semibold font-poppins text-xl mb-3 group-hover:text-blue-600 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
