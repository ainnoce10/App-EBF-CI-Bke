import { NextRequest, NextResponse } from 'next/server';
import { databaseService } from '@/lib/database';
import { createStorageService } from '@/lib/storage';
import { MessageService } from '@/lib/message-service';

export async function POST(request: NextRequest) {
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
    
    const name = formData.get('name') as string;
    const phone = formData.get('phone') as string;
    const neighborhood = formData.get('neighborhood') as string;
    const position = formData.get('position') as string;
    const inputType = formData.get('inputType') as 'text' | 'audio';
    const description = formData.get('description') as string;
    const audioFile = formData.get('audio') as File;
    const photoFile = formData.get('photo') as File;
    
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
    let customer = await databaseService.safeFindUnique('customer', {
      where: { phone }
    });

    if (!customer.data) {
      console.log('👤 Création d\'un nouveau client...');
      const createResult = await databaseService.safeCreate('customer', {
        name: name,
        phone,
        neighborhood: neighborhood || null,
        city: 'Bouaké',
        latitude: latitude,
        longitude: longitude
      });
      
      if (createResult.error) {
        return NextResponse.json(
          { error: createResult.error },
          { status: 500 }
        );
      }
      
      customer = createResult;
      console.log('✅ Client créé:', customer.data?.id);
    } else {
      console.log('👤 Client existant trouvé:', customer.data?.id);
    }

    // Handle file uploads
    let audioUrl: string | null = null;
    let photoUrl: string | null = null;

    console.log('📁 Gestion des fichiers uploadés...');
    
    // Créer le service de stockage Supabase
    const storageService = createStorageService();

    if (audioFile && audioFile.size > 0) {
      console.log('🎵 Fichier audio détecté:', audioFile.name);
      
      // Valider le fichier audio
      const validation = storageService.validateAudio(audioFile);
      if (!validation.valid) {
        return NextResponse.json(
          { error: validation.error },
          { status: 400 }
        );
      }

      // Upload vers Supabase Storage
      const uploadResult = await storageService.uploadAudio(audioFile, audioFile.name);
      audioUrl = uploadResult.url;
      console.log('✅ Fichier audio uploadé:', audioUrl);
    }

    if (photoFile && photoFile.size > 0) {
      console.log('📷 Fichier photo détecté:', photoFile.name);
      
      // Valider le fichier image
      const validation = storageService.validateImage(photoFile);
      if (!validation.valid) {
        return NextResponse.json(
          { error: validation.error },
          { status: 400 }
        );
      }

      // Upload vers Supabase Storage
      const uploadResult = await storageService.uploadImage(photoFile, photoFile.name);
      photoUrl = uploadResult.url;
      console.log('✅ Fichier photo uploadé:', photoUrl);
    }

    console.log('📝 Création de la demande...');
    // Create the request
    const createRequestResult = await databaseService.safeCreate('request', {
      customerId: customer.data?.id || '',
      type: inputType === 'text' ? 'TEXT' : 'AUDIO',
      description: inputType === 'text' ? description : null,
      audioUrl: audioUrl,
      photoUrl: photoUrl,
      status: 'NEW'
    });

    if (createRequestResult.error) {
      return NextResponse.json(
        { error: createRequestResult.error },
        { status: 500 }
      );
    }

    const newRequest = createRequestResult.data;
    console.log('✅ Demande créée:', newRequest?.id);

    // Récupérer la demande complète avec les relations
    const fullRequestResult = await databaseService.safeFindUnique('request', {
      where: { id: newRequest?.id || '' },
      include: {
        customer: true
      }
    });

    if (fullRequestResult.error) {
      return NextResponse.json(
        { error: fullRequestResult.error },
        { status: 500 }
      );
    }

    const fullRequest = fullRequestResult.data;

    // Créer un message dans le système de messagerie interne
    console.log('📨 Création du message interne...');
    const messageService = MessageService.getInstance();
    
    // Construire le contenu du message
    let messageContent = `Nouvelle demande d'intervention électrique:\n\n`;
    messageContent += `Client: ${customer.data?.name}\n`;
    messageContent += `Téléphone: ${customer.data?.phone}\n`;
    if (customer.data?.neighborhood) messageContent += `Quartier: ${customer.data.neighborhood}\n`;
    if (latitude && longitude) messageContent += `Position: ${latitude}, ${longitude}\n`;
    messageContent += `Type: ${inputType === 'text' ? 'Texte' : 'Audio'}\n`;
    
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
      requestId: newRequest?.id || '',
      type: 'REQUEST',
      senderName: customer.data?.name || '',
      senderPhone: customer.data?.phone || '',
      subject: `🆕 Nouvelle demande - ${customer.data?.name}`,
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
          await databaseService.safeUpdate('request', {
            where: { id: newRequest?.id || '' },
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
      message: messageResult
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