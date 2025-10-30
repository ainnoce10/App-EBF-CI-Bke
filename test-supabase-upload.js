#!/usr/bin/env node

const https = require('https');
const fs = require('fs');

console.log('🧪 Test d\'upload Supabase\n');

// Test d'upload de fichier
const testUpload = () => {
  return new Promise((resolve, reject) => {
    // Créer un petit fichier test
    const testContent = 'Ceci est un test de fichier';
    const boundary = '----WebKitFormBoundary' + Math.random().toString(16).substring(2);
    
    let formData = `--${boundary}\r\n`;
    formData += 'Content-Disposition: form-data; name="file"; filename="test.txt"\r\n';
    formData += 'Content-Type: text/plain\r\n\r\n';
    formData += testContent + '\r\n';
    formData += `--${boundary}--\r\n`;
    
    const options = {
      hostname: 'ekohrrzklzrjwjgistnk.supabase.co',
      port: 443,
      path: '/storage/v1/object/ebf-bouake/test-upload.txt',
      method: 'POST',
      headers: {
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVrb2hycnprbHpyandqZ2lzdG5rIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTc3MjA4MiwiZXhwIjoyMDc3MzQ4MDgyfQ.X3bWc6aFGHG9eGn23kl4qseKQnMRT1hYAp4ZD7JBMMY',
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVrb2hycnprbHpyandqZ2lzdG5rIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTc3MjA4MiwiZXhwIjoyMDc3MzQ4MDgyfQ.X3bWc6aFGHG9eGn23kl4qseKQnMRT1hYAp4ZD7JBMMY',
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': Buffer.byteLength(formData)
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

    req.write(formData);
    req.end();
  });
};

async function runTest() {
  try {
    console.log('1. 📤 Test d\'upload de fichier...');
    const uploadTest = await testUpload();
    console.log(`   Status: ${uploadTest.status}`);
    console.log(`   Réponse:`, JSON.stringify(uploadTest.response, null, 2));
    
    if (uploadTest.status === 200) {
      console.log('\n✅ Upload réussi ! Le problème n\'est pas Supabase.');
      console.log('🔍 Le problème est probablement dans le code de l\'application.');
    } else {
      console.log('\n❌ Upload échoué. Le problème est bien Supabase.');
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
  }
}

runTest();