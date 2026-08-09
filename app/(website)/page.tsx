import { Hero } from "@/components/website/hero"
import { BrandMarquee } from "@/components/home/brand-marquee"
import { FeatureShowcase } from "@/components/home/feature-showcase"
import { ProductShowcase } from "@/components/home/product-showcase"
import { Testimonial } from "@/components/home/testimonial"
import { Categories } from "@/components/website/Categories"
import { FeaturedProducts } from "@/components/website/FeaturedProducts"

export default function WebsitePage() {
  return (
    <div className="flex flex-col">
      <Hero />
      <BrandMarquee />
      <FeatureShowcase />
      <ProductShowcase />
      <Testimonial />
      <Categories />
      <FeaturedProducts />
    </div>
  )
}
