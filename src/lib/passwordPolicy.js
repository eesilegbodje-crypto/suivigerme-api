// Règle simple de solidité du mot de passe, appliquée partout où un mot de passe est créé ou
// changé : au moins 8 caractères, avec au moins une lettre et un chiffre.
function validerMotDePasse(motDePasse) {
  if (!motDePasse || motDePasse.length < 8) {
    return "Le mot de passe doit contenir au moins 8 caractères.";
  }
  if (!/[a-zA-Z]/.test(motDePasse) || !/[0-9]/.test(motDePasse)) {
    return "Le mot de passe doit contenir au moins une lettre et un chiffre.";
  }
  return null;
}

module.exports = validerMotDePasse;
