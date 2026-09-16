const express = require("express");
const { authenticate } = require("../middlewares/auth.middleware");
const { QUESTIONNAIRE_ABF, DOMAINES_BESOIN_FORMATION, MOMENTS_ABF } = require("../lib/questionnaireAbf");

const router = express.Router();
router.use(authenticate);

// Envoie au frontend la structure complète du questionnaire ABF, pour qu'il n'ait jamais à la
// dupliquer (même principe que GET /formations/modules).
router.get("/structure", (req, res) => {
  res.json({
    rubriques: QUESTIONNAIRE_ABF,
    domainesBesoinFormation: DOMAINES_BESOIN_FORMATION,
    moments: MOMENTS_ABF,
  });
});

module.exports = router;
