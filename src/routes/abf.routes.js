const express = require("express");
const { authenticate } = require("../middlewares/auth.middleware");
const { MOMENTS_ABF, obtenirQuestionnaireAbf } = require("../lib/abfParTypeSuivi");
const { FILIERES_AGRICULTURE, FILIERES_ELEVAGE } = require("../lib/filieresParTypeSuivi");

const router = express.Router();
router.use(authenticate);

// Envoie au frontend la structure complète du questionnaire ABF à utiliser, pour qu'il n'ait
// jamais à la dupliquer (même principe que GET /formations/modules). Le type de suivi
// ("Generique" par défaut, ou "Agriculture"/"Elevage") détermine quel questionnaire est renvoyé.
router.get("/structure", (req, res) => {
  const { questionnaire, domainesBesoinFormation } = obtenirQuestionnaireAbf(req.query.typeSuivi);
  res.json({
    rubriques: questionnaire,
    domainesBesoinFormation,
    moments: MOMENTS_ABF,
  });
});

// Liste des filières disponibles pour le type de suivi demandé (utilisée par le formulaire de
// création/modification d'un participant Agriculture ou Élevage).
router.get("/filieres", (req, res) => {
  if (req.query.typeSuivi === "Agriculture") {
    return res.json(FILIERES_AGRICULTURE);
  }
  if (req.query.typeSuivi === "Elevage") {
    return res.json(FILIERES_ELEVAGE);
  }
  res.json([]);
});

module.exports = router;
