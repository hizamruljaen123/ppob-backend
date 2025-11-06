// Apply PostgreSQL schema from db/postgres_schema.sql using node-postgres
require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

async function applySchema() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('DATABASE_URL is not set in environment');
    process.exit(1);
  }

  const sqlPath = path.join(__dirname, '..', 'db', 'postgres_schema.sql');
  let sql;
  try {
    sql = fs.readFileSync(sqlPath, 'utf8');
  } catch (e) {
    console.error('Failed to read schema file at', sqlPath, e.message);
    process.exit(1);
  }

  const pool = new Pool({
    connectionString,
    // Neon requires SSL; we allow it here. DATABASE_URL also has sslmode=require.
    ssl: { rejectUnauthorized: false }
  });

  const client = await pool.connect();
  try {
    console.log('Applying schema to database...');
    await client.query(sql);
    console.log('Schema applied successfully.');
  } catch (e) {
    console.error('Error applying schema:', e.message);
    console.error(e);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

applySchema().catch((e) => {
  console.error('Unhandled error:', e);
  process.exit(1);
});