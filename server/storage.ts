import { users, tokens, pools, transactions, modules, positions } from "@shared/schema";
import type { 
  User, InsertUser, Token, InsertToken, Pool, InsertPool, 
  Transaction, InsertTransaction, Module, InsertModule, Position, InsertPosition 
} from "@shared/schema";
import { Token as TokenInterface, Pool as PoolInterface } from "@shared/types";

// Storage interface for all database operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByAddress(address: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Token operations
  getTokens(): Promise<Token[]>;
  getToken(id: number): Promise<Token | undefined>;
  getTokenByAddress(address: string): Promise<Token | undefined>;
  createToken(token: InsertToken): Promise<Token>;
  
  // Pool operations
  getPools(): Promise<Pool[]>;
  getPool(id: number): Promise<Pool | undefined>;
  getPoolByAddress(address: string): Promise<Pool | undefined>;
  getPoolByTokens(token0Id: number, token1Id: number, fee: number): Promise<Pool | undefined>;
  createPool(pool: InsertPool): Promise<Pool>;
  updatePoolStats(id: number, tvl: number, volume24h: number, apr: number): Promise<Pool>;
  
  // Transaction operations
  getTransactions(): Promise<Transaction[]>;
  getRecentTransactions(limit: number): Promise<Transaction[]>;
  getTransactionsByPool(poolId: number): Promise<Transaction[]>;
  getTransactionsByUser(account: string): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  
  // Module operations
  getModules(): Promise<Module[]>;
  getModule(id: number): Promise<Module | undefined>;
  getModuleByAddress(address: string): Promise<Module | undefined>;
  createModule(module: InsertModule): Promise<Module>;
  updateModuleStatus(id: number, enabled: boolean): Promise<Module>;
  
  // Position operations
  getPositions(): Promise<Position[]>;
  getPosition(id: number): Promise<Position | undefined>;
  getPositionsByUser(userId: number): Promise<Position[]>;
  getPositionsByPool(poolId: number): Promise<Position[]>;
  createPosition(position: InsertPosition): Promise<Position>;
  updatePosition(id: number, amount0: string, amount1: string, liquidity: string): Promise<Position>;
  removePosition(id: number): Promise<void>;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private tokens: Map<number, Token>;
  private pools: Map<number, Pool>;
  private transactions: Map<number, Transaction>;
  private modules: Map<number, Module>;
  private positions: Map<number, Position>;
  
  private currentUserId: number = 1;
  private currentTokenId: number = 1;
  private currentPoolId: number = 1;
  private currentTransactionId: number = 1;
  private currentModuleId: number = 1;
  private currentPositionId: number = 1;

  constructor() {
    this.users = new Map();
    this.tokens = new Map();
    this.pools = new Map();
    this.transactions = new Map();
    this.modules = new Map();
    this.positions = new Map();
    
    // Initialize with some sample data for development
    this.initializeSampleData();
  }

  // Initialize sample data for development
  private initializeSampleData() {
    // Add sample tokens
    const eth: Token = {
      id: this.currentTokenId++,
      address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
      symbol: "ETH",
      name: "Ethereum",
      decimals: 18,
      chainId: 1,
      color: "#627EEA",
      logoURI: "https://ethereum.org/static/6b935ac0e6194247347855dc3d328e83/13c43/eth-diamond-black.png"
    };
    this.tokens.set(eth.id, eth);
    
    const usdc: Token = {
      id: this.currentTokenId++,
      address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      symbol: "USDC",
      name: "USD Coin",
      decimals: 6,
      chainId: 1,
      color: "#2775CA",
      logoURI: "https://cryptologos.cc/logos/usd-coin-usdc-logo.png"
    };
    this.tokens.set(usdc.id, usdc);
    
    const dai: Token = {
      id: this.currentTokenId++,
      address: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
      symbol: "DAI",
      name: "Dai Stablecoin",
      decimals: 18,
      chainId: 1,
      color: "#F5AC37",
      logoURI: "https://cryptologos.cc/logos/multi-collateral-dai-dai-logo.png"
    };
    this.tokens.set(dai.id, dai);
    
    const wbtc: Token = {
      id: this.currentTokenId++,
      address: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
      symbol: "WBTC",
      name: "Wrapped Bitcoin",
      decimals: 8,
      chainId: 1,
      color: "#F7931A",
      logoURI: "https://cryptologos.cc/logos/wrapped-bitcoin-wbtc-logo.png"
    };
    this.tokens.set(wbtc.id, wbtc);
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }
  
  async getUserByAddress(address: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.address === address
    );
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Token operations
  async getTokens(): Promise<Token[]> {
    return Array.from(this.tokens.values());
  }
  
  async getToken(id: number): Promise<Token | undefined> {
    return this.tokens.get(id);
  }
  
  async getTokenByAddress(address: string): Promise<Token | undefined> {
    return Array.from(this.tokens.values()).find(
      (token) => token.address.toLowerCase() === address.toLowerCase()
    );
  }
  
  async createToken(insertToken: InsertToken): Promise<Token> {
    const id = this.currentTokenId++;
    const token: Token = { ...insertToken, id };
    this.tokens.set(id, token);
    return token;
  }
  
  // Pool operations
  async getPools(): Promise<Pool[]> {
    return Array.from(this.pools.values());
  }
  
  async getPool(id: number): Promise<Pool | undefined> {
    return this.pools.get(id);
  }
  
  async getPoolByAddress(address: string): Promise<Pool | undefined> {
    return Array.from(this.pools.values()).find(
      (pool) => pool.address.toLowerCase() === address.toLowerCase()
    );
  }
  
  async getPoolByTokens(token0Id: number, token1Id: number, fee: number): Promise<Pool | undefined> {
    return Array.from(this.pools.values()).find(
      (pool) => (
        (pool.token0Id === token0Id && pool.token1Id === token1Id) ||
        (pool.token0Id === token1Id && pool.token1Id === token0Id)
      ) && Math.abs(pool.fee - fee) < 0.001
    );
  }
  
  async createPool(insertPool: InsertPool): Promise<Pool> {
    const id = this.currentPoolId++;
    const now = new Date();
    
    const pool: Pool = { 
      ...insertPool, 
      id,
      tvl: 0,
      volume24h: 0,
      apr: 0,
      createdAt: now
    };
    
    this.pools.set(id, pool);
    return pool;
  }
  
  async updatePoolStats(id: number, tvl: number, volume24h: number, apr: number): Promise<Pool> {
    const pool = this.pools.get(id);
    
    if (!pool) {
      throw new Error(`Pool with id ${id} not found`);
    }
    
    const updatedPool: Pool = {
      ...pool,
      tvl,
      volume24h,
      apr
    };
    
    this.pools.set(id, updatedPool);
    return updatedPool;
  }
  
  // Transaction operations
  async getTransactions(): Promise<Transaction[]> {
    return Array.from(this.transactions.values());
  }
  
  async getRecentTransactions(limit: number): Promise<Transaction[]> {
    return Array.from(this.transactions.values())
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }
  
  async getTransactionsByPool(poolId: number): Promise<Transaction[]> {
    return Array.from(this.transactions.values()).filter(
      (tx) => tx.poolId === poolId
    );
  }
  
  async getTransactionsByUser(account: string): Promise<Transaction[]> {
    return Array.from(this.transactions.values()).filter(
      (tx) => tx.account.toLowerCase() === account.toLowerCase()
    );
  }
  
  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = this.currentTransactionId++;
    const now = new Date();
    
    const transaction: Transaction = {
      ...insertTransaction,
      id,
      timestamp: now
    };
    
    this.transactions.set(id, transaction);
    return transaction;
  }
  
  // Module operations
  async getModules(): Promise<Module[]> {
    return Array.from(this.modules.values());
  }
  
  async getModule(id: number): Promise<Module | undefined> {
    return this.modules.get(id);
  }
  
  async getModuleByAddress(address: string): Promise<Module | undefined> {
    return Array.from(this.modules.values()).find(
      (module) => module.address.toLowerCase() === address.toLowerCase()
    );
  }
  
  async createModule(insertModule: InsertModule): Promise<Module> {
    const id = this.currentModuleId++;
    const now = new Date();
    
    const module: Module = {
      ...insertModule,
      id,
      createdAt: now
    };
    
    this.modules.set(id, module);
    return module;
  }
  
  async updateModuleStatus(id: number, enabled: boolean): Promise<Module> {
    const module = this.modules.get(id);
    
    if (!module) {
      throw new Error(`Module with id ${id} not found`);
    }
    
    const updatedModule: Module = {
      ...module,
      enabled
    };
    
    this.modules.set(id, updatedModule);
    return updatedModule;
  }
  
  // Position operations
  async getPositions(): Promise<Position[]> {
    return Array.from(this.positions.values());
  }
  
  async getPosition(id: number): Promise<Position | undefined> {
    return this.positions.get(id);
  }
  
  async getPositionsByUser(userId: number): Promise<Position[]> {
    return Array.from(this.positions.values()).filter(
      (position) => position.userId === userId
    );
  }
  
  async getPositionsByPool(poolId: number): Promise<Position[]> {
    return Array.from(this.positions.values()).filter(
      (position) => position.poolId === poolId
    );
  }
  
  async createPosition(insertPosition: InsertPosition): Promise<Position> {
    const id = this.currentPositionId++;
    const now = new Date();
    
    const position: Position = {
      ...insertPosition,
      id,
      createdAt: now
    };
    
    this.positions.set(id, position);
    return position;
  }
  
  async updatePosition(id: number, amount0: string, amount1: string, liquidity: string): Promise<Position> {
    const position = this.positions.get(id);
    
    if (!position) {
      throw new Error(`Position with id ${id} not found`);
    }
    
    const updatedPosition: Position = {
      ...position,
      amount0,
      amount1,
      liquidity
    };
    
    this.positions.set(id, updatedPosition);
    return updatedPosition;
  }
  
  async removePosition(id: number): Promise<void> {
    if (!this.positions.has(id)) {
      throw new Error(`Position with id ${id} not found`);
    }
    
    this.positions.delete(id);
  }
}

// Export the storage instance
export const storage = new MemStorage();
