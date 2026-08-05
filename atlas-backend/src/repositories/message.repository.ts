import { Message, MessageType, Sender } from "../../generated/prisma/client";
import { prisma } from "../config/db";


export class MessageRepository {

  create(message: string, sentBy: Sender, messageType: MessageType, conversationId: string) {
    return prisma.message.create({
      data: {
        content: message,
        sentBy,
        messageType,
        conversationId
      }
    })
  }

  async findByConversationId(conversationId: string): Promise<Message[]> {
    return prisma.message.findMany({
      where: {
        conversationId
      },
      orderBy: {
        sentAt: "asc"
      }
    })
  }

}