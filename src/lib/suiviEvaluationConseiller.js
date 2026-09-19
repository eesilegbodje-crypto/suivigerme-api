// Calcule les indicateurs du module "Suivi-évaluation" d'un conseiller : lui permet de suivre et
// d'évaluer, pour son propre portefeuille de PME, son activité de terrain, la qualité de son
// accompagnement, les résultats obtenus par les PME suivies, et la couverture de son diagnostic.
// Comme calculsFinanciers.js et santeParticipant.js, rien n'est stocké : tout est recalculé à la
// volée à partir des données déjà enregistrées (participants, notes, formations, évaluations ABF,
// relevés mensuels, actions du plan d'accompagnement), toujours filtrées en amont par le compte
// (creeParId) qui appelle ce calcul — jamais de comparaison entre conseillers.
const { calculerNiveauxAbf } = require("./questionnaireAbf");
const { obtenirQuestionnaireAbf } = require("./abfParTypeSuivi");
const { calculerBeneficeReleve } = require("./calculsFinanciers");
const { calculerSanteParticipant } = require("./santeParticipant");

// Nombre de jours au-delà de l'échéance considéré comme "échéance proche" pour une action pas
// encore en retard (même fenêtre que le Centre d'alertes du plan d'accompagnement).
const JOURS_ECHEANCE_PROCHE = 3;

function debutAujourdHui() {
  const debut = new Date();
  debut.setHours(0, 0, 0, 0);
  return debut;
}

// Moyenne simple, ou null si la liste est vide (pour ne jamais afficher "0" à la place de "aucune
// donnée disponible").
function moyenne(valeurs) {
  if (valeurs.length === 0) return null;
  return valeurs.reduce((a, b) => a + b, 0) / valeurs.length;
}

// --- Activité de terrain -----------------------------------------------------------------------
// participantsTous : tous les participants du conseiller (pas seulement ceux actifs sur la
// période), pour compter les PME actuellement actives. notesSuiviPeriode et formationsPeriode
// sont déjà filtrées par la période choisie (voir la route).
function calculerActiviteTerrain({ participantsTous, notesSuiviPeriode, formationsPeriode }) {
  return {
    nombrePmeActives: participantsTous.filter((p) => p.statut === "Actif").length,
    nombreNotesSuivi: notesSuiviPeriode.length,
    nombreFormations: formationsPeriode.length,
    nombreInscriptions: formationsPeriode.reduce((somme, f) => somme + (f._count?.participations ?? 0), 0),
  };
}

// --- Qualité de l'accompagnement -----------------------------------------------------------------
// Toujours calculée sur l'ensemble des actions (pas de filtre période) : c'est un indicateur de
// fond sur la manière dont le conseiller mène ses accompagnements, pas un indicateur d'activité
// récente.
function calculerQualiteAccompagnement({ actions }) {
  const total = actions.length;
  const realisees = actions.filter((a) => a.statut === "Réalisée");
  const ouvertes = actions.filter((a) => !["Réalisée", "Abandonnée"].includes(a.statut));

  const debut = debutAujourdHui();
  const seuilProche = new Date(debut);
  seuilProche.setDate(seuilProche.getDate() + JOURS_ECHEANCE_PROCHE);

  const nombreEnRetard = ouvertes.filter((a) => new Date(a.echeance) < debut).length;
  const nombreEcheanceProche = ouvertes.filter((a) => {
    const echeance = new Date(a.echeance);
    return echeance >= debut && echeance <= seuilProche;
  }).length;

  const delais = realisees
    .map((a) => (new Date(a.majLe) - new Date(a.creeLe)) / (1000 * 60 * 60 * 24))
    .filter((jours) => jours >= 0);

  return {
    totalActions: total,
    nombreRealisees: realisees.length,
    tauxReussite: total > 0 ? (realisees.length / total) * 100 : null,
    nombreEnRetard,
    nombreEcheanceProche,
    delaiMoyenTraitementJours: moyenne(delais),
  };
}

// --- Résultats obtenus par les PME ---------------------------------------------------------------
// evaluations et releves couvrent TOUS les participants du conseiller (pas de filtre période : on
// regarde le chemin parcouru depuis le début de l'accompagnement, pas seulement la période
// récente). actionsParParticipant sert uniquement au calcul du badge de santé (nombre d'actions en
// retard, propre à chaque PME).
function calculerResultatsPme({ participantsTous, evaluations, releves, actions }) {
  // Le questionnaire ABF (et donc les rubriques a utiliser pour lire "reponses") depend du type
  // de suivi de CHAQUE participant (Generique/Agriculture/Elevage) : indispensable a connaitre ici
  // pour ne pas ignorer silencieusement la progression des participants Agriculture/Elevage (leurs
  // reponses ne correspondent a aucune rubrique du questionnaire generique).
  const typeSuiviParParticipant = new Map(participantsTous.map((p) => [p.id, p.typeSuivi || "Generique"]));

  const evalsParParticipant = new Map();
  for (const evaluation of evaluations) {
    if (!evalsParParticipant.has(evaluation.participantId)) {
      evalsParParticipant.set(evaluation.participantId, []);
    }
    evalsParParticipant.get(evaluation.participantId).push(evaluation);
  }

  const progressionsAbf = [];
  for (const [participantId, listeEvals] of evalsParParticipant.entries()) {
    const avant = listeEvals
      .filter((e) => e.moment === "Avant formation")
      .sort((a, b) => new Date(a.dateEvaluation) - new Date(b.dateEvaluation))[0];
    const apresListe = listeEvals
      .filter((e) => e.moment === "Après formation")
      .sort((a, b) => new Date(a.dateEvaluation) - new Date(b.dateEvaluation));
    const apres = apresListe[apresListe.length - 1];
    if (!avant || !apres) continue;

    const { questionnaire } = obtenirQuestionnaireAbf(typeSuiviParParticipant.get(participantId) || "Generique");
    const extraireMoyenneNiveau = (reponses) => {
      const niveaux = Object.values(calculerNiveauxAbf(reponses, questionnaire))
        .map((n) => n.niveau)
        .filter((n) => n !== null && n !== undefined);
      return moyenne(niveaux);
    };
    const moyenneAvant = extraireMoyenneNiveau(avant.reponses);
    const moyenneApres = extraireMoyenneNiveau(apres.reponses);
    if (moyenneAvant !== null && moyenneApres !== null) {
      progressionsAbf.push(moyenneApres - moyenneAvant);
    }
  }

  const relevesParParticipant = new Map();
  for (const releve of releves) {
    if (!relevesParParticipant.has(releve.participantId)) {
      relevesParParticipant.set(releve.participantId, []);
    }
    relevesParParticipant.get(releve.participantId).push(releve);
  }

  const evolutionsBenefice = [];
  for (const listeReleves of relevesParParticipant.values()) {
    if (listeReleves.length < 2) continue;
    const triees = [...listeReleves].sort((a, b) => new Date(a.mois) - new Date(b.mois));
    const premier = calculerBeneficeReleve(triees[0]);
    const dernier = calculerBeneficeReleve(triees[triees.length - 1]);
    evolutionsBenefice.push(dernier - premier);
  }

  const actionsParParticipant = new Map();
  for (const action of actions) {
    if (!actionsParParticipant.has(action.participantId)) {
      actionsParParticipant.set(action.participantId, []);
    }
    actionsParParticipant.get(action.participantId).push(action);
  }

  const debut = debutAujourdHui();
  const repartitionBadges = { vert: 0, orange: 0, rouge: 0 };
  for (const participant of participantsTous) {
    const releveDuParticipant = (relevesParParticipant.get(participant.id) || [])
      .slice()
      .sort((a, b) => new Date(b.mois) - new Date(a.mois))[0];
    const evalsDuParticipant = (evalsParParticipant.get(participant.id) || [])
      .slice()
      .sort((a, b) => new Date(b.dateEvaluation) - new Date(a.dateEvaluation))[0];
    const actionsDuParticipant = actionsParParticipant.get(participant.id) || [];
    const nombreActionsEnRetard = actionsDuParticipant.filter(
      (a) => !["Réalisée", "Abandonnée"].includes(a.statut) && new Date(a.echeance) < debut
    ).length;

    const { badge } = calculerSanteParticipant({
      dernierReleve: releveDuParticipant || null,
      derniereEvaluationAbf: evalsDuParticipant || null,
      nombreActionsEnRetard,
      typeSuivi: participant.typeSuivi,
    });
    repartitionBadges[badge] += 1;
  }

  return {
    nombrePmeAvecProgressionAbf: progressionsAbf.length,
    progressionAbfMoyenne: moyenne(progressionsAbf),
    nombrePmeAvecEvolutionFinanciere: evolutionsBenefice.length,
    evolutionBeneficeMoyenne: moyenne(evolutionsBenefice),
    repartitionBadges,
  };
}

// --- Couverture du diagnostic ---------------------------------------------------------------------
function calculerCouvertureDiagnostic({ participantsTous, evaluations, actions }) {
  const total = participantsTous.length;
  if (total === 0) {
    return { totalPme: 0, pourcentageAvecAbf: null, pourcentageAvecAbfComplet: null, pourcentageAvecPlan: null };
  }

  const idsAvecAvant = new Set(
    evaluations.filter((e) => e.moment === "Avant formation").map((e) => e.participantId)
  );
  const idsAvecApres = new Set(
    evaluations.filter((e) => e.moment === "Après formation").map((e) => e.participantId)
  );
  const idsAvecPlan = new Set(actions.map((a) => a.participantId));

  const nombreAvecAbf = participantsTous.filter((p) => idsAvecAvant.has(p.id)).length;
  const nombreAvecAbfComplet = participantsTous.filter((p) => idsAvecAvant.has(p.id) && idsAvecApres.has(p.id)).length;
  const nombreAvecPlan = participantsTous.filter((p) => idsAvecPlan.has(p.id)).length;

  return {
    totalPme: total,
    pourcentageAvecAbf: (nombreAvecAbf / total) * 100,
    pourcentageAvecAbfComplet: (nombreAvecAbfComplet / total) * 100,
    pourcentageAvecPlan: (nombreAvecPlan / total) * 100,
  };
}

function calculerSuiviEvaluation({
  participantsTous,
  notesSuiviPeriode,
  formationsPeriode,
  actions,
  evaluations,
  releves,
}) {
  return {
    activiteTerrain: calculerActiviteTerrain({ participantsTous, notesSuiviPeriode, formationsPeriode }),
    qualiteAccompagnement: calculerQualiteAccompagnement({ actions }),
    resultatsPme: calculerResultatsPme({ participantsTous, evaluations, releves, actions }),
    couvertureDiagnostic: calculerCouvertureDiagnostic({ participantsTous, evaluations, actions }),
  };
}

module.exports = { calculerSuiviEvaluation };
