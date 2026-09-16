// Liste des modules/thèmes GERME (OIT) suivis par la plateforme. Chaque formation enregistrée
// doit référencer l'un de ces identifiants. Le libellé est ce qui s'affiche à l'écran — on peut
// changer un libellé sans casser les données existantes, mais changer un "id" romprait le lien
// avec les formations déjà enregistrées en base.
const MODULES_GERME = [
  { id: "entreprise_famille", label: "L'Entreprise et la Famille" },
  { id: "marketing", label: "Marketing" },
  { id: "achats_stock", label: "Achats et contrôle de stock" },
  { id: "estimation_couts", label: "Estimation des coûts" },
  { id: "personnel_productivite", label: "Personnel et productivité" },
  { id: "planification", label: "Planifiez pour votre entreprise" },
  { id: "tenue_registres", label: "Tenue des registres" },
];

module.exports = { MODULES_GERME };
