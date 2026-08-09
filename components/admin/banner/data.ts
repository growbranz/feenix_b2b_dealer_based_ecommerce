export type BannerStatus = "ACTIVE" | "INACTIVE"

export interface AdminBanner {
  id: string
  title: string
  desktop_url: string | null
  mobile_url: string | null
  link: string
  priority: number
  status: BannerStatus
  start_date: string
  end_date: string
  created_at: string
}

export const mockBanners: AdminBanner[] = [
  {
    id: "1",
    title: "Summer Sale",
    desktop_url: null,
    mobile_url: null,
    link: "/products",
    priority: 1,
    status: "ACTIVE",
    start_date: "2026-06-01",
    end_date: "2026-06-30",
    created_at: "2026-05-20T08:00:00Z",
  },
  {
    id: "2",
    title: "New Arrivals",
    desktop_url: null,
    mobile_url: null,
    link: "/new",
    priority: 2,
    status: "ACTIVE",
    start_date: "2026-07-01",
    end_date: "2026-07-31",
    created_at: "2026-06-25T08:00:00Z",
  },
  {
    id: "3",
    title: "Dealer Program",
    desktop_url: null,
    mobile_url: null,
    link: "/dealer/register",
    priority: 3,
    status: "INACTIVE",
    start_date: "2026-08-01",
    end_date: "2026-08-31",
    created_at: "2026-07-01T08:00:00Z",
  },
]
