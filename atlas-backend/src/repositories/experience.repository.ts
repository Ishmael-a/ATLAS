import { Experience } from '../generated/prisma/client';
import { prisma } from '../config/db';
import {
  findSimilarInTable,
  updateEmbeddingInTable,
  VectorSearchTable,
} from '../utils/vectorSearch';

export class ExperienceRepository {
  findSimilar(vector: number[]) {
    return findSimilarInTable(VectorSearchTable.EXPERIENCE, vector, 5);
  }

  buildEmbeddingText(experience: Experience): string {
    return [
      `Experience: ${experience.title} at ${experience.company}.`,
      `Role: ${experience.role}. Location: ${experience.location}.`,
      experience.description,
    ].join(' ');
  }

  updateEmbedding(experienceId: string, vector: number[]) {
    return updateEmbeddingInTable(VectorSearchTable.EXPERIENCE, experienceId, vector);
  }

  findAll(): Promise<Experience[]> {
    return prisma.experience.findMany();
  }

  findById(experienceId: string): Promise<Experience | null> {
    return prisma.experience.findUnique({
      where: {
        id: experienceId,
      },
    });
  }

  create(data: Omit<Experience, 'id' | 'createdAt' | 'updatedAt'>): Promise<Experience> {
    return prisma.experience.create({ data });
  }

  delete(experienceId: string): Promise<Experience> {
    return prisma.experience.delete({
      where: {
        id: experienceId,
      },
    });
  }
}
