"use client"

import * as React from "react"
import { motion } from "framer-motion"
import {
  Smartphone,
  Cpu,
  Monitor,
  Battery,
  Headphones,
  Watch,
  Wifi,
  HardDrive,
  Tablet,
  Laptop,
  Router,
  Gem,
  MousePointer,
  Server,
  Award,
  Zap,
  Globe,
  Bluetooth,
} from "lucide-react"

const brands = [
  { name: "Apple", image: "/images/brands/apple.png" },
  { name: "Samsung", image: "/images/brands/samsung.jfif" },
  { name: "Xiaomi", image: "/images/brands/mi.png" },
  { name: "OnePlus", image: "/images/brands/1+.png" },
  { name: "Vivo", image: "/images/brands/vivo.jfif" },
  { name: "Oppo", image: "/images/brands/oppo.jfif" },
  { name: "Realme", image: "/images/brands/realme.png" },
  { name: "Motorola", icon: Wifi },
  { name: "Nokia", image: "/images/brands/nokia.png" },
  { name: "Google Pixel", image: "/images/brands/pixel.png" },
  { name: "Nothing", image: "/images/brands/nothing.png" },
  { name: "Asus", image: "/images/brands/asus.png" },
  { name: "Lenovo", image: "/images/brands/lenovo.png" },
  { name: "HP", image: "/images/brands/hp.png" },
  { name: "Dell", image: "/images/brands/dell.jfif" },
  { name: "MSI", image: "/images/brands/msi.png" },
  { name: "Acer", image: "/images/brands/acer.jfif" },
  { name: "TP-Link", image: "/images/brands/tp_link.png" },
]

function BrandCard({ name, image, icon: Icon }: { name: string; image?: string; icon?: React.ElementType }) {
  return (
    <div className="group relative flex items-center justify-center px-8 py-6 hover:scale-110 transition-all duration-300 cursor-pointer min-w-[140px]">
      {image ? (
        <img src={image} alt={name} className="h-16 w-auto max-w-[120px] object-contain opacity-70 group-hover:opacity-100 transition-opacity" />
      ) : Icon ? (
        <div className="p-3 rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
          <Icon className="h-8 w-8" />
        </div>
      ) : null}
    </div>
  )
}

export function BrandMarquee() {
  const duplicated = [...brands, ...brands]

  return (
    <section className="relative overflow-hidden py-24 bg-gradient-to-b from-white to-slate-50/80">
      {/* Blur circles */}
      <div className="absolute top-0 left-1/4 w-72 h-72 bg-blue-400/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />

      <div className="container-premium relative z-10 mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight">
            Trusted by Leading Mobile & Electronics Brands
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            We connect verified dealers with trusted brands and genuine spare parts across India.
          </p>
        </motion.div>
      </div>

      <div className="relative group">
        {/* Edge fades */}
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

        <div className="overflow-hidden">
          <div className="flex w-max gap-6 animate-marquee group-hover:[animation-play-state:paused]">
            {duplicated.map((brand, index) => (
              <BrandCard key={`${brand.name}-${index}`} name={brand.name} image={brand.image} icon={brand.icon} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
