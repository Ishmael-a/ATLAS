import { env } from '../config/env';
import { Message } from '../generated/prisma/client';
import { ModelClientInterface, QuestionContext } from '../types/client';
import { ClassificationAction } from '../types/integration';
import { ModelClient } from './model.client';
import { GeminiEmbeddingClient } from './gemini.embedding.client';
import { ProviderRegistry } from '../lib/providerRegistry';
import { PageWithSections } from '../repositories/page.repository';

export class ModelOrchestrator implements ModelClientInterface {
  private modelRegistry: ProviderRegistry<ModelClientInterface>;
  private embeddingClient: GeminiEmbeddingClient;

  constructor(modelRegistry: ProviderRegistry<ModelClientInterface>) {
    this.modelRegistry = modelRegistry;
    this.embeddingClient = new GeminiEmbeddingClient();
  }

  vectorizeText(text: string): Promise<number[]> {
    return this.embeddingClient.embed(text);
  }

  classifyMessage(
    message: string,
    pagesWithSections: PageWithSections[]
  ): Promise<ClassificationAction[]> {
    return this.modelRegistry.callFirstAvailable((modelClient) =>
      modelClient.classifyMessage(message, pagesWithSections)
    );
  }

  answerQuestion(
    question: string,
    context: QuestionContext,
    conversationHistory: Message[]
  ): Promise<string> {
    return this.modelRegistry.callFirstAvailable((modelClient) =>
      modelClient.answerQuestion(question, context, conversationHistory)
    );
  }
}

export const modelOrchestrator = new ModelOrchestrator(
  new ProviderRegistry<ModelClientInterface>(
    new Map(
      Object.entries({
        openai: new ModelClient({
          apiKey: env.OPENAI_API_KEY,
          modelName: env.OPENAI_MODEL_NAME || 'gpt-4o-mini',
        }),
        groq: new ModelClient({
          apiKey: env.GROQ_API_KEY,
          baseURL: 'https://api.groq.com/openai/v1',
          modelName: env.GROQ_MODEL_NAME || 'llama-3.3-70b-versatile',
        }),
      })
    )
  )
);
