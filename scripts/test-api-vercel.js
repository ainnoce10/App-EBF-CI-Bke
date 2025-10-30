const fetch = require('node-fetch');

async function testAPI() {
  console.log('🧪 Test de l\'API pour Vercel...');
  
  try {
    // Test de l'endpoint de santé
    console.log('1. Test de l\'endpoint /api/health...');
    const healthResponse = await fetch('http://localhost:3000/api/health');
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData);
    
    // Test de l'endpoint d'initialisation de la base de données
    console.log('2. Test de l\'endpoint /api/init-db...');
    const initResponse = await fetch('http://localhost:3000/api/init-db');
    const initData = await initResponse.json();
    console.log('✅ Init DB:', initData);
    
    // Test de création d'une demande
    console.log('3. Test de création d\'une demande...');
    
    // Créer un FormData
    const FormData = require('form-data');
    const form = new FormData();
    
    form.append('name', 'Client Vercel Test');
    form.append('phone', '+22599887766');
    form.append('neighborhood', 'Quartier Test');
    form.append('inputType', 'text');
    form.append('description', 'Test de création de client sur Vercel');
    
    const requestResponse = await fetch('http://localhost:3000/api/requests', {
      method: 'POST',
      body: form
    });
    
    const requestData = await requestResponse.json();
    console.log('✅ Création de demande:', requestData);
    
    if (requestData.success) {
      console.log('🎉 Tous les tests ont réussi ! L\'application est prête pour Vercel.');
    } else {
      console.log('❌ Échec du test de création:', requestData.error);
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
  }
}

testAPI();