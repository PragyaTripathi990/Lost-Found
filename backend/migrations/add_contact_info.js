import { pool } from '../utils/database.js';

async function addContactInfoColumn() {
  try {
    console.log('Adding contact_info column to items table...');
    
    await pool.query(`
      ALTER TABLE items 
      ADD COLUMN IF NOT EXISTS contact_info TEXT;
    `);
    
    console.log('✅ contact_info column added successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding contact_info column:', error);
    process.exit(1);
  }
}

addContactInfoColumn();

