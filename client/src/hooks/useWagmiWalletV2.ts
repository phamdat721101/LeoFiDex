import { useState, useEffect, useCallback } from 'react';
import {
  useAccount,
  useConfig,
  useConnect,
  useDisconnect,
  useBalance,
  useSwitchChain,
  useReadContract,
  useWriteContract,
  useSignMessage,
  useSendTransaction,
  type Chain,
  type UseConnectReturnType,
  type UseDisconnectReturnType,
  type UseBalanceReturnType,
  type UseSwitchChainReturnType,
  type Address
} from 'wagmi';
import { injected, metaMask, coinbaseWallet, walletConnect } from 'wagmi/connectors';
import { NETWORK_PARAMS } from '@/lib/constants';
import { parseEther } from 'viem';

export type ConnectorType = 'metamask' | 'walletconnect' | 'coinbase' | 'injected';

export interface CustomChain extends Chain {}

// Custom hook for using wagmi wallet
export function useWagmiWallet() {
  // Wagmi hooks
  const config = useConfig();
  const { address, isConnected, chainId } = useAccount();
  const { connectAsync, connectors, isPending: isConnectPending, error: connectError } = useConnect();
  const { disconnectAsync, isPending: isDisconnectPending, error: disconnectError } = useDisconnect();
  const { switchChainAsync, isPending: isSwitchPending, error: switchChainError } = useSwitchChain();
  const { data: balanceData, isLoading: isBalanceLoading } = useBalance({
    address
  });
  const { writeContractAsync, isPending: isWriteContractPending, error: writeContractError } = useWriteContract();
  const { signMessageAsync, isPending: isSignMessagePending, error: signMessageError } = useSignMessage();
  const { sendTransactionAsync, isPending: isSendTransactionPending, error: sendTransactionError } = useSendTransaction();

  // Local state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Get connector by type
  const getConnector = useCallback((type: ConnectorType) => {
    let targetConnector;
    
    switch (type) {
      case 'metamask':
        targetConnector = connectors.find(c => c.id === 'metaMask');
        break;
      case 'walletconnect':
        targetConnector = connectors.find(c => c.id === 'walletConnect');
        break;
      case 'coinbase':
        targetConnector = connectors.find(c => c.id === 'coinbaseWallet');
        break;
      case 'injected':
        targetConnector = connectors.find(c => c.id === 'injected');
        break;
      default:
        targetConnector = connectors.find(c => c.id === 'metaMask');
    }
    
    return targetConnector;
  }, [connectors]);

  // Connect wallet
  const connectWallet = useCallback(async (type: ConnectorType) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const connector = getConnector(type);
      if (!connector) {
        throw new Error(`Connector for ${type} not found`);
      }
      
      const result = await connectAsync({ connector });
      return result;
    } catch (err) {
      console.error('Error connecting wallet:', err);
      setError(err instanceof Error ? err : new Error('Failed to connect wallet'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [connectAsync, getConnector]);

  // Disconnect wallet
  const disconnectWallet = useCallback(async () => {
    setIsLoading(true);
    
    try {
      await disconnectAsync();
    } catch (err) {
      console.error('Error disconnecting wallet:', err);
      setError(err instanceof Error ? err : new Error('Failed to disconnect wallet'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [disconnectAsync]);

  // Switch chain
  const switchToChain = useCallback(async (targetChainId: number) => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (!switchChainAsync) {
        throw new Error('Switch chain function not available');
      }
      
      await switchChainAsync({ chainId: targetChainId });
    } catch (err) {
      console.error('Error switching chain:', err);
      setError(err instanceof Error ? err : new Error('Failed to switch chain'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [switchChainAsync]);

  // Sign message
  const signMessage = useCallback(async (message: string) => {
    if (!signMessageAsync) {
      throw new Error('Sign message function not available');
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const signature = await signMessageAsync({ message });
      return signature;
    } catch (err) {
      console.error('Error signing message:', err);
      setError(err instanceof Error ? err : new Error('Failed to sign message'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [signMessageAsync]);

  // Call contract read function
  const callContractRead = useCallback(async <TAbi extends readonly unknown[]>({
    address: contractAddress,
    abi,
    functionName,
    args = [],
    chainId: targetChainId
  }: {
    address: Address;
    abi: TAbi;
    functionName: string;
    args?: any[];
    chainId?: number;
  }) => {
    // Using the useReadContract hook's result would require component refactoring
    // For a direct, imperative call, we can use the wagmi client directly
    try {
      const result = await readContract(config, {
        address: contractAddress,
        abi,
        functionName,
        args: args || undefined,
        chainId: targetChainId
      });
      
      return result;
    } catch (err) {
      console.error('Error calling contract read:', err);
      throw err;
    }
  }, [config]);

  // Write to contract
  const writeContract = useCallback(async <TAbi extends readonly unknown[]>({
    address: contractAddress,
    abi,
    functionName,
    args = [],
    chainId: targetChainId,
    value
  }: {
    address: Address;
    abi: TAbi;
    functionName: string;
    args?: any[];
    chainId?: number;
    value?: bigint | string;
  }) => {
    if (!writeContractAsync) {
      throw new Error('Write contract function not available');
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const parsedValue = typeof value === 'string' ? parseEther(value) : value;
      
      const hash = await writeContractAsync({
        address: contractAddress,
        abi,
        functionName,
        args: args || undefined,
        chainId: targetChainId,
        value: parsedValue
      });
      
      return hash;
    } catch (err) {
      console.error('Error writing to contract:', err);
      setError(err instanceof Error ? err : new Error('Failed to write to contract'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [writeContractAsync]);

  // Send transaction
  const signAndSendTransaction = useCallback(async ({
    to,
    value,
    data,
    chainId: targetChainId
  }: {
    to: Address;
    value?: bigint | string;
    data?: string;
    chainId?: number;
  }) => {
    if (!sendTransactionAsync) {
      throw new Error('Send transaction function not available');
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const parsedValue = typeof value === 'string' 
        ? parseEther(value) 
        : value;
      
      const hash = await sendTransactionAsync({
        to,
        value: parsedValue,
        data: data ? data as `0x${string}` : undefined,
        chainId: targetChainId
      });
      
      return hash;
    } catch (err) {
      console.error('Error sending transaction:', err);
      setError(err instanceof Error ? err : new Error('Failed to send transaction'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [sendTransactionAsync]);

  // Get formatted balance
  const formattedBalance = balanceData ? {
    formatted: balanceData.formatted,
    symbol: balanceData.symbol,
    decimals: balanceData.decimals,
    value: balanceData.value
  } : undefined;

  // Get network name from chain ID
  const getNetworkName = useCallback((id?: number) => {
    if (!id) return 'Unknown Network';
    return NETWORK_PARAMS[id]?.chainName || 'Unknown Network';
  }, []);

  return {
    // Connection state
    address,
    isConnected,
    chainId,
    networkName: chainId ? getNetworkName(chainId) : undefined,
    balance: formattedBalance,
    isLoading: isLoading || isConnectPending || isDisconnectPending || 
              isSwitchPending || isBalanceLoading || isWriteContractPending || 
              isSignMessagePending || isSendTransactionPending,
    error: error || connectError || disconnectError || switchChainError || 
           writeContractError || signMessageError || sendTransactionError,
    
    // Actions
    connect: connectWallet,
    disconnect: disconnectWallet,
    switchChain: switchToChain,
    
    // Transaction helpers
    signAndSendTransaction,
    signMessage,
    callContractRead,
    writeContract,
  };
}