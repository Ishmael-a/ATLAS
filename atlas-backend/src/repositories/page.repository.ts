import { PageGetPayload } from "../generated/prisma/models";
import { prisma } from "../config/db";
import { findSimilarInTable } from "../utils/vectorSearch";

type PageWithSections = PageGetPayload<{ include: { PageSections: true } }>;


export class PageRepository {
  private tableName: string;

  constructor() {
    this.tableName = "Page";
  }

  async findSimilar(vector: number[]) {
    const similarPages = await findSimilarInTable(this.tableName, vector, 5)
    let sanitizedPages = []
    for (const page of similarPages as any[]) {
      const { embedding, ...rest } = page;
      sanitizedPages.push(rest)
    }
    return sanitizedPages;
  }

  async findAllWithSections(): Promise<PageWithSections[]> {
    return prisma.page.findMany({
      include: {
        PageSections: true
      }
    })
  }

}