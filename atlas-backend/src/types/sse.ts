export enum SSEEventType {
  CONVERSATION = 'CONVERSATION',
  STATUS = 'STATUS',
  NAVIGATION = 'NAVIGATION',
  ANSWER = 'ANSWER',
  OUT_OF_SCOPE = 'OUT_OF_SCOPE',
  ERROR = 'ERROR',
}

export interface EventTypeResponseMap {
  [SSEEventType.CONVERSATION]: {
    conversationId: string;
  };
  [SSEEventType.STATUS]: {
    status: string;
  };
  [SSEEventType.NAVIGATION]: {
    page: string;
    pageSectionElementId?: string | undefined;
    url?: string;
  };
  [SSEEventType.ANSWER]: {
    message: string;
  };
  [SSEEventType.OUT_OF_SCOPE]: {
    message: string;
  };
  [SSEEventType.ERROR]: {
    message: string;
  };
}

export interface ChatEventStream {
  sendEvent<K extends SSEEventType>(event: K, data: EventTypeResponseMap[K]): void;
  isClientConnected(): boolean;
}
