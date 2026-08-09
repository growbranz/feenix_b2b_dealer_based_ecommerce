export interface FeaturedConfig {
  product_ids: string[]
  category_ids: string[]
  brand_ids: string[]
  trending_ids: string[]
  home_sections: {
    hero: boolean
    features: boolean
    testimonials: boolean
    faq: boolean
    newsletter: boolean
  }
}

export const initialFeaturedConfig: FeaturedConfig = {
  product_ids: ["p1", "p2"],
  category_ids: ["1", "2"],
  brand_ids: ["1", "2"],
  trending_ids: ["p3", "p5"],
  home_sections: {
    hero: true,
    features: true,
    testimonials: true,
    faq: true,
    newsletter: false,
  },
}

export type FeaturedTab = "products" | "categories" | "brands" | "trending" | "sections"

export const tabLabels: { value: FeaturedTab; label: string }[] = [
  { value: "products", label: "Featured Products" },
  { value: "categories", label: "Featured Categories" },
  { value: "brands", label: "Featured Brands" },
  { value: "trending", label: "Trending Products" },
  { value: "sections", label: "Home Sections" },
]
