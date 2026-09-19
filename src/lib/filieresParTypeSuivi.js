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
];

const FILIERES_ELEVAGE = [
  { id: "volaille", label: "Volaille" },
  { id: "petits_ruminants_bovins", label: "Petits ruminants et bovins" },
];

function filieresPourTypeSuivi(typeSuivi) {
  if (typeSuivi === "Agriculture") return FILIERES_AGRICULTURE;
  if (typeSuivi === "Elevage") return FILIERES_ELEVAGE;
  return [];
}

module.exports = { FILIERES_AGRICULTURE, FILIERES_ELEVAGE, filieresPourTypeSuivi };
