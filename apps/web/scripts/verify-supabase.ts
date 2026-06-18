import { loadEnvConfig } from '@next/env';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(currentDir, '../../..');
const isCi = process.env.CI === 'true';

loadEnvConfig(repoRoot);

function failOrWarn(message: string): void {
  if (isCi) {
    console.error(message);
    process.exit(1);
  }

  console.warn(message);
  console.warn('⚠️ Continuing local build because Supabase network verification is only strict in CI.');
}

async function verifySupabaseConnection() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('⚠️ Warning: Missing Supabase environment variables (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)');
    console.warn('⚠️ Supabase connection check will be skipped.');
    return;
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
      failOrWarn(`❌ Supabase connection failed: ${message || response.statusText}`);
      return;
    }

    console.log('✅ Supabase connection successful.');
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown network error';
    failOrWarn(`❌ Unexpected error during Supabase connection check: ${message}`);
  }
}

verifySupabaseConnection();
