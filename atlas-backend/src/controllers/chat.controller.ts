import { Request, Response } from 'express';
import { ChatService } from '../services/chat.service';
import { SSEStream } from '../streaming/sse';
import { ValidationError } from '../lib/errors';

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
      await this.chatService.createMessage(conversationId, message, 'USER', 'USER');

      // prepare for clasification and send status updates
      sseStream = new SSEStream(response);
      sseStream.open();
      sseStream.sendEvent('STATUS', {
        status: 'Let me think about that..',
      });

      // classify message with OpenAI
      const actions = await this.chatService.classifyMessage(message);

      const sortedActions = actions.sort((a, b) => a.priority - b.priority);

      for (const action of sortedActions) {
        if (action.type === 'NAVIGATION') {
          const type = 'NAVIGATION';
          const answer = `[NAVIGATION] page: ${action.pageName} | sectionElementId: ${action.sectionElementId ?? 'none'}`;
          await this.chatService.createMessage(conversationId, answer, 'SYSTEM', type);
          sseStream.sendEvent(type, {
            page: action.pageName,
            pageSectionElementId: action.sectionElementId,
          });
        } else if (action.type === 'QUESTION') {
          const type = 'ANSWER';
          const answer = await this.chatService.answerQuestion(
            action.query,
            conversationId,
            (status: string) => sseStream?.sendEvent('STATUS', { status })
          );
          const responseMessage = await this.chatService.createMessage(
            conversationId,
            answer,
            'BOT',
            type
          );
          sseStream.sendEvent(type, {
            message: responseMessage.content,
          });
        } else {
          const type = 'OUT_OF_SCOPE';
          const responseMessage = await this.chatService.createMessage(
            conversationId,
            action.message,
            'SYSTEM',
            type
          );
          sseStream.sendEvent('OUT_OF_SCOPE', {
            message: responseMessage.content,
          });
        }
      }

      // close the stream after all actions are processed until next question
      sseStream.close();
    } catch (error) {
      console.error('Error in sendMessage:', error);
      const isValidationError = error instanceof ValidationError;
      const clientMessage = isValidationError
        ? error.message
        : 'Something went wrong while processing your message';

      if (response.headersSent && sseStream) {
        sseStream.sendEvent('ERROR', {
          message: clientMessage,
        });
        sseStream.close();
      } else {
        return response.status(isValidationError ? 400 : 500).json({
          message: 'Error sending message',
          error: clientMessage,
        });
      }
    }
  }
}

// export instantiated instance of controller
export default new ChatController();
