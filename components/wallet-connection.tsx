"use client"

import { useAccount, useConnect, useDisconnect } from "wagmi"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Wallet, Shield, Zap, CheckCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useEffect } from "react"
import { sepolia } from "wagmi/chains"
import { useSwitchChain } from "wagmi"

interface WalletConnectionProps {
  userType: "buyer" | "seller"
  onConnected: () => void
}

export function WalletConnection({ userType, onConnected }: WalletConnectionProps) {
  const { address, isConnected, chain } = useAccount()
  const { connectors, connect, isPending } = useConnect()
  const { disconnect } = useDisconnect()
  const { switchChain, isPending: isSwitching } = useSwitchChain()

  // Auto-trigger onConnected when wallet connects (avoid calling during render)
  useEffect(() => {
    if (isConnected && address) {
      const t = setTimeout(() => onConnected(), 800)
      return () => clearTimeout(t)
    }
  }, [isConnected, address, onConnected])

  const injectedOnly = connectors.filter((c) => c.name.toLowerCase().includes("meta") || c.id === "injected")

  // If connected but wrong network, guide user to switch
  if (isConnected && address && chain?.id !== sepolia.id) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="glass-card max-w-md w-full mx-4 neon-glow">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gradient">Wrong Network</CardTitle>
            <CardDescription>Please switch to Ethereum Sepolia testnet to continue</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Current:</span>
              <Badge variant="outline">{chain?.name ?? "Unknown"}</Badge>
            </div>
            <Button
              onClick={() => switchChain({ chainId: sepolia.id })}
              disabled={isSwitching}
              className="w-full neon-gradient"
            >
              {isSwitching ? "Switching..." : "Switch to Sepolia"}
            </Button>
            <Button variant="outline" onClick={() => disconnect()} className="w-full cyber-border bg-transparent">
              Disconnect
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isConnected && address) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="glass-card max-w-md w-full mx-4 neon-glow">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-2xl accent-gradient flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-accent-foreground" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-gradient">Wallet Connected!</CardTitle>
            <CardDescription>Successfully connected to Ethereum Sepolia testnet</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Address:</span>
                <Badge className="bg-primary/20 text-primary border-primary/30">
                  {address.slice(0, 6)}...{address.slice(-4)}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Network:</span>
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">{chain?.name || "Sepolia"}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Role:</span>
                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 capitalize">{userType}</Badge>
              </div>
            </div>

            <div className="pt-4 text-center">
              <p className="text-sm text-muted-foreground mb-4">Redirecting to your {userType} dashboard...</p>
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            </div>

            <Button variant="outline" onClick={() => disconnect()} className="w-full cyber-border bg-transparent">
              Disconnect Wallet
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="glass-card max-w-md w-full mx-4">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-2xl accent-gradient flex items-center justify-center">
              <Wallet className="h-8 w-8 text-accent-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-gradient">Connect Your Wallet</CardTitle>
          <CardDescription>
            Connect your wallet to access the {userType} dashboard on Ethereum Sepolia testnet
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {(injectedOnly.length ? injectedOnly : connectors).map((connector) => (
              <Button
                key={connector.uid}
                onClick={() => connect({ connector })}
                disabled={isPending}
                className="w-full justify-start gap-3 h-12 neon-border hover:neon-glow transition-all duration-300"
                variant="outline"
              >
                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Wallet className="h-4 w-4 text-primary" />
                </div>
                <span className="font-medium">{isPending ? "Connecting..." : `Connect ${connector.name}`}</span>
              </Button>
            ))}
          </div>

          <div className="pt-4 space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="h-4 w-4 text-primary" />
              <span>Secure blockchain connection</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Zap className="h-4 w-4 text-primary" />
              <span>Ethereum Sepolia testnet</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle className="h-4 w-4 text-primary" />
              <span>Escrow smart contract protection</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
