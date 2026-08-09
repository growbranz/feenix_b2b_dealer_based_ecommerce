"use client"

import * as React from "react"
import { motion, useReducedMotion } from "framer-motion"
import { Smartphone, Monitor, Battery, Cpu, Camera, Volume2, Layers, Cable, Eye, ChevronLeft, ChevronRight } from "lucide-react"
import { Swiper, SwiperSlide } from "swiper/react"
import { Autoplay, Navigation, Pagination, FreeMode, Mousewheel } from "swiper/modules"
import { Button } from "@/components/ui/button"
import "swiper/css"
import "swiper/css/navigation"
import "swiper/css/pagination"

interface Product {
  name: string
  brand: string
  price: string
  available: boolean
  lowStock?: boolean
  icon: React.ElementType
  gradient: string
}

const products: Product[] = [
  { name: "iPhone Display", brand: "Apple", price: "₹3,499", available: true, icon: Smartphone, gradient: "from-slate-800 to-slate-600" },
  { name: "Samsung AMOLED", brand: "Samsung", price: "₹4,299", available: true, icon: Monitor, gradient: "from-blue-800 to-blue-600" },
  { name: "Battery Pack", brand: "Xiaomi", price: "₹1,299", available: true, icon: Battery, gradient: "from-emerald-700 to-emerald-500" },
  { name: "Charging IC", brand: "OnePlus", price: "₹899", available: false, icon: Cpu, gradient: "from-amber-700 to-amber-500" },
  { name: "Camera Module", brand: "Vivo", price: "₹2,499", available: true, icon: Camera, gradient: "from-rose-700 to-rose-500" },
  { name: "Speaker", brand: "Oppo", price: "₹699", available: true, icon: Volume2, gradient: "from-indigo-700 to-indigo-500" },
  { name: "Motherboard", brand: "Realme", price: "₹6,999", available: true, icon: Layers, gradient: "from-cyan-700 to-cyan-500" },
  { name: "Flex Cable", brand: "Motorola", price: "₹349", available: true, icon: Cable, gradient: "from-violet-700 to-violet-500" },
]

function StockBadge({ available, lowStock }: { available: boolean; lowStock?: boolean }) {
  if (lowStock) {
    return (
      <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-amber-50 text-amber-700 border-amber-200">
        Low Stock
      </span>
    )
  }
  if (available) {
    return (
      <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-emerald-50 text-emerald-700 border-emerald-200">
        In Stock
      </span>
    )
  }
  return (
    <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-red-50 text-red-700 border-red-200">
      Out of Stock
    </span>
  )
}

interface ProductCardProps {
  product: Product
  reduced: boolean
}

function ProductCard({ product, reduced }: ProductCardProps) {
  return (
    <motion.div
      whileHover={reduced ? undefined : { y: -6 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="h-full rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-300 overflow-hidden group/product"
    >
      {/* Product Image */}
      <div className="relative h-40 overflow-hidden rounded-t-2xl">
        <div className={`absolute inset-0 bg-gradient-to-br ${product.gradient} flex items-center justify-center`}>
          <product.icon className="h-16 w-16 text-white/90 transition-transform duration-500 group-hover/product:scale-110" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover/product:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Content */}
      <div className="p-5 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h4 className="font-semibold text-slate-900 leading-tight">{product.name}</h4>
            <p className="text-sm text-slate-500">{product.brand}</p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-slate-900">{product.price}</span>
          <StockBadge available={product.available} lowStock={product.lowStock} />
        </div>

        <Button variant="outline" size="sm" className="w-full rounded-full gap-2 group/button btn-ghost-glow">
          <Eye className="h-4 w-4 transition-transform group-hover/button:scale-110" />
          Quick View
        </Button>
      </div>
    </motion.div>
  )
}

const swiperBreakpoints = {
  320: { slidesPerView: 1.15, spaceBetween: 16 },
  375: { slidesPerView: 1.2, spaceBetween: 16 },
  640: { slidesPerView: 2.2, spaceBetween: 20 },
  1024: { slidesPerView: 3.2, spaceBetween: 24 },
  1280: { slidesPerView: 4, spaceBetween: 24 },
  1536: { slidesPerView: 4.5, spaceBetween: 24 },
}

export function ProductShowcase() {
  const reduced = useReducedMotion() ?? false

  return (
    <section className="py-16 lg:py-24 bg-white">
      <div className="container-premium">
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-4"
        >
          <div>
            <h3 className="text-2xl md:text-3xl font-bold text-slate-900">Premium Products Showcase</h3>
            <p className="mt-2 text-slate-600">Genuine spare parts trusted by repair professionals across India.</p>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <button
              aria-label="Previous products"
              className="product-prev h-10 w-10 rounded-full bg-white border border-slate-200 shadow-sm text-slate-700 hover:bg-blue-600 hover:text-white hover:border-blue-600 hover:shadow-md transition-all duration-200 flex items-center justify-center group"
            >
              <ChevronLeft className="h-5 w-5 transition-transform group-hover:-translate-x-0.5" />
            </button>
            <button
              aria-label="Next products"
              className="product-next h-10 w-10 rounded-full bg-white border border-slate-200 shadow-sm text-slate-700 hover:bg-blue-600 hover:text-white hover:border-blue-600 hover:shadow-md transition-all duration-200 flex items-center justify-center group"
            >
              <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={reduced ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative"
        >
          {/* Edge fade gradients */}
          <div className="absolute inset-y-0 left-0 w-12 sm:w-20 bg-gradient-to-r from-white to-transparent pointer-events-none z-10" aria-hidden="true" />
          <div className="absolute inset-y-0 right-0 w-12 sm:w-20 bg-gradient-to-l from-white to-transparent pointer-events-none z-10" aria-hidden="true" />

          <Swiper
            modules={[Autoplay, Navigation, Pagination, FreeMode, Mousewheel]}
            autoplay={reduced ? false : { delay: 3000, disableOnInteraction: false, pauseOnMouseEnter: true }}
            speed={reduced ? 0 : 800}
            loop={true}
            grabCursor={true}
            freeMode={{ enabled: !reduced, sticky: true }}
            mousewheel={{ forceToAxis: true }}
            navigation={{ prevEl: ".product-prev", nextEl: ".product-next" }}
            pagination={{ clickable: true, dynamicBullets: true }}
            slidesPerView={1.15}
            spaceBetween={16}
            breakpoints={swiperBreakpoints}
            className="product-swiper w-full !pb-10"
          >
            {products.map((product, index) => (
              <SwiperSlide key={`${product.name}-${index}`} className="!h-auto">
                <ProductCard product={product} reduced={reduced} />
              </SwiperSlide>
            ))}
          </Swiper>
        </motion.div>
      </div>
    </section>
  )
}
