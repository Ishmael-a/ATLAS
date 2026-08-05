import { Skill } from "../generated/prisma/client";
import { prisma } from "../config/db";
import { findSimilarInTable } from "../utils/vectorSearch";

export class SkillRepository {
  private tableName: string;

  constructor() {
    this.tableName = "Skill";
  }

  async findSimilar(vector: number[]) {
    const similarSkills = await findSimilarInTable(this.tableName, vector, 5)
    let sanitizedSkills = []
    for (const skill of similarSkills as any[]) {
      const { embedding, ...rest } = skill;
      sanitizedSkills.push(rest)
    }
    return sanitizedSkills;
  }

  findAll(): Promise<Skill[]> {
    return prisma.skill.findMany()
  }

  findById(skillId: string): Promise<Skill | null> {
    return prisma.skill.findUnique({
      where: {
        id: skillId
      }
    })
  }

  create(data: Omit<Skill, "id" | "createdAt" | "updatedAt">): Promise<Skill> {
    return prisma.skill.create({ data })
  }

  delete(skillId: string): Promise<Skill> {
    return prisma.skill.delete({
      where: {
        id: skillId
      }
    })
  }
}
