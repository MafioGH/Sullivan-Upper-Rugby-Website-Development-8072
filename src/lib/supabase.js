import { createClient } from '@supabase/supabase-js'

// These will be updated with your actual credentials
const SUPABASE_URL = 'https://your-project-id.supabase.co'
const SUPABASE_ANON_KEY = 'your-anon-key'

if(SUPABASE_URL == 'https://your-project-id.supabase.co' || SUPABASE_ANON_KEY == 'your-anon-key'){
  throw new Error('Missing Supabase variables');
}

export default createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
})