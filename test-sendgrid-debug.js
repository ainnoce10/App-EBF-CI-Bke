#!/usr/bin/env node
/**
 * Test script alternatif - Vérifier la configuration SendGrid
 * Usage: node test-sendgrid-debug.js
 */

require('dotenv').config({ path: '.env.local' });

const sendgridApiKey = process.env.SENDGRID_API_KEY;
const emailTo = process.env.EMAIL_TO || 'ebfbouake@gmail.com';
const emailFrom = process.env.SENDGRID_FROM_EMAIL || 'noreply@ebf-bouake.com';

console.log('🔍 Configuration SendGrid Debug');
console.log('================================');
console.log(`📧 Email from: ${emailFrom}`);
console.log(`📬 Email to: ${emailTo}`);
console.log(`🔑 API Key exists: ${!!sendgridApiKey}`);
console.log(`🔑 API Key (first 20 chars): ${sendgridApiKey?.substring(0, 20)}...`);

if (!sendgridApiKey) {
  console.error('\n❌ SENDGRID_API_KEY not found');
  process.exit(1);
}

async function testWithDifferentEmails() {
  const sgMail = require('@sendgrid/mail');
  sgMail.setApiKey(sendgridApiKey);

  const testEmails = [
    { from: 'ebfbouake@gmail.com', to: 'ebfbouake@gmail.com' },
    { from: 'noreply@ebf-bouake.com', to: 'ebfbouake@gmail.com' },
  ];

  for (const emailConfig of testEmails) {
    try {
      console.log(`\n📤 Test avec From: ${emailConfig.from}`);
      
      const msg = {
        to: emailConfig.to,
        from: emailConfig.from,
        subject: '🧪 Test SendGrid',
        text: 'Test email',
        html: '<strong>Test email</strong>',
      };

      const response = await sgMail.send(msg);
      console.log(`✅ Succès ! Status: ${response[0].statusCode}`);
      return;
    } catch (error) {
      console.log(`❌ Erreur: ${error.message}`);
    }
  }
}

testWithDifferentEmails();
