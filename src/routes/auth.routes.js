const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../lib/prisma");
const validerMotDePasse = require("../lib/passwordPolicy");
const { authenticate, authorize } = require("../middlewares/auth.middleware");

const router = express.Router();

// Connexion : vérifie l'email + mot de passe, renvoie un token de session (JWT).
router.post("/login", async (req, res) => {
  try {
    const { email, motDePasse } = req.body;
    if (!email || !motDePasse) {
      return res.status(400).json({ error: "Email et mot de passe requis." });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: "Email ou mot de passe incorrect." });
    }

    const motDePasseValide = await bcrypt.compare(motDePasse, user.motDePasse);
    if (!motDePasseValide) {
      return res.status(401).json({ error: "Email ou mot de passe incorrect." });
    }

    const token = jwt.sign(
      { userId: user.id, nom: user.nom, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token, user: { id: user.id, nom: user.nom, email: user.email, role: user.role } });
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
      data: { nom, email, motDePasse: motDePasseChiffre, role: role === "coordonnateur" ? "coordonnateur" : "conseiller" },
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
      select: { id: true, nom: true, email: true, role: true, creeLe: true },
      orderBy: { creeLe: "asc" },
    });
    res.json(utilisateurs);
  } catch (erreur) {
    console.error(erreur);
    res.status(500).json({ error: "Erreur serveur." });
  }
});

module.exports = router;
