import { PrismaClient } from '@prisma/client';

// Singleton pattern pour Prisma Client
let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  // En développement, éviter les multiples instances
  const globalWithPrisma = global as typeof globalThis & {
    prisma: PrismaClient;
  };
  if (!globalWithPrisma.prisma) {
    globalWithPrisma.prisma = new PrismaClient();
  }
  prisma = globalWithPrisma.prisma;
}

export class DatabaseService {
  /**
   * Vérifie la connexion à la base de données
   */
  async checkConnection(): Promise<boolean> {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      console.error('Erreur de connexion à la base de données:', error);
      return false;
    }
  }

  /**
   * Exécute une opération avec gestion d'erreurs et fallback
   */
  async withFallback<T>(
    operation: () => Promise<T>,
    fallbackData: T,
    errorMessage: string = 'Erreur de base de données'
  ): Promise<{ data: T; error?: string }> {
    try {
      const data = await operation();
      return { data };
    } catch (error) {
      console.error(`${errorMessage}:`, error);
      return { 
        data: fallbackData,
        error: errorMessage
      };
    }
  }

  /**
   * Crée un client avec gestion d'erreurs
   */
  async safeCreate<T>(
    model: string,
    data: any
  ): Promise<{ data?: T; error?: string }> {
    try {
      const result = await (prisma as any)[model].create({ data });
      return { data: result };
    } catch (error) {
      console.error(`Erreur lors de la création dans ${model}:`, error);
      return { 
        error: `Impossible de créer l'enregistrement dans ${model}`
      };
    }
  }

  /**
   * Trouve des enregistrements avec gestion d'erreurs
   */
  async safeFindMany<T>(
    model: string,
    options: any = {}
  ): Promise<{ data: T[]; error?: string }> {
    try {
      const result = await (prisma as any)[model].findMany(options);
      return { data: result };
    } catch (error) {
      console.error(`Erreur lors de la recherche dans ${model}:`, error);
      return { 
        data: [],
        error: `Impossible de récupérer les données de ${model}`
      };
    }
  }

  /**
   * Trouve un enregistrement unique avec gestion d'erreurs
   */
  async safeFindUnique<T>(
    model: string,
    options: any
  ): Promise<{ data?: T; error?: string }> {
    try {
      const result = await (prisma as any)[model].findUnique(options);
      return { data: result };
    } catch (error) {
      console.error(`Erreur lors de la recherche unique dans ${model}:`, error);
      return { 
        error: `Impossible de récupérer l'enregistrement de ${model}`
      };
    }
  }

  /**
   * Met à jour un enregistrement avec gestion d'erreurs
   */
  async safeUpdate<T>(
    model: string,
    options: any
  ): Promise<{ data?: T; error?: string }> {
    try {
      const result = await (prisma as any)[model].update(options);
      return { data: result };
    } catch (error) {
      console.error(`Erreur lors de la mise à jour dans ${model}:`, error);
      return { 
        error: `Impossible de mettre à jour l'enregistrement dans ${model}`
      };
    }
  }

  /**
   * Supprime un enregistrement avec gestion d'erreurs
   */
  async safeDelete<T>(
    model: string,
    options: any
  ): Promise<{ data?: T; error?: string }> {
    try {
      const result = await (prisma as any)[model].delete(options);
      return { data: result };
    } catch (error) {
      console.error(`Erreur lors de la suppression dans ${model}:`, error);
      return { 
        error: `Impossible de supprimer l'enregistrement dans ${model}`
      };
    }
  }
}

// Exporter les services
export const db = prisma;
export const databaseService = new DatabaseService();