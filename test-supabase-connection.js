import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ekohrrzklzrjwjgistnk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVrb2hycnprbHpyandqZ2lzdG5rIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTc3MjA4MiwiZXhwIjoyMDc3MzQ4MDgyfQ.X3bWc6aFGHG9eGn23kl4qseKQnMRT1hYAp4ZD7JBMMY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSupabase() {
  try {
    console.log('1. Test de connexion à Supabase...');
    
    // Test 1: Lister les buckets
    console.log('2. Test des buckets...');
    const { data: buckets, error: bucketsError } = await supabase.storage.getBucket('ebf-bouake');
    
    if (bucketsError) {
      console.log('❌ Erreur bucket:', bucketsError);
      
      // Essayer de créer le bucket
      console.log('3. Tentative de création du bucket...');
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
        console.log('❌ Erreur création bucket:', createError);
      } else {
        console.log('✅ Bucket créé avec succès!');
      }
    } else {
      console.log('✅ Bucket trouvé:', buckets);
    }
    
    // Test 2: Lister les fichiers
    console.log('4. Test de liste des fichiers...');
    const { data: files, error: filesError } = await supabase.storage.from('ebf-bouake').list();
    
    if (filesError) {
      console.log('❌ Erreur liste fichiers:', filesError);
    } else {
      console.log('✅ Fichiers trouvés:', files?.length || 0);
    }
    
    // Test 3: Upload d'un petit fichier
    console.log('5. Test d\'upload...');
    const testFile = new Blob(['test content'], { type: 'text/plain' });
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('ebf-bouake')
      .upload('test.txt', testFile);
    
    if (uploadError) {
      console.log('❌ Erreur upload:', uploadError);
    } else {
      console.log('✅ Upload réussi:', uploadData);
      
      // Nettoyer
      await supabase.storage.from('ebf-bouake').remove(['test.txt']);
    }
    
  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

testSupabase();