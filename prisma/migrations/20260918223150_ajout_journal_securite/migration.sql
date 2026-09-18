-- CreateTable
CREATE TABLE "JournalSecurite" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "emailConcerne" TEXT NOT NULL,
    "nomConcerne" TEXT,
    "acteurNom" TEXT,
    "details" TEXT,
    "dateEvenement" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JournalSecurite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "JournalSecurite_type_idx" ON "JournalSecurite"("type");

-- CreateIndex
CREATE INDEX "JournalSecurite_dateEvenement_idx" ON "JournalSecurite"("dateEvenement");

-- CreateIndex
CREATE INDEX "JournalSecurite_emailConcerne_idx" ON "JournalSecurite"("emailConcerne");
