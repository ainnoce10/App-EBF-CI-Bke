import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

// This endpoint now only forwards incoming requests by email (Gmail SMTP or other SMTP).
// It no longer depends on the database or Supabase storage so those files can be removed.

// Helper function to load/save tracking data from JSON file
// Handle environments where filesystem might not be writable (e.g., Lambda)
let TRACKING_DATA_DIR: string;
let TRACKING_FILE: string;
let UPLOADS_DIR: string;
let AUDIO_DIR: string;
let PHOTO_DIR: string;

const getTrackingPaths = () => {
  try {
    const cwd = process.cwd();
    return {
      dir: path.join(cwd, 'data'),
      file: path.join(cwd, 'data', 'tracking.json'),
      uploadsDir: path.join(cwd, 'public', 'uploads'),
      audioDir: path.join(cwd, 'public', 'uploads', 'audio'),
      photoDir: path.join(cwd, 'public', 'uploads', 'photos'),
    };
  } catch (err) {
    console.warn('⚠️ process.cwd() unavailable, using fallback paths');
    return {
      dir: '/tmp/data',
      file: '/tmp/data/tracking.json',
      uploadsDir: '/tmp/public/uploads',
      audioDir: '/tmp/public/uploads/audio',
      photoDir: '/tmp/public/uploads/photos',
    };
  }
};

const initPaths = () => {
  const paths = getTrackingPaths();
  TRACKING_DATA_DIR = paths.dir;
  TRACKING_FILE = paths.file;
  UPLOADS_DIR = paths.uploadsDir;
  AUDIO_DIR = paths.audioDir;
  PHOTO_DIR = paths.photoDir;
};

initPaths();

async function ensureTrackingDir() {
  try {
    await fs.mkdir(TRACKING_DATA_DIR, { recursive: true });
  } catch (err) {
    // If primary path fails, switch to /tmp
    console.warn('⚠️ Impossible de créer le répertoire sur le chemin principal, utilisation de /tmp');
    TRACKING_DATA_DIR = '/tmp/data';
    TRACKING_FILE = '/tmp/data/tracking.json';
    try {
      await fs.mkdir(TRACKING_DATA_DIR, { recursive: true });
    } catch (tmpErr) {
      console.warn('⚠️ /tmp non disponible, les données de suivi seront temporaires uniquement');
    }
  }
}

async function ensureUploadsDir() {
  // Uploads are sent as email attachments, no disk storage needed
  return;
}

async function loadTrackingData(): Promise<Record<string, any>> {
  try {
    await ensureTrackingDir();
    const data = await fs.readFile(TRACKING_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.log('📝 Fichier tracking.json non trouvé, création d\'un nouveau');
    return {};
  }
}

async function saveTrackingData(data: Record<string, any>) {
  try {
    await ensureTrackingDir();
    await fs.writeFile(TRACKING_FILE, JSON.stringify(data, null, 2), 'utf-8');
    console.log('✅ Données tracking sauvegardées');
  } catch (err) {
    console.warn('⚠️ Impossible de sauvegarder tracking.json (système de fichiers non persistant?):', err);
    // Silently continue - data loss is acceptable in ephemeral environments
  }
}

async function saveUploadedFile(file: File, trackingCode: string, type: 'audio' | 'photo'): Promise<string | null> {
  try {
    if (!file || file.size === 0) return null;
    
    // Ne pas tenter de sauvegarder sur disque - les fichiers sont envoyés par email uniquement
    const ext = type === 'audio' ? '.wav' : '.jpg';
    const filename = `${trackingCode}-${type}${ext}`;
    const publicUrl = `/uploads/${type}/${filename}`;
    
    console.log(`✅ Fichier ${type} enregistré pour envoi par email: ${filename}`);
    return publicUrl;
  } catch (err) {
    console.warn(`⚠️ Erreur fichier ${type}:`, err);
    return null;
  }
}

// S'assurer que les variables d'environnement sont chargées
if (typeof process !== 'undefined' && !process.env.DATABASE_URL) {
  // En développement, charger depuis .env si disponible
  try {
    const fs = require('fs');
    const path = require('path');
    const envPath = path.join(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      envContent.split('\n').forEach((line: string) => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
          const key = match[1].trim();
          const value = match[2].trim().replace(/^["']|["']$/g, '');
          if (!process.env[key]) {
            process.env[key] = value;
          }
        }
      });
    }
  } catch (error) {
    console.error('Erreur lors du chargement du fichier .env:', error);
  }
}

export async function POST(request: NextRequest) {
  // Déclarer les variables en dehors du try pour qu'elles soient accessibles dans le catch
  let name: string = '';
  let phone: string = '';
  let neighborhood: string = '';
  let position: string = '';
  let inputType: 'text' | 'audio' = 'text';
  let description: string = '';
  let latitude: number | null = null;
  let longitude: number | null = null;
  let audioFile: File | null = null;
  let photoFile: File | null = null;
  let mapsLink: string | null = null;

  try {
    console.log('📥 Début de la réception de la demande...');
    
    const formData = await request.formData();
    console.log('📋 FormData reçu:', {
      name: formData.get('name'),
      phone: formData.get('phone'),
      neighborhood: formData.get('neighborhood'),
      position: formData.get('position'),
      mapsLink: formData.get('mapsLink'),
      inputType: formData.get('inputType'),
      description: formData.get('description'),
      hasAudio: formData.get('audio') instanceof File,
      hasPhoto: formData.get('photo') instanceof File
    });
    
    name = formData.get('name') as string;
    phone = formData.get('phone') as string;
    neighborhood = formData.get('neighborhood') as string;
    position = formData.get('position') as string;
    inputType = formData.get('inputType') as 'text' | 'audio';
    description = formData.get('description') as string;
    audioFile = formData.get('audio') as File;
    photoFile = formData.get('photo') as File;
    mapsLink = formData.get('mapsLink') as string || null;
    
    // Extraire les coordonnées GPS du champ position si elles sont fournies
    if (position && position.includes(',')) {
      const coords = position.split(',');
      if (coords.length === 2) {
        const lat = parseFloat(coords[0].trim());
        const lng = parseFloat(coords[1].trim());
        if (!isNaN(lat) && !isNaN(lng)) {
          latitude = lat;
          longitude = lng;
        }
      }
    }

    console.log('📝 Données extraites:', { name, phone, neighborhood, position, inputType, description, latitude, longitude });

    // Validate required fields
    // Allow audio-only submissions: if no audio is provided, require name and phone
    const hasAudioUploaded = !!(audioFile && audioFile.size > 0);
    if (!hasAudioUploaded && !name) {
      console.log('❌ Nom manquant (aucun audio fourni)');
      return NextResponse.json(
        { error: 'Le nom est obligatoire si vous n\'avez pas envoyé de message vocal' },
        { status: 400 }
      );
    }

    if (!hasAudioUploaded && !phone) {
      console.log('❌ Téléphone manquant (aucun audio fourni)');
      return NextResponse.json(
        { error: 'Le numéro de téléphone est obligatoire si aucun message vocal n\'a été joint' },
        { status: 400 }
      );
    }

    console.log('✅ Validation des champs réussie');

    // Build a plain text message for email forwarding
    const customerName = name || 'Client inconnu';
    const customerPhone = phone || '';
    let messageContent = `Nouvelle demande d'intervention électrique:\n\n`;
    messageContent += `Client: ${customerName}\n`;
    messageContent += `Téléphone: ${customerPhone}\n`;
    if (neighborhood) messageContent += `Quartier: ${neighborhood}\n`;
    if (latitude && longitude) messageContent += `Position: ${latitude}, ${longitude}\n`;
    if (mapsLink) messageContent += `Lien Google Maps: ${mapsLink}\n`;
    messageContent += `Type: ${inputType === 'text' ? 'Texte' : 'Audio'}\n`;
    if (inputType === 'text' && description) messageContent += `\nDescription:\n${description}`;

    // Note: file uploads are not processed when DB/storage are removed. If audio/photo present,
    // include their presence info only.
    if (audioFile && audioFile.size > 0) messageContent += `\n\nUn message audio a été envoyé.`;
    if (photoFile && photoFile.size > 0) messageContent += `\n\nUne photo a été jointe.`;

    // Try to send email via Resend if API key is configured
    try {
      const resendApiKey = process.env.RESEND_API_KEY;
      const emailTo = process.env.EMAIL_TO || 'ebfbouake@gmail.com';

      console.log('🔍 Configuration email:', {
        hasResendKey: !!resendApiKey,
        emailTo,
        hasSMTPHost: !!process.env.SMTP_HOST,
        hasSMTPUser: !!process.env.SMTP_USER,
        hasSMTPPass: !!process.env.SMTP_PASS
      });

      // Generate a tracking code to return to the client: EBF_XXXX (4 chiffres aléatoires)
      const randomDigits = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
      const trackingCode = 'EBF_' + randomDigits;

      // Check if we have attachments
      const hasAttachments = (audioFile && audioFile.size > 0) || (photoFile && photoFile.size > 0);

      // If we have attachments and SMTP is configured, use SMTP directly (more reliable for files)
      if (hasAttachments && process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
        console.log('📧 Fichiers détectés - utilisation de SMTP pour meilleure fiabilité');
        
        // Build attachments from uploaded File objects (if any) for SMTP
        const attachments: { type: string; name: string; data: string }[] = [];
        try {
          if (audioFile && audioFile.size > 0) {
            const buffer = await audioFile.arrayBuffer();
            const b64 = Buffer.from(buffer).toString('base64');
            attachments.push({ type: audioFile.type || 'audio/wav', name: audioFile.name || `audio-${Date.now()}.wav`, data: b64 });
          }
          if (photoFile && photoFile.size > 0) {
            const buffer = await photoFile.arrayBuffer();
            const b64 = Buffer.from(buffer).toString('base64');
            attachments.push({ type: photoFile.type || 'image/jpeg', name: photoFile.name || `photo-${Date.now()}.jpg`, data: b64 });
          }
        } catch (err) {
          console.error('❌ Erreur conversion fichiers:', err);
        }

        const emailSubject = `Nouvelle demande - ${customerName} (${trackingCode})`;
        const htmlContent = `
          <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9f9f9;">
            <h2 style="color: #333;">Nouvelle demande d'intervention électrique</h2>
            <p><strong>Client:</strong> ${customerName}</p>
            <p><strong>Téléphone:</strong> ${customerPhone}</p>
            ${neighborhood ? `<p><strong>Quartier:</strong> ${neighborhood}</p>` : ''}
            ${latitude && longitude ? `<p><strong>Position GPS:</strong> ${latitude}, ${longitude}</p>` : ''}
            ${mapsLink ? `<p><strong>Lien Google Maps:</strong> <a href=\"${mapsLink}\" target=\"_blank\">${mapsLink}</a></p>` : ''}
            <p><strong>Type:</strong> ${inputType === 'text' ? 'Texte' : 'Audio'}</p>
            ${inputType === 'text' && description ? `<p><strong>Description:</strong></p><pre>${description}</pre>` : ''}
            <p><strong>Code de suivi:</strong> <code>${trackingCode}</code></p>
            ${audioFile && audioFile.size > 0 ? '<p>📎 Un message audio a été envoyé.</p>' : ''}
            ${photoFile && photoFile.size > 0 ? '<p>📎 Une photo a été jointe.</p>' : ''}
          </div>
        `;

        const smtpResult = await sendEmailSMTP({
          to: emailTo,
          subject: emailSubject,
          text: messageContent,
          html: htmlContent,
          attachments
        });

        if (smtpResult.success) {
          // Save tracking data to JSON file
          const trackingData = await loadTrackingData();
          trackingData[trackingCode] = {
            code: trackingCode,
            name: customerName,
            phone: customerPhone,
            neighborhood,
            latitude,
            longitude,
            inputType,
            description,
            hasAudio: audioFile && audioFile.size > 0,
            hasPhoto: photoFile && photoFile.size > 0,
            audioUrl: null,
            photoUrl: null,
            emailId: smtpResult.id || null,
            createdAt: new Date().toISOString(),
            status: 'submitted'
          };
          await saveTrackingData(trackingData);
          console.log('💾 Code de suivi sauvegardé:', trackingCode);

          return NextResponse.json({
            success: true,
            trackingCode,
            notification: { sent: true, id: smtpResult.id || null }
          });
        }
      }

      if (resendApiKey) {
        const { Resend } = await import('resend');
        const resend = new Resend(resendApiKey);

        const emailSubject = `Nouvelle demande - ${customerName} (${trackingCode})`;
        const htmlContent = `
          <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9f9f9;">
            <h2 style="color: #333;">Nouvelle demande d'intervention électrique</h2>
            <p><strong>Client:</strong> ${customerName}</p>
            <p><strong>Téléphone:</strong> ${customerPhone}</p>
            ${neighborhood ? `<p><strong>Quartier:</strong> ${neighborhood}</p>` : ''}
            ${latitude && longitude ? `<p><strong>Position GPS:</strong> ${latitude}, ${longitude}</p>` : ''}
            ${mapsLink ? `<p><strong>Lien Google Maps:</strong> <a href=\"${mapsLink}\" target=\"_blank\">${mapsLink}</a></p>` : ''}
            <p><strong>Type:</strong> ${inputType === 'text' ? 'Texte' : 'Audio'}</p>
            ${inputType === 'text' && description ? `<p><strong>Description:</strong></p><pre>${description}</pre>` : ''}
            <p><strong>Code de suivi:</strong> <code>${trackingCode}</code></p>
            ${audioFile && audioFile.size > 0 ? '<p>📎 Un message audio a été envoyé.</p>' : ''}
            ${photoFile && photoFile.size > 0 ? '<p>📎 Une photo a été jointe.</p>' : ''}
          </div>
        `;

        const attachments: { type: string; name: string; data: string }[] = [];

        // Convert File objects to base64 attachments if present
        try {
          if (audioFile && audioFile.size > 0) {
            console.log(`🎵 Traitement fichier audio: ${audioFile.name} (${audioFile.size} bytes)`);
            const buffer = await audioFile.arrayBuffer();
            const b64 = Buffer.from(buffer).toString('base64');
            attachments.push({
              type: audioFile.type || 'audio/wav',
              name: audioFile.name || `audio-${Date.now()}.wav`,
              data: b64
            });
            console.log(`✅ Fichier audio converti: ${attachments[attachments.length - 1].name}`);
          }
        } catch (err) {
          console.error('❌ Erreur conversion audio:', err);
        }

        try {
          if (photoFile && photoFile.size > 0) {
            console.log(`📷 Traitement fichier photo: ${photoFile.name} (${photoFile.size} bytes)`);
            const buffer = await photoFile.arrayBuffer();
            const b64 = Buffer.from(buffer).toString('base64');
            attachments.push({
              type: photoFile.type || 'image/jpeg',
              name: photoFile.name || `photo-${Date.now()}.jpg`,
              data: b64
            });
            console.log(`✅ Fichier photo converti: ${attachments[attachments.length - 1].name}`);
          }
        } catch (err) {
          console.error('❌ Erreur conversion photo:', err);
        }

        const sendPayload: any = {
          from: 'Demandes EBF <onboarding@resend.dev>',
          to: emailTo,
          subject: emailSubject,
          html: htmlContent,
          text: messageContent,
        };

        if (attachments.length > 0) {
          // Resend accepts attachments as array { type, name, data }
          sendPayload.attachments = attachments;
        }

        const resp = await resend.emails.send(sendPayload);
        console.log('✉️ Email Resend envoyé à', emailTo, 'resp:', resp?.data?.id || resp);

        // Save uploaded files to disk
        const audioUrl = await saveUploadedFile(audioFile, trackingCode, 'audio');
        const photoUrl = await saveUploadedFile(photoFile, trackingCode, 'photo');

        // Save tracking data to JSON file
        const trackingData = await loadTrackingData();
        trackingData[trackingCode] = {
          code: trackingCode,
          name: customerName,
          phone: customerPhone,
          neighborhood,
          latitude,
          longitude,
          inputType,
          description,
          hasAudio: audioFile && audioFile.size > 0,
          hasPhoto: photoFile && photoFile.size > 0,
          audioUrl,
          photoUrl,
          emailId: resp?.data?.id || null,
          createdAt: new Date().toISOString(),
          status: 'submitted'
        };
        await saveTrackingData(trackingData);
        console.log('💾 Code de suivi sauvegardé:', trackingCode);

        return NextResponse.json({
          success: true,
          trackingCode,
          notification: { sent: true, id: resp?.data?.id || null }
        });
      } else {
        console.log('⚠️ RESEND_API_KEY non configurée — tentative d\'envoi via SMTP si configurée.');
        const randomDigits = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
        const trackingCode = 'EBF_' + randomDigits;

        // Save uploaded files even without Resend
        const audioUrl = await saveUploadedFile(audioFile, trackingCode, 'audio');
        const photoUrl = await saveUploadedFile(photoFile, trackingCode, 'photo');

        // Build attachments from uploaded File objects (if any) for SMTP
        const attachments: { type: string; name: string; data: string }[] = [];
        try {
          if (audioFile && audioFile.size > 0) {
            const buffer = await audioFile.arrayBuffer();
            const b64 = Buffer.from(buffer).toString('base64');
            attachments.push({ type: audioFile.type || 'audio/wav', name: audioFile.name || `audio-${Date.now()}.wav`, data: b64 });
          }
          if (photoFile && photoFile.size > 0) {
            const buffer = await photoFile.arrayBuffer();
            const b64 = Buffer.from(buffer).toString('base64');
            attachments.push({ type: photoFile.type || 'image/jpeg', name: photoFile.name || `photo-${Date.now()}.jpg`, data: b64 });
          }
        } catch (err) {
          console.error('❌ Erreur conversion fichiers pour SMTP fallback:', err);
        }

        // Try SMTP if configured
        let smtpResult: any = null;
        const emailTo = process.env.EMAIL_TO || 'ebfbouake@gmail.com';
        const emailSubject = `Nouvelle demande - ${customerName} (${trackingCode})`;
        const htmlContent = `<div><p>Client: ${customerName}</p><p>Téléphone: ${customerPhone}</p>${neighborhood ? `<p>Quartier: ${neighborhood}</p>` : ''}${mapsLink ? `<p><a href=\"${mapsLink}\" target=\"_blank\">Voir la position</a></p>` : ''}<p>Code: ${trackingCode}</p></div>`;
        if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
          try {
            smtpResult = await sendEmailSMTP({
              to: emailTo,
              subject: emailSubject,
              text: messageContent,
              html: htmlContent,
              attachments
            });
          } catch (err) {
            console.error('❌ Erreur lors de l\'envoi SMTP fallback:', err);
          }
        }

        // Save tracking data to JSON file
        const trackingData = await loadTrackingData();
        trackingData[trackingCode] = {
          code: trackingCode,
          name: customerName,
          phone: customerPhone,
          neighborhood,
          latitude,
          longitude,
          inputType,
          description,
          hasAudio: audioFile && audioFile.size > 0,
          hasPhoto: photoFile && photoFile.size > 0,
          audioUrl,
          photoUrl,
          emailId: smtpResult?.id || null,
          createdAt: new Date().toISOString(),
          status: 'submitted'
        };
        await saveTrackingData(trackingData);

        return NextResponse.json({ success: true, trackingCode, notification: { sent: !!smtpResult?.success, error: smtpResult?.error || 'RESEND_API_KEY not set' } });
      }
    } catch (emailErr) {
      console.error('Erreur lors de l\'envoi de l\'email Resend:', emailErr);
      const randomDigits = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
      const trackingCode = 'EBF_' + randomDigits;

      // Save uploaded files even if email fails
      const audioUrl = await saveUploadedFile(audioFile, trackingCode, 'audio');
      const photoUrl = await saveUploadedFile(photoFile, trackingCode, 'photo');

      // Try SMTP fallback if configured
      const attachments: { type: string; name: string; data: string }[] = [];
      try {
        if (audioFile && audioFile.size > 0) {
          const buffer = await audioFile.arrayBuffer();
          const b64 = Buffer.from(buffer).toString('base64');
          attachments.push({ type: audioFile.type || 'audio/wav', name: audioFile.name || `audio-${Date.now()}.wav`, data: b64 });
        }
        if (photoFile && photoFile.size > 0) {
          const buffer = await photoFile.arrayBuffer();
          const b64 = Buffer.from(buffer).toString('base64');
          attachments.push({ type: photoFile.type || 'image/jpeg', name: photoFile.name || `photo-${Date.now()}.jpg`, data: b64 });
        }
      } catch (err) {
        console.error('❌ Erreur conversion fichiers pour SMTP fallback après erreur Resend:', err);
      }

      let smtpResult: any = null;
      const emailTo = process.env.EMAIL_TO || 'ebfbouake@gmail.com';
      const emailSubject = `Nouvelle demande - ${customerName} (${trackingCode})`;
      const htmlContent = `<div><p>Client: ${customerName}</p><p>Téléphone: ${customerPhone}</p>${neighborhood ? `<p>Quartier: ${neighborhood}</p>` : ''}${mapsLink ? `<p><a href=\"${mapsLink}\" target=\"_blank\">Voir la position</a></p>` : ''}<p>Code: ${trackingCode}</p></div>`;
      if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
        try {
          smtpResult = await sendEmailSMTP({
            to: emailTo,
            subject: emailSubject,
            text: messageContent,
            html: htmlContent,
            attachments
          });
        } catch (err) {
          console.error('❌ Erreur lors de l\'envoi SMTP fallback après échec Resend:', err);
        }
      }

      // Save tracking data to JSON file
      const trackingData = await loadTrackingData();
      trackingData[trackingCode] = {
        code: trackingCode,
        name: customerName,
        phone: customerPhone,
        neighborhood,
        latitude,
        longitude,
        inputType,
        description,
        hasAudio: audioFile && audioFile.size > 0,
        hasPhoto: photoFile && photoFile.size > 0,
        audioUrl,
        photoUrl,
        emailId: smtpResult?.id || null,
        createdAt: new Date().toISOString(),
        status: 'submitted'
      };
      await saveTrackingData(trackingData);

      return NextResponse.json({ success: true, trackingCode, notification: { sent: !!smtpResult?.success, error: String(emailErr) } });
    }

  } catch (error) {
    console.error('Error creating request:', error);
    
    return NextResponse.json({
      success: true,
      message: 'Demande traitée (Email-only mode)'
    });
  }
}

export async function GET(request: NextRequest) {
  try {
    // Try to load persisted tracking data (from data/tracking.json)
    const trackingData = await loadTrackingData();

    // Convert trackingData (object keyed by trackingCode) into an array
    const requestsArray = Object.values(trackingData).map((item: any) => {
      return {
        id: item.code || item.trackingCode || (`req_${Math.random().toString(36).slice(2,9)}`),
        trackingCode: item.code || item.trackingCode,
        customer: {
          name: item.name || null,
          phone: item.phone || '',
          neighborhood: item.neighborhood || null,
        },
        type: item.inputType === 'audio' || item.hasAudio ? 'AUDIO' : 'TEXT',
        status: (item.status === 'submitted' ? 'NEW' : item.status || 'NEW'),
        createdAt: item.createdAt || new Date().toISOString(),
        description: item.description || '',
        priority: item.priority || 'MEDIUM',
        notes: item.notes || '',
        photoUrl: item.photoUrl || undefined,
        audioUrl: item.audioUrl || undefined,
        technician: item.technician || undefined,
        scheduledDate: item.scheduledDate || undefined,
        estimatedCost: item.estimatedCost || undefined,
      }
    })

    return NextResponse.json(requestsArray)
  } catch (error) {
    console.error('Error in GET:', error);
    return NextResponse.json(
      { error: 'Erreur lors du traitement de la requête' },
      { status: 500 }
    );
  }
}

// Fallback SMTP sender using nodemailer (optional). If RESEND_API_KEY is not set,
// and SMTP env vars are provided, we'll try to send via SMTP (Gmail or other).
async function sendEmailSMTP(opts: {
  to: string;
  from?: string;
  subject: string;
  text?: string;
  html?: string;
  attachments?: { type: string; name: string; data: string }[];
}) {
  try {
    const nodemailer = await import('nodemailer');
    const host = process.env.SMTP_HOST;
    const port = parseInt(process.env.SMTP_PORT || '587', 10);
    const secure = (process.env.SMTP_SECURE === 'true') || port === 465;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (!host || !user || !pass) {
      throw new Error('SMTP configuration missing (SMTP_HOST/SMTP_USER/SMTP_PASS)');
    }

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass }
    });

    const mailAttachments = (opts.attachments || []).map((a) => ({
      filename: a.name,
      content: Buffer.from(a.data, 'base64'),
      contentType: a.type,
    }));

    const info = await transporter.sendMail({
      from: opts.from || process.env.EMAIL_FROM || user,
      to: opts.to,
      subject: opts.subject,
      text: opts.text,
      html: opts.html,
      attachments: mailAttachments,
    });

    console.log('✉️ Email SMTP envoyé, messageId=', info?.messageId);
    return { success: true, id: info?.messageId || null };
  } catch (err) {
    console.error('❌ Erreur envoi SMTP:', err);
    return { success: false, error: String(err) };
  }
}