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
    const migrationSQL = fs.readFileSync('./migrations/007_add_edit_audit_trail.sql', 'utf8');
    
    console.log('🚀 Running migration...');
    await client.query(migrationSQL);
    
    console.log('✅ Migration completed successfully!');
    
    // Verify tables were created
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('submission_edit_history')
    `);
    
    console.log('📋 Created tables:', result.rows.map(r => r.table_name));
    
    // Check new columns
    const columns = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'pengajuan_tabungan' 
      AND column_name IN ('last_edited_at', 'last_edited_by', 'edit_count', 'original_approved_by', 'original_approved_at')
    `);
    
    console.log('📋 Added columns to pengajuan_tabungan:', columns.rows.map(r => r.column_name));
    
    client.release();
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  }
}

runMigration();