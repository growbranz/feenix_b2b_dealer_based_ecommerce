"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { MapPin, ShieldCheck, Eye, Heart, ArrowRight } from "lucide-react"
import Link from "next/link"

const products = [
  {
    id: 1,
    name: "iPhone 14 Pro Max Display",
    dealer: "Mobile Parts Hub",
    location: "Mumbai",
    price: "₹8,500",
    stock: "In Stock",
    verified: true,
    image: "📱"
  },
  {
    id: 2,
    name: "Samsung S23 Battery",
    dealer: "Tech Solutions",
    location: "Delhi",
    price: "₹1,200",
    stock: "In Stock",
    verified: true,
    image: "🔋"
  },
  {
    id: 3,
    name: "OnePlus 11 Camera Module",
    dealer: "Premium Electronics",
    location: "Bangalore",
    price: "₹3,800",
    stock: "Limited",
    verified: true,
    image: "📷"
  },
  {
    id: 4,
    name: "Pixel 7 Motherboard",
    dealer: "Repair Depot",
    location: "Chennai",
    price: "₹12,500",
    stock: "In Stock",
    verified: true,
    image: "🔧"
  },
  {
    id: 5,
    name: "iPhone 13 Charging Port",
    dealer: "Quick Fix Parts",
    location: "Hyderabad",
    price: "₹850",
    stock: "In Stock",
    verified: true,
    image: "⚡"
  },
  {
    id: 6,
    name: "Realme GT Speaker",
    dealer: "Mobile World",
    location: "Kolkata",
    price: "₹450",
    stock: "In Stock",
    verified: true,
    image: "🔊"
  },
  {
    id: 7,
    name: "Vivo V25 Back Panel",
    dealer: "Parts Paradise",
    location: "Pune",
    price: "₹1,100",
    stock: "In Stock",
    verified: true,
    image: "📱"
  },
  {
    id: 8,
    name: "Oppo F21 Fingerprint",
    dealer: "Tech Mart",
    location: "Ahmedabad",
    price: "₹650",
    stock: "Limited",
    verified: true,
    image: "👆"
  },
]

export function FeaturedProducts() {
  return (
    <section className="py-24 bg-gradient-to-b from-muted/30 to-background">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex justify-between items-center mb-12"
        >
          <div>
            <h2 className="text-4xl font-bold font-poppins mb-4">Featured Products</h2>
            <p className="text-muted-foreground max-w-2xl">
              Top quality mobile spare parts from our verified dealers
            </p>
          </div>
          <Link href="/products">
            <button className="hidden md:inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-secondary text-white font-medium rounded-xl transition-colors shadow-lg shadow-primary/25">
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
              <div className="bg-white rounded-2xl border-2 border-border hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 group h-full">
                {/* Product Image */}
                <div className="relative h-48 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-t-2xl flex items-center justify-center overflow-hidden">
                  <div className="text-6xl">{product.image}</div>
                  <button className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-md hover:bg-primary hover:text-white transition-colors">
                    <Heart className="h-4 w-4" />
                  </button>
                  {product.verified && (
                    <div className="absolute top-4 left-4 flex items-center gap-1 px-2 py-1 bg-green-500 text-white text-xs rounded-full">
                      <ShieldCheck className="h-3 w-3" />
                      Verified
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-5 space-y-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <ShieldCheck className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium text-muted-foreground">{product.dealer}</span>
                    </div>
                    <h3 className="font-semibold font-poppins text-lg mb-2 group-hover:text-primary transition-colors">
                      {product.name}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{product.location}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div>
                      <div className="text-2xl font-bold font-poppins text-primary">{product.price}</div>
                      <div className={`text-xs ${product.stock === "In Stock" ? "text-green-500" : "text-orange-500"}`}>
                        {product.stock}
                      </div>
                    </div>
                    <button className="p-2 bg-primary/10 hover:bg-primary hover:text-white rounded-lg transition-colors">
                      <Eye className="h-4 w-4" />
                    </button>
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
            <button className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-secondary text-white font-medium rounded-xl transition-colors shadow-lg shadow-primary/25">
              View All Products
              <ArrowRight className="h-4 w-4" />
            </button>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
