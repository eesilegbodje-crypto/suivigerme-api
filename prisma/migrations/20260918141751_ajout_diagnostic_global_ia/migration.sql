-- AlterTable
ALTER TABLE "ActionAccompagnement" ADD COLUMN     "formationLiee" TEXT;

-- AlterTable
ALTER TABLE "Participant" ADD COLUMN     "diagnosticGlobalGenereLe" TIMESTAMP(3),
ADD COLUMN     "diagnosticGlobalIa" JSONB;
