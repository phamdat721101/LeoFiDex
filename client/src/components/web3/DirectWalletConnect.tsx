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

  // Check if any injected provider exists
  const hasInjectedProvider = useCallback(() => {
    return typeof window.ethereum !== 'undefined';
  }, []);

  // Handle chain changed event
  const handleChainChanged = useCallback((chainIdHex: string) => {
    const chainId = parseInt(chainIdHex, 16);
    setState(prev => {
      const next = { ...prev, chainId };
      onConnected?.(next);
      return next;
    });
  }, [onConnected]);

  // Handle account changed event
  const handleAccountsChanged = useCallback((accounts: string[]) => {
    if (accounts.length === 0) {
      // Disconnected
      const resetState: WalletState = {
        address: '', chainId: 0, isConnected: false, isConnecting: false, walletType: null
      };
      setState(resetState);
      onConnected?.(resetState);
    } else {
      const next: WalletState = {
        ...state,
        address: accounts[0],
        isConnected: true,
        isConnecting: false,
        walletType: 'metamask'
      };
      setState(next);
      onConnected?.(next);
    }
  }, [onConnected, state]);

  // Setup listeners and auto-connect
  useEffect(() => {
    const checkConnection = async () => {
      if (hasInjectedProvider()) {
        try {
          const accounts: string[] = await window.ethereum!.request({ method: 'eth_accounts' });
          const chainIdHex: string = await window.ethereum!.request({ method: 'eth_chainId' });
          const chainId = parseInt(chainIdHex, 16);

          if (accounts.length > 0) {
            const next: WalletState = {
              address: accounts[0],
              chainId,
              isConnected: true,
              isConnecting: false,
              walletType: 'metamask'
            };
            setState(next);
            onConnected?.(next);
          }
        } catch (error) {
          console.error('Error checking connection:', error);
        }
      }
    };

    if (window.ethereum) {
      window.ethereum.on('chainChanged', handleChainChanged);
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      checkConnection();
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('chainChanged', handleChainChanged);
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      }
    };
  }, [hasInjectedProvider, handleChainChanged, handleAccountsChanged, onConnected]);

  // Connect wallet
  const connectWallet = async () => {
    if (!hasInjectedProvider()) {
      toast({ title: 'No Wallet Detected', description: 'Please install a Web3 wallet.', variant: 'destructive' });
      return;
    }

    setState(prev => ({ ...prev, isConnecting: true }));

    try {
      const accounts: string[] = await window.ethereum!.request({ method: 'eth_requestAccounts' });
      const chainIdHex: string = await window.ethereum!.request({ method: 'eth_chainId' });
      const chainId = parseInt(chainIdHex, 16);

      const next: WalletState = {
        address: accounts[0],
        chainId,
        isConnected: true,
        isConnecting: false,
        walletType: 'metamask'
      };
      setState(next);
      onConnected?.(next);

      await signAuthMessage(accounts[0], chainId);

      toast({ title: 'Wallet Connected', description: 'Your wallet has been connected.' });
    } catch (error) {
      console.error('Error connecting wallet:', error);
      setState(prev => ({ ...prev, isConnecting: false }));
      toast({ title: 'Connection Failed', description: 'Please try again.', variant: 'destructive' });
    }
  };

  // Add network
  const addNetwork = async (chainId: number) => {
    const network = networks[chainId];
    if (!network) {
      toast({ title: 'Network Not Supported', description: 'The requested network is not available.', variant: 'destructive' });
      return;
    }

    const params: ChainConfig = {
      chainId: `0x${chainId.toString(16)}`,
      chainName: network.name,
      nativeCurrency: network.nativeCurrency,
      rpcUrls: network.rpcUrls,
      blockExplorerUrls: network.blockExplorerUrls
    };

    try {
      await window.ethereum!.request({ method: 'wallet_addEthereumChain', params: [params] });
      toast({ title: 'Network Added', description: `${network.name} added to wallet.` });
    } catch (error) {
      console.error('Error adding network:', error);
      toast({ title: 'Add Network Failed', description: 'Could not add the network.', variant: 'destructive' });
    }
  };

  // Switch network
  const switchNetwork = async (chainId: number) => {
    const chainIdHex = `0x${chainId.toString(16)}`;
    try {
      await window.ethereum!.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: chainIdHex }] });
      toast({ title: 'Network Switched', description: 'Network changed successfully.' });
    } catch (error: any) {
      if (error.code === 4902) {
        await addNetwork(chainId);
      } else {
        console.error('Error switching network:', error);
        toast({ title: 'Switch Network Failed', description: 'Could not switch network.', variant: 'destructive' });
      }
    }
  };

  // Sign auth message
  const signAuthMessage = async (address: string, chainId: number) => {
    try {
      const login = await apiRequest('/api/users/login', {
        method: 'POST',
        body: JSON.stringify({ address, walletType: 'metamask', chainId })
      });
      const message = login.auth.message;
      const signature = await window.ethereum!.request({ method: 'personal_sign', params: [message, address] });
      await apiRequest('/api/users/profile', { method: 'GET', headers: { Authorization: `Bearer ${signature}` } });
      return true;
    } catch (error) {
      console.error('Error signing auth message:', error);
      return false;
    }
  };

  return (
    <Button
      onClick={connectWallet}
      disabled={state.isConnecting}
      className={className}
    >
      {state.isConnecting
        ? 'Connecting...'
        : state.isConnected
          ? `${state.address.substring(0, 6)}...${state.address.slice(-4)}`
          : buttonText}
    </Button>
  );
}

// Utility exports
export const walletUtils = {
  hasInjectedProvider: () => typeof window.ethereum !== 'undefined',
  signMessage: async (message: string, address: string) => {
    if (!window.ethereum) return null;
    try {
      return await window.ethereum.request({ method: 'personal_sign', params: [message, address] });
    } catch (error) {
      console.error('Error signing message:', error);
      return null;
    }
  },
  sendTransaction: async (tx: any) => {
    if (!window.ethereum) return null;
    try {
      return await window.ethereum.request({ method: 'eth_sendTransaction', params: [tx] });
    } catch (error) {
      console.error('Error sending tx:', error);
      return null;
    }
  },
  switchNetwork: async (chainId: number) => {
    if (!window.ethereum) return false;
    try {
      await window.ethereum.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: `0x${chainId.toString(16)}` }] });
      return true;
    } catch (error) {
      console.error('Error switching network:', error);
      return false;
    }
  }
};
