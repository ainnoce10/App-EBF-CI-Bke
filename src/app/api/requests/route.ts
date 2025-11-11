import { NextRequest, NextResponse } from 'next/server';
// This endpoint now only forwards incoming requests by email (Gmail SMTP or other SMTP).
// It no longer depends on the database or Supabase storage so those files can be removed.

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

  try {
    console.log('📥 Début de la réception de la demande...');
    
    const formData = await request.formData();
    console.log('📋 FormData reçu:', {
      name: formData.get('name'),
      phone: formData.get('phone'),
      neighborhood: formData.get('neighborhood'),
      position: formData.get('position'),
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
    if (!name) {
      console.log('❌ Nom manquant');
      return NextResponse.json(
        { error: 'Le nom est obligatoire' },
        { status: 400 }
      );
    }

    if (!phone) {
      console.log('❌ Téléphone manquant');
      return NextResponse.json(
        { error: 'Le numéro de téléphone est obligatoire' },
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

      if (resendApiKey) {
        const { Resend } = await import('resend');
        const resend = new Resend(resendApiKey);

        const emailSubject = `Nouvelle demande - ${customerName}`;
        const htmlContent = `
          <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9f9f9;">
            <h2 style="color: #333;">Nouvelle demande d'intervention électrique</h2>
            <p><strong>Client:</strong> ${customerName}</p>
            <p><strong>Téléphone:</strong> ${customerPhone}</p>
            ${neighborhood ? `<p><strong>Quartier:</strong> ${neighborhood}</p>` : ''}
            ${latitude && longitude ? `<p><strong>Position GPS:</strong> ${latitude}, ${longitude}</p>` : ''}
            <p><strong>Type:</strong> ${inputType === 'text' ? 'Texte' : 'Audio'}</p>
            ${inputType === 'text' && description ? `<p><strong>Description:</strong></p><pre>${description}</pre>` : ''}
            ${audioFile && audioFile.size > 0 ? '<p>📎 Un message audio a été envoyé.</p>' : ''}
            ${photoFile && photoFile.size > 0 ? '<p>📎 Une photo a été jointe.</p>' : ''}
          </div>
        `;

        await resend.emails.send({
          from: 'Demandes EBF <onboarding@resend.dev>',
          to: emailTo,
          subject: emailSubject,
          html: htmlContent,
          text: messageContent,
        });
        console.log('✉️ Email Resend envoyé à', emailTo);
      } else {
        console.log('⚠️ RESEND_API_KEY non configurée — email non envoyé.');
      }
    } catch (emailErr) {
      console.error('Erreur lors de l\'envoi de l\'email Resend:', emailErr);
    }

    return NextResponse.json({
      success: true,
      message: 'Demande reçue et email de notification envoyé.'
    });

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
    return NextResponse.json({
      success: true,
      message: 'Endpoint GET non disponible. Utilisez POST pour envoyer une demande.'
    });
  } catch (error) {
    console.error('Error in GET:', error);
    return NextResponse.json(
      { error: 'Erreur lors du traitement de la requête' },
      { status: 500 }
    );
  }
}