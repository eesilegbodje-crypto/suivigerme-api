const express = require("express");
const prisma = require("../lib/prisma");
const { authenticate } = require("../middlewares/auth.middleware");
const { MODULES_GERME } = require("../lib/modulesGerme");

const router = express.Router();

router.use(authenticate);

// Liste des modules GERME disponibles (pour remplir les menus déroulants du formulaire).
router.get("/modules", (req, res) => {
  res.json(MODULES_GERME);
});

// Liste des sessions de formation, avec le nombre de participants inscrits.
router.get("/", async (req, res) => {
  try {
    const { module: moduleId } = req.query;

    const ou = {};
    if (moduleId) {
      ou.module = moduleId;
    }

    const formations = await prisma.formation.findMany({
      where: ou,
      orderBy: { date: "desc" },
      include: { _count: { select: { participations: true } } },
    });

    res.json(formations);
  } catch (erreur) {
    console.error(erreur);
    res.status(500).json({ error: "Erreur serveur." });
  }
});

// Détail d'une session de formation : ses informations + la liste des participants inscrits.
router.get("/:id", async (req, res) => {
  try {
    const formation = await prisma.formation.findUnique({
      where: { id: req.params.id },
      include: {
        participations: {
          include: { participant: true },
          orderBy: { creeLe: "asc" },
        },
      },
    });

    if (!formation) {
      return res.status(404).json({ error: "Formation introuvable." });
    }

    res.json(formation);
  } catch (erreur) {
    console.error(erreur);
    res.status(500).json({ error: "Erreur serveur." });
  }
});

// Création d'une session de formation.
router.post("/", async (req, res) => {
  try {
    const { module: moduleId, date, lieu, formateur, notes } = req.body;

    if (!moduleId || !date) {
      return res.status(400).json({ error: "Le module et la date sont obligatoires." });
    }
    if (!MODULES_GERME.some((m) => m.id === moduleId)) {
      return res.status(400).json({ error: "Module GERME inconnu." });
    }

    const formation = await prisma.formation.create({
      data: {
        module: moduleId,
        date: new Date(date),
        lieu: lieu || null,
        formateur: formateur || null,
        notes: notes || null,
      },
    });

    res.status(201).json(formation);
  } catch (erreur) {
    console.error(erreur);
    res.status(500).json({ error: "Erreur serveur." });
  }
});

// Modification d'une session de formation.
router.put("/:id", async (req, res) => {
  try {
    const { module: moduleId, date, lieu, formateur, notes } = req.body;

    if (!moduleId || !date) {
      return res.status(400).json({ error: "Le module et la date sont obligatoires." });
    }
    if (!MODULES_GERME.some((m) => m.id === moduleId)) {
      return res.status(400).json({ error: "Module GERME inconnu." });
    }

    const formation = await prisma.formation.update({
      where: { id: req.params.id },
      data: {
        module: moduleId,
        date: new Date(date),
        lieu: lieu || null,
        formateur: formateur || null,
        notes: notes || null,
      },
    });

    res.json(formation);
  } catch (erreur) {
    if (erreur.code === "P2025") {
      return res.status(404).json({ error: "Formation introuvable." });
    }
    console.error(erreur);
    res.status(500).json({ error: "Erreur serveur." });
  }
});

// Suppression d'une session de formation (et des inscriptions liées, en cascade).
router.delete("/:id", async (req, res) => {
  try {
    await prisma.formation.delete({ where: { id: req.params.id } });
    res.status(204).end();
  } catch (erreur) {
    if (erreur.code === "P2025") {
      return res.status(404).json({ error: "Formation introuvable." });
    }
    console.error(erreur);
    res.status(500).json({ error: "Erreur serveur." });
  }
});

// Inscrit un participant à cette session de formation.
router.post("/:id/participants", async (req, res) => {
  try {
    const { participantId, present, appreciation } = req.body;

    if (!participantId) {
      return res.status(400).json({ error: "Le participant est obligatoire." });
    }

    const [formation, participant] = await Promise.all([
      prisma.formation.findUnique({ where: { id: req.params.id } }),
      prisma.participant.findUnique({ where: { id: participantId } }),
    ]);
    if (!formation) {
      return res.status(404).json({ error: "Formation introuvable." });
    }
    if (!participant) {
      return res.status(404).json({ error: "Participant introuvable." });
    }

    const inscription = await prisma.participationFormation.create({
      data: {
        formationId: req.params.id,
        participantId,
        present: present === undefined ? true : Boolean(present),
        appreciation: appreciation || null,
      },
      include: { participant: true },
    });

    res.status(201).json(inscription);
  } catch (erreur) {
    if (erreur.code === "P2002") {
      return res.status(409).json({ error: "Ce participant est déjà inscrit à cette formation." });
    }
    console.error(erreur);
    res.status(500).json({ error: "Erreur serveur." });
  }
});

// Modifie la présence / l'appréciation d'un participant inscrit à cette session.
router.put("/:id/participants/:participationId", async (req, res) => {
  try {
    const { present, appreciation } = req.body;

    const inscription = await prisma.participationFormation.update({
      where: { id: req.params.participationId },
      data: {
        ...(present !== undefined ? { present: Boolean(present) } : {}),
        ...(appreciation !== undefined ? { appreciation: appreciation || null } : {}),
      },
      include: { participant: true },
    });

    res.json(inscription);
  } catch (erreur) {
    if (erreur.code === "P2025") {
      return res.status(404).json({ error: "Inscription introuvable." });
    }
    console.error(erreur);
    res.status(500).json({ error: "Erreur serveur." });
  }
});

// Retire un participant de cette session de formation.
router.delete("/:id/participants/:participationId", async (req, res) => {
  try {
    await prisma.participationFormation.delete({ where: { id: req.params.participationId } });
    res.status(204).end();
  } catch (erreur) {
    if (erreur.code === "P2025") {
      return res.status(404).json({ error: "Inscription introuvable." });
    }
    console.error(erreur);
    res.status(500).json({ error: "Erreur serveur." });
  }
});

module.exports = router;
