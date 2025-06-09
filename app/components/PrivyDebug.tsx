"use client";

import { usePrivy, useWallets } from '@privy-io/react-auth';

export const PrivyWalletDebug = () => {
  const { ready, authenticated, user } = usePrivy();
  const { wallets } = useWallets();

  if (!ready) return <div>Loading...</div>;

  if (!authenticated) return <div>Not authenticated</div>;

  const solanaWallet = wallets.find(wallet => wallet.chainType === 'solana');

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h3 className="font-bold mb-2">Privy Wallet Debug Info</h3>
      
      <div className="space-y-2 text-sm">
        <p><strong>Ready:</strong> {ready.toString()}</p>
        <p><strong>Authenticated:</strong> {authenticated.toString()}</p>
        <p><strong>User ID:</strong> {user?.id}</p>
        <p><strong>Total Wallets:</strong> {wallets.length}</p>
        
        {solanaWallet && (
          <div className="mt-4">
            <h4 className="font-semibold">Solana Wallet:</h4>
            <p><strong>Address:</strong> {solanaWallet.address}</p>
            <p><strong>Chain Type:</strong> {solanaWallet.chainType}</p>
            <p><strong>Connector Type:</strong> {solanaWallet.connectorType}</p>
            <p><strong>Wallet Client Type:</strong> {solanaWallet.walletClientType}</p>
            
            <div className="mt-2">
              <h5 className="font-medium">Available Methods:</h5>
              <pre className="bg-gray-200 p-2 rounded text-xs overflow-x-auto">
                {JSON.stringify(Object.keys(solanaWallet), null, 2)}
              </pre>
            </div>
            
            <div className="mt-2">
              <h5 className="font-medium">Signing Methods Available:</h5>
              <ul className="list-disc list-inside text-xs">
                <li>signTransaction: {typeof solanaWallet.signTransaction === 'function' ? '✅' : '❌'}</li>
                <li>sign: {typeof (solanaWallet as any).sign === 'function' ? '✅' : '❌'}</li>
                <li>signMessage: {typeof (solanaWallet as any).signMessage === 'function' ? '✅' : '❌'}</li>
              </ul>
            </div>
          </div>
        )}
        
        {!solanaWallet && (
          <p className="text-red-600">No Solana wallet found!</p>
        )}
      </div>
    </div>
  );
};