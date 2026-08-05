import { Conversation } from "../generated/prisma/client";
import { prisma } from "../config/db";

export class ConversationRepository {

  create() {
    return prisma.conversation.create({
        data: {}
    })
  }

  findById(conversationId: string): Promise<Conversation | null> {
    return prisma.conversation.findUnique({
      where: {
        id: conversationId
      }
    })
  }


}