const express = require("express");
const prisma = require("../lib/prisma");
const { authenticate } = require("../middlewares/auth.middleware");

const router = express.Router();

// Toutes les routes de ce fichier nécessitent d'être connecté.
router.use(authenticate);

// Liste des participants, avec le nombre de formations suivies.
router.get("/", async (req, res) => {
  try {
    const { recherche, statut } = req.query;

    const ou = {};
    if (statut) {
      ou.statut = statut;
    }
    if (recherche) {
      ou.OR = [
        { nom: { contains: recherche, mode: "insensitive" } },
        { nomEntreprise: { contains: recherche, mode: "insensitive" } },
        { localite: { contains: recherche, mode: "insensitive" } },
        { telephone: { contains: recherche, mode: "insensitive" } },
      ];
    }

    const participants = await prisma.participant.findMany({
      where: ou,
      orderBy: { creeLe: "desc" },
      include: { _count: { select: { participations: true } } },
    });

    res.json(participants);
  } catch (erreur) {
    console.error(erreur);
    res.status(500).json({ error: "Erreur serveur." });
  }
});

// Détail d'un participant : ses informations + l'historique de ses formations.
router.get("/:id", async (req, res) => {
  try {
    const participant = await prisma.participant.findUnique({
      where: { id: req.params.id },
      include: {
        participations: {
          include: { formation: true },
          orderBy: { creeLe: "desc" },
        },
      },
    });

    if (!participant) {
      return res.status(404).json({ error: "Participant introuvable." });
    }

    res.json(participant);
  } catch (erreur) {
    console.error(erreur);
    res.status(500).json({ error: "Erreur serveur." });
  }
});

// Création d'un participant.
router.post("/", async (req, res) => {
  try {
    const { nom, telephone, email, localite, nomEntreprise, secteurActivite, statut, notes } = req.body;

    if (!nom || !nom.trim()) {
      return res.status(400).json({ error: "Le nom est obligatoire." });
    }

    const participant = await prisma.participant.create({
      data: {
        nom: nom.trim(),
        telephone: telephone || null,
        email: email || null,
        localite: localite || null,
        nomEntreprise: nomEntreprise || null,
        secteurActivite: secteurActivite || null,
        statut: statut || "Actif",
        notes: notes || null,
      },
    });

    res.status(201).json(participant);
  } catch (erreur) {
    console.error(erreur);
    res.status(500).json({ error: "Erreur serveur." });
  }
});

// Modification d'un participant.
router.put("/:id", async (req, res) => {
  try {
    const { nom, telephone, email, localite, nomEntreprise, secteurActivite, statut, notes } = req.body;

    if (!nom || !nom.trim()) {
      return res.status(400).json({ error: "Le nom est obligatoire." });
    }

    const participant = await prisma.participant.update({
      where: { id: req.params.id },
      data: {
        nom: nom.trim(),
        telephone: telephone || null,
        email: email || null,
        localite: localite || null,
        nomEntreprise: nomEntreprise || null,
        secteurActivite: secteurActivite || null,
        statut: statut || "Actif",
        notes: notes || null,
      },
    });

    res.json(participant);
  } catch (erreur) {
    if (erreur.code === "P2025") {
      return res.status(404).json({ error: "Participant introuvable." });
    }
    console.error(erreur);
    res.status(500).json({ error: "Erreur serveur." });
  }
});

// Suppression d'un participant (et de son historique de participation, en cascade).
router.delete("/:id", async (req, res) => {
  try {
    await prisma.participant.delete({ where: { id: req.params.id } });
    res.status(204).end();
  } catch (erreur) {
    if (erreur.code === "P2025") {
      return res.status(404).json({ error: "Participant introuvable." });
    }
    console.error(erreur);
    res.status(500).json({ error: "Erreur serveur." });
  }
});

module.exports = router;
