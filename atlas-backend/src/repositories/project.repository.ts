import { Project } from '../generated/prisma/client';
import { prisma } from '../config/db';
import { findSimilarInTable } from '../utils/vectorSearch';

export class ProjectRepository {
  private tableName: string;

  constructor() {
    this.tableName = 'Project';
  }

  async findSimilar(vector: number[]) {
    const similarProjects = await findSimilarInTable(this.tableName, vector, 5);
    const sanitizedProjects = [];
    for (const project of similarProjects as any[]) {
      const { embedding: _embedding, ...rest } = project;
      sanitizedProjects.push(rest);
    }

    return sanitizedProjects;
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
