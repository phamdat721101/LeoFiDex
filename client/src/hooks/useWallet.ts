import { useState, useEffect, useContext, useCallback } from 'react';
import { Web3Context } from '@/components/web3/Web3Provider';
import { ethers } from 'ethers';

export function useWallet() {
  const web3Context = useContext(Web3Context);
  const [address, setAddress] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [connected, setConnected] = useState(false);
  const [chainId, setChainId] = useState<number | null>(null);
  const [balance, setBalance] = useState<string>('0');

  // Get current account on initialization and when accounts change
  useEffect(() => {
    const getAccount = async () => {
      if (web3Context.provider) {
        try {
          const accounts = await web3Context.provider.listAccounts();
          
          if (accounts.length > 0) {
            setAddress(accounts[0]);
            setConnected(true);
            
            // Get user's native token balance
            const balance = await web3Context.provider.getBalance(accounts[0]);
            setBalance(ethers.utils.formatEther(balance));
            
            // Check if user is an admin (for demo purposes, this would be a more complex check in production)
            // You could check if the address is in a list of admins or has a specific role in a contract
            const adminAddresses = [
              "0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199", // Example address
              "0xdD2FD4581271e230360230F9337D5c0430Bf44C0"  // Example address
            ];
            setIsAdmin(adminAddresses.includes(accounts[0]));
          } else {
            setAddress(null);
            setConnected(false);
            setBalance('0');
            setIsAdmin(false);
          }
          
          if (web3Context.network) {
            setChainId(web3Context.network.chainId);
          }
        } catch (error) {
          console.error("Failed to get user account", error);
          setAddress(null);
          setConnected(false);
        }
      }
    };

    getAccount();
  }, [web3Context.provider, web3Context.network]);

  const connect = useCallback(async (providerType: string) => {
    if (!window.ethereum) {
      window.open("https://metamask.io/download/", "_blank");
      return;
    }

    try {
      if (providerType === "metamask") {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        
        // Reload page to ensure provider is properly initialized
        if (!web3Context.provider) {
          window.location.reload();
          return;
        }
        
        const accounts = await web3Context.provider.listAccounts();
        if (accounts.length > 0) {
          setAddress(accounts[0]);
          setConnected(true);
          
          // Get user's native token balance
          const balance = await web3Context.provider.getBalance(accounts[0]);
          setBalance(ethers.utils.formatEther(balance));
        }
      } else {
        // For demo purposes, we're just simulating other wallets
        // In a real app, you would integrate with walletconnect, coinbase, etc.
        console.log(`Connecting to ${providerType}...`);
        
        // Simulate connected address
        const demoAddress = "0x71C7656EC7ab88b098defB751B7401B5f6d8976F";
        setAddress(demoAddress);
        setConnected(true);
        setBalance('10.0');
      }
    } catch (error) {
      console.error(`Error connecting to ${providerType}:`, error);
    }
  }, [web3Context.provider]);

  const disconnect = useCallback(() => {
    setAddress(null);
    setConnected(false);
    setBalance('0');
    setIsAdmin(false);
    
    // Note: There's no standard method to disconnect from MetaMask
    // The user would need to disconnect from within MetaMask itself
    // This just clears the local state
  }, []);

  return {
    address,
    connected,
    chainId,
    balance,
    isAdmin,
    connect,
    disconnect
  };
}
