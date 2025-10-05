import Link from "next/link"
import { Shield, Github, Twitter, Linkedin } from "lucide-react"

export function Footer() {
  return (
    <footer className="glass-card border-t border-border/30 mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="p-2 rounded-lg accent-gradient professional-shadow">
                <Shield className="h-5 w-5 text-accent-foreground" />
              </div>
              <span className="text-lg font-bold text-foreground">FortifiedX</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Secure blockchain escrow for fair, transparent transactions between buyers and sellers.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-4">Product</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/buyer" className="hover:text-foreground transition-colors">
                  Buyer Dashboard
                </Link>
              </li>
              <li>
                <Link href="/seller" className="hover:text-foreground transition-colors">
                  Seller Dashboard
                </Link>
              </li>
              <li>
                <Link href="/escrow" className="hover:text-foreground transition-colors">
                  Escrow Details
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-foreground transition-colors">
                  About
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-4">Company</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/about" className="hover:text-foreground transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/team" className="hover:text-foreground transition-colors">
                  Our Team
                </Link>
              </li>
              <li>
                <Link href="/careers" className="hover:text-foreground transition-colors">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-foreground transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-4">Connect</h3>
            <div className="flex space-x-4">
              <a href="#" className="p-2 rounded-lg glass-card hover-lift transition-all duration-300">
                <Github className="h-5 w-5 text-muted-foreground hover:text-foreground" />
              </a>
              <a href="#" className="p-2 rounded-lg glass-card hover-lift transition-all duration-300">
                <Twitter className="h-5 w-5 text-muted-foreground hover:text-foreground" />
              </a>
              <a href="#" className="p-2 rounded-lg glass-card hover-lift transition-all duration-300">
                <Linkedin className="h-5 w-5 text-muted-foreground hover:text-foreground" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-border/30 mt-8 pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            © 2025 FortifiedX. All rights reserved. Built with expertise and passion.
          </p>
        </div>
      </div>
    </footer>
  )
}
