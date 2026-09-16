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
];

// Domaines proposés à la question finale "quels domaines nécessitent une formation ?" — reprend
// les modules GERME sauf "Entreprise et famille" (ce n'est pas un module de formation à part
// entière). Le frontend ajoute une case "Autre" en texte libre en plus de cette liste.
const DOMAINES_BESOIN_FORMATION = MODULES_GERME.filter((m) => m.id !== "entreprise_famille");

// Les deux moments proposés pour remplir une évaluation. Champ texte libre en base (pas un enum
// Prisma) pour rester simple à faire évoluer, mais le frontend ne propose que ces deux choix.
const MOMENTS_ABF = ["Avant formation", "Après formation"];

// Calcule, pour chaque rubrique, un niveau indicatif (Bon / Moyen / Faible / Non renseigné) à
// partir des réponses données. Objectif : donner un repère visuel rapide pour comparer un "avant"
// et un "après" — ce n'est pas un barème officiel GERME, juste une aide de lecture.
// reponses : objet { [idQuestion]: indexOptionChoisie } (0 à 3).
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
      niveaux[rubrique.rubriqueId] = "Non renseigné";
      continue;
    }

    const moyenne = points.reduce((a, b) => a + b, 0) / points.length;
    if (moyenne >= 1.5) niveaux[rubrique.rubriqueId] = "Bon";
    else if (moyenne >= 0.75) niveaux[rubrique.rubriqueId] = "Moyen";
    else niveaux[rubrique.rubriqueId] = "Faible";
  }

  return niveaux;
}

module.exports = { QUESTIONNAIRE_ABF, DOMAINES_BESOIN_FORMATION, MOMENTS_ABF, calculerNiveauxAbf };
