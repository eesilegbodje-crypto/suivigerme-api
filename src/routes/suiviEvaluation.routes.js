// Module "Suivi-évaluation" : permet à chaque conseiller de suivre et d'évaluer, pour son propre
// portefeuille de PME, son activité de terrain et la qualité de son accompagnement. Comme le
// reste de l'application, chaque compte ne voit que ses propres données (creeParId) — même le
// coordonnateur ne voit ici que ce que lui-même a enregistré, pas une vue d'ensemble de l'équipe.
const express = require("express");
const prisma = require("../lib/prisma");
const { authenticate } = require("../middlewares/auth.middleware");
const { calculerSuiviEvaluation } = require("../lib/suiviEvaluationConseiller");

const router = express.Router();

router.use(authenticate);

// Périodes proposées pour la section "Activité de terrain" (les autres sections portent toujours
// sur l'ensemble des données, pour refléter le chemin parcouru depuis le début).
const PERIODES = {
  "7j": 7,
  "30j": 30,
  "3m": 90,
};

function calculerDateDebut(periode) {
  const jours = PERIODES[periode];
  if (!jours) return null; // "tout" (ou valeur inconnue) : pas de filtre de date.
  const debut = new Date();
  debut.setHours(0, 0, 0, 0);
  debut.setDate(debut.getDate() - jours);
  return debut;
}

router.get("/", async (req, res) => {
  try {
    const debutPeriode = calculerDateDebut(req.query.periode);
    const userId = req.user.userId;

    const [participantsTous, notesSuiviPeriode, formationsPeriode, actions, evaluations, releves] =
      await Promise.all([
        prisma.participant.findMany({
          where: { creeParId: userId },
          select: { id: true, statut: true, typeSuivi: true },
        }),
        prisma.noteSuivi.findMany({
          where: {
            participant: { creeParId: userId },
            ...(debutPeriode ? { dateNote: { gte: debutPeriode } } : {}),
          },
          select: { id: true },
        }),
        prisma.formation.findMany({
          where: {
            creeParId: userId,
            ...(debutPeriode ? { date: { gte: debutPeriode } } : {}),
          },
          include: { _count: { select: { participations: true } } },
        }),
        prisma.actionAccompagnement.findMany({
          where: { participant: { creeParId: userId } },
          select: { participantId: true, statut: true, echeance: true, creeLe: true, majLe: true },
        }),
        prisma.evaluationABF.findMany({
          where: { participant: { creeParId: userId } },
          select: { participantId: true, moment: true, dateEvaluation: true, reponses: true },
        }),
        prisma.releveMensuel.findMany({
          where: { participant: { creeParId: userId } },
          select: {
            participantId: true,
            mois: true,
            ventesTotales: true,
            achatsTotaux: true,
            depenses: true,
          },
        }),
      ]);

    const indicateurs = calculerSuiviEvaluation({
      participantsTous,
      notesSuiviPeriode,
      formationsPeriode,
      actions,
      evaluations,
      releves,
    });

    res.json({ periode: req.query.periode || "30j", ...indicateurs });
  } catch (erreur) {
    console.error(erreur);
    res.status(500).json({ error: "Erreur serveur." });
  }
});

module.exports = router;
