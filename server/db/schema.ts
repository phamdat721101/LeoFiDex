import { supabase } from './supabase';

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

// Helper functions for users
export async function createUser(address: string, walletType: string, chainId: number): Promise<User | null> {
  try {
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