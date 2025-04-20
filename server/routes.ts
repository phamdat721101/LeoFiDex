import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { Pool, Token, Transaction, Module } from "@shared/types";
import usersRoutes from './routes/users';
import dotenv from 'dotenv';

// Mock data for demonstration purposes
// In a real application, this would be fetched from a database or blockchain
let mockTokens: Token[] = [];
let mockPools: Pool[] = [];
let mockTransactions: Transaction[] = [];
let mockModules: Module[] = [];

function initMockData() {
  // Initialize tokens
  mockTokens = [
    {
      address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
      symbol: "ETH",
      name: "Ethereum",
      decimals: 18,
      chainId: 1,
      color: "#627EEA",
      logoURI: "https://ethereum.org/static/6b935ac0e6194247347855dc3d328e83/13c43/eth-diamond-black.png"
    },
    {
      address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      symbol: "USDC",
      name: "USD Coin",
      decimals: 6,
      chainId: 1,
      color: "#2775CA",
      logoURI: "https://cryptologos.cc/logos/usd-coin-usdc-logo.png"
    },
    {
      address: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
      symbol: "DAI",
      name: "Dai Stablecoin",
      decimals: 18,
      chainId: 1,
      color: "#F5AC37",
      logoURI: "https://cryptologos.cc/logos/multi-collateral-dai-dai-logo.png"
    },
    {
      address: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
      symbol: "WBTC",
      name: "Wrapped Bitcoin",
      decimals: 8,
      chainId: 1,
      color: "#F7931A",
      logoURI: "https://cryptologos.cc/logos/wrapped-bitcoin-wbtc-logo.png"
    }
  ];

  // Initialize pools
  mockPools = [
    {
      id: "1",
      address: "0xb4e16d0168e52d35cacd2c6185b44281ec28c9dc",
      token0: mockTokens[0],
      token1: mockTokens[1],
      fee: 0.3,
      tvl: 3200000,
      volume24h: 1200000,
      apr: 24.5,
      price: 1640,
      liquidity: "1000000000000000000000",
      tick: 202020
    },
    {
      id: "2",
      address: "0x004375dff511095cc5a197a54140a24efef3a416",
      token0: mockTokens[3],
      token1: mockTokens[1],
      fee: 0.3,
      tvl: 2700000,
      volume24h: 950000,
      apr: 21.8,
      price: 29000,
      liquidity: "800000000000000000000",
      tick: 193652
    },
    {
      id: "3",
      address: "0xae461ca67b15dc8dc81ce7615e0320da1a9ab8d5",
      token0: mockTokens[2],
      token1: mockTokens[1],
      fee: 0.05,
      tvl: 1900000,
      volume24h: 560000,
      apr: 4.2,
      price: 1.001,
      liquidity: "1200000000000000000000",
      tick: 276
    },
    {
      id: "4",
      address: "0xa478c2975ab1ea89e8196811f51a7b7ade33eb11",
      token0: mockTokens[0],
      token1: mockTokens[2],
      fee: 0.3,
      tvl: 1400000,
      volume24h: 480000,
      apr: 18.9,
      price: 1638.5,
      liquidity: "600000000000000000000",
      tick: 201975
    }
  ];

  // Initialize transactions
  mockTransactions = [
    {
      id: "1",
      type: "swap",
      pool: mockPools[0],
      amount0: "0.5",
      amount1: "820",
      account: "0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r3f4d",
      txHash: "0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z7a8b9c0d1e2f",
      timestamp: new Date().getTime() - 120000, // 2 minutes ago
      value: 820
    },
    {
      id: "2",
      type: "add",
      pool: mockPools[1],
      amount0: "0.03",
      amount1: "1000",
      account: "0x7b8a9b0c1d2e3f4g5h6i7j8k9l0m1n2o3p4q5r9c2a",
      txHash: "0xa9b8c7d6e5f4g3h2i1j0k9l8m7n6o5p4q3r2s1t0u9v8w7x6y5z4a3b2c1d0e9f",
      timestamp: new Date().getTime() - 900000, // 15 minutes ago
      value: 2000
    },
    {
      id: "3",
      type: "remove",
      pool: mockPools[3],
      amount0: "1.2",
      amount1: "2400",
      account: "0x5f6e7d8c9b0a1f2e3d4c5b6a7f8e9d0c1b2a3f7e8d",
      txHash: "0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z7a8b9c0d1e2f",
      timestamp: new Date().getTime() - 2700000, // 45 minutes ago
      value: 4800
    }
  ];

  // Initialize modules
  mockModules = [
    {
      id: "1",
      name: "Dynamic Fee Strategy",
      description: "Adjusts fee tiers based on volatility and liquidity depth",
      address: "0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r3f4d",
      type: "fee",
      enabled: true
    },
    {
      id: "2",
      name: "TWAP Oracle Provider",
      description: "Time-weighted average price oracle for reliable price feeds",
      address: "0x8a7b6c5d4e3f2g1h0i9j8k7l6m5n4o3p2q1r0s9t8",
      type: "oracle",
      enabled: true
    },
    {
      id: "3",
      name: "Single-Sided Range Orders",
      description: "Limit order functionality using concentrated liquidity ranges",
      address: "0x7f8e9d0c1b2a3f4e5d6c7b8a9f0e1d2c3b4a5d6e7",
      type: "rangeOrder",
      enabled: true
    },
    {
      id: "4",
      name: "Governance Module",
      description: "On-chain voting for protocol parameter adjustments",
      address: "0x3a4b5c6d7e8f9g0h1i2j3k4l5m6n7o8p9q0r1s2t3",
      type: "governance",
      enabled: false
    },
    {
      id: "5",
      name: "Fee Sharing Module",
      description: "Distributes protocol fees to stakers and liquidity providers",
      address: "0x0a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0",
      type: "fee",
      enabled: false
    }
  ];
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Load environment variables
  dotenv.config();

  // Initialize mock data
  initMockData();
  
  // Register user routes
  app.use('/api/users', usersRoutes);
  
  // API endpoints
  app.get("/api/stats", (req, res) => {
    // Calculate stats based on pools and transactions
    const tvl = mockPools.reduce((sum, pool) => sum + pool.tvl, 0);
    const volume = mockTransactions
      .filter(tx => new Date(tx.timestamp).getTime() > Date.now() - 24 * 60 * 60 * 1000) // Last 24h
      .reduce((sum, tx) => sum + tx.value, 0);
    const fees = volume * 0.003; // Assume average 0.3% fee
    
    res.json({
      tvl,
      tvlChange: 5.7,
      pools: mockPools.length,
      newPools: 2,
      volume,
      volumeChange: -2.3,
      fees,
      feesChange: 8.1
    });
  });
  
  app.get("/api/tokens", (req, res) => {
    res.json(mockTokens);
  });
  
  app.get("/api/pools", (req, res) => {
    res.json(mockPools);
  });
  
  app.get("/api/pools/top", (req, res) => {
    // Return pools sorted by TVL
    const topPools = [...mockPools].sort((a, b) => b.tvl - a.tvl);
    res.json(topPools);
  });
  
  app.get("/api/transactions/recent", (req, res) => {
    // Return transactions sorted by timestamp (newest first)
    const recentTransactions = [...mockTransactions].sort((a, b) => b.timestamp - a.timestamp);
    res.json(recentTransactions);
  });
  
  app.get("/api/modules", (req, res) => {
    res.json(mockModules);
  });
  
  app.get("/api/charts/volume", (req, res) => {
    const { timeRange } = req.query;
    let points = 24; // Default to 24 hours (hourly data points)
    
    if (timeRange === "1W") {
      points = 7; // 7 days (daily data points)
    } else if (timeRange === "1M") {
      points = 30; // 30 days (daily data points)
    } else if (timeRange === "ALL") {
      points = 90; // 90 days (3-day data points)
    }
    
    // Generate time series data
    const data = [];
    const now = new Date();
    const baseValue = 150000; // Base volume value
    
    for (let i = 0; i < points; i++) {
      const time = new Date(now);
      
      if (timeRange === "1D") {
        time.setHours(now.getHours() - i);
        time.setMinutes(0, 0, 0);
      } else if (timeRange === "1W" || timeRange === "1M") {
        time.setDate(now.getDate() - i);
        time.setHours(0, 0, 0, 0);
      } else {
        time.setDate(now.getDate() - (i * 3));
        time.setHours(0, 0, 0, 0);
      }
      
      // Add some randomness to the volume
      const randomFactor = 0.7 + Math.random() * 0.6; // Between 0.7 and 1.3
      const value = baseValue * randomFactor;
      
      data.unshift({
        time: time.toISOString().split("T")[0] + (timeRange === "1D" ? " " + time.getHours() + ":00" : ""),
        value: Math.round(value)
      });
    }
    
    res.json(data);
  });
  
  // Create a pool
  app.post("/api/pools", (req, res) => {
    const { token0, token1, fee, initialPrice } = req.body;
    
    // Find tokens
    const tokenA = mockTokens.find(t => t.address === token0);
    const tokenB = mockTokens.find(t => t.address === token1);
    
    if (!tokenA || !tokenB) {
      return res.status(400).json({ error: "Invalid token addresses" });
    }
    
    // Create new pool
    const newPool: Pool = {
      id: `${mockPools.length + 1}`,
      address: `0x${Math.random().toString(16).slice(2, 42)}`,
      token0: tokenA,
      token1: tokenB,
      fee: parseFloat(fee) || 0.3,
      tvl: 0,
      volume24h: 0,
      apr: 0,
      price: initialPrice || 0,
      liquidity: "0",
      tick: 0
    };
    
    mockPools.push(newPool);
    
    res.status(201).json(newPool);
  });
  
  // Execute a swap
  app.post("/api/swap", (req, res) => {
    const { tokenFrom, tokenTo, amountFrom, amountTo, slippage, deadline } = req.body;
    
    // Find tokens
    const tokenA = mockTokens.find(t => t.address === tokenFrom);
    const tokenB = mockTokens.find(t => t.address === tokenTo);
    
    if (!tokenA || !tokenB) {
      return res.status(400).json({ error: "Invalid token addresses" });
    }
    
    // Find pool
    const pool = mockPools.find(p => 
      (p.token0.address === tokenFrom && p.token1.address === tokenTo) ||
      (p.token0.address === tokenTo && p.token1.address === tokenFrom)
    );
    
    if (!pool) {
      return res.status(400).json({ error: "No liquidity pool exists for this pair" });
    }
    
    // Create transaction
    const newTransaction: Transaction = {
      id: `tx-${mockTransactions.length + 1}`,
      type: "swap",
      pool,
      amount0: pool.token0.address === tokenFrom ? amountFrom.toString() : amountTo.toString(),
      amount1: pool.token1.address === tokenTo ? amountTo.toString() : amountFrom.toString(),
      account: `0x${Math.random().toString(16).slice(2, 42)}`,
      txHash: `0x${Math.random().toString(16).slice(2, 64)}`,
      timestamp: Date.now(),
      value: amountTo
    };
    
    mockTransactions.push(newTransaction);
    
    res.status(200).json({ success: true, transaction: newTransaction });
  });
  
  // Add liquidity
  app.post("/api/liquidity/add", (req, res) => {
    const { poolId, amount0, amount1, minPrice, maxPrice } = req.body;
    
    // Find pool
    const pool = mockPools.find(p => p.id === poolId);
    
    if (!pool) {
      return res.status(400).json({ error: "Pool not found" });
    }
    
    // Update pool TVL
    // In a real app, this would involve complex calculations
    const value = amount0 * pool.price + amount1;
    pool.tvl += value;
    
    // Create transaction
    const newTransaction: Transaction = {
      id: `tx-${mockTransactions.length + 1}`,
      type: "add",
      pool,
      amount0: amount0.toString(),
      amount1: amount1.toString(),
      account: `0x${Math.random().toString(16).slice(2, 42)}`,
      txHash: `0x${Math.random().toString(16).slice(2, 64)}`,
      timestamp: Date.now(),
      value
    };
    
    mockTransactions.push(newTransaction);
    
    res.status(200).json({ success: true, transaction: newTransaction });
  });
  
  // Remove liquidity
  app.post("/api/liquidity/remove", (req, res) => {
    const { poolId, percent } = req.body;
    
    // Find pool
    const pool = mockPools.find(p => p.id === poolId);
    
    if (!pool) {
      return res.status(400).json({ error: "Pool not found" });
    }
    
    // Calculate amounts based on percent
    const amount0 = 1.5 * (percent / 100);
    const amount1 = 3000 * (percent / 100);
    
    // Update pool TVL
    const value = amount0 * pool.price + amount1;
    pool.tvl -= value;
    
    // Create transaction
    const newTransaction: Transaction = {
      id: `tx-${mockTransactions.length + 1}`,
      type: "remove",
      pool,
      amount0: amount0.toString(),
      amount1: amount1.toString(),
      account: `0x${Math.random().toString(16).slice(2, 42)}`,
      txHash: `0x${Math.random().toString(16).slice(2, 64)}`,
      timestamp: Date.now(),
      value
    };
    
    mockTransactions.push(newTransaction);
    
    res.status(200).json({ success: true, transaction: newTransaction });
  });
  
  // Register a module
  app.post("/api/modules", (req, res) => {
    const { name, description, address, type } = req.body;
    
    // Create new module
    const newModule: Module = {
      id: `${mockModules.length + 1}`,
      name,
      description,
      address,
      type,
      enabled: false // New modules are disabled by default
    };
    
    mockModules.push(newModule);
    
    res.status(201).json(newModule);
  });
  
  // Update module status
  app.patch("/api/modules/:id", (req, res) => {
    const { id } = req.params;
    const { enabled } = req.body;
    
    // Find module
    const module = mockModules.find(m => m.id === id);
    
    if (!module) {
      return res.status(404).json({ error: "Module not found" });
    }
    
    // Update status
    module.enabled = enabled;
    
    res.status(200).json(module);
  });

  const httpServer = createServer(app);

  return httpServer;
}
