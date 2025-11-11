#!/usr/bin/env node
/**
 * Test script pour vérifier que Resend fonctionne correctement
 * Usage: node test-resend.js
 */

require('dotenv').config({ path: '.env.local' });

const resendApiKey = process.env.RESEND_API_KEY;
const emailTo = process.env.EMAIL_TO || 'ebfbouake@gmail.com';

if (!resendApiKey || resendApiKey === 'YOUR_RESEND_API_KEY_HERE') {
  console.error('❌ RESEND_API_KEY not configured');
  console.error('📝 Veuillez:');
  console.error('1. Aller sur https://resend.com/signup');
  console.error('2. Créer un compte avec votre Gmail');
  console.error('3. Aller sur https://resend.com/api-keys');
  console.error('4. Créer une clé API');
  console.error('5. Coller la clé ici dans .env.local');
  process.exit(1);
}

console.log('🧪 Test Resend');
console.log('===============');
console.log(`📬 To: ${emailTo}`);
console.log(`🔑 API Key: ${resendApiKey.substring(0, 10)}...`);

async function test() {
  try {
    const { Resend } = require('resend');
    const resend = new Resend(resendApiKey);

    console.log('\n📤 Envoi du test email...');
    const response = await resend.emails.send({
      from: 'Demandes EBF <onboarding@resend.dev>',
      to: emailTo,
      subject: '🧪 Test Resend - EBF Bouaké',
      html: '<h1>Test Email</h1><p>Ceci est un email de test pour vérifier que Resend fonctionne correctement.</p>',
      text: 'Ceci est un email de test pour vérifier que Resend fonctionne correctement.',
    });

    if (response.error) {
      console.error('❌ Erreur:', response.error.message);
      process.exit(1);
    }

    console.log('✅ Email envoyé avec succès !');
    console.log(`📧 Email ID: ${response.data.id}`);
    console.log('📧 L\'email devrait arriver dans votre inbox Gmail dans quelques secondes.');
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi:', error.message);
    process.exit(1);
  }
}

test();
