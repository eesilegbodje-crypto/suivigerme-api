// Génère automatiquement, par IA, une fiche technique (Agriculture) ou de prophylaxie (Élevage)
// pour une activité qui n'a pas de fiche standard toute prête (voir fichesTechniquesAgriculture.js
// / fichesProphylaxieElevage.js) — typiquement quand le conseiller choisit la filière "autre" et
// précise lui-même l'activité (ex. "Cacao", "Lapins"). Toujours la MÊME forme JSON que les fiches
// standard, pour que le frontend affiche les deux avec les mêmes composants sans distinction.
//
// Important : contenu généré par IA à partir de connaissances générales, PAS d'un document de
// référence officiel — comme les fiches standard rédigées par Claude, à faire relire par un
// agronome (Agriculture) ou un agent/technicien d'élevage/vétérinaire (Élevage) avant de s'y fier
// pour des décisions importantes.
const { genererJSON } = require("./aiService");

async function genererFicheTechniqueParIa(nomCulture) {
  const consigne = `Tu es un agronome expert des pratiques agricoles courantes en Afrique de l'Ouest. Rédige une fiche technique pour la culture suivante : "${nomCulture}".

Réponds uniquement avec un objet JSON de cette forme exacte, sans texte autour :
{"label": "...", "itineraireTechnique": ["...", "...", "...", "..."], "calendrierIndicatif": "...", "conservation": "...", "pointsDeVigilance": ["...", "...", "..."]}

- "label" : le nom de la culture, avec une majuscule (ex. "Cacao").
- "itineraireTechnique" : 3 à 5 étapes courtes et concrètes, dans l'ordre (préparation du sol, semis/plantation, entretien, récolte).
- "calendrierIndicatif" : une phrase donnant la période de semis/plantation habituelle et la durée approximative du cycle.
- "conservation" : une phrase sur la conservation de la récolte après récolte.
- "pointsDeVigilance" : 2 à 4 risques, maladies ou ravageurs courants à surveiller pour cette culture précise.

Sois concret et pratique, adapté à un petit producteur, sans inventer de chiffres précis non génériques (rendements, doses exactes...).`;

  const fiche = await genererJSON(consigne);
  return {
    label: fiche.label || nomCulture,
    itineraireTechnique: Array.isArray(fiche.itineraireTechnique) ? fiche.itineraireTechnique : [],
    calendrierIndicatif: fiche.calendrierIndicatif || "",
    conservation: fiche.conservation || "",
    pointsDeVigilance: Array.isArray(fiche.pointsDeVigilance) ? fiche.pointsDeVigilance : [],
  };
}

async function genererFicheProphylaxieParIa(nomActivite) {
  const consigne = `Tu es un agent/technicien d'élevage expert des pratiques courantes en Afrique de l'Ouest. Rédige une fiche de prophylaxie pour l'espèce ou l'activité d'élevage suivante : "${nomActivite}".

Réponds uniquement avec un objet JSON de cette forme exacte, sans texte autour :
{"label": "...", "calendrierVaccinationDeparasitage": ["...", "...", "..."], "maladiesCourantes": [{"nom": "...", "signes": "...", "prevention": "..."}], "hygieneDeBase": ["...", "...", "..."], "signesAlerte": ["...", "...", "..."]}

- "label" : le nom de l'espèce/activité, avec une majuscule (ex. "Lapins").
- "calendrierVaccinationDeparasitage" : 2 à 4 recommandations de vaccination/déparasitage avec une fréquence indicative, adaptées à cette espèce.
- "maladiesCourantes" : 3 à 4 maladies courantes de cette espèce, chacune avec ses signes cliniques et la prévention recommandée.
- "hygieneDeBase" : 3 à 5 bonnes pratiques d'hygiène et de logement.
- "signesAlerte" : 3 à 5 signes qui doivent alerter l'éleveur et l'amener à consulter un agent vétérinaire.

Sois concret et pratique, adapté à un petit éleveur, sans inventer de chiffres précis non génériques.`;

  const fiche = await genererJSON(consigne);
  return {
    label: fiche.label || nomActivite,
    calendrierVaccinationDeparasitage: Array.isArray(fiche.calendrierVaccinationDeparasitage)
      ? fiche.calendrierVaccinationDeparasitage
      : [],
    maladiesCourantes: Array.isArray(fiche.maladiesCourantes) ? fiche.maladiesCourantes : [],
    hygieneDeBase: Array.isArray(fiche.hygieneDeBase) ? fiche.hygieneDeBase : [],
    signesAlerte: Array.isArray(fiche.signesAlerte) ? fiche.signesAlerte : [],
  };
}

module.exports = { genererFicheTechniqueParIa, genererFicheProphylaxieParIa };
