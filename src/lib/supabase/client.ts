import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  console.log('✅ SUPABASE CLIENT WORKING:', { 
    url: url ? 'SET' : 'MISSING', 
    key: key ? 'SET' : 'MISSING' 
  });
  
  if (!url || !key) {
    console.error('❌ Missing Supabase credentials');
    throw new Error('Supabase configuration missing');
  }
  
  return createBrowserClient(url, key);
}