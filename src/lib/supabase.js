import { createClient } from '@supabase/supabase-js'

// Project credentials from Supabase
const SUPABASE_URL = 'https://pjtgsnbtghxahwtcgxdw.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqdGdzbmJ0Z2h4YWh3dGNneGR3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4NzIzNDUsImV4cCI6MjA2NzQ0ODM0NX0.yyZ0MZDg3Hs9dZoyFXE8qWnmPXyqYhZw0TZ9Si9OOeU'

// Validate credentials
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase credentials');
}

// Create and export the Supabase client with real-time enabled
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})

// Test connection and enable real-time on initialization
supabase.from('fixtures_rugby12345').select('count').limit(1)
  .then(() => {
    console.log('✅ Supabase connection successful')
    console.log('🔄 Real-time features enabled')
  })
  .catch(err => console.error('❌ Supabase connection failed:', err))

export default supabase