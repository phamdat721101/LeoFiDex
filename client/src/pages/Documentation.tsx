import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Copy, CheckCircle2, Book, Code, Database, Wrench, ExternalLink } from "lucide-react";
import { useState } from "react";

export default function Documentation() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("overview");
  const [codeCopied, setCodeCopied] = useState<{ [key: string]: boolean }>({});

  const handleCopyCode = (codeId: string, code: string) => {
    navigator.clipboard.writeText(code).then(() => {
      setCodeCopied({ ...codeCopied, [codeId]: true });
      setTimeout(() => {
        setCodeCopied({ ...codeCopied, [codeId]: false });
      }, 2000);
    });
  };

  const CodeBlock = ({ id, language, code }: { id: string; language: string; code: string }) => (
    <div className="relative mt-2">
      <pre className="p-4 rounded-md bg-gray-900 text-gray-100 text-sm font-mono overflow-x-auto">
        <code>{code}</code>
      </pre>
      <button
        className="absolute top-2 right-2 p-1 rounded-md bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white"
        onClick={() => handleCopyCode(id, code)}
      >
        {codeCopied[id] ? (
          <CheckCircle2 className="h-4 w-4 text-green-500" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
      </button>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="flex -mb-px overflow-x-auto hide-scrollbar">
          <Button 
            variant="ghost" 
            className="whitespace-nowrap px-4 py-2 font-medium text-gray-500 hover:text-gray-700 border-b-2 border-transparent hover:border-gray-300"
            onClick={() => setLocation("/")}
          >
            Dashboard
          </Button>
          <Button 
            variant="ghost" 
            className="whitespace-nowrap px-4 py-2 font-medium text-gray-500 hover:text-gray-700 border-b-2 border-transparent hover:border-gray-300"
            onClick={() => setLocation("/pools")}
          >
            Create Pool
          </Button>
          <Button 
            variant="ghost" 
            className="whitespace-nowrap px-4 py-2 font-medium text-gray-500 hover:text-gray-700 border-b-2 border-transparent hover:border-gray-300"
            onClick={() => setLocation("/swap")}
          >
            Swap
          </Button>
          <Button 
            variant="ghost" 
            className="whitespace-nowrap px-4 py-2 font-medium text-gray-500 hover:text-gray-700 border-b-2 border-transparent hover:border-gray-300"
            onClick={() => setLocation("/liquidity")}
          >
            Provide Liquidity
          </Button>
          <Button 
            variant="ghost" 
            className="whitespace-nowrap px-4 py-2 font-medium text-gray-500 hover:text-gray-700 border-b-2 border-transparent hover:border-gray-300"
            onClick={() => setLocation("/modules")}
          >
            Module Registry
          </Button>
          <Button 
            variant="ghost" 
            className="whitespace-nowrap px-4 py-2 font-medium text-orange-500 border-b-2 border-orange-500"
          >
            Docs
          </Button>
        </nav>
      </div>
      
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <div className="w-full md:w-64 shrink-0">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Documentation</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-1">
                <Button 
                  variant={activeTab === "overview" ? "secondary" : "ghost"} 
                  className="w-full justify-start" 
                  onClick={() => setActiveTab("overview")}
                >
                  <Book className="h-4 w-4 mr-2" />
                  Overview
                </Button>
                <Button 
                  variant={activeTab === "sdk" ? "secondary" : "ghost"} 
                  className="w-full justify-start" 
                  onClick={() => setActiveTab("sdk")}
                >
                  <Code className="h-4 w-4 mr-2" />
                  Web3 SDK
                </Button>
                <Button 
                  variant={activeTab === "contracts" ? "secondary" : "ghost"} 
                  className="w-full justify-start" 
                  onClick={() => setActiveTab("contracts")}
                >
                  <Database className="h-4 w-4 mr-2" />
                  Smart Contracts
                </Button>
                <Button 
                  variant={activeTab === "modules" ? "secondary" : "ghost"} 
                  className="w-full justify-start" 
                  onClick={() => setActiveTab("modules")}
                >
                  <Wrench className="h-4 w-4 mr-2" />
                  Module System
                </Button>
              </div>
              
              <Separator className="my-4" />
              
              <div className="space-y-3">
                <h3 className="text-sm font-medium">Resources</h3>
                <a 
                  href="https://github.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center text-sm text-gray-500 hover:text-orange-500"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  GitHub Repository
                </a>
                <a 
                  href="https://discord.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center text-sm text-gray-500 hover:text-orange-500"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Discord Community
                </a>
                <a 
                  href="https://twitter.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center text-sm text-gray-500 hover:text-orange-500"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Twitter
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Content */}
        <div className="flex-1">
          <Card>
            <CardContent className="p-6">
              {activeTab === "overview" && (
                <div className="prose max-w-none">
                  <h1>LeoFi Modular DEX Framework</h1>
                  <p className="lead">A modular framework for building customizable AMM-based exchanges on any EVM-compatible chain.</p>
                  
                  <h2>Introduction</h2>
                  <p>
                    LeoFi is a modular DEX framework that empowers developers to launch customizable AMM-based exchanges 
                    on any EVM-compatible blockchain. Drawing on Uniswap V3's concentrated liquidity model for capital 
                    efficiency and fine-tuned control, LeoFi provides a comprehensive suite of tools and components to 
                    build, deploy, and manage decentralized exchanges.
                  </p>
                  
                  <h2>Key Features</h2>
                  <ul>
                    <li>
                      <strong>Factory Contract Pattern:</strong> Deploy new pools with customizable parameters through a 
                      central factory contract.
                    </li>
                    <li>
                      <strong>Router for Multi-hop Swaps:</strong> Orchestrate trading across multiple pools for optimal 
                      execution and reduced slippage.
                    </li>
                    <li>
                      <strong>Concentrated Liquidity:</strong> Implement Uniswap V3-style concentrated liquidity for 
                      capital efficiency.
                    </li>
                    <li>
                      <strong>Module Registry:</strong> Plug-and-play features such as TWAP oracles and single-sided 
                      range orders.
                    </li>
                    <li>
                      <strong>Cross-chain Compatibility:</strong> Deploy on any EVM-compatible blockchain.
                    </li>
                  </ul>
                  
                  <h2>Architecture</h2>
                  <p>
                    LeoFi's architecture comprises four core layers:
                  </p>
                  
                  <ol>
                    <li>
                      <strong>Factory Contract:</strong> Deploys new Pool instances on demand and maintains a registry 
                      of deployed pools.
                    </li>
                    <li>
                      <strong>Router Contract:</strong> Executes swaps, optimizes multi-hop routes, and interacts with 
                      Factory and Pools.
                    </li>
                    <li>
                      <strong>Pool Contracts:</strong> Implement the AMM curves (e.g., x·y=k or concentrated liquidity) 
                      for token pairs.
                    </li>
                    <li>
                      <strong>ModuleRegistry:</strong> Manages auxiliary modules (fee strategies, oracles, limit-order 
                      approximations) that can be dynamically attached to Pools.
                    </li>
                  </ol>
                  
                  <h2>Getting Started</h2>
                  <p>
                    To get started with LeoFi, you can:
                  </p>
                  
                  <ul>
                    <li>Browse the Web3 SDK documentation to integrate LeoFi into your application</li>
                    <li>Explore the Smart Contracts documentation to understand the on-chain components</li>
                    <li>Learn about the Module System to extend and customize your DEX</li>
                  </ul>
                </div>
              )}
              
              {activeTab === "sdk" && (
                <div className="prose max-w-none">
                  <h1>Web3 SDK</h1>
                  <p className="lead">
                    The LeoFi Web3 SDK provides a simple interface for interacting with the LeoFi protocol 
                    from JavaScript/TypeScript applications.
                  </p>
                  
                  <h2>Installation</h2>
                  <p>Install the SDK using npm or yarn:</p>
                  
                  <CodeBlock 
                    id="install-npm" 
                    language="bash" 
                    code="npm install @leofi/sdk ethers" 
                  />
                  
                  <p>Or with yarn:</p>
                  
                  <CodeBlock 
                    id="install-yarn" 
                    language="bash" 
                    code="yarn add @leofi/sdk ethers" 
                  />
                  
                  <h2>Initializing the SDK</h2>
                  <p>
                    To initialize the SDK, you need to provide a provider from ethers.js:
                  </p>
                  
                  <CodeBlock 
                    id="sdk-init" 
                    language="typescript" 
                    code={`import { LeoFiSDK } from '@leofi/sdk';
import { ethers } from 'ethers';

// For browser environments using MetaMask
const provider = new ethers.providers.Web3Provider(window.ethereum);

// Initialize the SDK
const leofi = new LeoFiSDK({
  provider,
  chainId: 1, // Ethereum Mainnet
});`} 
                  />
                  
                  <h2>Creating a Pool</h2>
                  <p>
                    To create a new liquidity pool:
                  </p>
                  
                  <CodeBlock 
                    id="create-pool" 
                    language="typescript" 
                    code={`// Get the signer
const signer = provider.getSigner();

// Create a new pool
const createPoolTx = await leofi.factory.createPool({
  token0: '0x...',  // Token A address
  token1: '0x...',  // Token B address
  fee: 3000,        // Fee in basis points (0.3%)
  signer,
});

// Wait for transaction to be confirmed
const receipt = await createPoolTx.wait();
console.log('Pool created:', receipt.transactionHash);`} 
                  />
                  
                  <h2>Executing a Swap</h2>
                  <p>
                    To execute a token swap:
                  </p>
                  
                  <CodeBlock 
                    id="execute-swap" 
                    language="typescript" 
                    code={`// Get the signer
const signer = provider.getSigner();

// Execute a swap
const swapTx = await leofi.router.swap({
  tokenIn: '0x...',        // Input token address
  tokenOut: '0x...',       // Output token address
  amountIn: '1000000000',  // Amount of input tokens (in smallest unit)
  slippage: 0.5,           // Maximum slippage in percentage
  recipient: await signer.getAddress(),
  signer,
});

// Wait for transaction to be confirmed
const receipt = await swapTx.wait();
console.log('Swap executed:', receipt.transactionHash);`} 
                  />
                  
                  <h2>Adding Liquidity</h2>
                  <p>
                    To add liquidity to a pool:
                  </p>
                  
                  <CodeBlock 
                    id="add-liquidity" 
                    language="typescript" 
                    code={`// Get the signer
const signer = provider.getSigner();

// Add liquidity
const addLiquidityTx = await leofi.pool.addLiquidity({
  poolAddress: '0x...',    // Pool address
  amount0: '1000000000',   // Amount of token0 (in smallest unit)
  amount1: '1000000000',   // Amount of token1 (in smallest unit)
  recipient: await signer.getAddress(),
  signer,
});

// Wait for transaction to be confirmed
const receipt = await addLiquidityTx.wait();
console.log('Liquidity added:', receipt.transactionHash);`} 
                  />
                  
                  <h2>Using Modules</h2>
                  <p>
                    To interact with a module:
                  </p>
                  
                  <CodeBlock 
                    id="use-module" 
                    language="typescript" 
                    code={`// Get the signer
const signer = provider.getSigner();

// Use a TWAP oracle module
const price = await leofi.modules.twapOracle.getPrice({
  moduleAddress: '0x...',   // Module address
  poolAddress: '0x...',     // Pool address
  token: '0x...',           // Token to get price for
  period: 3600,             // Time period in seconds
});

console.log('Token price:', price.toString());`} 
                  />
                  
                  <h2>API Reference</h2>
                  <p>
                    For a complete API reference, please visit our 
                    <a href="#" className="text-orange-500 hover:underline ml-1">API documentation</a>.
                  </p>
                </div>
              )}
              
              {activeTab === "contracts" && (
                <div className="prose max-w-none">
                  <h1>Smart Contracts</h1>
                  <p className="lead">
                    LeoFi smart contracts form the core of the protocol, enabling the creation and management of 
                    customizable AMM-based exchanges.
                  </p>
                  
                  <h2>Contract Architecture</h2>
                  <p>
                    The LeoFi protocol consists of the following core contracts:
                  </p>
                  
                  <h3>LeoFiFactory</h3>
                  <p>
                    The Factory contract is responsible for deploying new Pool instances and maintaining a 
                    registry of all deployed pools.
                  </p>
                  
                  <CodeBlock 
                    id="factory-interface" 
                    language="solidity" 
                    code={`interface ILeoFiFactory {
    event PoolCreated(
        address token0,
        address token1,
        uint24 fee,
        address pool
    );
    
    function createPool(
        address tokenA,
        address tokenB,
        uint24 fee
    ) external returns (address pool);
    
    function getPool(
        address tokenA,
        address tokenB,
        uint24 fee
    ) external view returns (address pool);
    
    function setOwner(address _owner) external;
    
    function owner() external view returns (address);
}`} 
                  />
                  
                  <h3>LeoFiRouter</h3>
                  <p>
                    The Router contract provides methods for swapping tokens and optimizing routes through 
                    multiple pools.
                  </p>
                  
                  <CodeBlock 
                    id="router-interface" 
                    language="solidity" 
                    code={`interface ILeoFiRouter {
    struct ExactInputSingleParams {
        address tokenIn;
        address tokenOut;
        uint24 fee;
        address recipient;
        uint256 amountIn;
        uint256 amountOutMinimum;
        uint160 sqrtPriceLimitX96;
    }
    
    struct ExactInputParams {
        bytes path;
        address recipient;
        uint256 amountIn;
        uint256 amountOutMinimum;
    }
    
    function exactInputSingle(
        ExactInputSingleParams calldata params
    ) external payable returns (uint256 amountOut);
    
    function exactInput(
        ExactInputParams calldata params
    ) external payable returns (uint256 amountOut);
    
    function quoteExactInputSingle(
        address tokenIn,
        address tokenOut,
        uint24 fee,
        uint256 amountIn,
        uint160 sqrtPriceLimitX96
    ) external view returns (uint256 amountOut);
}`} 
                  />
                  
                  <h3>LeoFiPool</h3>
                  <p>
                    The Pool contract implements the AMM logic and manages liquidity.
                  </p>
                  
                  <CodeBlock 
                    id="pool-interface" 
                    language="solidity" 
                    code={`interface ILeoFiPool {
    function initialize(uint160 sqrtPriceX96) external;
    
    function mint(
        address recipient,
        int24 tickLower,
        int24 tickUpper,
        uint128 amount,
        bytes calldata data
    ) external returns (uint256 amount0, uint256 amount1);
    
    function burn(
        int24 tickLower,
        int24 tickUpper,
        uint128 amount
    ) external returns (uint256 amount0, uint256 amount1);
    
    function swap(
        address recipient,
        bool zeroForOne,
        int256 amountSpecified,
        uint160 sqrtPriceLimitX96,
        bytes calldata data
    ) external returns (int256 amount0, int256 amount1);
    
    function slot0() external view returns (
        uint160 sqrtPriceX96,
        int24 tick,
        uint16 observationIndex,
        uint16 observationCardinality,
        uint16 observationCardinalityNext,
        uint8 feeProtocol,
        bool unlocked
    );
}`} 
                  />
                  
                  <h3>ModuleRegistry</h3>
                  <p>
                    The ModuleRegistry contract manages the registration and activation of protocol extensions.
                  </p>
                  
                  <CodeBlock 
                    id="module-registry-interface" 
                    language="solidity" 
                    code={`interface IModuleRegistry {
    enum ModuleType {
        FEE,
        ORACLE,
        RANGE_ORDER,
        GOVERNANCE
    }
    
    struct Module {
        address implementation;
        ModuleType moduleType;
        bool enabled;
    }
    
    event ModuleRegistered(
        bytes32 moduleId,
        address implementation,
        ModuleType moduleType
    );
    
    event ModuleEnabled(bytes32 moduleId, bool enabled);
    
    function registerModule(
        address implementation,
        ModuleType moduleType
    ) external returns (bytes32 moduleId);
    
    function enableModule(bytes32 moduleId, bool enabled) external;
    
    function getModule(bytes32 moduleId) external view returns (Module memory);
    
    function isModuleEnabled(bytes32 moduleId) external view returns (bool);
}`} 
                  />
                  
                  <h2>Deployed Contracts</h2>
                  <p>
                    Here are the addresses of the deployed contracts on various networks:
                  </p>
                  
                  <h3>Ethereum Mainnet</h3>
                  <ul>
                    <li><strong>Factory:</strong> <code>0x1234...5678</code></li>
                    <li><strong>Router:</strong> <code>0xabcd...efgh</code></li>
                    <li><strong>ModuleRegistry:</strong> <code>0x9876...5432</code></li>
                  </ul>
                  
                  <h3>Polygon</h3>
                  <ul>
                    <li><strong>Factory:</strong> <code>0x2345...6789</code></li>
                    <li><strong>Router:</strong> <code>0xbcde...fghi</code></li>
                    <li><strong>ModuleRegistry:</strong> <code>0x8765...4321</code></li>
                  </ul>
                  
                  <h2>Security</h2>
                  <p>
                    LeoFi smart contracts have undergone rigorous security audits by leading firms in the blockchain 
                    security industry. However, smart contract interactions always carry inherent risks. Users should 
                    exercise caution and perform their own due diligence.
                  </p>
                  
                  <p>
                    For developers interested in building on LeoFi, we recommend reviewing our 
                    <a href="#" className="text-orange-500 hover:underline ml-1">security best practices</a> 
                    before integrating with the protocol.
                  </p>
                </div>
              )}
              
              {activeTab === "modules" && (
                <div className="prose max-w-none">
                  <h1>Module System</h1>
                  <p className="lead">
                    LeoFi's modular architecture allows for the extension of core functionality through 
                    pluggable modules.
                  </p>
                  
                  <h2>Overview</h2>
                  <p>
                    The Module System is a core feature of LeoFi that enables developers to extend and customize 
                    the protocol's functionality without modifying the core contracts. Modules are standalone 
                    smart contracts that can be registered with the protocol and attached to pools or other components.
                  </p>
                  
                  <h2>Module Types</h2>
                  <p>
                    LeoFi supports several types of modules:
                  </p>
                  
                  <h3>Fee Strategies</h3>
                  <p>
                    Fee Strategy modules allow for customizable fee tiers and fee distribution mechanisms. They 
                    can implement fixed fees, dynamic fees based on market conditions, or tiered fee structures.
                  </p>
                  
                  <CodeBlock 
                    id="fee-module" 
                    language="solidity" 
                    code={`interface IFeeModule {
    function calculateFee(
        address pool,
        uint256 amount,
        bool isToken0
    ) external view returns (uint256 fee);
    
    function getFeeParameters(address pool) external view returns (
        uint24 feeBasisPoints,
        address feeRecipient,
        bool dynamicFee
    );
    
    function setFeeParameters(
        address pool,
        uint24 feeBasisPoints,
        address feeRecipient,
        bool dynamicFee
    ) external;
}`} 
                  />
                  
                  <h3>TWAP Oracles</h3>
                  <p>
                    TWAP (Time-Weighted Average Price) Oracle modules provide reliable price feeds by sampling 
                    prices over time, reducing the impact of short-term volatility and manipulation.
                  </p>
                  
                  <CodeBlock 
                    id="oracle-module" 
                    language="solidity" 
                    code={`interface ITwapOracleModule {
    function observationCardinalityNext(address pool) external view returns (uint16);
    
    function increaseObservationCardinalityNext(
        address pool,
        uint16 observationCardinalityNext
    ) external;
    
    function observe(
        address pool,
        uint32[] calldata secondsAgos
    ) external view returns (
        int56[] memory tickCumulatives,
        uint160[] memory secondsPerLiquidityCumulativeX128s
    );
    
    function getQuoteAtTick(
        address pool,
        int24 tick,
        uint128 baseAmount,
        address baseToken,
        address quoteToken
    ) external pure returns (uint256 quoteAmount);
}`} 
                  />
                  
                  <h3>Range Orders</h3>
                  <p>
                    Range Order modules implement limit-order-like functionality by allowing users to provide 
                    single-sided liquidity within specific price ranges.
                  </p>
                  
                  <CodeBlock 
                    id="range-order-module" 
                    language="solidity" 
                    code={`interface IRangeOrderModule {
    struct RangeOrder {
        address owner;
        address token;
        uint256 amount;
        int24 tickLower;
        int24 tickUpper;
        uint256 minReturn;
        bool fulfilled;
    }
    
    function createRangeOrder(
        address pool,
        address token,
        uint256 amount,
        int24 tickLower,
        int24 tickUpper,
        uint256 minReturn
    ) external returns (uint256 orderId);
    
    function cancelRangeOrder(address pool, uint256 orderId) external;
    
    function getRangeOrder(
        address pool,
        uint256 orderId
    ) external view returns (RangeOrder memory);
    
    function isRangeOrderFulfilled(
        address pool,
        uint256 orderId
    ) external view returns (bool);
}`} 
                  />
                  
                  <h3>Governance Modules</h3>
                  <p>
                    Governance modules allow protocol parameters to be adjusted through on-chain voting, enabling 
                    decentralized governance of the protocol.
                  </p>
                  
                  <CodeBlock 
                    id="governance-module" 
                    language="solidity" 
                    code={`interface IGovernanceModule {
    struct Proposal {
        uint256 id;
        address proposer;
        string description;
        uint256 startBlock;
        uint256 endBlock;
        bytes callData;
        address target;
        uint256 forVotes;
        uint256 againstVotes;
        bool executed;
    }
    
    function propose(
        address target,
        bytes calldata data,
        string calldata description
    ) external returns (uint256 proposalId);
    
    function castVote(uint256 proposalId, bool support) external;
    
    function execute(uint256 proposalId) external;
    
    function getProposal(
        uint256 proposalId
    ) external view returns (Proposal memory);
}`} 
                  />
                  
                  <h2>Creating Custom Modules</h2>
                  <p>
                    Developers can create custom modules by implementing the appropriate interfaces and registering 
                    them with the ModuleRegistry. Here's a general workflow for creating and registering a custom module:
                  </p>
                  
                  <ol>
                    <li>Implement the module interface in a new smart contract</li>
                    <li>Deploy the module contract to the desired network</li>
                    <li>Register the module with the ModuleRegistry</li>
                    <li>Enable the module for use in the protocol</li>
                  </ol>
                  
                  <p>
                    For a detailed guide on developing custom modules, see our 
                    <a href="#" className="text-orange-500 hover:underline ml-1">Module Development Guide</a>.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
