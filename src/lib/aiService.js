// Petit module central pour tous les appels à l'IA (Google Gemini), repris à l'identique de
// CollectivIA pour rester cohérent entre les deux plateformes.
const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Fonction générique réutilisable par tous les futurs modules IA.
async function genererTexte(instruction) {
  const reponse = await ai.models.generateContent({
    model: "gemini-3.6-flash",
    contents: instruction,
  });
  return reponse.text;
}

// Comme genererTexte, mais s'attend à ce que la réponse soit un objet structuré (JSON), utile
// quand on veut que l'IA remplisse plusieurs champs précis en une seule fois.
async function genererJSON(instruction) {
  const texteBrut = await genererTexte(instruction);
  const texteNettoye = texteBrut.replace(/```json|```/g, "").trim();
  return JSON.parse(texteNettoye);
}

module.exports = { genererTexte, genererJSON };
