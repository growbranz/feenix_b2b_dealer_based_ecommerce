"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Wrench, Star, Quote } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

export function Testimonial() {
  return (
    <section className="section-padding bg-white relative overflow-hidden">
      {/* Decorative blur */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-96 h-96 bg-blue-400/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl" />

      <div className="container-premium relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left Illustration */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="hidden lg:flex items-center justify-center"
          >
            <div className="relative w-80 h-80">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-100 to-slate-100" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-48 h-48 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center shadow-2xl shadow-blue-500/20">
                  <Wrench className="h-24 w-24 text-white" />
                </div>
              </div>
              <div className="absolute top-8 right-8 p-4 rounded-2xl bg-white shadow-lg border border-slate-100">
                <Star className="h-8 w-8 text-amber-400 fill-amber-400" />
              </div>
              <div className="absolute bottom-8 left-8 px-5 py-3 rounded-full bg-white shadow-lg border border-slate-100 text-sm font-semibold text-slate-700">
                5,000+ Verified Dealers
              </div>
            </div>
          </motion.div>

          {/* Right Testimonial Card */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <div className="relative rounded-[2.5rem] bg-gradient-to-br from-slate-50 to-white border border-slate-100 p-10 lg:p-14 shadow-xl">
              <Quote className="h-12 w-12 text-blue-200 mb-6" />

              <p className="text-xl lg:text-2xl text-slate-800 leading-relaxed font-medium">
                &ldquo;Feenix Repair transformed how we source mobile spare parts. The verified dealer network, fast delivery, and secure payments have helped us scale our repair business across three cities.&rdquo;
              </p>

              <div className="mt-8 flex items-center justify-between flex-wrap gap-6">
                <div>
                  <div className="font-bold text-slate-900 text-lg">Rahul Sharma</div>
                  <div className="text-sm text-slate-500">Founder, TechFix Mobile Solutions</div>
                  <div className="flex gap-1 mt-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                </div>

                <Link href="/auth/register">
                  <Button className="rounded-full btn-primary-gradient gap-2 h-12 px-7">
                    Join Feenix Repair Today
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
