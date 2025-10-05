"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X, Shield } from "lucide-react"
import { WalletConnectButton } from "@/components/wallet-connect-button"

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="fixed top-0 w-full z-50 glass-card border-b border-border/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="p-2 rounded-lg border border-border/40 bg-background/40">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <span className="text-xl font-bold text-foreground font-sans tracking-tight glow-text-soft">
              FortifiedX
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-foreground/80 hover:text-primary transition-colors">
              Home
            </Link>
            <Link href="/buyer" className="text-foreground/80 hover:text-primary transition-colors">
              Buyer Dashboard
            </Link>
            <Link href="/seller" className="text-foreground/80 hover:text-primary transition-colors">
              Seller Dashboard
            </Link>
            <Link href="/escrow" className="text-foreground/80 hover:text-primary transition-colors">
              Escrow Details
            </Link>
            <Link href="/about" className="text-foreground/80 hover:text-primary transition-colors">
              About
            </Link>
            <WalletConnectButton />
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 space-y-4">
            <Link href="/" className="block text-foreground/80 hover:text-primary transition-colors">
              Home
            </Link>
            <Link href="/buyer" className="block text-foreground/80 hover:text-primary transition-colors">
              Buyer Dashboard
            </Link>
            <Link href="/seller" className="block text-foreground/80 hover:text-primary transition-colors">
              Seller Dashboard
            </Link>
            <Link href="/escrow" className="block text-foreground/80 hover:text-primary transition-colors">
              Escrow Details
            </Link>
            <Link href="/about" className="block text-foreground/80 hover:text-primary transition-colors">
              About
            </Link>
            <WalletConnectButton />
          </div>
        )}
      </div>
    </nav>
  )
}
