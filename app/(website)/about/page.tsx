import { SectionHeader } from "@/components/website/section-header"
import { Card, CardContent } from "@/components/ui/card"
import { Target, Users, Globe, Award, TrendingUp, Shield, Clock, Zap } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="container py-16 space-y-16">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold">About Feenix Repair</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Your trusted B2B marketplace for repair services and parts
        </p>
      </div>

      {/* Company Overview */}
      <section className="space-y-6">
        <SectionHeader
          title="Company Overview"
          description="Learn about our journey and commitment to excellence"
          align="center"
        />
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-lg text-muted-foreground leading-relaxed">
            Founded in 2020, Feenix Repair has grown from a small startup to a leading B2B marketplace 
            connecting thousands of dealers worldwide. Our platform was built on the belief that finding 
            quality repair parts should be simple, reliable, and efficient. Today, we serve over 10,000 
            verified dealers across 50+ countries, facilitating millions of transactions annually.
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="grid md:grid-cols-2 gap-8">
        <Card>
          <CardContent className="p-8">
            <Target className="h-12 w-12 text-primary mb-4" />
            <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
            <p className="text-muted-foreground leading-relaxed">
              To connect dealers worldwide with a reliable platform for buying and selling repair parts, 
              services, and equipment. We strive to make the B2B repair marketplace more efficient, 
              transparent, and accessible for everyone, regardless of their business size or location.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-8">
            <Globe className="h-12 w-12 text-primary mb-4" />
            <h2 className="text-2xl font-bold mb-4">Our Vision</h2>
            <p className="text-muted-foreground leading-relaxed">
              To become the world's leading B2B marketplace for repair services and parts, 
              empowering businesses of all sizes to find the parts they need quickly and reliably. 
              We envision a future where no repair is delayed due to parts unavailability.
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Why Choose Us */}
      <section>
        <SectionHeader
          title="Why Choose Feenix Repair"
          description="The advantages that set us apart from the competition"
          align="center"
        />
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">Verified Dealers</h3>
              <p className="text-sm text-muted-foreground">
                All dealers undergo rigorous verification to ensure quality and trust
              </p>
            </CardContent>
          </Card>
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <Clock className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">Fast Response</h3>
              <p className="text-sm text-muted-foreground">
                Quick enquiry responses and efficient order processing
              </p>
            </CardContent>
          </Card>
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <Globe className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">Global Network</h3>
              <p className="text-sm text-muted-foreground">
                Connect with dealers from 50+ countries worldwide
              </p>
            </CardContent>
          </Card>
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <Award className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">Quality Assured</h3>
              <p className="text-sm text-muted-foreground">
                All parts are inspected and quality certified before listing
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Our Values */}
      <section>
        <SectionHeader
          title="Our Core Values"
          description="The principles that guide everything we do"
          align="center"
        />
        <div className="grid md:grid-cols-3 gap-8">
          <Card>
            <CardContent className="p-6">
              <Users className="h-10 w-10 text-primary mb-4" />
              <h3 className="font-semibold text-lg mb-2">Customer First</h3>
              <p className="text-muted-foreground">
                We prioritize our customers' needs and work tirelessly to exceed their expectations
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <TrendingUp className="h-10 w-10 text-primary mb-4" />
              <h3 className="font-semibold text-lg mb-2">Continuous Innovation</h3>
              <p className="text-muted-foreground">
                We constantly improve our platform to provide better features and user experience
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <Zap className="h-10 w-10 text-primary mb-4" />
              <h3 className="font-semibold text-lg mb-2">Integrity & Trust</h3>
              <p className="text-muted-foreground">
                We maintain the highest standards of honesty and transparency in all dealings
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Statistics */}
      <section className="bg-muted/50 -mx-4 px-4 py-16">
        <SectionHeader
          title="Our Impact"
          description="Numbers that reflect our growth and success"
          align="center"
        />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="text-4xl font-bold text-primary mb-2">10,000+</div>
            <div className="text-muted-foreground">Verified Dealers</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-primary mb-2">50+</div>
            <div className="text-muted-foreground">Countries</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-primary mb-2">1M+</div>
            <div className="text-muted-foreground">Products Listed</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-primary mb-2">98%</div>
            <div className="text-muted-foreground">Satisfaction Rate</div>
          </div>
        </div>
      </section>
    </div>
  )
}
