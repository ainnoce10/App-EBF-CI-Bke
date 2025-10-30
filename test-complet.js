#!/usr/bin/env node

const http = require('http');
const fs = require('fs');
const path = require('path');

console.log('🧪 Test complet de l\'application EBF Bouaké\n');

// Test 1: Test de base de l'API
async function testBasicAPI() {
  console.log('1. 📡 Test de base de l\'API...');
  
  return new Promise((resolve, reject) => {
    const formData = new URLSearchParams();
    formData.append('name', 'Client Test');
    formData.append('phone', '+22598765432');
    formData.append('neighborhood', 'Quartier Test');
    formData.append('inputType', 'text');
    formData.append('description', 'Test de description du problème électrique');
    formData.append('authorized', 'true');

    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/requests',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(formData.toString())
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (response.success) {
            console.log('   ✅ Test de base réussi');
            resolve(response);
          } else {
            console.log('   ❌ Test de base échoué:', response.error);
            reject(new Error(response.error));
          }
        } catch (e) {
          console.log('   ❌ Erreur de parsing:', e.message);
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.write(formData.toString());
    req.end();
  });
}

// Test 2: Test avec image (simulé)
async function testWithImage() {
  console.log('2. 📷 Test avec image...');
  
  return new Promise((resolve, reject) => {
    // Créer un petit buffer d'image factice
    const imageBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAI9jU/7rgAAAABJRU5ErkJggg==', 'base64');
    
    const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
    let formData = `--${boundary}\r\n`;
    formData += 'Content-Disposition: form-data; name="name"\r\n\r\n';
    formData += 'Client avec Image\r\n';
    formData += `--${boundary}\r\n`;
    formData += 'Content-Disposition: form-data; name="phone"\r\n\r\n';
    formData += '+22511223344\r\n';
    formData += `--${boundary}\r\n`;
    formData += 'Content-Disposition: form-data; name="inputType"\r\n\r\n';
    formData += 'text\r\n';
    formData += `--${boundary}\r\n`;
    formData += 'Content-Disposition: form-data; name="description"\r\n\r\n';
    formData += 'Test avec image jointe\r\n';
    formData += `--${boundary}\r\n`;
    formData += 'Content-Disposition: form-data; name="authorized"\r\n\r\n';
    formData += 'true\r\n';
    formData += `--${boundary}\r\n`;
    formData += 'Content-Disposition: form-data; name="photo"; filename="test.png"\r\n';
    formData += 'Content-Type: image/png\r\n\r\n';
    
    const formDataHeader = Buffer.from(formData);
    const formDataFooter = Buffer.from(`\r\n--${boundary}--\r\n`);
    
    const totalLength = formDataHeader.length + imageBuffer.length + formDataFooter.length;

    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/requests',
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': totalLength
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (response.success) {
            console.log('   ✅ Test avec image réussi');
            resolve(response);
          } else {
            console.log('   ❌ Test avec image échoué:', response.error);
            console.log('   📝 Réponse complète:', JSON.stringify(response, null, 2));
            reject(new Error(response.error));
          }
        } catch (e) {
          console.log('   ❌ Erreur de parsing:', e.message);
          console.log('   📝 Réponse brute:', data);
          reject(e);
        }
      });
    });

    req.on('error', reject);
    
    // Écrire les données multipart
    req.write(formDataHeader);
    req.write(imageBuffer);
    req.write(formDataFooter);
    req.end();
  });
}

// Test 3: Test de validation des erreurs
async function testErrorValidation() {
  console.log('3. ❌ Test de validation des erreurs...');
  
  return new Promise((resolve, reject) => {
    const formData = new URLSearchParams();
    // Données invalides (manque le nom)
    formData.append('phone', '+22555555555');
    formData.append('inputType', 'text');

    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/requests',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(formData.toString())
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (!response.success && response.error) {
            console.log('   ✅ Validation d\'erreur réussie:', response.error);
            resolve(response);
          } else {
            console.log('   ❌ La validation d\'erreur a échoué');
            reject(new Error('La validation d\'erreur a échoué'));
          }
        } catch (e) {
          console.log('   ❌ Erreur de parsing:', e.message);
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.write(formData.toString());
    req.end();
  });
}

// Fonction principale
async function runAllTests() {
  try {
    console.log('🚀 Démarrage des tests...\n');
    
    // Test 1: API de base
    await testBasicAPI();
    
    // Test 2: Avec image
    await testWithImage();
    
    // Test 3: Validation d'erreur
    await testErrorValidation();
    
    console.log('\n🎉 Tous les tests sont passés avec succès!');
    console.log('\n📋 Résumé:');
    console.log('   ✅ API de base fonctionnelle');
    console.log('   ✅ Upload d\'images fonctionnel');
    console.log('   ✅ Validation des erreurs fonctionnelle');
    console.log('\n💡 L\'application est prête à être utilisée!');
    
  } catch (error) {
    console.error('\n❌ Un test a échoué:', error.message);
    console.log('\n🔍 Dépannage:');
    console.log('   1. Vérifiez que le serveur est démarré (npm run dev)');
    console.log('   2. Vérifiez les variables d\'environnement');
    console.log('   3. Vérifiez la connexion à la base de données');
    console.log('   4. Vérifiez la configuration Supabase');
  }
}

// Exécuter les tests
runAllTests();