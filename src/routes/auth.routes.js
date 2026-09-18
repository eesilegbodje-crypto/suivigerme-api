const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../lib/prisma");
const validerMotDePasse = require("../lib/passwordPolicy");
const { authenticate, authorize } = require("../middlewares/auth.middleware");
const { limiteurConnexion } = require("../middlewares/rateLimit.middleware");
const { TYPES_EVENEMENT, enregistrerEvenementSecurite } = require("../lib/journalSecurite");

const router = express.Router();

// Connexion : vérifie l'email + mot de passe, renvoie un token de session (JWT).
router.post("/login", limiteurConnexion, async (req, res) => {
  try {
    const { email, motDePasse } = req.body;
    if (!email || !motDePasse) {
      return res.status(400).json({ error: "Email et mot de passe requis." });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      await enregistrerEvenementSecurite({
        type: TYPES_EVENEMENT.CONNEXION_ECHOUEE,
        emailConcerne: email,
        details: "Email inconnu",
      });
      return res.status(401).json({ error: "Email ou mot de passe incorrect." });
    }

    const motDePasseValide = await bcrypt.compare(motDePasse, user.motDePasse);
    if (!motDePasseValide) {
      await enregistrerEvenementSecurite({
        type: TYPES_EVENEMENT.CONNEXION_ECHOUEE,
        emailConcerne: user.email,
        nomConcerne: user.nom,
        details: "Mot de passe incorrect",
      });
      return res.status(401).json({ error: "Email ou mot de passe incorrect." });
    }

    if (user.suspendu) {
      await enregistrerEvenementSecurite({
        type: TYPES_EVENEMENT.CONNEXION_ECHOUEE,
        emailConcerne: user.email,
        nomConcerne: user.nom,
        details: "Compte suspendu",
      });
      return res.status(403).json({ error: "Ce compte a été suspendu. Contactez votre coordonnateur." });
    }

    const token = jwt.sign(
      { userId: user.id, nom: user.nom, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    await enregistrerEvenementSecurite({
      type: TYPES_EVENEMENT.CONNEXION_REUSSIE,
      emailConcerne: user.email,
      nomConcerne: user.nom,
    });

    res.json({
      token,
      user: {
        id: user.id,
        nom: user.nom,
        email: user.email,
        role: user.role,
        doitChangerMotDePasse: user.doitChangerMotDePasse,
      },
    });
  } catch (erreur) {
    console.error(erreur);
    res.status(500).json({ error: "Erreur serveur." });
  }
});

// Crée un nouveau compte (conseiller) — réservé au coordonnateur, une fois connecté.
router.post("/utilisateurs", authenticate, authorize("coordonnateur"), async (req, res) => {
  try {
    const { nom, email, motDePasse, role } = req.body;
    if (!nom || !email || !motDePasse) {
      return res.status(400).json({ error: "Nom, email et mot de passe sont obligatoires." });
    }
    const erreurPolitique = validerMotDePasse(motDePasse);
    if (erreurPolitique) {
      return res.status(400).json({ error: erreurPolitique });
    }
    const existant = await prisma.user.findUnique({ where: { email } });
    if (existant) {
      return res.status(409).json({ error: "Cet email est déjà utilisé." });
    }

    const motDePasseChiffre = await bcrypt.hash(motDePasse, 10);
    const user = await prisma.user.create({
      data: {
        nom,
        email,
        motDePasse: motDePasseChiffre,
        role: role === "coordonnateur" ? "coordonnateur" : "conseiller",
        doitChangerMotDePasse: true,
      },
    });

    await enregistrerEvenementSecurite({
      type: TYPES_EVENEMENT.COMPTE_CREE,
      emailConcerne: user.email,
      nomConcerne: user.nom,
      acteurNom: req.user.nom,
    });

    res.status(201).json({ id: user.id, nom: user.nom, email: user.email, role: user.role });
  } catch (erreur) {
    console.error(erreur);
    res.status(500).json({ error: "Erreur serveur." });
  }
});

// Liste des comptes existants — réservé au coordonnateur.
router.get("/utilisateurs", authenticate, authorize("coordonnateur"), async (req, res) => {
  try {
    const utilisateurs = await prisma.user.findMany({
      select: { id: true, nom: true, email: true, role: true, creeLe: true, suspendu: true },
      orderBy: { creeLe: "asc" },
    });
    res.json(utilisateurs);
  } catch (erreur) {
    console.error(erreur);
    res.status(500).json({ error: "Erreur serveur." });
  }
});

// Changement de mot de passe par la personne connectee elle-meme. Exige de connaitre le mot de
// passe actuel (empeche quelqu'un qui aurait vole une session deja ouverte de prendre
// definitivement le controle du compte). Sert aussi bien a un changement volontaire qu'a
// satisfaire l'obligation de changement imposee a la premiere connexion d'un compte cree par le
// coordonnateur, ou apres une reinitialisation pour mot de passe oublie.
router.patch("/changer-mot-de-passe", authenticate, async (req, res) => {
  try {
    const { motDePasseActuel, nouveauMotDePasse } = req.body;
    if (!motDePasseActuel || !nouveauMotDePasse) {
      return res.status(400).json({ error: "Le mot de passe actuel et le nouveau mot de passe sont obligatoires." });
    }

    const utilisateur = await prisma.user.findUnique({ where: { id: req.user.userId } });
    if (!utilisateur) {
      return res.status(404).json({ error: "Utilisateur introuvable." });
    }

    const motDePasseValide = await bcrypt.compare(motDePasseActuel, utilisateur.motDePasse);
    if (!motDePasseValide) {
      return res.status(401).json({ error: "Le mot de passe actuel est incorrect." });
    }

    const erreurPolitique = validerMotDePasse(nouveauMotDePasse);
    if (erreurPolitique) {
      return res.status(400).json({ error: erreurPolitique });
    }

    const etaitObligatoire = utilisateur.doitChangerMotDePasse;
    const nouveauMotDePasseChiffre = await bcrypt.hash(nouveauMotDePasse, 10);
    await prisma.user.update({
      where: { id: utilisateur.id },
      data: { motDePasse: nouveauMotDePasseChiffre, doitChangerMotDePasse: false },
    });

    await enregistrerEvenementSecurite({
      type: TYPES_EVENEMENT.MOT_DE_PASSE_CHANGE,
      emailConcerne: utilisateur.email,
      nomConcerne: utilisateur.nom,
      details: etaitObligatoire
        ? "Changement obligatoire (première connexion ou après réinitialisation)"
        : "Changement volontaire",
    });

    res.json({ message: "Mot de passe mis a jour." });
  } catch (erreur) {
    console.error(erreur);
    res.status(500).json({ error: "Erreur serveur." });
  }
});

// Reinitialise le mot de passe d'un compte (cas d'un mot de passe oublie) — reserve au
// coordonnateur. Ne touche a AUCUNE autre donnee du compte (ses PME/formations restent intactes).
// Le nouveau mot de passe est choisi par le coordonnateur lui-meme (comme a la creation du
// compte) et doit etre transmis a la main a la personne concernee ; elle devra le changer des sa
// prochaine connexion.
router.patch("/utilisateurs/:id/reinitialiser-mot-de-passe", authenticate, authorize("coordonnateur"), async (req, res) => {
  try {
    const { nouveauMotDePasse } = req.body;
    if (!nouveauMotDePasse) {
      return res.status(400).json({ error: "Le nouveau mot de passe est obligatoire." });
    }
    const erreurPolitique = validerMotDePasse(nouveauMotDePasse);
    if (erreurPolitique) {
      return res.status(400).json({ error: erreurPolitique });
    }

    const cible = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!cible) {
      return res.status(404).json({ error: "Compte introuvable." });
    }

    const motDePasseChiffre = await bcrypt.hash(nouveauMotDePasse, 10);
    await prisma.user.update({
      where: { id: cible.id },
      data: { motDePasse: motDePasseChiffre, doitChangerMotDePasse: true },
    });

    await enregistrerEvenementSecurite({
      type: TYPES_EVENEMENT.MOT_DE_PASSE_REINITIALISE,
      emailConcerne: cible.email,
      nomConcerne: cible.nom,
      acteurNom: req.user.nom,
    });

    res.json({ message: "Mot de passe reinitialise." });
  } catch (erreur) {
    console.error(erreur);
    res.status(500).json({ error: "Erreur serveur." });
  }
});

// Supprime definitivement un compte — reserve au coordonnateur. Bloque la suppression si le
// compte a deja enregistre au moins une PME ou une formation (pour ne jamais perdre de donnees
// par erreur) : il faut d'abord transferer/vider ses donnees, ou simplement le laisser inactif.
// Un coordonnateur ne peut pas se supprimer lui-meme (eviterait de se retrouver bloque dehors).
// Suspend un compte — reserve au coordonnateur. La personne ne peut plus se connecter, et si
// elle avait deja une session ouverte, elle est coupee des sa prochaine action (verifie par le
// middleware authenticate). Ses donnees ne sont jamais touchees. Un coordonnateur ne peut pas se
// suspendre lui-meme (eviterait de se retrouver bloque dehors).
router.patch("/utilisateurs/:id/suspendre", authenticate, authorize("coordonnateur"), async (req, res) => {
  try {
    if (req.params.id === req.user.userId) {
      return res.status(400).json({ error: "Vous ne pouvez pas suspendre votre propre compte." });
    }

    const cible = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!cible) {
      return res.status(404).json({ error: "Compte introuvable." });
    }

    await prisma.user.update({ where: { id: cible.id }, data: { suspendu: true } });

    await enregistrerEvenementSecurite({
      type: TYPES_EVENEMENT.COMPTE_SUSPENDU,
      emailConcerne: cible.email,
      nomConcerne: cible.nom,
      acteurNom: req.user.nom,
    });

    res.json({ message: "Compte suspendu." });
  } catch (erreur) {
    console.error(erreur);
    res.status(500).json({ error: "Erreur serveur." });
  }
});

// Reactive un compte precedemment suspendu — reserve au coordonnateur.
router.patch("/utilisateurs/:id/reactiver", authenticate, authorize("coordonnateur"), async (req, res) => {
  try {
    const cible = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!cible) {
      return res.status(404).json({ error: "Compte introuvable." });
    }

    await prisma.user.update({ where: { id: cible.id }, data: { suspendu: false } });

    await enregistrerEvenementSecurite({
      type: TYPES_EVENEMENT.COMPTE_REACTIVE,
      emailConcerne: cible.email,
      nomConcerne: cible.nom,
      acteurNom: req.user.nom,
    });

    res.json({ message: "Compte reactive." });
  } catch (erreur) {
    console.error(erreur);
    res.status(500).json({ error: "Erreur serveur." });
  }
});

router.delete("/utilisateurs/:id", authenticate, authorize("coordonnateur"), async (req, res) => {
  try {
    if (req.params.id === req.user.userId) {
      return res.status(400).json({ error: "Vous ne pouvez pas supprimer votre propre compte." });
    }

    const cible = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!cible) {
      return res.status(404).json({ error: "Compte introuvable." });
    }

    const [nombreParticipants, nombreFormations] = await Promise.all([
      prisma.participant.count({ where: { creeParId: cible.id } }),
      prisma.formation.count({ where: { creeParId: cible.id } }),
    ]);

    if (nombreParticipants > 0 || nombreFormations > 0) {
      return res.status(400).json({
        error:
          `Impossible de supprimer ce compte : il a deja enregistre ${nombreParticipants} PME et ` +
          `${nombreFormations} formation(s). Ses donnees doivent d'abord etre reprises par un autre ` +
          `compte, ou conservees telles quelles, avant de pouvoir le supprimer.`,
      });
    }

    await prisma.user.delete({ where: { id: cible.id } });

    await enregistrerEvenementSecurite({
      type: TYPES_EVENEMENT.COMPTE_SUPPRIME,
      emailConcerne: cible.email,
      nomConcerne: cible.nom,
      acteurNom: req.user.nom,
    });

    res.json({ message: "Compte supprime." });
  } catch (erreur) {
    console.error(erreur);
    res.status(500).json({ error: "Erreur serveur." });
  }
});

module.exports = router;
