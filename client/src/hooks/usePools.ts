import { useQuery } from "@tanstack/react-query";
import { useWallet } from "./useWallet";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { FACTORY_ABI, POOL_ABI } from "@/lib/contracts";
import { CONTRACTS } from "@/lib/constants";

export function usePools() {
  const { chainId, address, connected } = useWallet();
  const [userPositions, setUserPositions] = useState<any[]>([]);
  
  // Fetch pools from API
  const { data: pools, isLoading, error } = useQuery({
    queryKey: ['/api/pools'],
    enabled: !!chainId,
  });
  
  // Fetch user positions from the blockchain
  useEffect(() => {
    const fetchUserPositions = async () => {
      if (!connected || !address || !window.ethereum) {
        return;
      }
      
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const positions: any[] = [];
        
        // This is a simplified version - in a real app, you would query events or a subgraph
        // to get the user's positions more efficiently
        if (pools) {
          for (const pool of pools) {
            try {
              const poolContract = new ethers.Contract(
                pool.address,
                POOL_ABI,
                provider
              );
              
              // This is a placeholder - actual implementation would depend on the pool contract structure
              const userLiquidity = await poolContract.balanceOf(address);
              
              if (userLiquidity.gt(0)) {
                positions.push({
                  poolId: pool.id,
                  poolAddress: pool.address,
                  token0: pool.token0,
                  token1: pool.token1,
                  liquidity: ethers.utils.formatEther(userLiquidity),
                });
              }
            } catch (err) {
              console.error(`Error fetching position for pool ${pool.id}:`, err);
            }
          }
        }
        
        setUserPositions(positions);
      } catch (error) {
        console.error("Error fetching user positions:", error);
      }
    };
    
    fetchUserPositions();
  }, [connected, address, pools, chainId]);
  
  // Get pool information by id
  const getPoolById = (id: string) => {
    return pools?.find((pool: any) => pool.id === id);
  };
  
  // Get pool information by token addresses
  const getPoolByTokens = (token0: string, token1: string, fee: number) => {
    // Ensure tokens are in canonical order
    const [tokenA, tokenB] = token0.toLowerCase() < token1.toLowerCase() 
      ? [token0, token1] 
      : [token1, token0];
      
    return pools?.find((pool: any) => 
      pool.token0.address.toLowerCase() === tokenA.toLowerCase() && 
      pool.token1.address.toLowerCase() === tokenB.toLowerCase() &&
      pool.fee === fee
    );
  };
  
  // Get user position in a specific pool
  const getUserPosition = (poolId: string) => {
    return userPositions.find(position => position.poolId === poolId);
  };
  
  // Check if a pool exists on-chain
  const checkPoolExists = async (token0: string, token1: string, fee: number) => {
    if (!window.ethereum) return false;
    
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const factoryContract = new ethers.Contract(
        CONTRACTS[chainId || 1]?.factory || CONTRACTS[1].factory,
        FACTORY_ABI,
        provider
      );
      
      // Ensure tokens are in canonical order
      const [tokenA, tokenB] = token0.toLowerCase() < token1.toLowerCase() 
        ? [token0, token1] 
        : [token1, token0];
      
      const poolAddress = await factoryContract.getPool(tokenA, tokenB, fee);
      
      // If pool address is zero address, it doesn't exist
      return poolAddress !== ethers.constants.AddressZero;
    } catch (error) {
      console.error("Error checking if pool exists:", error);
      return false;
    }
  };
  
  return {
    pools,
    isLoading,
    error,
    userPositions,
    getPoolById,
    getPoolByTokens,
    getUserPosition,
    checkPoolExists
  };
}
