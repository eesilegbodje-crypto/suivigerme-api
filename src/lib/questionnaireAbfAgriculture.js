// Questionnaire ABF (Analyse des Besoins en Formation) specifique aux participants suivis en
// Agriculture (typeSuivi = "Agriculture"), couvrant cultures vivrieres et maraicheres. Meme
// principe et meme format que le questionnaire generique (questionnaireAbf.js) : 3 questions par
// rubrique, 4 options toujours dans le meme ordre (bonne pratique / partielle / absente / aucune
// information), pour permettre le meme calcul de niveau (calculerNiveauxAbf).
//
// Contenu redige par Claude a partir de bonnes pratiques agricoles courantes, PAS issu d'un
// document officiel (contrairement au questionnaire generique d'origine) : a faire relire par un
// agronome ou un technicien agricole avant diffusion large aux conseillers.
//
// IMPORTANT : ne jamais changer un "id" de rubrique ou de question une fois des evaluations
// enregistrees en base.
const { MODULES_GERME } = require("./modulesGerme");

const QUESTIONNAIRE_ABF_AGRICULTURE = [
  {
    rubriqueId: "choix_semences_sol",
    titre: "Choix des semences/plants et préparation du sol",
    questions: [
      {
        id: "choix_semences_sol_1",
        texte: "Utilisez-vous des semences ou plants certifiés/de qualité reconnue pour vos cultures ?",
        options: [
          "Oui, systématiquement",
          "Parfois, selon la disponibilité",
          "Non, je réutilise mes propres semences sans sélection",
          "Aucune information sur le sujet",
        ],
      },
      {
        id: "choix_semences_sol_2",
        texte: "Le sol est-il préparé (labour, sarclage, nettoyage) avant chaque semis ou plantation ?",
        options: [
          "Oui, systématiquement et à temps",
          "Parfois, de façon incomplète",
          "Non, rarement ou jamais",
          "Aucune information sur le sujet",
        ],
      },
      {
        id: "choix_semences_sol_3",
        texte: "Connaissez-vous et respectez-vous les densités de semis recommandées pour vos cultures ?",
        options: [
          "Oui, je les respecte",
          "Je les connais mais je ne les respecte pas toujours",
          "Non, je sème au jugé",
          "Aucune information sur le sujet",
        ],
      },
    ],
  },
  {
    rubriqueId: "itineraire_technique",
    titre: "Itinéraire technique et calendrier cultural",
    questions: [
      {
        id: "itineraire_technique_1",
        texte: "Suivez-vous un calendrier cultural (dates de semis, d'entretien, de récolte) adapté à votre zone ?",
        options: [
          "Oui, je le suis rigoureusement",
          "Je le connais mais je m'en écarte souvent",
          "Non, je cultive sans calendrier précis",
          "Aucune information sur le sujet",
        ],
      },
      {
        id: "itineraire_technique_2",
        texte:
          "Les opérations d'entretien (sarclage, buttage, tuteurage...) sont-elles réalisées aux bons stades de la culture ?",
        options: [
          "Oui, toujours au bon moment",
          "Parfois, avec du retard",
          "Non, rarement fait",
          "Aucune information sur le sujet",
        ],
      },
      {
        id: "itineraire_technique_3",
        texte: "Adaptez-vous vos pratiques culturales selon chaque culture menée (vivrière ou maraîchère) ?",
        options: [
          "Oui, je connais et j'applique les pratiques propres à chaque culture",
          "Partiellement, je fais un peu de la même façon pour toutes mes cultures",
          "Non, je n'ai pas de pratique différenciée",
          "Aucune information sur le sujet",
        ],
      },
    ],
  },
  {
    rubriqueId: "gestion_eau_irrigation",
    titre: "Gestion de l'eau et irrigation",
    questions: [
      {
        id: "gestion_eau_irrigation_1",
        texte: "Disposez-vous d'un moyen d'irrigation ou d'un accès à l'eau suffisant pendant les périodes sèches ?",
        options: [
          "Oui, un système fiable toute l'année",
          "Un accès partiel ou irrégulier",
          "Non, je dépends uniquement de la pluie",
          "Aucune information sur le sujet",
        ],
      },
      {
        id: "gestion_eau_irrigation_2",
        texte: "Maîtrisez-vous les quantités et la fréquence d'arrosage adaptées à vos cultures ?",
        options: [
          "Oui, j'arrose selon les besoins réels de la culture",
          "J'arrose de façon approximative",
          "Non, je n'ai pas de repère précis",
          "Aucune information sur le sujet",
        ],
      },
      {
        id: "gestion_eau_irrigation_3",
        texte: "Prenez-vous des mesures pour limiter le gaspillage d'eau ou l'érosion (paillage, billons, drainage) ?",
        options: [
          "Oui, plusieurs mesures appliquées",
          "Quelques mesures ponctuelles",
          "Non, aucune mesure particulière",
          "Aucune information sur le sujet",
        ],
      },
    ],
  },
  {
    rubriqueId: "fertilisation_sols",
    titre: "Fertilisation et santé des sols",
    questions: [
      {
        id: "fertilisation_sols_1",
        texte: "Apportez-vous une fertilisation (engrais organique ou minéral) adaptée à vos cultures ?",
        options: [
          "Oui, selon les besoins identifiés",
          "De façon irrégulière ou approximative",
          "Non, aucune fertilisation",
          "Aucune information sur le sujet",
        ],
      },
      {
        id: "fertilisation_sols_2",
        texte:
          "Pratiquez-vous des techniques de préservation de la fertilité du sol (rotation, jachère, compost, association de cultures) ?",
        options: ["Oui, régulièrement", "Occasionnellement", "Non, jamais", "Aucune information sur le sujet"],
      },
      {
        id: "fertilisation_sols_3",
        texte: "Connaissez-vous l'état de fertilité de vos parcelles (analyse de sol, observation des signes de carence) ?",
        options: [
          "Oui, je surveille régulièrement l'état de mes sols",
          "J'ai une idée approximative",
          "Non, je n'ai aucune information sur mes sols",
          "Aucune information sur le sujet",
        ],
      },
    ],
  },
  {
    rubriqueId: "protection_phytosanitaire",
    titre: "Protection phytosanitaire",
    questions: [
      {
        id: "protection_phytosanitaire_1",
        texte: "Surveillez-vous régulièrement vos cultures pour détecter tôt les ravageurs et maladies ?",
        options: [
          "Oui, une surveillance régulière",
          "De temps en temps seulement",
          "Non, je ne surveille pas mes cultures",
          "Aucune information sur le sujet",
        ],
      },
      {
        id: "protection_phytosanitaire_2",
        texte:
          "Lorsqu'un traitement est nécessaire, respectez-vous les doses et délais recommandés (y compris avant récolte) ?",
        options: [
          "Oui, toujours",
          "Parfois, de façon approximative",
          "Non, je ne respecte pas de consignes précises",
          "Aucune information sur le sujet",
        ],
      },
      {
        id: "protection_phytosanitaire_3",
        texte:
          "Utilisez-vous des méthodes de protection alternatives ou préventives (rotation, variétés résistantes, lutte biologique) en plus ou à la place des produits chimiques ?",
        options: ["Oui, régulièrement", "Rarement", "Non, jamais", "Aucune information sur le sujet"],
      },
    ],
  },
  {
    rubriqueId: "recolte_post_recolte",
    titre: "Récolte, séchage et stockage",
    questions: [
      {
        id: "recolte_post_recolte_1",
        texte: "Récoltez-vous vos produits au bon stade de maturité ?",
        options: [
          "Oui, systématiquement",
          "Parfois trop tôt ou trop tard",
          "Non, sans repère précis",
          "Aucune information sur le sujet",
        ],
      },
      {
        id: "recolte_post_recolte_2",
        texte: "Disposez-vous d'un moyen de séchage ou de conservation adapté pour limiter les pertes après récolte ?",
        options: [
          "Oui, un moyen adapté et suffisant",
          "Un moyen limité ou insuffisant",
          "Non, aucun moyen particulier",
          "Aucune information sur le sujet",
        ],
      },
      {
        id: "recolte_post_recolte_3",
        texte: "Vos pertes post-récolte (pourriture, insectes, moisissures) sont-elles limitées ?",
        options: [
          "Oui, les pertes sont faibles",
          "Des pertes modérées et régulières",
          "Non, des pertes importantes chaque saison",
          "Aucune information sur le sujet",
        ],
      },
    ],
  },
  {
    rubriqueId: "main_oeuvre_agricole",
    titre: "Organisation de la main d'œuvre agricole",
    questions: [
      {
        id: "main_oeuvre_agricole_1",
        texte: "Planifiez-vous à l'avance les besoins en main d'œuvre pour chaque étape de la culture ?",
        options: [
          "Oui, systématiquement",
          "Parfois, dans l'urgence",
          "Non, je m'organise au jour le jour",
          "Aucune information sur le sujet",
        ],
      },
      {
        id: "main_oeuvre_agricole_2",
        texte:
          "La main d'œuvre (familiale ou salariée) est-elle rémunérée ou valorisée de façon équitable et régulière ?",
        options: [
          "Oui, de manière équitable et régulière",
          "Partiellement ou irrégulièrement",
          "Non, pas de rémunération formalisée",
          "Aucune information sur le sujet",
        ],
      },
      {
        id: "main_oeuvre_agricole_3",
        texte: "Les tâches sont-elles réparties clairement entre les personnes qui travaillent sur l'exploitation ?",
        options: [
          "Oui, une répartition claire",
          "Une répartition approximative",
          "Non, pas de répartition définie",
          "Aucune information sur le sujet",
        ],
      },
    ],
  },
  {
    rubriqueId: "commercialisation_agricole",
    titre: "Commercialisation des produits agricoles",
    questions: [
      {
        id: "commercialisation_agricole_1",
        texte: "Connaissez-vous plusieurs débouchés (marchés, acheteurs, coopératives) pour écouler votre production ?",
        options: [
          "Oui, plusieurs débouchés identifiés",
          "Un seul débouché habituel",
          "Non, je vends au premier acheteur venu",
          "Aucune information sur le sujet",
        ],
      },
      {
        id: "commercialisation_agricole_2",
        texte: "Négociez-vous le prix de vente de vos produits en connaissant les prix du marché ?",
        options: [
          "Oui, je me renseigne avant de négocier",
          "Je négocie sans vraiment connaître les prix",
          "Non, j'accepte le prix proposé",
          "Aucune information sur le sujet",
        ],
      },
      {
        id: "commercialisation_agricole_3",
        texte:
          "Transformez-vous ou valorisez-vous une partie de votre production pour augmenter sa valeur (transformation, conditionnement) ?",
        options: ["Oui, régulièrement", "Occasionnellement", "Non, je vends toujours en brut", "Aucune information sur le sujet"],
      },
    ],
  },
  {
    rubriqueId: "gestion_financiere_agricole",
    titre: "Gestion financière de l'exploitation",
    questions: [
      {
        id: "gestion_financiere_agricole_1",
        texte: "Tenez-vous un registre des dépenses et des recettes de votre exploitation ?",
        options: [
          "Oui, systématiquement",
          "De façon partielle ou irrégulière",
          "Non, je ne tiens aucun registre",
          "Aucune information sur le sujet",
        ],
      },
      {
        id: "gestion_financiere_agricole_2",
        texte: "Connaissez-vous le coût réel de production d'une campagne (semences, intrants, main d'œuvre...) ?",
        options: [
          "Oui, je le calcule chaque saison",
          "J'en ai une estimation approximative",
          "Non, je ne le calcule pas",
          "Aucune information sur le sujet",
        ],
      },
      {
        id: "gestion_financiere_agricole_3",
        texte:
          "Mettez-vous de côté une partie des revenus pour préparer la prochaine campagne (semences, intrants, réparations) ?",
        options: [
          "Oui, systématiquement",
          "Parfois, selon les revenus disponibles",
          "Non, jamais",
          "Aucune information sur le sujet",
        ],
      },
    ],
  },
  {
    rubriqueId: "gestion_risques_climatiques",
    titre: "Gestion des risques climatiques et diversification",
    questions: [
      {
        id: "gestion_risques_climatiques_1",
        texte: "Adaptez-vous vos pratiques face aux aléas climatiques (sécheresse, pluies irrégulières) ?",
        options: [
          "Oui, j'ajuste mes pratiques chaque année",
          "Parfois, quand la situation est grave",
          "Non, je cultive toujours de la même façon",
          "Aucune information sur le sujet",
        ],
      },
      {
        id: "gestion_risques_climatiques_2",
        texte: "Cultivez-vous plusieurs types de cultures pour répartir les risques (diversification) ?",
        options: [
          "Oui, plusieurs cultures différentes",
          "Une culture principale et une secondaire",
          "Non, une seule culture",
          "Aucune information sur le sujet",
        ],
      },
      {
        id: "gestion_risques_climatiques_3",
        texte: "Avez-vous une solution de secours en cas de mauvaise récolte (épargne, assurance, activité complémentaire) ?",
        options: [
          "Oui, au moins une solution de secours",
          "Une solution limitée ou incertaine",
          "Non, aucune solution de secours",
          "Aucune information sur le sujet",
        ],
      },
    ],
  },
  {
    rubriqueId: "financement_agricole",
    titre: "Accès aux intrants et au financement agricole",
    questions: [
      {
        id: "financement_agricole_1",
        texte: "Arrivez-vous à vous procurer à temps les intrants nécessaires (semences, engrais, produits phytosanitaires) ?",
        options: [
          "Oui, sans difficulté majeure",
          "Avec des difficultés ou des retards fréquents",
          "Non, je manque souvent d'intrants essentiels",
          "Aucune information sur le sujet",
        ],
      },
      {
        id: "financement_agricole_2",
        texte:
          "Avez-vous accès à une source de financement (crédit agricole, tontine, coopérative, microfinance) pour investir dans votre exploitation ?",
        options: [
          "Oui, un accès régulier à au moins une source",
          "Un accès occasionnel ou limité",
          "Non, aucun accès au financement",
          "Aucune information sur le sujet",
        ],
      },
      {
        id: "financement_agricole_3",
        texte:
          "Connaissez-vous les conditions (taux, garanties, délais) des offres de financement agricole disponibles dans votre zone ?",
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
    rubriqueId: "acces_foncier",
    titre: "Accès au foncier",
    questions: [
      {
        id: "acces_foncier_1",
        texte:
          "Le terrain que vous exploitez a-t-il un statut clair et sécurisé (titre, contrat écrit, accord familial formalisé) ?",
        options: [
          "Oui, un statut clair et sécurisé",
          "Un accord existe mais non formalisé par écrit",
          "Non, la situation est incertaine ou source de litige",
          "Aucune information sur le sujet",
        ],
      },
      {
        id: "acces_foncier_2",
        texte: "La superficie dont vous disposez est-elle suffisante pour développer votre activité comme vous le souhaitez ?",
        options: [
          "Oui, largement suffisante",
          "Juste suffisante, sans marge d'extension",
          "Non, insuffisante",
          "Aucune information sur le sujet",
        ],
      },
      {
        id: "acces_foncier_3",
        texte: "En cas de besoin, pourriez-vous accéder à une parcelle supplémentaire (achat, location, prêt) ?",
        options: [
          "Oui, une possibilité identifiée",
          "Une possibilité incertaine",
          "Non, aucune possibilité identifiée",
          "Aucune information sur le sujet",
        ],
      },
    ],
  },
];

// Modules de formation a proposer suite au diagnostic (voir DOMAINES_BESOIN_FORMATION dans
// questionnaireAbf.js pour le meme principe cote generique).
const IDS_DOMAINES_AGRICULTURE = [
  "itineraire_technique",
  "gestion_eau_irrigation",
  "fertilisation_sols",
  "protection_phytosanitaire",
  "recolte_post_recolte",
  "commercialisation_agricole",
  "financement_agricole",
  "vie_associative_rurale",
];
const DOMAINES_BESOIN_FORMATION_AGRICULTURE = MODULES_GERME.filter((m) => IDS_DOMAINES_AGRICULTURE.includes(m.id));

module.exports = { QUESTIONNAIRE_ABF_AGRICULTURE, DOMAINES_BESOIN_FORMATION_AGRICULTURE };
