import { About } from '../generated/prisma/client';
import { prisma } from '../config/db';
import { findSimilarInTable } from '../utils/vectorSearch';

export class AboutRepository {
  private tableName: string;

  constructor() {
    this.tableName = 'About';
  }

  async findSimilar(vector: number[]) {
    const similarAbout = await findSimilarInTable(this.tableName, vector, 5);
    const sanitizedAbout = [];
    for (const about of similarAbout as any[]) {
      const { embedding: _embedding, ...rest } = about;
      sanitizedAbout.push(rest);
    }
    return sanitizedAbout;
  }

  findAll(): Promise<About[]> {
    return prisma.about.findMany();
  }

  findById(aboutId: string): Promise<About | null> {
    return prisma.about.findUnique({
      where: {
        id: aboutId,
      },
    });
  }

  create(data: Omit<About, 'id' | 'createdAt' | 'updatedAt'>): Promise<About> {
    return prisma.about.create({ data });
  }

  delete(aboutId: string): Promise<About> {
    return prisma.about.delete({
      where: {
        id: aboutId,
      },
    });
  }
}
