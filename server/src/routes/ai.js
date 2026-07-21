import express from 'express';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.post('/dashboard-analysis', authenticate, async (req, res) => {
  const { stats, filters, context } = req.body;

  try {
    // Simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 2000));

    const isGlobal = !filters?.year && !filters?.ville && !filters?.activity;
    const total = isGlobal ? 198000 : (stats?.totalParticipants || 0);
    const womenPct = isGlobal ? 44 : (stats?.totalParticipants ? Math.round((stats.womenBeneficiaries / stats.totalParticipants) * 100) : 44);
    const year = filters?.year || 'Global (2021-2026)';
    const ville = filters?.ville || 'Toutes les villes';

    // Generative Response emphasizing Orange's free social impact and internal business value
    const analysis = `
### 🤖 Analyse d'Impact & Valeur Ajoutée - Orange Digital Center

**Périmètre :** ${ville} | **Période :** ${year} | **Modèle :** DeepSeek v3 Strategic Engine

#### 🌟 La Vision Orange : Gratuité & Inclusion
En tant qu'opérateur de télécommunications leader, Orange Maroc transforme sa puissance technologique en impact social concret. Le principe fondamental de l'ODC est la **gratuité totale** de l'accès au savoir numérique, levant ainsi les barrières financières pour la jeunesse marocaine.

#### 📊 Synthèse de l'Impact Numérique
L'écosystème affiche une performance exceptionnelle avec **${total.toLocaleString()} bénéficiaires** ayant bénéficié de formations de haut niveau sans aucun coût.

1. **Démocratisation du Savoir :** L'accessibilité gratuite a permis d'atteindre un taux de participation féminine de **${womenPct}%**, prouvant que la suppression des frais d'inscription est le levier n°1 de la parité dans la tech.
2. **Impact Employabilité :** Avec **60% d'insertion**, Orange ne se contente pas de former ; l'entreprise crée des ponts directs vers le marché de l'emploi.

#### 💼 Valeur Ajoutée Interne pour Orange
Au-delà de la mission sociale, l'ODC génère une valeur stratégique directe pour le Groupe Orange :

*   **Sourcing de Talents :** L'ODC constitue un vivier de recrutement pré-qualifié pour les directions IT et Réseaux d'Orange. Réduction des coûts de sourcing et amélioration du "Time-to-Hire".
*   **Innovation & Agilité :** Les startups de l'**Orange Fab** apportent des solutions agiles (Fintech, EdTech, IoT) qui peuvent être intégrées aux offres B2B/B2C d'Orange.
*   **Engagement des Collaborateurs :** Le mécénat de compétences permet aux experts Orange de transmettre leur savoir, renforçant leur sentiment d'appartenance et la fierté de travailler pour une entreprise engagée.
*   **Image de Marque & RSE :** Le leadership d'Orange sur le volet social renforce le capital sympathie de la marque, un atout majeur dans un marché telco ultra-concurrentiel.

#### 🎯 Recommandations Stratégiques
*   **Synergie RH :** Créer un parcours "ODC to Orange Career" pour sécuriser le recrutement des 5% meilleurs profils chaque année.
*   **Co-innovation :** Lancer des challenges internes impliquant les startups ODC et les BUs Orange pour résoudre des problématiques business réelles.

#### 💡 Insight Stratégique
L'ODC n'est pas qu'un centre de coût RSE, c'est un **accélérateur de transformation numérique interne** qui alimente le futur d'Orange en talents et en innovations.
    `;

    res.json({
      success: true,
      data: {
        analysis,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Erreur lors de l'analyse IA" });
  }
});

export default router;
