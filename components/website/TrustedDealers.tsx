"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { MapPin, Star, ShieldCheck, Award } from "lucide-react"
import Link from "next/link"

const dealers = [
  { name: "Mobile Parts Hub", location: "Mumbai", years: "8 Years", products: "12,500+", rating: 4.9, verified: true, logo: "🏢" },
  { name: "Tech Solutions", location: "Delhi", years: "12 Years", products: "18,200+", rating: 4.8, verified: true, logo: "🏭" },
  { name: "Premium Electronics", location: "Bangalore", years: "6 Years", products: "9,800+", rating: 4.9, verified: true, logo: "🏗️" },
  { name: "Repair Depot", location: "Chennai", years: "10 Years", products: "15,300+", rating: 4.7, verified: true, logo: "🏪" },
]

export function TrustedDealers() {
  return (
    <section className="py-24 bg-gradient-to-b from-muted/30 to-background">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold font-poppins mb-4">Trusted Dealers</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Verified dealers with excellent ratings and years of experience
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {dealers.map((dealer, index) => (
            <motion.div
              key={dealer.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -8 }}
            >
              <Link href="/dealers">
                <div className="bg-white rounded-2xl p-6 border-2 border-border hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 group h-full">
                  {/* Company Logo */}
                  <div className="text-4xl mb-4">{dealer.logo}</div>

                  {/* Dealer Info */}
                  <h3 className="font-semibold font-poppins text-lg mb-2 group-hover:text-primary transition-colors">
                    {dealer.name}
                  </h3>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{dealer.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Award className="h-4 w-4" />
                      <span>{dealer.years}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <ShieldCheck className="h-4 w-4" />
                      <span>{dealer.products} Products</span>
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-2 pt-4 border-t border-border">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${i < Math.floor(dealer.rating) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-medium">{dealer.rating}</span>
                  </div>

                  {dealer.verified && (
                    <div className="mt-4 flex items-center gap-2 text-xs text-green-600">
                      <ShieldCheck className="h-3 w-3" />
                      <span>Verified Dealer</span>
                    </div>
                  )}
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-center mt-12"
        >
          <Link href="/dealers">
            <button className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-secondary text-white font-medium rounded-xl transition-colors shadow-lg shadow-primary/25">
              View All Dealers
            </button>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
