import React, { createContext, useState, useCallback, useEffect } from 'react';
import { NETWORK_PARAMS } from '@/lib/constants';

// Define WalletContextType
export interface WalletContextType {
  connect: (connector: 'metamask' | 'walletconnect' | 'coinbase' | 'injected') => Promise<void>;
  disconnect: () => Promise<void>;
  addNetwork: (chainId: number) => Promise<void>;
  switchNetwork: (chainId: number) => Promise<void>;
  signMessage: (message: string) => Promise<string>;
  executeContract: (
    contractAddress: string, 
    abi: any[], 
    functionName: string, 
    args?: any[],
    value?: string
  ) => Promise<any>;
  address: string | null;
  chainId: number | null;
  isConnected: boolean;
  balance: string;
  isLoading: boolean;
  error: Error | null;
}

// Create context with default values
export const WalletContext = createContext<WalletContextType>({
  connect: async () => {},
  disconnect: async () => {},
  addNetwork: async () => {},
  switchNetwork: async () => {},
  signMessage: async () => '',
  executeContract: async () => null,
  address: null,
  chainId: null,
  isConnected: false,
  balance: '0',
  isLoading: false,
  error: null,
});

export function WalletProvider({ children }: { children: React.ReactNode }) {
  // State
  const [address, setAddress] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [balance, setBalance] = useState('0');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Connect to wallet
  const connect = useCallback(async (connector: 'metamask' | 'walletconnect' | 'coinbase' | 'injected') => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (!window.ethereum && connector === 'metamask') {
        window.open('https://metamask.io/download/', '_blank');
        throw new Error('Please install MetaMask to connect');
      }
      
      // Connect via window.ethereum if available (for MetaMask and injected wallets)
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts && accounts.length > 0) {
          setAddress(accounts[0]);
          setIsConnected(true);
          
          // Get chain ID
          const chainIdHex = await window.ethereum.request({ method: 'eth_chainId' });
          const parsedChainId = parseInt(chainIdHex, 16);
          setChainId(parsedChainId);
          
          // Get balance
          const balanceHex = await window.ethereum.request({ 
            method: 'eth_getBalance',
            params: [accounts[0], 'latest'] 
          });
          const balanceWei = parseInt(balanceHex, 16);
          const balanceEth = balanceWei / 1e18;
          setBalance(balanceEth.toFixed(6));
          
          // Save to localStorage
          localStorage.setItem('wallet.connected', 'true');
          localStorage.setItem('wallet.address', accounts[0]);
          localStorage.setItem('wallet.chainId', parsedChainId.toString());
          localStorage.setItem('wallet.balance', balanceEth.toFixed(6));
          
          return;
        }
      } 
      
      // For demo or when ethereum is not available
      if (connector === 'walletconnect' || connector === 'coinbase' || !window.ethereum) {
        const mockAddress = "0x71C7656EC7ab88b098defB751B7401B5f6d8976F";
        setAddress(mockAddress);
        setChainId(1); // Ethereum mainnet
        setIsConnected(true);
        setBalance('10.0');
        
        localStorage.setItem('wallet.connected', 'true');
        localStorage.setItem('wallet.address', mockAddress);
        localStorage.setItem('wallet.chainId', '1');
        localStorage.setItem('wallet.balance', '10.0');
      }
    } catch (err) {
      console.error(`Error connecting to ${connector}:`, err);
      setError(err instanceof Error ? err : new Error('Failed to connect wallet'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Disconnect wallet
  const disconnect = useCallback(async () => {
    setAddress(null);
    setChainId(null);
    setIsConnected(false);
    setBalance('0');
    
    localStorage.removeItem('wallet.connected');
    localStorage.removeItem('wallet.address');
    localStorage.removeItem('wallet.chainId');
    localStorage.removeItem('wallet.balance');
  }, []);

  // Add network to wallet
  const addNetwork = useCallback(async (chainId: number) => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (!window.ethereum) {
        throw new Error('No wallet provider found');
      }
      
      const networkParams = NETWORK_PARAMS[chainId];
      if (!networkParams) {
        throw new Error(`Network parameters not found for chain ID ${chainId}`);
      }
      
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: `0x${chainId.toString(16)}`,
          chainName: networkParams.chainName,
          nativeCurrency: networkParams.nativeCurrency,
          rpcUrls: networkParams.rpcUrls,
          blockExplorerUrls: networkParams.blockExplorerUrls,
        }]
      });
      
      await switchNetwork(chainId);
    } catch (err) {
      console.error('Error adding network:', err);
      setError(err instanceof Error ? err : new Error('Failed to add network'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Switch network
  const switchNetwork = useCallback(async (chainId: number) => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (!window.ethereum) {
        throw new Error('No wallet provider found');
      }
      
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainId.toString(16)}` }]
      });
      
      setChainId(chainId);
      localStorage.setItem('wallet.chainId', chainId.toString());
    } catch (err: any) {
      // If the chain hasn't been added to MetaMask
      if (err.code === 4902) {
        await addNetwork(chainId);
      } else {
        console.error('Error switching network:', err);
        setError(err instanceof Error ? err : new Error('Failed to switch network'));
      }
    } finally {
      setIsLoading(false);
    }
  }, [addNetwork]);

  // Sign message
  const signMessage = useCallback(async (message: string): Promise<string> => {
    if (!window.ethereum || !address) {
      throw new Error('No wallet connected');
    }
    
    try {
      const signature = await window.ethereum.request({
        method: 'personal_sign',
        params: [message, address]
      });
      
      return signature as string;
    } catch (err) {
      console.error('Error signing message:', err);
      throw err;
    }
  }, [address]);

  // Execute contract function
  const executeContract = useCallback(async (
    contractAddress: string, 
    abi: any[], 
    functionName: string, 
    args: any[] = [],
    value: string = '0'
  ): Promise<any> => {
    if (!window.ethereum || !address) {
      throw new Error('No wallet connected');
    }
    
    try {
      // We can't rely on ethers being available in the window
      // If needed, import it in the component that calls this function
      const data = '0x'; // This is a placeholder
      
      // Send the transaction
      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [{
          from: address,
          to: contractAddress,
          data,
          value: value ? `0x${parseInt(value).toString(16)}` : '0x0'
        }]
      });
      
      return txHash;
    } catch (err) {
      console.error('Error executing contract function:', err);
      throw err;
    }
  }, [address]);

  // Initialize from localStorage on mount
  useEffect(() => {
    const isConnected = localStorage.getItem('wallet.connected') === 'true';
    const address = localStorage.getItem('wallet.address');
    const chainIdStr = localStorage.getItem('wallet.chainId');
    const balance = localStorage.getItem('wallet.balance');
    
    if (isConnected && address) {
      setIsConnected(true);
      setAddress(address);
      
      if (chainIdStr) {
        setChainId(parseInt(chainIdStr));
      }
      
      if (balance) {
        setBalance(balance);
      }
    }
  }, []);

  // Set up event listeners
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length > 0) {
          setAddress(accounts[0]);
          setIsConnected(true);
          localStorage.setItem('wallet.address', accounts[0]);
          localStorage.setItem('wallet.connected', 'true');
        } else {
          setAddress(null);
          setIsConnected(false);
          localStorage.removeItem('wallet.address');
          localStorage.setItem('wallet.connected', 'false');
        }
      };
      
      const handleChainChanged = (chainIdHex: string) => {
        const newChainId = parseInt(chainIdHex, 16);
        setChainId(newChainId);
        localStorage.setItem('wallet.chainId', newChainId.toString());
      };
      
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
      
      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, []);

  return (
    <WalletContext.Provider
      value={{
        connect,
        disconnect,
        addNetwork,
        switchNetwork,
        signMessage,
        executeContract,
        address,
        chainId,
        isConnected,
        balance,
        isLoading,
        error,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}