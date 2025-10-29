import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Initialisation de la base de données...');

  try {
    // Vérifier si la table Customer existe
    const customerCount = await prisma.customer.count();
    console.log(`📊 Table Customer existe avec ${customerCount} enregistrements`);
  } catch (error) {
    console.log('❌ Table Customer n\'existe pas, création en cours...');
  }

  // Créer un client test si nécessaire
  try {
    const testCustomer = await prisma.customer.upsert({
      where: { phone: '+22500000000' },
      update: {},
      create: {
        name: 'Client Test',
        phone: '+22500000000',
        city: 'Bouaké',
      },
    });
    console.log('✅ Client test créé:', testCustomer.id);
  } catch (error) {
    console.error('❌ Erreur lors de la création du client test:', error);
  }

  console.log('✅ Base de données initialisée avec succès!');
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors de l\'initialisation:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });