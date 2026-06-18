import { createClient } from '@supabase/supabase-js';

async function verifySupabaseConnection() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Error: Missing Supabase environment variables (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)');
    process.exit(1);
  }

  console.log(`Checking connection to: ${supabaseUrl}`);

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  try {
    // Attempt a simple query to verify connection
    const { error } = await supabase.from('facilities').select('count', { count: 'exact', head: true });

    if (error) {
      // If the table doesn't exist, it still means we connected to the database
      if (error.code === 'PGRST116' || error.code === '42P01') {
        console.log('✅ Supabase connection verified (Table check).');
      } else {
        console.error('❌ Supabase connection failed:', error.message);
        process.exit(1);
      }
    } else {
      console.log('✅ Supabase connection successful.');
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('❌ Unexpected error during Supabase connection check:', message);
    process.exit(1);
  }
}

verifySupabaseConnection();
