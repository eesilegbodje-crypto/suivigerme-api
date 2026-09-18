// Calcule les alertes de santé d'une PME à la volée (jamais stocké en base, même principe que le
// Centre d'alertes de CollectivIA : recalculé à chaque lecture, pour ne jamais afficher une alerte
// qui ne correspond plus à la situation réelle) à partir de son dernier relevé mensuel, sa
// dernière évaluation ABF, et le nombre d'actions de son plan d'accompagnement en retard.
const { calculerBeneficeReleve } = require("./calculsFinanciers");
const { calculerNiveauxAbf } = require("./questionnaireAbf");

function libelleMoisFr(dateIso) {
  try {
    const libelle = new Date(dateIso).toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
    return libelle.charAt(0).toUpperCase() + libelle.slice(1);
  } catch {
    return "—";
  }
}

function calculerSanteParticipant({ dernierReleve, derniereEvaluationAbf, nombreActionsEnRetard }) {
  const alertes = [];

  if (dernierReleve) {
    const beneficeNet = calculerBeneficeReleve(dernierReleve);
    if (beneficeNet < 0) {
      alertes.push({
        niveau: "rouge",
        type: "financier",
        message: `Bénéfice net négatif sur le dernier relevé mensuel (${libelleMoisFr(dernierReleve.mois)}).`,
      });
    }
  }

  if (derniereEvaluationAbf) {
    const niveaux = Object.values(calculerNiveauxAbf(derniereEvaluationAbf.reponses))
      .map((n) => n.niveau)
      .filter((n) => n !== null && n !== undefined);
    if (niveaux.length > 0) {
      const moyenne = niveaux.reduce((a, b) => a + b, 0) / niveaux.length;
      if (moyenne <= 2) {
        alertes.push({
          niveau: "orange",
          type: "abf",
          message: `Diagnostic ABF préoccupant (moyenne ${moyenne.toFixed(1)}/5 sur la dernière évaluation).`,
        });
      }
    }
  }

  if (nombreActionsEnRetard > 0) {
    alertes.push({
      niveau: "orange",
      type: "accompagnement",
      message: `${nombreActionsEnRetard} action${nombreActionsEnRetard > 1 ? "s" : ""} du plan d'accompagnement en retard.`,
    });
  }

  let badge = "vert";
  if (alertes.some((a) => a.niveau === "rouge")) badge = "rouge";
  else if (alertes.some((a) => a.niveau === "orange")) badge = "orange";

  return { badge, alertes };
}

module.exports = { calculerSanteParticipant };
