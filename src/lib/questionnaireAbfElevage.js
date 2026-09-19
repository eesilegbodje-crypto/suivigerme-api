// Questionnaire ABF (Analyse des Besoins en Formation) specifique aux participants suivis en
// Elevage (typeSuivi = "Elevage"), couvrant volaille et petits ruminants/bovins. Meme principe et
// meme format que le questionnaire generique (questionnaireAbf.js) : 3 questions par rubrique, 4
// options toujours dans le meme ordre (bonne pratique / partielle / absente / aucune information).
//
// Contenu redige par Claude a partir de bonnes pratiques d'elevage courantes, PAS issu d'un
// document officiel : a faire relire par un agent/technicien d'elevage ou veterinaire avant
// diffusion large aux conseillers, en particulier la rubrique "Sante animale et prophylaxie".
//
// IMPORTANT : ne jamais changer un "id" de rubrique ou de question une fois des evaluations
// enregistrees en base.
const { MODULES_GERME } = require("./modulesGerme");

const QUESTIONNAIRE_ABF_ELEVAGE = [
  {
    rubriqueId: "habitat_elevage",
    titre: "Habitat et infrastructures d'élevage",
    questions: [
      {
        id: "habitat_elevage_1",
        texte: "Vos animaux disposent-ils d'un abri adapté (protection contre la pluie, le soleil, les prédateurs) ?",
        options: [
          "Oui, un abri adapté pour tous les animaux",
          "Un abri partiel ou insuffisant",
          "Non, aucun abri particulier",
          "Aucune information sur le sujet",
        ],
      },
      {
        id: "habitat_elevage_2",
        texte: "L'espace disponible est-il suffisant pour le nombre d'animaux élevés (pas de surpopulation) ?",
        options: [
          "Oui, l'espace est suffisant",
          "L'espace est juste suffisant",
          "Non, les animaux sont à l'étroit",
          "Aucune information sur le sujet",
        ],
      },
      {
        id: "habitat_elevage_3",
        texte: "Les infrastructures (enclos, poulailler, étable...) sont-elles entretenues et réparées régulièrement ?",
        options: [
          "Oui, un entretien régulier",
          "Un entretien occasionnel",
          "Non, peu ou pas d'entretien",
          "Aucune information sur le sujet",
        ],
      },
    ],
  },
  {
    rubriqueId: "alimentation_abreuvement",
    titre: "Alimentation et abreuvement",
    questions: [
      {
        id: "alimentation_abreuvement_1",
        texte: "Les animaux reçoivent-ils une alimentation adaptée à leur espèce et à leur stade (croissance, reproduction...) ?",
        options: [
          "Oui, une alimentation adaptée et régulière",
          "Une alimentation approximative",
          "Non, pas d'attention particulière",
          "Aucune information sur le sujet",
        ],
      },
      {
        id: "alimentation_abreuvement_2",
        texte: "L'eau propre est-elle disponible en permanence pour les animaux ?",
        options: [
          "Oui, disponible en permanence",
          "Disponible mais pas toujours propre ou suffisante",
          "Non, l'accès à l'eau est irrégulier",
          "Aucune information sur le sujet",
        ],
      },
      {
        id: "alimentation_abreuvement_3",
        texte: "Complétez-vous l'alimentation en période de soudure ou de rareté du fourrage/pâturage ?",
        options: [
          "Oui, une solution de complément prévue",
          "Une solution partielle ou occasionnelle",
          "Non, aucune solution prévue",
          "Aucune information sur le sujet",
        ],
      },
    ],
  },
  {
    rubriqueId: "sante_prophylaxie",
    titre: "Santé animale et prophylaxie",
    questions: [
      {
        id: "sante_prophylaxie_1",
        texte: "Suivez-vous un calendrier de vaccination et de déparasitage pour vos animaux ?",
        options: [
          "Oui, un calendrier respecté régulièrement",
          "Un suivi irrégulier",
          "Non, aucun calendrier suivi",
          "Aucune information sur le sujet",
        ],
      },
      {
        id: "sante_prophylaxie_2",
        texte: "Savez-vous reconnaître les premiers signes de maladie chez vos animaux ?",
        options: [
          "Oui, je les reconnais et j'agis rapidement",
          "Je les reconnais parfois, avec retard",
          "Non, je ne sais pas les reconnaître",
          "Aucune information sur le sujet",
        ],
      },
      {
        id: "sante_prophylaxie_3",
        texte: "Avez-vous accès à un agent vétérinaire ou de santé animale en cas de besoin ?",
        options: [
          "Oui, un accès facile et rapide",
          "Un accès possible mais difficile ou coûteux",
          "Non, aucun accès",
          "Aucune information sur le sujet",
        ],
      },
    ],
  },
  {
    rubriqueId: "reproduction_cheptel",
    titre: "Reproduction et gestion du cheptel",
    questions: [
      {
        id: "reproduction_cheptel_1",
        texte: "Maîtrisez-vous les périodes et conditions de reproduction de vos animaux ?",
        options: [
          "Oui, je les maîtrise bien",
          "J'en ai une connaissance partielle",
          "Non, je ne les maîtrise pas",
          "Aucune information sur le sujet",
        ],
      },
      {
        id: "reproduction_cheptel_2",
        texte: "Tenez-vous un suivi (registre, marquage) de votre cheptel (nombre, âge, origine des animaux) ?",
        options: [
          "Oui, un suivi précis et à jour",
          "Un suivi approximatif",
          "Non, aucun suivi",
          "Aucune information sur le sujet",
        ],
      },
      {
        id: "reproduction_cheptel_3",
        texte: "Renouvelez-vous ou améliorez-vous votre cheptel (sélection des reproducteurs, introduction de géniteurs) ?",
        options: [
          "Oui, une démarche régulière",
          "Une démarche occasionnelle",
          "Non, aucune démarche particulière",
          "Aucune information sur le sujet",
        ],
      },
    ],
  },
  {
    rubriqueId: "hygiene_biosecurite",
    titre: "Hygiène et biosécurité",
    questions: [
      {
        id: "hygiene_biosecurite_1",
        texte: "Les lieux d'élevage sont-ils nettoyés régulièrement (litière, enclos, mangeoires, abreuvoirs) ?",
        options: [
          "Oui, un nettoyage régulier",
          "Un nettoyage occasionnel",
          "Non, rarement nettoyé",
          "Aucune information sur le sujet",
        ],
      },
      {
        id: "hygiene_biosecurite_2",
        texte: "Isolez-vous les animaux malades ou nouvellement acquis avant de les mélanger au reste du cheptel ?",
        options: ["Oui, systématiquement", "Parfois seulement", "Non, jamais", "Aucune information sur le sujet"],
      },
      {
        id: "hygiene_biosecurite_3",
        texte:
          "Des mesures limitent-elles l'entrée de visiteurs, d'autres animaux ou de véhicules pouvant transmettre des maladies ?",
        options: [
          "Oui, des mesures claires appliquées",
          "Quelques précautions ponctuelles",
          "Non, aucune mesure particulière",
          "Aucune information sur le sujet",
        ],
      },
    ],
  },
  {
    rubriqueId: "commercialisation_elevage",
    titre: "Commercialisation des produits d'élevage",
    questions: [
      {
        id: "commercialisation_elevage_1",
        texte: "Connaissez-vous plusieurs débouchés pour vendre vos animaux ou vos produits (œufs, lait, viande) ?",
        options: [
          "Oui, plusieurs débouchés identifiés",
          "Un seul débouché habituel",
          "Non, je vends au premier acheteur venu",
          "Aucune information sur le sujet",
        ],
      },
      {
        id: "commercialisation_elevage_2",
        texte: "Connaissez-vous les prix du marché avant de vendre vos animaux ou produits ?",
        options: [
          "Oui, je me renseigne systématiquement",
          "Je me renseigne parfois",
          "Non, je ne me renseigne pas",
          "Aucune information sur le sujet",
        ],
      },
      {
        id: "commercialisation_elevage_3",
        texte: "Planifiez-vous vos ventes pour viser les meilleures périodes (fêtes, forte demande) ?",
        options: [
          "Oui, une planification régulière",
          "Une planification occasionnelle",
          "Non, je vends selon les besoins immédiats",
          "Aucune information sur le sujet",
        ],
      },
    ],
  },
  {
    rubriqueId: "gestion_financiere_elevage",
    titre: "Gestion financière de l'exploitation d'élevage",
    questions: [
      {
        id: "gestion_financiere_elevage_1",
        texte: "Tenez-vous un registre des dépenses (aliments, soins, achats d'animaux) et des recettes de votre élevage ?",
        options: [
          "Oui, systématiquement",
          "De façon partielle ou irrégulière",
          "Non, aucun registre",
          "Aucune information sur le sujet",
        ],
      },
      {
        id: "gestion_financiere_elevage_2",
        texte: "Connaissez-vous le coût réel d'élevage d'un animal jusqu'à sa vente ?",
        options: [
          "Oui, je le calcule",
          "J'en ai une estimation approximative",
          "Non, je ne le calcule pas",
          "Aucune information sur le sujet",
        ],
      },
      {
        id: "gestion_financiere_elevage_3",
        texte: "Réinvestissez-vous une partie des revenus dans l'amélioration de votre élevage ?",
        options: ["Oui, régulièrement", "Occasionnellement", "Non, jamais", "Aucune information sur le sujet"],
      },
    ],
  },
  {
    rubriqueId: "organisation_travail_elevage",
    titre: "Organisation du travail",
    questions: [
      {
        id: "organisation_travail_elevage_1",
        texte: "Les tâches quotidiennes (alimentation, nettoyage, surveillance) sont-elles réparties clairement ?",
        options: [
          "Oui, une répartition claire",
          "Une répartition approximative",
          "Non, pas de répartition définie",
          "Aucune information sur le sujet",
        ],
      },
      {
        id: "organisation_travail_elevage_2",
        texte: "Y a-t-il toujours quelqu'un pour s'occuper des animaux, y compris en cas d'absence ou d'urgence ?",
        options: [
          "Oui, une solution de remplacement prévue",
          "Une solution incertaine",
          "Non, aucune solution prévue",
          "Aucune information sur le sujet",
        ],
      },
      {
        id: "organisation_travail_elevage_3",
        texte: "La main d'œuvre est-elle rémunérée ou valorisée équitablement pour le travail réalisé ?",
        options: [
          "Oui, de manière équitable",
          "Partiellement",
          "Non, pas de rémunération formalisée",
          "Aucune information sur le sujet",
        ],
      },
    ],
  },
  {
    rubriqueId: "gestion_risques_elevage",
    titre: "Gestion des risques (maladies, aléas climatiques)",
    questions: [
      {
        id: "gestion_risques_elevage_1",
        texte: "Avez-vous un plan d'action en cas d'épidémie ou de maladie touchant plusieurs animaux à la fois ?",
        options: [
          "Oui, un plan d'action clair",
          "Une idée approximative de ce qu'il faut faire",
          "Non, aucun plan",
          "Aucune information sur le sujet",
        ],
      },
      {
        id: "gestion_risques_elevage_2",
        texte: "Assurez-vous ou épargnez-vous pour faire face à la perte d'animaux (maladie, vol, aléas climatiques) ?",
        options: [
          "Oui, une solution de protection en place",
          "Une solution limitée",
          "Non, aucune solution",
          "Aucune information sur le sujet",
        ],
      },
      {
        id: "gestion_risques_elevage_3",
        texte: "Adaptez-vous votre élevage aux périodes climatiques difficiles (forte chaleur, saison des pluies) ?",
        options: [
          "Oui, des mesures d'adaptation appliquées",
          "Quelques mesures ponctuelles",
          "Non, aucune adaptation particulière",
          "Aucune information sur le sujet",
        ],
      },
    ],
  },
  {
    rubriqueId: "financement_elevage",
    titre: "Accès aux intrants et au financement d'élevage",
    questions: [
      {
        id: "financement_elevage_1",
        texte: "Arrivez-vous à vous procurer à temps les aliments et produits vétérinaires nécessaires ?",
        options: [
          "Oui, sans difficulté majeure",
          "Avec des difficultés ou retards fréquents",
          "Non, je manque souvent d'intrants essentiels",
          "Aucune information sur le sujet",
        ],
      },
      {
        id: "financement_elevage_2",
        texte:
          "Avez-vous accès à une source de financement (crédit, tontine, coopérative, microfinance) pour investir dans votre élevage ?",
        options: [
          "Oui, un accès régulier",
          "Un accès occasionnel ou limité",
          "Non, aucun accès",
          "Aucune information sur le sujet",
        ],
      },
      {
        id: "financement_elevage_3",
        texte: "Connaissez-vous les conditions des offres de financement ou d'appui à l'élevage disponibles dans votre zone ?",
        options: [
          "Oui, je les connais bien",
          "J'en ai une idée partielle",
          "Non, je ne les connais pas",
          "Aucune information sur le sujet",
        ],
      },
    ],
  },
  {
    rubriqueId: "gestion_sous_produits",
    titre: "Gestion des sous-produits et de l'environnement",
    questions: [
      {
        id: "gestion_sous_produits_1",
        texte: "Valorisez-vous les sous-produits de votre élevage (fumier, lisier) comme engrais ou source de revenu ?",
        options: [
          "Oui, une valorisation régulière",
          "Une valorisation occasionnelle",
          "Non, aucune valorisation",
          "Aucune information sur le sujet",
        ],
      },
      {
        id: "gestion_sous_produits_2",
        texte:
          "Les déjections animales sont-elles gérées de façon à ne pas polluer l'eau ou l'environnement autour de l'exploitation ?",
        options: [
          "Oui, une gestion propre et organisée",
          "Une gestion partielle",
          "Non, aucune précaution particulière",
          "Aucune information sur le sujet",
        ],
      },
      {
        id: "gestion_sous_produits_3",
        texte:
          "Les carcasses ou déchets d'animaux morts sont-ils éliminés de façon sûre (enfouissement, incinération) plutôt qu'abandonnés ?",
        options: [
          "Oui, systématiquement de façon sûre",
          "Parfois seulement",
          "Non, souvent abandonnés sans précaution",
          "Aucune information sur le sujet",
        ],
      },
    ],
  },
];

const IDS_DOMAINES_ELEVAGE = [
  "alimentation_elevage",
  "sante_animale_prophylaxie",
  "reproduction_amelioration",
  "habitat_biosecurite",
  "commercialisation_elevage",
  "financement_elevage",
  "vie_associative_rurale",
];
const DOMAINES_BESOIN_FORMATION_ELEVAGE = MODULES_GERME.filter((m) => IDS_DOMAINES_ELEVAGE.includes(m.id));

module.exports = { QUESTIONNAIRE_ABF_ELEVAGE, DOMAINES_BESOIN_FORMATION_ELEVAGE };
