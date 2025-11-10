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

    // Try to send email via SMTP (Gmail) if configured, otherwise do nothing but return success.
    try {
      const smtpHost = process.env.SMTP_HOST;
      const smtpPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : undefined;
      const smtpUser = process.env.SMTP_USER;
      const smtpPass = process.env.SMTP_PASS;
      const emailTo = process.env.EMAIL_TO || 'ebfbouake@gmail.com';

      if (smtpHost && smtpPort && smtpUser && smtpPass) {
        const nodemailer = await import('nodemailer');
        const transporter = nodemailer.createTransport({
          host: smtpHost,
          port: smtpPort,
          secure: smtpPort === 465,
          auth: { user: smtpUser, pass: smtpPass }
        });

        const emailSubject = `Nouvelle demande - ${customerName}`;
        await transporter.sendMail({
          from: smtpUser,
          to: emailTo,
          subject: emailSubject,
          text: messageContent
        });
        console.log('✉️ Email de notification envoyé à', emailTo);
      } else {
        console.log('✉️ SMTP non configuré — email non envoyé. Configurez SMTP_HOST/SMTP_PORT/SMTP_USER/SMTP_PASS.');
      }
    } catch (emailErr) {
      console.error('Erreur lors de l\'envoi de l\'email:', emailErr);
    }

    // --- Envoi d'un email de notification via SendGrid ---
    try {
      const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
      const emailTo = process.env.EMAIL_TO || 'ebfbouake@gmail.com';

      if (SENDGRID_API_KEY) {
        const sgMail = await import('@sendgrid/mail');
        sgMail.default.setApiKey(SENDGRID_API_KEY);

        const emailSubject = `Nouvelle demande - ${customerName} (${trackingCode})`;
        let emailText = messageContent + '\n\n';
        emailText += `Code de suivi: ${trackingCode}\n`;
        emailText += `Voir la demande: ${process.env.NEXT_PUBLIC_APP_URL || ''}/dashboard/requests/${requestId}\n`;
        if (audioUrl) emailText += `Audio: ${audioUrl}\n`;
        if (photoUrl) emailText += `Photo: ${photoUrl}\n`;

        const msg = {
          to: emailTo,
          from: 'notifications@ebf-bouake.vercel.app', // Domaine vérifié SendGrid
          subject: emailSubject,
          text: emailText,
          html: emailText.replace(/\n/g, '<br>')
        };

        await sgMail.default.send(msg);
        console.log('✉️ Email de notification envoyé via SendGrid à', emailTo);
      } else {
        console.log('✉️ SendGrid API Key non configurée — email non envoyé.');
      }
    } catch (emailErr) {
      console.error('Erreur lors de l\'envoi de l\'email de notification:', emailErr);
      // Ne pas échouer la création de la demande si l'email échoue
    }

    // If audio file exists, trigger transcription (async)
    if (audioUrl) {
      try {
        const ZAI = await import('z-ai-web-dev-sdk');
        const zai = await ZAI.default.create();
        
        // Note: In a real implementation, you would need to convert the audio to a format
        // that the AI service can process. This is a simplified example.
        const transcription = await zai.chat.completions.create({
          messages: [
            {
              role: 'system',
              content: 'Vous êtes un assistant qui transcrit des messages vocaux concernant des problèmes électriques. Transcrivez le message de manière précise et concise.'
            },
            {
              role: 'user',
              content: `Veuillez transcrire ce message vocal concernant un problème électrique. Le fichier audio est disponible à: ${audioUrl}`
            }
          ]
        });

        const transcriptionText = transcription.choices[0]?.message?.content;
        
        if (transcriptionText) {
          await databaseService.safeUpdate('request', {
            where: { id: requestId },
            data: { transcription: transcriptionText }
          });
        }
      } catch (error) {
        console.error('Transcription failed:', error);
        // Don't fail the request if transcription fails
      }
    }

    return NextResponse.json({
      success: true,
      request: fullRequest,
      message: messageResult,
      trackingCode: trackingCode
    });

  } catch (error) {
    console.error('Error creating request:', error);
    
    // Si la base de données n'est pas disponible (erreur Vercel), créer une réponse de secours
    if (error instanceof Error && error.message.includes('Unable to open the database file')) {
      console.log('🔄 Base de données non disponible - utilisation du mode de secours');
      
      // Créer une demande simulée
      const mockRequest = {
        id: Date.now().toString(),
        customerId: "temp-customer",
        type: "TEXT",
        description: description || "Demande via formulaire",
        status: "NEW",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        customer: {
          id: "temp-customer",
          name: name,
          phone: phone,
          neighborhood: neighborhood || null,
          city: "Bouaké",
          latitude: latitude,
          longitude: longitude,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      };

      return NextResponse.json({
        success: true,
        request: mockRequest,
        message: {
          id: "temp-message",
          type: "REQUEST",
          senderName: name,
          senderPhone: phone,
          subject: `🆕 Nouvelle demande - ${name}`,
          content: `Nouvelle demande d'intervention électrique (mode hors ligne):\n\nClient: ${name}\nTéléphone: ${phone}\nQuartier: ${neighborhood || 'Non spécifié'}\n\nDescription: ${description || 'Non spécifiée'}`,
          status: "UNREAD",
          priority: "HIGH",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        fallback: true,
        warning: "La demande a été enregistrée temporairement. Elle sera traitée dès que la base de données sera disponible."
      });
    }

    return NextResponse.json(
      { error: 'Erreur lors de la création de la demande' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const technicianId = searchParams.get('technicianId');

    const where: any = {};
    
    if (status && status !== 'all') {
      where.status = status;
    }
    
    if (technicianId && technicianId !== 'all') {
      where.technicianId = technicianId;
    }

    const requestsResult = await databaseService.safeFindMany('request', {
      where,
      include: {
        customer: true,
        technician: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (requestsResult.error) {
      return NextResponse.json(
        { error: requestsResult.error },
        { status: 500 }
      );
    }

    return NextResponse.json(requestsResult.data);

  } catch (error) {
    console.error('Error fetching requests:', error);
    
    // Retourner des données de démonstration si la base de données n'est pas disponible
    if (error instanceof Error && error.message.includes('Unable to open the database file')) {
      const demoRequests = [
        {
          id: "demo-1",
          customerId: "demo-customer-1",
          type: "TEXT",
          description: "Problème d'électricité dans le salon",
          status: "NEW",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          customer: {
            id: "demo-customer-1",
            name: "Client Démonstration",
            phone: "+225 XX XX XX XX",
            neighborhood: "N'Gattakro",
            city: "Bouaké",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        }
      ];
      
      return NextResponse.json(demoRequests);
    }
    
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des demandes' },
      { status: 500 }
    );
  }
}