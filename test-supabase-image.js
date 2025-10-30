#!/usr/bin/env node

const https = require('https');

console.log('🧪 Test d\'upload avec image Supabase\n');

// Test d'upload d'image (type MIME supporté)
const testImageUpload = () => {
  return new Promise((resolve, reject) => {
    // Créer un petit fichier image factice (1x1 pixel PNG)
    const imageBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAI9jU/7rgAAAABJRU5ErkJggg==', 'base64');
    const boundary = '----WebKitFormBoundary' + Math.random().toString(16).substring(2);
    
    let formData = `--${boundary}\r\n`;
    formData += 'Content-Disposition: form-data; name="file"; filename="test.png"\r\n';
    formData += 'Content-Type: image/png\r\n\r\n';
    
    const options = {
      hostname: 'ekohrrzklzrjwjgistnk.supabase.co',
      port: 443,
      path: '/storage/v1/object/ebf-bouake/test-image.png',
      method: 'POST',
      headers: {
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVrb2hycnprbHpyandqZ2lzdG5rIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTc3MjA4MiwiZXhwIjoyMDc3MzQ4MDgyfQ.X3bWc6aFGHG9eGn23kl4qseKQnMRT1hYAp4ZD7JBMMY',
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVrb2hycnprbHpyandqZ2lzdG5rIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTc3MjA4MiwiZXhwIjoyMDc3MzQ4MDgyfQ.X3bWc6aFGHG9eGn23kl4qseKQnMRT1hYAp4ZD7JBMMY'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          resolve({
            status: res.statusCode,
            response: response
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            response: data
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    // Envoyer l'image directement comme body
    req.write(imageBuffer);
    req.end();
  });
};

async function runTest() {
  try {
    console.log('1. 🖼️ Test d\'upload d\'image PNG...');
    const uploadTest = await testImageUpload();
    console.log(`   Status: ${uploadTest.status}`);
    console.log(`   Réponse:`, JSON.stringify(uploadTest.response, null, 2));
    
    if (uploadTest.status === 200) {
      console.log('\n✅ Upload d\'image réussi !');
      console.log('🔍 Le problème dans votre application est probablement :');
      console.log('   1. Le type MIME est mal détecté');
      console.log('   2. Le fichier est corrompu ou invalide');
      console.log('   3. La logique de validation échoue');
    } else {
      console.log('\n❌ Upload d\'image échoué aussi.');
      console.log('🔍 Le problème est plus profond dans la configuration Supabase.');
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
  }
}

runTest();