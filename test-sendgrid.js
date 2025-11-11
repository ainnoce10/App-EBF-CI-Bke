#!/usr/bin/env node
/**
 * Test script pour vérifier que SendGrid fonctionne correctement
 * Usage: node test-sendgrid.js
 */

require('dotenv').config({ path: '.env.local' });

const sendgridApiKey = process.env.SENDGRID_API_KEY;
const emailTo = process.env.EMAIL_TO || 'ebfbouake@gmail.com';
const emailFrom = process.env.SENDGRID_FROM_EMAIL || 'noreply@ebf-bouake.com';

if (!sendgridApiKey) {
  console.error('❌ SENDGRID_API_KEY not found in .env.local');
  process.exit(1);
}

console.log('🧪 Test SendGrid');
console.log('================');
console.log(`📧 From: ${emailFrom}`);
console.log(`📬 To: ${emailTo}`);
console.log(`🔑 API Key: ${sendgridApiKey.substring(0, 10)}...`);

async function test() {
  try {
    const sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(sendgridApiKey);

    const msg = {
      to: emailTo,
      from: emailFrom,
      subject: '🧪 Test SendGrid - EBF Bouaké',
      text: 'Ceci est un email de test pour vérifier que SendGrid fonctionne correctement.',
      html: '<strong>Ceci est un email de test pour vérifier que SendGrid fonctionne correctement.</strong>',
    };

    console.log('\n📤 Envoi du test email...');
    const response = await sgMail.send(msg);
    console.log('✅ Email envoyé avec succès !');
    console.log('Response:', response[0].statusCode);
    
    if (response[0].statusCode === 202) {
      console.log('✅ SendGrid fonctionne correctement !');
      console.log('📧 L\'email devrait arriver dans votre inbox Gmail dans quelques secondes.');
    }
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi:', error.message);
    process.exit(1);
  }
}

test();
