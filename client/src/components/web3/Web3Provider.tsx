import { createContext, useEffect, useState, ReactNode } from 'react';
import { ethers } from 'ethers';
import { NETWORK_PARAMS } from '@/lib/constants';

interface Web3ContextType {
  provider: ethers.providers.Web3Provider | null;
  signer: ethers.Signer | null;
  network: {
    name: string;
    chainId: number;
  } | null;
  isConnecting: boolean;
  error: Error | null;
}

export const Web3Context = createContext<Web3ContextType>({
  provider: null,
  signer: null,
  network: null,
  isConnecting: false,
  error: null,
});

interface Web3ProviderProps {
  children: ReactNode;
}

export function Web3Provider({ children }: Web3ProviderProps) {
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [network, setNetwork] = useState<{ name: string; chainId: number } | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Initialize provider if window.ethereum is available
  useEffect(() => {
    const initProvider = async () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        try {
          const provider = new ethers.providers.Web3Provider(window.ethereum as any);
          const network = await provider.getNetwork();
          const networkInfo = {
            name: NETWORK_PARAMS[network.chainId]?.chainName || network.name,
            chainId: network.chainId
          };
          
          setProvider(provider);
          setNetwork(networkInfo);
        } catch (err) {
          console.error('Failed to initialize web3 provider:', err);
          setError(err instanceof Error ? err : new Error(String(err)));
        }
      }
    };

    initProvider();
  }, []);

  // Set up event listeners for account and chain changes
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = async (accounts: string[]) => {
        if (accounts.length > 0 && provider) {
          setSigner(provider.getSigner());
        } else {
          setSigner(null);
        }
      };

      const handleChainChanged = () => {
        window.location.reload();
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [provider]);

  return (
    <Web3Context.Provider
      value={{
        provider,
        signer,
        network,
        isConnecting,
        error,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
}
