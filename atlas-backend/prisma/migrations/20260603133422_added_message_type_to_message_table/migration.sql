/*
  Warnings:

  - You are about to drop the column `embedding` on the `About` table. All the data in the column will be lost.
  - You are about to drop the column `embedding` on the `Experience` table. All the data in the column will be lost.
  - You are about to drop the column `embedding` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `embedding` on the `Skill` table. All the data in the column will be lost.
  - Added the required column `messageType` to the `Message` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "MessageType" AS ENUM ('USER', 'ANSWER', 'NAVIGATION', 'OUT_OF_SCOPE');

-- AlterTable
ALTER TABLE "About" DROP COLUMN "embedding";

-- AlterTable
ALTER TABLE "Experience" DROP COLUMN "embedding";

-- AlterTable
ALTER TABLE "Message" ADD COLUMN "messageType" "MessageType" NOT NULL;

-- AlterTable
ALTER TABLE "Project" DROP COLUMN "embedding";

-- AlterTable
ALTER TABLE "Skill" DROP COLUMN "embedding";

-- Re-add embedding columns as pgvector
ALTER TABLE "Project" ADD COLUMN embedding vector(1536);
ALTER TABLE "Skill" ADD COLUMN embedding vector(1536);
ALTER TABLE "Experience" ADD COLUMN embedding vector(1536);
ALTER TABLE "About" ADD COLUMN embedding vector(1536);