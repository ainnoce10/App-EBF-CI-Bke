import { NextRequest, NextResponse } from 'next/server';
import { MessageService } from '@/lib/message-service';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { action, status } = body;

    const messageService = MessageService.getInstance();
    let result;

    switch (action) {
      case 'markAsRead':
        result = await messageService.markAsRead(id);
        break;
      case 'archive':
        result = await messageService.archiveMessage(id);
        break;
      case 'updateStatus':
        result = await messageService.updateMessageStatus(id, status);
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
    console.error('❌ Erreur API PATCH /messages/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const messageService = MessageService.getInstance();
    const result = await messageService.deleteMessage(id);

    if (result.success) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('❌ Erreur API DELETE /messages/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}