import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Database, Globe, Code, Zap, Users } from "lucide-react"

const techStack = [
  {
    icon: Database,
    name: "MySQL",
    description: "Robust relational database for transaction records",
  },
  {
    icon: Shield,
    name: "Blockchain",
    description: "Immutable ledger for escrow transaction verification",
  },
  {
    icon: Globe,
    name: "Web3",
    description: "Decentralized web integration for smart contracts",
  },
  {
    icon: Code,
    name: "Next.js",
    description: "Modern React framework for optimal performance",
  },
]

const whyEscrow = [
  {
    title: "Buyer Protection",
    description: "Funds are held securely until delivery is confirmed, protecting buyers from fraud and non-delivery.",
  },
  {
    title: "Seller Security",
    description: "Sellers are guaranteed payment once they fulfill their obligations, eliminating payment disputes.",
  },
  {
    title: "Dispute Resolution",
    description: "Built-in mediation system handles conflicts fairly with blockchain-verified evidence.",
  },
  {
    title: "Trust Building",
    description: "Creates trust between unknown parties by removing the need for mutual faith in transactions.",
  },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-3xl md:text-4xl font-bold font-[family-name:var(--font-orbitron)] text-gradient mb-4">
              About EscrowChain
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto text-pretty leading-relaxed">
              We're revolutionizing e-commerce by bringing blockchain-powered escrow services to every transaction,
              ensuring trust, security, and transparency in the digital marketplace.
            </p>
          </div>

          {/* Why Escrow Section */}
          <section className="mb-16">
            <h2 className="text-2xl md:text-3xl font-bold font-[family-name:var(--font-orbitron)] text-foreground mb-8 text-center">
              Why Escrow?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {whyEscrow.map((item, index) => (
                <Card key={index} className="glass-card hover:neon-glow transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="text-xl text-gradient">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-foreground/80 leading-relaxed">{item.description}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* How Blockchain Adds Trust */}
          <section className="mb-16">
            <div className="glass-card p-8 rounded-2xl">
              <h2 className="text-2xl md:text-3xl font-bold font-[family-name:var(--font-orbitron)] text-gradient mb-6 text-center">
                How Blockchain Adds Trust
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full neon-gradient flex items-center justify-center neon-glow">
                    <Shield className="h-8 w-8 text-primary-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Immutable Records</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Every transaction is permanently recorded on the blockchain, creating an unchangeable audit trail.
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full neon-gradient flex items-center justify-center neon-glow">
                    <Zap className="h-8 w-8 text-primary-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Smart Contracts</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Automated contract execution ensures terms are met before funds are released, eliminating human
                    error.
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full neon-gradient flex items-center justify-center neon-glow">
                    <Users className="h-8 w-8 text-primary-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Decentralized Trust</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    No single point of failure - trust is distributed across the blockchain network.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Tech Stack */}
          <section>
            <h2 className="text-2xl md:text-3xl font-bold font-[family-name:var(--font-orbitron)] text-foreground mb-8 text-center">
              Tech Stack
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {techStack.map((tech, index) => (
                <Card key={index} className="glass-card hover:neon-glow transition-all duration-300 text-center">
                  <CardHeader>
                    <div className="w-12 h-12 mx-auto mb-4 rounded-lg neon-gradient flex items-center justify-center">
                      <tech.icon className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <CardTitle className="text-lg font-[family-name:var(--font-orbitron)] text-gradient">
                      {tech.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-foreground/80 text-sm leading-relaxed">
                      {tech.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Mission Statement */}
          <section className="mt-16 text-center">
            <div className="glass-card p-8 rounded-2xl max-w-4xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold font-[family-name:var(--font-orbitron)] text-gradient mb-6">
                Our Mission
              </h2>
              <p className="text-lg text-foreground/90 leading-relaxed text-pretty">
                To create a world where online transactions are completely secure, transparent, and trustworthy. By
                combining the power of blockchain technology with intuitive user experiences, we're building the
                foundation for the next generation of e-commerce.
              </p>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  )
}
