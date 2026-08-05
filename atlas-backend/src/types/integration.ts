export type ClassificationResult = {
  actions: ClassificationAction[];
};

export type ClassificationAction = NavigationAction | AnswerAction | OutOfScopeAction;

type NavigationAction = {
  type: 'NAVIGATION';
  pageId: string;
  pageName: string;
  sectionId?: string;
  sectionElementId?: string;
  url?: string;
  priority: number;
};

type AnswerAction = {
  type: 'QUESTION';
  query: string;
  priority: number;
};

type OutOfScopeAction = {
  type: 'OUT_OF_SCOPE';
  message: string;
  priority: number;
};
