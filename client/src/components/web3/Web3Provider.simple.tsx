import React, { ReactNode } from 'react';
import { WagmiConfig, createConfig } from 'wagmi';
import { http } from 'viem';
import { mainnet, arbitrum, optimism, polygon, sepolia } from 'viem/chains';
import { injected, metaMask, walletConnect } from '@wagmi/connectors';

// Get WalletConnect project ID from environment
const getWalletConnectProjectId = () => {
  return import.meta.env.WALLET_CONNECT_PROJECT_ID;
};

// Create a simple wagmi config
const config = createConfig({
  chains: [mainnet, arbitrum, optimism, polygon, sepolia],
  transports: {
    [mainnet.id]: http(),
    [arbitrum.id]: http(),
    [optimism.id]: http(),
    [polygon.id]: http(),
    [sepolia.id]: http(),
  },
  connectors: [
    injected(),
    metaMask(),
    walletConnect({
      projectId: getWalletConnectProjectId(),
      showQrModal: true,
    }),
  ],
});

interface Web3ProviderProps {
  children: ReactNode;
}

export function Web3Provider({ children }: Web3ProviderProps) {
  return (
    <WagmiConfig config={config}>
      {children}
    </WagmiConfig>
  );
}