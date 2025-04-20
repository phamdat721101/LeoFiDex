// Network parameters
export const NETWORK_PARAMS: { 
  [chainId: number]: {
    name: string;
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
    name: 'Ethereum Mainnet',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18
    },
    rpcUrls: ['https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161'],
    blockExplorerUrls: ['https://etherscan.io']
  },
  5: {
    name: 'Goerli Test Network',
    nativeCurrency: {
      name: 'Goerli Ether',
      symbol: 'ETH',
      decimals: 18
    },
    rpcUrls: ['https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161'],
    blockExplorerUrls: ['https://goerli.etherscan.io']
  },
  137: {
    name: 'Polygon Mainnet',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18
    },
    rpcUrls: ['https://polygon-rpc.com'],
    blockExplorerUrls: ['https://polygonscan.com']
  },
  80001: {
    name: 'Mumbai Testnet',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18
    },
    rpcUrls: ['https://rpc-mumbai.maticvigil.com'],
    blockExplorerUrls: ['https://mumbai.polygonscan.com']
  },
  56: {
    name: 'BNB Smart Chain',
    nativeCurrency: {
      name: 'BNB',
      symbol: 'BNB',
      decimals: 18
    },
    rpcUrls: ['https://bsc-dataseed1.binance.org'],
    blockExplorerUrls: ['https://bscscan.com']
  },
  43114: {
    name: 'Avalanche C-Chain',
    nativeCurrency: {
      name: 'Avalanche',
      symbol: 'AVAX',
      decimals: 18
    },
    rpcUrls: ['https://api.avax.network/ext/bc/C/rpc'],
    blockExplorerUrls: ['https://snowtrace.io']
  },
  42161: {
    name: 'Arbitrum One',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18
    },
    rpcUrls: ['https://arb1.arbitrum.io/rpc'],
    blockExplorerUrls: ['https://arbiscan.io']
  },
  10: {
    name: 'Optimism',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18
    },
    rpcUrls: ['https://mainnet.optimism.io'],
    blockExplorerUrls: ['https://optimistic.etherscan.io']
  }
};

// Contracts by network
export const CONTRACTS: {
  [chainId: number]: {
    factory: string;
    router: string;
    moduleRegistry: string;
  }
} = {
  1: {
    factory: '0x1F98431c8aD98523631AE4a59f267346ea31F984', // Uniswap v3 factory on mainnet
    router: '0xE592427A0AEce92De3Edee1F18E0157C05861564', // Uniswap v3 router on mainnet
    moduleRegistry: '0x0000000000000000000000000000000000000000' // Placeholder
  },
  5: {
    factory: '0x1F98431c8aD98523631AE4a59f267346ea31F984', // Uniswap v3 factory on goerli
    router: '0xE592427A0AEce92De3Edee1F18E0157C05861564', // Uniswap v3 router on goerli
    moduleRegistry: '0x0000000000000000000000000000000000000000' // Placeholder
  },
  137: {
    factory: '0x1F98431c8aD98523631AE4a59f267346ea31F984', // Uniswap v3 factory on polygon
    router: '0xE592427A0AEce92De3Edee1F18E0157C05861564', // Uniswap v3 router on polygon
    moduleRegistry: '0x0000000000000000000000000000000000000000' // Placeholder
  }
};

// Fee tiers
export const FEE_TIERS = [
  { value: 100, label: '0.01%' },
  { value: 500, label: '0.05%' },
  { value: 3000, label: '0.3%' },
  { value: 10000, label: '1%' }
];

// Module types
export const MODULE_TYPES = {
  fee: 'Fee',
  oracle: 'Oracle',
  rangeOrder: 'Range Order',
  governance: 'Governance'
};

// Default slippage tolerance
export const DEFAULT_SLIPPAGE_TOLERANCE = 0.5;

// Default transaction deadline (minutes)
export const DEFAULT_TRANSACTION_DEADLINE = 20;

// Block time by network (seconds)
export const BLOCK_TIME = {
  1: 12, // Ethereum
  5: 12, // Goerli
  137: 2, // Polygon
  80001: 2, // Mumbai
  56: 3, // BSC
  43114: 2, // Avalanche
  42161: 0.25, // Arbitrum
  10: 2 // Optimism
};