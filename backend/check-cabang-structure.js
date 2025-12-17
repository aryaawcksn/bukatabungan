import pool from "./config/db.js";

async function checkCabangStructure() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Checking cabang table structure...');
    
    const result = await client.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'cabang' 
      ORDER BY ordinal_position
    `);
    
    console.log('📋 Cabang table columns:');
    result.rows.forEach(row => {
      console.log(`  - ${row.column_name} (${row.data_type}) ${row.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
    
    // Also get sample data
    const sampleResult = await client.query('SELECT * FROM cabang LIMIT 1');
    console.log('\n📄 Sample data:');
    console.log(sampleResult.rows[0]);
    
  } catch (err) {
    console.error('❌ Error:', err);
  } finally {
    client.release();
    process.exit(0);
  }
}

checkCabangStructure();