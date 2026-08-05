/** Thrown for expected, client-caused failures whose message is safe to return as-is. */
export class ValidationError extends Error {}

/** Thrown when a provider is unreachable/overloaded (network, timeout, 429, 5xx) — signals a registry should switch to the next provider, as opposed to a parsing/logic bug in the response. */
export class ProviderUnavailableError extends Error {}
