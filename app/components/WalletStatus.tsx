"use client";

import { usePrivy, useWallets } from '@privy-io/react-auth';

export const WalletStatus = () => {
  const { ready, authenticated, user, login, logout } = usePrivy();
  const { wallets } = useWallets();

  const solanaWallet = wallets.find(wallet => wallet.walletClientType === 'privy');

  if (!ready) {
    return <div className="p-4 bg-gray-100 rounded">Loading Privy...</div>;
  }

  if (!authenticated) {
    return (
      <div className="p-4 bg-yellow-100 rounded">
        <p className="mb-2">Please connect your wallet to continue</p>
        <button 
          onClick={login}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Connect Wallet
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 bg-black rounded">
      <p className="font-semibold">Wallet Connected!</p>
      <p className="text-sm">User ID: {user?.id}</p>
      {solanaWallet && (
        <p className="text-sm">
          Solana Address: {solanaWallet.address?.slice(0, 8)}...{solanaWallet.address?.slice(-8)}
        </p>
      )}
      <button 
        onClick={logout}
        className="mt-2 px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
      >
        Disconnect
      </button>
    </div>
  );
};