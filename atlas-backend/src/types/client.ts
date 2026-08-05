import { Message } from "../../generated/prisma/client";
import { ClassificationAction } from "./integration";


export type QuestionContext = {
  pages: any[];
  projects: any[];
  skills: any[];
  experiences: any[];
  about: any[];
}

export interface ModelClient {
  classifyMessage(message: string, pagesWithSections: any[]): Promise<ClassificationAction[]>
  answerQuestion(question: string, context: QuestionContext, conversationHistory: Message[]): Promise<string>
  ping?(): Promise<boolean>
}


export interface EmbeddingClient {
  embed(text: string): Promise<number[]>
}