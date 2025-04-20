import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Environment variables
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || '';

// Mock client for development if credentials are missing
let supabase: any;

if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase URL or key is missing. Using in-memory storage instead.');
  // Create a mock client that will be used when Supabase credentials are missing
  supabase = {
    from: () => ({
      select: () => Promise.resolve({ data: [], error: null }),
      insert: () => Promise.resolve({ data: null, error: null }),
      update: () => Promise.resolve({ data: null, error: null }),
      delete: () => Promise.resolve({ data: null, error: null }),
      eq: () => ({ single: () => Promise.resolve({ data: null, error: null }) })
    })
  };
} else {
  // Create actual Supabase client
  supabase = createClient(supabaseUrl, supabaseKey);
}

// Export the client (either real or mock)
export { supabase };

// Check if the connection is valid
export async function checkSupabaseConnection() {
  try {
    if (!supabaseUrl || !supabaseKey) {
      console.warn('Supabase credentials not provided. Using in-memory storage.');
      return false;
    }
    
    const { data, error } = await supabase.from('users').select('count');
    if (error) throw error;
    console.log('Supabase connection successful');
    return true;
  } catch (error) {
    console.error('Supabase connection error:', error);
    return false;
  }
}