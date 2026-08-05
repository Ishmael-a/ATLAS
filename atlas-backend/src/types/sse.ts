export type EVENT_TYPE = 'STATUS' | 'NAVIGATION' | 'ANSWER' | 'OUT_OF_SCOPE' | 'ERROR';

export interface EventTypeResponseMap {
  STATUS: {
    status: string;
  };
  NAVIGATION: {
    page: string;
    pageSectionElementId?: string | undefined;
    url?: string;
  };
  ANSWER: {
    message: string;
  };
  OUT_OF_SCOPE: {
    message: string;
  };
  ERROR: {
    message: string;
  };
}

export type SSEResponse = {
  [K in EVENT_TYPE]: {
    event: K;
    data: EventTypeResponseMap[K];
  };
};
