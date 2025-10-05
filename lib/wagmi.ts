import { http, createConfig } from "wagmi"
import { sepolia } from "wagmi/chains"
import { injected } from "wagmi/connectors"

export const config = createConfig({
  chains: [sepolia],
  connectors: [
    injected({
      target: "metaMask",
      shimDisconnect: true,
      multiInjectedProviderDiscovery: true,
    }),
  ],
  transports: {
    [sepolia.id]: http(), // uses a public RPC by default
  },
  ssr: true,
})

declare module "wagmi" {
  interface Register {
    config: typeof config
  }
}
