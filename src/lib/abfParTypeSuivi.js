// Point d'entree unique pour choisir le bon questionnaire ABF (et la bonne liste de domaines de
// formation associee) selon le type de suivi d'un participant. Utilise partout ou le
// questionnaire generique etait auparavant code en dur (participants.routes.js, abf.routes.js),
// pour que les evaluations ABF des participants Agriculture/Elevage utilisent leurs propres
// rubriques au lieu de celles du questionnaire generique.
const { QUESTIONNAIRE_ABF, DOMAINES_BESOIN_FORMATION, MOMENTS_ABF } = require("./questionnaireAbf");
const { QUESTIONNAIRE_ABF_AGRICULTURE, DOMAINES_BESOIN_FORMATION_AGRICULTURE } = require("./questionnaireAbfAgriculture");
const { QUESTIONNAIRE_ABF_ELEVAGE, DOMAINES_BESOIN_FORMATION_ELEVAGE } = require("./questionnaireAbfElevage");

const TYPES_SUIVI_VALIDES = ["Generique", "Agriculture", "Elevage"];

function obtenirQuestionnaireAbf(typeSuivi) {
  if (typeSuivi === "Agriculture") {
    return { questionnaire: QUESTIONNAIRE_ABF_AGRICULTURE, domainesBesoinFormation: DOMAINES_BESOIN_FORMATION_AGRICULTURE };
  }
  if (typeSuivi === "Elevage") {
    return { questionnaire: QUESTIONNAIRE_ABF_ELEVAGE, domainesBesoinFormation: DOMAINES_BESOIN_FORMATION_ELEVAGE };
  }
  return { questionnaire: QUESTIONNAIRE_ABF, domainesBesoinFormation: DOMAINES_BESOIN_FORMATION };
}

module.exports = { TYPES_SUIVI_VALIDES, MOMENTS_ABF, obtenirQuestionnaireAbf };
