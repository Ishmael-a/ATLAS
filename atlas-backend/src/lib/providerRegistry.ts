import { ProviderUnavailableError } from './errors';

export class ProviderRegistry<T> {
  private providers: Map<string, T>;
  private currentProviderName: string;

  constructor(providers: Map<string, T>) {
    if (providers.size === 0) throw new Error('ProviderRegistry requires at least one provider');
    this.providers = providers;
    this.currentProviderName = providers.keys().next().value!;
  }

  getCurrentProvider(): T {
    return this.providers.get(this.currentProviderName)!;
  }

  getCurrentProviderName(): string {
    return this.currentProviderName;
  }

  /** The current provider has failed — switch to the next registered one. Throws ProviderUnavailableError if none remain. */
  switchToNextProvider(): void {
    const previousProviderName = this.currentProviderName;
    const nextEntry = this.findNextEntry(previousProviderName);
    if (!nextEntry) throw new ProviderUnavailableError('All providers are unavailable');
    this.currentProviderName = nextEntry[0];
    console.warn(`${previousProviderName} unavailable, switching to ${this.currentProviderName}`);
  }

  private findNextEntry(key: string): [string, T] | undefined {
    let foundKey = false;
    for (const entry of this.providers) {
      // We've already passed `key` in iteration order, so this entry is the one right after it.
      if (foundKey) return entry;
      if (entry[0] === key) foundKey = true;
    }
    return undefined;
  }
}
