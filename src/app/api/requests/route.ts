import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { writeFile } from 'fs/promises';
import path from 'path';
import { MessageService } from '@/lib/message-service';

export async function POST(request: NextRequest) {
  try {
    console.log('📥 Début de la réception de la demande...');
    
    // Check if the request is JSON or FormData
    const contentType = request.headers.get('content-type');
    let name, phone, neighborhood, position, inputType, description, audioFile, photoFile;
    
    if (contentType && contentType.includes('application/json')) {
      // Handle JSON request
      console.log('📋 Requête JSON détectée');
      const body = await request.json();
      name = body.name;
      phone = body.phone;
      neighborhood = body.neighborhood;
      position = body.position;
      inputType = body.inputType;
      description = body.description;
      audioFile = null;
      photoFile = null;
      
      console.log('📋 Données JSON reçues:', { name, phone, neighborhood, position, inputType, description });
    } else {
      // Handle FormData request
      console.log('📋 Requête FormData détectée');
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
    }
    
    // Extraire les coordonnées GPS du champ position si elles sont fournies
    let latitude: number | null = null;
    let longitude: number | null = null;
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

    // Find or create customer
    console.log('🔍 Recherche du client...');
    let customer = await db.customer.findUnique({
      where: { phone }
    });

    if (!customer) {
      console.log('👤 Création d\'un nouveau client...');
      customer = await db.customer.create({
        data: {
          name: name,
          phone,
          neighborhood: neighborhood || null,
          city: 'Bouaké',
          latitude: latitude,
          longitude: longitude
        }
      });
      console.log('✅ Client créé:', customer.id);
    } else {
      console.log('👤 Client existant trouvé:', customer.id);
    }

    // Handle file uploads (only for FormData requests)
    let audioUrl: string | null = null;
    let photoUrl: string | null = null;

    console.log('📁 Gestion des fichiers uploadés...');

    if (audioFile && audioFile.size > 0) {
      console.log('🎵 Fichier audio détecté:', audioFile.name);
      const audioBuffer = Buffer.from(await audioFile.arrayBuffer());
      const audioFileName = `${Date.now()}-${audioFile.name}`;
      const audioPath = path.join(process.cwd(), 'public', 'uploads', 'audio', audioFileName);
      
      // Ensure directory exists
      await writeFile(audioPath, audioBuffer);
      audioUrl = `/uploads/audio/${audioFileName}`;
      console.log('✅ Fichier audio sauvegardé:', audioUrl);
    }

    if (photoFile && photoFile.size > 0) {
      console.log('📷 Fichier photo détecté:', photoFile.name);
      const photoBuffer = Buffer.from(await photoFile.arrayBuffer());
      const photoFileName = `${Date.now()}-${photoFile.name}`;
      const photoPath = path.join(process.cwd(), 'public', 'uploads', 'photos', photoFileName);
      
      // Ensure directory exists
      await writeFile(photoPath, photoBuffer);
      photoUrl = `/uploads/photos/${photoFileName}`;
      console.log('✅ Fichier photo sauvegardé:', photoUrl);
    }

    // Générer un code de suivi unique
    const trackingCode = `EBF-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;
    
    console.log('📝 Création de la demande...');
    // Create the request
    const newRequest = await db.request.create({
      data: {
        customerId: customer.id,
        type: inputType === 'text' ? 'TEXT' : 'AUDIO',
        description: inputType === 'text' ? description : null,
        audioUrl: audioUrl,
        photoUrl: photoUrl,
        status: 'PENDING',
        trackingCode: trackingCode
      },
      include: {
        customer: true
      }
    });
    
    console.log('✅ Demande créée:', newRequest.id);
    
    // Créer un message dans le système de messagerie interne
    console.log('📨 Création du message interne...');
    const messageService = MessageService.getInstance();
    
    // Construire le contenu du message
    let messageContent = `Nouvelle demande d'intervention électrique:\n\n`;
    messageContent += `Client: ${customer.name}\n`;
    messageContent += `Téléphone: ${customer.phone}\n`;
    if (customer.neighborhood) messageContent += `Quartier: ${customer.neighborhood}\n`;
    if (latitude && longitude) messageContent += `Position: ${latitude}, ${longitude}\n`;
    messageContent += `Type: ${inputType === 'text' ? 'Texte' : 'Audio'}\n`;
    messageContent += `Code de suivi: ${trackingCode}\n`;
    
    if (inputType === 'text' && description) {
      messageContent += `\nDescription:\n${description}`;
    }
    
    if (audioUrl) {
      messageContent += `\n\nMessage audio disponible dans la demande.`;
    }
    
    if (photoUrl) {
      messageContent += `\n\nPhoto jointe disponible dans la demande.`;
    }

    const messageResult = await messageService.createMessage({
      requestId: newRequest.id,
      type: 'REQUEST',
      senderName: customer.name,
      senderPhone: customer.phone,
      subject: `🆕 Nouvelle demande - ${customer.name}`,
      content: messageContent,
      priority: 'HIGH',
      audioUrl: audioUrl || undefined,
      photoUrl: photoUrl || undefined,
    });

    console.log('📨 Résultat de la création du message:', messageResult);

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
          await db.request.update({
            where: { id: newRequest.id },
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
      request: newRequest,
      message: messageResult,
      trackingCode: trackingCode
    });

  } catch (error) {
    console.error('❌ Erreur détaillée lors de la création de la demande:', error);
    console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      { error: 'Erreur lors de la création de la demande', details: error instanceof Error ? error.message : 'Erreur inconnue' },
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

    const requests = await db.request.findMany({
      where,
      include: {
        customer: true,
        technician: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(requests);

  } catch (error) {
    console.error('Error fetching requests:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des demandes' },
      { status: 500 }
    );
  }
}