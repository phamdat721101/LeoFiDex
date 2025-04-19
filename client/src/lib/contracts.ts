// ERC20 Token ABI - Minimal interface for interacting with ERC20 tokens
export const ERC20_ABI = [
  // Read-only functions
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address owner) view returns (uint256)",
  "function allowance(address owner, address spender) view returns (uint256)",
  
  // Write functions
  "function approve(address spender, uint256 value) returns (bool)",
  "function transfer(address to, uint256 value) returns (bool)",
  "function transferFrom(address from, address to, uint256 value) returns (bool)",
  
  // Events
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event Approval(address indexed owner, address indexed spender, uint256 value)"
];

// Factory contract ABI - For deploying and managing pools
export const FACTORY_ABI = [
  // Read-only functions
  "function getPool(address tokenA, address tokenB, uint24 fee) view returns (address pool)",
  "function owner() view returns (address)",
  
  // Write functions
  "function createPool(address tokenA, address tokenB, uint24 fee) returns (address pool)",
  "function setOwner(address _owner) external",
  
  // Events
  "event PoolCreated(address indexed token0, address indexed token1, uint24 indexed fee, address pool)"
];

// Router contract ABI - For executing swaps and routing trades
export const ROUTER_ABI = [
  // Read-only functions
  "function quoteExactInputSingle(address tokenIn, address tokenOut, uint24 fee, uint256 amountIn, uint160 sqrtPriceLimitX96) view returns (uint256 amountOut)",
  
  // Write functions
  "function exactInputSingle(tuple(address tokenIn, address tokenOut, uint24 fee, address recipient, uint256 amountIn, uint256 amountOutMinimum, uint160 sqrtPriceLimitX96)) payable returns (uint256 amountOut)",
  "function exactInput(tuple(bytes path, address recipient, uint256 amountIn, uint256 amountOutMinimum)) payable returns (uint256 amountOut)",
  
  // Events
  "event Swap(address indexed sender, address indexed recipient, int256 amount0, int256 amount1, uint160 sqrtPriceX96, uint128 liquidity, int24 tick)"
];

// Pool contract ABI - For interacting with liquidity pools
export const POOL_ABI = [
  // Read-only functions
  "function token0() view returns (address)",
  "function token1() view returns (address)",
  "function fee() view returns (uint24)",
  "function tickSpacing() view returns (int24)",
  "function balanceOf(address owner) view returns (uint256)",
  "function slot0() view returns (uint160 sqrtPriceX96, int24 tick, uint16 observationIndex, uint16 observationCardinality, uint16 observationCardinalityNext, uint8 feeProtocol, bool unlocked)",
  
  // Write functions
  "function initialize(uint160 sqrtPriceX96) external",
  "function mint(address recipient, int24 tickLower, int24 tickUpper, uint128 amount, bytes calldata data) external returns (uint256 amount0, uint256 amount1)",
  "function burn(int24 tickLower, int24 tickUpper, uint128 amount) external returns (uint256 amount0, uint256 amount1)",
  "function swap(address recipient, bool zeroForOne, int256 amountSpecified, uint160 sqrtPriceLimitX96, bytes calldata data) external returns (int256 amount0, int256 amount1)",
  
  // Events
  "event Mint(address sender, address indexed owner, int24 indexed tickLower, int24 indexed tickUpper, uint128 amount, uint256 amount0, uint256 amount1)",
  "event Burn(address indexed owner, int24 indexed tickLower, int24 indexed tickUpper, uint128 amount, uint256 amount0, uint256 amount1)",
  "event Swap(address indexed sender, address indexed recipient, int256 amount0, int256 amount1, uint160 sqrtPriceX96, uint128 liquidity, int24 tick)"
];

// ModuleRegistry contract ABI - For managing protocol extensions
export const MODULE_REGISTRY_ABI = [
  // Read-only functions
  "function getModule(bytes32 moduleId) view returns (tuple(address implementation, uint8 moduleType, bool enabled))",
  "function isModuleEnabled(bytes32 moduleId) view returns (bool)",
  
  // Write functions
  "function registerModule(address implementation, uint8 moduleType) returns (bytes32 moduleId)",
  "function enableModule(bytes32 moduleId, bool enabled) external",
  
  // Events
  "event ModuleRegistered(bytes32 indexed moduleId, address implementation, uint8 moduleType)",
  "event ModuleEnabled(bytes32 indexed moduleId, bool enabled)"
];
