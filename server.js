require("dotenv").config();
const express = require("express");
const cors = require("cors");
const authRoutes = require("./src/routes/auth.routes");
const participantsRoutes = require("./src/routes/participants.routes");
const formationsRoutes = require("./src/routes/formations.routes");
const abfRoutes = require("./src/routes/abf.routes");
const suiviEvaluationRoutes = require("./src/routes/suiviEvaluation.routes");
const securiteRoutes = require("./src/routes/securite.routes");

const app = express();

// Sécurité : seules les adresses listées dans ORIGINES_AUTORISEES (fichier .env, séparées par
// des virgules) ont le droit d'appeler ce serveur. En local, si la variable n'est pas définie,
// on garde le comportement habituel (le frontend Vite en localhost). Une fois en ligne, il
// suffira de mettre la vraie adresse du site dans .env, sans toucher au code.
const ORIGINES_AUTORISEES = (
  process.env.ORIGINES_AUTORISEES || "http://localhost:5173,http://localhost:5174"
)
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Pas d'origine (ex. appel direct serveur à serveur, outil de test) : toléré.
      if (!origin || ORIGINES_AUTORISEES.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Origine non autorisée par la politique CORS."));
      }
    },
  })
);

app.use(express.json());

// Petite route de vérification : permet de savoir si le serveur est en ligne.
app.get("/", (req, res) => {
  res.json({ message: "API SuiviGERME en ligne." });
});

app.use("/auth", authRoutes);
app.use("/participants", participantsRoutes);
app.use("/formations", formationsRoutes);
app.use("/abf", abfRoutes);
app.use("/suivi-evaluation", suiviEvaluationRoutes);
app.use("/securite", securiteRoutes);

// Route inconnue : réponse claire plutôt qu'une erreur silencieuse.
app.use((req, res) => {
  res.status(404).json({ error: "Route inconnue." });
});

const PORT = process.env.PORT || 4100;
app.listen(PORT, () => {
  console.log(`API SuiviGERME démarrée sur le port ${PORT}.`);
});
