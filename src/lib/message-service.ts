import { db } from './db';

// Service de messagerie interne pour la gestion des communications
export class MessageService {
  private static instance: MessageService;

  static getInstance(): MessageService {
    if (!MessageService.instance) {
      MessageService.instance = new MessageService();
    }
    return MessageService.instance;
  }

  // Créer un nouveau message
  async createMessage(data: {
    requestId?: string;
    type: 'REQUEST' | 'CONTACT' | 'REVIEW' | 'SYSTEM';
    senderName: string;
    senderPhone: string;
    senderEmail?: string;
    subject: string;
    content: string;
    priority?: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
    audioUrl?: string;
    photoUrl?: string;
  }) {
    try {
      const message = await db.message.create({
        data: {
          ...data,
          priority: data.priority || 'NORMAL',
        },
        include: {
          request: {
            include: {
              customer: true,
              technician: true,
            },
          },
        },
      });

      console.log('✅ Message créé avec succès:', message.id);
      return { success: true, message };
    } catch (error) {
      console.error('❌ Erreur lors de la création du message:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      };
    }
  }

  // Récupérer tous les messages avec pagination et filtres
  async getMessages(options: {
    page?: number;
    limit?: number;
    status?: 'UNREAD' | 'READ' | 'ARCHIVED' | 'IN_PROGRESS' | 'COMPLETED' | 'URGENT';
    type?: 'REQUEST' | 'CONTACT' | 'REVIEW' | 'SYSTEM';
    priority?: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
    search?: string;
  } = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        status,
        type,
        priority,
        search,
      } = options;

      const skip = (page - 1) * limit;

      const where: any = {};

      if (status) where.status = status;
      if (type) where.type = type;
      if (priority) where.priority = priority;

      if (search) {
        where.OR = [
          { senderName: { contains: search, mode: 'insensitive' } },
          { senderPhone: { contains: search, mode: 'insensitive' } },
          { subject: { contains: search, mode: 'insensitive' } },
          { content: { contains: search, mode: 'insensitive' } },
        ];
      }

      const [messages, total] = await Promise.all([
        db.message.findMany({
          where,
          include: {
            request: {
              include: {
                customer: true,
                technician: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        db.message.count({ where }),
      ]);

      return {
        success: true,
        messages,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des messages:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      };
    }
  }

  // Marquer un message comme lu
  async markAsRead(messageId: string) {
    try {
      const message = await db.message.update({
        where: { id: messageId },
        data: { status: 'READ' },
      });

      console.log('✅ Message marqué comme lu:', messageId);
      return { success: true, message };
    } catch (error) {
      console.error('❌ Erreur lors du marquage comme lu:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      };
    }
  }

  // Archiver un message
  async archiveMessage(messageId: string) {
    try {
      const message = await db.message.update({
        where: { id: messageId },
        data: { status: 'ARCHIVED' },
      });

      console.log('✅ Message archivé:', messageId);
      return { success: true, message };
    } catch (error) {
      console.error('❌ Erreur lors de l\'archivage:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      };
    }
  }

  // Supprimer un message
  async deleteMessage(messageId: string) {
    try {
      await db.message.delete({
        where: { id: messageId },
      });

      console.log('✅ Message supprimé:', messageId);
      return { success: true };
    } catch (error) {
      console.error('❌ Erreur lors de la suppression:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      };
    }
  }

  // Obtenir les statistiques des messages
  async getMessageStats() {
    try {
      const [
        total,
        unread,
        read,
        archived,
        inProgress,
        completed,
        urgent,
        byType,
        byPriority,
      ] = await Promise.all([
        db.message.count(),
        db.message.count({ where: { status: 'UNREAD' } }),
        db.message.count({ where: { status: 'READ' } }),
        db.message.count({ where: { status: 'ARCHIVED' } }),
        db.message.count({ where: { status: 'IN_PROGRESS' } }),
        db.message.count({ where: { status: 'COMPLETED' } }),
        db.message.count({ where: { status: 'URGENT' } }),
        db.message.groupBy({
          by: ['type'],
          _count: true,
        }),
        db.message.groupBy({
          by: ['priority'],
          _count: true,
        }),
      ]);

      return {
        success: true,
        stats: {
          total,
          unread,
          read,
          archived,
          inProgress,
          completed,
          urgent,
          byType: byType.reduce((acc, item) => {
            acc[item.type] = item._count;
            return acc;
          }, {} as Record<string, number>),
          byPriority: byPriority.reduce((acc, item) => {
            acc[item.priority] = item._count;
            return acc;
          }, {} as Record<string, number>),
        },
      };
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des statistiques:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      };
    }
  }

  // Marquer plusieurs messages comme lus
  async markMultipleAsRead(messageIds: string[]) {
    try {
      await db.message.updateMany({
        where: { id: { in: messageIds } },
        data: { status: 'READ' },
      });

      console.log(`✅ ${messageIds.length} messages marqués comme lus`);
      return { success: true };
    } catch (error) {
      console.error('❌ Erreur lors du marquage multiple comme lu:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      };
    }
  }

  // Archiver plusieurs messages
  async archiveMultipleMessages(messageIds: string[]) {
    try {
      await db.message.updateMany({
        where: { id: { in: messageIds } },
        data: { status: 'ARCHIVED' },
      });

      console.log(`✅ ${messageIds.length} messages archivés`);
      return { success: true };
    } catch (error) {
      console.error('❌ Erreur lors de l\'archivage multiple:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      };
    }
  }

  // Mettre à jour le statut d'un message
  async updateMessageStatus(messageId: string, status: string) {
    try {
      const message = await db.message.update({
        where: { id: messageId },
        data: { status },
      });

      console.log(`✅ Message ${messageId} mis à jour avec le statut: ${status}`);
      return { success: true, message };
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour du statut:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      };
    }
  }

  // Mettre à jour le statut de plusieurs messages
  async updateMultipleMessagesStatus(messageIds: string[], status: string) {
    try {
      await db.message.updateMany({
        where: { id: { in: messageIds } },
        data: { status },
      });

      console.log(`✅ ${messageIds.length} messages mis à jour avec le statut: ${status}`);
      return { success: true };
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour groupée du statut:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      };
    }
  }
}