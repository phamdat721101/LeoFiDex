import React, { ReactNode, createContext, useState } from 'react';
import { WagmiConfig, createConfig } from 'wagmi';
import { http } from 'viem';
import { mainnet, arbitrum, optimism, polygon, sepolia } from 'viem/chains';
import { injected, metaMask, walletConnect } from '@wagmi/connectors';

// Define a custom chain interface
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

// Create a context for managing custom chains
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

// We'll create the config inside the component so we can use the projectId prop
function createWagmiConfig(projectId?: string) {
  return createConfig({
    chains: [mainnet, arbitrum, optimism, polygon, sepolia],
    transports: {
      [mainnet.id]: http(),
      [arbitrum.id]: http(),
      [optimism.id]: http(),
      [polygon.id]: http(),
      [sepolia.id]: http(),
    },
    connectors: [
      injected({
        // shimDisconnect is not available in this version
      }),
      metaMask({
        // shimDisconnect is not available in this version
      }),
      walletConnect({
        projectId: projectId || import.meta.env.WALLET_CONNECT_PROJECT_ID,
        showQrModal: true,
      }),
    ],
  });
}

interface Web3ProviderProps {
  children: ReactNode;
  projectId?: string;
}

export function Web3Provider({ children, projectId }: Web3ProviderProps) {
  const [customChains, setCustomChains] = useState<CustomChain[]>([]);
  const [config] = useState(() => createWagmiConfig(projectId));

  // Add a custom chain
  const addCustomChain = (chain: CustomChain) => {
    setCustomChains(prev => {
      if (prev.some(c => c.id === chain.id)) {
        return prev;
      }
      return [...prev, chain];
    });
  };

  // Remove a custom chain
  const removeCustomChain = (chainId: number) => {
    setCustomChains(prev => prev.filter(chain => chain.id !== chainId));
  };

  return (
    <CustomChainContext.Provider value={{ customChains, addCustomChain, removeCustomChain }}>
      <WagmiConfig config={config}>
        {children}
      </WagmiConfig>
    </CustomChainContext.Provider>
  );
}