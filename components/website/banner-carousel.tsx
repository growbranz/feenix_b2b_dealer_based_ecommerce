"use client"

import * as React from "react"
import { motion, useReducedMotion } from "framer-motion"
import Link from "next/link"
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react"
import { Swiper, SwiperSlide } from "swiper/react"
import { Autoplay, Navigation, Pagination } from "swiper/modules"
import { Button } from "@/components/ui/button"
import { getActiveBannersAction } from "@/lib/banners/actions"
import type { Banner } from "@/types"
import "swiper/css"
import "swiper/css/navigation"
import "swiper/css/pagination"

export function BannerCarousel() {
  const [banners, setBanners] = React.useState<Banner[]>([])
  const [loading, setLoading] = React.useState(true)
  const reduced = useReducedMotion() ?? false

  React.useEffect(() => {
    async function loadBanners() {
      try {
        const data = await getActiveBannersAction()
        setBanners(data)
      } catch (e) {
        console.error("Failed to load banners:", e)
      } finally {
        setLoading(false)
      }
    }
    loadBanners()
  }, [])

  if (loading) {
    return (
      <div className="h-[400px] md:h-[500px] lg:h-[600px] bg-slate-100 animate-pulse" />
    )
  }

  if (banners.length === 0) {
    return null
  }

  return (
    <section className="relative bg-slate-50">
      <Swiper
        modules={[Autoplay, Navigation, Pagination]}
        autoplay={reduced ? false : { delay: 5000, disableOnInteraction: false, pauseOnMouseEnter: true }}
        speed={reduced ? 0 : 800}
        loop={banners.length > 1}
        grabCursor={true}
        navigation={{
          prevEl: ".banner-prev",
          nextEl: ".banner-next",
        }}
        pagination={{
          clickable: true,
          dynamicBullets: true,
        }}
        className="banner-swiper"
        style={{ height: "400px" }}
      >
        {banners.map((banner) => (
          <SwiperSlide key={banner.id}>
            <BannerSlide banner={banner} reduced={reduced} />
          </SwiperSlide>
        ))}
      </Swiper>

      {banners.length > 1 && (
        <>
          <button
            aria-label="Previous banner"
            className="banner-prev absolute left-4 top-1/2 -translate-y-1/2 z-20 h-12 w-12 rounded-full bg-white/90 backdrop-blur-sm border border-slate-200 shadow-lg text-slate-700 hover:bg-white hover:text-blue-600 hover:border-blue-600 hover:shadow-xl transition-all duration-200 flex items-center justify-center group"
          >
            <ChevronLeft className="h-6 w-6 transition-transform group-hover:-translate-x-0.5" />
          </button>
          <button
            aria-label="Next banner"
            className="banner-next absolute right-4 top-1/2 -translate-y-1/2 z-20 h-12 w-12 rounded-full bg-white/90 backdrop-blur-sm border border-slate-200 shadow-lg text-slate-700 hover:bg-white hover:text-blue-600 hover:border-blue-600 hover:shadow-xl transition-all duration-200 flex items-center justify-center group"
          >
            <ChevronRight className="h-6 w-6 transition-transform group-hover:translate-x-0.5" />
          </button>
        </>
      )}
    </section>
  )
}

function BannerSlide({ banner, reduced }: { banner: Banner; reduced: boolean }) {
  const hasContent = banner.title || banner.subtitle || banner.cta_label
  const link = banner.cta_link || banner.link || "#"

  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* Banner Image */}
      <div className="absolute inset-0">
        <img
          src={banner.image}
          alt={banner.title || "Banner"}
          className="h-full w-full object-cover"
        />
        {/* Gradient Overlay */}
        {hasContent && (
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent" />
        )}
      </div>

      {/* Content */}
      {hasContent && (
        <motion.div
          initial={reduced ? false : { opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative z-10 flex h-full items-center"
        >
          <div className="container-premium">
            <div className="max-w-2xl space-y-4 md:space-y-6">
              {banner.subtitle && (
                <motion.p
                  initial={reduced ? false : { opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="text-sm md:text-base font-medium text-blue-200 uppercase tracking-wider"
                >
                  {banner.subtitle}
                </motion.p>
              )}
              {banner.title && (
                <motion.h1
                  initial={reduced ? false : { opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight"
                >
                  {banner.title}
                </motion.h1>
              )}
              {banner.cta_label && (
                <motion.div
                  initial={reduced ? false : { opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                >
                  <Link href={link}>
                    <Button
                      size="lg"
                      className="rounded-full bg-blue-600 text-white hover:bg-blue-700 px-6 md:px-8 text-base md:text-lg"
                    >
                      {banner.cta_label}
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
