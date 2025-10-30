#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const { PrismaClient } = require('@prisma/client');

async function testSupabase() {
  console.log('🔍 Test de configuration Supabase...');
  
  // Vérifier les variables d'environnement
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!supabaseUrl || !supabaseKey || !databaseUrl) {
    console.error('❌ Variables d\'environnement manquantes');
    console.log('💡 Assurez-vous d\'avoir configuré :');
    console.log('   - NEXT_PUBLIC_SUPABASE_URL');
    console.log('   - SUPABASE_SERVICE_ROLE_KEY');
    console.log('   - DATABASE_URL');
    process.exit(1);
  }
  
  try {
    // Test 1: Connexion à la base de données
    console.log('📊 Test 1: Connexion à la base de données...');
    const prisma = new PrismaClient();
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Connexion à la base de données réussie !');
    
    // Test 2: Connexion à Supabase Storage
    console.log('📁 Test 2: Connexion à Supabase Storage...');
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Test 3: Création du bucket
    console.log('🪣 Test 3: Création du bucket de stockage...');
    try {
      const { data: buckets, error } = await supabase.storage.getBucket('ebf-bouake');
      
      if (error && error.message.includes('Not found')) {
        console.log('📦 Création du bucket ebf-bouake...');
        const { data, error: createError } = await supabase.storage.createBucket('ebf-bouake', {
          public: true,
          fileSizeLimit: 52428800, // 50MB
          allowedMimeTypes: [
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp',
            'audio/mpeg',
            'audio/wav',
            'audio/ogg',
            'audio/mp4',
            'audio/webm'
          ]
        });
        
        if (createError) {
          throw createError;
        }
        
        console.log('✅ Bucket créé avec succès !');
      } else {
        console.log('✅ Bucket existant trouvé !');
      }
    } catch (error) {
      console.error('❌ Erreur lors de la création du bucket:', error.message);
      throw error;
    }
    
    // Test 4: Upload d'un fichier test
    console.log('📤 Test 4: Upload d\'un fichier test...');
    const testBuffer = Buffer.from('Test file content', 'utf-8');
    
    const { data, error } = await supabase.storage
      .from('ebf-bouake')
      .upload('test/test-file.txt', testBuffer, {
        contentType: 'text/plain',
        upsert: true
      });
    
    if (error) {
      console.error('❌ Erreur lors de l\'upload:', error.message);
      throw error;
    }
    
    console.log('✅ Fichier uploadé avec succès !');
    
    // Test 5: Obtenir l'URL publique
    console.log('🔗 Test 5: Obtention de l\'URL publique...');
    const { data: publicUrlData } = supabase.storage
      .from('ebf-bouake')
      .getPublicUrl(data.path);
    
    console.log('✅ URL publique obtenue :', publicUrlData.publicUrl);
    
    // Test 6: Nettoyage
    console.log('🧹 Test 6: Nettoyage...');
    const { error: deleteError } = await supabase.storage
      .from('ebf-bouake')
      .remove([data.path]);
    
    if (deleteError) {
      console.error('❌ Erreur lors du nettoyage:', deleteError.message);
      throw deleteError;
    }
    
    console.log('✅ Nettoyage réussi !');
    
    // Test 7: Test de création de client
    console.log('👤 Test 7: Création d\'un client test...');
    const testCustomer = await prisma.customer.create({
      data: {
        name: 'Test Supabase',
        phone: '+225 11 11 11 11',
        city: 'Bouaké'
      }
    });
    
    console.log('✅ Client test créé ! ID:', testCustomer.id);
    
    // Nettoyage final
    await prisma.customer.delete({
      where: { id: testCustomer.id }
    });
    
    console.log('✅ Client test supprimé !');
    
    console.log('🎉 Tous les tests Supabase ont réussi !');
    console.log('🚀 Votre projet est prêt à être déployé !');
    
  } catch (error) {
    console.error('❌ Erreur lors des tests:', error.message);
    console.error('💡 Vérifiez votre configuration Supabase');
    process.exit(1);
  } finally {
    const prisma = new PrismaClient();
    await prisma.$disconnect();
  }
}

testSupabase();