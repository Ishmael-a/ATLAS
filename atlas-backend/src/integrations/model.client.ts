import OpenAI, { APIConnectionError, RateLimitError, InternalServerError } from 'openai';
import { Message } from '../generated/prisma/client';
import { ClassificationAction, ClassificationActionType } from '../types/integration';
import { ModelClientInterface, QuestionContext } from '../types/client';
import { PageWithSections } from '../repositories/page.repository';
import { buildAnswerPrompt, buildChatHistory, buildClassificationPrompt } from '../utils/prompts';
import { isStringEmpty } from '../utils/validation';
import { ProviderUnavailableError } from '../lib/errors';

type ModelClientConfig = {
  apiKey: string;
  baseURL?: string;
  modelName: string;
};

export class ModelClient implements ModelClientInterface {
  private client: OpenAI;
  private modelName: string;

  constructor(config: ModelClientConfig) {
    this.client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseURL,
    });
    this.modelName = config.modelName;
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

  async classifyMessage(
    message: string,
    pagesWithSections: PageWithSections[]
  ): Promise<ClassificationAction[]> {
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

      const response = completion?.choices[0]?.message.content;
      if (!response) throw new Error(`Empty classification response from ${this.modelName}`);
      const parsedResponse = JSON.parse(response);
      if (!Array.isArray(parsedResponse?.actions)) {
        throw new Error('Invalid classification response structure');
      }
      if (parsedResponse.actions.length === 0) throw new Error('Classifier returned no actions');

      return parsedResponse.actions.map((rawAction: unknown) =>
        this.parseClassificationAction(rawAction, pagesWithSections)
      );
    } catch (error) {
      console.error(`Error classifying message with ${this.modelName}:`, error);
      if (this.isProviderUnavailableError(error)) {
        throw new ProviderUnavailableError(error.message);
      }
      throw new Error(error instanceof Error ? error.message : 'Failed to classify message', {
        cause: error,
      });
    }
  }

  private parseClassificationAction(
    rawAction: unknown,
    pagesWithSections: PageWithSections[]
  ): ClassificationAction {
    const rawActionJson = JSON.stringify(rawAction);
    if (typeof rawAction !== 'object' || rawAction === null) {
      throw new Error(`Invalid classification action (not an object): ${rawActionJson}`);
    }
    const actionFields = rawAction as Record<string, unknown>;
    const priority = actionFields.priority;
    if (typeof priority !== 'number') {
      throw new Error(`Invalid classification action (priority is not a number): ${rawActionJson}`);
    }

    switch (actionFields.type) {
      case ClassificationActionType.QUESTION: {
        const query = actionFields.query;
        if (typeof query !== 'string' || isStringEmpty(query)) {
          throw new Error(`Invalid classification action (query is missing): ${rawActionJson}`);
        }
        return { type: ClassificationActionType.QUESTION, query, priority };
      }
      case ClassificationActionType.OUT_OF_SCOPE: {
        const outOfScopeMessage = actionFields.message;
        if (typeof outOfScopeMessage !== 'string' || isStringEmpty(outOfScopeMessage)) {
          throw new Error(`Invalid classification action (message is missing): ${rawActionJson}`);
        }
        return {
          type: ClassificationActionType.OUT_OF_SCOPE,
          message: outOfScopeMessage,
          priority,
        };
      }
      case ClassificationActionType.NAVIGATION: {
        const page = pagesWithSections.find(
          (candidatePage) => candidatePage.id === actionFields.pageId
        );
        if (!page) {
          throw new Error(`Invalid classification action (page does not exist): ${rawActionJson}`);
        }
        if (actionFields.sectionElementId == null) {
          return {
            type: ClassificationActionType.NAVIGATION,
            pageId: page.id,
            pageName: page.name,
            priority,
          };
        }
        const section = page.PageSections.find(
          (candidateSection) => candidateSection.elementId === actionFields.sectionElementId
        );
        if (!section) {
          throw new Error(
            `Invalid classification action (section does not exist on this page): ${rawActionJson}`
          );
        }
        return {
          type: ClassificationActionType.NAVIGATION,
          pageId: page.id,
          pageName: page.name,
          sectionId: section.id,
          sectionElementId: section.elementId,
          priority,
        };
      }
      default:
        throw new Error(`Invalid classification action (unknown action type): ${rawActionJson}`);
    }
  }

  async answerQuestion(
    question: string,
    context: QuestionContext,
    conversationHistory: Message[]
  ): Promise<string> {
    try {
      const portfolioAssistantSystemPrompt = buildAnswerPrompt(context);
      const completion = await this.client.chat.completions.create({
        model: this.modelName,
        messages: [
          {
            role: 'system',
            content: portfolioAssistantSystemPrompt,
          },
          ...buildChatHistory(conversationHistory),
          {
            role: 'user',
            content: question,
          },
        ],
      });

      const answer = completion?.choices[0]?.message.content;

      if (!answer) {
        throw new Error('No answer generated');
      }

      return answer;
    } catch (error) {
      console.error(`Error answering question with ${this.modelName}:`, error);
      if (this.isProviderUnavailableError(error)) {
        throw new ProviderUnavailableError(error.message);
      }
      throw new Error(error instanceof Error ? error.message : 'Failed to answer question', {
        cause: error,
      });
    }
  }
}
