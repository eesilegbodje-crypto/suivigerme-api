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

  // Modules ajoutés pour couvrir les 5 rubriques du questionnaire ABF générique qui n'avaient
  // pas encore de module de formation correspondant (voir questionnaireAbf.js : 12 rubriques au
  // total, "Entreprise et famille" mise à part car ce n'est pas un module de formation à part
  // entière -- il restait donc 11 rubriques à couvrir, dont seulement 6 avaient un module).
  { id: "gouvernance", label: "Gouvernance et organisation de l'entreprise" },
  { id: "finance_tresorerie", label: "Gestion financière et trésorerie" },
  { id: "juridique_fiscal", label: "Environnement juridique et fiscal" },
  { id: "numerique_cybersecurite", label: "Outils numériques et cybersécurité" },
  { id: "risques_resilience", label: "Gestion des risques et résilience" },

  // Modules ajoutés pour les participants suivis en Agriculture (voir questionnaireAbfAgriculture.js).
  { id: "itineraire_technique", label: "Techniques culturales et itinéraire technique" },
  { id: "gestion_eau_irrigation", label: "Gestion de l'eau et irrigation" },
  { id: "fertilisation_sols", label: "Fertilisation et santé des sols" },
  { id: "protection_phytosanitaire", label: "Protection phytosanitaire" },
  { id: "recolte_post_recolte", label: "Récolte, post-récolte et stockage" },
  { id: "commercialisation_agricole", label: "Commercialisation des produits agricoles" },
  { id: "financement_agricole", label: "Accès au financement agricole" },

  // Modules ajoutés pour les participants suivis en Élevage (voir questionnaireAbfElevage.js).
  { id: "alimentation_elevage", label: "Alimentation et conduite de l'élevage" },
  { id: "sante_animale_prophylaxie", label: "Santé animale et prophylaxie" },
  { id: "reproduction_amelioration", label: "Reproduction et amélioration génétique" },
  { id: "habitat_biosecurite", label: "Habitat et biosécurité de l'élevage" },
  { id: "commercialisation_elevage", label: "Commercialisation des produits d'élevage" },
  { id: "financement_elevage", label: "Accès au financement et aux intrants d'élevage" },

  // Module partagé Agriculture + Élevage (thème identique dans les deux filières).
  { id: "vie_associative_rurale", label: "Organisation en coopérative et vie associative" },
];

module.exports = { MODULES_GERME };
