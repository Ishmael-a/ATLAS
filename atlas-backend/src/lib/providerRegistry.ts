import { ProviderUnavailableError } from './errors';

export class ProviderRegistry<T> {
  private providers: Map<string, T>;

  constructor(providers: Map<string, T>) {
    if (providers.size === 0) throw new Error('ProviderRegistry requires at least one provider');
    this.providers = providers;
  }

  /** Tries each provider in registration order for this one call. No provider choice is stored, so one request's failure never changes the provider another request uses. */
  async callFirstAvailable<R>(callProvider: (provider: T) => Promise<R>): Promise<R> {
    for (const [providerName, provider] of this.providers) {
      try {
        return await callProvider(provider);
      } catch (error) {
        if (!(error instanceof ProviderUnavailableError)) throw error;
        console.warn(`${providerName} unavailable, trying the next provider: ${error.message}`);
      }
    }
    throw new ProviderUnavailableError('All providers are unavailable');
  }
}
