"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Mail, Phone, MapPin, MessageCircle, Clock, Send, Lock, ShieldCheck, Headphones, Globe, Zap, HelpCircle, ArrowRight, MessageSquare, FileText, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getSettings, type SettingsData } from "@/lib/settings/actions"

export default function ContactPage() {
  const [settings, setSettings] = React.useState<SettingsData | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [submitting, setSubmitting] = React.useState(false)
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null)
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)
  const [formData, setFormData] = React.useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  })

  React.useEffect(() => {
    loadSettings()
  }, [])

  async function loadSettings() {
    try {
      const data = await getSettings()
      setSettings(data)
    } catch (err) {
      console.error("Failed to load settings:", err)
    } finally {
      setLoading(false)
    }
  }

  const validateForm = () => {
    if (!formData.name.trim()) {
      setErrorMessage("Please enter your full name.")
      return false
    }
    if (!formData.email.trim()) {
      setErrorMessage("Please enter your email address.")
      return false
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setErrorMessage("Please enter a valid email address.")
      return false
    }
    if (!formData.subject) {
      setErrorMessage("Please select a subject.")
      return false
    }
    if (!formData.message.trim()) {
      setErrorMessage("Please enter your message.")
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)
    setSuccessMessage(null)

    if (!validateForm()) {
      return
    }

    setSubmitting(true)

    try {
      const formDataToSend = new FormData()
      formDataToSend.append("access_key", "47f1dcb8-5be7-4ff3-8c29-09fd95403cff")
      formDataToSend.append("name", formData.name)
      formDataToSend.append("email", formData.email)
      formDataToSend.append("subject", formData.subject)
      formDataToSend.append("message", formData.message)
      formDataToSend.append("replyto", formData.email)
      
      // Add a professional email subject
      const subjectLabels: Record<string, string> = {
        product_inquiry: "Product Inquiry",
        dealer_support: "Dealer Support",
        order_support: "Order Support",
        partnership: "Partnership",
        general: "General Inquiry",
        other: "Other"
      }
      const subjectLabel = subjectLabels[formData.subject] || formData.subject
      formDataToSend.append("from_name", "Feenix Repair Contact Form")
      formDataToSend.append("subject", `New Contact Form Submission - ${subjectLabel}`)

      // Convert FormData to JSON object for Web3Forms JSON method
      const object = Object.fromEntries(formDataToSend)

      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify(object),
      })

      const data = await response.json()

      console.log("[Web3Forms] HTTP status:", response.status)
      console.log("[Web3Forms] Response:", data)
      console.log("[Web3Forms] response.ok:", response.ok)
      console.log("[Web3Forms] data.success:", data.success)

      if (response.ok && data.success) {
        setSuccessMessage("Your message has been sent successfully. We'll get back to you soon.")
        setFormData({ name: "", email: "", subject: "", message: "" })
        setTimeout(() => setSuccessMessage(null), 5000)
      } else {
        console.error("[Web3Forms] Submission failed:", {
          status: response.status,
          success: data.success,
          message: data.message
        })
        setErrorMessage("Unable to send your message. Please try again.")
      }
    } catch (error) {
      console.error("[Web3Forms] Form submission error:", error)
      setErrorMessage("Something went wrong while sending your message. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-slate-50">
      {/* Decorative background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200/20 rounded-full blur-3xl" />
        <div className="absolute top-40 right-20 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-indigo-200/20 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-24 space-y-20">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="grid lg:grid-cols-2 gap-12 items-center"
        >
          {/* Left - Hero Content */}
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <p className="text-sm font-semibold text-blue-600 uppercase tracking-wider">
                We're Here For You
              </p>
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-5xl lg:text-6xl font-bold text-slate-900 leading-tight"
            >
              <span className="text-slate-900">Contact</span>
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Us</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-lg text-slate-600 max-w-lg"
            >
              Have questions? Need support? We'd love to hear from you. Get in touch with our team and we'll help you as soon as possible.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap gap-6"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Zap className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Quick Response</p>
                  <p className="text-sm text-slate-600">Within 24 hours</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Users className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Expert Support</p>
                  <p className="text-sm text-slate-600">From our team</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <HelpCircle className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Here to Help</p>
                  <p className="text-sm text-slate-600">Your success matters</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right - Visual */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="relative hidden lg:block"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-purple-100 rounded-3xl transform rotate-3" />
              <div className="relative bg-white rounded-3xl p-12 shadow-2xl">
                <div className="grid grid-cols-2 gap-4">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="bg-blue-50 rounded-2xl p-6 text-center"
                  >
                    <MessageSquare className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-slate-900">Ask Questions</p>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="bg-purple-50 rounded-2xl p-6 text-center"
                  >
                    <Headphones className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-slate-900">Get Support</p>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="bg-indigo-50 rounded-2xl p-6 text-center"
                  >
                    <FileText className="h-8 w-8 text-indigo-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-slate-900">Product Inquiries</p>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 }}
                    className="bg-pink-50 rounded-2xl p-6 text-center"
                  >
                    <Users className="h-8 w-8 text-pink-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-slate-900">Partnership</p>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-5 gap-8">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="lg:col-span-3"
          >
            <Card className="rounded-3xl border border-slate-100 bg-white shadow-[0_4px_24px_-10px_rgba(30,41,59,0.08)] hover:shadow-[0_16px_40px_-18px_rgba(37,99,235,0.12)] transition-all duration-300">
              <CardHeader className="pb-6">
                <CardTitle className="text-2xl font-bold text-slate-900">Send us a message</CardTitle>
                <p className="text-slate-600">Fill out the form below and we'll get back to you soon.</p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {successMessage && (
                    <div className="p-4 rounded-xl bg-green-50 border border-green-200 text-green-800">
                      {successMessage}
                    </div>
                  )}
                  {errorMessage && (
                    <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800">
                      {errorMessage}
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="rounded-xl border-slate-200 focus:border-blue-500 focus:ring-blue-500 h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="rounded-xl border-slate-200 focus:border-blue-500 focus:ring-blue-500 h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-blue-500 h-12 px-3 text-slate-700"
                    >
                      <option value="">Select a subject</option>
                      <option value="product_inquiry">Product Inquiry</option>
                      <option value="dealer_support">Dealer Support</option>
                      <option value="order_support">Order Support</option>
                      <option value="partnership">Partnership</option>
                      <option value="general">General Inquiry</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      name="message"
                      placeholder="Tell us more about your inquiry..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      rows={5}
                      className="rounded-xl border-slate-200 focus:border-blue-500 focus:ring-blue-500 resize-none"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="w-full h-12 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium shadow-lg shadow-blue-500/25 transition-all duration-300"
                  >
                    {submitting ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Sending...
                      </>
                    ) : (
                      <>
                        Send Message
                        <Send className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                  <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
                    <Lock className="h-3 w-3" />
                    <span>Your information is safe with us. We'll never share your details with third parties.</span>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="lg:col-span-2 space-y-6"
          >
            <Card className="rounded-3xl border border-slate-100 bg-white shadow-[0_4px_24px_-10px_rgba(30,41,59,0.08)] hover:shadow-[0_16px_40px_-18px_rgba(37,99,235,0.12)] transition-all duration-300">
              <CardHeader className="pb-6">
                <CardTitle className="text-xl font-bold text-slate-900">Contact Information</CardTitle>
                <p className="text-slate-600">Reach out to us through any of the following channels.</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Mail className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 mb-1">Email</p>
                    <a href={`mailto:${settings?.support_email || 'support@feenixrepair.com'}`} className="text-slate-600 hover:text-blue-600 transition-colors">
                      {settings?.support_email || 'support@feenixrepair.com'}
                    </a>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Phone className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 mb-1">Phone</p>
                    <a href={`tel:${settings?.support_phone || '+91 98765 43210'}`} className="text-slate-600 hover:text-blue-600 transition-colors">
                      {settings?.support_phone || '+91 98765 43210'}
                    </a>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 mb-1">Address</p>
                    <p className="text-slate-600 whitespace-pre-line">
                      {settings?.company_address || '123 Business Avenue\nSuite 100\nNew York, NY 10001'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* WhatsApp Card */}
            <Card className="rounded-3xl border border-slate-100 bg-white shadow-[0_4px_24px_-10px_rgba(30,41,59,0.08)] hover:shadow-[0_16px_40px_-18px_rgba(37,99,235,0.12)] transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <MessageCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">Chat on WhatsApp</p>
                      <p className="text-sm text-slate-600">Get instant responses to your questions.</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-xl border-green-200 text-green-600 hover:bg-green-50 hover:border-green-300"
                    onClick={() => window.open(`https://wa.me/${settings?.whatsapp_number?.replace(/\D/g, '') || '919876543210'}`, '_blank')}
                  >
                    Chat Now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Trusted Support Card */}
            <Card className="rounded-3xl border border-slate-100 bg-gradient-to-br from-blue-50 to-purple-50 shadow-[0_4px_24px_-10px_rgba(30,41,59,0.08)]">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                    <ShieldCheck className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">Trusted Support</p>
                    <p className="text-sm text-slate-600">Our team is committed to providing you with the best possible support.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Bottom Support Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="grid md:grid-cols-3 gap-6"
        >
          <Card className="rounded-2xl border border-slate-100 bg-white shadow-[0_4px_24px_-10px_rgba(30,41,59,0.08)] hover:shadow-[0_16px_40px_-18px_rgba(37,99,235,0.12)] transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Clock className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Response Time</p>
                  <p className="text-slate-600">Within 24 hours</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border border-slate-100 bg-white shadow-[0_4px_24px_-10px_rgba(30,41,59,0.08)] hover:shadow-[0_16px_40px_-18px_rgba(37,99,235,0.12)] transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Headphones className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Support Hours</p>
                  <p className="text-slate-600">Mon - Sat: 9 AM - 6 PM</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border border-slate-100 bg-white shadow-[0_4px_24px_-10px_rgba(30,41,59,0.08)] hover:shadow-[0_16px_40px_-18px_rgba(37,99,235,0.12)] transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Globe className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Global Support</p>
                  <p className="text-slate-600">We support customers worldwide</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
