import { createClient, SupabaseClient } from '@supabase/supabase-js';
import ENV from './env.js';

export const supabase: SupabaseClient = createClient(ENV.SUPABASE_URL, ENV.SUPABASE_ANON_KEY);

export default supabase;
