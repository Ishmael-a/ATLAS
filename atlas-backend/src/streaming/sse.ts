import { Response } from 'express';
import { ChatEventStream, EventTypeResponseMap, SSEEventType } from '../types/sse';

export class SSEStream implements ChatEventStream {
  private response: Response;
  private clientConnected: boolean;

  constructor(sseResponse: Response) {
    this.response = sseResponse;
    this.clientConnected = true;
  }

  open() {
    this.response.setHeader('Content-Type', 'text/event-stream');
    this.response.setHeader('Cache-Control', 'no-cache');
    this.response.setHeader('Connection', 'keep-alive');
    this.response.flushHeaders();
    this.response.on('close', () => {
      this.clientConnected = false;
    });
  }

  isClientConnected(): boolean {
    return this.clientConnected;
  }

  close() {
    this.response.end();
  }

  sendEvent<K extends SSEEventType>(event: K, data: EventTypeResponseMap[K]) {
    if (!this.clientConnected) return;
    if (event) this.response.write(`event: ${event}\n`);
    this.response.write(`data: ${JSON.stringify(data)}\n\n`);
  }
}
