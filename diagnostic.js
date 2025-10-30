#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Diagnostic de l\'application EBF Bouaké\n');

// 1. Vérifier les fichiers d'environnement
console.log('1. 📋 Vérification des fichiers d\'environnement:');
const envFiles = ['.env', '.env.local', '.env.production'];
envFiles.forEach(file => {
  const envPath = path.join(__dirname, file);
  if (fs.existsSync(envPath)) {
    console.log(`   ✅ ${file} trouvé`);
    const content = fs.readFileSync(envPath, 'utf8');
    console.log(`   📝 Contenu:`);
    content.split('\n').forEach(line => {
      if (line.trim() && !line.includes('PASSWORD') && !line.includes('KEY')) {
        console.log(`      ${line}`);
      } else if (line.includes('PASSWORD') || line.includes('KEY')) {
        console.log(`      ${line.split('=')[0]}=***`);
      }
    });
  } else {
    console.log(`   ❌ ${file} non trouvé`);
  }
});

// 2. Vérifier la configuration Supabase
console.log('\n2. ☁️ Vérification de la configuration Supabase:');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (supabaseUrl) {
  console.log(`   ✅ NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl}`);
} else {
  console.log(`   ❌ NEXT_PUBLIC_SUPABASE_URL non configuré`);
}

if (supabaseKey) {
  console.log(`   ✅ SUPABASE_SERVICE_ROLE_KEY: *** configuré`);
} else {
  console.log(`   ❌ SUPABASE_SERVICE_ROLE_KEY non configuré`);
}

// 3. Vérifier la configuration de la base de données
console.log('\n3. 🗄️ Vérification de la base de données:');
const databaseUrl = process.env.DATABASE_URL;
if (databaseUrl) {
  console.log(`   ✅ DATABASE_URL: ${databaseUrl}`);
  
  // Vérifier si le fichier de base de données existe
  if (databaseUrl.startsWith('file:')) {
    const dbPath = databaseUrl.replace('file:', '');
    if (fs.existsSync(dbPath)) {
      console.log(`   ✅ Fichier de base de données trouvé: ${dbPath}`);
      const stats = fs.statSync(dbPath);
      console.log(`   📊 Taille: ${(stats.size / 1024).toFixed(2)} KB`);
    } else {
      console.log(`   ❌ Fichier de base de données non trouvé: ${dbPath}`);
    }
  }
} else {
  console.log(`   ❌ DATABASE_URL non configuré`);
}

// 4. Vérifier les dépendances
console.log('\n4. 📦 Vérification des dépendances:');
const packageJsonPath = path.join(__dirname, 'package.json');
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const dependencies = packageJson.dependencies || {};
  
  console.log(`   ✅ @supabase/supabase-js: ${dependencies['@supabase/supabase-js'] || 'non installé'}`);
  console.log(`   ✅ @prisma/client: ${dependencies['@prisma/client'] || 'non installé'}`);
  console.log(`   ✅ z-ai-web-dev-sdk: ${dependencies['z-ai-web-dev-sdk'] || 'non installé'}`);
} else {
  console.log(`   ❌ package.json non trouvé`);
}

// 5. Vérifier les fichiers importants
console.log('\n5. 📁 Vérification des fichiers importants:');
const importantFiles = [
  'src/lib/database.ts',
  'src/lib/storage.ts',
  'src/app/api/requests/route.ts',
  'src/app/signaler/page.tsx',
  'prisma/schema.prisma'
];

importantFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`   ✅ ${file}`);
  } else {
    console.log(`   ❌ ${file} non trouvé`);
  }
});

// 6. Conseils
console.log('\n6. 💡 Conseils:');
if (!supabaseUrl || !supabaseKey) {
  console.log('   ⚠️  Les variables Supabase ne sont pas configurées.');
  console.log('   📝 Ajoutez ces lignes à votre fichier .env:');
  console.log('      NEXT_PUBLIC_SUPABASE_URL=https://ekohrrzklzrjwjgistnk.supabase.co');
  console.log('      SUPABASE_SERVICE_ROLE_KEY=votre_clé_service_role');
}

if (!databaseUrl) {
  console.log('   ⚠️  La base de données n\'est pas configurée.');
  console.log('   📝 Ajoutez cette ligne à votre fichier .env:');
  console.log('      DATABASE_URL=file:./db/custom.db');
}

console.log('\n🎯 Prochaines étapes:');
console.log('   1. Corrigez les variables d\'environnement manquantes');
console.log('   2. Exécutez `npm run db:push` pour créer la base de données');
console.log('   3. Redémarrez le serveur avec `npm run dev`');
console.log('   4. Testez à nouveau le formulaire de demande');

console.log('\n✅ Diagnostic terminé');