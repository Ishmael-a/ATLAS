import { Message } from '../generated/prisma/client';
import { ClassificationAction } from './integration';
import { PageWithSections } from '../repositories/page.repository';

export type QuestionContext = {
  pages: any[];
  projects: any[];
  skills: any[];
  experiences: any[];
  about: any[];
};

export interface ModelClientInterface {
  classifyMessage(
    message: string,
    pagesWithSections: PageWithSections[]
  ): Promise<ClassificationAction[]>;
  answerQuestion(
    question: string,
    context: QuestionContext,
    conversationHistory: Message[]
  ): Promise<string>;
}

export interface EmbeddingClient {
  embed(text: string): Promise<number[]>;
}
