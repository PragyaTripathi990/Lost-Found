import { createClient } from '@supabase/supabase-js';
import pkg from 'pg';
const { Pool } = pkg;

// Supabase client for storage and auth
const supabaseUrl = 'https://uiazxxywirupzjxhuqgu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVpYXp4eHl3aXJ1cHpqeGh1cWd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTYzMDAwNCwiZXhwIjoyMDc3MjA2MDA0fQ.utxki7ZPdTz0tT248D5eAd7MDJufbDBiefNeunl-rXA';

console.log('🔍 Supabase URL:', supabaseUrl);
console.log('🔍 Supabase Key (first 20 chars):', supabaseKey.substring(0, 20) + '...');

export const supabase = createClient(supabaseUrl, supabaseKey);

// PostgreSQL connection for vector operations
const databaseUrl = 'postgresql://neondb_owner:npg_sB28ISJnlZWO@ep-hidden-band-ahdvot0u-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

export const pool = new Pool({
  connectionString: databaseUrl,
  ssl: { rejectUnauthorized: false }
});

// Test database connection
export const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('✅ Database connected successfully');
    client.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
};
