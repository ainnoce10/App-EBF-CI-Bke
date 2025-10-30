#!/usr/bin/env node

const https = require('https');

console.log('🧪 Test de connexion Supabase\n');

// Test simple de l'API Supabase
const testSupabaseAPI = () => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'ekohrrzklzrjwjgistnk.supabase.co',
      port: 443,
      path: '/storage/v1/bucket/ebf-bouake',
      method: 'GET',
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

    req.end();
  });
};

// Test de création de bucket
const testCreateBucket = () => {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      name: 'ebf-bouake',
      public: true,
      file_size_limit: 52428800,
      allowed_mime_types: [
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

    const options = {
      hostname: 'ekohrrzklzrjwjgistnk.supabase.co',
      port: 443,
      path: '/storage/v1/bucket',
      method: 'POST',
      headers: {
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVrb2hycnprbHpyandqZ2lzdG5rIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTc3MjA4MiwiZXhwIjoyMDc3MzQ4MDgyfQ.X3bWc6aFGHG9eGn23kl4qseKQnMRT1hYAp4ZD7JBMMY',
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVrb2hycnprbHpyandqZ2lzdG5rIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTc3MjA4MiwiZXhwIjoyMDc3MzQ4MDgyfQ.X3bWc6aFGHG9eGn23kl4qseKQnMRT1hYAp4ZD7JBMMY',
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
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

    req.write(postData);
    req.end();
  });
};

async function runTests() {
  try {
    console.log('1. 🪣 Test d\'accès au bucket ebf-bouake...');
    const bucketTest = await testSupabaseAPI();
    console.log(`   Status: ${bucketTest.status}`);
    console.log(`   Réponse:`, JSON.stringify(bucketTest.response, null, 2));
    
    if (bucketTest.status === 404 || bucketTest.status === 400) {
      console.log('\n2. 🆕 Tentative de création du bucket...');
      const createTest = await testCreateBucket();
      console.log(`   Status: ${createTest.status}`);
      console.log(`   Réponse:`, JSON.stringify(createTest.response, null, 2));
    }
    
  } catch (error) {
    console.error('❌ Erreur lors des tests:', error.message);
  }
}

runTests();