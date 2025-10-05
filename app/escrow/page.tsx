"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Copy, ExternalLink, Shield, Clock, CheckCircle, AlertCircle } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { useQuery } from "@tanstack/react-query"

export default function EscrowPage() {
  const [copiedHash, setCopiedHash] = useState(false)
  const params = useSearchParams()
  const orderId = params.get("orderId")

  const { data, isLoading } = useQuery({
    enabled: !!orderId,
    queryKey: ["escrow", orderId],
    queryFn: async () => {
      const res = await fetch(`/api/escrow?orderId=${orderId}`)
      if (!res.ok) throw new Error("Failed to load escrow")
      return (await res.json()) as {
        escrow: {
          id: number
          product: string
          amount_cents: number
          currency: string
          status: string
          escrow_hash: string | null
          buyer_wallet: string
          seller_wallet: string
          created_at: string
          estimated_release_at: string | null
        }
      }
    },
  })

  const escrowData = data?.escrow

  const formatCurrency = (cents?: number, currency?: string) =>
    cents != null
      ? new Intl.NumberFormat(undefined, { style: "currency", currency: currency || "USD" }).format(cents / 100)
      : "—"

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedHash(true)
    setTimeout(() => setCopiedHash(false), 2000)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "locked":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "released":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "refunded":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  const getProgressValue = (status: string) => {
    switch (status) {
      case "locked":
        return 33
      case "released":
        return 100
      case "refunded":
        return 100
      default:
        return 0
    }
  }

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">Escrow Details</h1>
          <p className="text-xl text-muted-foreground">Track your secure transaction on the blockchain</p>
        </div>

        {!orderId && <p className="text-muted-foreground">No orderId provided.</p>}
        {orderId && isLoading && <p className="text-muted-foreground">Loading escrow…</p>}
        {orderId && !isLoading && !escrowData && <p className="text-muted-foreground">Escrow not found.</p>}

        {orderId && escrowData && (
          <div className="grid gap-8 md:grid-cols-2">
            {/* Order Summary */}
            <Card className="glass-card border-border/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Order Summary
                </CardTitle>
                <CardDescription>Transaction details and current status</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Order ID:</span>
                  <span className="font-mono text-sm">{escrowData.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Product:</span>
                  <span className="font-semibold">{escrowData.product}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount:</span>
                  <span className="font-bold text-primary">
                    {formatCurrency(escrowData.amount_cents, escrowData.currency)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Status:</span>
                  <Badge className={getStatusColor(escrowData.status)}>
                    {escrowData.status === "locked" && <Clock className="h-3 w-3 mr-1" />}
                    {escrowData.status === "released" && <CheckCircle className="h-3 w-3 mr-1" />}
                    {escrowData.status === "refunded" && <AlertCircle className="h-3 w-3 mr-1" />}
                    {escrowData.status.toUpperCase()}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Blockchain Proof */}
            <Card className="glass-card border-border/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ExternalLink className="h-5 w-5 text-primary" />
                  Blockchain Proof
                </CardTitle>
                <CardDescription>Immutable transaction record</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Transaction Hash:</label>
                  <div className="flex items-center gap-2 p-3 bg-background/50 rounded-lg border border-border/30">
                    <code className="text-xs font-mono text-primary flex-1 truncate">
                      {escrowData.escrow_hash || "—"}
                    </code>
                    {escrowData.escrow_hash && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(escrowData.escrow_hash!)}
                        className="h-8 w-8 p-0"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                  {copiedHash && <p className="text-xs text-green-400 mt-1">Hash copied to clipboard!</p>}
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground">Buyer Address:</label>
                    <code className="text-xs font-mono text-foreground/80 block truncate">
                      {escrowData.buyer_wallet}
                    </code>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Seller Address:</label>
                    <code className="text-xs font-mono text-foreground/80 block truncate">
                      {escrowData.seller_wallet}
                    </code>
                  </div>
                </div>

                {escrowData.escrow_hash && (
                  <Button asChild className="w-full accent-gradient hover:neon-glow-strong transition-all">
                    <a
                      href={`https://sepolia.etherscan.io/tx/${escrowData.escrow_hash}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      View on Etherscan
                      <ExternalLink className="h-4 w-4 ml-2" />
                    </a>
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Progress Timeline */}
        <Card className="glass-card border-border/30 mt-8">
          <CardHeader>
            <CardTitle>Escrow Progress</CardTitle>
            <CardDescription>Track the status of your secure transaction</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>Funds Locked</span>
                <span>Delivery Confirmed</span>
                <span>Funds Released</span>
              </div>
              <Progress value={getProgressValue(escrowData?.status || "")} className="h-3 neon-glow" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Jan 15, 2024</span>
                <span>Pending</span>
                <span>Est. Jan 22, 2024</span>
              </div>
            </div>

            {escrowData?.status === "locked" && (
              <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <div className="flex items-center gap-2 text-yellow-400 mb-2">
                  <Clock className="h-4 w-4" />
                  <span className="font-semibold">Awaiting Delivery Confirmation</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Your funds are securely locked in escrow. Once you receive and confirm delivery, the funds will be
                  automatically released to the seller.
                </p>
                <Button className="mt-3 accent-gradient hover:neon-glow-strong">Confirm Delivery</Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
