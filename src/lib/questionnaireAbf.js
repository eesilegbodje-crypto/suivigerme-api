// Structure complète du questionnaire ABF (Analyse des Besoins en Formation), rempli par
// l'entrepreneur avant une formation (pour identifier ses besoins) puis après (pour mesurer son
// évolution). Reprend exactement le questionnaire papier utilisé sur le terrain. Chaque rubrique
// correspond à l'un des modules GERME (voir modulesGerme.js).
//
// IMPORTANT : ne jamais changer un "id" de rubrique ou de question une fois des évaluations
// enregistrées en base — cela romprait le lien avec les réponses déjà sauvegardées. Changer un
// texte affiché (titre, question, option) est sans risque.
//
// Pour chaque question, les 4 options sont toujours dans le même ordre : la meilleure pratique
// (index 0), une pratique partielle (index 1), l'absence de pratique (index 2), puis "aucune
// information sur le sujet" (index 3). C'est ce qui permet de calculer un niveau indicatif par
// rubrique dans calculerNiveauxAbf ci-dessous.
const { MODULES_GERME } = require("./modulesGerme");

const QUESTIONNAIRE_ABF = [
  {
    rubriqueId: "entreprise_famille",
    titre: "Entreprise et famille",
    questions: [
      {
        id: "entreprise_famille_1",
        texte: "Le propriétaire ou le gérant reçoit-il un salaire fixe et régulier ?",
        options: ["Oui, toujours", "Non, parfois", "Non, jamais", "Aucune information sur le sujet"],
      },
      {
        id: "entreprise_famille_2",
        texte:
          "Les membres de la famille qui travaillent dans l'entreprise sont-ils rémunérés comme les autres employés ?",
        options: [
          "Oui, de manière équitable",
          "Parfois, selon leur rôle et leur implication",
          "Non, ils ne sont pas rémunérés",
          "Aucune information sur le sujet",
        ],
      },
      {
        id: "entreprise_famille_3",
        texte: "Les sorties d'argent de la caisse sont-elles systématiquement justifiées par un reçu ?",
        options: ["Oui, toujours", "Parfois", "Non", "Aucune information sur le sujet"],
      },
    ],
  },
  {
    rubriqueId: "marketing",
    titre: "Marketing",
    questions: [
      {
        id: "marketing_1",
        texte: "Connaissez-vous bien les besoins, les préférences et les budgets de vos clients ?",
        options: [
          "Très bien, j'ai une connaissance approfondie",
          "Moyennement, je m'efforce de comprendre",
          "Non, je n'ai pas d'outils ou de méthodes pour les analyser",
          "Aucune information sur le sujet",
        ],
      },
      {
        id: "marketing_2",
        texte: "Votre entreprise se distingue-t-elle clairement de la concurrence dans l'esprit de vos clients ?",
        options: [
          "Oui, j'ai une proposition de valeur claire",
          "En partie, mais je n'ai pas d'élément différenciateur bien défini",
          "Non, je n'ai pas encore défini ma position sur le marché",
          "Aucune information sur le sujet",
        ],
      },
      {
        id: "marketing_3",
        texte:
          "Utilisez-vous les 7 P du marketing (Produit, Prix, Place, Promotion, Personnel, Processus, Preuve physique) dans votre stratégie ?",
        options: [
          "Oui, j'utilise tous les 7 P dans ma stratégie",
          "Quelques-uns seulement (ex : Produit, Prix, Place)",
          "Non, je ne les utilise pas",
          "Aucune information sur le sujet",
        ],
      },
    ],
  },
  {
    rubriqueId: "achats_stock",
    titre: "Achat et contrôle de stock",
    questions: [
      {
        id: "achats_stock_1",
        texte:
          "Collectez-vous les informations sur les prix des fournisseurs, vérifiez-vous les marchandises à la livraison et gérez-vous les produits défectueux ?",
        options: [
          "Oui, je fais tout cela de manière systématique",
          "Oui, mais je fais cela de manière ponctuelle",
          "Non, je ne le fais pas ou pas assez",
          "Aucune information sur le sujet",
        ],
      },
      {
        id: "achats_stock_2",
        texte: "Tenez-vous des fiches de stock, faites-vous des mises à jour et effectuez-vous des inventaires périodiques ?",
        options: [
          "Oui, j'ai un système de gestion de stock mis à jour régulièrement",
          "Parfois, mais ce n'est pas toujours suivi",
          "Non, je ne tiens pas de registre de stock",
          "Aucune information sur le sujet",
        ],
      },
      {
        id: "achats_stock_3",
        texte:
          "Planifiez-vous vos approvisionnements selon les besoins, évaluez-vous vos fournisseurs et assurez-vous de la qualité des stocks ?",
        options: [
          "Oui, j'ai un plan d'approvisionnement structuré et évalué régulièrement",
          "Parfois, mais je fais cela de manière informelle",
          "Non, je n'ai pas de plan d'approvisionnement formel",
          "Aucune information sur le sujet",
        ],
      },
    ],
  },
  {
    rubriqueId: "tenue_registres",
    titre: "Tenue des registres",
    questions: [
      {
        id: "tenue_registres_1",
        texte: "Tenez-vous un registre principal ou de base des activités de l'entreprise ?",
        options: [
          "Oui, tout est bien documenté et organisé",
          "Parfois, mais ce n'est pas toujours à jour",
          "Non, je ne tiens pas de registre formel",
          "Aucune information sur le sujet",
        ],
      },
      {
        id: "tenue_registres_2",
        texte: "Tenez-vous un compte client et un registre des actifs de l'entreprise ?",
        options: [
          "Oui, tout est bien enregistré",
          "Non, mais j'ai une idée générale",
          "Non, je n'ai pas de registre des comptes ou des actifs",
          "Aucune information sur le sujet",
        ],
      },
      {
        id: "tenue_registres_3",
        texte: "Calculez-vous régulièrement les bénéfices et les pertes de votre entreprise ?",
        options: [
          "Oui, chaque mois ou chaque trimestre",
          "Parfois, mais pas de manière régulière",
          "Non, je ne fais pas de calculs réguliers",
          "Aucune information sur le sujet",
        ],
      },
    ],
  },
  {
    rubriqueId: "estimation_couts",
    titre: "Estimation des coûts",
    questions: [
      {
        id: "estimation_couts_1",
        texte: "Calculez-vous les coûts directs des matières ou des services que vous achetez pour votre activité ?",
        options: [
          "Oui, je les calcule de manière systématique",
          "Parfois, pour les achats importants",
          "Non, je ne fais pas ce calcul",
          "Aucune information sur le sujet",
        ],
      },
      {
        id: "estimation_couts_2",
        texte: "Calculez-vous les coûts directs liés à la main-d'œuvre (salaires, charges, etc.) ?",
        options: [
          "Oui, j'ai un calcul précis des coûts de main-d'œuvre",
          "Parfois, mais cela varie",
          "Non, je ne calcule pas ce coût",
          "Aucune information sur le sujet",
        ],
      },
      {
        id: "estimation_couts_3",
        texte: "Calculez-vous les frais indirects ou généraux (loyer, électricité, marketing, etc.) ?",
        options: [
          "Oui, tous les frais sont pris en compte",
          "Parfois, mais pas tous les frais",
          "Non, je n'évalue pas ces coûts",
          "Aucune information sur le sujet",
        ],
      },
    ],
  },
  {
    rubriqueId: "planification",
    titre: "Planification pour votre entreprise",
    questions: [
      {
        id: "planification_1",
        texte: "Avez-vous un plan de profit qui prévoit les ventes, les coûts et les marges ?",
        options: [
          "Oui, j'ai un plan de profit détaillé",
          "Non, mais j'ai une idée des prévisions",
          "Non, je n'ai pas de plan spécifique",
          "Aucune information sur le sujet",
        ],
      },
      {
        id: "planification_2",
        texte: "Planifiez-vous la gestion de la trésorerie (flux de liquidités) et les risques financiers ?",
        options: [
          "Oui, j'ai un suivi de trésorerie et un plan de gestion des risques",
          "Parfois, mais ce n'est pas toujours suivi",
          "Non, je n'ai pas de plan de trésorerie ou de gestion des risques",
          "Aucune information sur le sujet",
        ],
      },
      {
        id: "planification_3",
        texte: "Avez-vous établi un plan de développement pour faire croître votre entreprise dans les années à venir ?",
        options: [
          "Oui, j'ai un plan stratégique clair",
          "Non, mais je réfléchis à l'avenir",
          "Non, je n'ai pas de plan spécifique",
          "Aucune information sur le sujet",
        ],
      },
    ],
  },
  {
    rubriqueId: "personnel_productivite",
    titre: "Personnel et productivité",
    questions: [
      {
        id: "personnel_productivite_1",
        texte:
          "Suivez-vous les indicateurs de productivité pour améliorer l'efficacité de votre entreprise (ex : temps de production, qualité, coût) ?",
        options: [
          "Oui, je suis tous les indicateurs de performance",
          "Parfois, mais ce n'est pas systématique",
          "Non, je ne mesure pas la productivité",
          "Aucune information sur le sujet",
        ],
      },
      {
        id: "personnel_productivite_2",
        texte: "Avez-vous une méthode pour recruter des employés ou des collaborateurs productifs et compétents ?",
        options: [
          "Oui, j'ai une méthode de recrutement bien établie",
          "Parfois, mais je manque de processus formels",
          "Non, je n'ai pas de méthode spécifique",
          "Aucune information sur le sujet",
        ],
      },
      {
        id: "personnel_productivite_3",
        texte: "Encouragez-vous la productivité du personnel (par des formations, des primes, ou des objectifs) ?",
        options: [
          "Oui, j'ai des mesures concrètes pour motiver mon équipe",
          "Parfois, mais de manière informelle",
          "Non, je ne mets pas en place d'initiatives de motivation",
          "Aucune information sur le sujet",
        ],
      },
    ],
  },
  // ------------------------------------------------------------------------
  // Rubriques "Diagnostic PME 360" (18/09/2026) : ajoutees directement ici, dans le meme
  // questionnaire que les modules GERME ci-dessus, pour rester un seul instrument uniforme.
  // Ne couvrent QUE les domaines non deja traites par une rubrique existante (Commercial est deja
  // couvert par "marketing", Production par "achats_stock", RH par "personnel_productivite").
  // ------------------------------------------------------------------------
  {
    rubriqueId: "gouvernance",
    titre: "Gouvernance et organisation",
    questions: [
      {
        id: "gouvernance_1",
        texte: "Les rôles et responsabilités de chaque personne dans l'entreprise sont-ils clairement définis ?",
        options: [
          "Oui, chacun connaît précisément son rôle",
          "Partiellement, certains rôles restent flous",
          "Non, les rôles ne sont pas définis",
          "Aucune information sur le sujet",
        ],
      },
      {
        id: "gouvernance_2",
        texte:
          "Les tâches importantes de l'entreprise (production, ventes, paiements) suivent-elles des façons de faire écrites ou bien établies, suivies par tous ?",
        options: [
          "Oui, des procédures claires sont suivies par tous",
          "En partie, seulement pour certaines tâches",
          "Non, chacun fait à sa manière",
          "Aucune information sur le sujet",
        ],
      },
      {
        id: "gouvernance_3",
        texte: "En cas d'absence du dirigeant, une autre personne peut-elle prendre le relais sans que l'activité s'arrête ?",
        options: [
          "Oui, une autre personne peut prendre le relais",
          "Difficilement, certaines décisions doivent attendre son retour",
          "Non, l'activité s'arrête en son absence",
          "Aucune information sur le sujet",
        ],
      },
    ],
  },
  {
    rubriqueId: "finance_tresorerie",
    titre: "Finance et trésorerie",
    questions: [
      {
        id: "finance_tresorerie_1",
        texte: "Savez-vous à tout moment combien d'argent l'entreprise a réellement en caisse et en banque ?",
        options: [
          "Oui, le solde est suivi et connu en permanence",
          "Approximativement, sans suivi rigoureux",
          "Non, ce n'est pas suivi",
          "Aucune information sur le sujet",
        ],
      },
      {
        id: "finance_tresorerie_2",
        texte:
          "Les dettes de l'entreprise (fournisseurs, prêts) et les créances (argent dû par les clients) sont-elles suivies et maîtrisées ?",
        options: [
          "Oui, elles sont suivies et maîtrisées",
          "Suivies partiellement",
          "Non, elles ne sont pas suivies",
          "Aucune information sur le sujet",
        ],
      },
      {
        id: "finance_tresorerie_3",
        texte:
          "Savez-vous si l'entreprise est réellement rentable (le chiffre d'affaires couvre-t-il toutes les charges avec une marge) ?",
        options: [
          "Oui, la rentabilité est calculée régulièrement",
          "Approximativement, sans calcul précis",
          "Non, ce n'est pas su",
          "Aucune information sur le sujet",
        ],
      },
    ],
  },
  {
    rubriqueId: "juridique_fiscal",
    titre: "Juridique, fiscal et conformité",
    questions: [
      {
        id: "juridique_fiscal_1",
        texte: "L'entreprise est-elle immatriculée au Registre du Commerce et du Crédit Mobilier (RCCM) ?",
        options: [
          "Oui, l'immatriculation est à jour",
          "En cours de régularisation",
          "Non, elle n'est pas immatriculée",
          "Aucune information sur le sujet",
        ],
      },
      {
        id: "juridique_fiscal_2",
        texte: "La situation fiscale de l'entreprise (déclarations, paiements d'impôts) est-elle à jour ?",
        options: [
          "Oui, à jour",
          "Partiellement, avec du retard sur certains points",
          "Non, pas à jour",
          "Aucune information sur le sujet",
        ],
      },
      {
        id: "juridique_fiscal_3",
        texte:
          "Les relations importantes de l'entreprise (clients, fournisseurs, employés) sont-elles couvertes par des contrats ou assurances écrits ?",
        options: [
          "Oui, systématiquement",
          "Seulement pour certaines relations",
          "Non, tout repose sur des accords oraux",
          "Aucune information sur le sujet",
        ],
      },
    ],
  },
  {
    rubriqueId: "numerique_cybersecurite",
    titre: "Numérique et cybersécurité",
    questions: [
      {
        id: "numerique_cybersecurite_1",
        texte:
          "L'entreprise utilise-t-elle des outils numériques pour se faire connaître ou vendre (réseaux sociaux, WhatsApp Business, mobile money, site internet) ?",
        options: [
          "Oui, plusieurs outils numériques sont utilisés activement",
          "Un peu, de façon occasionnelle",
          "Non, aucun outil numérique n'est utilisé",
          "Aucune information sur le sujet",
        ],
      },
      {
        id: "numerique_cybersecurite_2",
        texte:
          "L'entreprise utilise-t-elle des outils numériques pour gérer son activité (comptabilité, stocks, paiements), plutôt que uniquement du papier ?",
        options: [
          "Oui, régulièrement",
          "Partiellement, en complément du papier",
          "Non, tout est géré sur papier",
          "Aucune information sur le sujet",
        ],
      },
      {
        id: "numerique_cybersecurite_3",
        texte:
          "Les informations importantes de l'entreprise (mots de passe, données clients, documents financiers) sont-elles protégées contre la perte ou le vol ?",
        options: [
          "Oui, des précautions sont prises (sauvegardes, mots de passe protégés)",
          "Partiellement",
          "Non, aucune précaution particulière",
          "Aucune information sur le sujet",
        ],
      },
    ],
  },
  {
    rubriqueId: "risques_resilience",
    titre: "Risques et résilience",
    questions: [
      {
        id: "risques_resilience_1",
        texte:
          "L'entrepreneur a-t-il identifié les principaux risques qui pourraient menacer son activité (perte d'un client clé, hausse des prix, incendie, etc.) ?",
        options: [
          "Oui, les principaux risques sont identifiés",
          "Vaguement, sans les avoir formalisés",
          "Non, ils n'ont pas été identifiés",
          "Aucune information sur le sujet",
        ],
      },
      {
        id: "risques_resilience_2",
        texte: "Si un de ces risques se réalisait, l'entreprise a-t-elle des solutions prévues (réserve financière, autre fournisseur, etc.) ?",
        options: [
          "Oui, des solutions sont prévues",
          "Partiellement",
          "Non, rien n'est prévu",
          "Aucune information sur le sujet",
        ],
      },
      {
        id: "risques_resilience_3",
        texte:
          "L'activité de l'entreprise est-elle bien répartie entre plusieurs clients et fournisseurs plutôt que dépendante d'un seul ?",
        options: [
          "Oui, bien répartie entre plusieurs clients/fournisseurs",
          "Partiellement répartie, avec une dépendance modérée",
          "Non, fortement dépendante d'un seul client ou fournisseur",
          "Aucune information sur le sujet",
        ],
      },
    ],
  },
];

// Domaines proposés à la question finale "quels domaines nécessitent une formation ?" — reprend
// les modules GERME sauf "Entreprise et famille" (ce n'est pas un module de formation à part
// entière). Le frontend ajoute une case "Autre" en texte libre en plus de cette liste.
const DOMAINES_BESOIN_FORMATION = MODULES_GERME.filter((m) => m.id !== "entreprise_famille");

// Les deux moments proposés pour remplir une évaluation. Champ texte libre en base (pas un enum
// Prisma) pour rester simple à faire évoluer, mais le frontend ne propose que ces deux choix.
const MOMENTS_ABF = ["Avant formation", "Après formation"];

// Calcule, pour chaque rubrique, un niveau de maturité indicatif de 1 (Prioritaire) à 5
// (Structuré) à partir des réponses données, avec son libellé. Objectif : donner un repère visuel
// rapide pour comparer un "avant" et un "après", et construire la cartographie des besoins sur
// l'ensemble des rubriques (modules GERME + diagnostic d'entreprise) — ce n'est pas un barème
// officiel GERME, juste une aide de lecture.
// reponses : objet { [idQuestion]: indexOptionChoisie } (0 à 3).
const LIBELLES_NIVEAU = {
  1: "Prioritaire",
  2: "À renforcer",
  3: "À consolider",
  4: "Solide",
  5: "Structuré",
};

function calculerNiveauxAbf(reponses) {
  const niveaux = {};

  for (const rubrique of QUESTIONNAIRE_ABF) {
    const points = [];

    for (const question of rubrique.questions) {
      const indexChoisi = reponses ? reponses[question.id] : undefined;
      if (indexChoisi === 0) points.push(2);
      else if (indexChoisi === 1) points.push(1);
      else if (indexChoisi === 2) points.push(0);
      // indexChoisi === 3 ("aucune information") ou question non répondue : ignoré, pas de point.
    }

    if (points.length === 0) {
      niveaux[rubrique.rubriqueId] = { niveau: null, libelle: "Non renseigné" };
      continue;
    }

    const moyenne = points.reduce((a, b) => a + b, 0) / points.length;
    let niveau;
    if (moyenne >= 1.75) niveau = 5;
    else if (moyenne >= 1.25) niveau = 4;
    else if (moyenne >= 0.75) niveau = 3;
    else if (moyenne >= 0.25) niveau = 2;
    else niveau = 1;

    niveaux[rubrique.rubriqueId] = { niveau, libelle: LIBELLES_NIVEAU[niveau] };
  }

  return niveaux;
}

module.exports = { QUESTIONNAIRE_ABF, DOMAINES_BESOIN_FORMATION, MOMENTS_ABF, calculerNiveauxAbf };
