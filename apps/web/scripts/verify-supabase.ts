import { loadEnvConfig } from '@next/env';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(currentDir, '../../..');

loadEnvConfig(repoRoot);

async function verifySupabaseConnection() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Error: Missing Supabase environment variables (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)');
    process.exit(1);
  }

  console.log(`Checking connection to: ${supabaseUrl}`);

  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/facilities?select=count`, {
      method: 'HEAD',
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
        Prefer: 'count=exact',
      },
    });

    if (!response.ok) {
      const message = await response.text();
      console.error('❌ Supabase connection failed:', message || response.statusText);
      process.exit(1);
    }

    console.log('✅ Supabase connection successful.');
  } catch (err: any) {
    console.error('❌ Unexpected error during Supabase connection check:', err.message);
    process.exit(1);
  }
}

verifySupabaseConnection();
