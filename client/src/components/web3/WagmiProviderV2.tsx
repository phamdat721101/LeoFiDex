import React, { createContext, useContext, useState } from 'react';
import { 
  createConfig, 
  WagmiConfig, 
  http, 
  type Chain 
} from 'wagmi';
import { 
  mainnet, 
  sepolia, 
  polygon, 
  optimism, 
  arbitrum, 
  base 
} from 'wagmi/chains';
import { injected, metaMask, coinbaseWallet, walletConnect } from 'wagmi/connectors';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NETWORK_PARAMS } from '@/lib/constants';

// Create React Query client
const queryClient = new QueryClient();

// Define the WagmiContext structure
type WagmiContextType = {
  connect: (connector: 'metamask' | 'walletconnect' | 'coinbase' | 'injected') => Promise<void>;
  disconnect: () => Promise<void>;
  addCustomChain: (chain: Chain) => void;
  switchChain: (chainId: number) => Promise<void>;
  isConnected: boolean;
  address: string | undefined;
  chainId: number | undefined;
  balance: string | undefined;
  isLoading: boolean;
  error: Error | null;
};

// Create the context with default values
const WagmiContext = createContext<WagmiContextType>({
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

// List of default chains
const defaultChains = [
  mainnet,
  sepolia,
  polygon,
  optimism,
  arbitrum,
  base,
];

// Function to convert NETWORK_PARAMS to wagmi Chain objects
const getCustomChainsFromParams = (): Chain[] => {
  return Object.entries(NETWORK_PARAMS)
    .filter(([chainIdStr]) => {
      // Filter out chains that are already in defaultChains
      const chainId = parseInt(chainIdStr);
      return !defaultChains.some(chain => chain.id === chainId);
    })
    .map(([chainIdStr, params]) => {
      const chainId = parseInt(chainIdStr);
      return {
        id: chainId,
        name: params.chainName,
        network: params.chainName.toLowerCase().replace(/\\s+/g, '-'),
        nativeCurrency: params.nativeCurrency,
        rpcUrls: {
          default: { http: params.rpcUrls },
          public: { http: params.rpcUrls },
        },
        blockExplorers: params.blockExplorerUrls?.length 
          ? {
              default: {
                name: `${params.chainName} Explorer`,
                url: params.blockExplorerUrls[0],
              },
            }
          : undefined,
      } as Chain;
    });
};

// WagmiProvider component
export const WagmiProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const customChains = getCustomChainsFromParams();
  const allChains = [...defaultChains, ...customChains];
  
  // Create wagmi config with all available connectors
  const config = createConfig({
    chains: allChains,
    transports: {
      // Map each chain to its http transport
      ...Object.fromEntries(
        allChains.map(chain => [chain.id, http()])
      )
    },
    connectors: [
      metaMask(),
      coinbaseWallet({ 
        appName: 'LeoFi DEX'
      }),
      walletConnect({
        projectId: 'YOUR_WALLET_CONNECT_PROJECT_ID', // Get from WalletConnect Portal
        metadata: {
          name: 'LeoFi DEX',
          description: 'Modular DEX Framework',
          url: window.location.origin,
          icons: ['https://your-logo-url.com'],
        },
      }),
      injected()
    ],
  });

  return (
    <WagmiConfig config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiConfig>
  );
};

// Hook to use the Wagmi context
export const useWagmiContext = (): WagmiContextType => useContext(WagmiContext);

// Export Wagmi Context Provider that handles the wallet state
export function WagmiContextProvider({ children }: { children: React.ReactNode }) {
  // Wallet state
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | undefined>(undefined);
  const [chainId, setChainId] = useState<number | undefined>(undefined);
  const [balance, setBalance] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Function to connect wallet
  const connect = async (connector: 'metamask' | 'walletconnect' | 'coinbase' | 'injected') => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Implementation will be updated with actual wagon connect code
      setIsConnected(true);
      setAddress('0x...');  // Will be replaced with actual address
      setChainId(1);  // Will be replaced with actual chain ID
      setBalance('0');  // Will be replaced with actual balance
    } catch (err) {
      console.error('Error connecting wallet:', err);
      setError(err instanceof Error ? err : new Error('Failed to connect wallet'));
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to disconnect wallet
  const disconnect = async () => {
    setIsLoading(true);
    
    try {
      // Implementation will be updated with actual wagon disconnect code
      setIsConnected(false);
      setAddress(undefined);
      setChainId(undefined);
      setBalance(undefined);
    } catch (err) {
      console.error('Error disconnecting wallet:', err);
      setError(err instanceof Error ? err : new Error('Failed to disconnect wallet'));
    } finally {
      setIsLoading(false);
    }
  };

  // Function to add custom chain
  const addCustomChain = (chain: Chain) => {
    // This will be implemented with wagmi's chain management
    console.log('Adding custom chain:', chain);
    // In v2, chains are added at config level, not dynamically
  };

  // Function to switch chain
  const switchChain = async (chainId: number) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Implementation will be updated with actual wagon switchChain code
      setChainId(chainId);
    } catch (err) {
      console.error('Error switching chain:', err);
      setError(err instanceof Error ? err : new Error('Failed to switch chain'));
    } finally {
      setIsLoading(false);
    }
  };

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
        isLoading,
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