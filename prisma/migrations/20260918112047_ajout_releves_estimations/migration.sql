-- CreateTable
CREATE TABLE "ReleveMensuel" (
    "id" TEXT NOT NULL,
    "participantId" TEXT NOT NULL,
    "mois" TIMESTAMP(3) NOT NULL,
    "ventesTotales" DOUBLE PRECISION NOT NULL,
    "achatsTotaux" DOUBLE PRECISION NOT NULL,
    "depenses" DOUBLE PRECISION NOT NULL,
    "registreVentes" BOOLEAN NOT NULL DEFAULT false,
    "registreAchats" BOOLEAN NOT NULL DEFAULT false,
    "registreCaisse" BOOLEAN NOT NULL DEFAULT false,
    "registreCreances" BOOLEAN NOT NULL DEFAULT false,
    "registreActifs" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReleveMensuel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EstimationCout" (
    "id" TEXT NOT NULL,
    "participantId" TEXT NOT NULL,
    "nomProduit" TEXT NOT NULL,
    "dateEstimation" TIMESTAMP(3) NOT NULL,
    "coutMatieres" DOUBLE PRECISION NOT NULL,
    "coutMainOeuvre" DOUBLE PRECISION NOT NULL,
    "fraisGeneraux" DOUBLE PRECISION NOT NULL,
    "quantiteProduite" DOUBLE PRECISION NOT NULL,
    "margeSouhaitee" DOUBLE PRECISION NOT NULL DEFAULT 30,
    "notes" TEXT,
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EstimationCout_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ReleveMensuel_participantId_idx" ON "ReleveMensuel"("participantId");

-- CreateIndex
CREATE UNIQUE INDEX "ReleveMensuel_participantId_mois_key" ON "ReleveMensuel"("participantId", "mois");

-- CreateIndex
CREATE INDEX "EstimationCout_participantId_idx" ON "EstimationCout"("participantId");

-- AddForeignKey
ALTER TABLE "ReleveMensuel" ADD CONSTRAINT "ReleveMensuel_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "Participant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EstimationCout" ADD CONSTRAINT "EstimationCout_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "Participant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
