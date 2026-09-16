const express = require("express");
const prisma = require("../lib/prisma");
const { authenticate } = require("../middlewares/auth.middleware");
const { QUESTIONNAIRE_ABF, MOMENTS_ABF, DOMAINES_BESOIN_FORMATION, calculerNiveauxAbf } = require("../lib/questionnaireAbf");
const { genererJSON } = require("../lib/aiService");

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

// Construit, pour un diagnostic IA lisible, le texte des réponses d'une évaluation, rubrique par
// rubrique (question posée + texte de la réponse choisie, pas seulement l'index).
function texteReponsesAbf(reponses) {
  return QUESTIONNAIRE_ABF.map((rubrique) => {
    const lignes = rubrique.questions.map((question) => {
      const indexChoisi = reponses ? reponses[question.id] : undefined;
      const reponseTexte =
        typeof indexChoisi === "number" && question.options[indexChoisi]
          ? question.options[indexChoisi]
          : "(non répondu)";
      return `- ${question.texte} Réponse : ${reponseTexte}`;
    });
    return `### ${rubrique.titre}\n${lignes.join("\n")}`;
  }).join("\n\n");
}

// Génère (ou régénère) le diagnostic IA d'une évaluation ABF : problèmes identifiés, formations à
// prioriser, actions correctives. Se base UNIQUEMENT sur les réponses déjà enregistrées pour
// cette évaluation, jamais sur d'autres données du participant.
router.post("/:id/evaluations-abf/:evaluationId/diagnostic-ia", async (req, res) => {
  try {
    const evaluation = await prisma.evaluationABF.findUnique({ where: { id: req.params.evaluationId } });
    if (!evaluation || evaluation.participantId !== req.params.id) {
      return res.status(404).json({ error: "Évaluation introuvable." });
    }

    const idsModules = DOMAINES_BESOIN_FORMATION.map((d) => d.id);
    const besoinsTexte =
      evaluation.besoinsDomaines.length > 0
        ? evaluation.besoinsDomaines
            .map((id) => DOMAINES_BESOIN_FORMATION.find((d) => d.id === id)?.label || id)
            .join(", ")
        : "aucun domaine coché";

    const consigne = `Tu es un expert en accompagnement de très petites entreprises et micro-entrepreneurs, formé à la méthode GERME/SIYB (BIT). Un entrepreneur a rempli le questionnaire ABF (Analyse des Besoins en Formation) ci-dessous (moment : ${evaluation.moment}).

Réponses détaillées par rubrique :

${texteReponsesAbf(evaluation.reponses)}

Domaines que l'entrepreneur (ou l'agent) a lui-même identifiés comme nécessitant une formation : ${besoinsTexte}
Autre besoin mentionné : ${evaluation.besoinsAutre || "aucun"}

À partir UNIQUEMENT de ces réponses, sans inventer d'information qui n'y figure pas :
1. Donne un diagnostic synthétique (3 à 5 phrases) des principaux problèmes de gestion de cette entreprise.
2. Liste les problèmes concrets identifiés, un par ligne courte.
3. Recommande les modules de formation GERME à prioriser, classés du plus urgent au moins urgent, en choisissant EXCLUSIVEMENT parmi ces identifiants exacts : ${idsModules.join(", ")}.
4. Propose des actions correctives concrètes et pratiques que l'entrepreneur peut mettre en œuvre rapidement.

Réponds uniquement avec un objet JSON de cette forme exacte, sans texte autour :
{"diagnostic": "...", "problemesIdentifies": ["...", "..."], "formationsRecommandees": ["id_module1", "id_module2"], "actionsCorrectives": ["...", "..."]}
Chaque liste doit contenir entre 1 et 6 éléments courts.`;

    const resultat = await genererJSON(consigne);

    const diagnosticIa = {
      diagnostic: resultat.diagnostic || "",
      problemesIdentifies: Array.isArray(resultat.problemesIdentifies) ? resultat.problemesIdentifies : [],
      formationsRecommandees: (Array.isArray(resultat.formationsRecommandees) ? resultat.formationsRecommandees : []).filter(
        (id) => idsModules.includes(id)
      ),
      actionsCorrectives: Array.isArray(resultat.actionsCorrectives) ? resultat.actionsCorrectives : [],
    };

    const evaluationMaj = await prisma.evaluationABF.update({
      where: { id: evaluation.id },
      data: { diagnosticIa, diagnosticGenereLe: new Date() },
    });

    res.json({ ...evaluationMaj, niveaux: calculerNiveauxAbf(evaluationMaj.reponses) });
  } catch (erreur) {
    console.error(erreur);
    res.status(500).json({ error: "Le diagnostic IA est momentanément indisponible." });
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
