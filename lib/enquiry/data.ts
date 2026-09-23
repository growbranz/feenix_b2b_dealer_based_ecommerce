export type EnquiryStatus =
  | "PENDING"
  | "ASSIGNED"
  | "ACCEPTED"
  | "REJECTED"
  | "COMPLETED"

export type EnquiryPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT"

export const statusOptions: { value: string; label: string }[] = [
  { value: "all", label: "All Status" },
  { value: "PENDING", label: "Pending" },
  { value: "ASSIGNED", label: "Assigned" },
  { value: "ACCEPTED", label: "Accepted" },
  { value: "REJECTED", label: "Rejected" },
  { value: "COMPLETED", label: "Completed" },
]

export const priorityOptions: { value: string; label: string }[] = [
  { value: "all", label: "All Priorities" },
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
  { value: "URGENT", label: "Urgent" },
]
