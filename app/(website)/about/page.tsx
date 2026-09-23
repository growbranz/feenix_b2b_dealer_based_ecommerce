"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Target, Users, Globe, Award, TrendingUp, Shield, Clock, Zap, ArrowRight, Building2, Calendar, MapPin } from "lucide-react"

const fadeUpVariants = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" }
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-24 pb-20 lg:pt-32 lg:pb-28 overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50">
        {/* Background Decorations */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/5 rounded-full blur-3xl" />
          <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-blue-400/5 rounded-full blur-3xl" />
        </div>

        <div className="container-premium relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="text-center space-y-6 max-w-4xl mx-auto"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600/10 border border-blue-600/20"
            >
              <span className="text-sm font-semibold text-blue-600 tracking-wide uppercase">
                About Feenix Repair
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.6 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-slate-900"
            >
              Building a Better Marketplace for{" "}
              <span className="bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
                Mobile Repair
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.6 }}
              className="text-xl text-slate-600 max-w-2xl mx-auto"
            >
              Your trusted B2B marketplace for repair services and genuine mobile spare parts.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Company Overview */}
      <section className="py-20 lg:py-24 bg-white">
        <div className="container-premium">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left - Timeline Visual */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.7 }}
              className="relative hidden lg:block"
            >
              <div className="relative space-y-12 pl-8">
                <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-200 to-transparent" />
                
                {[
                  { icon: Building2, label: "Founded", year: "2020" },
                  { icon: TrendingUp, label: "Growth", year: "10K+" },
                  { icon: Globe, label: "Marketplace", year: "50+" },
                  { icon: MapPin, label: "Global Reach", year: "Worldwide" }
                ].map((item, index) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    className="relative flex items-center gap-6"
                  >
                    <div className="absolute -left-[33px] w-4 h-4 rounded-full bg-blue-600 border-4 border-white shadow-lg" />
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-blue-50">
                        <item.icon className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-slate-900">{item.year}</div>
                        <div className="text-sm text-slate-500">{item.label}</div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Right - Content */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.7 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
                  Company Overview
                </h2>
                <p className="text-lg text-slate-600 leading-relaxed">
                  Founded in 2020, Feenix Repair has grown from a small startup to a leading B2B marketplace 
                  connecting thousands of dealers worldwide. Our platform was built on the belief that finding 
                  quality repair parts should be simple, reliable, and efficient. Today, we serve over 10,000 
                  verified dealers across 50+ countries, facilitating millions of transactions annually.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 lg:py-24 bg-slate-50">
        <div className="container-premium">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              Our Mission & Vision
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Guided by purpose, driven by impact
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            {/* Mission Card */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.7 }}
              whileHover={{ y: -8 }}
              className="group"
            >
              <Card className="rounded-3xl border-slate-200 bg-white shadow-[0_4px_24px_-10px_rgba(30,41,59,0.06)] hover:shadow-[0_20px_48px_-18px_rgba(37,99,235,0.15)] hover:border-blue-300 transition-all duration-300 h-full">
                <CardContent className="p-8 lg:p-10">
                  <div className="relative mb-6">
                    <div className="absolute inset-0 bg-blue-100 rounded-2xl transform rotate-6 group-hover:rotate-12 transition-transform duration-300" />
                    <div className="relative p-4 bg-blue-600 rounded-2xl">
                      <Target className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-4">Our Mission</h3>
                  <p className="text-slate-600 leading-relaxed">
                    To connect dealers worldwide with a reliable platform for buying and selling repair parts, 
                    services, and equipment. We strive to make the B2B repair marketplace more efficient, 
                    transparent, and accessible for everyone, regardless of their business size or location.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Vision Card */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.7 }}
              whileHover={{ y: -8 }}
              className="group"
            >
              <Card className="rounded-3xl border-slate-200 bg-white shadow-[0_4px_24px_-10px_rgba(30,41,59,0.06)] hover:shadow-[0_20px_48px_-18px_rgba(37,99,235,0.15)] hover:border-blue-300 transition-all duration-300 h-full">
                <CardContent className="p-8 lg:p-10">
                  <div className="relative mb-6">
                    <div className="absolute inset-0 bg-blue-100 rounded-2xl transform -rotate-6 group-hover:-rotate-12 transition-transform duration-300" />
                    <div className="relative p-4 bg-blue-600 rounded-2xl">
                      <Globe className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-4">Our Vision</h3>
                  <p className="text-slate-600 leading-relaxed">
                    To become the world's leading B2B marketplace for repair services and parts, 
                    empowering businesses of all sizes to find the parts they need quickly and reliably. 
                    We envision a future where no repair is delayed due to parts unavailability.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Why Choose Feenix Repair */}
      <section className="py-20 lg:py-24 bg-white">
        <div className="container-premium">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              Why Choose Feenix Repair
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              The advantages that set us apart from the competition
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, amount: 0.15 }}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {[
              { icon: Shield, title: "Verified Dealers", desc: "All dealers undergo rigorous verification to ensure quality and trust" },
              { icon: Clock, title: "Fast Response", desc: "Quick enquiry responses and efficient order processing" },
              { icon: Globe, title: "Global Network", desc: "Connect with dealers from 50+ countries worldwide" },
              { icon: Award, title: "Quality Assured", desc: "All parts are inspected and quality certified before listing" }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                variants={fadeUpVariants}
                whileHover={{ y: -6 }}
                className="group"
              >
                <Card className="rounded-2xl border-slate-200 bg-white shadow-[0_4px_24px_-10px_rgba(30,41,59,0.06)] hover:shadow-[0_16px_40px_-18px_rgba(37,99,235,0.15)] hover:border-blue-300 transition-all duration-300 h-full">
                  <CardContent className="p-6 text-center">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ duration: 0.2 }}
                      className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 mb-4 group-hover:from-blue-100 group-hover:to-blue-200 transition-colors"
                    >
                      <feature.icon className="h-8 w-8 text-blue-600" />
                    </motion.div>
                    <h3 className="font-semibold text-lg mb-2 text-slate-900">{feature.title}</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">{feature.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20 lg:py-24 bg-slate-50">
        <div className="container-premium">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              Our Core Values
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              The principles that guide everything we do
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, amount: 0.15 }}
            className="space-y-6"
          >
            {[
              { icon: Users, title: "Customer First", desc: "We prioritize our customers' needs and work tirelessly to exceed their expectations", num: "01" },
              { icon: TrendingUp, title: "Continuous Innovation", desc: "We constantly improve our platform to provide better features and user experience", num: "02" },
              { icon: Zap, title: "Integrity & Trust", desc: "We maintain the highest standards of honesty and transparency in all dealings", num: "03" }
            ].map((value, index) => (
              <motion.div
                key={value.title}
                variants={fadeUpVariants}
                whileHover={{ y: -4 }}
                className="group"
              >
                <Card className="rounded-2xl border-slate-200 bg-white shadow-[0_4px_24px_-10px_rgba(30,41,59,0.06)] hover:shadow-[0_16px_40px_-18px_rgba(37,99,235,0.15)] hover:border-blue-300 transition-all duration-300">
                  <CardContent className="p-6 lg:p-8">
                    <div className="flex items-start gap-6">
                      {/* Number */}
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        className="flex-shrink-0 text-4xl font-bold text-slate-200 group-hover:text-blue-600 transition-colors"
                      >
                        {value.num}
                      </motion.div>

                      {/* Icon + Title */}
                      <div className="flex items-center gap-4 flex-1">
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          className="p-3 rounded-xl bg-blue-50 group-hover:bg-blue-100 transition-colors"
                        >
                          <value.icon className="h-6 w-6 text-blue-600" />
                        </motion.div>
                        <h3 className="font-semibold text-lg text-slate-900">{value.title}</h3>
                      </div>

                      {/* Description */}
                      <p className="text-slate-600 leading-relaxed max-w-md">
                        {value.desc}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Our Impact */}
      <section className="py-20 lg:py-24 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 relative overflow-hidden">
        {/* Background Decorations */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        </div>

        <div className="container-premium relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              Our Impact
            </h2>
            <p className="text-lg text-blue-100 max-w-2xl mx-auto">
              Numbers that reflect our growth and success
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, amount: 0.15 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto"
          >
            {[
              { value: "10,000+", label: "Verified Dealers" },
              { value: "50+", label: "Countries" },
              { value: "1M+", label: "Products Listed" },
              { value: "98%", label: "Satisfaction Rate" }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                variants={fadeUpVariants}
                className="text-center"
              >
                <div className="text-4xl lg:text-5xl font-bold text-white mb-2">
                  {stat.value}
                </div>
                <div className="text-blue-100 text-sm lg:text-base">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </div>
  )
}
