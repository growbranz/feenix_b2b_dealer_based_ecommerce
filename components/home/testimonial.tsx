"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Star, Quote, ArrowRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export function Testimonial() {
  return (
    <section className="section-padding bg-white relative overflow-hidden">
      {/* Decorative background blur */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-96 h-96 bg-blue-400/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl" />

      <div className="container-premium relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* =========================================================
              LEFT PROFESSIONAL ILLUSTRATION
          ========================================================== */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="hidden lg:flex items-center justify-center"
          >
            <div className="relative w-full max-w-[560px] aspect-square">

              {/* Soft circular background */}
              <div className="absolute inset-[8%] rounded-full bg-gradient-to-br from-blue-50 via-white to-slate-100" />

              {/* Subtle blue glow */}
              <div className="absolute inset-[15%] rounded-full bg-blue-500/10 blur-3xl" />

              {/* Main professional image */}
              <div className="absolute inset-0 flex items-center justify-center">
                <Image
                  src="/testimonials.png"
                  alt="Mobile spare parts and repair components"
                  fill
                  priority
                  className="relative z-10 w-full h-full object-contain drop-shadow-2xl"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 560px"
                />
              </div>

              {/* Small decorative star */}
              <div className="absolute top-[12%] right-[8%] z-20 p-4 rounded-2xl bg-white shadow-lg border border-slate-100">
                <Star className="h-8 w-8 text-amber-400 fill-amber-400" />
              </div>

              {/* Verified dealers badge */}
              <div className="absolute bottom-[12%] left-[5%] z-20 px-6 py-3.5 rounded-full bg-white shadow-xl border border-slate-100">
                <span className="text-sm font-semibold text-slate-700 whitespace-nowrap">
                  5,000+ Verified Dealers
                </span>
              </div>
            </div>
          </motion.div>

          {/* =========================================================
              RIGHT TESTIMONIAL CARD
          ========================================================== */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <div className="relative rounded-[2.5rem] bg-gradient-to-br from-slate-50 to-white border border-slate-100 p-10 lg:p-14 shadow-xl">

              {/* Quote icon */}
              <Quote className="h-12 w-12 text-blue-200 mb-6" />

              {/* Testimonial */}
              <p className="text-xl lg:text-2xl text-slate-800 leading-relaxed font-medium">
                &ldquo;Feenix Repair transformed how we source mobile spare
                parts. The verified dealer network, fast delivery, and secure
                payments have helped us scale our repair business across three
                cities.&rdquo;
              </p>

              {/* Customer information */}
              <div className="mt-8 flex items-center justify-between flex-wrap gap-6">

                <div>
                  <div className="font-bold text-slate-900 text-lg">
                    Rahul Sharma
                  </div>

                  <div className="text-sm text-slate-500">
                    Founder, TechFix Mobile Solutions
                  </div>

                  {/* Rating */}
                  <div className="flex gap-1 mt-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="h-4 w-4 text-amber-400 fill-amber-400"
                      />
                    ))}
                  </div>
                </div>

                {/* CTA */}
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