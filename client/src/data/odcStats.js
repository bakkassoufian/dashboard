/**
 * SOURCE UNIQUE des chiffres de suivi ODC Maroc.
 *
 * Ces valeurs etaient auparavant dupliquees dans Dashboard.jsx, Reports.jsx et
 * Formations.jsx, ce qui les faisait diverger. Toute mise a jour se fait ICI
 * et se propage a tous les ecrans.
 *
 * ATTENTION : ne jamais ecrire les milliers avec un point.
 * En JavaScript, 7.174 vaut 7,174 (un decimal) et non 7 174.
 */

// Suivi par annee, arrete au S1 2026.
// Coherence verifiee : 39 274 = 17 476 femmes + 21 798 hommes.
export const DATA_A_JOUR = {
  total: 39274,
  years: [
    { year: '2021', participants: 1727, women: 850, men: 877 },
    { year: '2022', participants: 8278, women: 4165, men: 4113 },
    { year: '2023', participants: 4701, women: 1978, men: 2723 },
    { year: '2024', participants: 6152, women: 2417, men: 3735 },
    { year: '2025', participants: 11242, women: 4619, men: 6623 },
    { year: 'S1 2026', participants: 7174, women: 3447, men: 3727 },
  ],
  totalWomen: 17476,
  totalMen: 21798,
};

// Detail S1 2026. Le mensuel et le detail par entite totalisent 7 174 chacun.
export const S1_2026 = {
  months: [
    { month: 'Janvier', participants: 472, women: 167, men: 305 },
    { month: 'Février', participants: 312, women: 166, men: 146 },
    { month: 'Mars', participants: 784, women: 379, men: 405 },
    { month: 'Avril', participants: 1751, women: 1016, men: 735 },
    { month: 'Mai', participants: 440, women: 204, men: 236 },
    { month: 'Juin', participants: 3415, women: 1515, men: 1900 },
  ],
  byEntity: [
    { entity: 'ODC SM', type: 'EDC', participants: 260 },
    { entity: 'ODC FSBM', type: 'EDC', participants: 1397 },
    { entity: 'ODC Rabat', type: 'EDC', participants: 630 },
    { entity: 'ODC Rabat', type: 'FabLab', participants: 251 },
    { entity: 'ODC Agadir', type: 'EDC', participants: 2310 },
    { entity: 'ODC Agadir', type: 'FabLab', participants: 173 },
    { entity: 'Orange Fab', type: 'Orange Fab', participants: 503 },
    { entity: 'Stage PFE', type: 'EDC', participants: 7 },
    { entity: 'Evenements/Talk', type: 'EDC', participants: 554 },
    { entity: 'Hackathons', type: 'ODC', participants: 1070 },
    { entity: 'En ligne', type: 'ODC', participants: 19 },
  ],
  formations: [
    { type: 'Formations EDC', count: 88 },
    { type: 'Workshop Fablab', count: 29 },
    { type: 'Stage', count: 3 },
    { type: 'Super codeur', count: 10 },
    { type: 'PRP', count: 2 },
    { type: "ODC'S Talk", count: 5 },
    { type: 'Orange Fab', count: 4 },
    { type: 'Hackathon', count: 1 },
    { type: 'En ligne', count: 1 },
  ],
  totalFormations: 143,
};

/** Vue "par ODC" : regroupe EDC + FabLab d'un meme centre (Rabat 630+251=881, Agadir 2310+173=2483). */
export const S1_2026_BY_ODC = Object.values(
  S1_2026.byEntity.reduce((acc, r) => {
    acc[r.entity] = acc[r.entity] || { entity: r.entity, participants: 0 };
    acc[r.entity].participants += r.participants;
    return acc;
  }, {}),
).sort((a, b) => b.participants - a.participants);

export const S1_2026_TOTAL = S1_2026.months.reduce((t, m) => t + m.participants, 0);
export const S1_2026_WOMEN = S1_2026.months.reduce((t, m) => t + m.women, 0);
export const S1_2026_MEN = S1_2026.months.reduce((t, m) => t + m.men, 0);

export const PCT_WOMEN = Math.round((DATA_A_JOUR.totalWomen / DATA_A_JOUR.total) * 100);
export const PCT_MEN = Math.round((DATA_A_JOUR.totalMen / DATA_A_JOUR.total) * 100);

/**
 * Chiffres affiches dans les bandeaux d'accueil.
 * total / odc / trainings derivent du suivi ci-dessus : verifiables.
 * fab / supercodeurs / cyber / partners sont des valeurs institutionnelles
 * codees en dur, sans source dans la base — a reviser des que la donnee existe.
 */
export const GLOBAL_STATS = {
  total: 198544, // perimetre Orange Maroc, aligne sur Dashboard.jsx
  odc: DATA_A_JOUR.total,
  trainings: 775,
  fab: 410,
  supercodeurs: 154500,
  cyber: 4300,
  partners: 60,
};
