import { Hero } from "@/components/website/hero"
import { BannerCarousel } from "@/components/website/banner-carousel"
import { BrandMarquee } from "@/components/home/brand-marquee"
import { FeatureShowcase } from "@/components/home/feature-showcase"
import { ProductShowcase } from "@/components/home/product-showcase"
import { TestimonialsCarousel } from "@/components/home/testimonials-carousel"
import Categories from "@/components/website/Categories"
import { FeaturedProducts } from "@/components/website/FeaturedProducts"
import { getActiveMarketplaceStats } from "@/lib/marketplace-stats/public"
import { getPublicTestimonials } from "@/lib/testimonials/public"

export default async function WebsitePage() {
  const marketplaceStats = await getActiveMarketplaceStats()
  const testimonials = await getPublicTestimonials()
  
  return (
    <div className="flex flex-col">
      <Hero />
      <BannerCarousel />
      <BrandMarquee />
      <FeatureShowcase marketplaceStats={marketplaceStats} />
      <ProductShowcase />
      <TestimonialsCarousel testimonials={testimonials} />
      <Categories />
      <FeaturedProducts />
    </div>
  )
}
