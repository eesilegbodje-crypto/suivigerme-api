// Module Sécurité : réservé au coordonnateur (l'équivalent de l'administrateur dans SuiviPME,
// seul rôle qui gère déjà les comptes). Regroupe le journal des événements de sécurité
// (connexions, actions sensibles sur les comptes) et un état des lieux en lecture seule des
// protections déjà en place — rien à activer/configurer ici, juste à consulter.
const express = require("express");
const prisma = require("../lib/prisma");
const { authenticate, authorize } = require("../middlewares/auth.middleware");
const { LIBELLES_EVENEMENT } = require("../lib/journalSecurite");

const router = express.Router();

router.use(authenticate, authorize("coordonnateur"));

// Journal des événements de sécurité, du plus récent au plus ancien. Filtrable par type et par
// recherche libre sur l'email/nom concerné ; limité à 200 lignes (l'appli reste de taille
// modeste, pas besoin d'une pagination plus poussée pour l'instant).
router.get("/journal", async (req, res) => {
  try {
    const { type, recherche } = req.query;
    const ou = {};
    if (type) {
      ou.type = type;
    }
    if (recherche) {
      ou.OR = [
        { emailConcerne: { contains: recherche, mode: "insensitive" } },
        { nomConcerne: { contains: recherche, mode: "insensitive" } },
      ];
    }

    const evenements = await prisma.journalSecurite.findMany({
      where: ou,
      orderBy: { dateEvenement: "desc" },
      take: 200,
    });

    res.json(evenements.map((e) => ({ ...e, libelle: LIBELLES_EVENEMENT[e.type] || e.type })));
  } catch (erreur) {
    console.error(erreur);
    res.status(500).json({ error: "Erreur serveur." });
  }
});

// État des lieux de la sécurité actuelle : uniquement des informations déjà en vigueur dans le
// code (aucune valeur secrète, comme une clé ou un mot de passe, n'est jamais renvoyée ici).
router.get("/etat-des-lieux", async (req, res) => {
  try {
    const depuis24h = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [totalComptes, comptesSuspendus, changementsEnAttente, connexionsEchoueesRecentes] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { suspendu: true } }),
      prisma.user.count({ where: { doitChangerMotDePasse: true } }),
      prisma.journalSecurite.count({
        where: { type: "connexion_echouee", dateEvenement: { gte: depuis24h } },
      }),
    ]);

    res.json({
      comptes: {
        total: totalComptes,
        suspendus: comptesSuspendus,
        changementMotDePasseEnAttente: changementsEnAttente,
      },
      connexionsEchoueesDernieres24h: connexionsEchoueesRecentes,
      politiqueMotDePasse: {
        longueurMinimale: 8,
        exigences: "Au moins une lettre et un chiffre",
      },
      protectionForceBrute: {
        tentativesMaximum: 20,
        fenetreMinutes: 15,
        porteeParAdresseIp: true,
      },
      session: {
        typeJeton: "JWT",
        dureeValidite: "7 jours",
        verificationSuspensionEnContinu: true,
      },
    });
  } catch (erreur) {
    console.error(erreur);
    res.status(500).json({ error: "Erreur serveur." });
  }
});

module.exports = router;
