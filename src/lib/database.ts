import { PrismaClient } from '@prisma/client';
import { promises as fs } from 'fs';
import path from 'path';

// Charger les variables d'environnement depuis .env si nécessaire
if (typeof process !== 'undefined' && !process.env.DATABASE_URL) {
  try {
    const fsSync = require('fs');
    const envPath = path.join(process.cwd(), '.env');
    if (fsSync.existsSync(envPath)) {
      const envContent = fsSync.readFileSync(envPath, 'utf8');
      envContent.split('\n').forEach((line: string) => {
        const trimmedLine = line.trim();
        if (trimmedLine && !trimmedLine.startsWith('#')) {
          const match = trimmedLine.match(/^([^=]+)=(.*)$/);
          if (match) {
            const key = match[1].trim();
            const value = match[2].trim().replace(/^["']|["']$/g, '');
            if (!process.env[key]) {
              process.env[key] = value;
            }
          }
        }
      });
      console.log('✅ Variables d\'environnement chargées depuis .env');
    }
  } catch (error) {
    console.error('Erreur lors du chargement du fichier .env:', error);
  }
}

// Singleton pattern pour Prisma Client
let prisma: PrismaClient;

/**
 * Initialise la base de données SQLite pour Vercel
 */
async function initializeDatabaseForVercel() {
  try {
    // Toujours initialiser, pas seulement sur Vercel
    const dbUrl = process.env.DATABASE_URL;
    console.log('🔍 Initialisation de la base de données...', dbUrl ? 'URL configurée' : 'URL non configurée');
    
    if (dbUrl && dbUrl.startsWith('file:')) {
      // Extraire le chemin du fichier
      const dbPath = dbUrl.replace('file:', '').replace(/^\.\//, '');
      const fullPath = path.isAbsolute(dbPath) 
        ? dbPath 
        : path.join(process.cwd(), dbPath);
      
      // Créer le répertoire parent s'il n'existe pas
      const dbDir = path.dirname(fullPath);
      try {
        await fs.access(dbDir);
      } catch {
        await fs.mkdir(dbDir, { recursive: true });
        console.log('📁 Répertoire de base de données créé:', dbDir);
      }
      
      // Vérifier si le fichier existe
      try {
        await fs.access(fullPath);
        console.log('✅ Fichier de base de données trouvé:', fullPath);
      } catch {
        console.log('📝 Le fichier de base de données n\'existe pas, il sera créé automatiquement:', fullPath);
      }
    } else if (process.env.VERCEL) {
      console.log('🔄 Détection de l\'environnement Vercel, initialisation de la base de données...');
      
      // Créer le répertoire de la base de données s'il n'existe pas
      const dbDir = path.join(process.cwd(), 'db');
      try {
        await fs.access(dbDir);
      } catch {
        await fs.mkdir(dbDir, { recursive: true });
        console.log('📁 Répertoire de base de données créé:', dbDir);
      }
      
      // Vérifier si le fichier de base de données existe
      const dbPath = path.join(dbDir, 'custom.db');
      try {
        await fs.access(dbPath);
        console.log('✅ Fichier de base de données trouvé:', dbPath);
      } catch {
        console.log('📝 Le fichier de base de données n\'existe pas, il sera créé automatiquement');
      }
    }
  } catch (error) {
    console.error('Erreur lors de l\'initialisation de la base de données:', error);
  }
}

// Initialiser la base de données (appelée de manière asynchrone)
initializeDatabaseForVercel().catch(console.error);

// En développement, éviter les multiples instances
const globalWithPrisma = global as typeof globalThis & {
  prisma: PrismaClient;
};

if (!globalWithPrisma.prisma) {
  console.log('🔧 Initialisation du client Prisma...');
  globalWithPrisma.prisma = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });
}

prisma = globalWithPrisma.prisma;

// Tester la connexion au démarrage
prisma.$connect()
  .then(() => {
    console.log('✅ Connexion à la base de données établie');
  })
  .catch((error) => {
    console.error('❌ Erreur lors de la connexion à la base de données:', error);
  });

export class DatabaseService {
  /**
   * Vérifie la connexion à la base de données
   */
  async checkConnection(): Promise<boolean> {
    try {
      // Essayer une requête simple pour vérifier la connexion
      await prisma.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      console.error('Erreur de connexion à la base de données:', error);
      // Si la connexion échoue, essayer de se reconnecter
      try {
        await prisma.$connect();
        return true;
      } catch (connectError) {
        console.error('Impossible de se reconnecter à la base de données:', connectError);
        return false;
      }
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
      // Prisma convertit les noms de modèles en camelCase
      // Customer -> customer, Request -> request, etc.
      const modelName = model.charAt(0).toLowerCase() + model.slice(1);
      console.log(`🔍 Tentative de création dans ${modelName} (modèle: ${model}) avec les données:`, JSON.stringify(data, null, 2));
      
      // Vérifier que le modèle existe
      if (!(prisma as any)[modelName]) {
        console.error(`❌ Le modèle ${modelName} n'existe pas dans Prisma Client`);
        return { 
          error: `Le modèle ${modelName} n'existe pas. Modèles disponibles: ${Object.keys(prisma).filter(k => !k.startsWith('$') && !k.startsWith('_')).join(', ')}`
        };
      }
      
      const result = await (prisma as any)[modelName].create({ data });
      console.log(`✅ Création réussie dans ${modelName}:`, result?.id);
      return { data: result };
    } catch (error) {
      console.error(`❌ Erreur lors de la création dans ${model}:`, error);
      console.error(`📋 Données envoyées:`, JSON.stringify(data, null, 2));
      
      // Gérer les erreurs spécifiques
      if (error instanceof Error) {
        const errorMessage = error.message;
        console.error(`📝 Message d'erreur complet:`, errorMessage);
        
        if (errorMessage.includes('Unable to open the database file') || errorMessage.includes('Can\'t reach database server')) {
          return { 
            error: `Base de données inaccessible. Veuillez réessayer plus tard.`
          };
        }
        if (errorMessage.includes('no such table') || errorMessage.includes('relation') && errorMessage.includes('does not exist')) {
          return { 
            error: `La table ${model} n'existe pas. Veuillez exécuter les migrations de base de données.`
          };
        }
        if (errorMessage.includes('UNIQUE constraint failed') || errorMessage.includes('Unique constraint') || errorMessage.includes('duplicate key')) {
          return { 
            error: `Un enregistrement avec ces informations existe déjà (probablement le numéro de téléphone).`
          };
        }
        if (errorMessage.includes('null value') || errorMessage.includes('NOT NULL constraint')) {
          return { 
            error: `Des champs obligatoires sont manquants.`
          };
        }
        if (errorMessage.includes('P2002')) {
          return { 
            error: `Un enregistrement avec ces informations existe déjà.`
          };
        }
        if (errorMessage.includes('P2003')) {
          return { 
            error: `Référence invalide dans la base de données.`
          };
        }
        
        // Retourner le message d'erreur original pour le débogage
        return { 
          error: `Impossible de créer l'enregistrement dans ${model}: ${errorMessage}`
        };
      }
      
      return { 
        error: `Impossible de créer l'enregistrement dans ${model}: Erreur inconnue`
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
      const modelName = model.charAt(0).toLowerCase() + model.slice(1);
      const result = await (prisma as any)[modelName].findMany(options);
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
      const modelName = model.charAt(0).toLowerCase() + model.slice(1);
      const result = await (prisma as any)[modelName].findUnique(options);
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
      const modelName = model.charAt(0).toLowerCase() + model.slice(1);
      const result = await (prisma as any)[modelName].update(options);
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
      const modelName = model.charAt(0).toLowerCase() + model.slice(1);
      const result = await (prisma as any)[modelName].delete(options);
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