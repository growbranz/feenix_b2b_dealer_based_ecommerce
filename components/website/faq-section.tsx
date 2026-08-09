"use client"

import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown } from "lucide-react"
import { useState } from "react"

const faqs = [
  {
    question: "What is Feenix Repair?",
    answer: "Feenix Repair is India's largest B2B marketplace for mobile spare parts. We connect verified dealers across India, enabling them to buy and sell genuine mobile parts securely and efficiently."
  },
  {
    question: "How do I register as a dealer?",
    answer: "To register as a dealer, click on the 'Register' button on our homepage. Fill in your business details, upload necessary documents, and our team will verify your application within 24-48 hours."
  },
  {
    question: "What are the verification requirements?",
    answer: "We require business registration documents, GST certificate, identity proof, and address verification. Our thorough verification process ensures all dealers on our platform are legitimate and trustworthy."
  },
  {
    question: "How does the payment system work?",
    answer: "We use secure payment gateways with advanced encryption. Payments are held in escrow until order completion, ensuring both buyers and sellers are protected throughout the transaction."
  },
  {
    question: "What are the shipping options?",
    answer: "We partner with leading logistics providers to offer fast and reliable shipping across India. Sellers can choose from multiple shipping options based on urgency and budget."
  },
  {
    question: "How do I handle returns or disputes?",
    answer: "We have a dedicated dispute resolution team. If there are any issues with your order, you can raise a dispute through our platform, and our team will mediate to ensure a fair resolution."
  },
  {
    question: "Are there any membership fees?",
    answer: "Registration is free. We charge a small commission on successful transactions. Premium membership plans are available for dealers who want additional features and visibility."
  },
  {
    question: "How can I track my orders?",
    answer: "All orders can be tracked through你的 dashboard. You'll receive real-time updates on order status, shipping details, and delivery information."
  },
  {
    question: "What types of mobile parts are available?",
    answer: "We have a wide range of mobile spare parts including displays, batteries, cameras, motherboards, charging ports, speakers, back panels, fingerprint sensors, IC chips, and more for all major brands."
  },
  {
    question: "Is there customer support available?",
    answer: "Yes, our customer support team is available 24/7 to assist you with any queries or issues. You can reach us through chat, email, or phone."
  }
]

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section className="py-24 bg-white">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold mb-4">Frequently Asked Questions</h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Find answers to common questions about our platform
          </p>
        </motion.div>

        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="border-2 border-slate-200 hover:border-blue-600/50 transition-all duration-300 overflow-hidden">
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full text-left p-6 flex items-center justify-between"
                >
                  <span className="font-semibold text-lg pr-8">{faq.question}</span>
                  <motion.div
                    animate={{ rotate: openIndex === index ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex-shrink-0"
                  >
                    <ChevronDown className="h-5 w-5 text-slate-500" />
                  </motion.div>
                </button>
                <AnimatePresence>
                  {openIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="px-6 pb-6 pt-0">
                        <p className="text-slate-600 leading-relaxed">{faq.answer}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
