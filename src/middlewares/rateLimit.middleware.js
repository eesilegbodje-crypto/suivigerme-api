const rateLimit = require("express-rate-limit");

// Securite : limite les tentatives de connexion par adresse IP, pour empecher un robot d'essayer
// plein de mots de passe en rafale (meme principe que sur CollectivIA). Une vraie personne qui se
// trompe une ou deux fois n'est jamais bloquee.
const limiteurConnexion = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Trop de tentatives de connexion depuis cette adresse. Merci de reessayer dans quelques minutes." },
});

module.exports = { limiteurConnexion };
