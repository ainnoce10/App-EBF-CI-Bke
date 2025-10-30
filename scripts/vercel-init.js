const { PrismaClient } = require('@prisma/client');
const { execSync } = require('child_process');

const prisma = new PrismaClient();

async function initializeForVercel() {
  console.log('🚀 Initialisation de la base de données pour Vercel...');
  
  try {
    // Vérifier si nous sommes sur Vercel
    if (!process.env.VERCEL) {
      console.log('⚠️ Ce script est conçu pour s\'exécuter sur Vercel');
      return;
    }
    
    console.log('📂 Vérification de la structure de la base de données...');
    
    // Essayer de se connecter à la base de données
    try {
      await prisma.$queryRaw`SELECT 1`;
      console.log('✅ Connexion à la base de données réussie');
    } catch (error) {
      if (error.message.includes('Unable to open the database file')) {
        console.log('📝 La base de données n\'existe pas, création en cours...');
        
        // Créer les tables avec Prisma
        try {
          execSync('npx prisma db push', { stdio: 'inherit' });
          console.log('✅ Base de données créée avec succès');
        } catch (pushError) {
          console.error('❌ Erreur lors de la création de la base de données:', pushError);
          throw pushError;
        }
      } else {
        throw error;
      }
    }
    
    // Vérifier que les tables existent
    const tables = await prisma.$queryRaw`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name NOT LIKE 'sqlite_%'
    `;
    
    console.log('📋 Tables trouvées:', tables.map(t => t.name));
    
    // Créer un client de test si aucun n'existe
    const customerCount = await prisma.customer.count();
    if (customerCount === 0) {
      console.log('👤 Aucun client trouvé, création d\'un client de test...');
      await prisma.customer.create({
        data: {
          name: 'Client Test Vercel',
          phone: '+22512345678',
          city: 'Bouaké'
        }
      });
      console.log('✅ Client de test créé');
    } else {
      console.log(`👤 ${customerCount} clients existants dans la base de données`);
    }
    
    console.log('🎉 Initialisation de la base de données terminée avec succès!');
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter l'initialisation
if (require.main === module) {
  initializeForVercel()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Échec de l\'initialisation:', error);
      process.exit(1);
    });
}

module.exports = { initializeForVercel };