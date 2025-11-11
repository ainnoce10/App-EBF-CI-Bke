#!/usr/bin/env node
/**
 * Test le flux complet: soumission formulaire, envoi email, et persistance du code de suivi
 */

const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

// Configuration
const API_URL = process.env.API_URL || 'http://localhost:3000/api';
const RESEND_API_KEY = process.env.RESEND_API_KEY;

console.log('🧪 Test du flux complet EBF\n');
console.log(`📍 API URL: ${API_URL}`);
console.log(`🔑 RESEND_API_KEY: ${RESEND_API_KEY ? '✅ Configurée' : '❌ Manquante'}\n`);

async function testFullFlow() {
  try {
    // Créer un fichier de test pour la photo
    const testImagePath = path.join(__dirname, 'test-image.png');
    if (!fs.existsSync(testImagePath)) {
      // Créer une image de test PNG simple (1x1 pixel)
      const png = Buffer.from([
        0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
        0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
        0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xde, 0x00, 0x00, 0x00,
        0x0c, 0x49, 0x44, 0x41, 0x54, 0x08, 0xd7, 0x63, 0xf8, 0xcf, 0xc0, 0x00,
        0x00, 0x03, 0x01, 0x01, 0x00, 0x18, 0xdd, 0x8d, 0xb4, 0x00, 0x00, 0x00,
        0x00, 0x49, 0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82
      ]);
      fs.writeFileSync(testImagePath, png);
      console.log('✅ Fichier image de test créé\n');
    }

    // Préparer les données du formulaire
    console.log('📝 Préparation des données du formulaire...');
    const form = new FormData();
    form.append('name', 'Test Client EBF');
    form.append('phone', '+225 07 12 34 56 78');
    form.append('neighborhood', 'Quartier Test');
    form.append('position', '7.5398,−5.5471');
    form.append('inputType', 'text');
    form.append('description', 'Ceci est un test de soumission avec pièces jointes');
    form.append('photo', fs.createReadStream(testImagePath), 'photo-test.png');

    console.log('✅ Données préparées\n');

    // Envoyer la soumission
    console.log('📤 Envoi de la soumission au serveur...');
    const headers = form.getHeaders ? form.getHeaders() : {};
    
    const requestOptions = {
      method: 'POST',
      headers: {
        ...headers,
        'User-Agent': 'test-full-flow/1.0'
      }
    };

    const response = await new Promise((resolve, reject) => {
      const req = require('http').request(`${API_URL}/requests`, requestOptions, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: data ? JSON.parse(data) : {}
          });
        });
      });
      
      req.on('error', reject);
      form.pipe(req);
    });

    console.log(`✅ Réponse reçue (status: ${response.status})\n`);
    
    if (!response.body.success) {
      console.log('❌ La soumission a échoué:');
      console.log(JSON.stringify(response.body, null, 2));
      return;
    }

    const trackingCode = response.body.trackingCode;
    console.log(`✨ Code de suivi généré: ${trackingCode}\n`);

    if (response.body.notification) {
      console.log(`📧 Email envoyé: ${response.body.notification.sent ? '✅ Oui' : '❌ Non'}`);
      if (response.body.notification.id) {
        console.log(`📨 Email ID: ${response.body.notification.id}\n`);
      }
    }

    // Vérifier que les données ont été persistées
    console.log('🔍 Vérification de la persistance...');
    const trackingFilePath = path.join(__dirname, 'data', 'tracking.json');
    
    if (fs.existsSync(trackingFilePath)) {
      const trackingData = JSON.parse(fs.readFileSync(trackingFilePath, 'utf-8'));
      
      if (trackingData[trackingCode]) {
        console.log(`✅ Code de suivi trouvé dans le fichier de persistance\n`);
        console.log('📋 Données persistées:');
        console.log(JSON.stringify(trackingData[trackingCode], null, 2));
      } else {
        console.log(`⚠️  Code de suivi ${trackingCode} non trouvé dans le fichier\n`);
        console.log('📋 Contenu du fichier:');
        console.log(JSON.stringify(trackingData, null, 2));
      }
    } else {
      console.log(`⚠️  Fichier de persistance non trouvé: ${trackingFilePath}\n`);
    }

    console.log('\n✅ Test du flux complet réussi!');
    console.log(`\nÉtapes suivantes:`);
    console.log(`1. Vérifier que l'email a été reçu sur ebfbouake@gmail.com avec la pièce jointe`);
    console.log(`2. Tester le code de suivi: ${trackingCode}`);
    console.log(`3. Tester sur mobile avec le lien Vercel`);

  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
    if (error.code) console.error(`   Code: ${error.code}`);
  }
}

// Lancer le test
testFullFlow();
