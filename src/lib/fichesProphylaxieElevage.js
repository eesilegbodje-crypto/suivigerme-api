// Fiches de prophylaxie par filière, pour les participants suivis en Élevage. Contenu rédigé par
// Claude à partir de bonnes pratiques d'élevage courantes, PAS issu d'un document officiel : à
// faire relire IMPÉRATIVEMENT par un agent/technicien d'élevage ou un vétérinaire avant diffusion
// large aux conseillers — contrairement au reste de l'appli, il s'agit ici de contenu de santé
// animale. Clés alignées sur les identifiants de FILIERES_ELEVAGE (filieresParTypeSuivi.js).
const FICHES_PROPHYLAXIE_ELEVAGE = {
  volaille: {
    label: "Volaille",
    calendrierVaccinationDeparasitage: [
      "Maladie de Newcastle : vaccination dès les premiers jours puis rappels réguliers (tous les 2 à 3 mois selon le type de vaccin utilisé) — la maladie la plus meurtrière pour la volaille villageoise.",
      "Maladie de Gumboro : vaccination des jeunes sujets, en complément de la vaccination Newcastle.",
      "Déparasitage interne (vers) : environ toutes les 4 à 6 semaines.",
      "Déparasitage externe (poux, tiques) : au besoin, selon observation.",
    ],
    maladiesCourantes: [
      {
        nom: "Maladie de Newcastle",
        signes: "Troubles respiratoires, torticolis (tête tordue), diarrhée verdâtre, mortalité élevée et rapide.",
        prevention: "Vaccination stricte et régulière ; c'est la mesure de prévention la plus efficace.",
      },
      {
        nom: "Coccidiose",
        signes: "Diarrhée sanglante, abattement, mortalité surtout chez les jeunes sujets.",
        prevention: "Litière propre et sèche, produits anticoccidiens dans l'aliment ou l'eau si nécessaire.",
      },
      {
        nom: "Variole aviaire",
        signes: "Petites lésions/croûtes sur la crête et les barbillons, transmise par les moustiques et le contact.",
        prevention: "Vaccination possible ; lutte contre les moustiques autour du poulailler.",
      },
    ],
    hygieneDeBase: [
      "Nettoyer et désinfecter régulièrement le poulailler.",
      "Garder une litière sèche, changée régulièrement.",
      "Mettre en quarantaine tout nouveau sujet au moins 2 semaines avant de le mélanger au reste du lot.",
      "Éviter de mélanger des animaux d'âges très différents dans le même espace.",
      "Garder l'eau et l'aliment propres et à l'abri des souillures.",
    ],
    signesAlerte: [
      "Baisse brutale de la consommation d'eau ou d'aliment.",
      "Mortalité anormale ou en hausse soudaine.",
      "Plumes hérissées, animaux abattus, prostrés.",
      "Diarrhée inhabituelle.",
      "Troubles respiratoires (toux, éternuements, écoulement nasal).",
    ],
  },
  petits_ruminants_bovins: {
    label: "Petits ruminants et bovins",
    calendrierVaccinationDeparasitage: [
      "Peste des petits ruminants (PPR) : vaccination essentielle pour les ovins/caprins en zone à risque.",
      "Pasteurellose et, pour les bovins, fièvre aphteuse : vaccination selon la disponibilité et les recommandations locales.",
      "Déparasitage interne (vermifuge) : 2 à 4 fois par an selon la charge parasitaire de la zone.",
      "Déparasitage externe (tiques, gale) : selon la saison et l'observation des animaux.",
    ],
    maladiesCourantes: [
      {
        nom: "Peste des petits ruminants (PPR)",
        signes: "Fièvre, jetage (écoulement nasal), diarrhée, forte mortalité chez les ovins et caprins.",
        prevention: "Vaccination essentielle en zone à risque ; c'est une maladie à déclarer aux services vétérinaires.",
      },
      {
        nom: "Fièvre aphteuse (bovins)",
        signes: "Lésions dans la bouche et aux pieds, boiterie, forte baisse de production, très contagieuse.",
        prevention: "Vaccination selon disponibilité locale ; limiter les contacts avec des troupeaux extérieurs.",
      },
      {
        nom: "Parasitisme gastro-intestinal (vers)",
        signes: "Amaigrissement, diarrhée, anémie, retard de croissance chez les jeunes.",
        prevention: "Déparasitage régulier, rotation des zones de pâturage quand c'est possible.",
      },
      {
        nom: "Gale et tiques",
        signes: "Démangeaisons, perte de poils, animaux qui se frottent ; les tiques peuvent transmettre d'autres maladies.",
        prevention: "Traitement acaricide régulier, inspection visuelle fréquente des animaux.",
      },
    ],
    hygieneDeBase: [
      "Garder les abris propres et secs, renouveler la litière régulièrement.",
      "Mettre en quarantaine tout animal nouvellement acheté pendant environ 3 semaines.",
      "Veiller à la propreté des points d'eau.",
      "Faire tourner les zones de pâturage quand c'est possible, pour limiter le parasitisme.",
    ],
    signesAlerte: [
      "Baisse d'appétit ou animal qui s'isole du troupeau.",
      "Boiterie inhabituelle.",
      "Diarrhée persistante.",
      "Amaigrissement rapide et inexpliqué.",
      "Plusieurs avortements groupés : signe possible d'une maladie infectieuse grave, à signaler rapidement à un agent vétérinaire.",
    ],
  },
};

module.exports = { FICHES_PROPHYLAXIE_ELEVAGE };
