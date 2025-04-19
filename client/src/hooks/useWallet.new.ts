import { useContext } from 'react';
import { WalletContext } from '@/components/web3/Web3Provider.new';

export function useWallet() {
  const context = useContext(WalletContext);
  
  if (!context) {
    throw new Error('useWallet must be used within a Web3Provider');
  }
  
  const { 
    connect, 
    disconnect, 
    addNetwork, 
    switchNetwork,
    address, 
    chainId, 
    isConnected, 
    balance,
    isLoading,
    error,
    signMessage,
    executeContract
  } = context;
  
  // Helper function to format address for display
  const formatAddress = (address: string | null): string => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };
  
  // Check if the user is on a supported network
  const isNetworkSupported = (chainId: number | null): boolean => {
    if (!chainId) return false;
    
    // List of supported chain IDs
    const supportedChainIds = [1, 5, 11155111, 137, 80001, 42161, 10, 56];
    return supportedChainIds.includes(chainId);
  };
  
  // Get network name from chain ID
  const getNetworkName = (chainId: number | null): string => {
    if (!chainId) return 'Unknown Network';
    
    const networks: { [key: number]: string } = {
      1: 'Ethereum',
      5: 'Goerli',
      11155111: 'Sepolia',
      137: 'Polygon',
      80001: 'Mumbai',
      42161: 'Arbitrum',
      10: 'Optimism',
      56: 'BSC',
      // Add more networks as needed
    };
    
    return networks[chainId] || `Chain ID: ${chainId}`;
  };
  
  // Format the balance
  const formatBalance = (balance: string): string => {
    try {
      const num = parseFloat(balance);
      return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 6
      }).format(num);
    } catch {
      return '0.00';
    }
  };
  
  return {
    connect,
    disconnect,
    addNetwork,
    switchNetwork,
    address,
    chainId,
    isConnected,
    balance,
    isLoading,
    error,
    signMessage,
    executeContract,
    
    // Helper functions
    formatAddress,
    isNetworkSupported,
    getNetworkName,
    formatBalance,
    
    // Computed properties
    formattedAddress: formatAddress(address),
    networkName: getNetworkName(chainId),
    formattedBalance: formatBalance(balance),
    isConnecting: isLoading,
    isInvalidNetwork: isConnected && !isNetworkSupported(chainId)
  };
}