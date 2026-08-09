"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Phone, Mail, MapPin, Clock, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

export function Contact() {
  return (
    <section className="py-24 bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold font-poppins mb-4">Contact Us</h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Get in touch with our team for any queries or support
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <div className="bg-white rounded-2xl p-6 border-2 border-slate-200 hover:border-blue-600/50 transition-all duration-300">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-blue-600/10 flex-shrink-0">
                  <Phone className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold font-poppins text-lg mb-1">Phone</h3>
                  <p className="text-slate-600">+91 98765 43210</p>
                  <p className="text-slate-600">+91 98765 43211</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border-2 border-slate-200 hover:border-blue-600/50 transition-all duration-300">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-blue-600/10 flex-shrink-0">
                  <Mail className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold font-poppins text-lg mb-1">Email</h3>
                  <p className="text-slate-600">support@feenixrepair.com</p>
                  <p className="text-slate-600">sales@feenixrepair.com</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border-2 border-slate-200 hover:border-blue-600/50 transition-all duration-300">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-blue-600/10 flex-shrink-0">
                  <MapPin className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold font-poppins text-lg mb-1">Address</h3>
                  <p className="text-slate-600">
                    123 Business Park, Tech City<br />
                    Mumbai, Maharashtra 400001<br />
                    India
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border-2 border-slate-200 hover:border-blue-600/50 transition-all duration-300">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-blue-600/10 flex-shrink-0">
                  <Clock className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold font-poppins text-lg mb-1">Working Hours</h3>
                  <p className="text-slate-600">Mon - Sat: 9:00 AM - 6:00 PM</p>
                  <p className="text-slate-600">Sunday: Closed</p>
                </div>
              </div>
            </div>

            {/* Map Placeholder */}
            <div className="bg-white rounded-2xl overflow-hidden border-2 border-slate-200">
              <div className="h-64 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="h-12 w-12 text-slate-400 mx-auto mb-2" />
                  <p className="text-slate-600">Google Map Integration</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="bg-white rounded-2xl p-8 border-2 border-slate-200 hover:border-blue-600/50 transition-all duration-300">
              <h3 className="font-semibold font-poppins text-2xl mb-6">Send us a Message</h3>
              <form className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">First Name</label>
                    <Input placeholder="John" className="border-slate-200 focus:border-blue-600" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Last Name</label>
                    <Input placeholder="Doe" className="border-slate-200 focus:border-blue-600" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input type="email" placeholder="john@example.com" className="border-slate-200 focus:border-blue-600" />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Phone</label>
                  <Input type="tel" placeholder="+91 98765 43210" className="border-slate-200 focus:border-blue-600" />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Subject</label>
                  <Input placeholder="How can we help?" className="border-slate-200 focus:border-blue-600" />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Message</label>
                  <Textarea
                    placeholder="Tell us more about your query..."
                    className="min-h-32 border-slate-200 focus:border-blue-600 resize-none"
                  />
                </div>

                <Button type="submit" size="lg" className="w-full gap-2 bg-blue-600 hover:bg-blue-700">
                  <Send className="h-4 w-4" />
                  Send Message
                </Button>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
