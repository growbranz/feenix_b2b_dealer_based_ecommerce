export interface HeroContent {
  title: string
  subtitle: string
  cta_label: string
  cta_link: string
}

export interface Feature {
  id: string
  title: string
  description: string
  icon: string
}

export interface Testimonial {
  id: string
  name: string
  role: string
  text: string
}

export interface FAQItem {
  id: string
  question: string
  answer: string
}

export interface SiteContent {
  hero: HeroContent
  features: Feature[]
  about: string
  testimonials: Testimonial[]
  faq: FAQItem[]
  contact: {
    phone: string
    email: string
    address: string
    whatsapp: string
  }
  footer: {
    copyright: string
    links: { label: string; href: string }[]
  }
  seo: {
    title: string
    description: string
    keywords: string
  }
  social: {
    facebook: string
    instagram: string
    twitter: string
    linkedin: string
    youtube: string
  }
}

export const initialSiteContent: SiteContent = {
  hero: {
    title: "Premium Mobile Repair Parts",
    subtitle: "Wholesale B2B marketplace for repair professionals across India.",
    cta_label: "Browse Catalog",
    cta_link: "/products",
  },
  features: [
    { id: "1", title: "Genuine Parts", description: "Original quality components", icon: "shield" },
    { id: "2", title: "Bulk Pricing", description: "Competitive wholesale rates", icon: "tag" },
    { id: "3", title: "Fast Delivery", description: "All India shipping", icon: "truck" },
  ],
  about: "Feenix Repair connects mobile repair professionals with trusted suppliers for genuine spare parts and accessories.",
  testimonials: [
    { id: "1", name: "Rahul S.", role: "Repair Shop Owner", text: "Feenix has transformed our supply chain." },
    { id: "2", name: "Priya P.", role: "Dealer", text: "Great platform and reliable dealers." },
  ],
  faq: [
    { id: "1", question: "How do I register as a dealer?", answer: "Submit your business documents from the dealer panel." },
    { id: "2", question: "What is the minimum order?", answer: "Minimum order values are set per product." },
  ],
  contact: {
    phone: "+91 1800 123 4567",
    email: "support@feenix.com",
    address: "123 Industrial Area, New Delhi",
    whatsapp: "+91 98765 43210",
  },
  footer: {
    copyright: "© 2026 Feenix Repair. All rights reserved.",
    links: [
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
    ],
  },
  seo: {
    title: "Feenix Repair - Premium Mobile Repair Parts",
    description: "Buy genuine mobile repair parts wholesale.",
    keywords: "mobile parts, repair, wholesale, displays, batteries",
  },
  social: {
    facebook: "https://facebook.com/feenix",
    instagram: "https://instagram.com/feenix",
    twitter: "",
    linkedin: "",
    youtube: "",
  },
}

export type ContentSection =
  | "hero"
  | "features"
  | "about"
  | "testimonials"
  | "faq"
  | "contact"
  | "footer"
  | "seo"
  | "social"

export const sectionLabels: { value: ContentSection; label: string }[] = [
  { value: "hero", label: "Hero" },
  { value: "features", label: "Features" },
  { value: "about", label: "About" },
  { value: "testimonials", label: "Testimonials" },
  { value: "faq", label: "FAQ" },
  { value: "contact", label: "Contact" },
  { value: "footer", label: "Footer" },
  { value: "seo", label: "SEO" },
  { value: "social", label: "Social Links" },
]
