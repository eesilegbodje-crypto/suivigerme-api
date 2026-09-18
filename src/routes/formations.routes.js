const express = require("express");
const prisma = require("../lib/prisma");
const { authenticate } = require("../middlewares/auth.middleware");
const { MODULES_GERME } = require("../lib/modulesGerme");

const router = express.Router();

router.use(authenticate);

// Chaque compte est independant : verifie, pour TOUTE route de ce fichier qui contient :id, que
// la formation existe ET appartient bien au compte connecte (meme principe que sur les PME).
router.param("id", async (req, res, next, id) => {
  try {
    const formation = await prisma.formation.findUnique({ where: { id } });
    if (!formation || formation.creeParId !== req.user.userId) {
      return res.status(404).json({ error: "Formation introuvable." });
    }
    req.formation = formation;
    next();
  } catch (erreur) {
    console.error(erreur);
    res.status(500).json({ error: "Erreur serveur." });
  }
});

// Liste des modules GERME disponibles (pour remplir les menus déroulants du formulaire).
router.get("/modules", (req, res) => {
  res.json(MODULES_GERME);
});

// Liste des sessions de formation, avec le nombre de participants inscrits.
router.get("/", async (req, res) => {
  try {
    const { module: moduleId } = req.query;

    const ou = { creeParId: req.user.userId };
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
        creeParId: req.user.userId,
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

    const participant = await prisma.participant.findUnique({ where: { id: participantId } });
    if (!participant || participant.creeParId !== req.user.userId) {
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

    const { count } = await prisma.participationFormation.updateMany({
      where: { id: req.params.participationId, formationId: req.params.id },
      data: {
        ...(present !== undefined ? { present: Boolean(present) } : {}),
        ...(appreciation !== undefined ? { appreciation: appreciation || null } : {}),
      },
    });
    if (count === 0) {
      return res.status(404).json({ error: "Inscription introuvable." });
    }

    const inscription = await prisma.participationFormation.findUnique({
      where: { id: req.params.participationId },
      include: { participant: true },
    });
    res.json(inscription);
  } catch (erreur) {
    console.error(erreur);
    res.status(500).json({ error: "Erreur serveur." });
  }
});

// Retire un participant de cette session de formation.
router.delete("/:id/participants/:participationId", async (req, res) => {
  try {
    const { count } = await prisma.participationFormation.deleteMany({
      where: { id: req.params.participationId, formationId: req.params.id },
    });
    if (count === 0) {
      return res.status(404).json({ error: "Inscription introuvable." });
    }
    res.status(204).end();
  } catch (erreur) {
    console.error(erreur);
    res.status(500).json({ error: "Erreur serveur." });
  }
});

module.exports = router;
