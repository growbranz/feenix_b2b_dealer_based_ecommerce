"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, Star, Quote } from "lucide-react"
import { useState } from "react"

const testimonials = [
  {
    name: "Rajesh Kumar",
    company: "Mobile Parts Hub",
    location: "Mumbai",
    rating: 5,
    review: "Feenix Repair has transformed our business. The platform is easy to use and we've connected with dealers across India. Our sales have increased by 40% since joining.",
    avatar: "RK"
  },
  {
    name: "Priya Sharma",
    company: "Tech Solutions",
    location: "Delhi",
    rating: 5,
    review: "The verification process gives us confidence in every transaction. Fast delivery and excellent customer support. Highly recommended for all B2B mobile parts trading.",
    avatar: "PS"
  },
  {
    name: "Amit Patel",
    company: "Quick Fix Parts",
    location: "Bangalore",
    rating: 5,
    review: "Best platform for mobile spare parts. The real-time chat feature makes negotiations smooth and quick. We've saved both time and money using Feenix Repair.",
    avatar: "AP"
  },
  {
    name: "Sneha Reddy",
    company: "Premium Electronics",
    location: "Hyderabad",
    rating: 5,
    review: "The quality of parts and dealer verification is exceptional. We've been able to source rare components easily. This is the future of B2B mobile parts trading.",
    avatar: "SR"
  },
  {
    name: "Vikram Singh",
    company: "Repair Depot",
    location: "Chennai",
    rating: 5,
    review: "Outstanding platform with excellent features. The admin verification ensures we only deal with genuine sellers. Our business has grown significantly.",
    avatar: "VS"
  },
]

export function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0)

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length)
  }

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  return (
    <section className="py-24 bg-gradient-to-b from-background to-muted/30">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold font-poppins mb-4">What Our Dealers Say</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Hear from our successful dealers who have grown their business with Feenix Repair
          </p>
        </motion.div>

        <div className="relative max-w-4xl mx-auto">
          {/* Navigation Buttons */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 z-10 hidden lg:block">
            <button
              onClick={prevTestimonial}
              className="p-3 rounded-full bg-white border-2 border-border hover:border-primary/50 hover:bg-primary/10 transition-all shadow-lg hover:shadow-xl"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          </div>
          <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 z-10 hidden lg:block">
            <button
              onClick={nextTestimonial}
              className="p-3 rounded-full bg-white border-2 border-border hover:border-primary/50 hover:bg-primary/10 transition-all shadow-lg hover:shadow-xl"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>

          {/* Testimonial Cards */}
          <div className="overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.5 }}
              >
                <div className="bg-white rounded-2xl border-2 border-border hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 p-8 md:p-12">
                  <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-2xl font-bold font-poppins shadow-lg">
                        {testimonials[currentIndex].avatar}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 text-center md:text-left">
                      <Quote className="h-8 w-8 text-primary/30 mb-4 mx-auto md:mx-0" />
                      <p className="text-lg md:text-xl text-muted-foreground mb-6 leading-relaxed">
                        "{testimonials[currentIndex].review}"
                      </p>

                      <div className="flex flex-col md:flex-row md:items-center gap-2 mb-4">
                        <div className="font-semibold font-poppins text-lg">{testimonials[currentIndex].name}</div>
                        <span className="hidden md:block text-muted-foreground">•</span>
                        <div className="text-muted-foreground">{testimonials[currentIndex].company}</div>
                        <span className="hidden md:block text-muted-foreground">•</span>
                        <div className="text-muted-foreground">{testimonials[currentIndex].location}</div>
                      </div>

                      <div className="flex gap-1 justify-center md:justify-start">
                        {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                          <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Mobile Navigation */}
          <div className="flex justify-center gap-4 mt-8 lg:hidden">
            <button
              onClick={prevTestimonial}
              className="p-3 rounded-full bg-white border-2 border-border hover:border-primary/50 hover:bg-primary/10 transition-all shadow-lg hover:shadow-xl"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={nextTestimonial}
              className="p-3 rounded-full bg-white border-2 border-border hover:border-primary/50 hover:bg-primary/10 transition-all shadow-lg hover:shadow-xl"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>

          {/* Dots */}
          <div className="flex justify-center gap-2 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentIndex ? "bg-primary w-8" : "bg-muted-foreground/30"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
