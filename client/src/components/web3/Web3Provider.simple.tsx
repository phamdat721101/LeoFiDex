import { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';
import { NETWORK_PARAMS } from '@/lib/constants';
import { apiRequest } from '@/lib/queryClient';
import { walletUtils, WalletState } from './DirectWalletConnect';

export interface Web3ContextType {
  isConnected: boolean;
  isConnecting: boolean;
  address: string;
  chainId: number;
  connectWallet: () => Promise<boolean>;
  disconnectWallet: () => void;
  signMessage: (message: string) => Promise<string | null>;
  sendTransaction: (transaction: any) => Promise<string | null>;
  switchNetwork: (chainId: number) => Promise<boolean>;
  recordAction: (
    actionType: string,
    details: Record<string, any>,
    txHash?: string
  ) => Promise<any>;
  ensureCorrectNetwork: (requiredChainId: number) => Promise<boolean>;
}

// Create context with default values
const Web3Context = createContext<Web3ContextType>({
  isConnected: false,
  isConnecting: false,
  address: '',
  chainId: 0,
  connectWallet: async () => false,
  disconnectWallet: () => {},
  signMessage: async () => null,
  sendTransaction: async () => null,
  switchNetwork: async () => false,
  recordAction: async () => null,
  ensureCorrectNetwork: async () => false,
});

export interface Web3ProviderProps {
  children: ReactNode;
}

export function Web3Provider({ children }: Web3ProviderProps) {
  const [state, setState] = useState<WalletState>({
    address: '',
    chainId: 0,
    isConnected: false,
    isConnecting: false,
    walletType: null
  });
  const { toast } = useToast();

  // Check initial connection on mount
  useEffect(() => {
    const checkConnection = async () => {
      if (window.ethereum?.isMetaMask) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            const chainIdHex = await window.ethereum.request({ method: 'eth_chainId' });
            const chainId = parseInt(chainIdHex, 16);
            
            setState({
              address: accounts[0],
              chainId,
              isConnected: true,
              isConnecting: false,
              walletType: 'metamask'
            });
          }
        } catch (error) {
          console.error('Failed to check initial connection', error);
        }
      }
    };
    
    checkConnection();
    
    // Setup event listeners
    if (window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          // User disconnected
          setState({
            address: '',
            chainId: 0,
            isConnected: false,
            isConnecting: false,
            walletType: null
          });
        } else {
          // Account changed
          setState(prev => ({
            ...prev,
            address: accounts[0],
            isConnected: true
          }));
        }
      };
      
      const handleChainChanged = (chainIdHex: string) => {
        const chainId = parseInt(chainIdHex, 16);
        setState(prev => ({ ...prev, chainId }));
      };
      
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
      
      return () => {
        window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum?.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, []);

  // Connect wallet
  const connectWallet = async (): Promise<boolean> => {
    if (!window.ethereum) {
      toast({
        title: 'No Wallet Detected',
        description: 'Please install MetaMask or another Web3 wallet extension.',
        variant: 'destructive'
      });
      return false;
    }
    
    setState(prev => ({ ...prev, isConnecting: true }));
    
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const chainIdHex = await window.ethereum.request({ method: 'eth_chainId' });
      const chainId = parseInt(chainIdHex, 16);
      
      setState({
        address: accounts[0],
        chainId,
        isConnected: true,
        isConnecting: false,
        walletType: 'metamask'
      });
      
      // Authenticate with backend
      try {
        const { auth } = await apiRequest<{ auth: { message: string } }>('/api/users/login', {
          method: 'POST',
          body: JSON.stringify({
            address: accounts[0],
            walletType: 'metamask',
            chainId
          })
        });
        
        const signature = await window.ethereum.request({
          method: 'personal_sign',
          params: [auth.message, accounts[0]]
        });
        
        await apiRequest('/api/users/profile', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${signature}`
          }
        });
      } catch (authError) {
        console.error('Authentication failed', authError);
        // Continue even if authentication fails
      }
      
      toast({
        title: 'Wallet Connected',
        description: 'Your wallet has been successfully connected.'
      });
      
      return true;
    } catch (error) {
      console.error('Failed to connect wallet', error);
      setState(prev => ({ ...prev, isConnecting: false }));
      
      toast({
        title: 'Connection Failed',
        description: 'Failed to connect your wallet. Please try again.',
        variant: 'destructive'
      });
      
      return false;
    }
  };
  
  // Disconnect wallet (clean up state only, can't force disconnect MetaMask)
  const disconnectWallet = () => {
    setState({
      address: '',
      chainId: 0,
      isConnected: false,
      isConnecting: false,
      walletType: null
    });
    
    toast({
      title: 'Wallet Disconnected',
      description: 'Your wallet has been disconnected.'
    });
  };
  
  // Sign message
  const signMessage = async (message: string): Promise<string | null> => {
    if (!state.isConnected) {
      toast({
        title: 'Wallet Not Connected',
        description: 'Please connect your wallet first.',
        variant: 'destructive'
      });
      return null;
    }
    
    try {
      const signature = await window.ethereum!.request({
        method: 'personal_sign',
        params: [message, state.address]
      });
      
      // Record action
      await recordAction('signMessage', { message });
      
      return signature;
    } catch (error) {
      console.error('Failed to sign message', error);
      toast({
        title: 'Signing Failed',
        description: 'Failed to sign message with your wallet.',
        variant: 'destructive'
      });
      return null;
    }
  };
  
  // Send transaction
  const sendTransaction = async (transaction: any): Promise<string | null> => {
    if (!state.isConnected) {
      toast({
        title: 'Wallet Not Connected',
        description: 'Please connect your wallet first.',
        variant: 'destructive'
      });
      return null;
    }
    
    try {
      // Ensure chainId matches current network
      if (transaction.chainId && transaction.chainId !== state.chainId) {
        const switched = await switchNetwork(transaction.chainId);
        if (!switched) {
          throw new Error('Network switching failed');
        }
      }
      
      const txHash = await window.ethereum!.request({
        method: 'eth_sendTransaction',
        params: [transaction]
      });
      
      // Record action
      await recordAction('contractInteraction', { 
        to: transaction.to,
        value: transaction.value,
        method: transaction.data ? transaction.data.substring(0, 10) : undefined
      }, txHash);
      
      toast({
        title: 'Transaction Sent',
        description: 'Your transaction has been sent to the network.'
      });
      
      return txHash;
    } catch (error) {
      console.error('Transaction failed', error);
      toast({
        title: 'Transaction Failed',
        description: 'Failed to send transaction. User may have rejected it.',
        variant: 'destructive'
      });
      return null;
    }
  };
  
  // Switch network
  const switchNetwork = async (chainId: number): Promise<boolean> => {
    if (!state.isConnected) {
      toast({
        title: 'Wallet Not Connected',
        description: 'Please connect your wallet first.',
        variant: 'destructive'
      });
      return false;
    }
    
    if (state.chainId === chainId) {
      return true; // Already on the correct network
    }
    
    try {
      const chainIdHex = `0x${chainId.toString(16)}`;
      
      try {
        // Try to switch to the network
        await window.ethereum!.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: chainIdHex }]
        });
      } catch (switchError: any) {
        // This error code indicates that the chain has not been added to MetaMask
        if (switchError.code === 4902) {
          // Get network parameters
          const network = NETWORK_PARAMS[chainId];
          if (!network) {
            throw new Error(`Network with chainId ${chainId} not supported`);
          }
          
          await window.ethereum!.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: chainIdHex,
              chainName: network.name,
              nativeCurrency: network.nativeCurrency,
              rpcUrls: network.rpcUrls,
              blockExplorerUrls: network.blockExplorerUrls
            }]
          });
        } else {
          throw switchError;
        }
      }
      
      // Record action
      await recordAction('switchNetwork', { 
        chainId,
        networkName: NETWORK_PARAMS[chainId]?.name || 'Unknown Network'
      });
      
      toast({
        title: 'Network Changed',
        description: `You're now connected to ${NETWORK_PARAMS[chainId]?.name || 'the new network'}.`
      });
      
      return true;
    } catch (error) {
      console.error('Failed to switch network', error);
      toast({
        title: 'Network Switch Failed',
        description: 'Failed to switch to the requested network.',
        variant: 'destructive'
      });
      return false;
    }
  };
  
  // Ensure correct network
  const ensureCorrectNetwork = async (requiredChainId: number): Promise<boolean> => {
    if (state.chainId !== requiredChainId) {
      toast({
        title: 'Wrong Network',
        description: `This operation requires ${NETWORK_PARAMS[requiredChainId]?.name || 'a different network'}. Switching...`,
      });
      
      return switchNetwork(requiredChainId);
    }
    
    return true;
  };
  
  // Record user action
  const recordAction = async (
    actionType: string, 
    details: Record<string, any>,
    txHash?: string
  ): Promise<any> => {
    if (!state.isConnected) return null;
    
    try {
      const response = await apiRequest('/api/users/actions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address: state.address,
          actionType,
          details,
          chainId: state.chainId,
          transactionHash: txHash
        }),
      });
      
      return response;
    } catch (error) {
      console.error('Failed to record action', error);
      return null;
    }
  };
  
  // Create memoized context value
  const contextValue = useMemo(() => ({
    isConnected: state.isConnected,
    isConnecting: state.isConnecting,
    address: state.address,
    chainId: state.chainId,
    connectWallet,
    disconnectWallet,
    signMessage,
    sendTransaction,
    switchNetwork,
    recordAction,
    ensureCorrectNetwork,
  }), [state]);
  
  return (
    <Web3Context.Provider value={contextValue}>
      {children}
    </Web3Context.Provider>
  );
}

// Custom hook to use the Web3 context
export function useWeb3() {
  const context = useContext(Web3Context);
  
  if (!context) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  
  return context;
}