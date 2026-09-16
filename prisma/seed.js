// Crée le tout premier compte (coordonnateur) au premier lancement, à partir des informations du
// fichier .env — jamais de mot de passe écrit en dur ici. Se relance sans risque : si le compte
// existe déjà, le script ne fait rien.
require("dotenv").config();
const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");
const validerMotDePasse = require("../src/lib/passwordPolicy");

const prisma = new PrismaClient();

async function main() {
  const nom = process.env.COORDINATEUR_INITIAL_NOM;
  const email = process.env.COORDINATEUR_INITIAL_EMAIL;
  const motDePasse = process.env.COORDINATEUR_INITIAL_MOT_DE_PASSE;

  if (!nom || !email || !motDePasse) {
    console.log(
      "Aucun compte initial créé : renseigne COORDINATEUR_INITIAL_NOM, COORDINATEUR_INITIAL_EMAIL " +
        "et COORDINATEUR_INITIAL_MOT_DE_PASSE dans le fichier .env, puis relance cette commande."
    );
    return;
  }

  const erreurPolitique = validerMotDePasse(motDePasse);
  if (erreurPolitique) {
    console.log("Mot de passe initial invalide : " + erreurPolitique);
    return;
  }

  const existant = await prisma.user.findUnique({ where: { email } });
  if (existant) {
    console.log(`Le compte ${email} existe déjà — rien à faire.`);
    return;
  }

  const motDePasseChiffre = await bcrypt.hash(motDePasse, 10);
  await prisma.user.create({
    data: { nom, email, motDePasse: motDePasseChiffre, role: "coordonnateur" },
  });

  console.log(`Compte coordonnateur créé avec succès pour ${email}.`);
}

main()
  .catch((erreur) => {
    console.error(erreur);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
