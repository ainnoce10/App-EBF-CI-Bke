const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgres://postgres:Ebf.bke2026*@ekohrrzklzrjwjgistnk.supabase.co:5432/postgres',
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
    const result = await client.query('SELECT version()');
    console.log('Version PostgreSQL:', result.rows[0].version);
    client.release();
  } catch (err) {
    console.error('❌ Erreur de connexion:', err.message);
    if (err.code === 'ETIMEDOUT') {
      console.log('Conseil: Vérifiez que :\n' +
        '1. Le pare-feu n\'est pas en train de bloquer la connexion\n' +
        '2. L\'adresse IP de votre machine est autorisée dans Supabase\n' +
        '3. Les informations de connexion sont correctes');
    }
  } finally {
    pool.end();
  }
}

testConnection();