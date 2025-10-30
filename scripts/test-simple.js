#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

async function testSimple() {
  console.log('🔍 Test simple de connexion à la base de données...');
  
  try {
    const prisma = new PrismaClient();
    
    // Test de connexion simple
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Connexion à la base de données réussie !');
    
    await prisma.$disconnect();
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Erreur de connexion:', error.message);
    console.error('Détails:', error);
    process.exit(1);
  }
}

testSimple();