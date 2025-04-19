import React, { createContext, useEffect, useState } from 'react';
import { WagmiConfig } from 'wagmi';
import { config, createCustomChain, getAllChains } from '@/lib/wagmi-config';
import { useAccount, useConnect, useDisconnect, useBalance, useNetwork, useSwitchNetwork } from 'wagmi';
import { injected, metaMask, coinbaseWallet, walletConnect } from 'wagmi/connectors';
import { type Chain } from 'wagmi/chains';
import { formatEther } from 'viem';

// Define the context type
interface WagmiContextType {
  connect: (connector: 'metamask' | 'walletconnect' | 'coinbase' | 'injected') => Promise<void>;
  disconnect: () => Promise<void>;
  addCustomChain: (chain: Chain) => void;
  switchChain: (chainId: number) => Promise<void>;
  isConnected: boolean;
  address?: string;
  chainId?: number;
  balance?: string;
  isLoading: boolean;
  error: Error | null;
}

// Create the context with default values
export const WagmiContext = createContext<WagmiContextType>({
  connect: async () => {},
  disconnect: async () => {},
  addCustomChain: () => {},
  switchChain: async () => {},
  isConnected: false,
  address: undefined,
  chainId: undefined,
  balance: undefined,
  isLoading: false,
  error: null,
});

// Base Wagmi Provider that provides the config
export function WagmiProvider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiConfig config={config}>
      {children}
    </WagmiConfig>
  );
}

// Function to get custom chains from URL parameters
function getCustomChainsFromParams(): Chain[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const url = new URL(window.location.href);
    const chainId = url.searchParams.get('chainId');
    const rpcUrl = url.searchParams.get('rpcUrl');
    const chainName = url.searchParams.get('chainName');
    
    if (chainId && rpcUrl && chainName) {
      return [createCustomChain(
        parseInt(chainId),
        rpcUrl,
        chainName
      )];
    }
    
    return [];
  } catch (error) {
    console.error('Failed to parse custom chain from URL:', error);
    return [];
  }
}

// Export Wagmi Context Provider that handles the wallet state
export function WagmiContextProvider({ children }: { children: React.ReactNode }) {
  // Wagmi hooks
  const { isConnected, address, chainId } = useAccount();
  const { connect: wagmiConnect, isPending: isConnectPending, error: connectError } = useConnect();
  const { disconnect: wagmiDisconnect } = useDisconnect();
  const { data: balanceData } = useBalance({
    address: address as `0x${string}` | undefined,
    watch: true,
    enabled: !!address,
  });
  const { chain } = useNetwork();
  const { switchNetwork, error: switchError, isPending: isSwitchPending } = useSwitchNetwork();
  
  // Local state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [customChains, setCustomChains] = useState<Chain[]>(getCustomChainsFromParams());
  const [balance, setBalance] = useState<string | undefined>(undefined);

  // Update balance when wagmi balance changes
  useEffect(() => {
    if (balanceData) {
      setBalance(formatEther(balanceData.value));
    }
  }, [balanceData]);

  // Handle errors
  useEffect(() => {
    if (connectError) {
      setError(connectError);
    } else if (switchError) {
      setError(switchError);
    } else {
      setError(null);
    }
  }, [connectError, switchError]);

  // Function to connect wallet
  const connect = async (connector: 'metamask' | 'walletconnect' | 'coinbase' | 'injected') => {
    setIsLoading(true);
    setError(null);
    
    try {
      let connectorInstance;
      switch (connector) {
        case 'metamask':
          connectorInstance = metaMask();
          break;
        case 'walletconnect':
          connectorInstance = walletConnect({
            projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'default-project-id',
          });
          break;
        case 'coinbase':
          connectorInstance = coinbaseWallet({
            appName: 'LeoFi DEX',
          });
          break;
        case 'injected':
        default:
          connectorInstance = injected();
          break;
      }
      
      await wagmiConnect({ connector: connectorInstance });
    } catch (err) {
      console.error('Error connecting wallet:', err);
      setError(err instanceof Error ? err : new Error('Failed to connect wallet'));
    } finally {
      setIsLoading(false);
    }
  };

  // Function to disconnect wallet
  const disconnect = async () => {
    setIsLoading(true);
    
    try {
      await wagmiDisconnect();
    } catch (err) {
      console.error('Error disconnecting wallet:', err);
      setError(err instanceof Error ? err : new Error('Failed to disconnect wallet'));
    } finally {
      setIsLoading(false);
    }
  };

  // Function to add custom chain
  const addCustomChain = (chain: Chain) => {
    setCustomChains((prev) => {
      // Check if chain already exists
      if (prev.some((c) => c.id === chain.id)) {
        return prev;
      }
      return [...prev, chain];
    });
  };

  // Function to switch chain
  const switchChain = async (chainId: number) => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (switchNetwork) {
        await switchNetwork(chainId);
      } else {
        throw new Error('Switch network functionality not available');
      }
    } catch (err) {
      console.error('Error switching chain:', err);
      setError(err instanceof Error ? err : new Error('Failed to switch chain'));
    } finally {
      setIsLoading(false);
    }
  };

  // Save wallet state to localStorage
  useEffect(() => {
    if (isConnected && address) {
      localStorage.setItem('wagmi.connected', 'true');
      localStorage.setItem('wagmi.address', address);
      if (chainId) {
        localStorage.setItem('wagmi.chainId', chainId.toString());
      }
      if (balance) {
        localStorage.setItem('wagmi.balance', balance);
      }
    } else {
      localStorage.removeItem('wagmi.connected');
      localStorage.removeItem('wagmi.address');
      localStorage.removeItem('wagmi.chainId');
      localStorage.removeItem('wagmi.balance');
    }
  }, [isConnected, address, chainId, balance]);

  return (
    <WagmiContext.Provider
      value={{
        connect,
        disconnect,
        addCustomChain,
        switchChain,
        isConnected,
        address,
        chainId,
        balance,
        isLoading: isLoading || isConnectPending || isSwitchPending,
        error,
      }}
    >
      {children}
    </WagmiContext.Provider>
  );
}

// Combined provider for easy usage
export const Web3Provider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  return (
    <WagmiProvider>
      <WagmiContextProvider>
        {children}
      </WagmiContextProvider>
    </WagmiProvider>
  );
};