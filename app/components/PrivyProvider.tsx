"use client"

import { ReactNode } from "react"
import { PrivyProvider as Privy } from '@privy-io/react-auth';
import { WalletContextProvider } from "./WalletContextProvider";

interface Props {
    children: ReactNode
}

export default function PrivyProvider({children}: Props) {
    return (
        <Privy
            appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!}
            config={{
                loginMethods: ['wallet', 'email', 'google'],
                appearance: {
                    theme: 'dark',
                    accentColor: '#8b5cf6',
                },
                embeddedWallets: {
                    createOnLogin: 'users-without-wallets',
                    requireUserPasswordOnCreate: false
                },
            }}
        >
            <WalletContextProvider>
                {children}
            </WalletContextProvider>
        </Privy>
    )
}