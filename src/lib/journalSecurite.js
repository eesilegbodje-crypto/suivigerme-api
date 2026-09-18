// Journal des événements de sécurité de SuiviPME : connexions (réussies/échouées) et actions
// sensibles sur les comptes (création, suppression, suspension, réactivation, changement ou
// réinitialisation de mot de passe). Consulté uniquement par le coordonnateur, dans le module
// Sécurité (voir src/routes/securite.routes.js). Écrire un événement ne doit jamais faire échouer
// l'action principale (connexion, création de compte...) : toute erreur ici est seulement
// journalisée dans la console serveur, jamais renvoyée à l'appelant.
const prisma = require("./prisma");

const TYPES_EVENEMENT = {
  CONNEXION_REUSSIE: "connexion_reussie",
  CONNEXION_ECHOUEE: "connexion_echouee",
  COMPTE_CREE: "compte_cree",
  COMPTE_SUPPRIME: "compte_supprime",
  COMPTE_SUSPENDU: "compte_suspendu",
  COMPTE_REACTIVE: "compte_reactive",
  MOT_DE_PASSE_REINITIALISE: "mot_de_passe_reinitialise",
  MOT_DE_PASSE_CHANGE: "mot_de_passe_change",
};

// Libellés affichés côté écran, pour ne jamais avoir à traduire les identifiants techniques dans
// le frontend.
const LIBELLES_EVENEMENT = {
  [TYPES_EVENEMENT.CONNEXION_REUSSIE]: "Connexion réussie",
  [TYPES_EVENEMENT.CONNEXION_ECHOUEE]: "Tentative de connexion échouée",
  [TYPES_EVENEMENT.COMPTE_CREE]: "Compte créé",
  [TYPES_EVENEMENT.COMPTE_SUPPRIME]: "Compte supprimé",
  [TYPES_EVENEMENT.COMPTE_SUSPENDU]: "Compte suspendu",
  [TYPES_EVENEMENT.COMPTE_REACTIVE]: "Compte réactivé",
  [TYPES_EVENEMENT.MOT_DE_PASSE_REINITIALISE]: "Mot de passe réinitialisé par le coordonnateur",
  [TYPES_EVENEMENT.MOT_DE_PASSE_CHANGE]: "Mot de passe changé",
};

async function enregistrerEvenementSecurite({ type, emailConcerne, nomConcerne, acteurNom, details }) {
  try {
    await prisma.journalSecurite.create({
      data: {
        type,
        emailConcerne,
        nomConcerne: nomConcerne || null,
        acteurNom: acteurNom || null,
        details: details || null,
      },
    });
  } catch (erreur) {
    console.error("Impossible d'enregistrer l'événement de sécurité :", erreur);
  }
}

module.exports = { TYPES_EVENEMENT, LIBELLES_EVENEMENT, enregistrerEvenementSecurite };
