const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function diagnosticDatabase() {
  console.log('🔍 Diagnostic de la base de données...');
  
  try {
    // Test de connexion
    console.log('1. Test de connexion à la base de données...');
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Connexion réussie');
    
    // Vérification des tables
    console.log('2. Vérification des tables...');
    const tables = await prisma.$queryRaw`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name NOT LIKE 'sqlite_%'
    `;
    console.log('Tables trouvées:', tables);
    
    // Vérification de la table Customer
    console.log('3. Vérification de la table Customer...');
    const customerCount = await prisma.customer.count();
    console.log(`Nombre de clients: ${customerCount}`);
    
    if (customerCount > 0) {
      const customers = await prisma.customer.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' }
      });
      console.log('Derniers clients:', customers);
    }
    
    // Test de création d'un client
    console.log('4. Test de création d\'un client...');
    const testCustomer = await prisma.customer.create({
      data: {
        name: 'Test Diagnostic',
        phone: `+225${Date.now()}`, // Numéro unique
        city: 'Bouaké'
      }
    });
    console.log('✅ Client de test créé:', testCustomer.id);
    
    // Nettoyage
    await prisma.customer.delete({
      where: { id: testCustomer.id }
    });
    console.log('✅ Client de test supprimé');
    
    console.log('🎉 Tous les tests de base de données ont réussi!');
    
  } catch (error) {
    console.error('❌ Erreur lors du diagnostic:', error);
    
    if (error.message.includes('Unable to open the database file')) {
      console.log('💡 La base de données n\'existe pas ou n\'est pas accessible.');
      console.log('   Solution: Exécuter `npm run db:push` pour créer la base de données.');
    } else if (error.message.includes('no such table')) {
      console.log('💡 Les tables n\'existent pas dans la base de données.');
      console.log('   Solution: Exécuter `npm run db:push` pour créer les tables.');
    } else {
      console.log('💡 Erreur inattendue:', error.message);
    }
  } finally {
    await prisma.$disconnect();
  }
}

diagnosticDatabase();