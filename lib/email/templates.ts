const colors = {
  primary: "#f97316",
  secondary: "#1e293b",
  bg: "#f8fafc",
  surface: "#ffffff",
  text: "#334155",
  muted: "#64748b",
  border: "#e2e8f0",
}

export interface EmailTemplateData {
  subject: string
  html: string
  preheader?: string
}

function baseTemplate(title: string, bodyHtml: string, settings?: any): string {
  const brandName = settings?.sender_name || "Feenix Repair"
  const logo = settings?.company_logo
  const primary = settings?.primary_color || colors.primary
  const footer = settings?.footer_content || `© ${new Date().getFullYear()} Feenix Repair. All rights reserved.`

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)}</title>
  <style>
    body { margin: 0; padding: 0; background-color: ${colors.bg}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: ${colors.text}; }
    .wrapper { max-width: 640px; margin: 0 auto; padding: 24px; }
    .card { background: ${colors.surface}; border-radius: 12px; overflow: hidden; border: 1px solid ${colors.border}; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
    .header { background: ${colors.secondary}; padding: 24px; text-align: center; }
    .header a { color: #fff; font-size: 20px; font-weight: 700; text-decoration: none; }
    .content { padding: 32px; }
    .footer { padding: 24px; text-align: center; font-size: 12px; color: ${colors.muted}; }
    .btn { display: inline-block; background: ${primary}; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; }
    table { width: 100%; border-collapse: collapse; margin-top: 16px; }
    th, td { padding: 10px; border-bottom: 1px solid ${colors.border}; text-align: left; font-size: 14px; }
    th { font-weight: 600; color: ${colors.secondary}; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <div class="header">
        ${logo ? `<img src="${logo}" alt="${escapeHtml(brandName)}" height="32" />` : `<a href="#">${escapeHtml(brandName)}</a>`}
      </div>
      <div class="content">
        ${bodyHtml}
      </div>
      <div class="footer">
        ${footer}
      </div>
    </div>
  </div>
</body>
</html>`
}

export function escapeHtml(text: string): string {
  if (!text) return ""
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}

export function section(title: string, body: string): string {
  return `<h2 style="color:${colors.secondary};font-size:18px;margin-bottom:8px;">${escapeHtml(title)}</h2><p style="line-height:1.6;">${body}</p>`
}

export function button(label: string, href: string): string {
  return `<a class="btn" href="${href}" style="margin-top:16px;display:inline-block;">${escapeHtml(label)}</a>`
}

function orderItemsTable(items: any[]): string {
  if (!items?.length) return ""
  const rows = items
    .map(
      (i: any) =>
        `<tr><td>${escapeHtml(i.name || i.product?.title || i.title || "Product")}</td><td>${i.quantity || 1}</td><td>₹${i.price || i.unit_price || 0}</td><td>₹${(i.quantity || 1) * (i.price || i.unit_price || 0)}</td></tr>`
    )
    .join("")
  return `<table><thead><tr><th>Product</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead><tbody>${rows}</tbody></table>`
}

function summaryRow(label: string, value: string): string {
  return `<tr><td style="color:${colors.muted};">${escapeHtml(label)}</td><td style="text-align:right;font-weight:600;">${value}</td></tr>`
}

export function compileTemplate(key: string, data: Record<string, any>, settings?: any): EmailTemplateData {
  const brand = settings?.sender_name || "Feenix Repair"
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

  switch (key) {
    case "welcome":
      return {
        subject: `Welcome to ${brand}`,
        html: baseTemplate(
          "Welcome",
          section(`Hi ${data.name || "there"},`, `Welcome to ${escapeHtml(brand)}. We're excited to have you on board.`)
            + `<p style="line-height:1.6;">Get started by exploring your dashboard.</p>`
            + button("Go to Dashboard", `${baseUrl}/dealer`),
          settings
        ),
      }
    case "email-verification":
      return {
        subject: "Verify your email",
        html: baseTemplate(
          "Verify Email",
          section("Verify your email address", `Click the button below to verify your email address. This link expires in 24 hours.`)
            + button("Verify Email", data.link || "#"),
          settings
        ),
      }
    case "password-reset":
      return {
        subject: "Reset your password",
        html: baseTemplate(
          "Password Reset",
          section("Reset your password", `You requested a password reset. Click the button below to set a new password. This link expires in 1 hour.`)
            + button("Reset Password", data.link || "#"),
          settings
        ),
      }
    case "dealer-approved":
      return {
        subject: "Your dealer application is approved",
        html: baseTemplate(
          "Dealer Approved",
          section(`Hi ${data.name || ""},`, `Congratulations! Your dealer application has been approved. You can now list products and manage orders.`)
            + button("Open Dealer Panel", `${baseUrl}/dealer`),
          settings
        ),
      }
    case "dealer-rejected":
      return {
        subject: "Update on your dealer application",
        html: baseTemplate(
          "Dealer Application",
          section(`Hi ${data.name || ""},`, `We regret to inform you that your dealer application could not be approved at this time. Reason: ${escapeHtml(data.reason || "does not meet current criteria")}.`),
          settings
        ),
      }
    case "customer-registration":
      return {
        subject: `Welcome to ${brand}`,
        html: baseTemplate(
          "Welcome",
          section(`Hi ${data.name || "there"},`, `Your account has been created successfully. Start browsing spare parts and place your first order.`)
            + button("Browse Products", `${baseUrl}/products`),
          settings
        ),
      }
    case "order-created":
      return {
        subject: `Order received - ${data.orderNumber || data.order_number || ""}`,
        html: baseTemplate(
          "Order Created",
          section(`Hi ${data.name || ""},`, `We have received your order ${escapeHtml(data.orderNumber || data.order_number || "")}. You will be notified once it is confirmed.`)
            + `<table>${summaryRow("Order", data.orderNumber || data.order_number || "")}${summaryRow("Total", `₹${data.total || 0}`)}${summaryRow("Status", data.status || "PENDING")}</table>`
            + button("View Order", data.link || `${baseUrl}/dealer/orders`),
          settings
        ),
      }
    case "order-confirmed":
      return {
        subject: `Order confirmed - ${data.orderNumber || data.order_number || ""}`,
        html: baseTemplate(
          "Order Confirmed",
          section(`Hi ${data.name || ""},`, `Your order ${escapeHtml(data.orderNumber || data.order_number || "")} has been confirmed and is being processed.`)
            + `<table>${summaryRow("Order", data.orderNumber || data.order_number || "")}${summaryRow("Total", `₹${data.total || 0}`)}</table>`
            + button("View Order", data.link || `${baseUrl}/dealer/orders`),
          settings
        ),
      }
    case "order-shipped":
      return {
        subject: `Order shipped - ${data.orderNumber || data.order_number || ""}`,
        html: baseTemplate(
          "Order Shipped",
          section(`Hi ${data.name || ""},`, `Great news! Your order ${escapeHtml(data.orderNumber || data.order_number || "")} has been shipped.`)
            + (data.tracking ? `<p>Tracking: ${escapeHtml(data.tracking)}</p>` : "")
            + button("Track Order", data.link || `${baseUrl}/dealer/orders`),
          settings
        ),
      }
    case "order-delivered":
      return {
        subject: `Order delivered - ${data.orderNumber || data.order_number || ""}`,
        html: baseTemplate(
          "Order Delivered",
          section(`Hi ${data.name || ""},`, `Your order ${escapeHtml(data.orderNumber || data.order_number || "")} has been delivered. We hope you are satisfied with your purchase.`)
            + button("View Order", data.link || `${baseUrl}/dealer/orders`),
          settings
        ),
      }
    case "invoice-generated":
      return {
        subject: `Invoice for order ${data.orderNumber || data.order_number || ""}`,
        html: baseTemplate(
          "Invoice Generated",
          section(`Hi ${data.name || ""},`, `Your invoice for order ${escapeHtml(data.orderNumber || data.order_number || "")} is ready.`)
            + `<table>${summaryRow("Invoice", data.invoiceNumber || "")}${summaryRow("Amount", `₹${data.total || 0}`)}</table>`
            + button("Download Invoice", data.link || `${baseUrl}/admin/payments`),
          settings
        ),
      }
    case "payment-success":
      return {
        subject: "Payment successful",
        html: baseTemplate(
          "Payment Successful",
          section(`Hi ${data.name || ""},`, `We received your payment of ₹${data.amount || 0} for order ${escapeHtml(data.orderNumber || data.order_number || "")}.`)
            + `<table>${summaryRow("Transaction ID", data.transactionId || "")}${summaryRow("Amount", `₹${data.amount || 0}`)}</table>`
            + button("View Receipt", data.link || `${baseUrl}/dealer/payments`),
          settings
        ),
      }
    case "payment-failed":
      return {
        subject: "Payment failed",
        html: baseTemplate(
          "Payment Failed",
          section(`Hi ${data.name || ""},`, `Your payment of ₹${data.amount || 0} for order ${escapeHtml(data.orderNumber || data.order_number || "")} could not be processed. Reason: ${escapeHtml(data.reason || "transaction declined")}.`)
            + button("Retry Payment", data.link || `${baseUrl}/dealer/orders`),
          settings
        ),
      }
    case "refund-completed":
      return {
        subject: "Refund completed",
        html: baseTemplate(
          "Refund Completed",
          section(`Hi ${data.name || ""},`, `A refund of ₹${data.amount || 0} has been processed for order ${escapeHtml(data.orderNumber || data.order_number || "")}. It may take 5-10 business days to reflect.`)
            + `<table>${summaryRow("Refund Amount", `₹${data.amount || 0}`)}${summaryRow("Order", data.orderNumber || data.order_number || "")}</table>`,
          settings
        ),
      }
    case "enquiry-assigned":
      return {
        subject: "Enquiry assigned",
        html: baseTemplate(
          "Enquiry Assigned",
          section(`Hi ${data.name || ""},`, `You have been assigned a new enquiry: ${escapeHtml(data.title || data.subject || "")}.`)
            + button("View Enquiry", data.link || `${baseUrl}/dealer/enquiries`),
          settings
        ),
      }
    case "quotation-sent":
      return {
        subject: "Quotation sent",
        html: baseTemplate(
          "Quotation Sent",
          section(`Hi ${data.name || ""},`, `Your quotation has been sent for enquiry ${escapeHtml(data.title || "")}.`)
            + button("View Quotation", data.link || "#"),
          settings
        ),
      }
    case "inventory-low":
      return {
        subject: "Low stock alert",
        html: baseTemplate(
          "Low Stock Alert",
          section("Inventory Alert", `The product <strong>${escapeHtml(data.product || data.productName || "")}</strong> is running low. Current stock: ${data.availableStock || data.available_stock || 0}.`)
            + button("Manage Inventory", data.link || `${baseUrl}/admin/inventory`),
          settings
        ),
      }
    case "notification":
    default:
      return {
        subject: data.subject || "Notification",
        html: baseTemplate(
          data.subject || "Notification",
          `<p style="line-height:1.6;">${escapeHtml(data.message || "")}</p>`
            + (data.link ? button("View", data.link) : ""),
          settings
        ),
      }
  }
}
