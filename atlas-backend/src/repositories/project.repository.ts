import { Project } from '../generated/prisma/client';
import { prisma } from '../config/db';
import {
  findSimilarInTable,
  updateEmbeddingInTable,
  VectorSearchTable,
} from '../utils/vectorSearch';

export class ProjectRepository {
  findSimilar(vector: number[]) {
    return findSimilarInTable(VectorSearchTable.PROJECT, vector, 5);
  }

  buildEmbeddingText(project: Project): string {
    return [
      `Project: ${project.name}.`,
      `Type: ${project.type}. Layer: ${project.layer}.`,
      `Tech stack: ${project.techStack.join(', ')}.`,
      `Highlights: ${project.highlights.join(', ')}.`,
      project.description,
    ].join(' ');
  }

  updateEmbedding(projectId: string, vector: number[]) {
    return updateEmbeddingInTable(VectorSearchTable.PROJECT, projectId, vector);
  }

  findAll(): Promise<Project[]> {
    return prisma.project.findMany();
  }

  findById(projectId: string): Promise<Project | null> {
    return prisma.project.findUnique({
      where: {
        id: projectId,
      },
    });
  }

  create(data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project> {
    return prisma.project.create({ data });
  }

  delete(projectId: string): Promise<Project> {
    return prisma.project.delete({
      where: {
        id: projectId,
      },
    });
  }
}
