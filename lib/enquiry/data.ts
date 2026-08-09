export type EnquiryStatus =
  | "NEW"
  | "ASSIGNED"
  | "ACCEPTED"
  | "REJECTED"
  | "QUOTED"
  | "NEGOTIATION"
  | "CLOSED"
  | "CANCELLED"

export type EnquiryPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT"
export type DealerResponseStatus = "PENDING" | "ACCEPTED" | "REJECTED" | "CLARIFICATION" | "QUOTED"

export interface EnquiryAttachment {
  id: string
  name: string
  url: string
}

export interface DealerResponse {
  id: string
  dealer_id: string
  dealer_name: string
  status: DealerResponseStatus
  price?: number | null
  delivery_days?: number | null
  warranty?: string
  remarks?: string
  created_at: string
}

export interface InternalNote {
  id: string
  author: string
  text: string
  timestamp: string
}

export interface TimelineEvent {
  id: string
  action: string
  actor: string
  timestamp: string
  note?: string
}

export interface Enquiry {
  id: string
  customer_name: string
  phone: string
  email: string
  city: string
  state: string
  business_name: string
  product_name: string
  brand_id: string
  brand_name: string
  category_id: string
  category_name: string
  model_id: string
  model_name: string
  quantity: number
  preferred_condition: string
  message: string
  attachments: EnquiryAttachment[]
  priority: EnquiryPriority
  status: EnquiryStatus
  assigned_dealer_ids: string[]
  responses: DealerResponse[]
  notes: InternalNote[]
  timeline: TimelineEvent[]
  created_at: string
  updated_at: string
}

const now = new Date()
const date = (daysAgo: number) => new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000).toISOString()

export const mockEnquiries: Enquiry[] = [
  {
    id: "E-1001",
    customer_name: "Ravi Kumar",
    phone: "+91 98765 43210",
    email: "ravi@mobilecare.in",
    city: "Delhi",
    state: "Delhi",
    business_name: "Mobile Care",
    product_name: "iPhone 14 Pro OLED Display",
    brand_id: "1",
    brand_name: "Apple",
    category_id: "1",
    category_name: "Displays",
    model_id: "1",
    model_name: "iPhone 14 Pro",
    quantity: 10,
    preferred_condition: "New",
    message: "Need 10 displays for upcoming repairs. Best wholesale rate please.",
    attachments: [{ id: "a1", name: "invoice-ref.pdf", url: "#" }],
    priority: "HIGH",
    status: "NEW",
    assigned_dealer_ids: [],
    responses: [],
    notes: [],
    timeline: [
      { id: "t1", action: "Enquiry submitted", actor: "Ravi Kumar", timestamp: date(0) },
    ],
    created_at: date(0),
    updated_at: date(0),
  },
  {
    id: "E-1002",
    customer_name: "Priya Sharma",
    phone: "+91 99887 76655",
    email: "priya@phonewala.com",
    city: "Mumbai",
    state: "Maharashtra",
    business_name: "Phone Wala",
    product_name: "Samsung S23 Ultra Battery",
    brand_id: "2",
    brand_name: "Samsung",
    category_id: "2",
    category_name: "Batteries",
    model_id: "2",
    model_name: "Galaxy S23 Ultra",
    quantity: 50,
    preferred_condition: "New",
    message: "Require 50 batteries monthly. Share quotation.",
    attachments: [],
    priority: "MEDIUM",
    status: "ASSIGNED",
    assigned_dealer_ids: ["2"],
    responses: [],
    notes: [],
    timeline: [
      { id: "t1", action: "Enquiry submitted", actor: "Priya Sharma", timestamp: date(1) },
      { id: "t2", action: "Assigned to MobileSpares Inc.", actor: "Admin", timestamp: date(0) },
    ],
    created_at: date(1),
    updated_at: date(0),
  },
  {
    id: "E-1003",
    customer_name: "Amit Verma",
    phone: "+91 90123 45678",
    email: "amit@repairhub.in",
    city: "Bangalore",
    state: "Karnataka",
    business_name: "Repair Hub",
    product_name: "OnePlus 11 Charging Port",
    brand_id: "3",
    brand_name: "OnePlus",
    category_id: "3",
    category_name: "Charging Ports",
    model_id: "3",
    model_name: "OnePlus 11",
    quantity: 25,
    preferred_condition: "New",
    message: "Looking for bulk USB-C charging ports.",
    attachments: [],
    priority: "URGENT",
    status: "QUOTED",
    assigned_dealer_ids: ["2", "3"],
    responses: [
      { id: "r1", dealer_id: "2", dealer_name: "MobileSpares Inc.", status: "QUOTED", price: 599, delivery_days: 3, warranty: "1 month", remarks: "Immediate stock available", created_at: date(0) },
    ],
    notes: [{ id: "n1", author: "Admin", text: "Customer needs fast delivery.", timestamp: date(0) }],
    timeline: [
      { id: "t1", action: "Enquiry submitted", actor: "Amit Verma", timestamp: date(2) },
      { id: "t2", action: "Assigned to 2 dealers", actor: "Admin", timestamp: date(1) },
      { id: "t3", action: "Quotation received", actor: "MobileSpares Inc.", timestamp: date(0) },
    ],
    created_at: date(2),
    updated_at: date(0),
  },
  {
    id: "E-1004",
    customer_name: "Sneha Patel",
    phone: "+91 91234 56789",
    email: "sneha@displaymax.in",
    city: "Ahmedabad",
    state: "Gujarat",
    business_name: "DisplayMax",
    product_name: "Xiaomi 13 Rear Camera",
    brand_id: "4",
    brand_name: "Xiaomi",
    category_id: "3",
    category_name: "Cameras",
    model_id: "4",
    model_name: "Xiaomi 13",
    quantity: 5,
    preferred_condition: "New",
    message: "Need genuine rear camera module.",
    attachments: [],
    priority: "LOW",
    status: "REJECTED",
    assigned_dealer_ids: ["4"],
    responses: [
      { id: "r1", dealer_id: "4", dealer_name: "DisplayMax", status: "REJECTED", price: null, delivery_days: null, warranty: "", remarks: "Out of stock", created_at: date(0) },
    ],
    notes: [],
    timeline: [
      { id: "t1", action: "Enquiry submitted", actor: "Sneha Patel", timestamp: date(3) },
      { id: "t2", action: "Assigned to DisplayMax", actor: "Admin", timestamp: date(2) },
      { id: "t3", action: "Dealer rejected", actor: "DisplayMax", timestamp: date(1) },
    ],
    created_at: date(3),
    updated_at: date(1),
  },
  {
    id: "E-1005",
    customer_name: "Karthik Rao",
    phone: "+91 93456 78901",
    email: "karthik@techfix.in",
    city: "Hyderabad",
    state: "Telangana",
    business_name: "TechFix",
    product_name: "Realme GT Neo 3 Display",
    brand_id: "",
    brand_name: "Realme",
    category_id: "1",
    category_name: "Displays",
    model_id: "",
    model_name: "Realme GT Neo 3",
    quantity: 15,
    preferred_condition: "New",
    message: "Need 15 displays for repair jobs.",
    attachments: [],
    priority: "MEDIUM",
    status: "NEGOTIATION",
    assigned_dealer_ids: ["3"],
    responses: [
      { id: "r1", dealer_id: "3", dealer_name: "PhoneCare Hub", status: "QUOTED", price: 1899, delivery_days: 5, warranty: "3 months", remarks: "Bulk discount available", created_at: date(0) },
    ],
    notes: [],
    timeline: [
      { id: "t1", action: "Enquiry submitted", actor: "Karthik Rao", timestamp: date(4) },
      { id: "t2", action: "Assigned to PhoneCare Hub", actor: "Admin", timestamp: date(3) },
      { id: "t3", action: "Quotation received", actor: "PhoneCare Hub", timestamp: date(1) },
      { id: "t4", action: "Negotiation started", actor: "Admin", timestamp: date(0) },
    ],
    created_at: date(4),
    updated_at: date(0),
  },
]

export const statusOptions: { value: string; label: string }[] = [
  { value: "all", label: "All Status" },
  { value: "NEW", label: "New" },
  { value: "ASSIGNED", label: "Assigned" },
  { value: "ACCEPTED", label: "Accepted" },
  { value: "REJECTED", label: "Rejected" },
  { value: "QUOTED", label: "Quoted" },
  { value: "NEGOTIATION", label: "Negotiation" },
  { value: "CLOSED", label: "Closed" },
  { value: "CANCELLED", label: "Cancelled" },
]

export const priorityOptions: { value: string; label: string }[] = [
  { value: "all", label: "All Priorities" },
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
  { value: "URGENT", label: "Urgent" },
]

export const dealerOptions = [
  { id: "1", name: "Feenix Store" },
  { id: "2", name: "MobileSpares Inc." },
  { id: "3", name: "PhoneCare Hub" },
  { id: "4", name: "DisplayMax" },
]

export function dealerName(id: string): string {
  return dealerOptions.find((d) => d.id === id)?.name || "Unknown"
}
