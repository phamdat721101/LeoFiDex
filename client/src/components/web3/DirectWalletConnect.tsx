import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { NetworkParams } from '@/lib/types';

// Define Window Ethereum type
declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      request: (params: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, callback: (...args: any[]) => void) => void;
      removeListener: (event: string, callback: (...args: any[]) => void) => void;
      chainId: string;
      selectedAddress: string;
    };
  }
}

export interface ChainConfig {
  chainId: string;  // Hex string like "0x1"
  chainName: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls: string[];
  blockExplorerUrls: string[];
  iconUrls?: string[];
}

export interface WalletState {
  address: string;
  chainId: number;
  isConnected: boolean;
  isConnecting: boolean;
  walletType: 'metamask' | 'walletconnect' | 'injected' | null;
}

export interface DirectWalletConnectProps {
  onConnected?: (state: WalletState) => void;
  networks?: Record<number, NetworkParams>;
  className?: string;
  buttonText?: string;
}

export function DirectWalletConnect({ 
  onConnected, 
  networks = {},
  className = '',
  buttonText = 'Connect Wallet'
}: DirectWalletConnectProps) {
  const [state, setState] = useState<WalletState>({
    address: '',
    chainId: 0,
    isConnected: false,
    isConnecting: false,
    walletType: null
  });
  const { toast } = useToast();

  // Check if MetaMask is installed
  const isMetaMaskInstalled = useCallback(() => {
    return window.ethereum?.isMetaMask || false;
  }, []);

  // Handle chain changed event
  const handleChainChanged = useCallback((chainIdHex: string) => {
    const chainId = parseInt(chainIdHex, 16);
    setState(prev => ({ ...prev, chainId }));
    
    // If we have a callback, invoke it with the updated state
    if (onConnected) {
      onConnected({
        ...state,
        chainId,
      });
    }
  }, [state, onConnected]);

  // Handle account changed event
  const handleAccountsChanged = useCallback((accounts: string[]) => {
    if (accounts.length === 0) {
      // User has disconnected their wallet
      setState({
        address: '',
        chainId: 0,
        isConnected: false,
        isConnecting: false,
        walletType: null
      });
    } else {
      // Update with new address
      setState(prev => ({ 
        ...prev, 
        address: accounts[0],
        isConnected: true,
        isConnecting: false 
      }));
      
      // If we have a callback, invoke it with the updated state
      if (onConnected) {
        onConnected({
          ...state,
          address: accounts[0],
          isConnected: true,
          isConnecting: false
        });
      }
    }
  }, [state, onConnected]);

  // Setup listeners when component mounts
  useEffect(() => {
    // Auto-connect if user is already connected to MetaMask
    const checkConnection = async () => {
      if (isMetaMaskInstalled()) {
        try {
          const accounts = await window.ethereum!.request({ method: 'eth_accounts' });
          const chainIdHex = await window.ethereum!.request({ method: 'eth_chainId' });
          const chainId = parseInt(chainIdHex, 16);
          
          if (accounts.length > 0) {
            setState({
              address: accounts[0],
              chainId,
              isConnected: true,
              isConnecting: false,
              walletType: 'metamask'
            });
            
            // If we have a callback, invoke it
            if (onConnected) {
              onConnected({
                address: accounts[0],
                chainId,
                isConnected: true,
                isConnecting: false,
                walletType: 'metamask'
              });
            }
          }
        } catch (error) {
          console.error("Error checking connection:", error);
        }
      }
    };

    // Setup event listeners
    if (window.ethereum) {
      window.ethereum.on('chainChanged', handleChainChanged);
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      // Check connection when component mounts
      checkConnection();
    }

    // Cleanup event listeners when component unmounts
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('chainChanged', handleChainChanged);
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      }
    };
  }, [handleChainChanged, handleAccountsChanged, isMetaMaskInstalled, onConnected]);

  // Connect wallet
  const connectWallet = async () => {
    if (!isMetaMaskInstalled()) {
      toast({
        title: "MetaMask Not Detected",
        description: "Please install MetaMask extension to connect your wallet.",
        variant: "destructive"
      });
      return;
    }

    setState(prev => ({ ...prev, isConnecting: true }));

    try {
      // Request accounts
      const accounts = await window.ethereum!.request({ 
        method: 'eth_requestAccounts' 
      });
      
      // Get chain ID
      const chainIdHex = await window.ethereum!.request({ 
        method: 'eth_chainId' 
      });
      const chainId = parseInt(chainIdHex, 16);

      // Update state
      setState({
        address: accounts[0],
        chainId,
        isConnected: true,
        isConnecting: false,
        walletType: 'metamask'
      });

      // Sign message to authenticate with backend
      await signAuthMessage(accounts[0], chainId);

      // If we have a callback, invoke it
      if (onConnected) {
        onConnected({
          address: accounts[0],
          chainId,
          isConnected: true,
          isConnecting: false,
          walletType: 'metamask'
        });
      }

      toast({
        title: "Wallet Connected",
        description: "Your wallet has been successfully connected.",
      });
    } catch (error) {
      console.error("Error connecting wallet:", error);
      setState(prev => ({ ...prev, isConnecting: false }));
      
      toast({
        title: "Connection Failed",
        description: "Failed to connect wallet. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Add network
  const addNetwork = async (chainId: number) => {
    if (!networks[chainId]) {
      toast({
        title: "Network Not Supported",
        description: "The requested network is not supported.",
        variant: "destructive"
      });
      return;
    }

    const network = networks[chainId];
    const params: ChainConfig = {
      chainId: `0x${chainId.toString(16)}`, // Convert to hex
      chainName: network.name,
      nativeCurrency: {
        name: network.nativeCurrency.name,
        symbol: network.nativeCurrency.symbol,
        decimals: network.nativeCurrency.decimals
      },
      rpcUrls: network.rpcUrls,
      blockExplorerUrls: network.blockExplorerUrls
    };

    try {
      await window.ethereum!.request({
        method: 'wallet_addEthereumChain',
        params: [params]
      });
      toast({
        title: "Network Added",
        description: `${network.name} has been added to your wallet.`
      });
    } catch (error) {
      console.error("Error adding network:", error);
      toast({
        title: "Failed to Add Network",
        description: "There was an error adding the network to your wallet.",
        variant: "destructive"
      });
    }
  };

  // Switch network
  const switchNetwork = async (chainId: number) => {
    const chainIdHex = `0x${chainId.toString(16)}`;
    
    try {
      await window.ethereum!.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: chainIdHex }]
      });
      toast({
        title: "Network Changed",
        description: "Network has been successfully changed."
      });
    } catch (error: any) {
      // Error code 4902 means the chain is not added yet
      if (error.code === 4902) {
        await addNetwork(chainId);
      } else {
        console.error("Error switching network:", error);
        toast({
          title: "Failed to Switch Network",
          description: "There was an error switching networks.",
          variant: "destructive"
        });
      }
    }
  };

  // Sign a message to authenticate with backend
  const signAuthMessage = async (address: string, chainId: number) => {
    try {
      // First, get a login message from the server
      const loginResponse = await apiRequest<{
        user: any;
        auth: { message: string; timestamp: number };
      }>('/api/users/login', {
        method: 'POST',
        body: JSON.stringify({
          address,
          walletType: 'metamask',
          chainId
        })
      });

      const { message } = loginResponse.auth;
      
      // Request signature from user
      const signature = await window.ethereum!.request({
        method: 'personal_sign',
        params: [message, address]
      });
      
      // Send signature to server for verification
      await apiRequest('/api/users/profile', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${signature}`
        }
      });
      
      return true;
    } catch (error) {
      console.error("Error signing authentication message:", error);
      return false;
    }
  };

  // Sign a message
  const signMessage = async (message: string) => {
    if (!state.isConnected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet first.",
        variant: "destructive"
      });
      return null;
    }

    try {
      const signature = await window.ethereum!.request({
        method: 'personal_sign',
        params: [message, state.address]
      });
      
      return signature;
    } catch (error) {
      console.error("Error signing message:", error);
      toast({
        title: "Signing Failed",
        description: "Failed to sign message. User may have rejected the request.",
        variant: "destructive"
      });
      return null;
    }
  };

  // Send a transaction
  const sendTransaction = async (transaction: any) => {
    if (!state.isConnected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet first.",
        variant: "destructive"
      });
      return null;
    }

    try {
      const txHash = await window.ethereum!.request({
        method: 'eth_sendTransaction',
        params: [transaction]
      });
      
      return txHash;
    } catch (error) {
      console.error("Error sending transaction:", error);
      toast({
        title: "Transaction Failed",
        description: "Failed to send transaction. User may have rejected the request.",
        variant: "destructive"
      });
      return null;
    }
  };

  return (
    <Button
      onClick={connectWallet}
      disabled={state.isConnecting}
      className={className}
    >
      {state.isConnecting 
        ? "Connecting..." 
        : state.isConnected 
          ? `${state.address.substring(0, 6)}...${state.address.substring(state.address.length - 4)}` 
          : buttonText
      }
    </Button>
  );
}

// Also export utility functions to be used elsewhere
export const walletUtils = {
  isMetaMaskInstalled: () => window.ethereum?.isMetaMask || false,
  
  signMessage: async (message: string, address: string) => {
    if (!window.ethereum) return null;
    
    try {
      const signature = await window.ethereum.request({
        method: 'personal_sign',
        params: [message, address]
      });
      
      return signature;
    } catch (error) {
      console.error("Error signing message:", error);
      return null;
    }
  },
  
  sendTransaction: async (transaction: any) => {
    if (!window.ethereum) return null;
    
    try {
      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [transaction]
      });
      
      return txHash;
    } catch (error) {
      console.error("Error sending transaction:", error);
      return null;
    }
  },
  
  switchNetwork: async (chainId: number) => {
    if (!window.ethereum) return false;
    
    const chainIdHex = `0x${chainId.toString(16)}`;
    
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: chainIdHex }]
      });
      
      return true;
    } catch (error) {
      console.error("Error switching network:", error);
      return false;
    }
  }
};