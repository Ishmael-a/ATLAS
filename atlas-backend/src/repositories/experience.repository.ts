import { Experience } from "../../generated/prisma/client";
import { prisma } from "../config/db";
import { findSimilarInTable } from "../utils/vectorSearch";

export class ExperienceRepository {
  private tableName: string;

  constructor() {
    this.tableName = "Experience";
  }

  async findSimilar(vector: number[]) {
    const similarExperiences = await findSimilarInTable(this.tableName, vector, 5)
    let sanitizedExperiences = []
    for (const experience of similarExperiences as any[]) {
      const { embedding, ...rest } = experience;
      sanitizedExperiences.push(rest)
    }
    return sanitizedExperiences;
  }

  findAll(): Promise<Experience[]> {
    return prisma.experience.findMany()
  }

  findById(experienceId: string): Promise<Experience | null> {
    return prisma.experience.findUnique({
      where: {
        id: experienceId
      }
    })
  }

  create(data: Omit<Experience, "id" | "createdAt" | "updatedAt">): Promise<Experience> {
    return prisma.experience.create({ data })
  }

  delete(experienceId: string): Promise<Experience> {
    return prisma.experience.delete({
      where: {
        id: experienceId
      }
    })
  }
}
