import { useState, useMemo, useCallback } from "react";
import { ethers } from "ethers";
import { useWallet } from "./useWallet";
import { usePools } from "./usePools";
import { useTokens } from "./useTokens";
import { ROUTER_ABI } from "@/lib/contracts";
import { CONTRACTS } from "@/lib/constants";

export function useSwap() {
  const { chainId, address, connected } = useWallet();
  const { pools, getPoolByTokens } = usePools();
  const { tokens } = useTokens();
  
  const [isLoadingQuote, setIsLoadingQuote] = useState(false);
  const [swapRoute, setSwapRoute] = useState<any[]>([]);
  
  // Get the router contract
  const routerContract = useMemo(() => {
    if (!window.ethereum) return null;
    
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      
      return new ethers.Contract(
        CONTRACTS[chainId || 1]?.router || CONTRACTS[1].router,
        ROUTER_ABI,
        signer
      );
    } catch (error) {
      console.error("Error creating router contract:", error);
      return null;
    }
  }, [chainId]);
  
  // Find the best route for a swap
  const findBestRoute = useCallback((tokenIn: string, tokenOut: string, amountIn: number) => {
    // This is a simplified version of routing
    // In a real app, you would use a more sophisticated algorithm to find the optimal path
    
    // Check if direct pool exists
    const directPool = getPoolByTokens(tokenIn, tokenOut, 3000); // Default to 0.3% fee
    if (directPool) {
      return [{ pool: directPool, tokenIn, tokenOut }];
    }
    
    // Look for routes with one hop
    // For each token, check if pools exist from tokenIn -> token and token -> tokenOut
    const intermediateRoutes = tokens?.filter((token: any) => {
      if (token.address === tokenIn || token.address === tokenOut) return false;
      
      const poolA = getPoolByTokens(tokenIn, token.address, 3000);
      const poolB = getPoolByTokens(token.address, tokenOut, 3000);
      
      return poolA && poolB;
    }).map((token: any) => {
      const poolA = getPoolByTokens(tokenIn, token.address, 3000)!;
      const poolB = getPoolByTokens(token.address, tokenOut, 3000)!;
      
      return [
        { pool: poolA, tokenIn, tokenOut: token.address },
        { pool: poolB, tokenIn: token.address, tokenOut }
      ];
    });
    
    if (intermediateRoutes?.length) {
      // In a real app, you would calculate the output amount for each route and pick the best one
      // For simplicity, we just return the first route
      return intermediateRoutes[0];
    }
    
    return [];
  }, [tokens, getPoolByTokens]);
  
  // Get quote for a swap
  const getQuote = useCallback(async (tokenIn: string, tokenOut: string, amountIn: number) => {
    setIsLoadingQuote(true);
    
    try {
      // Find the best route
      const route = findBestRoute(tokenIn, tokenOut, amountIn);
      setSwapRoute(route);
      
      if (route.length === 0) {
        throw new Error("No route found");
      }
      
      // For direct swaps
      if (route.length === 1) {
        const pool = route[0].pool;
        
        // In a real app, you would call the router's quoteExactInputSingle function
        // For this demo, we'll use a simple price calculation based on the pool's price
        const inToken = tokens?.find((t: any) => t.address === tokenIn);
        const outToken = tokens?.find((t: any) => t.address === tokenOut);
        
        if (!inToken || !outToken) {
          throw new Error("Token not found");
        }
        
        const amountInWei = ethers.utils.parseUnits(
          amountIn.toString(),
          inToken.decimals
        );
        
        // Simple price calculation for demo
        // In a real app, this would use the actual pool price, accounting for slippage, fees, etc.
        const price = pool.token0.address.toLowerCase() === tokenIn.toLowerCase()
          ? pool.price
          : 1 / pool.price;
        
        const rawAmountOut = amountIn * price;
        
        // Apply 0.3% fee
        const amountOut = rawAmountOut * 0.997;
        
        return amountOut;
      }
      
      // For routes with hops
      // This is a simplified calculation
      let currentAmount = amountIn;
      
      for (const hop of route) {
        const pool = hop.pool;
        
        const inToken = tokens?.find((t: any) => t.address === hop.tokenIn);
        const outToken = tokens?.find((t: any) => t.address === hop.tokenOut);
        
        if (!inToken || !outToken) {
          throw new Error("Token not found in route");
        }
        
        // Simple price calculation for demo
        const price = pool.token0.address.toLowerCase() === hop.tokenIn.toLowerCase()
          ? pool.price
          : 1 / pool.price;
        
        const rawAmountOut = currentAmount * price;
        
        // Apply 0.3% fee
        currentAmount = rawAmountOut * 0.997;
      }
      
      return currentAmount;
    } catch (error) {
      console.error("Error getting quote:", error);
      throw error;
    } finally {
      setIsLoadingQuote(false);
    }
  }, [tokens, findBestRoute]);
  
  // Execute a swap
  const executeSwap = useCallback(async (
    tokenIn: string,
    tokenOut: string,
    amountIn: string,
    amountOutMin: string,
    recipient: string = address || '',
    deadline: number = 20 // minutes
  ) => {
    if (!connected || !routerContract) {
      throw new Error("Wallet not connected");
    }
    
    try {
      const inToken = tokens?.find((t: any) => t.address === tokenIn);
      
      if (!inToken) {
        throw new Error("Token not found");
      }
      
      const amountInWei = ethers.utils.parseUnits(
        amountIn,
        inToken.decimals
      );
      
      const outToken = tokens?.find((t: any) => t.address === tokenOut);
      
      if (!outToken) {
        throw new Error("Token out not found");
      }
      
      const amountOutMinWei = ethers.utils.parseUnits(
        amountOutMin,
        outToken.decimals
      );
      
      // Calculate deadline
      const deadlineTime = Math.floor(Date.now() / 1000) + (deadline * 60);
      
      // Execute the swap
      // This is simplified - in a real app, you would handle token approvals first
      if (swapRoute.length === 1) {
        // Direct swap
        const tx = await routerContract.exactInputSingle({
          tokenIn,
          tokenOut,
          fee: swapRoute[0].pool.fee,
          recipient,
          amountIn: amountInWei,
          amountOutMinimum: amountOutMinWei,
          sqrtPriceLimitX96: 0
        });
        
        return tx;
      } else if (swapRoute.length > 1) {
        // Multi-hop swap
        // Encode the path
        const path = ethers.utils.solidityPack(
          ['address', 'uint24', 'address', 'uint24', 'address'],
          [
            swapRoute[0].tokenIn,
            swapRoute[0].pool.fee,
            swapRoute[0].tokenOut,
            swapRoute[1].pool.fee,
            swapRoute[1].tokenOut
          ]
        );
        
        const tx = await routerContract.exactInput({
          path,
          recipient,
          amountIn: amountInWei,
          amountOutMinimum: amountOutMinWei
        });
        
        return tx;
      }
      
      throw new Error("Invalid swap route");
    } catch (error) {
      console.error("Error executing swap:", error);
      throw error;
    }
  }, [address, connected, routerContract, swapRoute, tokens]);
  
  return {
    getQuote,
    executeSwap,
    isLoadingQuote,
    swapRoute
  };
}
