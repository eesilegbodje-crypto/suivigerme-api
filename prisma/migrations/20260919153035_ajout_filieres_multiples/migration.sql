/*
  Warnings:

  - You are about to drop the column `filiere` on the `Participant` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Participant" DROP COLUMN "filiere",
ADD COLUMN     "filieres" TEXT[] DEFAULT ARRAY[]::TEXT[];
