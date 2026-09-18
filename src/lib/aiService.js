// Petit module central pour tous les appels à l'IA (Google Gemini), repris à l'identique de
// CollectivIA pour rester cohérent entre les deux plateformes.
const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

function attendre(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Le modèle Gemini renvoie de temps en temps une erreur 503 "surchargé" quand la demande est trop
// forte chez Google au même moment — une situation normalement temporaire (quelques secondes),
// pas un bug de SuiviGERME. On distingue ce cas précis pour ne retenter QUE lui (pas une vraie
// erreur de configuration, qui ne se résoudrait pas en réessayant).
function estSurchargeTemporaire(erreur) {
  return erreur?.status === 503 || /"code":503|UNAVAILABLE/i.test(String(erreur?.message || erreur));
}

// Fonction générique réutilisable par tous les futurs modules IA. Retente automatiquement jusqu'à
// 2 fois (avec une pause de plus en plus longue) uniquement en cas de surcharge temporaire du
// modèle, avant d'abandonner et de laisser remonter l'erreur.
async function genererTexte(instruction, tentative = 1) {
  try {
    const reponse = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: instruction,
    });
    return reponse.text;
  } catch (erreur) {
    if (estSurchargeTemporaire(erreur) && tentative < 3) {
      await attendre(tentative * 3000); // 3s puis 6s
      return genererTexte(instruction, tentative + 1);
    }
    throw erreur;
  }
}

// Comme genererTexte, mais s'attend à ce que la réponse soit un objet structuré (JSON), utile
// quand on veut que l'IA remplisse plusieurs champs précis en une seule fois.
async function genererJSON(instruction) {
  const texteBrut = await genererTexte(instruction);
  const texteNettoye = texteBrut.replace(/```json|```/g, "").trim();
  return JSON.parse(texteNettoye);
}

module.exports = { genererTexte, genererJSON };
