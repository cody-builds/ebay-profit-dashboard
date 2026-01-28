import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  console.log('🔍 Supabase ENV Debug:', {
    url: url ? 'SET' : 'MISSING',
    key: key ? 'SET' : 'MISSING',
    urlPrefix: url?.substring(0, 20),
    keyPrefix: key?.substring(0, 20)
  });
  
  if (!url || !key) {
    console.error('❌ Missing Supabase credentials:', { url, key });
    throw new Error('Missing Supabase configuration');
  }
  
  return createBrowserClient(url, key);
}