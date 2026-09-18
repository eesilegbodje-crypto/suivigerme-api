-- CreateTable
CREATE TABLE "ActionAccompagnement" (
    "id" TEXT NOT NULL,
    "participantId" TEXT NOT NULL,
    "probleme" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "responsable" TEXT NOT NULL,
    "echeance" TIMESTAMP(3) NOT NULL,
    "statut" TEXT NOT NULL DEFAULT 'À faire',
    "noteVerification" TEXT,
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "majLe" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ActionAccompagnement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ActionAccompagnement_participantId_idx" ON "ActionAccompagnement"("participantId");

-- AddForeignKey
ALTER TABLE "ActionAccompagnement" ADD CONSTRAINT "ActionAccompagnement_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "Participant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
