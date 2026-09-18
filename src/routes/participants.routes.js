const express = require("express");
const prisma = require("../lib/prisma");
const { authenticate } = require("../middlewares/auth.middleware");
const { QUESTIONNAIRE_ABF, MOMENTS_ABF, DOMAINES_BESOIN_FORMATION, calculerNiveauxAbf } = require("../lib/questionnaireAbf");
const { genererJSON } = require("../lib/aiService");
const { calculerBeneficeReleve, calculerEstimationCout } = require("../lib/calculsFinanciers");
const { calculerSanteParticipant } = require("../lib/santeParticipant");

const router = express.Router();

// Toutes les routes de ce fichier nécessitent d'être connecté.
router.use(authenticate);

// Chaque compte est independant : verifie, pour TOUTE route de ce fichier qui contient :id, que
// le participant existe ET appartient bien au compte connecte. "Introuvable" est utilise aussi
// quand il appartient a quelqu'un d'autre, pour ne jamais reveler son existence a un autre compte.
router.param("id", async (req, res, next, id) => {
  try {
    const participant = await prisma.participant.findUnique({ where: { id } });
    if (!participant || participant.creeParId !== req.user.userId) {
      return res.status(404).json({ error: "Participant introuvable." });
    }
    req.participant = participant;
    next();
  } catch (erreur) {
    console.error(erreur);
    res.status(500).json({ error: "Erreur serveur." });
  }
});

// Comparaison utilisee pour "action en retard" : a partir d'aujourd'hui minuit (et non l'heure
// exacte actuelle), pour rester coherent avec l'onglet Plan d'accompagnement (qui ne surligne
// une action en retard qu'a partir du lendemain de son echeance, jamais le jour meme).
function debutAujourdHui() {
  const debut = new Date();
  debut.setHours(0, 0, 0, 0);
  return debut;
}

// Statuts valides pour une PME suivie (doit rester synchronise avec le menu deroulant du
// formulaire cote frontend).
const STATUTS_PARTICIPANT = ["Actif", "Sorti", "Abandon"];

// Verification tres legere du format d'un email, juste pour ecarter une saisie clairement
// invalide (pas une validation stricte RFC, volontairement simple).
function emailValide(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Liste des participants, avec le nombre de formations suivies.
router.get("/", async (req, res) => {
  try {
    const { recherche, statut } = req.query;

    const ou = { creeParId: req.user.userId };
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

    const idsParticipants = participants.map((p) => p.id);
    const [releves, evaluations, actionsEnRetard] = await Promise.all([
      prisma.releveMensuel.findMany({ where: { participantId: { in: idsParticipants } }, orderBy: { mois: "desc" } }),
      prisma.evaluationABF.findMany({
        where: { participantId: { in: idsParticipants } },
        orderBy: { dateEvaluation: "desc" },
      }),
      prisma.actionAccompagnement.findMany({
        where: {
          participantId: { in: idsParticipants },
          statut: { notIn: ["Réalisée", "Abandonnée"] },
          echeance: { lt: debutAujourdHui() },
        },
        select: { participantId: true },
      }),
    ]);

    // Le plus recent en tete (tri desc) : on ne garde que la premiere occurrence par PME.
    const dernierReleveParPme = {};
    for (const r of releves) {
      if (!dernierReleveParPme[r.participantId]) dernierReleveParPme[r.participantId] = r;
    }
    const derniereEvaluationParPme = {};
    for (const e of evaluations) {
      if (!derniereEvaluationParPme[e.participantId]) derniereEvaluationParPme[e.participantId] = e;
    }
    const actionsEnRetardParPme = {};
    for (const a of actionsEnRetard) {
      actionsEnRetardParPme[a.participantId] = (actionsEnRetardParPme[a.participantId] || 0) + 1;
    }

    const participantsAvecSante = participants.map((p) => ({
      ...p,
      sante: calculerSanteParticipant({
        dernierReleve: dernierReleveParPme[p.id] || null,
        derniereEvaluationAbf: derniereEvaluationParPme[p.id] || null,
        nombreActionsEnRetard: actionsEnRetardParPme[p.id] || 0,
      }),
    }));

    res.json(participantsAvecSante);
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

    const [dernierReleve, derniereEvaluationAbf, nombreActionsEnRetard] = await Promise.all([
      prisma.releveMensuel.findFirst({ where: { participantId: req.params.id }, orderBy: { mois: "desc" } }),
      prisma.evaluationABF.findFirst({
        where: { participantId: req.params.id },
        orderBy: { dateEvaluation: "desc" },
      }),
      prisma.actionAccompagnement.count({
        where: {
          participantId: req.params.id,
          statut: { notIn: ["Réalisée", "Abandonnée"] },
          echeance: { lt: debutAujourdHui() },
        },
      }),
    ]);

    res.json({
      ...participant,
      sante: calculerSanteParticipant({ dernierReleve, derniereEvaluationAbf, nombreActionsEnRetard }),
    });
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
    if (statut && !STATUTS_PARTICIPANT.includes(statut)) {
      return res.status(400).json({ error: "Statut inconnu." });
    }
    if (email && !emailValide(email)) {
      return res.status(400).json({ error: "Format d'email invalide." });
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
        creeParId: req.user.userId,
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
    if (statut && !STATUTS_PARTICIPANT.includes(statut)) {
      return res.status(400).json({ error: "Statut inconnu." });
    }
    if (email && !emailValide(email)) {
      return res.status(400).json({ error: "Format d'email invalide." });
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

    const { count } = await prisma.evaluationABF.updateMany({
      where: { id: req.params.evaluationId, participantId: req.params.id },
      data: {
        moment,
        dateEvaluation: new Date(dateEvaluation),
        reponses,
        besoinsDomaines: domaines,
        besoinsAutre: besoinsAutre || null,
      },
    });
    if (count === 0) {
      return res.status(404).json({ error: "Évaluation introuvable." });
    }

    const evaluation = await prisma.evaluationABF.findUnique({ where: { id: req.params.evaluationId } });
    res.json({ ...evaluation, niveaux: calculerNiveauxAbf(evaluation.reponses) });
  } catch (erreur) {
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

// Génère (ou régénère) le diagnostic IA GLOBAL de la PME : une synthèse transversale qui croise
// l'ABF, les finances (registres) et l'état du plan d'accompagnement — contrairement au diagnostic
// IA de l'ABF, qui ne se base que sur une seule évaluation.
router.post("/:id/diagnostic-global-ia", async (req, res) => {
  try {
    const [derniereEvaluation, releves, nombreFormations, actions] = await Promise.all([
      prisma.evaluationABF.findFirst({
        where: { participantId: req.params.id },
        orderBy: { dateEvaluation: "desc" },
      }),
      prisma.releveMensuel.findMany({
        where: { participantId: req.params.id },
        orderBy: { mois: "desc" },
        take: 3,
      }),
      prisma.participationFormation.count({ where: { participantId: req.params.id } }),
      prisma.actionAccompagnement.findMany({
        where: { participantId: req.params.id },
        select: { statut: true },
      }),
    ]);

    let texteAbf = "Aucune évaluation ABF enregistrée pour cette PME.";
    if (derniereEvaluation) {
      const niveaux = calculerNiveauxAbf(derniereEvaluation.reponses);
      const lignesNiveaux = Object.entries(niveaux)
        .map(([id, n]) => `${id} : ${n.niveau ? `${n.niveau}/5 (${n.libelle})` : "non renseigné"}`)
        .join(", ");
      texteAbf = `Dernière évaluation ABF (${derniereEvaluation.moment}, ${derniereEvaluation.dateEvaluation
        .toISOString()
        .slice(0, 10)}) — niveaux par rubrique : ${lignesNiveaux}.`;
      if (derniereEvaluation.diagnosticIa?.diagnostic) {
        texteAbf += ` Diagnostic déjà généré pour cette évaluation : ${derniereEvaluation.diagnosticIa.diagnostic}`;
      }
    }

    let texteFinances = "Aucun relevé mensuel enregistré pour cette PME.";
    if (releves.length > 0) {
      const lignes = releves
        .map(
          (r) =>
            `${r.mois.toISOString().slice(0, 7)} : bénéfice net ${Math.round(calculerBeneficeReleve(r))} FCFA`
        )
        .join(" ; ");
      texteFinances = `Relevés mensuels les plus récents (du plus récent au plus ancien) : ${lignes}.`;
    }

    const compteursStatut = {};
    for (const action of actions) {
      compteursStatut[action.statut] = (compteursStatut[action.statut] || 0) + 1;
    }
    const texteAccompagnement =
      actions.length > 0
        ? `Plan d'accompagnement : ${Object.entries(compteursStatut)
            .map(([statut, n]) => `${n} action(s) au statut "${statut}"`)
            .join(", ")}.`
        : "Aucune action de plan d'accompagnement enregistrée pour cette PME.";

    const consigne = `Tu es un expert en accompagnement de très petites entreprises et micro-entrepreneurs, formé à la méthode GERME/SIYB (BIT). Voici la situation d'ensemble d'une PME suivie par un consultant, à partir de plusieurs sources différentes :

${texteAbf}

${texteFinances}

Nombre de formations GERME suivies par l'entrepreneur : ${nombreFormations}.

${texteAccompagnement}

À partir UNIQUEMENT de ces informations, sans inventer d'information qui n'y figure pas :
1. Donne un diagnostic de synthèse (3 à 5 phrases) de la situation globale actuelle de cette PME, en croisant ces différentes sources entre elles (pas juste un résumé de chacune séparément).
2. Identifie les causes profondes probables des difficultés observées (pas seulement les symptômes visibles).
3. Propose des actions concrètes à ajouter au plan d'accompagnement de cette PME.

Réponds uniquement avec un objet JSON de cette forme exacte, sans texte autour :
{"diagnostic": "...", "causesProfondes": ["...", "..."], "actionsSuggerees": ["...", "..."]}
Chaque liste doit contenir entre 1 et 6 éléments courts.`;

    const resultat = await genererJSON(consigne);

    const diagnosticGlobalIa = {
      diagnostic: resultat.diagnostic || "",
      causesProfondes: Array.isArray(resultat.causesProfondes) ? resultat.causesProfondes : [],
      actionsSuggerees: Array.isArray(resultat.actionsSuggerees) ? resultat.actionsSuggerees : [],
    };

    const participantMaj = await prisma.participant.update({
      where: { id: req.params.id },
      data: { diagnosticGlobalIa, diagnosticGlobalGenereLe: new Date() },
    });

    res.json(participantMaj);
  } catch (erreur) {
    console.error(erreur);
    res.status(500).json({ error: "Le diagnostic IA global est momentanément indisponible." });
  }
});

// Mesure de performance de la PME : progression ABF (Avant -> Après formation) et évolution
// financière dans le temps. Rien n'est stocké : recalculé à chaque lecture à partir des
// évaluations et relevés déjà enregistrés.
router.get("/:id/performance", async (req, res) => {
  try {
    const [evaluations, releves] = await Promise.all([
      prisma.evaluationABF.findMany({ where: { participantId: req.params.id }, orderBy: { dateEvaluation: "asc" } }),
      prisma.releveMensuel.findMany({ where: { participantId: req.params.id }, orderBy: { mois: "asc" } }),
    ]);

    // La toute première évaluation "Avant formation" sert de point de départ (avant tout
    // accompagnement), et la plus récente évaluation "Après formation" sert de point d'arrivée
    // (l'état le plus à jour), pour mesurer la progression sur toute la période accompagnée.
    const evaluationAvant = evaluations.find((e) => e.moment === "Avant formation");
    const evaluationsApres = evaluations.filter((e) => e.moment === "Après formation");
    const evaluationApres = evaluationsApres[evaluationsApres.length - 1];

    let progressionAbf = null;
    if (evaluationAvant && evaluationApres) {
      const niveauxAvant = calculerNiveauxAbf(evaluationAvant.reponses);
      const niveauxApres = calculerNiveauxAbf(evaluationApres.reponses);

      const rubriques = QUESTIONNAIRE_ABF.map((rubrique) => {
        const niveauAvant = niveauxAvant[rubrique.rubriqueId]?.niveau ?? null;
        const niveauApres = niveauxApres[rubrique.rubriqueId]?.niveau ?? null;
        return {
          rubriqueId: rubrique.rubriqueId,
          titre: rubrique.titre,
          niveauAvant,
          libelleAvant: niveauxAvant[rubrique.rubriqueId]?.libelle ?? "Non renseigné",
          niveauApres,
          libelleApres: niveauxApres[rubrique.rubriqueId]?.libelle ?? "Non renseigné",
          delta: niveauAvant !== null && niveauApres !== null ? niveauApres - niveauAvant : null,
        };
      });

      const deltasValides = rubriques.map((r) => r.delta).filter((d) => d !== null);
      const moyenneDelta =
        deltasValides.length > 0 ? deltasValides.reduce((a, b) => a + b, 0) / deltasValides.length : null;

      progressionAbf = {
        dateEvaluationAvant: evaluationAvant.dateEvaluation,
        dateEvaluationApres: evaluationApres.dateEvaluation,
        rubriques,
        moyenneDelta,
      };
    }

    const evolutionFinanciere = releves.map((r) => ({
      mois: r.mois,
      beneficeNet: calculerBeneficeReleve(r),
    }));

    res.json({ progressionAbf, evolutionFinanciere });
  } catch (erreur) {
    console.error(erreur);
    res.status(500).json({ error: "Erreur serveur." });
  }
});

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
    const { count } = await prisma.evaluationABF.deleteMany({
      where: { id: req.params.evaluationId, participantId: req.params.id },
    });
    if (count === 0) {
      return res.status(404).json({ error: "Évaluation introuvable." });
    }
    res.status(204).end();
  } catch (erreur) {
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
    const { count } = await prisma.noteSuivi.deleteMany({
      where: { id: req.params.noteId, participantId: req.params.id },
    });
    if (count === 0) {
      return res.status(404).json({ error: "Note introuvable." });
    }
    res.status(204).end();
  } catch (erreur) {
    console.error(erreur);
    res.status(500).json({ error: "Erreur serveur." });
  }
});

// ------------------------------------------------------------------
// Tenue des registres : relevés mensuels d'un participant
// ------------------------------------------------------------------

// Ramène n'importe quelle date au 1er jour de son mois, pour que la contrainte d'unicité
// (un seul relevé par participant et par mois) fonctionne même si le frontend envoie une date
// en plein milieu du mois.
function premierJourDuMois(dateTexte) {
  const d = new Date(dateTexte);
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
}

// Liste des relevés mensuels d'un participant, du plus ancien au plus récent (pour suivre
// l'évolution), avec le bénéfice net déjà calculé.
router.get("/:id/releves-mensuels", async (req, res) => {
  try {
    const releves = await prisma.releveMensuel.findMany({
      where: { participantId: req.params.id },
      orderBy: { mois: "asc" },
    });

    res.json(releves.map((r) => ({ ...r, beneficeNet: calculerBeneficeReleve(r) })));
  } catch (erreur) {
    console.error(erreur);
    res.status(500).json({ error: "Erreur serveur." });
  }
});

// Création d'un relevé mensuel.
router.post("/:id/releves-mensuels", async (req, res) => {
  try {
    const {
      mois, ventesTotales, achatsTotaux, depenses,
      registreVentes, registreAchats, registreCaisse, registreCreances, registreActifs, notes,
    } = req.body;

    if (!mois) {
      return res.status(400).json({ error: "Le mois est obligatoire." });
    }
    if ([ventesTotales, achatsTotaux, depenses].some((v) => typeof v !== "number" || Number.isNaN(v))) {
      return res.status(400).json({ error: "Les ventes, achats et dépenses doivent être des nombres." });
    }

    const releve = await prisma.releveMensuel.create({
      data: {
        participantId: req.params.id,
        mois: premierJourDuMois(mois),
        ventesTotales, achatsTotaux, depenses,
        registreVentes: !!registreVentes,
        registreAchats: !!registreAchats,
        registreCaisse: !!registreCaisse,
        registreCreances: !!registreCreances,
        registreActifs: !!registreActifs,
        notes: notes || null,
      },
    });

    res.status(201).json({ ...releve, beneficeNet: calculerBeneficeReleve(releve) });
  } catch (erreur) {
    if (erreur.code === "P2002") {
      return res.status(400).json({ error: "Un relevé existe déjà pour ce mois. Modifiez-le plutôt." });
    }
    console.error(erreur);
    res.status(500).json({ error: "Erreur serveur." });
  }
});

// Modification d'un relevé mensuel.
router.put("/:id/releves-mensuels/:releveId", async (req, res) => {
  try {
    const {
      mois, ventesTotales, achatsTotaux, depenses,
      registreVentes, registreAchats, registreCaisse, registreCreances, registreActifs, notes,
    } = req.body;

    if (!mois) {
      return res.status(400).json({ error: "Le mois est obligatoire." });
    }
    if ([ventesTotales, achatsTotaux, depenses].some((v) => typeof v !== "number" || Number.isNaN(v))) {
      return res.status(400).json({ error: "Les ventes, achats et dépenses doivent être des nombres." });
    }

    const { count } = await prisma.releveMensuel.updateMany({
      where: { id: req.params.releveId, participantId: req.params.id },
      data: {
        mois: premierJourDuMois(mois),
        ventesTotales, achatsTotaux, depenses,
        registreVentes: !!registreVentes,
        registreAchats: !!registreAchats,
        registreCaisse: !!registreCaisse,
        registreCreances: !!registreCreances,
        registreActifs: !!registreActifs,
        notes: notes || null,
      },
    });
    if (count === 0) {
      return res.status(404).json({ error: "Relevé introuvable." });
    }

    const releve = await prisma.releveMensuel.findUnique({ where: { id: req.params.releveId } });
    res.json({ ...releve, beneficeNet: calculerBeneficeReleve(releve) });
  } catch (erreur) {
    if (erreur.code === "P2002") {
      return res.status(400).json({ error: "Un relevé existe déjà pour ce mois." });
    }
    console.error(erreur);
    res.status(500).json({ error: "Erreur serveur." });
  }
});

// Suppression d'un relevé mensuel.
router.delete("/:id/releves-mensuels/:releveId", async (req, res) => {
  try {
    const { count } = await prisma.releveMensuel.deleteMany({
      where: { id: req.params.releveId, participantId: req.params.id },
    });
    if (count === 0) {
      return res.status(404).json({ error: "Relevé introuvable." });
    }
    res.status(204).end();
  } catch (erreur) {
    console.error(erreur);
    res.status(500).json({ error: "Erreur serveur." });
  }
});

// ------------------------------------------------------------------
// Estimation des coûts : fiches de calcul du prix de revient
// ------------------------------------------------------------------

// Liste des estimations de coûts d'un participant, de la plus récente à la plus ancienne, avec
// les calculs (coût total, coût unitaire, prix de vente conseillé) déjà faits.
router.get("/:id/estimations-couts", async (req, res) => {
  try {
    const estimations = await prisma.estimationCout.findMany({
      where: { participantId: req.params.id },
      orderBy: { dateEstimation: "desc" },
    });

    res.json(estimations.map((e) => ({ ...e, ...calculerEstimationCout(e) })));
  } catch (erreur) {
    console.error(erreur);
    res.status(500).json({ error: "Erreur serveur." });
  }
});

// Création d'une estimation de coût.
router.post("/:id/estimations-couts", async (req, res) => {
  try {
    const { nomProduit, dateEstimation, coutMatieres, coutMainOeuvre, fraisGeneraux, quantiteProduite, margeSouhaitee, notes } =
      req.body;

    if (!nomProduit || !nomProduit.trim()) {
      return res.status(400).json({ error: "Le nom du produit ou service est obligatoire." });
    }
    if (!dateEstimation) {
      return res.status(400).json({ error: "La date de l'estimation est obligatoire." });
    }
    if ([coutMatieres, coutMainOeuvre, fraisGeneraux, quantiteProduite].some((v) => typeof v !== "number" || Number.isNaN(v))) {
      return res.status(400).json({ error: "Les coûts et la quantité doivent être des nombres." });
    }

    const estimation = await prisma.estimationCout.create({
      data: {
        participantId: req.params.id,
        nomProduit: nomProduit.trim(),
        dateEstimation: new Date(dateEstimation),
        coutMatieres, coutMainOeuvre, fraisGeneraux, quantiteProduite,
        margeSouhaitee: typeof margeSouhaitee === "number" && !Number.isNaN(margeSouhaitee) ? margeSouhaitee : 30,
        notes: notes || null,
      },
    });

    res.status(201).json({ ...estimation, ...calculerEstimationCout(estimation) });
  } catch (erreur) {
    console.error(erreur);
    res.status(500).json({ error: "Erreur serveur." });
  }
});

// Modification d'une estimation de coût.
router.put("/:id/estimations-couts/:estimationId", async (req, res) => {
  try {
    const { nomProduit, dateEstimation, coutMatieres, coutMainOeuvre, fraisGeneraux, quantiteProduite, margeSouhaitee, notes } =
      req.body;

    if (!nomProduit || !nomProduit.trim()) {
      return res.status(400).json({ error: "Le nom du produit ou service est obligatoire." });
    }
    if (!dateEstimation) {
      return res.status(400).json({ error: "La date de l'estimation est obligatoire." });
    }
    if ([coutMatieres, coutMainOeuvre, fraisGeneraux, quantiteProduite].some((v) => typeof v !== "number" || Number.isNaN(v))) {
      return res.status(400).json({ error: "Les coûts et la quantité doivent être des nombres." });
    }

    const { count } = await prisma.estimationCout.updateMany({
      where: { id: req.params.estimationId, participantId: req.params.id },
      data: {
        nomProduit: nomProduit.trim(),
        dateEstimation: new Date(dateEstimation),
        coutMatieres, coutMainOeuvre, fraisGeneraux, quantiteProduite,
        margeSouhaitee: typeof margeSouhaitee === "number" && !Number.isNaN(margeSouhaitee) ? margeSouhaitee : 30,
        notes: notes || null,
      },
    });
    if (count === 0) {
      return res.status(404).json({ error: "Estimation introuvable." });
    }

    const estimation = await prisma.estimationCout.findUnique({ where: { id: req.params.estimationId } });
    res.json({ ...estimation, ...calculerEstimationCout(estimation) });
  } catch (erreur) {
    console.error(erreur);
    res.status(500).json({ error: "Erreur serveur." });
  }
});

// Suppression d'une estimation de coût.
router.delete("/:id/estimations-couts/:estimationId", async (req, res) => {
  try {
    const { count } = await prisma.estimationCout.deleteMany({
      where: { id: req.params.estimationId, participantId: req.params.id },
    });
    if (count === 0) {
      return res.status(404).json({ error: "Estimation introuvable." });
    }
    res.status(204).end();
  } catch (erreur) {
    console.error(erreur);
    res.status(500).json({ error: "Erreur serveur." });
  }
});

// Liste des actions du plan d'accompagnement d'un participant, triees par echeance.
router.get("/:id/actions-accompagnement", async (req, res) => {
  try {
    const actions = await prisma.actionAccompagnement.findMany({
      where: { participantId: req.params.id },
      orderBy: { echeance: "asc" },
    });

    res.json(actions);
  } catch (erreur) {
    console.error(erreur);
    res.status(500).json({ error: "Erreur serveur." });
  }
});

// Verifie, si un id d'evaluation ABF est fourni pour rattacher une action a son diagnostic, que
// cette evaluation existe bien et appartient au meme participant (jamais a un autre, meme si le
// consultant connait deja son id). Retourne null si le rattachement n'est pas valide.
async function idEvaluationAbfValide(evaluationAbfId, participantId) {
  if (!evaluationAbfId) return null;
  const evaluation = await prisma.evaluationABF.findUnique({ where: { id: evaluationAbfId } });
  return evaluation && evaluation.participantId === participantId ? evaluation.id : null;
}

// Verifie que la formation liee correspond bien a un module GERME connu (memes identifiants que
// les formations recommandees par le diagnostic ABF). Retourne null si absent ou invalide.
function idFormationLieeValide(formationLiee) {
  const idsModules = DOMAINES_BESOIN_FORMATION.map((d) => d.id);
  return idsModules.includes(formationLiee) ? formationLiee : null;
}

const ORIGINES_ACTION_VALIDES = ["ABF", "IA_globale", "Observation"];
function origineActionValide(origine) {
  return ORIGINES_ACTION_VALIDES.includes(origine) ? origine : "Observation";
}

// Creation d'une action du plan d'accompagnement.
router.post("/:id/actions-accompagnement", async (req, res) => {
  try {
    const { probleme, action, formationLiee, responsable, echeance, statut, noteVerification, origine, evaluationAbfId } =
      req.body;

    if (!probleme || !probleme.trim()) {
      return res.status(400).json({ error: "Le problème identifié est obligatoire." });
    }
    if (!action || !action.trim()) {
      return res.status(400).json({ error: "L'action à mener est obligatoire." });
    }
    if (!responsable || !responsable.trim()) {
      return res.status(400).json({ error: "Le responsable de l'action est obligatoire." });
    }
    if (!echeance) {
      return res.status(400).json({ error: "L'échéance est obligatoire." });
    }

    const nouvelleAction = await prisma.actionAccompagnement.create({
      data: {
        participantId: req.params.id,
        probleme: probleme.trim(),
        action: action.trim(),
        formationLiee: idFormationLieeValide(formationLiee),
        responsable: responsable.trim(),
        echeance: new Date(echeance),
        statut: statut || "À faire",
        noteVerification: noteVerification || null,
        origine: origineActionValide(origine),
        evaluationAbfId: await idEvaluationAbfValide(evaluationAbfId, req.params.id),
      },
    });

    res.status(201).json(nouvelleAction);
  } catch (erreur) {
    console.error(erreur);
    res.status(500).json({ error: "Erreur serveur." });
  }
});

// Modification d'une action du plan d'accompagnement.
router.put("/:id/actions-accompagnement/:actionId", async (req, res) => {
  try {
    const { probleme, action, formationLiee, responsable, echeance, statut, noteVerification, origine, evaluationAbfId } =
      req.body;

    if (!probleme || !probleme.trim()) {
      return res.status(400).json({ error: "Le problème identifié est obligatoire." });
    }
    if (!action || !action.trim()) {
      return res.status(400).json({ error: "L'action à mener est obligatoire." });
    }
    if (!responsable || !responsable.trim()) {
      return res.status(400).json({ error: "Le responsable de l'action est obligatoire." });
    }
    if (!echeance) {
      return res.status(400).json({ error: "L'échéance est obligatoire." });
    }

    const { count } = await prisma.actionAccompagnement.updateMany({
      where: { id: req.params.actionId, participantId: req.params.id },
      data: {
        probleme: probleme.trim(),
        action: action.trim(),
        formationLiee: idFormationLieeValide(formationLiee),
        responsable: responsable.trim(),
        echeance: new Date(echeance),
        statut: statut || "À faire",
        noteVerification: noteVerification || null,
        origine: origineActionValide(origine),
        evaluationAbfId: await idEvaluationAbfValide(evaluationAbfId, req.params.id),
      },
    });
    if (count === 0) {
      return res.status(404).json({ error: "Action introuvable." });
    }

    const actionMaj = await prisma.actionAccompagnement.findUnique({ where: { id: req.params.actionId } });
    res.json(actionMaj);
  } catch (erreur) {
    console.error(erreur);
    res.status(500).json({ error: "Erreur serveur." });
  }
});

// Suppression d'une action du plan d'accompagnement.
router.delete("/:id/actions-accompagnement/:actionId", async (req, res) => {
  try {
    const { count } = await prisma.actionAccompagnement.deleteMany({
      where: { id: req.params.actionId, participantId: req.params.id },
    });
    if (count === 0) {
      return res.status(404).json({ error: "Action introuvable." });
    }
    res.status(204).end();
  } catch (erreur) {
    console.error(erreur);
    res.status(500).json({ error: "Erreur serveur." });
  }
});

module.exports = router;
