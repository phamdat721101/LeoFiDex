import { useState, useEffect, useContext } from 'react';
import { useAccount, useConnect, useDisconnect, useBalance, useChainId } from 'wagmi';
import { usePublicClient, useWalletClient } from 'wagmi';
import { CustomChainContext, CustomChain } from '@/components/web3/Web3Provider';
import { parseEther } from 'viem';

export interface TransactionResult {
  hash: string;
  status: 'pending' | 'success' | 'error';
  error?: Error;
}

export function useWagmiWallet() {
  const { customChains, addCustomChain, removeCustomChain } = useContext(CustomChainContext);
  const chainId = useChainId();
  const { 
    address, 
    isConnected: connected,
    isConnecting: isWalletConnecting,
    isReconnecting,
    status 
  } = useAccount();
  const { connect, connectors, error: connectError, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { data: balanceData } = useBalance({ address });
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  
  const [isConnecting, setIsConnecting] = useState(false);
  const [transactionStatus, setTransactionStatus] = useState<TransactionResult | null>(null);

  // Handle wallet connection based on connector type
  const connectWallet = async (connectorId: string) => {
    setIsConnecting(true);
    try {
      // Find the connector by ID
      const selectedConnector = connectors.find(c => 
        c.id.toLowerCase() === connectorId.toLowerCase()
      );
      
      if (!selectedConnector) {
        throw new Error(`Connector ${connectorId} not found`);
      }
      
      // Connect with the selected connector
      await connect({ connector: selectedConnector });
    } catch (error) {
      console.error("Connection error:", error);
    } finally {
      setIsConnecting(false);
    }
  };

  // Sign a message with the connected wallet
  const signMessage = async (message: string): Promise<string | null> => {
    if (!walletClient || !address) {
      console.error("Wallet not connected");
      return null;
    }
    
    try {
      const signature = await walletClient.signMessage({
        message,
      });
      return signature;
    } catch (error) {
      console.error("Error signing message:", error);
      return null;
    }
  };

  // Execute a contract function
  const executeContract = async ({
    address: contractAddress,
    abi,
    functionName,
    args,
    value,
  }: {
    address: `0x${string}`;
    abi: any[];
    functionName: string;
    args: any[];
    value?: string;
  }): Promise<TransactionResult> => {
    if (!walletClient || !address) {
      const error = new Error("Wallet not connected");
      setTransactionStatus({
        hash: '0x',
        status: 'error',
        error,
      });
      return {
        hash: '0x',
        status: 'error',
        error,
      };
    }

    try {
      setTransactionStatus({
        hash: '0x',
        status: 'pending',
      });

      const hash = await walletClient.writeContract({
        address: contractAddress,
        abi,
        functionName,
        args,
        value: value ? parseEther(value) : undefined,
      });

      setTransactionStatus({
        hash,
        status: 'success',
      });
      
      return {
        hash,
        status: 'success',
      };
    } catch (error) {
      console.error("Error executing contract:", error);
      setTransactionStatus({
        hash: '0x',
        status: 'error',
        error: error as Error,
      });
      
      return {
        hash: '0x',
        status: 'error',
        error: error as Error,
      };
    }
  };

  // Function to add a custom EVM chain
  const addEVMChain = async (chainInfo: {
    chainId: number;
    chainName: string;
    nativeCurrency: {
      name: string;
      symbol: string;
      decimals: number;
    };
    rpcUrls: string[];
    blockExplorerUrls?: string[];
  }) => {
    try {
      // Check if chain is already added to wagmi
      const existingChain = customChains.find(c => c.id === chainInfo.chainId);
      if (existingChain) {
        return true;
      }

      // Format the chain for wagmi
      const newChain: CustomChain = {
        id: chainInfo.chainId,
        name: chainInfo.chainName,
        network: chainInfo.chainName.toLowerCase().replace(/\s+/g, '-'),
        nativeCurrency: {
          name: chainInfo.nativeCurrency.name,
          symbol: chainInfo.nativeCurrency.symbol,
          decimals: chainInfo.nativeCurrency.decimals,
        },
        rpcUrls: {
          default: {
            http: chainInfo.rpcUrls,
          },
          public: {
            http: chainInfo.rpcUrls,
          },
        },
      };

      // Add block explorer if available
      if (chainInfo.blockExplorerUrls && chainInfo.blockExplorerUrls.length > 0) {
        newChain.blockExplorers = {
          default: {
            name: chainInfo.chainName + ' Explorer',
            url: chainInfo.blockExplorerUrls[0],
          },
        };
      }

      // Add the chain to wagmi custom chains
      addCustomChain(newChain);

      // Also try to add to MetaMask if available
      if (window?.ethereum) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: `0x${chainInfo.chainId.toString(16)}`,
                chainName: chainInfo.chainName,
                nativeCurrency: chainInfo.nativeCurrency,
                rpcUrls: chainInfo.rpcUrls,
                blockExplorerUrls: chainInfo.blockExplorerUrls,
              },
            ],
          });
        } catch (addError) {
          console.warn("Failed to add chain to wallet:", addError);
          // Continue even if wallet_addEthereumChain fails
        }
      }

      return true;
    } catch (error) {
      console.error("Error adding custom chain:", error);
      return false;
    }
  };

  // Switch to a specific chain
  const switchChain = async (chainId: number) => {
    if (!walletClient) {
      console.error("Wallet not connected");
      return false;
    }

    try {
      // Try to switch chain via wallet
      if (window?.ethereum) {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: `0x${chainId.toString(16)}` }],
        });
      }
      return true;
    } catch (error: any) {
      // If chain is not added to wallet
      if (error.code === 4902) {
        // Find chain in our custom chains
        const customChain = customChains.find(c => c.id === chainId);
        if (customChain) {
          return addEVMChain({
            chainId: customChain.id,
            chainName: customChain.name,
            nativeCurrency: customChain.nativeCurrency,
            rpcUrls: customChain.rpcUrls.default.http,
            blockExplorerUrls: customChain.blockExplorers 
              ? [customChain.blockExplorers.default.url] 
              : undefined,
          });
        }
      }
      console.error("Error switching chain:", error);
      return false;
    }
  };

  return {
    // Connection state
    address,
    chainId,
    connected,
    isConnecting: isConnecting || isWalletConnecting || isReconnecting,
    status,
    
    // Balance
    balance: balanceData?.formatted,
    balanceSymbol: balanceData?.symbol,
    balanceValue: balanceData?.value,
    
    // Functions
    connect: connectWallet,
    disconnect,
    signMessage,
    executeContract,
    addEVMChain,
    switchChain,
    
    // Error handling
    error: connectError,
    
    // Transaction status
    transactionStatus,
    
    // Raw providers/clients
    publicClient,
    walletClient,
    
    // Available connectors
    connectors,
  };
}