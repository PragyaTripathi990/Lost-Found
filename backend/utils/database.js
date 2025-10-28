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
const databaseUrl = 'postgresql://postgres:Pragya123Tripathi@db.uiazxxywirupzjxhuqgu.supabase.co:5432/postgres';

export const pool = new Pool({
  connectionString: databaseUrl,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
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
