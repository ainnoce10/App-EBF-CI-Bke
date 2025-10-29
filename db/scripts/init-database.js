const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function initializeDatabase() {
  try {
    // Créer le répertoire db s'il n'existe pas
    const dbDir = path.join(process.cwd(), 'db');
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    // Tester la connexion
    await prisma.$executeRaw`SELECT 1`;
    console.log('✅ Base de données initialisée avec succès');

    // Insérer des avis par défaut si aucun n'existe
    const reviewCount = await prisma.review.count();
    if (reviewCount === 0) {
      await prisma.review.createMany({
        data: [
          {
            name: "Kouassi A.",
            rating: 5,
            comment: "Service excellent et rapide!",
          },
          {
            name: "Touré M.",
            rating: 5,
            comment: "Travail professionnel, je recommande",
          },
          {
            name: "Konaté F.",
            rating: 4,
            comment: "Satisfait du diagnostic gratuit",
          },
        ],
      });
      console.log('✅ Avis par défaut insérés');
    }

  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation de la base de données:', error);
  } finally {
    await prisma.$disconnect();
  }
}

initializeDatabase();