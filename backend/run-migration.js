import { Pool } from 'pg';
import fs from 'fs';

const pool = new Pool({
  connectionString: 'postgresql://postgres:YhpOjvqEfFfbMLREwhjqzQDybcEmEsBl@tramway.proxy.rlwy.net:46833/railway',
  ssl: { rejectUnauthorized: false }
});

async function runMigration() {
  try {
    console.log('🔄 Connecting to Railway database...');
    const client = await pool.connect();
    
    console.log('📄 Reading migration file...');
    const migrationSQL = fs.readFileSync('./migrations/008_add_address_breakdown_fields.sql', 'utf8');
    
    console.log('🚀 Running migration...');
    await client.query(migrationSQL);
    
    console.log('✅ Migration completed successfully!');
    
    // Check new address columns in cdd_self table
    const columns = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'cdd_self' 
      AND column_name IN ('alamat_jalan', 'provinsi', 'kota', 'kecamatan', 'kelurahan')
    `);
    
    console.log('📋 Added address columns to cdd_self:', columns.rows.map(r => r.column_name));
    
    client.release();
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  }
}

runMigration();