import { ethers } from 'ethers';

// Sample ABI for a common ERC20 token interface
export const ERC20_ABI = [
  // Read-only functions
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function balanceOf(address) view returns (uint256)",
  "function totalSupply() view returns (uint256)",
  "function allowance(address owner, address spender) view returns (uint256)",
  
  // Write functions
  "function transfer(address to, uint amount) returns (bool)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function transferFrom(address from, address to, uint256 amount) returns (bool)",
  
  // Events
  "event Transfer(address indexed from, address indexed to, uint amount)",
  "event Approval(address indexed owner, address indexed spender, uint256 value)"
];

// Sample AMM Factory ABI
export const FACTORY_ABI = [
  "function getPair(address tokenA, address tokenB) view returns (address pair)",
  "function createPair(address tokenA, address tokenB) returns (address pair)",
  "function allPairsLength() view returns (uint)",
  "function allPairs(uint) view returns (address)",
  "function feeTo() view returns (address)",
  "function feeToSetter() view returns (address)",
  "event PairCreated(address indexed token0, address indexed token1, address pair, uint)"
];

// Sample AMM Router ABI
export const ROUTER_ABI = [
  // Swap functions
  "function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) returns (uint[] memory amounts)",
  "function swapTokensForExactTokens(uint amountOut, uint amountInMax, address[] calldata path, address to, uint deadline) returns (uint[] memory amounts)",
  
  // Liquidity functions
  "function addLiquidity(address tokenA, address tokenB, uint amountADesired, uint amountBDesired, uint amountAMin, uint amountBMin, address to, uint deadline) returns (uint amountA, uint amountB, uint liquidity)",
  "function removeLiquidity(address tokenA, address tokenB, uint liquidity, uint amountAMin, uint amountBMin, address to, uint deadline) returns (uint amountA, uint amountB)",
  
  // Quote functions
  "function quote(uint amountA, uint reserveA, uint reserveB) pure returns (uint amountB)",
  "function getAmountOut(uint amountIn, uint reserveIn, uint reserveOut) pure returns (uint amountOut)",
  "function getAmountIn(uint amountOut, uint reserveIn, uint reserveOut) pure returns (uint amountIn)",
  "function getAmountsOut(uint amountIn, address[] memory path) view returns (uint[] memory amounts)",
  "function getAmountsIn(uint amountOut, address[] memory path) view returns (uint[] memory amounts)"
];

// Sample Provider based on network
export const getRpcProvider = (chainId: number) => {
  const chainMap: { [key: number]: string } = {
    1: "https://mainnet.infura.io/v3/YOUR_INFURA_KEY", // Ethereum Mainnet
    5: "https://goerli.infura.io/v3/YOUR_INFURA_KEY", // Goerli Testnet
    137: "https://polygon-rpc.com", // Polygon
    80001: "https://rpc-mumbai.maticvigil.com" // Mumbai Testnet
  };

  const rpcUrl = chainMap[chainId] || chainMap[1]; // Default to Ethereum Mainnet
  return new ethers.JsonRpcProvider(rpcUrl);
};

// Create contract instance
export const getContract = (address: string, abi: any[], chainId: number) => {
  try {
    const provider = getRpcProvider(chainId);
    return new ethers.Contract(address, abi, provider);
  } catch (error) {
    console.error("Error creating contract instance:", error);
    return null;
  }
};

// Function to estimate gas for a transaction
export const estimateGas = async (
  contractAddress: string,
  abi: any[],
  method: string,
  args: any[],
  chainId: number,
  from: string
) => {
  try {
    const contract = getContract(contractAddress, abi, chainId);
    if (!contract) {
      throw new Error("Failed to create contract instance");
    }

    // Create a transaction object for the contract call
    const data = contract.interface.encodeFunctionData(method, args);
    const provider = getRpcProvider(chainId);

    // Estimate gas
    const gasEstimate = await provider.estimateGas({
      from,
      to: contractAddress,
      data
    });

    // Add a buffer to the gas estimate
    const gasLimit = gasEstimate.toString();
    
    return {
      gasLimit,
      data
    };
  } catch (error) {
    console.error("Error estimating gas:", error);
    throw error;
  }
};

// Function to create unsigned transaction data for frontend
export const createUnsignedTx = async (
  contractAddress: string,
  abi: any[],
  method: string,
  args: any[],
  chainId: number,
  from: string
) => {
  try {
    // Get gas estimate and encoded data
    const { gasLimit, data } = await estimateGas(contractAddress, abi, method, args, chainId, from);
    
    // Get current gas price
    const provider = getRpcProvider(chainId);
    const feeData = await provider.getFeeData();
    
    // Create transaction object
    const tx = {
      from,
      to: contractAddress,
      data,
      chainId,
      gasLimit,
      maxFeePerGas: feeData.maxFeePerGas?.toString() || "0", // For EIP-1559 compatible networks
      maxPriorityFeePerGas: feeData.maxPriorityFeePerGas?.toString() || "0" // For EIP-1559 compatible networks
    };
    
    return tx;
  } catch (error) {
    console.error("Error creating unsigned transaction:", error);
    throw error;
  }
};

// Function to get token details
export const getTokenDetails = async (tokenAddress: string, chainId: number) => {
  try {
    const contract = getContract(tokenAddress, ERC20_ABI, chainId);
    if (!contract) {
      throw new Error("Failed to create token contract instance");
    }

    // Get token details
    const [name, symbol, decimals, totalSupply] = await Promise.all([
      contract.name(),
      contract.symbol(),
      contract.decimals(),
      contract.totalSupply()
    ]);

    return {
      address: tokenAddress,
      name,
      symbol,
      decimals: Number(decimals),
      totalSupply: totalSupply.toString()
    };
  } catch (error) {
    console.error("Error getting token details:", error);
    throw error;
  }
};

// Function to get token balance
export const getTokenBalance = async (tokenAddress: string, walletAddress: string, chainId: number) => {
  try {
    const contract = getContract(tokenAddress, ERC20_ABI, chainId);
    if (!contract) {
      throw new Error("Failed to create token contract instance");
    }

    // Get balance
    const balance = await contract.balanceOf(walletAddress);
    
    // Get token decimals
    const decimals = await contract.decimals();

    return {
      raw: balance.toString(),
      formatted: ethers.formatUnits(balance, decimals)
    };
  } catch (error) {
    console.error("Error getting token balance:", error);
    throw error;
  }
};