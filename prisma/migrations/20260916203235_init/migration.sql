-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "motDePasse" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'coordonnateur',
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Participant" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "telephone" TEXT,
    "email" TEXT,
    "localite" TEXT,
    "nomEntreprise" TEXT,
    "secteurActivite" TEXT,
    "statut" TEXT NOT NULL DEFAULT 'Actif',
    "notes" TEXT,
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "majLe" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Participant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Formation" (
    "id" TEXT NOT NULL,
    "module" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "lieu" TEXT,
    "formateur" TEXT,
    "notes" TEXT,
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Formation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ParticipationFormation" (
    "id" TEXT NOT NULL,
    "participantId" TEXT NOT NULL,
    "formationId" TEXT NOT NULL,
    "present" BOOLEAN NOT NULL DEFAULT true,
    "appreciation" TEXT,
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ParticipationFormation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Participant_statut_idx" ON "Participant"("statut");

-- CreateIndex
CREATE INDEX "Formation_module_idx" ON "Formation"("module");

-- CreateIndex
CREATE INDEX "Formation_date_idx" ON "Formation"("date");

-- CreateIndex
CREATE UNIQUE INDEX "ParticipationFormation_participantId_formationId_key" ON "ParticipationFormation"("participantId", "formationId");

-- AddForeignKey
ALTER TABLE "ParticipationFormation" ADD CONSTRAINT "ParticipationFormation_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "Participant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParticipationFormation" ADD CONSTRAINT "ParticipationFormation_formationId_fkey" FOREIGN KEY ("formationId") REFERENCES "Formation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
