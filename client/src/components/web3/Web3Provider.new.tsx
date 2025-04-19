import React, { useState, useEffect, createContext, ReactNode } from 'react';
import { createConfig, WagmiConfig } from 'wagmi';
import { mainnet, polygon, optimism, arbitrum, sepolia } from 'viem/chains';
import { createPublicClient, http } from 'viem';
import { NETWORK_PARAMS } from '@/lib/constants';
import { InjectedConnector } from '@wagmi/connectors/injected';
import { MetaMaskConnector } from '@wagmi/connectors/metaMask';
import { WalletConnectConnector } from '@wagmi/connectors/walletConnect';

// Context for custom chain management
export interface CustomChain {
  id: number;
  name: string;
  network: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls: {
    default: {
      http: string[];
    };
    public: {
      http: string[];
    };
  };
  blockExplorers?: {
    default: {
      name: string;
      url: string;
    };
  };
}

interface CustomChainContextProps {
  customChains: CustomChain[];
  addCustomChain: (chain: CustomChain) => void;
  removeCustomChain: (chainId: number) => void;
}

export const CustomChainContext = createContext<CustomChainContextProps>({
  customChains: [],
  addCustomChain: () => {},
  removeCustomChain: () => {},
});

interface Web3ProviderProps {
  children: ReactNode;
  projectId?: string;
}

export function Web3Provider({ 
  children, 
  projectId = 'YOUR_PROJECT_ID' // WalletConnect project ID, can be passed as a prop or set as env var
}: Web3ProviderProps) {
  const [customChains, setCustomChains] = useState<CustomChain[]>([]);
  const [wagmiConfig, setWagmiConfig] = useState<any>(null);
  const [isConfigReady, setIsConfigReady] = useState(false);

  // Initialize the chains and providers
  useEffect(() => {
    // Get default chains
    const defaultChains = [mainnet, polygon, optimism, arbitrum, sepolia];
    
    // Create connectors
    const connectors = [
      new InjectedConnector({ 
        chains: defaultChains,
        options: {
          name: 'Injected',
          shimDisconnect: true,
        },
      }),
      new MetaMaskConnector({ 
        chains: defaultChains,
        options: {
          shimDisconnect: true,
        },
      }),
      new WalletConnectConnector({
        chains: defaultChains,
        options: {
          projectId: projectId,
          showQrModal: true,
        },
      }),
    ];

    // Create public client factory
    const publicClient = ({ chainId }: { chainId: number }) => {
      // For custom chains, use the RPC URL from the chain object
      const customChain = customChains.find(c => c.id === chainId);
      if (customChain) {
        return createPublicClient({
          chain: {
            id: customChain.id,
            name: customChain.name,
            network: customChain.network,
            nativeCurrency: customChain.nativeCurrency,
            rpcUrls: {
              default: { http: customChain.rpcUrls.default.http },
              public: { http: customChain.rpcUrls.public.http },
            },
            blockExplorers: customChain.blockExplorers ? {
              default: {
                name: customChain.blockExplorers.default.name,
                url: customChain.blockExplorers.default.url,
              },
            } : undefined,
          },
          transport: http(customChain.rpcUrls.default.http[0]),
        });
      }
      
      // For default chains, use the RPC URL from NETWORK_PARAMS if available
      const networkParam = NETWORK_PARAMS[chainId];
      if (networkParam) {
        const chain = defaultChains.find(c => c.id === chainId);
        if (chain) {
          return createPublicClient({
            chain,
            transport: http(networkParam.rpcUrls[0]),
          });
        }
      }
      
      // Default chain fallback
      const defaultChain = defaultChains.find(c => c.id === chainId) || mainnet;
      return createPublicClient({
        chain: defaultChain,
        transport: http(),
      });
    };

    // Create wagmi config
    const config = createConfig({
      connectors,
      publicClient,
    });

    setWagmiConfig(config);
    setIsConfigReady(true);
  }, [customChains, projectId]);

  // Functions to manage custom chains
  const addCustomChain = (chain: CustomChain) => {
    setCustomChains(prev => {
      // Don't add if already exists
      if (prev.some(c => c.id === chain.id)) {
        return prev;
      }
      return [...prev, chain];
    });
  };

  const removeCustomChain = (chainId: number) => {
    setCustomChains(prev => prev.filter(chain => chain.id !== chainId));
  };

  if (!isConfigReady) {
    return <div>Loading Web3 configuration...</div>;
  }

  return (
    <CustomChainContext.Provider 
      value={{ 
        customChains, 
        addCustomChain, 
        removeCustomChain 
      }}
    >
      <WagmiConfig config={wagmiConfig}>
        {children}
      </WagmiConfig>
    </CustomChainContext.Provider>
  );
}