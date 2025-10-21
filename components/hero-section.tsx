"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Lock, Users, Zap, Shield, Globe, CheckCircle, Star } from "lucide-react"
import { useEffect, useState } from "react"
import Link from "next/link"

export function HeroSection() {
  const messages = [
    "Secure Every Transaction",
    "Protect Your Payments",
    "Trust in Every Deal",
    "Blockchain Powered Security",
    "Zero Risk Transactions",
  ]

  const [currentMessageIndex, setCurrentMessageIndex] = useState(0)
  const [typedText, setTypedText] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)
  const [typeSpeed, setTypeSpeed] = useState(150)

  useEffect(() => {
    const currentMessage = messages[currentMessageIndex]

    const timer = setTimeout(() => {
      if (!isDeleting) {
        if (typedText.length < currentMessage.length) {
          setTypedText(currentMessage.slice(0, typedText.length + 1))
          setTypeSpeed(150)
        } else {
          setTimeout(() => setIsDeleting(true), 2000)
        }
      } else {
        if (typedText.length > 0) {
          setTypedText(currentMessage.slice(0, typedText.length - 1))
          setTypeSpeed(75)
        } else {
          setIsDeleting(false)
          setCurrentMessageIndex((prev) => (prev + 1) % messages.length)
        }
      }
    }, typeSpeed)

    return () => clearTimeout(timer)
  }, [typedText, isDeleting, currentMessageIndex, typeSpeed, messages])

  return (
    <section className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 cyber-grid opacity-20"></div>
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/3 left-1/4 w-96 h-96 rounded-full bg-primary/10 blur-3xl neon-glow"></div>
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-primary/5 blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <div className="space-y-8">
          <div className="flex justify-center">
            <div className="p-6 rounded-3xl glass-card neon-glow hover:neon-glow-strong transition-all">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl accent-gradient flex items-center justify-center">
                  <Zap className="h-8 w-8 text-accent-foreground" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-primary neon-glow flex items-center justify-center">
                  <Lock className="h-3 w-3 text-accent-foreground" />
                </div>
              </div>
            </div>
          </div>

          {/* Tagline removed per request */}

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-balance">
            <div className="mb-4 min-h-[1.2em]">
              <span className="text-gradient typing-cursor glow-filter-strong">{typedText}</span>
            </div>
            <span className="text-foreground">with </span>
            <span className="text-gradient glow-filter">Blockchain</span>
            <br />
            <span className="text-gradient glow-filter">Escrow</span>
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto text-pretty leading-relaxed">
            Revolutionary blockchain-powered escrow system that protects both buyers and sellers. Funds are securely
            locked until delivery confirmation, eliminating fraud and disputes in every transaction.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
            <Link href="/buyer">
              <Button
                size="lg"
                className="accent-gradient hover:neon-glow-strong transition-all duration-300 group text-accent-foreground font-semibold"
              >
                Start as Buyer
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/seller">
              <Button
                size="lg"
                variant="outline"
                className="neon-border hover:bg-primary/10 transition-all duration-300 group bg-transparent text-primary"
              >
                Start as Seller
                <Users className="ml-2 h-5 w-5 group-hover:scale-110 transition-transform" />
              </Button>
            </Link>
          </div>

          <div className="pt-20">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-center max-w-6xl mx-auto">
              <div className="glass-card p-8 rounded-3xl hover-lift neon-border group transition-all duration-500 hover:neon-glow-strong">
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-16 h-16 rounded-2xl accent-gradient flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Shield className="h-8 w-8 text-accent-foreground" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-lg font-bold text-primary mb-1">BLOCKCHAIN</h3>
                    <p className="text-xs text-muted-foreground">Immutable Security</p>
                  </div>
                </div>
              </div>

              <div className="glass-card p-8 rounded-3xl hover-lift neon-border group transition-all duration-500 hover:neon-glow-strong">
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-16 h-16 rounded-2xl accent-gradient flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Lock className="h-8 w-8 text-accent-foreground" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-lg font-bold text-primary mb-1">SECURE</h3>
                    <p className="text-xs text-muted-foreground">Military Grade</p>
                  </div>
                </div>
              </div>

              <div className="glass-card p-8 rounded-3xl hover-lift neon-border group transition-all duration-500 hover:neon-glow-strong">
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-16 h-16 rounded-2xl accent-gradient flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <CheckCircle className="h-8 w-8 text-accent-foreground" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-lg font-bold text-primary mb-1">ESCROW</h3>
                    <p className="text-xs text-muted-foreground">Smart Contracts</p>
                  </div>
                </div>
              </div>

              <div className="glass-card p-8 rounded-3xl hover-lift neon-border group transition-all duration-500 hover:neon-glow-strong">
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-16 h-16 rounded-2xl accent-gradient flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Star className="h-8 w-8 text-accent-foreground" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-lg font-bold text-primary mb-1">VERIFIED</h3>
                    <p className="text-xs text-muted-foreground">100% Authentic</p>
                  </div>
                </div>
              </div>

              <div className="glass-card p-8 rounded-3xl hover-lift neon-border group transition-all duration-500 hover:neon-glow-strong">
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-16 h-16 rounded-2xl accent-gradient flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Globe className="h-8 w-8 text-accent-foreground" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-lg font-bold text-primary mb-1">TRUSTED</h3>
                    <p className="text-xs text-muted-foreground">Global Network</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
