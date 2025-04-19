import { pgTable, text, serial, integer, boolean, doublePrecision, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  isAdmin: boolean("is_admin").default(false),
  address: text("address").unique(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  isAdmin: true,
  address: true,
});

// Tokens table schema
export const tokens = pgTable("tokens", {
  id: serial("id").primaryKey(),
  address: text("address").notNull().unique(),
  symbol: text("symbol").notNull(),
  name: text("name").notNull(),
  decimals: integer("decimals").notNull(),
  chainId: integer("chain_id").notNull(),
  color: text("color").notNull(),
  logoURI: text("logo_uri"),
});

export const insertTokenSchema = createInsertSchema(tokens).pick({
  address: true,
  symbol: true,
  name: true,
  decimals: true,
  chainId: true,
  color: true,
  logoURI: true,
});

// Pools table schema
export const pools = pgTable("pools", {
  id: serial("id").primaryKey(),
  address: text("address").notNull().unique(),
  token0Id: integer("token0_id").references(() => tokens.id).notNull(),
  token1Id: integer("token1_id").references(() => tokens.id).notNull(),
  fee: doublePrecision("fee").notNull(),
  tvl: doublePrecision("tvl").default(0),
  volume24h: doublePrecision("volume_24h").default(0),
  apr: doublePrecision("apr").default(0),
  price: doublePrecision("price").notNull(),
  liquidity: text("liquidity").notNull(),
  tick: integer("tick").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPoolSchema = createInsertSchema(pools).pick({
  address: true,
  token0Id: true,
  token1Id: true,
  fee: true,
  price: true,
  liquidity: true,
  tick: true,
});

// Transactions table schema
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // 'swap', 'add', 'remove'
  poolId: integer("pool_id").references(() => pools.id).notNull(),
  amount0: text("amount0").notNull(),
  amount1: text("amount1").notNull(),
  account: text("account").notNull(),
  txHash: text("tx_hash").notNull().unique(),
  timestamp: timestamp("timestamp").defaultNow(),
  value: doublePrecision("value").notNull(),
});

export const insertTransactionSchema = createInsertSchema(transactions).pick({
  type: true,
  poolId: true,
  amount0: true,
  amount1: true,
  account: true,
  txHash: true,
  value: true,
});

// Modules table schema
export const modules = pgTable("modules", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  address: text("address").notNull().unique(),
  type: text("type").notNull(), // 'fee', 'oracle', 'rangeOrder', 'governance'
  enabled: boolean("enabled").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertModuleSchema = createInsertSchema(modules).pick({
  name: true,
  description: true,
  address: true,
  type: true,
  enabled: true,
});

// Positions table schema (for user liquidity positions)
export const positions = pgTable("positions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  poolId: integer("pool_id").references(() => pools.id).notNull(),
  amount0: text("amount0").notNull(),
  amount1: text("amount1").notNull(),
  tickLower: integer("tick_lower"),
  tickUpper: integer("tick_upper"),
  liquidity: text("liquidity").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPositionSchema = createInsertSchema(positions).pick({
  userId: true,
  poolId: true,
  amount0: true,
  amount1: true,
  tickLower: true,
  tickUpper: true,
  liquidity: true,
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Token = typeof tokens.$inferSelect;
export type InsertToken = z.infer<typeof insertTokenSchema>;

export type Pool = typeof pools.$inferSelect;
export type InsertPool = z.infer<typeof insertPoolSchema>;

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;

export type Module = typeof modules.$inferSelect;
export type InsertModule = z.infer<typeof insertModuleSchema>;

export type Position = typeof positions.$inferSelect;
export type InsertPosition = z.infer<typeof insertPositionSchema>;
