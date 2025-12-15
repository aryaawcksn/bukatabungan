import { Pool } from 'pg';

const pool = new Pool({
  connectionString: 'postgresql://postgres:YhpOjvqEfFfbMLREwhjqzQDybcEmEsBl@tramway.proxy.rlwy.net:46833/railway',
  ssl: { rejectUnauthorized: false }
});

async function checkUsersTable() {
  try {
    console.log('🔄 Connecting to Railway database...');
    const client = await pool.connect();
    
    console.log('📋 Checking users table structure...');
    const columns = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position
    `);
    
    console.log('📋 Users table columns:');
    columns.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type}`);
    });
    
    // Sample data
    console.log('\n📋 Sample users data:');
    const sample = await client.query('SELECT * FROM users LIMIT 3');
    console.log(sample.rows);
    
    client.release();
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
}

checkUsersTable();