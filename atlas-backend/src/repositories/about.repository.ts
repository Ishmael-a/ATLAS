import { About } from '../generated/prisma/client';
import { prisma } from '../config/db';
import {
  findSimilarInTable,
  updateEmbeddingInTable,
  VectorSearchTable,
} from '../utils/vectorSearch';

export class AboutRepository {
  findSimilar(vector: number[]) {
    return findSimilarInTable(VectorSearchTable.ABOUT, vector, 5);
  }

  buildEmbeddingText(about: About): string {
    return ['About Yusif.', 'Contact: email, phone, LinkedIn, GitHub.', about.bio].join(' ');
  }

  updateEmbedding(aboutId: string, vector: number[]) {
    return updateEmbeddingInTable(VectorSearchTable.ABOUT, aboutId, vector);
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
