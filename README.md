# ODC Ecosystem Platform

Plateforme MERN pour centraliser les données de l’écosystème Orange Digital Center (EDC, FabLab, Orange Fab, Clubs) : formations, participants, workflow Com’ et visualisations.

## Stack

- **Backend** : Node.js, Express, MongoDB (Mongoose), JWT, RBAC
- **Frontend** : React, Vite, Tailwind CSS (Orange Design System #FF7900 / noir), TanStack Table, Recharts

## Rôles

| Rôle | Accès |
|------|--------|
| **Super Admin** | Tout : utilisateurs, entités, formations, participants, import, analytics |
| **Entity Manager** | Entités (CRUD), formations, participants, import |
| **Formateur** | Formations (CRUD), participants, présence |
| **Communication** | Workflow Com’ (dates de publication, statuts), import, participants |
| **Student** | Lecture formations / participants (selon besoin) |

## Démarrage

### Prérequis

- Node.js 18+
- MongoDB (local ou Atlas)

### Installation

```bash
npm run install:all
```

### Variables d’environnement (backend)

Copier `server/.env.example` vers `server/.env` et renseigner :

- `MONGODB_URI` : chaîne de connexion MongoDB
- `JWT_SECRET` : secret pour les tokens JWT
- `CLIENT_URL` : URL du frontend (ex. http://localhost:5173)

### Lancer l’app (chaque partie séparément)

**Terminal 1 — Backend (API)**  
Depuis la racine du projet :

```bash
npm run dev:server
```

Ou directement dans le dossier server :

```bash
cd server
npm run dev
```
→ API disponible sur **http://localhost:5000**

**Terminal 2 — Frontend (Client)**  
Depuis la racine du projet :

```bash
npm run dev:client
```

Ou directement dans le dossier client :

```bash
cd client
npm run dev
```
→ Interface disponible sur **http://localhost:5173** (les appels `/api` sont proxyfiés vers le serveur).

---

*Alternative : tout lancer en une commande à la racine avec `npm run dev` (backend + client en parallèle).*

### Données de test (seed)

```bash
cd server && npm run seed
```

Comptes créés :

- **admin@odc.ma** / **Admin123!** (Super Admin)
- **com@odc.ma** / **Com123!** (Communication)
- **formateur@odc.ma** / **Formateur123!** (Formateur)

## Exigences & idées (contributeurs)

Voir **[docs/ODC_DASHBOARD_REQUIREMENTS_AND_IDEAS.md](docs/ODC_DASHBOARD_REQUIREMENTS_AND_IDEAS.md)** pour le brief en trois piliers :
- **Ce que vous voulez voir** — indicateurs clés et données pertinents à votre rôle  
- **Ce que vous voulez communiquer** — résultats et réalisations à présenter aux parties prenantes  
- **Ce qui vous aide à suivre la croissance** — tendances, comparaisons et analyses pour la prise de décision  

## Fonctionnalités

- **Tableau de bord** (« Tout ce que nous faisons ») : vue d’ensemble de toutes les entités ODC, KPIs (formations, participants, placements, Job Dating), graphiques (activités par ville, statut, type d’entité, genre, emplois par lieu), **filtres** (ville, type d’entité, période), tableau « Données par entité ».
- **Vue globale des données** : page « Data » avec les mêmes filtres, totaux et tableau par entité, liens vers Formations / Participants / Placements.
- **Résultats & communication** : page dédiée aux chiffres à présenter aux parties prenantes (message clé, KPIs, tableau par entité, filtres par ville / type / période).
- **Prévisions** : tendances par mois (formations et placements), projection sur les 3 prochains mois (moyenne mobile).
- **ETL & Import** :  
  - **ETL Excel** : un seul fichier Excel multi-feuilles (ex. **BD ODC Maroc - Starting 2026.xlsx**) → détection automatique des feuilles et chargement en base.  
    - **Feuille détail participants/placements** (une ligne par bénéficiaire) : colonnes attendues — Name, Last name, Gender, Age, socio-professional category, if student specify university, if student specify specialty, E-mail, Phone Number, Place, Training Date, Training Duration (number of days), Name of Training conducted, Company Name, Contract type, Job Position, Comments.  
    - **Feuille synthèse tableau de bord** (une ligne par formateur / total EDC/ODC) : Formateur, Effectif formés, Bénéficiaires élligible pour placement (Chercheurs emploi + …), Placés, Injoignable, Non placés, % (Placé/Chercheurs d'emploi). Supports « Total EDC Agadir », « Total ODC'Club Sidi Maarouf », etc.
- **Feuille participants + formations (une ligne par inscrit)** : Année, Formation, Date, Etat, Profil recommandé pour Job Dating, First Name, Last Name, Gender, Catégorie d'age, Profession, Établissement, Spécialité, Email, Téléphone, Niveau d'études, LinkedIn, UserCV, Avez Vous déjà participer au programmes ODC. Crée formations (par titre), participants (dédupliqués par email) et présences (Attendance + Job Dating).  
  - Import participants (CSV/Excel) et import placements (état de placement OSC).
- **Formations / Participants / Placements** : listes en lecture avec filtres (pas de création de formations ni de publication depuis le dashboard ; affichage et analyse uniquement).
- **Talent Search** : profils recommandés Job Dating (LinkedIn, CV).
- **Entités** : CRUD (Super Admin / Entity Manager).
- **Utilisateurs** : gestion des rôles (Super Admin).

## Design

Interface alignée sur l’Orange Design System (ODC Sénégal) :

- Couleur principale : **#FF7900**
- Navigation : fond noir, texte blanc
- Typographie : Roboto
- Coins peu arrondis (4px), cartes avec barre d’accent orange

admin@odc.ma / Admin123! → super_admin
manager@odc.ma / Manager123! → manager
coordinator@odc.ma / Coord123! → coordinator
member_edc@odc.ma / Member123! → member
member_fablab@odc.ma / Member123! → member
member_orangefab@odc.ma / Member123! → member
add a section for coworking space 
also notification system 
add section for all platform that we created