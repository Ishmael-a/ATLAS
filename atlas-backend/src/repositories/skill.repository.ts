import { Skill } from '../generated/prisma/client';
import { prisma } from '../config/db';
import {
  findSimilarInTable,
  updateEmbeddingInTable,
  VectorSearchTable,
} from '../utils/vectorSearch';

export class SkillRepository {
  findSimilar(vector: number[]) {
    return findSimilarInTable(VectorSearchTable.SKILL, vector, 5);
  }

  buildEmbeddingText(skill: Skill): string {
    return [
      `Skill: ${skill.name}.`,
      `Category: ${skill.category}. Proficiency: ${skill.proficiency}.`,
      skill.description,
    ].join(' ');
  }

  updateEmbedding(skillId: string, vector: number[]) {
    return updateEmbeddingInTable(VectorSearchTable.SKILL, skillId, vector);
  }

  findAll(): Promise<Skill[]> {
    return prisma.skill.findMany();
  }

  findById(skillId: string): Promise<Skill | null> {
    return prisma.skill.findUnique({
      where: {
        id: skillId,
      },
    });
  }

  create(data: Omit<Skill, 'id' | 'createdAt' | 'updatedAt'>): Promise<Skill> {
    return prisma.skill.create({ data });
  }

  delete(skillId: string): Promise<Skill> {
    return prisma.skill.delete({
      where: {
        id: skillId,
      },
    });
  }
}
