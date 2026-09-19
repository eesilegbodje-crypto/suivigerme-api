// Filieres couvertes pour l'instant par les modules Agriculture et Elevage : sert a proposer la
// bonne liste dans le formulaire (menu deroulant "Filiere") et a retrouver la fiche technique ou
// de prophylaxie correspondante (voir fichesTechniquesAgriculture.js et
// fichesProphylaxieElevage.js, qui utilisent les memes identifiants).
const FILIERES_AGRICULTURE = [
  { id: "mais", label: "Maïs" },
  { id: "riz", label: "Riz" },
  { id: "manioc", label: "Manioc" },
  { id: "igname", label: "Igname" },
  { id: "tomate", label: "Tomate" },
  { id: "gombo", label: "Gombo" },
  { id: "aubergine", label: "Aubergine" },
  // Pour toute culture non listee ci-dessus : le conseiller precise la culture en texte libre
  // (champ "filierePrecision" du participant). Aucune fiche technique standard n'existe pour ce
  // choix (voir fichesTechniquesAgriculture.js), l'onglet "Fiche technique" l'indique clairement.
  { id: "autre", label: "Autre" },
];

const FILIERES_ELEVAGE = [
  { id: "volaille", label: "Volaille" },
  { id: "petits_ruminants_bovins", label: "Petits ruminants et bovins" },
  // Pour toute espece/activite non listee ci-dessus (ex. porcs, lapins, apiculture...) : le
  // conseiller precise l'activite en texte libre (champ "filierePrecision" du participant).
  // Aucune fiche de prophylaxie standard n'existe pour ce choix -- une fiche est alors generee
  // automatiquement par IA au premier affichage de l'onglet (voir generationFicheIa.js).
  { id: "autre", label: "Autre" },
];

function filieresPourTypeSuivi(typeSuivi) {
  if (typeSuivi === "Agriculture") return FILIERES_AGRICULTURE;
  if (typeSuivi === "Elevage") return FILIERES_ELEVAGE;
  return [];
}

module.exports = { FILIERES_AGRICULTURE, FILIERES_ELEVAGE, filieresPourTypeSuivi };
