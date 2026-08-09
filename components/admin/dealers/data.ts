
export type DealerStatus = "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED"

export type BusinessType = "Retailer" | "Wholesaler" | "Manufacturer" | "Service Center"

export interface AdminDealer {
  id: string
  business_name: string
  owner_name: string
  business_type: BusinessType
  gst: string
  pan: string
  phone: string
  email: string
  address: string
  city: string
  state: string
  pincode: string
  status: DealerStatus
  products_count: number
  orders_count: number
  registered_at: string
  logo?: string | null
  documents?: {
    gst_certificate?: string | null
    pan_card?: string | null
    business_license?: string | null
  }
  rejection_reason?: string | null
}

export const businessTypeColors: Record<BusinessType, string> = {
  Retailer: "bg-emerald-500/10 text-emerald-600",
  Wholesaler: "bg-blue-500/10 text-blue-600",
  Manufacturer: "bg-violet-500/10 text-violet-600",
  "Service Center": "bg-amber-500/10 text-amber-600",
}

export const mockDealers: AdminDealer[] = [
  {
    id: "1",
    business_name: "TechFix Solutions",
    owner_name: "Rahul Sharma",
    business_type: "Retailer",
    gst: "27AABCT1234A1Z5",
    pan: "AABCT1234A",
    phone: "+91 98765 43210",
    email: "rahul@techfix.in",
    address: "12, M.G. Road, Andheri East",
    city: "Mumbai",
    state: "Maharashtra",
    pincode: "400069",
    status: "PENDING",
    products_count: 0,
    orders_count: 0,
    registered_at: "2026-07-22T10:30:00Z",
    logo: null,
    documents: { gst_certificate: "gst.pdf", pan_card: "pan.pdf" },
  },
  {
    id: "2",
    business_name: "MobileSpares Inc.",
    owner_name: "Priya Patel",
    business_type: "Wholesaler",
    gst: "24AABCP5678B1Z2",
    pan: "AABCP5678B",
    phone: "+91 98765 43211",
    email: "priya@mobilespares.in",
    address: "45, GIDC Estate",
    city: "Ahmedabad",
    state: "Gujarat",
    pincode: "380015",
    status: "APPROVED",
    products_count: 142,
    orders_count: 89,
    registered_at: "2026-06-15T08:00:00Z",
    logo: null,
  },
  {
    id: "3",
    business_name: "PhoneCare Hub",
    owner_name: "Amit Verma",
    business_type: "Service Center",
    gst: "07AAACC9012C1Z8",
    pan: "AAACC9012C",
    phone: "+91 98765 43212",
    email: "amit@phonecare.com",
    address: "78, Lajpat Nagar",
    city: "New Delhi",
    state: "Delhi",
    pincode: "110024",
    status: "APPROVED",
    products_count: 67,
    orders_count: 34,
    registered_at: "2026-05-20T09:15:00Z",
    logo: null,
  },
  {
    id: "4",
    business_name: "DisplayMax",
    owner_name: "Sneha Iyer",
    business_type: "Manufacturer",
    gst: "29AADDE3456D1Z9",
    pan: "AADDE3456D",
    phone: "+91 98765 43213",
    email: "sneha@displaymax.in",
    address: "21, Electronics City",
    city: "Bengaluru",
    state: "Karnataka",
    pincode: "560100",
    status: "SUSPENDED",
    products_count: 210,
    orders_count: 120,
    registered_at: "2026-04-10T11:30:00Z",
    logo: null,
  },
  {
    id: "5",
    business_name: "BatteryWorld",
    owner_name: "Karan Gupta",
    business_type: "Retailer",
    gst: "33AABCG7890E1Z1",
    pan: "AABCG7890E",
    phone: "+91 98765 43214",
    email: "karan@batteryworld.in",
    address: "3, R.S. Puram",
    city: "Coimbatore",
    state: "Tamil Nadu",
    pincode: "641002",
    status: "PENDING",
    products_count: 0,
    orders_count: 0,
    registered_at: "2026-07-21T16:45:00Z",
    logo: null,
  },
  {
    id: "6",
    business_name: "Circuit Repair",
    owner_name: "Neha Reddy",
    business_type: "Service Center",
    gst: "36AABCH2345F1Z4",
    pan: "AABCH2345F",
    phone: "+91 98765 43215",
    email: "neha@circuitrepair.in",
    address: "55, Banjara Hills",
    city: "Hyderabad",
    state: "Telangana",
    pincode: "500034",
    status: "REJECTED",
    products_count: 0,
    orders_count: 0,
    registered_at: "2026-07-20T13:20:00Z",
    logo: null,
    rejection_reason: "Incomplete GST documentation",
  },
  {
    id: "7",
    business_name: "PartSource Global",
    owner_name: "Vikram Joshi",
    business_type: "Wholesaler",
    gst: "19AABCJ8765G1Z6",
    pan: "AABCJ8765G",
    phone: "+91 98765 43216",
    email: "vikram@partsource.in",
    address: "9, Park Street",
    city: "Kolkata",
    state: "West Bengal",
    pincode: "700016",
    status: "APPROVED",
    products_count: 312,
    orders_count: 156,
    registered_at: "2026-03-05T07:00:00Z",
    logo: null,
  },
  {
    id: "8",
    business_name: "ScreenFix Pro",
    owner_name: "Ananya Nair",
    business_type: "Retailer",
    gst: "32AABCK5432H1Z3",
    pan: "AABCK5432H",
    phone: "+91 98765 43217",
    email: "ananya@screenfix.in",
    address: "17, MG Road",
    city: "Kochi",
    state: "Kerala",
    pincode: "682035",
    status: "PENDING",
    products_count: 0,
    orders_count: 0,
    registered_at: "2026-07-22T08:10:00Z",
    logo: null,
  },
]

export const statusOptions: { value: string; label: string }[] = [
  { value: "all", label: "All Status" },
  { value: "PENDING", label: "Pending" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
  { value: "SUSPENDED", label: "Suspended" },
]

export const stateOptions: { value: string; label: string }[] = [
  { value: "all", label: "All States" },
  ...Array.from(new Set(mockDealers.map((d) => d.state))).sort().map((s) => ({ value: s, label: s })),
]

export const businessTypeOptions: { value: string; label: string }[] = [
  { value: "all", label: "All Types" },
  { value: "Retailer", label: "Retailer" },
  { value: "Wholesaler", label: "Wholesaler" },
  { value: "Manufacturer", label: "Manufacturer" },
  { value: "Service Center", label: "Service Center" },
]

export interface Activity {
  id: string
  action: string
  timestamp: string
  actor: string
}

export const mockActivities: Record<string, Activity[]> = {
  "1": [
    { id: "a1", action: "Registration submitted", timestamp: "2026-07-22T10:30:00Z", actor: "Rahul Sharma" },
    { id: "a2", action: "Documents uploaded", timestamp: "2026-07-22T10:32:00Z", actor: "Rahul Sharma" },
  ],
  "2": [
    { id: "a1", action: "Registration submitted", timestamp: "2026-06-15T08:00:00Z", actor: "Priya Patel" },
    { id: "a2", action: "Approved by admin", timestamp: "2026-06-15T12:00:00Z", actor: "System Admin" },
    { id: "a3", action: "First product listed", timestamp: "2026-06-16T09:00:00Z", actor: "Priya Patel" },
  ],
}
