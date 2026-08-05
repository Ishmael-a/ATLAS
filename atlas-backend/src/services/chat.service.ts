import { Conversation } from '../generated/prisma/client';
import { Sender, MessageType } from '../generated/prisma/enums';
import { ValidationError } from '../lib/errors';
import { ModelOrchestrator, modelOrchestrator } from '../integrations/model.orchestrator';
import { AboutRepository } from '../repositories/about.repository';
import { ConversationRepository } from '../repositories/conversation.repository';
import { ExperienceRepository } from '../repositories/experience.repository';
import { MessageRepository } from '../repositories/message.repository';
import { PageRepository } from '../repositories/page.repository';
import { ProjectRepository } from '../repositories/project.repository';
import { SkillRepository } from '../repositories/skill.repository';
import { ClassificationAction } from '../types/integration';

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
      throw new ValidationError('Conversation not found');
    }
    return this.messageRepository.create(message, sentBy, messageType, conversationId);
  }

  /** Method to classify a message using OpenAI */
  async classifyMessage(message: string): Promise<ClassificationAction[]> {
    const pagesWithSections = await this.pageRepository.findAllWithSections();
    return this.modelClient.classifyMessage(message, pagesWithSections);
  }

  /** Method to fetch relevant context to question passed */
  async fetchKnowledgeBaseContext(question: string) {
    // vectorize the question
    const vectorizedQuestion = await this.modelClient.vectorizeText(question);

    if (!vectorizedQuestion) {
      throw new Error('Failed to vectorize the question');
    }

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

  /** Method to answer a question using OpenAI */
  async answerQuestion(
    question: string,
    conversationId: string,
    onStatus?: (status: string) => void
  ): Promise<string> {
    onStatus?.("Searching through Yusif's work...");
    // fetch knowledge base context relevant to the question
    const context = await this.fetchKnowledgeBaseContext(question);

    // fetch converstaion history
    const messages = await this.messageRepository.findByConversationId(conversationId);

    onStatus?.('Almost there...');
    return this.modelClient.answerQuestion(question, context, messages);
  }
}
