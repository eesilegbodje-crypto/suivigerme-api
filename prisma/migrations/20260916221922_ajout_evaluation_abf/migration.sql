-- CreateTable
CREATE TABLE "EvaluationABF" (
    "id" TEXT NOT NULL,
    "participantId" TEXT NOT NULL,
    "moment" TEXT NOT NULL,
    "dateEvaluation" TIMESTAMP(3) NOT NULL,
    "reponses" JSONB NOT NULL,
    "besoinsDomaines" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "besoinsAutre" TEXT,
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EvaluationABF_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NoteSuivi" (
    "id" TEXT NOT NULL,
    "participantId" TEXT NOT NULL,
    "dateNote" TIMESTAMP(3) NOT NULL,
    "contenu" TEXT NOT NULL,
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NoteSuivi_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EvaluationABF_participantId_idx" ON "EvaluationABF"("participantId");

-- CreateIndex
CREATE INDEX "NoteSuivi_participantId_idx" ON "NoteSuivi"("participantId");

-- AddForeignKey
ALTER TABLE "EvaluationABF" ADD CONSTRAINT "EvaluationABF_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "Participant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NoteSuivi" ADD CONSTRAINT "NoteSuivi_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "Participant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
