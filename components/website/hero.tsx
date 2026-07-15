"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { ArrowRight, Shield, Truck, Zap, MessageSquare, CheckCircle, Smartphone, Battery, Camera, Cpu, Zap as ZapIcon, Monitor } from "lucide-react"
import Link from "next/link"

const features = [
  { icon: Shield, label: "Verified Dealers" },
  { icon: Truck, label: "Fast Delivery" },
  { icon: Zap, label: "Secure Payments" },
  { icon: MessageSquare, label: "Realtime Enquiry" },
]

const stats = [
  { value: "5000+", label: "Dealers" },
  { value: "100K+", label: "Products" },
  { value: "50K+", label: "Orders" },
]

const floatingParts = [
  { icon: Smartphone, position: { top: "10%", left: "10%" }, delay: 0 },
  { icon: Battery, position: { top: "20%", right: "15%" }, delay: 0.2 },
  { icon: Camera, position: { bottom: "30%", left: "5%" }, delay: 0.4 },
  { icon: Cpu, position: { bottom: "20%", right: "10%" }, delay: 0.6 },
  { icon: ZapIcon, position: { top: "40%", left: "20%" }, delay: 0.8 },
  { icon: Monitor, position: { top: "15%", right: "25%" }, delay: 1 },
]

export function Hero() {
  return (
    <section className="relative min-h-[80vh] flex items-center pt-32 lg:pt-36 overflow-hidden bg-gradient-to-br from-background via-background to-primary/5">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(37,99,235,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(15,23,42,0.1),transparent_50%)]" />
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10 w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20"
            >
              <CheckCircle className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">India's Largest B2B Marketplace</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-5xl lg:text-6xl font-bold font-poppins leading-tight"
            >
              India's Largest{" "}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Mobile Spare Parts
              </span>{" "}
              Marketplace
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl text-muted-foreground max-w-xl"
            >
              Buy and Sell Genuine Mobile Spare Parts directly between verified dealers across India.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap gap-4"
            >
              <Link href="/products">
                <Button size="lg" className="gap-2 shadow-lg shadow-primary/25 bg-primary hover:bg-secondary">
                  Browse Products
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button size="lg" variant="outline" className="gap-2 border-border">
                  Become Dealer
                </Button>
              </Link>
            </motion.div>

            {/* Features */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-wrap gap-6 pt-4"
            >
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <feature.icon className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-sm font-medium">{feature.label}</span>
                </div>
              ))}
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="grid grid-cols-3 gap-4 pt-8"
            >
              {stats.map((stat, index) => (
                <div key={index} className="border-2 border-primary/20 bg-gradient-to-br from-card to-primary/5 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold font-poppins bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    {stat.value}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right Side - 3D Illustration */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative h-[500px] hidden lg:block"
          >
            {/* Central Phone Illustration */}
            <motion.div
              animate={{
                y: [0, -20, 0],
                rotate: [0, 5, 0],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="relative w-64 h-[500px] bg-gradient-to-br from-primary to-secondary rounded-[3rem] shadow-2xl shadow-primary/50 border-4 border-primary/20">
                {/* Phone Screen */}
                <div className="absolute inset-4 bg-gradient-to-br from-background to-primary/10 rounded-[2.5rem] overflow-hidden">
                  <div className="absolute top-8 left-1/2 -translate-x-1/2 w-20 h-6 bg-primary rounded-full" />
                  
                  {/* Screen Content */}
                  <div className="absolute inset-0 p-6 space-y-4">
                    <div className="h-32 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl" />
                    <div className="space-y-2">
                      <div className="h-4 bg-muted rounded-full w-3/4" />
                      <div className="h-4 bg-muted rounded-full w-1/2" />
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 bg-muted rounded-full w-2/3" />
                      <div className="h-4 bg-muted rounded-full w-1/3" />
                    </div>
                    <div className="absolute bottom-8 left-6 right-6 h-12 bg-primary rounded-xl" />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Floating Parts */}
            {floatingParts.map((part, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: part.delay + 0.5 }}
                className="absolute"
                style={part.position}
              >
                <motion.div
                  animate={{
                    y: [0, -15, 0],
                    rotate: [0, 10, -10, 0],
                  }}
                  transition={{
                    duration: 4 + index * 0.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: index * 0.2,
                  }}
                  className="p-4 bg-white rounded-2xl shadow-xl border border-border"
                >
                  <part.icon className="h-8 w-8 text-primary" />
                </motion.div>
              </motion.div>
            ))}

            {/* Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent blur-3xl -z-10" />
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-6 h-10 border-2 border-primary/30 rounded-full flex justify-center pt-2"
        >
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-1.5 h-1.5 bg-primary rounded-full"
          />
        </motion.div>
      </motion.div>
    </section>
  )
}
