import { useEffect, useState } from 'react';
import { useWagmiWallet } from './useWagmiWallet';

// This hook bridges the existing useWallet API with the new wagmi implementation
export function useWallet() {
  const wagmiWallet = useWagmiWallet();
  const [balance, setBalance] = useState<string>('0');

  // Update balance when the wagmi balance changes
  useEffect(() => {
    if (wagmiWallet.balance) {
      setBalance(wagmiWallet.balance);
    }
  }, [wagmiWallet.balance]);

  // Map the wagmi wallet state to our existing API
  return {
    // Basic state
    address: wagmiWallet.address,
    chainId: wagmiWallet.chainId,
    connected: wagmiWallet.connected,
    isConnecting: wagmiWallet.isConnecting,
    
    // Balance
    balance,
    
    // Functions that match the existing API
    connect: (provider: string) => wagmiWallet.connect(provider),
    disconnect: () => wagmiWallet.disconnect(),
    
    // New functions from wagmi
    signMessage: wagmiWallet.signMessage,
    executeContract: wagmiWallet.executeContract,
    addEVMChain: wagmiWallet.addEVMChain,
    switchChain: wagmiWallet.switchChain,
    
    // Error handling
    error: wagmiWallet.error,
    
    // Transaction status
    transactionStatus: wagmiWallet.transactionStatus,
  };
}