import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Zap, Lock, CheckCircle, Globe } from "lucide-react"

const features = [
  {
    icon: Shield,
    title: "Bulletproof Security",
    description:
      "Advanced blockchain technology ensures your funds are protected with military-grade encryption and smart contract verification.",
    highlight: "Bank-level security protocols",
  },
  {
    icon: Zap,
    title: "Lightning Fast Transactions",
    description:
      "Process escrow payments in seconds, not days. Our optimized blockchain infrastructure delivers instant confirmations.",
    highlight: "Sub-second transaction speeds",
  },
  {
    icon: CheckCircle,
    title: "Automated Dispute Resolution",
    description:
      "Smart contracts automatically handle disputes and releases, eliminating the need for manual intervention and reducing costs.",
    highlight: "99.9% automated resolution rate",
  },
]

export function FeaturesSection() {
  return (
    <section className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Why Choose FortifiedX
            <br />
            <span className="text-gradient">Escrow System</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto text-pretty leading-relaxed">
            Experience the future of secure transactions with our blockchain-powered escrow platform. Protect your
            business and customers with unmatched security, speed, and reliability.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <Card key={index} className="glass-card hover-lift transition-all duration-300 group border-border/30">
              <CardHeader>
                <div className="flex items-start space-x-4">
                  <div className="p-3 rounded-xl accent-gradient professional-shadow group-hover:hover-lift transition-all">
                    <feature.icon className="h-6 w-6 text-accent-foreground" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-semibold text-foreground">{feature.title}</CardTitle>
                    <div className="text-sm text-gradient font-medium mt-1">{feature.highlight}</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-foreground/80 leading-relaxed">{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="glass-card hover-lift transition-all duration-300 p-8 border-border/30">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-foreground">Complete Transaction Protection</h3>
              <div className="p-2 rounded-lg accent-gradient">
                <Lock className="h-5 w-5 text-accent-foreground" />
              </div>
            </div>
            <p className="text-foreground/80 leading-relaxed">
              Every transaction is secured by smart contracts that automatically release funds only when delivery
              conditions are met, ensuring both buyers and sellers are fully protected.
            </p>
            <div className="mt-6 w-16 h-16 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center neon-glow">
              <Lock className="w-8 h-8 text-primary" />
            </div>
          </Card>

          <Card className="glass-card hover-lift transition-all duration-300 p-8 border-border/30">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-foreground">Global Reach, Local Trust</h3>
              <div className="p-2 rounded-lg accent-gradient">
                <Globe className="h-5 w-5 text-accent-foreground" />
              </div>
            </div>
            <p className="text-foreground/80 leading-relaxed">
              Process international transactions with confidence. Our blockchain infrastructure supports global commerce
              while maintaining the highest security standards worldwide.
            </p>
            <div className="mt-6 w-16 h-16 rounded-full bg-gradient-to-br from-accent/20 to-accent/10 flex items-center justify-center">
              <Globe className="h-8 w-8 text-accent" />
            </div>
          </Card>
        </div>
      </div>
    </section>
  )
}
