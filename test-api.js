#!/usr/bin/env node

const http = require('http');
const fs = require('fs');

console.log('🧪 Test de l\'API de demande\n');

// Test data
const testData = {
  name: 'Test Client',
  phone: '+22512345678',
  neighborhood: 'Quartier Test',
  inputType: 'text',
  description: 'Ceci est un test de la demande API',
  authorized: true
};

// Create form data
const formData = new URLSearchParams();
Object.keys(testData).forEach(key => {
  formData.append(key, testData[key]);
});

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
  console.log(`📡 Status: ${res.statusCode}`);
  console.log(`📋 Headers: ${JSON.stringify(res.headers, null, 2)}`);
  
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      console.log('✅ Réponse reçue:');
      console.log(JSON.stringify(response, null, 2));
      
      if (response.success) {
        console.log('\n🎉 Test réussi! La demande a été créée avec succès.');
      } else {
        console.log('\n❌ Test échoué:', response.error);
      }
    } catch (e) {
      console.log('❌ Erreur de parsing JSON:', e.message);
      console.log('📝 Réponse brute:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Erreur de requête:', error.message);
  console.log('💡 Le serveur est-il démarré? Exécutez `npm run dev` pour démarrer le serveur.');
});

req.write(formData.toString());
req.end();

console.log('📤 Envoi de la demande de test...');