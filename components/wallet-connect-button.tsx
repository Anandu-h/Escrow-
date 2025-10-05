"use client"

import { Button } from "@/components/ui/button"
import { useAccount, useConnect, useDisconnect, useSwitchChain } from "wagmi"
import { sepolia } from "wagmi/chains"
import { useMemo } from "react"

function truncate(addr?: string) {
  if (!addr) return ""
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`
}

export function WalletConnectButton() {
  const { address, isConnected, chain } = useAccount()
  const { connectors, connectAsync, isPending } = useConnect()
  const { disconnect } = useDisconnect()
  const { switchChain, isPending: isSwitching } = useSwitchChain()

  // find the MetaMask injected connector (target: "metaMask" from wagmi config)
  const metamaskConnector = useMemo(() => connectors.find((c) => c.name.toLowerCase().includes("meta")), [connectors])

  const handleConnect = async () => {
    try {
      const connector = metamaskConnector ?? connectors[0]
      if (!connector) return
      await connectAsync({ connector })
      // Always ensure Sepolia post-connect to avoid stale chain during first render
      if ((chain?.id ?? 0) !== sepolia.id) {
        switchChain({ chainId: sepolia.id })
      }
    } catch (err) {
      console.log("[v0] connect error:", (err as Error).message)
    }
  }

  // Not connected: show Connect button that opens MetaMask
  if (!isConnected) {
    return (
      <Button
        onClick={handleConnect}
        disabled={isPending}
        className="accent-gradient hover:neon-glow-strong transition-all duration-300 rounded-full px-6 text-accent-foreground font-semibold"
      >
        {isPending ? "Connecting..." : "Connect Wallet"}
      </Button>
    )
  }

  // Connected but wrong network: offer to switch to Sepolia
  if (chain?.id !== sepolia.id) {
    return (
      <Button
        onClick={() => switchChain({ chainId: sepolia.id })}
        disabled={isSwitching}
        variant="outline"
        className="neon-border bg-transparent"
      >
        {isSwitching ? "Switching..." : "Switch to Sepolia"}
      </Button>
    )
  }

  // Connected on Sepolia: show address, click to disconnect
  return (
    <Button onClick={() => disconnect()} variant="outline" className="neon-border bg-transparent" title={address}>
      {truncate(address)} • Sepolia
    </Button>
  )
}
