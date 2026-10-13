/** Thrown for expected, client-caused failures whose message is safe to return as-is. */
export class ClientError extends Error {
  readonly statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}

export class ValidationError extends ClientError {
  constructor(message: string) {
    super(message, 400);
  }
}

export class NotFoundError extends ClientError {
  constructor(message: string) {
    super(message, 404);
  }
}

/** Thrown when a provider is unreachable/overloaded (network, timeout, 429, 5xx) — signals the registry to try the next provider, as opposed to a parsing/logic bug in the response. */
export class ProviderUnavailableError extends Error {}
