import { prisma } from '../config/db';

export async function findSimilarInTable(tableName: string, vector: number[], limit: number) {
  // CRITICAL: Manually sanitize the tableName string to prevent SQL Injection
  if (!/^[a-zA-Z0-9_]+$/.test(tableName)) {
    throw new Error('Invalid table name characters detected!');
  }

  const vectorString = `[${vector.join(',')}]`;

  const query = `
    SELECT *, 1 - (embedding <=> $1::vector) AS similarity
    FROM "${tableName}"
    ORDER BY similarity DESC
    LIMIT $2
  `;

  const result = await prisma.$queryRawUnsafe(query, vectorString, limit);

  return result;
}
