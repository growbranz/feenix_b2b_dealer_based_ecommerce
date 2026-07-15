import { Hero } from "@/components/website/hero"
import { Stats } from "@/components/website/Stats"
import { Categories } from "@/components/website/Categories"
import { FeaturedProducts } from "@/components/website/FeaturedProducts"
import { WhyChooseUs } from "@/components/website/WhyChooseUs"
import { HowItWorks } from "@/components/website/HowItWorks"
import { TrustedDealers } from "@/components/website/TrustedDealers"
import { Testimonials } from "@/components/website/Testimonials"
import { BecomeDealer } from "@/components/website/BecomeDealer"
import { Contact } from "@/components/website/Contact"

export default function WebsitePage() {
  return (
    <div className="flex flex-col">
      <Hero />
      <Stats />
      <Categories />
      <FeaturedProducts />
      <WhyChooseUs />
      <HowItWorks />
      <TrustedDealers />
      <Testimonials />
      <BecomeDealer />
      <Contact />
    </div>
  )
}
