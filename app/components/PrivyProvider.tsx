"use client"
import { ReactNode } from "react"
import { PrivyProvider as Privy } from '@privy-io/react-auth';
import { toSolanaWalletConnectors } from "@privy-io/react-auth/solana";

export default function PrivyProvider({ children }: { children: ReactNode }) {
  return (
    <Privy
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!}
      config={{
        loginMethods: ['wallet', 'email', 'google'],
        solanaClusters: [
          { name: 'devnet', rpcUrl: 'https://api.devnet.solana.com' },
          { name: 'mainnet-beta', rpcUrl: 'https://api.mainnet-beta.solana.com' },
        ],
        appearance: {
          theme: 'dark',
          accentColor: '#8b5cf6',
          walletChainType: 'solana-only',
        },
        embeddedWallets: { solana: { createOnLogin: 'users-without-wallets' } },
        externalWallets: { solana: { connectors: toSolanaWalletConnectors() } },
      }}
    >
      {children}
    </Privy>
  )
}
