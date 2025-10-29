import { NextRequest, NextResponse } from 'next/server';
import { MessageService } from '@/lib/message-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status') as any;
    const type = searchParams.get('type') as any;
    const priority = searchParams.get('priority') as any;
    const search = searchParams.get('search') || undefined;

    const messageService = MessageService.getInstance();
    const result = await messageService.getMessages({
      page,
      limit,
      status,
      type,
      priority,
      search,
    });

    if (result.success) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('❌ Erreur API GET /messages:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      requestId,
      type,
      senderName,
      senderPhone,
      senderEmail,
      subject,
      content,
      priority,
      audioUrl,
      photoUrl,
    } = body;

    // Validation des données requises
    if (!type || !senderName || !senderPhone || !subject || !content) {
      return NextResponse.json(
        { success: false, error: 'Données manquantes' },
        { status: 400 }
      );
    }

    const messageService = MessageService.getInstance();
    const result = await messageService.createMessage({
      requestId,
      type,
      senderName,
      senderPhone,
      senderEmail,
      subject,
      content,
      priority,
      audioUrl,
      photoUrl,
    });

    if (result.success) {
      // Envoyer une notification pour le nouveau message
      try {
        const notificationResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/notifications`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: result.message,
            type: 'new_message'
          })
        });
        
        console.log('🔔 Notification envoyée pour le nouveau message:', result.message?.id);
      } catch (notificationError) {
        console.error('❌ Erreur lors de l\'envoi de la notification:', notificationError);
        // Ne pas échouer la requête si la notification échoue
      }

      return NextResponse.json(result);
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('❌ Erreur API POST /messages:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}