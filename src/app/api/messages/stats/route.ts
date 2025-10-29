import { NextRequest, NextResponse } from 'next/server';
import { MessageService } from '@/lib/message-service';

export async function GET(request: NextRequest) {
  try {
    const messageService = MessageService.getInstance();
    const result = await messageService.getMessageStats();

    if (result.success) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('❌ Erreur API GET /messages/stats:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}