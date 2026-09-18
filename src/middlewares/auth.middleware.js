const jwt = require("jsonwebtoken");
const prisma = require("../lib/prisma");

// Vérifie qu'un token de connexion (JWT) valide est présent dans la requête, ET que le compte
// n'a pas été suspendu depuis (une suspension doit couper l'accès immédiatement, même si la
// personne avait déjà une session ouverte — d'où cette vérification en base à chaque requête,
// et pas seulement au moment de la connexion).
async function authenticate(req, res, next) {
  const enTete = req.headers.authorization;

  if (!enTete || !enTete.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Connexion requise." });
  }

  const token = enTete.split(" ")[1];

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET); // contient userId, nom, role

    const utilisateur = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { suspendu: true },
    });
    if (!utilisateur) {
      return res.status(401).json({ error: "Session invalide ou expirée." });
    }
    if (utilisateur.suspendu) {
      return res.status(403).json({ error: "Ce compte a été suspendu. Contactez votre coordonnateur." });
    }

    next();
  } catch (erreur) {
    return res.status(401).json({ error: "Session invalide ou expirée." });
  }
}

// Vérifie que le rôle de l'utilisateur connecté fait partie des rôles autorisés.
function authorize(...rolesAutorises) {
  return (req, res, next) => {
    if (!req.user || !rolesAutorises.includes(req.user.role)) {
      return res.status(403).json({ error: "Accès refusé pour ce rôle." });
    }
    next();
  };
}

module.exports = { authenticate, authorize };
