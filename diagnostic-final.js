#!/usr/bin/env node

const http = require('http');

console.log('🎯 Diagnostic Final - EBF Bouaké\n');

async function diagnosticComplet() {
  console.log('1. 🔍 Vérification de l\'état du système...\n');
  
  try {
    // Test de santé de l'API
    console.log('2. 📡 Test de santé de l\'API...');
    const healthResponse = await fetchAPI('/api/health');
    if (healthResponse.status === 200) {
      console.log('   ✅ API en ligne et fonctionnelle');
    } else {
      console.log('   ❌ API hors ligne ou en erreur');
      return;
    }
    
    // Test de la base de données
    console.log('3. 🗄️ Test de la base de données...');
    const dbTest = await testDatabase();
    console.log(`   ${dbTest.success ? '✅' : '❌'} Base de données: ${dbTest.message}`);
    
    // Test du service de stockage
    console.log('4. ☁️ Test du service de stockage...');
    const storageTest = await testStorage();
    console.log(`   ${storageTest.success ? '✅' : '❌'} Stockage: ${storageTest.message}`);
    
    // Test du formulaire de demande
    console.log('5. 📝 Test du formulaire de demande...');
    const formTest = await testForm();
    console.log(`   ${formTest.success ? '✅' : '❌'} Formulaire: ${formTest.message}`);
    
    // Test des messages
    console.log('6. 💬 Test du système de messages...');
    const messageTest = await testMessages();
    console.log(`   ${messageTest.success ? '✅' : '❌'} Messages: ${messageTest.message}`);
    
    console.log('\n🎉 RÉSULTATS DU DIAGNOSTIC:');
    console.log('═'.repeat(50));
    
    const tests = [
      { name: 'API Health', status: healthResponse.status === 200 },
      { name: 'Base de données', status: dbTest.success },
      { name: 'Service de stockage', status: storageTest.success },
      { name: 'Formulaire de demande', status: formTest.success },
      { name: 'Système de messages', status: messageTest.success }
    ];
    
    const successCount = tests.filter(test => test.status).length;
    const totalCount = tests.length;
    
    tests.forEach(test => {
      const status = test.status ? '✅' : '❌';
      console.log(`${status} ${test.name}`);
    });
    
    console.log('\n📊 Synthèse:');
    console.log(`   Tests réussis: ${successCount}/${totalCount}`);
    console.log(`   Taux de réussite: ${Math.round((successCount / totalCount) * 100)}%`);
    
    if (successCount === totalCount) {
      console.log('\n🚀 L\'application est prête pour la production!');
      console.log('\n📝 Prochaines étapes:');
      console.log('   1. Configurez les variables Supabase réelles pour le stockage en production');
      console.log('   2. Déployez sur Vercel');
      console.log('   3. Testez le formulaire en ligne');
      console.log('   4. Configurez les notifications email');
    } else {
      console.log('\n⚠️ Certains composants nécessitent une attention:');
      console.log('   - Vérifiez les erreurs ci-dessus');
      console.log('   - Consultez les logs du serveur');
      console.log('   - Redémarrez le service si nécessaire');
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du diagnostic:', error.message);
    console.log('💡 Assurez-vous que le serveur est démarré avec `npm run dev`');
  }
}

function fetchAPI(path) {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: 'GET'
    }, (res) => {
      resolve({ status: res.statusCode });
    });
    
    req.on('error', reject);
    req.end();
  });
}

async function testDatabase() {
  try {
    const response = await postAPI('/api/requests', {
      name: 'Test DB',
      phone: '+22500000000',
      inputType: 'text',
      description: 'Test de base de données',
      authorized: true
    });
    
    return { success: response.success, message: 'Fonctionnelle' };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

async function testStorage() {
  try {
    // Créer un test avec image factice
    const boundary = '----TestBoundary';
    let formData = `--${boundary}\r\n`;
    formData += 'Content-Disposition: form-data; name="name"\r\n\r\n';
    formData += 'Test Storage\r\n';
    formData += `--${boundary}\r\n`;
    formData += 'Content-Disposition: form-data; name="phone"\r\n\r\n';
    formData += '+22511111111\r\n';
    formData += `--${boundary}\r\n`;
    formData += 'Content-Disposition: form-data; name="inputType"\r\n\r\n';
    formData += 'text\r\n';
    formData += `--${boundary}\r\n`;
    formData += 'Content-Disposition: form-data; name="description"\r\n\r\n';
    formData += 'Test de stockage\r\n';
    formData += `--${boundary}\r\n`;
    formData += 'Content-Disposition: form-data; name="authorized"\r\n\r\n';
    formData += 'true\r\n';
    formData += `--${boundary}\r\n`;
    formData += 'Content-Disposition: form-data; name="photo"; filename="test.png"\r\n';
    formData += 'Content-Type: image/png\r\n\r\n';
    
    const imageBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAI9jU/7rgAAAABJRU5ErkJggg==', 'base64');
    
    const formDataHeader = Buffer.from(formData);
    const formDataFooter = Buffer.from(`\r\n--${boundary}--\r\n`);
    
    const response = await postMultiPartAPI('/api/requests', {
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': formDataHeader.length + imageBuffer.length + formDataFooter.length
      },
      data: [formDataHeader, imageBuffer, formDataFooter]
    });
    
    return { success: response.success, message: 'Fonctionnel (mode mock)' };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

async function testForm() {
  try {
    const response = await postAPI('/api/requests', {
      name: 'Client Formulaire',
      phone: '+22522222222',
      neighborhood: 'Quartier Test',
      inputType: 'text',
      description: 'Test complet du formulaire',
      authorized: true
    });
    
    return { success: response.success, message: 'Fonctionnel' };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

async function testMessages() {
  try {
    const response = await postAPI('/api/messages', {
      senderName: 'Test Messages',
      senderPhone: '+22533333333',
      subject: 'Test du système',
      content: 'Message de test',
      type: 'CONTACT'
    });
    
    return { success: response.success, message: 'Fonctionnel' };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

function postAPI(path, data) {
  return new Promise((resolve, reject) => {
    const formData = new URLSearchParams();
    Object.keys(data).forEach(key => {
      formData.append(key, data[key]);
    });

    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(formData.toString())
      }
    }, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(responseData);
          resolve(response);
        } catch (e) {
          reject(e);
        }
      });
    });
    
    req.on('error', reject);
    req.write(formData.toString());
    req.end();
  });
}

function postMultiPartAPI(path, options) {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: 'POST',
      headers: options.headers
    }, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(responseData);
          resolve(response);
        } catch (e) {
          reject(e);
        }
      });
    });
    
    req.on('error', reject);
    
    // Écrire les données multipart
    options.data.forEach(chunk => {
      req.write(chunk);
    });
    
    req.end();
  });
}

// Exécuter le diagnostic
diagnosticComplet();