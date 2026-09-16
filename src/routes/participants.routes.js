const express = require("express");
const prisma = require("../lib/prisma");
const { authenticate } = require("../middlewares/auth.middleware");
const { QUESTIONNAIRE_ABF, MOMENTS_ABF, DOMAINES_BESOIN_FORMATION, calculerNiveauxAbf } = require("../lib/questionnaireAbf");

const router = express.Router();

// Toutes les routes de ce fichier nécessitent d'être connecté.
router.use(authenticate);

// Liste des participants, avec le nombre de formations suivies.
router.get("/", async (req, res) => {
  try {
    const { recherche, statut } = req.query;

    const ou = {};
    if (statut) {
      ou.statut = statut;
    }
    if (recherche) {
      ou.OR = [
        { nom: { contains: recherche, mode: "insensitive" } },
        { nomEntreprise: { contains: recherche, mode: "insensitive" } },
        { localite: { contains: recherche, mode: "insensitive" } },
        { telephone: { contains: recherche, mode: "insensitive" } },
      ];
    }

    const participants = await prisma.participant.findMany({
      where: ou,
      orderBy: { creeLe: "desc" },
      include: { _count: { select: { participations: true } } },
    });

    res.json(participants);
  } catch (erreur) {
    console.error(erreur);
    res.status(500).json({ error: "Erreur serveur." });
  }
});

// Détail d'un participant : ses informations + l'historique de ses formations.
router.get("/:id", async (req, res) => {
  try {
    const participant = await prisma.participant.findUnique({
      where: { id: req.params.id },
      include: {
        participations: {
          include: { formation: true },
          orderBy: { creeLe: "desc" },
        },
      },
    });

    if (!participant) {
      return res.status(404).json({ error: "Participant introuvable." });
    }

    res.json(participant);
  } catch (erreur) {
    console.error(erreur);
    res.status(500).json({ error: "Erreur serveur." });
  }
});

// Création d'un participant.
router.post("/", async (req, res) => {
  try {
    const { nom, telephone, email, localite, nomEntreprise, secteurActivite, statut, notes } = req.body;

    if (!nom || !nom.trim()) {
      return res.status(400).json({ error: "Le nom est obligatoire." });
    }

    const participant = await prisma.participant.create({
      data: {
        nom: nom.trim(),
        telephone: telephone || null,
        email: email || null,
        localite: localite || null,
        nomEntreprise: nomEntreprise || null,
        secteurActivite: secteurActivite || null,
        statut: statut || "Actif",
        notes: notes || null,
      },
    });

    res.status(201).json(participant);
  } catch (erreur) {
    console.error(erreur);
    res.status(500).json({ error: "Erreur serveur." });
  }
});

// Modification d'un participant.
router.put("/:id", async (req, res) => {
  try {
    const { nom, telephone, email, localite, nomEntreprise, secteurActivite, statut, notes } = req.body;

    if (!nom || !nom.trim()) {
      return res.status(400).json({ error: "Le nom est obligatoire." });
    }

    const participant = await prisma.participant.update({
      where: { id: req.params.id },
      data: {
        nom: nom.trim(),
        telephone: telephone || null,
        email: email || null,
        localite: localite || null,
        nomEntreprise: nomEntreprise || null,
        secteurActivite: secteurActivite || null,
        statut: statut || "Actif",
        notes: notes || null,
      },
    });

    res.json(participant);
  } catch (erreur) {
    if (erreur.code === "P2025") {
      return res.status(404).json({ error: "Participant introuvable." });
    }
    console.error(erreur);
    res.status(500).json({ error: "Erreur serveur." });
  }
});

// Suppression d'un participant (et de son historique de participation, en cascade).
router.delete("/:id", async (req, res) => {
  try {
    await prisma.participant.delete({ where: { id: req.params.id } });
    res.status(204).end();
  } catch (erreur) {
    if (erreur.code === "P2025") {
      return res.status(404).json({ error: "Participant introuvable." });
    }
    console.error(erreur);
    res.status(500).json({ error: "Erreur serveur." });
  }
});

// ------------------------------------------------------------------
// Évaluations ABF (Analyse des Besoins en Formation) d'un participant
// ------------------------------------------------------------------

// Liste des identifiants de questions valides, pour vérifier les réponses envoyées.
const IDS_QUESTIONS_ABF = QUESTIONNAIRE_ABF.flatMap((rubrique) => rubrique.questions.map((q) => q.id));
const IDS_DOMAINES_BESOIN = DOMAINES_BESOIN_FORMATION.map((d) => d.id);

// Vérifie que l'objet "reponses" envoyé ne contient que des questions connues, avec un index
// d'option valide (0 à 3). Les questions non répondues peuvent être absentes.
function reponsesAbfValides(reponses) {
  if (!reponses || typeof reponses !== "object" || Array.isArray(reponses)) {
    return false;
  }
  return Object.entries(reponses).every(([idQuestion, indexChoisi]) => {
    return (
      IDS_QUESTIONS_ABF.includes(idQuestion) &&
      Number.isInteger(indexChoisi) &&
      indexChoisi >= 0 &&
      indexChoisi <= 3
    );
  });
}

// Liste des évaluations ABF d'un participant, de la plus ancienne à la plus récente (pour
// afficher facilement l'évolution), avec le niveau indicatif par rubrique déjà calculé.
router.get("/:id/evaluations-abf", async (req, res) => {
  try {
    const evaluations = await prisma.evaluationABF.findMany({
      where: { participantId: req.params.id },
      orderBy: { dateEvaluation: "asc" },
    });

    res.json(evaluations.map((e) => ({ ...e, niveaux: calculerNiveauxAbf(e.reponses) })));
  } catch (erreur) {
    console.error(erreur);
    res.status(500).json({ error: "Erreur serveur." });
  }
});

// Création d'une évaluation ABF pour un participant.
router.post("/:id/evaluations-abf", async (req, res) => {
  try {
    const { moment, dateEvaluation, reponses, besoinsDomaines, besoinsAutre } = req.body;

    if (!moment || !MOMENTS_ABF.includes(moment)) {
      return res.status(400).json({ error: "Le moment doit être « Avant formation » ou « Après formation »." });
    }
    if (!dateEvaluation) {
      return res.status(400).json({ error: "La date de l'évaluation est obligatoire." });
    }
    if (!reponsesAbfValides(reponses)) {
      return res.status(400).json({ error: "Les réponses envoyées ne sont pas valides." });
    }
    const domaines = Array.isArray(besoinsDomaines) ? besoinsDomaines : [];
    if (!domaines.every((d) => IDS_DOMAINES_BESOIN.includes(d))) {
      return res.status(400).json({ error: "Un des domaines de besoin envoyés est inconnu." });
    }

    const participant = await prisma.participant.findUnique({ where: { id: req.params.id } });
    if (!participant) {
      return res.status(404).json({ error: "Participant introuvable." });
    }

    const evaluation = await prisma.evaluationABF.create({
      data: {
        participantId: req.params.id,
        moment,
        dateEvaluation: new Date(dateEvaluation),
        reponses,
        besoinsDomaines: domaines,
        besoinsAutre: besoinsAutre || null,
      },
    });

    res.status(201).json({ ...evaluation, niveaux: calculerNiveauxAbf(evaluation.reponses) });
  } catch (erreur) {
    console.error(erreur);
    res.status(500).json({ error: "Erreur serveur." });
  }
});

// Modification d'une évaluation ABF.
router.put("/:id/evaluations-abf/:evaluationId", async (req, res) => {
  try {
    const { moment, dateEvaluation, reponses, besoinsDomaines, besoinsAutre } = req.body;

    if (!moment || !MOMENTS_ABF.includes(moment)) {
      return res.status(400).json({ error: "Le moment doit être « Avant formation » ou « Après formation »." });
    }
    if (!dateEvaluation) {
      return res.status(400).json({ error: "La date de l'évaluation est obligatoire." });
    }
    if (!reponsesAbfValides(reponses)) {
      return res.status(400).json({ error: "Les réponses envoyées ne sont pas valides." });
    }
    const domaines = Array.isArray(besoinsDomaines) ? besoinsDomaines : [];
    if (!domaines.every((d) => IDS_DOMAINES_BESOIN.includes(d))) {
      return res.status(400).json({ error: "Un des domaines de besoin envoyés est inconnu." });
    }

    const evaluation = await prisma.evaluationABF.update({
      where: { id: req.params.evaluationId },
      data: {
        moment,
        dateEvaluation: new Date(dateEvaluation),
        reponses,
        besoinsDomaines: domaines,
        besoinsAutre: besoinsAutre || null,
      },
    });

    res.json({ ...evaluation, niveaux: calculerNiveauxAbf(evaluation.reponses) });
  } catch (erreur) {
    if (erreur.code === "P2025") {
      return res.status(404).json({ error: "Évaluation introuvable." });
    }
    console.error(erreur);
    res.status(500).json({ error: "Erreur serveur." });
  }
});

// Suppression d'une évaluation ABF.
router.delete("/:id/evaluations-abf/:evaluationId", async (req, res) => {
  try {
    await prisma.evaluationABF.delete({ where: { id: req.params.evaluationId } });
    res.status(204).end();
  } catch (erreur) {
    if (erreur.code === "P2025") {
      return res.status(404).json({ error: "Évaluation introuvable." });
    }
    console.error(erreur);
    res.status(500).json({ error: "Erreur serveur." });
  }
});

// ------------------------------------------------------------------
// Notes de suivi (visites de terrain entre deux évaluations ABF)
// ------------------------------------------------------------------

// Liste des notes de suivi d'un participant, de la plus récente à la plus ancienne.
router.get("/:id/notes-suivi", async (req, res) => {
  try {
    const notes = await prisma.noteSuivi.findMany({
      where: { participantId: req.params.id },
      orderBy: { dateNote: "desc" },
    });

    res.json(notes);
  } catch (erreur) {
    console.error(erreur);
    res.status(500).json({ error: "Erreur serveur." });
  }
});

// Ajout d'une note de suivi.
router.post("/:id/notes-suivi", async (req, res) => {
  try {
    const { dateNote, contenu } = req.body;

    if (!dateNote) {
      return res.status(400).json({ error: "La date de la note est obligatoire." });
    }
    if (!contenu || !contenu.trim()) {
      return res.status(400).json({ error: "Le contenu de la note est obligatoire." });
    }

    const participant = await prisma.participant.findUnique({ where: { id: req.params.id } });
    if (!participant) {
      return res.status(404).json({ error: "Participant introuvable." });
    }

    const note = await prisma.noteSuivi.create({
      data: {
        participantId: req.params.id,
        dateNote: new Date(dateNote),
        contenu: contenu.trim(),
      },
    });

    res.status(201).json(note);
  } catch (erreur) {
    console.error(erreur);
    res.status(500).json({ error: "Erreur serveur." });
  }
});

// Suppression d'une note de suivi.
router.delete("/:id/notes-suivi/:noteId", async (req, res) => {
  try {
    await prisma.noteSuivi.delete({ where: { id: req.params.noteId } });
    res.status(204).end();
  } catch (erreur) {
    if (erreur.code === "P2025") {
      return res.status(404).json({ error: "Note introuvable." });
    }
    console.error(erreur);
    res.status(500).json({ error: "Erreur serveur." });
  }
});

module.exports = router;
