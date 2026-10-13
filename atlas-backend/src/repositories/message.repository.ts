import { Message, MessageType, Sender } from '../generated/prisma/client';
import { prisma } from '../config/db';

export class MessageRepository {
  create(message: string, sentBy: Sender, messageType: MessageType, conversationId: string) {
    return prisma.message.create({
      data: {
        content: message,
        sentBy,
        messageType,
        conversationId,
      },
    });
  }

  findConversationHistory(
    conversationId: string,
    excludedMessageId: string,
    limit: number
  ): Promise<Message[]> {
    return prisma.message.findMany({
      where: {
        conversationId,
        id: { not: excludedMessageId },
      },
      orderBy: {
        sentAt: 'asc',
      },
      take: -limit,
    });
  }
}
