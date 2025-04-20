export interface NetworkParams {
  name: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls: string[];
  blockExplorerUrls: string[];
}

export interface Token {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  chainId: number;
  color: string;
  logoURI?: string;
}

export interface Pool {
  id: string;
  address: string;
  token0: Token;
  token1: Token;
  fee: number;
  tvl: number;
  volume24h: number;
  apr: number;
  price: number;
  liquidity: string;
  tick: number;
  userLiquidity?: {
    amount0: string;
    amount1: string;
    liquidity: string;
  };
}

export interface Transaction {
  id: string;
  type: 'swap' | 'add' | 'remove'; // Transaction type
  pool: Pool;
  amount0: string; // Amount of token0
  amount1: string; // Amount of token1
  account: string; // User's wallet address
  txHash: string; // Transaction hash
  timestamp: number; // Timestamp in milliseconds
  value: number; // Transaction value in USD
}

export interface Module {
  id: string;
  name: string;
  description: string;
  address: string;
  type: 'fee' | 'oracle' | 'rangeOrder' | 'governance';
  enabled: boolean;
}

export interface Position {
  id: string;
  user: string; // User's wallet address
  pool: Pool;
  amount0: string;
  amount1: string;
  tickLower?: number;
  tickUpper?: number;
  liquidity: string;
  createdAt: number; // Timestamp in milliseconds
}

export interface Stats {
  tvl: number;
  tvlChange: number;
  pools: number;
  newPools: number;
  volume: number;
  volumeChange: number;
  fees: number;
  feesChange: number;
}

export interface ChartDataPoint {
  time: string;
  value: number;
}

export interface SwapRoute {
  pool: Pool;
  tokenIn: string;
  tokenOut: string;
}

export interface Network {
  chainId: number;
  name: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls: string[];
  blockExplorerUrls: string[];
}

export interface ContractAddresses {
  factory: string;
  router: string;
  moduleRegistry: string;
}