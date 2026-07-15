"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Upload, Search, MessageSquare, UserCheck, CheckCircle, CreditCard, Truck, ArrowDown } from "lucide-react"

const steps = [
  { icon: Upload, title: "Dealer Uploads Product", description: "Verified dealers list their mobile spare parts with detailed information", color: "from-blue-500 to-blue-600" },
  { icon: Search, title: "Other Dealer Searches", description: "Dealers search and browse through available products on the platform", color: "from-green-500 to-green-600" },
  { icon: MessageSquare, title: "Send Enquiry", description: "Interested dealers send enquiries for products they want to purchase", color: "from-purple-500 to-purple-600" },
  { icon: UserCheck, title: "Admin Assigns Enquiry", description: "Our admin team verifies and assigns the enquiry to the appropriate dealer", color: "from-orange-500 to-orange-600" },
  { icon: CheckCircle, title: "Order Confirmed", description: "Order is confirmed and both parties are notified with all details", color: "from-pink-500 to-pink-600" },
  { icon: CreditCard, title: "Payment Processed", description: "Secure payment is processed through our trusted payment gateway", color: "from-indigo-500 to-indigo-600" },
  { icon: Truck, title: "Fast Delivery", description: "Products are shipped quickly through our logistics partners", color: "from-red-500 to-red-600" },
]

export function HowItWorks() {
  return (
    <section className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold font-poppins mb-4">How It Works</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Simple and straightforward process to buy and sell mobile spare parts
          </p>
        </motion.div>

        <div className="relative">
          {/* Timeline Line */}
          <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-primary via-secondary to-primary -translate-x-1/2" />

          <div className="space-y-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`relative flex items-center ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'}`}
              >
                {/* Step Number */}
                <div className="hidden lg:flex absolute left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary items-center justify-center text-white font-bold text-lg shadow-lg z-10">
                  {index + 1}
                </div>

                {/* Content Card */}
                <div className={`flex-1 ${index % 2 === 0 ? 'lg:pr-12 lg:text-right' : 'lg:pl-12 lg:text-left'}`}>
                  <div className="bg-white rounded-2xl p-6 border-2 border-border hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 group">
                    <div className={`flex items-center gap-4 ${index % 2 === 0 ? 'lg:flex-row-reverse' : 'lg:flex-row'} mb-4`}>
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        className={`w-14 h-14 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow flex-shrink-0`}
                      >
                        <step.icon className="h-7 w-7 text-white" />
                      </motion.div>
                      <div>
                        <h3 className="font-semibold font-poppins text-xl mb-2 group-hover:text-primary transition-colors">
                          {step.title}
                        </h3>
                        <p className="text-muted-foreground">{step.description}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Empty Space for Timeline */}
                <div className="hidden lg:block flex-1" />

                {/* Arrow Down for Mobile */}
                <div className="lg:hidden flex justify-center py-2">
                  <ArrowDown className="h-6 w-6 text-muted-foreground" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Mobile Timeline */}
        <div className="lg:hidden space-y-6 mt-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="flex items-start gap-4"
            >
              <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center text-white font-bold text-sm shadow-lg flex-shrink-0`}>
                {index + 1}
              </div>
              <div className="flex-1 bg-white rounded-2xl p-4 border-2 border-border">
                <div className="flex items-center gap-3 mb-2">
                  <step.icon className={`h-5 w-5 text-primary`} />
                  <h3 className="font-semibold font-poppins">{step.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
