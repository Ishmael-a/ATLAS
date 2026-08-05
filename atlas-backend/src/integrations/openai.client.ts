import OpenAI, { APIConnectionError, RateLimitError, InternalServerError } from 'openai';
import { env } from '../config/env';
import { Message } from '../generated/prisma/client';
import { ClassificationResult } from '../types/integration';
import { ModelClient, QuestionContext } from '../types/client';
import { buildAnswerPrompt, buildClassificationPrompt } from '../utils/prompts';
import { ProviderUnavailableError } from '../lib/errors';

export class OpenAIClient implements ModelClient {
  private client: OpenAI;
  private modelName: string;

  constructor() {
    this.client = new OpenAI({
      apiKey: env.OPENAI_API_KEY,
    });
    this.modelName = env.OPENAI_MODEL_NAME || 'gpt-4o-mini';
  }

  private isProviderUnavailableError(
    error: unknown
  ): error is APIConnectionError | RateLimitError | InternalServerError {
    return (
      error instanceof APIConnectionError ||
      error instanceof RateLimitError ||
      error instanceof InternalServerError
    );
  }

  async ping(): Promise<boolean> {
    try {
      await this.client.chat.completions.create({
        model: this.modelName,
        messages: [{ role: 'user', content: 'hi' }],
        max_tokens: 1,
      });
      return true;
    } catch (error) {
      console.error('Error pinging OpenAI API:', error);
      return false;
    }
  }

  async classifyMessage(
    message: string,
    pagesWithSections: any[]
  ): Promise<ClassificationResult['actions']> {
    try {
      const classificationSystemPrompt = buildClassificationPrompt(pagesWithSections);
      const completion = await this.client.chat.completions.create({
        model: this.modelName,
        response_format: {
          type: 'json_object',
        },
        messages: [
          {
            role: 'system',
            content: classificationSystemPrompt,
          },
          {
            role: 'user',
            content: message,
          },
        ],
      });

      console.log('OpenAI classification response:', completion?.choices[0]?.message.content);

      const response = completion?.choices[0]?.message.content;
      if (!response) throw new Error('Empty classification response from OpenAI');
      const parsedResponse: ClassificationResult = JSON.parse(response);
      if (!parsedResponse.actions || !Array.isArray(parsedResponse.actions)) {
        throw new Error('Invalid classification response structure');
      }

      return parsedResponse.actions;
    } catch (error) {
      console.error('Error classifying message with OpenAI:', error);
      if (this.isProviderUnavailableError(error)) {
        throw new ProviderUnavailableError(error.message);
      }
      throw new Error(error instanceof Error ? error.message : 'Failed to classify message', {
        cause: error,
      });
    }
  }

  async answerQuestion(
    question: string,
    context: QuestionContext,
    conversationHistory: Message[]
  ): Promise<string> {
    try {
      const portfolioAssistantSystemPrompt = buildAnswerPrompt(context, conversationHistory);
      const completion = await this.client.chat.completions.create({
        model: this.modelName,
        messages: [
          {
            role: 'system',
            content: portfolioAssistantSystemPrompt,
          },
          {
            role: 'user',
            content: question,
          },
        ],
      });

      console.log('OpenAI answer response:', completion?.choices[0]?.message.content);

      const answer = completion?.choices[0]?.message.content;

      if (!answer) {
        throw new Error('No answer generated');
      }

      return answer;
    } catch (error) {
      console.error('Error answering question with OpenAI:', error);
      if (this.isProviderUnavailableError(error)) {
        throw new ProviderUnavailableError(error.message);
      }
      throw new Error(error instanceof Error ? error.message : 'Failed to answer question', {
        cause: error,
      });
    }
  }
}
