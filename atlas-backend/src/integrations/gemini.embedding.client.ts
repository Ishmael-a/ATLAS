import { GoogleGenAI, ApiError } from '@google/genai';
import { env } from '../config/env';
import { EmbeddingClient } from '../types/client';
import { ProviderUnavailableError } from '../lib/errors';

export class GeminiEmbeddingClient implements EmbeddingClient {
  private client: GoogleGenAI;
  private modelName: string;

  constructor() {
    this.modelName = 'gemini-embedding-001';
    this.client = new GoogleGenAI({
      apiKey: env.GOOGLE_GENAI_API_KEY,
    });
  }

  private isProviderUnavailableError(error: unknown): error is ApiError {
    return error instanceof ApiError && (error.status === 429 || error.status >= 500);
  }

  async embed(text: string): Promise<number[]> {
    if (!text) {
      throw new Error('Input text for embedding cannot be empty');
    }

    try {
      const response = await this.client.models.embedContent({
        model: this.modelName,
        contents: text,
        config: {
          outputDimensionality: 1536,
        },
      });

      const values = response?.embeddings?.[0]?.values;

      if (!values) {
        throw new Error('Failed to get embedding from Gemini');
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
