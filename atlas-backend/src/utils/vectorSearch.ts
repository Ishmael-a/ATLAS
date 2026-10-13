import { prisma } from '../config/db';

export enum VectorSearchTable {
  PROJECT = 'Project',
  SKILL = 'Skill',
  EXPERIENCE = 'Experience',
  ABOUT = 'About',
}

export async function findSimilarInTable(
  tableName: VectorSearchTable,
  vector: number[],
  limit: number
) {
  const vectorString = `[${vector.join(',')}]`;

  const query = `
    SELECT *, 1 - (embedding <=> $1::vector) AS similarity
    FROM "${tableName}"
    WHERE embedding IS NOT NULL
    ORDER BY similarity DESC
    LIMIT $2
  `;

  const similarRows = await prisma.$queryRawUnsafe<Record<string, unknown>[]>(
    query,
    vectorString,
    limit
  );

  return similarRows.map(
    ({ embedding: _embedding, ...rowWithoutEmbedding }) => rowWithoutEmbedding
  );
}

export async function updateEmbeddingInTable(
  tableName: VectorSearchTable,
  rowId: string,
  vector: number[]
) {
  await prisma.$executeRawUnsafe(
    `UPDATE "${tableName}" SET embedding = $1::vector WHERE id = $2`,
    `[${vector.join(',')}]`,
    rowId
  );
}
