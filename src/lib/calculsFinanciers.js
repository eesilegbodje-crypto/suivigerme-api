// Petits calculs financiers pour la Tenue des registres et l'Estimation des coûts. Rien ici n'est
// jamais stocké en base : tout est recalculé à la lecture, pour ne jamais avoir un chiffre affiché
// qui ne corresponde plus aux valeurs saisies (même principe que calculerNiveauxAbf).

// Tenue des registres : bénéfice net simple = ventes - achats - dépenses du mois.
function calculerBeneficeReleve(releve) {
  return releve.ventesTotales - releve.achatsTotaux - releve.depenses;
}

// Estimation des coûts : coût total, coût unitaire, prix de vente conseillé selon la marge
// souhaitée. Si la quantité produite est 0 ou absente, le coût unitaire et le prix conseillé ne
// peuvent pas être calculés (on renvoie null plutôt qu'une division par zéro).
function calculerEstimationCout(estimation) {
  const coutTotal = estimation.coutMatieres + estimation.coutMainOeuvre + estimation.fraisGeneraux;
  const coutUnitaire = estimation.quantiteProduite > 0 ? coutTotal / estimation.quantiteProduite : null;
  const prixVenteConseille = coutUnitaire !== null ? coutUnitaire * (1 + estimation.margeSouhaitee / 100) : null;

  return { coutTotal, coutUnitaire, prixVenteConseille };
}

module.exports = { calculerBeneficeReleve, calculerEstimationCout };
