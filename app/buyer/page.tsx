"use client"

import { useEffect, useState } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { WalletConnection } from "@/components/wallet-connection"
import { ProductBrowser } from "@/components/product-browser"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Package, Clock, CheckCircle, Truck, Shield, ShoppingCart, X } from "lucide-react"
import { useAccount } from "wagmi"
import { useQuery } from "@tanstack/react-query"

const getStatusColor = (status: string) => {
  switch (status) {
    case "locked":
      return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
    case "shipped":
      return "bg-blue-500/20 text-blue-400 border-blue-500/30"
    case "delivered":
      return "bg-green-500/20 text-green-400 border-green-500/30"
    default:
      return "bg-gray-500/20 text-gray-400 border-gray-500/30"
  }
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case "locked":
      return <Clock className="h-4 w-4" />
    case "shipped":
      return <Truck className="h-4 w-4" />
    case "delivered":
      return <CheckCircle className="h-4 w-4" />
    default:
      return <Package className="h-4 w-4" />
  }
}

const formatCurrency = (cents: number, currency: string) =>
  new Intl.NumberFormat(undefined, { style: "currency", currency }).format(cents / 100)

export default function BuyerDashboard() {
  const [isWalletConnected, setIsWalletConnected] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  useEffect(() => setIsMounted(true), [])
  const [showProductBrowser, setShowProductBrowser] = useState(false)
  const { address } = useAccount()

  // derive data when connected
  const { data, isLoading, refetch } = useQuery({
    enabled: isWalletConnected && !!address,
    queryKey: ["buyer-orders", address],
    queryFn: async () => {
      const res = await fetch(`/api/orders?role=buyer&wallet=${address}`)
      if (!res.ok) throw new Error("Failed to load orders")
      return (await res.json()) as { orders: any[] }
    },
  })

  const orders = data?.orders ?? []

  const handleProductSelected = (product: any) => {
    setShowProductBrowser(false)
    refetch()
  }

  if (!isMounted) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <main className="pt-24 pb-12" />
        <Footer />
      </div>
    )
  }

  if (!isWalletConnected) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <WalletConnection userType="buyer" onConnected={() => setIsWalletConnected(true)} />
        <Footer />
      </div>
    )
  }

  if (showProductBrowser) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <main className="pt-24 pb-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold text-gradient font-[family-name:var(--font-orbitron)]">
                Browse Products
              </h1>
              <Button
                variant="outline"
                onClick={() => setShowProductBrowser(false)}
                className="cyber-border bg-transparent"
              >
                <X className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </div>
            <ProductBrowser onProductSelect={handleProductSelected} />
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="glass-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Active Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gradient font-[family-name:var(--font-orbitron)]">
                  {isLoading ? "…" : orders.filter((o) => o.status !== "completed" && o.status !== "cancelled").length}
                </div>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Spent</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gradient font-[family-name:var(--font-orbitron)]">
                  {isLoading
                    ? "…"
                    : formatCurrency(
                        orders.reduce((sum, o) => sum + (o.amount_cents || 0), 0),
                        orders[0]?.currency || "USD",
                      )}
                </div>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Escrow Locked</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gradient font-[family-name:var(--font-orbitron)]">
                  {isLoading
                    ? "…"
                    : formatCurrency(
                        orders.filter((o) => o.status === "locked").reduce((sum, o) => sum + (o.amount_cents || 0), 0),
                        orders[0]?.currency || "USD",
                      )}
                </div>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gradient font-[family-name:var(--font-orbitron)]">
                  {isLoading ? "…" : orders.filter((o) => o.status === "completed").length}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Active Orders */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold font-[family-name:var(--font-orbitron)] text-foreground">
              Active Orders
            </h2>

            {isLoading && <p className="text-muted-foreground">Loading orders…</p>}
            {!isLoading && orders.length === 0 && (
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>No orders yet</CardTitle>
                  <CardDescription>Your active orders will appear here once you purchase.</CardDescription>
                  <div className="mt-4">
                    <Button
                      onClick={() => setShowProductBrowser(true)}
                      className="neon-gradient"
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Browse Products
                    </Button>
                  </div>
                </CardHeader>
              </Card>
            )}

            {!isLoading &&
              orders.map((order) => (
                <Card key={order.id} className="glass-card hover:neon-glow transition-all duration-300">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Package className="h-5 w-5 text-primary" />
                          {order.product}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          Order #{order.id} • Seller: {order.seller_name || "—"}
                        </CardDescription>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gradient font-[family-name:var(--font-orbitron)]">
                          {formatCurrency(order.amount_cents, order.currency || "USD")}
                        </div>
                        <Badge className={getStatusColor(order.status)}>
                          {getStatusIcon(order.status)}
                          <span className="ml-1 capitalize">{order.status}</span>
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Escrow Progress</span>
                        <span className="text-foreground">{order.progress ?? 0}%</span>
                      </div>
                      <Progress value={order.progress ?? 0} className="h-2" />
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>Locked</span>
                        <span>Released</span>
                        <span>Completed</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-primary" />
                        <span className="text-sm text-muted-foreground">
                          Escrow: {(order.escrow_hash || "").slice(0, 10)}...
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button asChild variant="outline" size="sm" className="cyber-border bg-transparent">
                          <a href={`/escrow?orderId=${order.id}`}>View Details</a>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
