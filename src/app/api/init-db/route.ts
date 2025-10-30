import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { promises as fs } from 'fs';
import path from 'path';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    console.log('🔄 Initialisation de la base de données...');
    
    // Créer le répertoire de la base de données s'il n'existe pas
    const dbDir = path.join(process.cwd(), 'db');
    try {
      await fs.access(dbDir);
    } catch {
      await fs.mkdir(dbDir, { recursive: true });
      console.log('📁 Répertoire de base de données créé:', dbDir);
    }
    
    // Vérifier si la base de données est accessible
    try {
      await prisma.$queryRaw`SELECT 1`;
      console.log('✅ Base de données accessible');
    } catch (error) {
      if (error instanceof Error && error.message.includes('Unable to open the database file')) {
        console.log('📝 La base de données n\'existe pas, tentative de création...');
        
        // La base de données sera créée automatiquement par Prisma lors de la première requête
        // Essayons de créer un client pour forcer la création
        try {
          await prisma.customer.create({
            data: {
              name: 'System Init',
              phone: '+22500000000',
              city: 'Bouaké'
            }
          });
          
          // Supprimer le client de test
          await prisma.customer.deleteMany({
            where: { phone: '+22500000000' }
          });
          
          console.log('✅ Base de données initialisée avec succès');
        } catch (createError) {
          console.error('Erreur lors de la création de la base de données:', createError);
          return NextResponse.json(
            { 
              error: 'Impossible d\'initialiser la base de données',
              details: createError instanceof Error ? createError.message : 'Erreur inconnue'
            },
            { status: 500 }
          );
        }
      } else {
        throw error;
      }
    }
    
    // Vérifier les tables
    const tables = await prisma.$queryRaw`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name NOT LIKE 'sqlite_%'
    `;
    
    console.log('📋 Tables trouvées:', tables);
    
    // Tester la création d'un client
    const testCustomer = await prisma.customer.create({
      data: {
        name: 'Test Init',
        phone: `+225${Date.now()}`,
        city: 'Bouaké'
      }
    });
    
    // Supprimer le client de test
    await prisma.customer.delete({
      where: { id: testCustomer.id }
    });
    
    console.log('✅ Test de création/suppression réussi');
    
    return NextResponse.json({
      success: true,
      message: 'Base de données initialisée avec succès',
      tables: tables,
      environment: {
        vercel: process.env.VERCEL || false,
        nodeEnv: process.env.NODE_ENV,
        databaseUrl: process.env.DATABASE_URL ? 'Configuré' : 'Non configuré'
      }
    });
    
  } catch (error) {
    console.error('Erreur lors de l\'initialisation de la base de données:', error);
    
    return NextResponse.json(
      { 
        error: 'Erreur lors de l\'initialisation de la base de données',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}