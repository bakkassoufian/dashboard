Donnees de demo - Ecole du Code (manager / formateur)

Ces ressources servent a demontrer deux scenarios pendant la video :
1. Ajouter une formation (saisie manuelle).
2. Importer les participants (fichier Excel).

Les deux scenarios sont coherents entre eux : la formation creee porte le meme
titre et le meme formateur que le fichier d'import, ce qui permet de relier les
participants importes a la formation.

====================================================================
1) AJOUTER UNE FORMATION
====================================================================
Page : Ecole du Code  ->  bouton "Ajouter formation"

Champs a saisir dans le formulaire "Nouvelle activite" :

  Entite ............... Coding School Rabat (si demande)
  Titre ................ Initiation au Developpement Web
  Type d'activite ...... Formation
  Formateur ............ Hamza LAMBARA
  Description .......... Parcours d'introduction au developpement web :
                         HTML, CSS et JavaScript. Projets pratiques et
                         mise en ligne d'un premier site.
  Date de debut ........ 2026-06-15
  Date de fin .......... 2026-06-17
  Duree (libre) ........ 3 jours
  Creneau horaire ...... 09h00 - 16h00
  Lieu (ville / salle) . Rabat - Coding School, Salle A1
  Image de couverture .. (optionnel)

Apres creation : la formation apparait en statut "draft" (brouillon).
On peut ensuite ouvrir sa fiche pour changer le statut (publier) et saisir
manuellement les effectifs (Valides).

====================================================================
2) IMPORTER LES DONNEES (PARTICIPANTS)
====================================================================
Page : Ecole du Code -> bouton "Importer"  (ou menu Import)

Fichier a utiliser : demo-data/demo-participants-import.xlsx
  - Onglet : "Learners Database"
  - 10 participants
  - Formateur : Hamza LAMBARA (colonne obligatoire, validation bloquante)
  - Name of Training conducted : Initiation au Developpement Web
  - Lieu / Place : Coding School Rabat
  - Training Date : 2026-06-15
  - Training Duration (number of days) : 3

Etapes de la demo :
  1. Ouvrir la page Import.
  2. (Si formateur EDC) selectionner l'activite "Initiation au Developpement Web".
  3. Choisir le fichier demo-participants-import.xlsx.
  4. Lancer l'import -> 10 participants rattaches a la formation.

Regenerer le fichier Excel si besoin :
  cd server
  node src/scripts/generate-demo-import.js
