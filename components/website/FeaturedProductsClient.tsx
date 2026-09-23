"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { MapPin, ShieldCheck, Eye, Heart, ArrowRight, Package } from "lucide-react"
import Link from "next/link"
import type { PublicProduct } from "@/lib/products/public"

interface FeaturedProductsClientProps {
  products: PublicProduct[]
}

export function FeaturedProductsClient({ products }: FeaturedProductsClientProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(price)
  }

  const getStockStatus = (stock: number) => {
    if (stock === 0) return "Out of Stock"
    if (stock < 5) return "Limited"
    return "In Stock"
  }

  const getStockColor = (stock: number) => {
    if (stock === 0) return "text-rose-500"
    if (stock < 5) return "text-orange-500"
    return "text-green-500"
  }

  const getLocation = (city: string | null, state: string | null) => {
    if (city && state) return `${city}, ${state}`
    if (city) return city
    if (state) return state
    return null
  }

  if (products.length === 0) {
    return null
  }

  return (
    <section className="py-24 bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex justify-between items-center mb-12"
        >
          <div>
            <h2 className="text-4xl font-bold font-poppins mb-4">Featured Products</h2>
            <p className="text-slate-600 max-w-2xl">
              Top quality mobile spare parts from our verified dealers
            </p>
          </div>
          <Link href="/products">
            <button className="hidden md:inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors shadow-lg shadow-blue-600/25">
              View All Products
              <ArrowRight className="h-4 w-4" />
            </button>
          </Link>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -8 }}
            >
              <div className="bg-white rounded-2xl border-2 border-slate-200 hover:border-blue-600/50 transition-all duration-300 hover:shadow-xl hover:shadow-blue-600/10 group h-full">
                {/* Product Image */}
                <div className="relative h-48 bg-slate-50 rounded-t-2xl flex items-center justify-center overflow-hidden">
                  {product.images.length > 0 ? (
                    <img
                      src={product.images[0]}
                      alt={product.title}
                      className="h-full w-full object-contain p-4"
                    />
                  ) : (
                    <Package className="h-16 w-16 text-slate-300" />
                  )}
                  <button className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-md hover:bg-blue-600 hover:text-white transition-colors">
                    <Heart className="h-4 w-4" />
                  </button>
                  <div className="absolute top-4 left-4 flex items-center gap-1 px-2 py-1 bg-green-500 text-white text-xs rounded-full">
                    <ShieldCheck className="h-3 w-3" />
                    Verified
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-5 space-y-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <ShieldCheck className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium text-slate-600">{product.dealer_name}</span>
                    </div>
                    <h3 className="font-semibold font-poppins text-lg mb-2 group-hover:text-blue-600 transition-colors">
                      {product.title}
                    </h3>
                    {getLocation(product.dealer_city, product.dealer_state) && (
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <MapPin className="h-4 w-4" />
                        <span>{getLocation(product.dealer_city, product.dealer_state)}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                    <div>
                      <div className="text-2xl font-bold font-poppins text-blue-600">{formatPrice(product.price)}</div>
                      <div className={`text-xs ${getStockColor(product.stock)}`}>
                        {getStockStatus(product.stock)}
                      </div>
                    </div>
                    <Link href={`/products/${product.slug}`}>
                      <button className="p-2 bg-blue-600/10 hover:bg-blue-600 hover:text-white rounded-lg transition-colors">
                        <Eye className="h-4 w-4" />
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-center mt-12 md:hidden"
        >
          <Link href="/products">
            <button className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors shadow-lg shadow-blue-600/25">
              View All Products
              <ArrowRight className="h-4 w-4" />
            </button>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
