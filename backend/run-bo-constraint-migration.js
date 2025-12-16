import fs from 'fs';
import path from 'path';
import pool from './config/db.js';

const runBoConstraintMigration = async () => {
  const client = await pool.connect();
  
  try {
    console.log('🔧 Starting BO unique constraint migration...');
    
    // Read the migration file
    const migrationPath = path.join(process.cwd(), 'migrations', '009_add_bo_unique_constraint.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Execute the migration
    await client.query('BEGIN');
    
    console.log('📋 Executing migration SQL...');
    await client.query(migrationSQL);
    
    await client.query('COMMIT');
    
    console.log('✅ BO unique constraint migration completed successfully!');
    
    // Test the constraint by checking if it exists
    const constraintCheck = await client.query(`
      SELECT constraint_name 
      FROM information_schema.table_constraints 
      WHERE table_name = 'bo' 
      AND constraint_type = 'UNIQUE' 
      AND constraint_name = 'bo_pengajuan_id_unique'
    `);
    
    if (constraintCheck.rows.length > 0) {
      console.log('✅ Unique constraint successfully created:', constraintCheck.rows[0].constraint_name);
    } else {
      console.log('⚠️ Constraint may not have been created properly');
    }
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    client.release();
  }
};

// Run the migration
runBoConstraintMigration()
  .then(() => {
    console.log('🎉 Migration process completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Migration process failed:', error);
    process.exit(1);
  });