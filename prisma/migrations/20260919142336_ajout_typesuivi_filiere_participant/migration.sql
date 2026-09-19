-- AlterTable
ALTER TABLE "Participant" ADD COLUMN     "filiere" TEXT,
ADD COLUMN     "typeSuivi" TEXT NOT NULL DEFAULT 'Generique';
