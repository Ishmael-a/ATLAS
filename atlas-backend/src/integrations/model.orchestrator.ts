import { ModelClient } from '../types/client';
import { OpenAIClient } from './openai.client';
import { GroqClient } from './groq.client';
import { GeminiEmbeddingClient } from './gemini.embedding.client';
import { ProviderUnavailableError } from '../lib/errors';
import { ProviderRegistry } from '../lib/providerRegistry';

export class ModelOrchestrator implements ModelClient {
  private modelRegistry: ProviderRegistry<ModelClient>;
  private embeddingClient: GeminiEmbeddingClient;

  private constructor(modelRegistry: ProviderRegistry<ModelClient>) {
    this.modelRegistry = modelRegistry;
    this.embeddingClient = new GeminiEmbeddingClient();
  }

  static async create(): Promise<ModelOrchestrator> {
    const modelRegistry = new ProviderRegistry<ModelClient>(
      new Map(
        Object.entries({
          openai: new OpenAIClient(),
          groq: new GroqClient(),
        })
      )
    );

    while (!(await modelRegistry.getCurrentProvider().ping?.())) {
      modelRegistry.switchToNextProvider();
    }

    console.log(`Successfully connected to ${modelRegistry.getCurrentProviderName()}`);

    return new ModelOrchestrator(modelRegistry);
  }

  vectorizeText(text: string): Promise<number[]> {
    return this.embeddingClient.embed(text);
  }

  async classifyMessage(message: string, pagesWithSections: any[]): Promise<any> {
    try {
      return await this.modelRegistry
        .getCurrentProvider()
        .classifyMessage(message, pagesWithSections);
    } catch (error) {
      if (!(error instanceof ProviderUnavailableError)) throw error;
      this.modelRegistry.switchToNextProvider();
      return this.classifyMessage(message, pagesWithSections);
    }
  }

  async answerQuestion(question: string, context: any, conversationHistory: any): Promise<string> {
    try {
      return await this.modelRegistry
        .getCurrentProvider()
        .answerQuestion(question, context, conversationHistory);
    } catch (error) {
      if (!(error instanceof ProviderUnavailableError)) throw error;
      this.modelRegistry.switchToNextProvider();
      return this.answerQuestion(question, context, conversationHistory);
    }
  }
}

export const modelOrchestrator = await ModelOrchestrator.create();
