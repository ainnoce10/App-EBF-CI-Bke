#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

async function testStorage() {
  console.log('🔍 Test du stockage Supabase...');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Variables d\'environnement manquantes');
    process.exit(1);
  }
  
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Test 1: Lister les buckets existants
    console.log('📦 Test 1: Liste des buckets...');
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('❌ Erreur lors de la liste des buckets:', bucketsError.message);
    } else {
      console.log('✅ Buckets existants:', buckets);
    }
    
    // Test 2: Créer le bucket ebf-bouake
    console.log('🪣 Test 2: Création du bucket ebf-bouake...');
    const { data: newBucket, error: createError } = await supabase.storage.createBucket('ebf-bouake', {
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
      if (createError.message.includes('already exists')) {
        console.log('✅ Bucket ebf-bouake existe déjà');
      } else {
        console.error('❌ Erreur lors de la création du bucket:', createError.message);
      }
    } else {
      console.log('✅ Bucket ebf-bouake créé avec succès !');
    }
    
    // Test 3: Upload d'un fichier test
    console.log('📤 Test 3: Upload d\'un fichier test...');
    const testBuffer = Buffer.from('Test file content - EBF Bouaké', 'utf-8');
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('ebf-bouake')
      .upload('test/test-ebf-bouake.jpg', testBuffer, {
        contentType: 'image/jpeg',
        upsert: true
      });
    
    if (uploadError) {
      console.error('❌ Erreur lors de l\'upload:', uploadError.message);
    } else {
      console.log('✅ Fichier uploadé avec succès !');
      console.log('📁 Chemin:', uploadData.path);
      
      // Test 4: Obtenir l'URL publique
      console.log('🔗 Test 4: Obtention de l\'URL publique...');
      const { data: publicUrlData } = supabase.storage
        .from('ebf-bouake')
        .getPublicUrl(uploadData.path);
      
      console.log('✅ URL publique:', publicUrlData.publicUrl);
      
      // Test 5: Nettoyage
      console.log('🧹 Test 5: Nettoyage...');
      const { error: deleteError } = await supabase.storage
        .from('ebf-bouake')
        .remove([uploadData.path]);
      
      if (deleteError) {
        console.error('❌ Erreur lors du nettoyage:', deleteError.message);
      } else {
        console.log('✅ Nettoyage réussi !');
      }
    }
    
    console.log('🎉 Tests de stockage terminés avec succès !');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Erreur lors des tests:', error.message);
    process.exit(1);
  }
}

testStorage();