import OpenAI, { APIConnectionError, RateLimitError, InternalServerError } from 'openai';
import { env } from '../config/env';
import { EmbeddingClient } from '../types/client';
import { ProviderUnavailableError } from '../lib/errors';

export class OpenAIEmbeddingClient implements EmbeddingClient {
  private client: OpenAI;
  private modelName: string;

  constructor() {
    this.modelName = 'text-embedding-3-small';
    this.client = new OpenAI({
      apiKey: env.OPENAI_API_KEY,
    });
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

  async embed(text: string): Promise<number[]> {
    if (!text) {
      throw new Error('Input text for embedding cannot be empty');
    }

    try {
      const response = await this.client.embeddings.create({
        model: this.modelName,
        input: text,
      });

      const values = response?.data[0]?.embedding;

      if (!values) {
        throw new Error('Failed to get embedding from OpenAI');
      }

      return values;
    } catch (error) {
      if (this.isProviderUnavailableError(error)) {
        throw new ProviderUnavailableError(error.message);
      }
      throw error;
    }
  }
}
