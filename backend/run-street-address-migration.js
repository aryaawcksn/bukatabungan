import fs from 'fs';
import path from 'path';
import pool from './config/db.js';

async function runStreetAddressMigration() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Running street_address migration...');
    
    // Read the migration file
    const migrationPath = path.join(process.cwd(), 'migrations', '008_add_street_address_field.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Execute the migration
    await client.query(migrationSQL);
    
    console.log('✅ Street address migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    
    // Check if column already exists
    if (error.message.includes('already exists')) {
      console.log('ℹ️ Column already exists, skipping migration');
    } else {
      throw error;
    }
  } finally {
    client.release();
    await pool.end();
  }
}

runStreetAddressMigration().catch(console.error);