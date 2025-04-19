import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useWallet } from "./useWallet";
import { ERC20_ABI } from "@/lib/contracts";
import { TOKENS } from "@/lib/tokens";

export function useTokens() {
  const { address, connected, chainId } = useWallet();
  const [tokenBalances, setTokenBalances] = useState<{ [address: string]: string }>({});
  
  // Fetch tokens from API
  const { data: tokens, isLoading, error } = useQuery({
    queryKey: ['/api/tokens'],
    enabled: !!chainId,
  });
  
  // Get token balances if wallet is connected
  useEffect(() => {
    const fetchTokenBalances = async () => {
      if (!connected || !address || !window.ethereum) {
        return;
      }
      
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const balances: { [address: string]: string } = {};
        
        // Use the tokens from API or fallback to predefined tokens
        const tokenList = tokens || TOKENS;
        
        for (const token of tokenList) {
          try {
            const tokenContract = new ethers.Contract(
              token.address,
              ERC20_ABI,
              provider
            );
            
            const balance = await tokenContract.balanceOf(address);
            balances[token.address] = ethers.utils.formatUnits(
              balance,
              token.decimals
            );
          } catch (err) {
            console.error(`Error fetching balance for ${token.symbol}:`, err);
            balances[token.address] = "0";
          }
        }
        
        setTokenBalances(balances);
      } catch (error) {
        console.error("Error fetching token balances:", error);
      }
    };
    
    fetchTokenBalances();
    
    // Set up interval to refresh balances every 15 seconds
    const intervalId = setInterval(fetchTokenBalances, 15000);
    
    return () => clearInterval(intervalId);
  }, [connected, address, tokens, chainId]);
  
  // Filter tokens by chainId
  const filteredTokens = tokens?.filter((token: any) => {
    // If chainId is not available, show all tokens
    if (!chainId) return true;
    
    // Check if token is supported on current chain
    return token.chainId === chainId || token.chainId === 0;
  });
  
  // Get balance for a specific token
  const getTokenBalance = (tokenAddress: string): string => {
    return tokenBalances[tokenAddress] || "0";
  };
  
  // Check if user has sufficient balance
  const hasSufficientBalance = (tokenAddress: string, amount: string): boolean => {
    const balance = tokenBalances[tokenAddress] || "0";
    try {
      return parseFloat(balance) >= parseFloat(amount);
    } catch {
      return false;
    }
  };
  
  return {
    tokens: filteredTokens || TOKENS,
    isLoading,
    error,
    getTokenBalance,
    hasSufficientBalance,
    tokenBalances
  };
}
