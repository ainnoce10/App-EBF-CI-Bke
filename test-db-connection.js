const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'db.ekohrrzklzrjwjgistnk.supabase.co',
  database: 'postgres',
  port: 5432,
  ssl: {
    require: true,
    rejectUnauthorized: false
  }
});

async function testConnection() {
  try {
    const client = await pool.connect();
    console.log('Successfully connected to Supabase PostgreSQL database');
    const result = await client.query('SELECT NOW()');
    console.log('Database time:', result.rows[0].now);
    client.release();
  } catch (err) {
    console.error('Error connecting to the database:', err.message);
  } finally {
    pool.end();
  }
}

testConnection();