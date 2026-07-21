# ODC Dashboard Project — Requirements & Ideas Brief

**Instructions pour les contributeurs** : ce document regroupe les attentes des parties prenantes (voir, communiquer, croissance), les cahiers des charges détaillés, et les spécifications de rôles / centres / reporting. Utilisez-le pour prioriser les fonctionnalités. **Stack actuelle du dépôt** : MERN (MongoDB, Express, React, Node) — certaines références techniques (Python, Dash, PostgreSQL) sont conservées comme **référence fonctionnelle** à mapper sur l’existant ou des évolutions.

---

## Table des matières

1. [Trois piliers (vue synthétique)](#1-trois-piliers-vue-synthétique)
2. [Salah Eddine Admou — Vision Manager & modules](#2-salah-eddine-admou--vision-manager--modules)
3. [Hamza EL GHIBARI — Cahier des charges import & KPI](#3-hamza-el-ghibari--cahier-des-charges-import--kpi)
4. [Aymane Helfa — Principes UX](#4-aymane-helfa--principes-ux)
5. [Soufiane Bakkas — Améliorations proposées](#5-soufiane-bakkas--améliorations-proposées)
6. [Spécifications rôles, centres, comparaisons & rapports (Feedback)](#6-spécifications-rôles-centres-comparaisons--rapports-feedback)
7. [État dans l’app actuelle & backlog suggéré](#7-état-dans-lapp-actuelle--backlog-suggéré)
8. [Glossaire rapide](#8-glossaire-rapide)

---

## 1. Trois piliers (vue synthétique)

### 1.1 Ce que vous voulez voir

- **Objectif** : accès direct aux indicateurs clés et données pertinentes par rôle.
- **Pertinence** : filtrage intelligent pour limiter le bruit informationnel.
- **Personnalisation** : Admin, Formateur, Manager voient en priorité ce qui impacte leur travail quotidien.
- **Efficacité** : centralisation (présences, statuts de publication, profils candidats).

### 1.2 Ce que vous voulez communiquer

- **Objectif** : valoriser résultats et réalisations auprès des parties prenantes.
- **Impact** : chiffres « prêts à présenter » (placement, bénéficiaires, emplois créés).
- **Visibilité** : graphiques et synthèses clairs (centres, clubs).
- **Reporting** : export pour réunions stratégiques et communication.

### 1.3 Ce qui vous aide à suivre la croissance

- **Analyse temporelle** : évolution mois par mois / année par année.
- **Comparaison** : performances entre villes, types d’entités, périodes.
- **Anticipation** : prévisions / projections pour ressources et objectifs.

**Référence interne (rôles actuels dans le code)** : `super_admin`, `entity_manager`, `formateur`, `communication`, `student` — à rapprocher ou faire évoluer vers la matrice §6 (Manager, Coordinator, Member/Trainer, etc.).

---

## 2. Salah Eddine Admou — Vision Manager & modules

### Objectif du dashboard

- Suivi global de la performance ODC.
- Aide à la décision rapide.
- KPI clairs (formation, employabilité, startups…).
- Centralisation (formations, bénéficiaires, partenaires).
- Gestion utilisateurs (Manager & équipe).
- Accès sécurisé ; gestion des rôles (Admin, Formateurs, Coordinateurs) ; droits lecture / écriture / export ; **historique des actions (logs)**.

### Dashboard global (vue exécutive)

- Bénéficiaires totaux (par mois / année).
- Taux de remplissage des formations, taux de complétion.
- Taux d’insertion professionnelle.
- Nombre de programmes actifs.
- Répartition genre (H/F), répartition géographique.
- KPI en temps réel ; graphiques (barres, courbes, camemberts) ; codes couleur (vert / orange / rouge).

### Modules (périmètre cible)

| Module | Contenu attendu (résumé) |
|--------|---------------------------|
| **Formation (École du code & bootcamps)** | Liste (nom, type, durée, formateur) ; suivi apprenants (inscrits / présents / diplômés, abandon, évaluations) ; calendrier ; comparaison entre sessions. |
| **Employabilité** | Emploi, stage, freelance, sans emploi ; insertion à 3 / 6 mois ; partenaires ; job dating ; matching candidats ↔ entreprises. |
| **Startups & entrepreneuriat** | Startups accompagnées, stade (idée, MVP, croissance…), accélération, levées, mentorat, KPI startups. |
| **FabLab** | Projets, types (prototypage, 3D…), équipements, réservations, impact social. |
| **Programmes spécifiques** (Women, IA, etc.) | Participantes, taux, progression, impact, vouchers / e-learning. |
| **Analyse & reporting** | Filtres (région, période, programme) ; export PDF / Excel ; rapports mensuels auto ; comparaison mois vs mois, année vs année. |
| **Alertes** | Baisse de performance, deadlines (brief, reporting), abandon élevé, notifications. |
| **Intégration & data** | E-learning, CRM, Sheets/Excel, import auto, synchro temps réel (cible long terme). |
| **Accessibilité & UX** | Simple, responsive, mode sombre optionnel, widgets personnalisables. |
| **Sécurité** | Protection données (RGPD-like), sauvegardes, accès sensibles. |

### KPI absolument à inclure (cible)

Bénéficiaires / mois, taux d’insertion, complétion, impact (emplois, startups), satisfaction, femmes bénéficiaires, NEET formés, **index global de performance ODC**, prédiction simple (risque abandon, probabilité insertion), benchmark régions.

---

## 3. Hamza EL GHIBARI — Cahier des charges import & KPI

### Contexte

- Import fichiers Excel ; agrégation mensuelle ; dashboard interactif ; **mise à jour auto à chaque upload** ; filtres période (mois, année).

### Périmètre

- **Inclus** : upload Excel standardisé, traitement / nettoyage, KPI, visualisation, filtres temporels.
- **Exclu (selon version initiale)** : auth avancée sauf besoin ; modification des sources ; saisie manuelle massive.

### Structure données attendue (Excel)

formation, date, formateur, horodateur, prénom, nom, genre, âge, catégorie socio-professionnelle, étudiant (oui/non), université, spécialité, email, téléphone, linkedin — UTF-8, dates exploitables.

### Fonctionnalités

- Upload ; validation structure ; refus si non conforme ; **plusieurs fichiers** (accumulation mensuelle).
- Stockage BDD ; historique des fichiers ; champs mois / année dérivés des dates.
- Nettoyage : doublons email, nulles, normalisation genre / catégories ; extraction mois, année, tranches d’âge.
- KPI : inscriptions totales, par formation, par mois, genre, âge, étudiants vs non, top formateurs, uniques par email.
- Dashboard : barres, courbes, secteurs ; filtres année, mois, formation, formateur ; **refresh après upload**.

### Stack « recommandée » dans le brief original

Python (Flask/Django), Pandas, SQLAlchemy, Dash/Streamlit, PostgreSQL/SQLite. **À traduire** en modules équivalents sur MERN si on reste sur ce dépôt.

### Processus cible

Upload → validation → nettoyage / transformation → stockage → recalcul KPI → dashboard à jour → filtres utilisateur.

---

## 4. Aymane Helfa — Principes UX

- **Simple à lire** : scan en ~5 secondes.
- **Actionnable** : quoi faire ensuite ?
- **Personnalisé** : chaque rôle voit ce qui compte.
- Le dashboard ne doit pas seulement afficher des chiffres : il doit répondre **immédiatement** à une question métier.

### From Data → Decision

Chaque bloc répond à : **What’s happening ?** et **Why ?**

### Par rôle (cible UX)

| Rôle | Focus |
|------|--------|
| **Manager** | Vue macro, alertes, comparaison régions. |
| **Formateur** | Progression apprenants, absences, évaluations. |
| **Coordinateur** | Sessions, planning, remplissage formations. |

**Dashboard adaptatif** : moins de bruit, plus de clarté.

---

## 5. Soufiane Bakkas — Améliorations proposées

### 5.1 Feedback & satisfaction

- Formulaires auto par session ; lien / QR fin de formation.
- Collecte quantitative (notes contenu, formateur, organisation) et qualitative (commentaires) ; anonymat possible.
- Analyse : moyenne par formation / formateur ; graphiques (barres, radar, courbes) ; détection points faibles ; insights textuels ; alertes si baisse.

### 5.2 Analyse géographique avancée

- Carte interactive, heatmap, performance par ville, comparaison régions (ex. Rabat 80 %, Casa 60 %, Agadir 70 %).

### 5.3 KPI Time-to-Impact

Temps moyen entre **fin de formation** et **insertion** (emploi, stage, freelance) ; par formation / région ; insights type « Web → insertion en 2 mois ».

---

## 6. Spécifications rôles, centres, comparaisons & rapports (Feedback)

### 6.1 Restructuration des rôles

#### SuperAdmin

- Administration technique ; **pas** de dashboard analytics (uniquement panneau admin).
- Gestion utilisateurs (CRUD, activer/désactiver) ; attribution rôles ; permissions lecture / écriture / export / suppression ; **logs d’activité** ; paramètres globaux (entités, centres, périodes).

#### Manager (Senior Manager & Managers)

- Vue stratégique consolidée sur **toutes** les entités (École du Code, FabLab Solidaire, Orange Fab) et centres (Casablanca, Rabat, Agadir).
- **Accueil** : grands chiffres : bénéficiaires cumulés (2021 → présent), femmes, formations livrées, taux insertion, startups accompagnées (Orange Fab), makers FabLab formés (FabLab Solidaire).
- **Design** : style rapport annuel corporate (pas tableur) ; cartes KPI larges, bordure gauche verte / orange / rouge ; valeur grande, libellé, **delta** avec flèche et couleur ; cliquable vers détail ; typographie Inter/Poppins ; orange #FF7900 + neutres ; graphiques cohérents, animations légères, tooltips ; grille responsive.
- **Graphiques** : barres empilées bénéficiaires par entité et centre ; courbe tendance mensuelle/annuelle ; **donut** genre ; barres horizontales top formations par inscriptions.
- **Filtres** : entité ; région/centre ; période (année, mois, semestre) ; **comparaison temporelle** (voir §6.3).
- **Fonctions** : export PDF & Excel ; vue comparative côte à côte (deux périodes ou deux centres) ; lecture détail par entité.

#### Member / Trainer (par entité assignée)

- Saisie opérationnelle ; lecture données **propres** à l’entité ; **pas** de suppression.

**École du Code** : participants (trainings, workshops, bootcamps, events) ; champs participant + champs événement (nom, type, dates, formateur, centre, capacité, présences) ; petit dashboard perso (saisies du mois, historique, graphiques simples).

**FabLab Solidaire** : idem + **inventaire** (équipements, consommables, seuils d’alerte, historique usage, demande réassort) ; dashboard avec alertes stock.

**Orange Fab** : données startups (nom, secteur, stade, fondateurs, dates, programme, statut) + événements ; graphiques par stade, liste startups.

#### Coordinator

- Supervision transverse ; **lecture seule** sur toutes entités / centres.
- Dashboard proche Manager ; filtres année, mois, centre, entité ; tableaux drill-down.
- **Export Excel** filtré (pas PDF réservé Manager pour rapports formels — voir §6.5).

### 6.2 Structure centres ODC Maroc

| Ville | Réalité métier |
|-------|----------------|
| **Casablanca** | 2 centres physiques, **École du Code uniquement** (pas FabLab Solidaire, pas Orange Fab). |
| **Rabat** | 1 centre : École du Code + FabLab + Orange Fab. |
| **Agadir** | 1 centre : École du Code + FabLab + Orange Fab. |

**Règle UI** : si filtre Casablanca → sections FabLab / Orange Fab **masquées** ou « Non applicable ».

### 6.3 Comparaison temporelle (Manager)

- Année vs année ; mois vs mois ; semestre vs semestre ; **deux plages personnalisées** avec KPI côte à côte et % d’écart.
- Visualisations : barres groupées (période A / B) ; tableau (A, B, écart absolu, %) ; courbes superposées.

### 6.4 Données historiques

- Données depuis **2021** ; import initial depuis Excel historiques.

### 6.5 Rapports professionnels (Manager, Senior Manager, Coordinator)

- **Contenu** : couverture (logo, titre, période, date génération) ; synthèse exécutive (6 KPI + variation) ; sections par entité ; section comparaison si active ; marges, titres, pagination, pied de page.
- **PDF** : mise en page fixe, haute résolution graphiques ; reflète filtres actifs.
- **Accès** : Manager / Senior Manager → PDF complet + Excel brut ; Coordinator → PDF + Excel filtré.
- **Phase ultérieure** : charte graphique ODC officielle ; répertoire config assets (logo, couleurs, polices) sans refonte majeure.

---

## 7. État dans l’app actuelle & backlog suggéré

### Déjà en place (référence rapide)

- Tableau de bord avec filtres (ville, type entité, période) ; vue Data ; Formations avec filtres (ville, entité liée à la ville, année, période) ; Participants / Placements ; Prévisions ; page **Résultats & communication** ; import Excel/CSV (ETL, master brief/participants) ; RBAC basé sur rôles existants.

### Écarts majeurs vs §6

- Matrice rôles **SuperAdmin sans analytics** / **Manager** / **Coordinator** / **Trainer par entité** : à concevoir (routes, vues, permissions).
- Filtre centre avec règles Casa (masquage FabLab/Orange Fab).
- Module comparaison périodes avancée (A vs B partout).
- Rapports PDF structurés + exports Excel métier.
- Logs d’activité, permissions fines (R/W/export).
- Modules FabLab inventaire, Orange Fab startups, satisfaction, carte géo, time-to-impact : **non implémentés** ou partiels.

### Priorisation backlog (suggestion)

| Priorité | Item | Référence |
|----------|------|-----------|
| P0 | Alignement filtres centre / entité (règle Casa) + évolution rôles (Manager / Coordinator) | §6.1, §6.2 |
| P1 | Comparaison deux périodes (KPI + tableaux + graphiques groupés) | §6.3, pilier 3 |
| P1 | Cartes KPI « corporate » + deltas pour vue Manager | §6.1 |
| P2 | Export Excel filtré (Coordinator) ; PDF rapport COMEX | §6.5 |
| P2 | Données & filtres depuis 2021 (import + requêtes) | §6.4 |
| P3 | Feedback satisfaction, time-to-impact, carte géo | §5 |
| P3 | Inventaire FabLab, fiches startups Orange Fab | §2, §6.1 |

---

## 8. Glossaire rapide

- **EDC** : Orange Digital Center (centre principal).
- **ODC’Club** : Club (ex. Sidi Maarouf, Ben M’sik).
- **Placement** : emploi ou stage obtenu après formation.
- **Synthèse placements** : agrégats par formateur / centre.
- **Job Dating** : profils recommandés pour rencontres emploi.
- **NEET** : ni en emploi, ni en études, ni en formation.

---

*Document vivant : intègre les contributions Salah Eddine Admou, Hamza EL GHIBARI, Aymane Helfa, Soufiane Bakkas et le bloc Feedback (rôles & reporting). À mettre à jour au fil des implémentations et des retours parties prenantes.*
