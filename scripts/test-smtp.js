// Simple SMTP test script using nodemailer.
// Usage:
//   set env vars SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, EMAIL_TO
//   node scripts/test-smtp.js

const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

async function main() {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const to = process.env.EMAIL_TO || user;
  const attachPath = process.env.TEST_ATTACHMENT_PATH; // optional

  if (!user || !pass) {
    console.error('Missing SMTP_USER or SMTP_PASS. Set env vars before running.');
    process.exit(1);
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass }
  });

  let attachments = [];
  if (attachPath) {
    const abs = path.resolve(attachPath);
    if (fs.existsSync(abs)) {
      attachments.push({ filename: path.basename(abs), path: abs });
    } else {
      console.warn('Attachment path not found:', abs, '- will send a small text attachment instead.');
    }
  }

  if (attachments.length === 0) {
    attachments.push({ filename: 'hello.txt', content: 'Test attachment from SMTP test script' });
  }

  try {
    const info = await transporter.sendMail({
      from: user,
      to,
      subject: 'SMTP attachment test',
      text: 'This is a test message with attachment.',
      attachments
    });
    console.log('Message sent, messageId=', info.messageId);
    process.exit(0);
  } catch (err) {
    console.error('Error sending test email:', err);
    process.exit(2);
  }
}

main();
