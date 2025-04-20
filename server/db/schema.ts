import { supabase } from './supabase';
import { v4 as uuidv4 } from 'uuid';

// In-memory storage for development when Supabase is not available
const memStorage = {
  users: new Map<string, User>(),
  userActions: new Map<string, UserAction>()
};

// Define user table structure
export interface User {
  id: string;
  address: string;
  created_at: Date;
  last_login: Date;
  wallet_type: string;
  chain_id: number;
}

// Define user action table structure
export interface UserAction {
  id: string;
  user_id: string;
  action_type: 'swap' | 'addLiquidity' | 'removeLiquidity' | 'createPool' | 'signMessage' | 'contractInteraction';
  transaction_hash?: string;
  details: Record<string, any>;
  created_at: Date;
  status: 'pending' | 'complete' | 'failed';
  chain_id: number;
}

// Check if Supabase credentials are available
const isSupabaseAvailable = !!process.env.SUPABASE_URL && !!process.env.SUPABASE_KEY;

// Helper functions for users
export async function createUser(address: string, walletType: string, chainId: number): Promise<User | null> {
  try {
    if (!isSupabaseAvailable) {
      // Use in-memory storage
      const lowerAddress = address.toLowerCase();
      
      // Check if user already exists
      if (Array.from(memStorage.users.values()).some(user => user.address === lowerAddress)) {
        return null;
      }
      
      const now = new Date();
      const user: User = {
        id: uuidv4(),
        address: lowerAddress,
        created_at: now,
        last_login: now,
        wallet_type: walletType,
        chain_id: chainId
      };
      
      memStorage.users.set(user.id, user);
      return user;
    }
    
    // Use Supabase
    const { data, error } = await supabase
      .from('users')
      .insert({
        address: address.toLowerCase(),
        wallet_type: walletType,
        chain_id: chainId,
        last_login: new Date()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating user:', error);
    return null;
  }
}

export async function getUserByAddress(address: string): Promise<User | null> {
  try {
    if (!isSupabaseAvailable) {
      // Use in-memory storage
      const lowerAddress = address.toLowerCase();
      const users = Array.from(memStorage.users.values());
      const user = users.find(u => u.address === lowerAddress);
      return user || null;
    }
    
    // Use Supabase
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('address', address.toLowerCase())
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // User not found
      }
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error getting user by address:', error);
    return null;
  }
}

export async function updateUserLogin(address: string): Promise<boolean> {
  try {
    if (!isSupabaseAvailable) {
      // Use in-memory storage
      const lowerAddress = address.toLowerCase();
      const users = Array.from(memStorage.users.values());
      const user = users.find(u => u.address === lowerAddress);
      
      if (user) {
        user.last_login = new Date();
        return true;
      }
      return false;
    }
    
    // Use Supabase
    const { error } = await supabase
      .from('users')
      .update({
        last_login: new Date()
      })
      .eq('address', address.toLowerCase());

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating user login:', error);
    return false;
  }
}

// Helper functions for user actions
export async function recordUserAction(
  userId: string,
  actionType: UserAction['action_type'],
  details: Record<string, any>,
  chainId: number,
  txHash?: string
): Promise<UserAction | null> {
  try {
    if (!isSupabaseAvailable) {
      // Use in-memory storage
      const now = new Date();
      const action: UserAction = {
        id: uuidv4(),
        user_id: userId,
        action_type: actionType,
        transaction_hash: txHash,
        details,
        created_at: now,
        status: txHash ? 'pending' : 'complete',
        chain_id: chainId
      };
      
      memStorage.userActions.set(action.id, action);
      return action;
    }
    
    // Use Supabase
    const { data, error } = await supabase
      .from('user_actions')
      .insert({
        user_id: userId,
        action_type: actionType,
        transaction_hash: txHash,
        details,
        status: txHash ? 'pending' : 'complete',
        chain_id: chainId
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error recording user action:', error);
    return null;
  }
}

export async function updateActionStatus(
  id: string,
  status: UserAction['status'],
  txHash?: string
): Promise<boolean> {
  try {
    if (!isSupabaseAvailable) {
      // Use in-memory storage
      const action = memStorage.userActions.get(id);
      if (!action) {
        return false;
      }
      
      action.status = status;
      if (txHash) {
        action.transaction_hash = txHash;
      }
      
      memStorage.userActions.set(id, action);
      return true;
    }
    
    // Use Supabase
    const updates: any = { status };
    if (txHash) updates.transaction_hash = txHash;

    const { error } = await supabase
      .from('user_actions')
      .update(updates)
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating action status:', error);
    return false;
  }
}

export async function getUserActions(userId: string, limit = 20): Promise<UserAction[] | null> {
  try {
    if (!isSupabaseAvailable) {
      // Use in-memory storage
      const actions = Array.from(memStorage.userActions.values())
        .filter(action => action.user_id === userId)
        .sort((a, b) => b.created_at.getTime() - a.created_at.getTime())
        .slice(0, limit);
      
      return actions;
    }
    
    // Use Supabase
    const { data, error } = await supabase
      .from('user_actions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting user actions:', error);
    return null;
  }
}