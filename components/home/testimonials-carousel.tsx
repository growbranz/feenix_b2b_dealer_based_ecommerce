"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import Image from "next/image"
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Autoplay, Keyboard } from 'swiper/modules'
import type { Testimonial } from "@/types"
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

interface TestimonialsCarouselProps {
  testimonials: Testimonial[]
}

export function TestimonialsCarousel({ testimonials }: TestimonialsCarouselProps) {
  const [swiper, setSwiper] = React.useState<any>(null)

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase()
  }

  if (testimonials.length === 0) {
    return null
  }

  return (
    <section className="section-padding pb-16 lg:pb-20 bg-white relative overflow-hidden">
      {/* Decorative blur */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-96 h-96 bg-blue-400/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl" />

      <div className="container-premium relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left Professional Image */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="hidden lg:flex items-center justify-center"
          >
            <div className="relative w-full max-w-[560px] aspect-square">
              <Image
                src="/testimonials.png"
                alt="Professional mobile phone spare parts and repair components"
                fill
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 560px"
                className="object-contain drop-shadow-2xl"
              />
            </div>
          </motion.div>

          {/* Right Testimonial Carousel */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative"
          >
            {/* Navigation Buttons */}
            <div className="absolute -left-16 top-1/2 -translate-y-1/2 hidden lg:flex flex-col gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => swiper?.slidePrev()}
                className="h-10 w-10 rounded-full bg-white shadow-lg border border-slate-200 hover:bg-slate-50 hover:scale-110 transition-all"
                aria-label="Previous testimonial"
              >
                <ChevronLeft className="h-5 w-5 text-slate-600" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => swiper?.slideNext()}
                className="h-10 w-10 rounded-full bg-white shadow-lg border border-slate-200 hover:bg-slate-50 hover:scale-110 transition-all"
                aria-label="Next testimonial"
              >
                <ChevronRight className="h-5 w-5 text-slate-600" />
              </Button>
            </div>

            <Swiper
              modules={[Navigation, Pagination, Autoplay, Keyboard]}
              spaceBetween={20}
              slidesPerView={1}
              onSwiper={setSwiper}
              autoplay={{
                delay: 5000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }}
              pagination={{
                clickable: true,
                el: '.swiper-pagination',
              }}
              keyboard={{
                enabled: true,
              }}
              loop={testimonials.length > 1}
              grabCursor={true}
              className="pb-12"
              style={{
                '--swiper-pagination-color': '#2563eb',
                '--swiper-pagination-bullet-inactive-color': '#cbd5e1',
                '--swiper-pagination-bullet-inactive-opacity': '1',
                '--swiper-pagination-bullet-size': '8px',
                '--swiper-pagination-bullet-horizontal-gap': '6px',
              } as React.CSSProperties}
            >
              {testimonials.map((testimonial) => (
                <SwiperSlide key={testimonial.id}>
                  <div className="relative rounded-[2.5rem] bg-gradient-to-br from-slate-50 to-white border border-slate-100 p-10 lg:p-14 shadow-xl">
                    <Quote className="h-12 w-12 text-blue-200 mb-6" />

                    <p className="text-xl lg:text-2xl text-slate-800 leading-relaxed font-medium">
                      &ldquo;{testimonial.testimonial_text}&rdquo;
                    </p>

                    <div className="mt-8 flex items-center justify-between flex-wrap gap-6">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-sm font-semibold">
                          {testimonial.avatar_url ? (
                            <img
                              src={testimonial.avatar_url}
                              alt={testimonial.customer_name}
                              className="h-12 w-12 rounded-full object-cover"
                            />
                          ) : (
                            getInitials(testimonial.customer_name)
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 text-lg">{testimonial.customer_name}</div>
                          <div className="text-sm text-slate-500">
                            {testimonial.customer_role && <span>{testimonial.customer_role}</span>}
                            {testimonial.customer_role && testimonial.company_name && <span> · </span>}
                            {testimonial.company_name && <span>{testimonial.company_name}</span>}
                          </div>
                          <div className="flex gap-0.5 mt-2">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${i < testimonial.rating ? "text-amber-400 fill-amber-400" : "text-slate-300"}`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>

                      <Link href="/auth/register">
                        <Button className="rounded-full btn-primary-gradient gap-2 h-12 px-7">
                          Join Feenix Repair Today
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>

            {/* Pagination */}
            <div className="swiper-pagination flex justify-center gap-2 mt-4" />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
