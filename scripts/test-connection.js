#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

async function testConnection() {
  console.log('🔍 Test de connexion à la base de données...');
  
  const prisma = new PrismaClient();
  
  try {
    // Test de connexion
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Connexion à la base de données réussie !');
    
    // Test de création d'un client
    const testCustomer = await prisma.customer.create({
      data: {
        name: 'Test Connection',
        phone: '+225 00 00 00 00',
        city: 'Bouaké'
      }
    });
    
    console.log('✅ Test de création de client réussi !');
    console.log('📝 ID du client test:', testCustomer.id);
    
    // Nettoyage
    await prisma.customer.delete({
      where: { id: testCustomer.id }
    });
    
    console.log('✅ Nettoyage réussi !');
    console.log('🎉 Tous les tests ont réussi !');
    
  } catch (error) {
    console.error('❌ Erreur de connexion:', error.message);
    console.error('💡 Vérifiez votre DATABASE_URL dans le fichier .env');
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();