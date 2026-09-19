// Fiches techniques par culture, pour les participants suivis en Agriculture. Contenu rédigé par
// Claude à partir de bonnes pratiques agricoles courantes en Afrique de l'Ouest, PAS issu d'un
// document officiel : à faire relire par un agronome/technicien agricole avant diffusion large
// aux conseillers. Clés alignées sur les identifiants de FILIERES_AGRICULTURE
// (filieresParTypeSuivi.js).
const FICHES_TECHNIQUES_AGRICULTURE = {
  mais: {
    label: "Maïs",
    itineraireTechnique: [
      "Préparation du sol : labour ou billonnage 2 à 3 semaines avant le semis, sol bien ameubli.",
      "Semis : 2 à 3 grains par poquet, écartement d'environ 80 cm entre les lignes et 40 cm sur la ligne.",
      "Entretien : 2 à 3 sarclages, buttage au stade 30-40 cm, apport d'engrais azoté fractionné en deux fois (semis puis floraison).",
      "Récolte : à maturité complète, quand les épis et les grains sont bien secs et durs.",
    ],
    calendrierIndicatif:
      "Semis en début de saison des pluies (souvent mars-avril, ou août-septembre pour un second cycle selon la zone). Cycle de 90 à 120 jours selon la variété.",
    conservation:
      "Bien sécher les épis avant stockage (grains durs, humidité faible). Conserver dans un endroit sec et aéré, à l'abri de l'humidité et des rongeurs ; un traitement de stockage homologué contre les charançons peut être nécessaire.",
    pointsDeVigilance: [
      "Chute importante de rendement en cas de semis tardif ou de stress hydrique à la floraison.",
      "Surveiller la chenille légionnaire d'automne, ravageur très présent sur le maïs.",
      "Éviter le stockage en sac humide : principale cause de pertes après récolte.",
    ],
  },
  riz: {
    label: "Riz",
    itineraireTechnique: [
      "Préparation du sol : labour et planage soigné, surtout en riziculture irriguée/bas-fond.",
      "Semis : en semis direct ou par repiquage de plants de pépinière âgés de 21 à 25 jours.",
      "Entretien : désherbage précoce indispensable (le riz supporte mal la concurrence des adventices), bonne gestion de la lame d'eau si irrigué.",
      "Récolte : quand environ 80 % des grains ont pris une couleur jaune paille.",
    ],
    calendrierIndicatif:
      "Calendrier variable selon le type de riziculture (pluviale de plateau ou irriguée de bas-fond) et la variété ; cycle de 100 à 150 jours en général.",
    conservation:
      "Bien sécher avant battage et vannage. Stocker dans des sacs propres et si possible hermétiques, à l'abri de l'humidité, pour limiter les pertes et préserver la qualité du grain.",
    pointsDeVigilance: [
      "La pyriculariose (maladie fongique) peut détruire une bonne part de la récolte si non traitée à temps.",
      "Les oiseaux granivores peuvent causer des pertes importantes en fin de cycle : surveillance nécessaire.",
      "Un désherbage tardif ou insuffisant réduit fortement le rendement.",
    ],
  },
  manioc: {
    label: "Manioc",
    itineraireTechnique: [
      "Préparation du sol : buttes ou billons, sol bien drainé.",
      "Plantation : boutures saines de 20 à 25 cm avec 2 à 3 nœuds, plantées obliquement.",
      "Entretien : sarclages réguliers surtout les 3 premiers mois (le manioc supporte ensuite bien la concurrence des herbes) ; besoin limité en engrais.",
      "Récolte : possible entre 8 et 18 mois selon la variété, et peut être échelonnée dans le temps selon les besoins.",
    ],
    calendrierIndicatif:
      "Plantation en début de saison des pluies. Avantage du manioc : la récolte peut être étalée sur plusieurs mois, ce qui en fait une culture de sécurité alimentaire.",
    conservation:
      "Les racines sont très périssables après récolte (2 à 3 jours seulement) : il faut les transformer rapidement (gari, attiéké, cossettes séchées) ou ne récolter qu'au fur et à mesure des besoins.",
    pointsDeVigilance: [
      "La mosaïque du manioc (maladie virale transmise par mouche blanche) peut fortement réduire le rendement : privilégier des variétés tolérantes et des boutures saines.",
      "Éviter de garder des racines récoltées trop longtemps avant transformation ou vente.",
    ],
  },
  igname: {
    label: "Igname",
    itineraireTechnique: [
      "Préparation du sol : buttes ou billons hauts, sol meuble en profondeur.",
      "Plantation : semenceaux (fragments de tubercule) sains, non blessés.",
      "Entretien : tuteurage souvent nécessaire pour la croissance des lianes, sarclages et buttage réguliers.",
      "Récolte : généralement entre 8 et 10 mois après plantation, selon la variété.",
    ],
    calendrierIndicatif:
      "Plantation en fin de saison sèche/début de saison des pluies selon la zone et la variété ; récolte en fin de cycle, souvent en saison sèche.",
    conservation:
      "Stocker en grenier ou couloir bien ventilé (case à ignames), à l'abri du soleil direct et de l'humidité excessive. Trier régulièrement pour retirer les tubercules abîmés ou en début de pourriture, qui contaminent les autres.",
    pointsDeVigilance: [
      "La disponibilité et le coût des semenceaux sont souvent le principal facteur limitant de cette culture.",
      "Surveiller l'anthracnose foliaire et la pourriture des tubercules en stockage.",
    ],
  },
  tomate: {
    label: "Tomate",
    itineraireTechnique: [
      "Pépinière : 3 à 4 semaines avant repiquage, plants bien développés.",
      "Repiquage puis tuteurage recommandé pour limiter le contact des fruits avec le sol.",
      "Entretien : arrosage régulier, fertilisation fractionnée en plusieurs apports, taille des gourmands.",
      "Récolte : échelonnée, plusieurs passages au fur et à mesure de la maturité des fruits.",
    ],
    calendrierIndicatif:
      "Cycle d'environ 90 à 120 jours entre le semis et la première récolte, selon la variété. À éviter en pleine saison des pluies (sensibilité élevée aux maladies fongiques).",
    conservation:
      "Fruit fragile : récolter au stade tournant si le transport est long. Écouler rapidement ou transformer (concentré, purée) en cas de surplus, car la tomate se conserve mal.",
    pointsDeVigilance: [
      "Le mildiou et d'autres maladies fongiques se développent vite en saison humide : surveillance rapprochée nécessaire.",
      "La mouche blanche transmet des virus graves pour la culture.",
      "Les prix de la tomate varient beaucoup selon les périodes : bien planifier la vente.",
    ],
  },
  gombo: {
    label: "Gombo",
    itineraireTechnique: [
      "Semis direct ou pépinière courte.",
      "Entretien : sarclage, arrosage modéré (culture assez rustique).",
      "Récolte : fréquente, tous les 2 à 3 jours, car les fruits grossissent vite et deviennent fibreux s'ils restent trop longtemps sur le plant.",
    ],
    calendrierIndicatif:
      "Culture rustique qui tolère bien la chaleur. Première récolte possible dès 45 à 60 jours après semis, puis étalée sur plusieurs semaines.",
    conservation:
      "Très périssable une fois récolté (devient fibreux et invendable en 1 à 2 jours) : vendre ou transformer rapidement ; le séchage permet une conservation longue durée.",
    pointsDeVigilance: [
      "Une récolte régulière et fréquente est indispensable : des fruits trop mûrs ne sont plus vendables.",
      "Surveiller les pucerons et jassides, fréquents sur cette culture.",
    ],
  },
  aubergine: {
    label: "Aubergine",
    itineraireTechnique: [
      "Pépinière puis repiquage ; tuteurage utile pour les variétés hautes.",
      "Entretien : arrosage régulier, fertilisation fractionnée.",
      "Récolte : échelonnée, souvent sur plusieurs mois une fois la production lancée.",
    ],
    calendrierIndicatif:
      "Environ 70 à 90 jours entre le semis et la première récolte, puis production étalée sur une longue période.",
    conservation:
      "Un peu plus résistante que la tomate ou le gombo, mais reste périssable : stocker au frais et à l'ombre, vente rapide recommandée pour garder une bonne qualité.",
    pointsDeVigilance: [
      "Les doryphores et autres coléoptères défoliateurs peuvent endommager fortement le feuillage.",
      "Le flétrissement bactérien du sol peut s'installer si la même parcelle est utilisée trop longtemps : alterner avec d'autres cultures.",
    ],
  },
};

module.exports = { FICHES_TECHNIQUES_AGRICULTURE };
