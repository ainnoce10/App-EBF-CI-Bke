#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

async function testAPI() {
  console.log('🔍 Test de l\'API Supabase...');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  console.log('URL:', supabaseUrl);
  console.log('Key:', supabaseKey ? 'Présente' : 'Manquante');
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Variables d\'environnement manquantes');
    process.exit(1);
  }
  
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Test simple: obtenir les informations du projet
    const { data, error } = await supabase.from('pg_tables').select('*').limit(1);
    
    if (error) {
      console.error('❌ Erreur API (tables):', error.message);
      console.error('Code:', error.code);
      console.error('Détails:', error);
      
      // Essayer un test plus simple
      console.log('🔄 Essai avec un test plus simple...');
      const { data: versionData, error: versionError } = await supabase.rpc('version');
      
      if (versionError) {
        console.error('❌ Erreur API (version):', versionError.message);
        console.error('Code:', versionError.code);
        console.error('Détails:', versionError);
        process.exit(1);
      }
      
      console.log('✅ API Supabase accessible !');
      console.log('Version:', versionData);
    } else {
      console.log('✅ API Supabase accessible !');
      console.log('Tables:', data);
    }
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Erreur lors du test API:', error.message);
    process.exit(1);
  }
}

testAPI();