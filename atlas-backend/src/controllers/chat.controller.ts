import { Request, Response } from 'express';
import { ChatService } from '../services/chat.service';
import { SSEStream } from '../streaming/sse';
import { ClientError, ValidationError } from '../lib/errors';
import { getRandomStatus, StatusCategory } from '../utils/statusMessages';
import { SSEEventType } from '../types/sse';
import { MessageType, Sender } from '../generated/prisma/enums';

class ChatController {
  private chatService: ChatService;

  constructor() {
    this.chatService = new ChatService();
  }

  async sendMessage(request: Request, response: Response) {
    let sseStream: SSEStream | undefined;
    try {
      // extract req.body
      const reqBody = request.body;
      if (!reqBody) throw new ValidationError('Request body is required');

      let conversationId = reqBody.conversationId;
      const message = reqBody.message;

      if (conversationId && typeof conversationId !== 'string')
        throw new ValidationError('conversationId must be a string');
      if (conversationId && !conversationId.trim().length)
        throw new ValidationError('Invalid conversationId');

      const MAX_MESSAGE_LENGTH = 150;
      if (!message) throw new ValidationError('Message is required');
      if (typeof message !== 'string') throw new ValidationError('Message must be a string');
      if (!message.trim().length) throw new ValidationError('Message cannot be empty');
      if (message.trim().length > MAX_MESSAGE_LENGTH)
        throw new ValidationError(`Message cannot exceed ${MAX_MESSAGE_LENGTH} characters`);

      // Create new conversation if conversationId is not provided
      if (!conversationId) {
        const conversation = await this.chatService.createConversation();
        conversationId = conversation.id;
      }

      // create message for conversation
      const userMessage = await this.chatService.createMessage(
        conversationId,
        message,
        Sender.USER,
        MessageType.USER
      );

      // prepare for clasification and send status updates
      sseStream = new SSEStream(response);
      sseStream.open();
      sseStream.sendEvent(SSEEventType.CONVERSATION, { conversationId });
      sseStream.sendEvent(SSEEventType.STATUS, {
        status: getRandomStatus(StatusCategory.THINKING),
      });

      await this.chatService.handleMessage(message, conversationId, userMessage.id, sseStream);

      // close the stream after all actions are processed until next question
      sseStream.close();
    } catch (error) {
      console.error('Error in sendMessage:', error);
      const isClientError = error instanceof ClientError;
      const clientMessage = isClientError
        ? error.message
        : 'Something went wrong while processing your message';

      if (response.headersSent && sseStream) {
        sseStream.sendEvent(SSEEventType.ERROR, {
          message: clientMessage,
        });
        sseStream.close();
      } else {
        return response.status(isClientError ? error.statusCode : 500).json({
          message: 'Error sending message',
          error: clientMessage,
        });
      }
    }
  }
}

// export instantiated instance of controller
export default new ChatController();
