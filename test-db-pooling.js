const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'ekohrrzklzrjwjgistnk.supabase.co',  // Notez : sans le préfixe 'db.'
  database: 'postgres',
  port: 6543,  // Port pooling par défaut de Supabase
  ssl: {
    require: true,
    rejectUnauthorized: false
  }
});

async function testConnection() {
  try {
    console.log('Tentative de connexion à la base de données...');
    const client = await pool.connect();
    console.log('✅ Connexion réussie à la base de données PostgreSQL');
    const result = await client.query('SELECT NOW()');
    console.log('Heure de la base de données:', result.rows[0].now);
    client.release();
  } catch (err) {
    console.error('❌ Erreur de connexion:', err.message);
    console.error('Details:', err);
  } finally {
    pool.end();
  }
}

testConnection();