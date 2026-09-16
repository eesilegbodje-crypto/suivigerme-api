const jwt = require("jsonwebtoken");

// Vérifie qu'un token de connexion (JWT) valide est présent dans la requête.
// S'il est valide, on ajoute les infos de l'utilisateur (req.user) pour la suite.
function authenticate(req, res, next) {
  const enTete = req.headers.authorization;

  if (!enTete || !enTete.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Connexion requise." });
  }

  const token = enTete.split(" ")[1];

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET); // contient userId, nom, role
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
