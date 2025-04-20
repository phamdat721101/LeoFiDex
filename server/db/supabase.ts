import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Environment variables
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase URL or key is missing. Please add them to your environment variables.');
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey);

// Check if the connection is valid
export async function checkSupabaseConnection() {
  try {
    const { data, error } = await supabase.from('users').select('count');
    if (error) throw error;
    console.log('Supabase connection successful');
    return true;
  } catch (error) {
    console.error('Supabase connection error:', error);
    return false;
  }
}