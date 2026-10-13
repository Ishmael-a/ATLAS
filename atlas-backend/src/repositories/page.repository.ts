import { PageGetPayload } from '../generated/prisma/models';
import { prisma } from '../config/db';

export type PageWithSections = PageGetPayload<{ include: { PageSections: true } }>;

export class PageRepository {
  async findAllWithSections(): Promise<PageWithSections[]> {
    return prisma.page.findMany({
      include: {
        PageSections: true,
      },
    });
  }
}
