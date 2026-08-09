import { SectionHeader } from "@/components/website/section-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Mail, Phone, MapPin, MessageCircle, Clock, Send } from "lucide-react"

export default function ContactPage() {
  return (
    <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-24 space-y-24">
      {/* Hero Section */}
      <SectionHeader
        title="Contact Us"
        description="Have questions? We'd love to hear from you. Get in touch with our team."
        align="center"
      />

      <div className="grid lg:grid-cols-3 gap-12">
        {/* Contact Form */}
        <div className="lg:col-span-2">
          <Card className="rounded-2xl border-slate-100 bg-white shadow-[0_4px_24px_-10px_rgba(30,41,59,0.06)] hover:shadow-[0_16px_40px_-18px_rgba(37,99,235,0.12)] transition-all duration-300">
            <CardHeader>
              <CardTitle>Send us a message</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" placeholder="John Doe" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" placeholder="john@example.com" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" placeholder="How can we help?" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  placeholder="Tell us more about your inquiry..."
                  rows={6}
                />
              </div>
              <Button className="w-full" size="lg">
                <Send className="h-4 w-4 mr-2" />
                Send Message
              </Button>
              <p className="text-xs text-slate-600 text-center">
                We'll get back to you within 24 hours.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Contact Information */}
        <div className="space-y-6">
          <Card className="rounded-2xl border-slate-100 bg-white shadow-[0_4px_24px_-10px_rgba(30,41,59,0.06)] hover:shadow-[0_16px_40px_-18px_rgba(37,99,235,0.12)] transition-all duration-300">
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-blue-600/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Mail className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium mb-1">Email</p>
                  <a href="mailto:support@feenixrepair.com" className="text-slate-600 hover:text-blue-600">
                    support@feenixrepair.com
                  </a>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-blue-600/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Phone className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium mb-1">Phone</p>
                  <a href="tel:+15551234567" className="text-slate-600 hover:text-blue-600">
                    +1 (555) 123-4567
                  </a>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-blue-600/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MapPin className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium mb-1">Address</p>
                  <p className="text-slate-600">
                    123 Business Avenue<br />
                    Suite 100<br />
                    New York, NY 10001
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* WhatsApp Button */}
          <Card className="rounded-2xl border-slate-100 bg-white shadow-[0_4px_24px_-10px_rgba(30,41,59,0.06)] hover:shadow-[0_16px_40px_-18px_rgba(37,99,235,0.12)] transition-all duration-300">
            <CardContent className="p-6">
              <Button className="w-full" variant="outline" size="lg">
                <MessageCircle className="h-5 w-5 mr-2 text-green-500" />
                Chat on WhatsApp
              </Button>
              <p className="text-xs text-slate-600 text-center mt-2">
                Quick responses guaranteed
              </p>
            </CardContent>
          </Card>

          {/* Business Hours */}
          <Card className="rounded-2xl border-slate-100 bg-white shadow-[0_4px_24px_-10px_rgba(30,41,59,0.06)] hover:shadow-[0_16px_40px_-18px_rgba(37,99,235,0.12)] transition-all duration-300">
            <CardHeader>
              <CardTitle>Business Hours</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-slate-500" />
                  <span className="text-slate-600">Monday - Friday</span>
                </div>
                <span className="font-medium">9:00 AM - 6:00 PM</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-slate-500" />
                  <span className="text-slate-600">Saturday</span>
                </div>
                <span className="font-medium">10:00 AM - 4:00 PM</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-slate-500" />
                  <span className="text-slate-600">Sunday</span>
                </div>
                <span className="font-medium">Closed</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Google Maps Placeholder */}
      <Card className="rounded-2xl border-slate-100 bg-white shadow-[0_4px_24px_-10px_rgba(30,41,59,0.06)] hover:shadow-[0_16px_40px_-18px_rgba(37,99,235,0.12)] transition-all duration-300">
        <CardContent className="p-0">
          <div className="aspect-video bg-slate-100 flex items-center justify-center">
            <div className="text-center space-y-2">
              <MapPin className="h-12 w-12 text-slate-400 mx-auto" />
              <p className="text-slate-600">Google Maps Integration</p>
              <p className="text-sm text-slate-600">
                123 Business Avenue, New York, NY 10001
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
