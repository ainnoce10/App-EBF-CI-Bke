import { NextRequest, NextResponse } from 'next/server';
import { MessageService } from '@/lib/message-service';

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { messageIds, action, status } = body;

    if (!messageIds || !Array.isArray(messageIds) || messageIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'IDs de messages invalides' },
        { status: 400 }
      );
    }

    const messageService = MessageService.getInstance();
    let result;

    switch (action) {
      case 'markAsRead':
        result = await messageService.markMultipleAsRead(messageIds);
        break;
      case 'archive':
        result = await messageService.archiveMultipleMessages(messageIds);
        break;
      case 'updateStatus':
        if (!status) {
          return NextResponse.json(
            { success: false, error: 'Statut manquant' },
            { status: 400 }
          );
        }
        result = await messageService.updateMultipleMessagesStatus(messageIds, status);
        break;
      default:
        return NextResponse.json(
          { success: false, error: 'Action non valide' },
          { status: 400 }
        );
    }

    if (result.success) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('❌ Erreur API PATCH /messages/batch:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}