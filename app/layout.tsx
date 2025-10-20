import type React from "react"
import type { Metadata } from "next"
import { Sora, Roboto_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { Providers } from "@/components/providers"
import { ClientOnly } from "@/components/client-only"
import "./globals.css"

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  display: "swap",
})

const geistMono = Roboto_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
})

export const metadata: Metadata = {
  title: "FortifiedX - Secure Escrow Payments",
  description: "Your Vision, Our Expertise — Secure blockchain-powered escrow payment system for modern e-commerce",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${sora.variable} ${geistMono.variable} dark antialiased`}>
      <body className="font-sans">
        <Providers>
          <ClientOnly>
            <Suspense fallback={null}>{children}</Suspense>
          </ClientOnly>
        </Providers>
        <Analytics />
      </body>
    </html>
  )
}
