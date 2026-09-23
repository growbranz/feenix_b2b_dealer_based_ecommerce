"use client"

import * as React from "react"
import { motion, useReducedMotion } from "framer-motion"
import { Eye, ChevronLeft, ChevronRight, Package } from "lucide-react"
import { Swiper, SwiperSlide } from "swiper/react"
import { Autoplay, Navigation, Pagination, FreeMode, Mousewheel } from "swiper/modules"
import { Button } from "@/components/ui/button"
import { getPremiumProducts } from "@/lib/products/public"
import type { PublicProduct } from "@/lib/products/public"
import "swiper/css"
import "swiper/css/navigation"
import "swiper/css/pagination"

interface ProductShowcaseClientProps {
  products: PublicProduct[]
}

function StockBadge({ stock }: { stock: number }) {
  if (stock === 0) {
    return (
      <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-red-50 text-red-700 border-red-200">
        Out of Stock
      </span>
    )
  }
  if (stock < 5) {
    return (
      <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-amber-50 text-amber-700 border-amber-200">
        Low Stock
      </span>
    )
  }
  return (
    <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-emerald-50 text-emerald-700 border-emerald-200">
      In Stock
    </span>
  )
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(price)
}

interface ProductCardProps {
  product: PublicProduct
  reduced: boolean
}

function ProductCard({ product, reduced }: ProductCardProps) {
  const gradient = "from-purple-600 to-purple-400"

  return (
    <motion.div
      whileHover={reduced ? undefined : { y: -6 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="h-full rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:border-purple-200 transition-all duration-300 overflow-hidden group/product"
    >
      {/* Product Image */}
      <div className="relative h-40 bg-slate-50 rounded-t-2xl flex items-center justify-center overflow-hidden">
        {product.images.length > 0 ? (
          <img
            src={product.images[0]}
            alt={product.title}
            className="h-full w-full object-contain p-3 transition-transform duration-500 group-hover/product:scale-110"
          />
        ) : (
          <div className={`absolute inset-0 bg-gradient-to-br ${gradient} flex items-center justify-center`}>
            <Package className="h-16 w-16 text-white/90 transition-transform duration-500 group-hover/product:scale-110" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover/product:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Content */}
      <div className="p-5 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h4 className="font-semibold text-slate-900 leading-tight">{product.title}</h4>
            <p className="text-sm text-slate-500">{product.brand_name}</p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-slate-900">{formatPrice(product.price)}</span>
          <StockBadge stock={product.stock} />
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

export function ProductShowcaseClient({ products }: ProductShowcaseClientProps) {
  const reduced = useReducedMotion() ?? false

  if (products.length === 0) {
    return null
  }

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
              className="product-prev h-10 w-10 rounded-full bg-white border border-slate-200 shadow-sm text-slate-700 hover:bg-purple-600 hover:text-white hover:border-purple-600 hover:shadow-md transition-all duration-200 flex items-center justify-center group"
            >
              <ChevronLeft className="h-5 w-5 transition-transform group-hover:-translate-x-0.5" />
            </button>
            <button
              aria-label="Next products"
              className="product-next h-10 w-10 rounded-full bg-white border border-slate-200 shadow-sm text-slate-700 hover:bg-purple-600 hover:text-white hover:border-purple-600 hover:shadow-md transition-all duration-200 flex items-center justify-center group"
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
            {products.map((product) => (
              <SwiperSlide key={product.id} className="!h-auto">
                <ProductCard product={product} reduced={reduced} />
              </SwiperSlide>
            ))}
          </Swiper>
        </motion.div>
      </div>
    </section>
  )
}
