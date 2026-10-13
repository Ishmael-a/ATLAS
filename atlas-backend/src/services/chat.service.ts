import { Conversation } from '../generated/prisma/client';
import { Sender, MessageType } from '../generated/prisma/enums';
import { NotFoundError } from '../lib/errors';
import { ModelOrchestrator, modelOrchestrator } from '../integrations/model.orchestrator';
import { AboutRepository } from '../repositories/about.repository';
import { ConversationRepository } from '../repositories/conversation.repository';
import { ExperienceRepository } from '../repositories/experience.repository';
import { MessageRepository } from '../repositories/message.repository';
import { PageRepository } from '../repositories/page.repository';
import { ProjectRepository } from '../repositories/project.repository';
import { SkillRepository } from '../repositories/skill.repository';
import {
  AnswerAction,
  ClassificationAction,
  ClassificationActionType,
  NavigationAction,
  OutOfScopeAction,
} from '../types/integration';
import { ChatEventStream, SSEEventType } from '../types/sse';
import { getRandomStatus, StatusCategory } from '../utils/statusMessages';

const MAX_HISTORY_MESSAGES = 20;

export class ChatService {
  private conversationRepository: ConversationRepository;
  private messageRepository: MessageRepository;
  private pageRepository: PageRepository;
  private projectRepository: ProjectRepository;
  private skillRepository: SkillRepository;
  private experienceRepository: ExperienceRepository;
  private aboutRepository: AboutRepository;
  private modelClient: ModelOrchestrator;

  constructor() {
    this.modelClient = modelOrchestrator;
    this.conversationRepository = new ConversationRepository();
    this.messageRepository = new MessageRepository();
    this.pageRepository = new PageRepository();
    this.projectRepository = new ProjectRepository();
    this.skillRepository = new SkillRepository();
    this.experienceRepository = new ExperienceRepository();
    this.aboutRepository = new AboutRepository();
  }

  /** Method to find conversation by id */
  findConversationById(conversationId: string): Promise<Conversation | null> {
    return this.conversationRepository.findById(conversationId);
  }

  /** Method to create conversation */
  createConversation() {
    return this.conversationRepository.create();
  }

  /** Method to create a message */
  async createMessage(
    conversationId: string,
    message: string,
    sentBy: Sender,
    messageType: MessageType
  ) {
    const existingConversation = await this.findConversationById(conversationId);
    if (!existingConversation) {
      throw new NotFoundError('Conversation not found');
    }
    return this.messageRepository.create(message, sentBy, messageType, conversationId);
  }

  async handleMessage(
    message: string,
    conversationId: string,
    userMessageId: string,
    eventStream: ChatEventStream
  ): Promise<void> {
    const actions = await this.classifyMessage(message);
    const sortedActions = actions.sort(
      (firstAction, secondAction) => firstAction.priority - secondAction.priority
    );

    for (const action of sortedActions) {
      if (!eventStream.isClientConnected()) return;

      switch (action.type) {
        case ClassificationActionType.NAVIGATION:
          await this.handleNavigation(action, conversationId, eventStream);
          break;
        case ClassificationActionType.QUESTION:
          await this.handleQuestion(action, conversationId, userMessageId, eventStream);
          break;
        case ClassificationActionType.OUT_OF_SCOPE:
          await this.handleOutOfScope(action, conversationId, eventStream);
          break;
        default: {
          const unhandledAction: never = action;
          throw new Error(
            `No handler for classification action: ${JSON.stringify(unhandledAction)}`
          );
        }
      }
    }
  }

  private async handleNavigation(
    action: NavigationAction,
    conversationId: string,
    eventStream: ChatEventStream
  ) {
    const navigationRecord = `[NAVIGATION] page: ${action.pageName} | sectionElementId: ${action.sectionElementId ?? 'none'}`;
    await this.messageRepository.create(
      navigationRecord,
      Sender.SYSTEM,
      MessageType.NAVIGATION,
      conversationId
    );
    eventStream.sendEvent(SSEEventType.NAVIGATION, {
      page: action.pageName,
      pageSectionElementId: action.sectionElementId,
    });
  }

  private async handleQuestion(
    action: AnswerAction,
    conversationId: string,
    userMessageId: string,
    eventStream: ChatEventStream
  ) {
    const answer = await this.answerQuestion(
      action.query,
      conversationId,
      userMessageId,
      (status) => eventStream.sendEvent(SSEEventType.STATUS, { status })
    );
    // The visitor never saw this answer, so it must not enter their conversation history.
    if (!eventStream.isClientConnected()) return;
    const answerMessage = await this.messageRepository.create(
      answer,
      Sender.BOT,
      MessageType.ANSWER,
      conversationId
    );
    eventStream.sendEvent(SSEEventType.ANSWER, { message: answerMessage.content });
  }

  private async handleOutOfScope(
    action: OutOfScopeAction,
    conversationId: string,
    eventStream: ChatEventStream
  ) {
    const outOfScopeMessage = await this.messageRepository.create(
      action.message,
      Sender.SYSTEM,
      MessageType.OUT_OF_SCOPE,
      conversationId
    );
    eventStream.sendEvent(SSEEventType.OUT_OF_SCOPE, { message: outOfScopeMessage.content });
  }

  /** Method to classify a message using OpenAI */
  private async classifyMessage(message: string): Promise<ClassificationAction[]> {
    const pagesWithSections = await this.pageRepository.findAllWithSections();
    return this.modelClient.classifyMessage(message, pagesWithSections);
  }

  /** Method to fetch relevant context to question passed */
  private async fetchKnowledgeBaseContext(question: string) {
    // vectorize the question
    const vectorizedQuestion = await this.modelClient.vectorizeText(question);

    // fetch similar <> from relevant tables using vector search
    const [similarPages, similarProjects, similarSkills, similarExperiences, similarAbout] =
      await Promise.all([
        this.pageRepository.findAllWithSections(),
        this.projectRepository.findSimilar(vectorizedQuestion),
        this.skillRepository.findSimilar(vectorizedQuestion),
        this.experienceRepository.findSimilar(vectorizedQuestion),
        this.aboutRepository.findSimilar(vectorizedQuestion),
      ]);

    return {
      pages: similarPages,
      projects: similarProjects,
      skills: similarSkills,
      experiences: similarExperiences,
      about: similarAbout,
    };
  }

  /** Method to answer a question using OpenAI/GROQ */
  private async answerQuestion(
    question: string,
    conversationId: string,
    currentMessageId: string,
    onStatus?: (status: string) => void
  ): Promise<string> {
    onStatus?.(getRandomStatus(StatusCategory.SEARCHING));
    // fetch knowledge base context relevant to the question
    const context = await this.fetchKnowledgeBaseContext(question);

    // fetch converstaion history
    const conversationHistory = await this.messageRepository.findConversationHistory(
      conversationId,
      currentMessageId,
      MAX_HISTORY_MESSAGES
    );

    onStatus?.(getRandomStatus(StatusCategory.FINALIZING));
    return this.modelClient.answerQuestion(question, context, conversationHistory);
  }
}
