import { Response } from 'express';
import { EVENT_TYPE, EventTypeResponseMap } from '../types/sse';

export class SSEStream {
  private response: Response;

  constructor(sseResponse: Response) {
    this.response = sseResponse;
  }

  open() {
    this.response.setHeader('Content-Type', 'text/event-stream');
    this.response.setHeader('Cache-Control', 'no-cache');
    this.response.setHeader('Connection', 'keep-alive');
    this.response.flushHeaders();
  }

  close() {
    this.response.end();
  }

  sendEvent<K extends EVENT_TYPE>(event: K, data: EventTypeResponseMap[K]) {
    if (event) this.response.write(`event: ${event}\n`);
    this.response.write(`data: ${JSON.stringify(data)}\n\n`);
  }
}
