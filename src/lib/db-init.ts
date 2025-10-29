import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function initializeDatabase() {
  try {
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

    return true;
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation de la base de données:', error);
    return false;
  }
}

export { prisma };