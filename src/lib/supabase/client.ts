import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  // Force visible debug output
  console.log('🚨 SUPABASE CLIENT DEBUG - START 🚨');
  console.log('Environment URL:', url);
  console.log('Environment KEY:', key);
  console.log('URL Status:', url ? '✅ FOUND' : '❌ MISSING');
  console.log('KEY Status:', key ? '✅ FOUND' : '❌ MISSING');
  console.log('🚨 SUPABASE CLIENT DEBUG - END 🚨');
  
  if (!url || !key) {
    console.error('❌ FATAL: Missing Supabase credentials!');
    // Return a mock client to prevent crashes for now
    return {
      auth: { onAuthStateChange: () => {}, getSession: () => Promise.resolve({ data: { session: null } }) }
    } as any;
  }
  
  return createBrowserClient(url, key);
}