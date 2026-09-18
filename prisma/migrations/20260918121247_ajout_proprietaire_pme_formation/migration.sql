-- AlterTable
ALTER TABLE "Formation" ADD COLUMN     "creeParId" TEXT;

-- AlterTable
ALTER TABLE "Participant" ADD COLUMN     "creeParId" TEXT;

-- CreateIndex
CREATE INDEX "Formation_creeParId_idx" ON "Formation"("creeParId");

-- CreateIndex
CREATE INDEX "Participant_creeParId_idx" ON "Participant"("creeParId");

-- AddForeignKey
ALTER TABLE "Participant" ADD CONSTRAINT "Participant_creeParId_fkey" FOREIGN KEY ("creeParId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Formation" ADD CONSTRAINT "Formation_creeParId_fkey" FOREIGN KEY ("creeParId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
