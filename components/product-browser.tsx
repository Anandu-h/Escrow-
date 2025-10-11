"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Package, Search, DollarSign, User, Clock } from "lucide-react"
import { useAccount } from "wagmi"

const formatCurrency = (cents: number, currency: string) =>
  new Intl.NumberFormat(undefined, { style: "currency", currency }).format(cents / 100)

interface ProductBrowserProps {
  onProductSelect: (product: any) => void
}

export function ProductBrowser({ onProductSelect }: ProductBrowserProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const { address } = useAccount()

  const { data, isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const res = await fetch("/api/products")
      if (!res.ok) throw new Error("Failed to load products")
      return (await res.json()) as { products: any[] }
    },
  })

  const products = data?.products ?? []
  const filteredProducts = products.filter((product) =>
    product.product.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handlePurchase = async (product: any) => {
    if (!address) {
      alert("Please connect your wallet first")
      return
    }

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: product.id,
          buyerWallet: address,
          buyerName: "Buyer", // You can get this from user profile later
        }),
      })

      if (response.ok) {
        onProductSelect(product)
      } else {
        alert("Failed to initiate purchase")
      }
    } catch (error) {
      console.error("Error purchasing product:", error)
      alert("Failed to initiate purchase")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <h2 className="text-2xl font-bold font-[family-name:var(--font-orbitron)] text-foreground">
          Available Products
        </h2>
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 cyber-border bg-transparent"
          />
        </div>
      </div>

      {isLoading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-2">Loading products...</p>
        </div>
      )}

      {!isLoading && filteredProducts.length === 0 && (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>No products found</CardTitle>
            <CardDescription>
              {searchTerm ? "Try adjusting your search terms" : "No products are currently available"}
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <Card key={product.id} className="glass-card hover:neon-glow transition-all duration-300">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">{product.product}</CardTitle>
                </div>
                <Badge className="bg-primary/20 text-primary border-primary/30">
                  {product.status}
                </Badge>
              </div>
              <CardDescription className="line-clamp-2">
                {product.delivery_status || "No description available"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span>{product.seller_name || "Unknown Seller"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{new Date(product.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="text-2xl font-bold text-gradient font-[family-name:var(--font-orbitron)]">
                  {formatCurrency(product.amount_cents, product.currency)}
                </div>
                <Button
                  onClick={() => handlePurchase(product)}
                  disabled={!address}
                  className="neon-gradient"
                >
                  <DollarSign className="h-4 w-4 mr-2" />
                  Purchase
                </Button>
              </div>

              {!address && (
                <div className="text-center">
                  <p className="text-sm text-yellow-400">
                    Connect wallet to purchase
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

