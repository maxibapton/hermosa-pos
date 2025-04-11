import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function checkLowStock() {
  try {
    const { data, error } = await supabase.functions.invoke('check-stock');
    
    if (error) {
      console.error('Error checking stock:', error);
      return {
        success: false,
        error: error.message || 'Failed to check stock'
      };
    }

    // Handle non-2xx responses from the edge function
    if (!data || data.error) {
      const errorMessage = data?.error || data?.details || 'Unknown error occurred';
      console.error('Edge function error:', errorMessage);
      return {
        success: false,
        error: errorMessage
      };
    }

    return {
      success: true,
      data
    };
  } catch (error) {
    console.error('Error invoking stock check function:', error);
    return {
      success: false,
      error: error.message || 'Failed to invoke stock check function'
    };
  }
}