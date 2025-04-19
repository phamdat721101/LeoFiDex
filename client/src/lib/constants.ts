// Network parameters for supported chains
export const NETWORK_PARAMS: { 
  [chainId: number]: { 
    chainName: string;
    nativeCurrency: {
      name: string;
      symbol: string;
      decimals: number;
    };
    rpcUrls: string[];
    blockExplorerUrls: string[];
  } 
} = {
  1: {
    chainName: "Ethereum",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18
    },
    rpcUrls: ["https://mainnet.infura.io/v3/"],
    blockExplorerUrls: ["https://etherscan.io"]
  },
  3: {
    chainName: "Ropsten",
    nativeCurrency: {
      name: "Ropsten Ether",
      symbol: "ETH",
      decimals: 18
    },
    rpcUrls: ["https://ropsten.infura.io/v3/"],
    blockExplorerUrls: ["https://ropsten.etherscan.io"]
  },
  4: {
    chainName: "Rinkeby",
    nativeCurrency: {
      name: "Rinkeby Ether",
      symbol: "ETH",
      decimals: 18
    },
    rpcUrls: ["https://rinkeby.infura.io/v3/"],
    blockExplorerUrls: ["https://rinkeby.etherscan.io"]
  },
  5: {
    chainName: "Goerli",
    nativeCurrency: {
      name: "Goerli Ether",
      symbol: "ETH",
      decimals: 18
    },
    rpcUrls: ["https://goerli.infura.io/v3/"],
    blockExplorerUrls: ["https://goerli.etherscan.io"]
  },
  10: {
    chainName: "Optimism",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18
    },
    rpcUrls: ["https://mainnet.optimism.io"],
    blockExplorerUrls: ["https://optimistic.etherscan.io"]
  },
  42: {
    chainName: "Kovan",
    nativeCurrency: {
      name: "Kovan Ether",
      symbol: "ETH",
      decimals: 18
    },
    rpcUrls: ["https://kovan.infura.io/v3/"],
    blockExplorerUrls: ["https://kovan.etherscan.io"]
  },
  56: {
    chainName: "Binance Smart Chain",
    nativeCurrency: {
      name: "Binance Chain Native Token",
      symbol: "BNB",
      decimals: 18
    },
    rpcUrls: ["https://bsc-dataseed.binance.org"],
    blockExplorerUrls: ["https://bscscan.com"]
  },
  137: {
    chainName: "Polygon",
    nativeCurrency: {
      name: "MATIC",
      symbol: "MATIC",
      decimals: 18
    },
    rpcUrls: ["https://polygon-rpc.com"],
    blockExplorerUrls: ["https://polygonscan.com"]
  },
  42161: {
    chainName: "Arbitrum",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18
    },
    rpcUrls: ["https://arb1.arbitrum.io/rpc"],
    blockExplorerUrls: ["https://arbiscan.io"]
  },
  43114: {
    chainName: "Avalanche",
    nativeCurrency: {
      name: "Avalanche",
      symbol: "AVAX",
      decimals: 18
    },
    rpcUrls: ["https://api.avax.network/ext/bc/C/rpc"],
    blockExplorerUrls: ["https://snowtrace.io"]
  }
};

// Contract addresses for supported chains
export const CONTRACTS: {
  [chainId: number]: {
    factory: string;
    router: string;
    moduleRegistry: string;
  }
} = {
  // Mainnet
  1: {
    factory: "0x1F98431c8aD98523631AE4a59f267346ea31F984", // Example address, would use real deployment
    router: "0xE592427A0AEce92De3Edee1F18E0157C05861564", // Example address, would use real deployment
    moduleRegistry: "0x3Ffe34cE5dCf54B38C324e0BaE7C47eb8E010270" // Example address, would use real deployment
  },
  // Polygon
  137: {
    factory: "0x1F98431c8aD98523631AE4a59f267346ea31F984", // Example address, would use real deployment
    router: "0xE592427A0AEce92De3Edee1F18E0157C05861564", // Example address, would use real deployment
    moduleRegistry: "0x3Ffe34cE5dCf54B38C324e0BaE7C47eb8E010270" // Example address, would use real deployment
  },
  // Optimism
  10: {
    factory: "0x1F98431c8aD98523631AE4a59f267346ea31F984", // Example address, would use real deployment
    router: "0xE592427A0AEce92De3Edee1F18E0157C05861564", // Example address, would use real deployment
    moduleRegistry: "0x3Ffe34cE5dCf54B38C324e0BaE7C47eb8E010270" // Example address, would use real deployment
  },
  // Arbitrum
  42161: {
    factory: "0x1F98431c8aD98523631AE4a59f267346ea31F984", // Example address, would use real deployment
    router: "0xE592427A0AEce92De3Edee1F18E0157C05861564", // Example address, would use real deployment
    moduleRegistry: "0x3Ffe34cE5dCf54B38C324e0BaE7C47eb8E010270" // Example address, would use real deployment
  }
};

// Fee tiers available for pools
export const FEE_TIERS = [
  {
    fee: 100, // 0.01%
    label: "0.01%",
    description: "Best for stable pairs"
  },
  {
    fee: 500, // 0.05%
    label: "0.05%",
    description: "Best for stable pairs"
  },
  {
    fee: 3000, // 0.3%
    label: "0.3%",
    description: "Best for most pairs"
  },
  {
    fee: 10000, // 1%
    label: "1%",
    description: "Best for exotic pairs"
  }
];

// Module types
export const MODULE_TYPES = {
  FEE: 0,
  ORACLE: 1,
  RANGE_ORDER: 2,
  GOVERNANCE: 3
};

// Default slippage tolerance in percentage (0.5%)
export const DEFAULT_SLIPPAGE_TOLERANCE = 0.5;

// Default transaction deadline in minutes
export const DEFAULT_TRANSACTION_DEADLINE = 20;

// Block time in seconds (approximate)
export const BLOCK_TIME = {
  1: 12, // Ethereum ~12 seconds
  137: 2, // Polygon ~2 seconds
  10: 0.5, // Optimism ~0.5 seconds
  42161: 0.25 // Arbitrum ~0.25 seconds
};
