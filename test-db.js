const { Client } = require('pg');

async function testConnection() {
    const client = new Client({
        user: 'postgres',
        password: 'Ebf.bke2026*',
        host: 'db.ekohrrzklzrjwjgistnk.supabase.co',
        port: 5432,
        database: 'postgres',
        ssl: {
            rejectUnauthorized: false
        }
    });

    try {
        console.log('Tentative de connexion à la base de données...');
        await client.connect();
        console.log('✅ Connecté avec succès!');
        
        const result = await client.query('SELECT NOW()');
        console.log('✅ Test de requête réussi:', result.rows[0]);
        
        await client.end();
    } catch (err) {
        console.error('❌ Erreur de connexion:', err);
    }
}

testConnection();