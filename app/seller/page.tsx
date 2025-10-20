"use client"

import { useEffect, useState } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { WalletConnection } from "@/components/wallet-connection"
import { ProductForm } from "@/components/product-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Plus, DollarSign, Package, TrendingUp, X } from "lucide-react"
import { useAccount } from "wagmi"
import { useQuery } from "@tanstack/react-query"

const SellerDashboard = () => {
  const [isWalletConnected, setIsWalletConnected] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  useEffect(() => setIsMounted(true), [])
  const [showProductForm, setShowProductForm] = useState(false)
  const { address } = useAccount()

  const { data, isLoading, refetch } = useQuery({
    enabled: isWalletConnected && !!address,
    queryKey: ["seller-orders", address],
    queryFn: async () => {
      const res = await fetch(`/api/orders?role=seller&wallet=${address}`)
      if (!res.ok) throw new Error("Failed to load orders")
      return (await res.json()) as { orders: any[] }
    },
    refetchInterval: false,
    refetchOnWindowFocus: true,
  })

  const handleProductCreated = async () => {
    setShowProductForm(false)
    // Force refetch to get the newly created product
    await refetch()
  }

  const orders = data?.orders ?? []

  // Separate pending products (listings) from active orders
  const pendingProducts = orders.filter((o) => o.status === "pending" && !o.buyer_wallet)
  const activeOrders = orders.filter((o) => o.status !== "pending" || o.buyer_wallet)

  const formatCurrency = (cents: number, currency: string) =>
    new Intl.NumberFormat(undefined, { style: "currency", currency }).format(cents / 100)

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
        <WalletConnection userType="seller" onConnected={() => setIsWalletConnected(true)} />
        <Footer />
      </div>
    )
  }

  if (showProductForm) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <main className="pt-24 pb-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold text-gradient font-[family-name:var(--font-orbitron)]">
                Create New Product
              </h1>
              <Button
                variant="outline"
                onClick={() => setShowProductForm(false)}
                className="cyber-border bg-transparent"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
            <ProductForm onProductCreated={handleProductCreated} />
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
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Products</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gradient font-[family-name:var(--font-orbitron)]">
                  {isLoading ? "…" : pendingProducts.length}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Active listings</p>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Active Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gradient font-[family-name:var(--font-orbitron)]">
                  {isLoading ? "…" : activeOrders.filter((o) => o.status !== "completed" && o.status !== "cancelled").length}
                </div>
                <p className="text-xs text-muted-foreground mt-1">In progress</p>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Sales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gradient font-[family-name:var(--font-orbitron)]">
                  {isLoading
                    ? "…"
                    : formatCurrency(
                        activeOrders.filter((o) => o.status === "completed").reduce((sum, o) => sum + (o.amount_cents || 0), 0),
                        orders[0]?.currency || "USD",
                      )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Completed</p>
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
                        activeOrders.filter((o) => o.status === "locked").reduce((sum, o) => sum + (o.amount_cents || 0), 0),
                        orders[0]?.currency || "USD",
                      )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">In escrow</p>
              </CardContent>
            </Card>
          </div>

          {/* My Products */}
          <div className="space-y-6 mb-12">
            <h2 className="text-2xl font-bold font-[family-name:var(--font-orbitron)] text-foreground">
              My Products
            </h2>

            {isLoading && <p className="text-muted-foreground">Loading products…</p>}
            {!isLoading && pendingProducts.length === 0 && (
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>No products listed</CardTitle>
                  <CardDescription>Create your first product to start selling</CardDescription>
                </CardHeader>
              </Card>
            )}

            {!isLoading &&
              pendingProducts.map((product) => (
                <Card key={product.id} className="glass-card hover:neon-glow transition-all duration-300">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Package className="h-5 w-5 text-primary" />
                          {product.product}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          Product #{product.id} • {product.delivery_status || "No description"}
                        </CardDescription>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gradient font-[family-name:var(--font-orbitron)]">
                          {formatCurrency(product.amount_cents, product.currency || "USD")}
                        </div>
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/30 capitalize">
                          Available
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-4">
                        <Badge variant="outline" className="capitalize">
                          Listed for sale
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          Waiting for buyer
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>

          {/* Active Orders */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold font-[family-name:var(--font-orbitron)] text-foreground">
              Active Orders
            </h2>

            {isLoading && <p className="text-muted-foreground">Loading orders…</p>}
            {!isLoading && activeOrders.length === 0 && (
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>No active orders</CardTitle>
                  <CardDescription>Orders will appear here once buyers purchase your products</CardDescription>
                </CardHeader>
              </Card>
            )}

            {!isLoading &&
              activeOrders.map((order) => (
                <Card key={order.id} className="glass-card hover:neon-glow transition-all duration-300">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Package className="h-5 w-5 text-primary" />
                          {order.product}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          Order #{order.id} • Buyer: {order.buyer_name || "—"}
                        </CardDescription>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gradient font-[family-name:var(--font-orbitron)]">
                          {formatCurrency(order.amount_cents, order.currency || "USD")}
                        </div>
                        <Badge className="bg-primary/20 text-primary border-primary/30 capitalize">
                          {order.status}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-4">
                        <Badge variant="outline" className="capitalize">
                          {order.status}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          Status: {order.status === "delivered" ? "Awaiting buyer confirmation" : "Processing order"}
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

          {/* Quick Actions */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold font-[family-name:var(--font-orbitron)] text-foreground mb-6">
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card 
                className="glass-card hover:neon-glow transition-all duration-300 cursor-pointer"
                onClick={() => setShowProductForm(true)}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5 text-primary" />
                    Add New Product
                  </CardTitle>
                  <CardDescription>List a new product for sale with escrow protection</CardDescription>
                </CardHeader>
              </Card>
              <Card className="glass-card hover:neon-glow transition-all duration-300 cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    View Analytics
                  </CardTitle>
                  <CardDescription>Track your sales performance and trends</CardDescription>
                </CardHeader>
              </Card>
              <Card className="glass-card hover:neon-glow transition-all duration-300 cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-primary" />
                    Withdraw Funds
                  </CardTitle>
                  <CardDescription>Transfer completed escrow funds to your account</CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default SellerDashboard
