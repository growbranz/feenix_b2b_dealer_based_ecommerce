import { SectionHeader } from "@/components/website/section-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Mail, Phone, MapPin, MessageCircle, Clock, Send } from "lucide-react"

export default function ContactPage() {
  return (
    <div className="container py-16 space-y-16">
      {/* Hero Section */}
      <SectionHeader
        title="Contact Us"
        description="Have questions? We'd love to hear from you. Get in touch with our team."
        align="center"
      />

      <div className="grid lg:grid-cols-3 gap-12">
        {/* Contact Form */}
        <div className="lg:col-span-2">
          <Card>
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
              <p className="text-xs text-muted-foreground text-center">
                We'll get back to you within 24 hours.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Contact Information */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium mb-1">Email</p>
                  <a href="mailto:support@feenixrepair.com" className="text-muted-foreground hover:text-primary">
                    support@feenixrepair.com
                  </a>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Phone className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium mb-1">Phone</p>
                  <a href="tel:+15551234567" className="text-muted-foreground hover:text-primary">
                    +1 (555) 123-4567
                  </a>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium mb-1">Address</p>
                  <p className="text-muted-foreground">
                    123 Business Avenue<br />
                    Suite 100<br />
                    New York, NY 10001
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* WhatsApp Button */}
          <Card>
            <CardContent className="p-6">
              <Button className="w-full" variant="outline" size="lg">
                <MessageCircle className="h-5 w-5 mr-2 text-green-500" />
                Chat on WhatsApp
              </Button>
              <p className="text-xs text-muted-foreground text-center mt-2">
                Quick responses guaranteed
              </p>
            </CardContent>
          </Card>

          {/* Business Hours */}
          <Card>
            <CardHeader>
              <CardTitle>Business Hours</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Monday - Friday</span>
                </div>
                <span className="font-medium">9:00 AM - 6:00 PM</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Saturday</span>
                </div>
                <span className="font-medium">10:00 AM - 4:00 PM</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Sunday</span>
                </div>
                <span className="font-medium">Closed</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Google Maps Placeholder */}
      <Card>
        <CardContent className="p-0">
          <div className="aspect-video bg-muted flex items-center justify-center">
            <div className="text-center space-y-2">
              <MapPin className="h-12 w-12 text-muted-foreground mx-auto" />
              <p className="text-muted-foreground">Google Maps Integration</p>
              <p className="text-sm text-muted-foreground">
                123 Business Avenue, New York, NY 10001
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
