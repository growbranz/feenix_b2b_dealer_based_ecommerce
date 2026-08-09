import Razorpay from "razorpay"

let _client: any = null

export function getRazorpay(): any {
  if (_client) return _client

  const keyId = process.env.RAZORPAY_KEY_ID
  const keySecret = process.env.RAZORPAY_KEY_SECRET

  if (!keyId || !keySecret) {
    throw new Error("Razorpay keys are not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.")
  }

  _client = new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  })

  return _client
}

export const NEXT_PUBLIC_RAZORPAY_KEY_ID =
  process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID || ""
