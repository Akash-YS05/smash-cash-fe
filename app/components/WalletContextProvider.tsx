"use client"

import { FC, ReactNode } from "react"
import { useWalletConfig } from "../hooks/useWalletAdapter";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";

interface Props {
    children: ReactNode;
}

export const WalletContextProvider: FC<Props> = ({children}) => {
    const {endpoint, wallets} = useWalletConfig();

    return (
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} autoConnect>
                <WalletModalProvider>
                    {children}
                </WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    )
}