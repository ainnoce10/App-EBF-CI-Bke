#!/usr/bin/env node

require('dotenv').config();
const { createStorageService } = require('./src/lib/storage.ts');

async function testStorage() {
  console.log('🧪 Test du service de stockage Supabase\n');
  
  try {
    console.log('1. 📦 Création du service de stockage...');
    const storageService = createStorageService();
    
    console.log('2. 🪣 Initialisation du bucket...');
    await storageService.initializeBucket();
    
    console.log('3. 📋 Liste des fichiers existants...');
    const files = await storageService.listFiles();
    console.log(`   📁 ${files.length} fichier(s) trouvé(s)`);
    
    console.log('4. ✅ Test de validation d\'image...');
    const mockImageFile = {
      name: 'test.jpg',
      size: 1024 * 1024, // 1MB
      type: 'image/jpeg'
    };
    
    const imageValidation = storageService.validateImage(mockImageFile);
    console.log(`   🖼️  Validation image: ${imageValidation.valid ? '✅ Succès' : '❌ Échec'}`);
    if (!imageValidation.valid) {
      console.log(`   ❌ Erreur: ${imageValidation.error}`);
    }
    
    console.log('5. ✅ Test de validation audio...');
    const mockAudioFile = {
      name: 'test.mp3',
      size: 5 * 1024 * 1024, // 5MB
      type: 'audio/mpeg'
    };
    
    const audioValidation = storageService.validateAudio(mockAudioFile);
    console.log(`   🎵 Validation audio: ${audioValidation.valid ? '✅ Succès' : '❌ Échec'}`);
    if (!audioValidation.valid) {
      console.log(`   ❌ Erreur: ${audioValidation.error}`);
    }
    
    console.log('\n🎉 Tous les tests de stockage sont passés avec succès!');
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
    console.error('📝 Détails de l\'erreur:', error);
    
    if (error.message.includes('Les variables d\'environnement Supabase ne sont pas configurées')) {
      console.log('\n💡 Solution:');
      console.log('   1. Vérifiez que NEXT_PUBLIC_SUPABASE_URL est configuré');
      console.log('   2. Vérifiez que SUPABASE_SERVICE_ROLE_KEY est configuré');
      console.log('   3. Redémarrez le serveur après avoir modifié les variables');
    }
  }
}

testStorage();