import crypto from "crypto"

export function toPaisa(amount: number): number {
  return Math.round(amount * 100)
}

export function fromPaisa(paisa: number): number {
  return Math.round(paisa) / 100
}

export function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string,
  secret: string
): boolean {
  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex")

  try {
    return crypto.timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(signature, "hex"))
  } catch {
    return false
  }
}

export function verifyWebhookSignature(
  body: string,
  signature: string,
  secret: string
): boolean {
  const expected = crypto.createHmac("sha256", secret).update(body, "utf8").digest("hex")
  try {
    return crypto.timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(signature, "hex"))
  } catch {
    return false
  }
}

export function generateInvoiceNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `INV-${timestamp}-${random}`
}

export function formatCurrency(amount: number, currency: string = "INR"): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount)
}
