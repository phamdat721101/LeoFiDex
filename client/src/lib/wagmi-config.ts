import { http, createConfig } from 'wagmi';
import { type Chain, mainnet, sepolia, polygon, polygonMumbai, optimism, arbitrum, bsc, avalanche } from 'wagmi/chains';
import { injected, metaMask, coinbaseWallet, walletConnect } from 'wagmi/connectors';
import { NETWORK_PARAMS } from '@/lib/constants';

// Supported predefined chains
export const predefinedChains = [
  mainnet,
  sepolia,
  polygon,
  polygonMumbai,
  optimism,
  arbitrum,
  bsc,
  avalanche
];

// Create a custom chain from URL parameters for supporting any custom EVM chain
export function createCustomChain(chainId: number, rpcUrl: string, name: string, nativeCurrency = {
  name: 'Ether',
  symbol: 'ETH',
  decimals: 18,
}) {
  return {
    id: chainId,
    name: name,
    network: name.toLowerCase().replace(' ', '-'),
    nativeCurrency,
    rpcUrls: {
      default: { http: [rpcUrl] },
      public: { http: [rpcUrl] },
    },
  };
}

// Create a custom chain from LeoFi's network params
export function createChainFromNetworkParams(chainId: number) {
  const networkParam = NETWORK_PARAMS[chainId];
  if (!networkParam) return null;

  return {
    id: chainId,
    name: networkParam.chainName,
    network: networkParam.chainName.toLowerCase().replace(' ', '-'),
    nativeCurrency: networkParam.nativeCurrency,
    rpcUrls: {
      default: { http: [networkParam.rpcUrls[0]] },
      public: { http: [networkParam.rpcUrls] }
    },
    blockExplorers: networkParam.blockExplorerUrls ? {
      default: { name: 'Explorer', url: networkParam.blockExplorerUrls[0] }
    } : undefined
  };
}

// Function to extract custom chain parameters from URL
export function getCustomChainsFromParams() {
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

// Function to get all supported chains
export function getAllChains() {
  // Get chains from NETWORK_PARAMS
  const customChains = Object.keys(NETWORK_PARAMS).map(chainId => {
    const chain = createChainFromNetworkParams(parseInt(chainId));
    return chain;
  }).filter(Boolean);
  
  // Add URL parameter chains
  const urlChains = getCustomChainsFromParams();
  
  // Combine all chains, removing duplicates by chainId
  return [...predefinedChains, ...customChains, ...urlChains].filter((chain, index, self) => 
    index === self.findIndex((c) => c.id === chain.id)
  );
}

// Create wagmi config with all connectors
export const config = createConfig({
  chains: predefinedChains, // Use just predefined chains to avoid type issues
  connectors: [
    injected(),
    metaMask({ }),
    coinbaseWallet({ 
      appName: 'LeoFi DEX',
    }),
    walletConnect({ 
      projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'default-project-id', 
    }),
  ],
  transports: {
    // Provide a transport for each chain
    ...Object.fromEntries(
      predefinedChains.map(chain => [
        chain.id,
        http(chain.rpcUrls.default.http[0])
      ])
    )
  },
});