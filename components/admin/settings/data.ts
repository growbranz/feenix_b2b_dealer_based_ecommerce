export type SettingsSection =
  | "company"
  | "business"
  | "contact"
  | "smtp"
  | "resend"
  | "supabase"
  | "razorpay"
  | "analytics"
  | "social"
  | "theme"

export interface AdminSettings {
  company: {
    name: string
    tagline: string
    logo_url: string
    favicon_url: string
  }
  business: {
    gst: string
    pan: string
    tan: string
    cin: string
  }
  contact: {
    support_email: string
    phone: string
    whatsapp: string
    address: string
    city: string
    state: string
    pincode: string
  }
  smtp: {
    host: string
    port: string
    user: string
    password: string
    from_email: string
    secure: boolean
  }
  resend: {
    api_key: string
    from_email: string
  }
  supabase: {
    url: string
    anon_key: string
    service_role_key: string
  }
  razorpay: {
    key_id: string
    key_secret: string
    webhook_secret: string
  }
  analytics: {
    google_tracking_id: string
    facebook_pixel_id: string
    hotjar_id: string
  }
  social: {
    facebook: string
    instagram: string
    twitter: string
    linkedin: string
    youtube: string
  }
  theme: {
    primary_color: string
    dark_mode: boolean
    rounded_corners: boolean
  }
}

export const initialSettings: AdminSettings = {
  company: {
    name: "Feenix Repair",
    tagline: "Premium Mobile Repair Parts",
    logo_url: "",
    favicon_url: "",
  },
  business: {
    gst: "07AABCU9607R1ZN",
    pan: "AABCU9607R",
    tan: "",
    cin: "",
  },
  contact: {
    support_email: "support@feenix.com",
    phone: "+91 1800 123 4567",
    whatsapp: "+91 98765 43210",
    address: "123 Industrial Area, Phase 1",
    city: "New Delhi",
    state: "Delhi",
    pincode: "110001",
  },
  smtp: {
    host: "smtp.resend.com",
    port: "465",
    user: "resend",
    password: "",
    from_email: "noreply@feenix.com",
    secure: true,
  },
  resend: {
    api_key: "",
    from_email: "noreply@feenix.com",
  },
  supabase: {
    url: "",
    anon_key: "",
    service_role_key: "",
  },
  razorpay: {
    key_id: "",
    key_secret: "",
    webhook_secret: "",
  },
  analytics: {
    google_tracking_id: "",
    facebook_pixel_id: "",
    hotjar_id: "",
  },
  social: {
    facebook: "",
    instagram: "",
    twitter: "",
    linkedin: "",
    youtube: "",
  },
  theme: {
    primary_color: "#3b82f6",
    dark_mode: false,
    rounded_corners: true,
  },
}

export const settingsSectionLabels: { value: SettingsSection; label: string }[] = [
  { value: "company", label: "Company" },
  { value: "business", label: "Business Info" },
  { value: "contact", label: "Contact" },
  { value: "smtp", label: "SMTP" },
  { value: "resend", label: "Resend Email" },
  { value: "supabase", label: "Supabase" },
  { value: "razorpay", label: "Razorpay" },
  { value: "analytics", label: "Analytics" },
  { value: "social", label: "Social Links" },
  { value: "theme", label: "Theme" },
]
