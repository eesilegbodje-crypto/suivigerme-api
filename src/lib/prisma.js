// Point d'accès unique à la base de données (une seule connexion Prisma partagée par toute
// l'application), exactement comme dans CollectivIA.
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

module.exports = prisma;
