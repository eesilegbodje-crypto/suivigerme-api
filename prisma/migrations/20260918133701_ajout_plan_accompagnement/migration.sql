-- AlterTable
ALTER TABLE "ActionAccompagnement" ADD COLUMN     "evaluationAbfId" TEXT,
ADD COLUMN     "origine" TEXT NOT NULL DEFAULT 'Observation';

-- CreateIndex
CREATE INDEX "ActionAccompagnement_evaluationAbfId_idx" ON "ActionAccompagnement"("evaluationAbfId");

-- AddForeignKey
ALTER TABLE "ActionAccompagnement" ADD CONSTRAINT "ActionAccompagnement_evaluationAbfId_fkey" FOREIGN KEY ("evaluationAbfId") REFERENCES "EvaluationABF"("id") ON DELETE SET NULL ON UPDATE CASCADE;
