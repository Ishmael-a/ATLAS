export enum ClassificationActionType {
  NAVIGATION = 'NAVIGATION',
  QUESTION = 'QUESTION',
  OUT_OF_SCOPE = 'OUT_OF_SCOPE',
}

export type ClassificationAction = NavigationAction | AnswerAction | OutOfScopeAction;

export type NavigationAction = {
  type: ClassificationActionType.NAVIGATION;
  pageId: string;
  pageName: string;
  sectionId?: string;
  sectionElementId?: string;
  url?: string;
  priority: number;
};

export type AnswerAction = {
  type: ClassificationActionType.QUESTION;
  query: string;
  priority: number;
};

export type OutOfScopeAction = {
  type: ClassificationActionType.OUT_OF_SCOPE;
  message: string;
  priority: number;
};
