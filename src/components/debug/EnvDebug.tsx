'use client';

import { useEffect } from 'react';

export function EnvDebug() {
  useEffect(() => {
    console.log('🚨 ENV DEBUG COMPONENT LOADED 🚨');
    console.log('SUPABASE URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('SUPABASE KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    console.log('All NEXT_PUBLIC env vars:', Object.keys(process.env).filter(k => k.startsWith('NEXT_PUBLIC')));
  }, []);

  return (
    <div style={{ 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      background: 'red', 
      color: 'white', 
      padding: '10px', 
      zIndex: 9999,
      fontSize: '12px'
    }}>
      DEBUG: URL={process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'MISSING'} 
      KEY={process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'MISSING'}
    </div>
  );
}