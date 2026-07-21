/**
 * Génère un fichier Excel de démonstration pour l'import des participants.
 *
 * Usage :
 *   node src/scripts/generate-demo-import.js
 *
 * Le fichier est créé dans : <repo>/demo-data/demo-participants-import.xlsx
 * Colonnes alignées sur le parser de /api/import/participants-excel
 * (la colonne « Formateur » est obligatoire — validation bloquante côté serveur).
 */
import XLSX from 'xlsx';
import path from 'path';
import { fileURLToPath } from 'url';
import { mkdirSync } from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.resolve(__dirname, '../../../demo-data');
mkdirSync(outDir, { recursive: true });

const TRAINER = 'Hamza LAMBARA';
const TRAINING = 'Initiation au Développement Web';
const LIEU = 'Coding School Rabat';
const DATE = '2026-06-15';
const DURATION = 3;

const rows = [
  { Name: 'Yasmine', 'Last name': 'El Amrani', Gender: 'F', Age: 22, 'socio-professional category': 'étudiant', 'if student, specify university': 'Université Mohammed V', 'if student, specify the specialty': 'Informatique', 'e-mail': 'yasmine.elamrani@example.com', 'Phone Number': '0612345678' },
  { Name: 'Mehdi', 'Last name': 'Benali', Gender: 'H', Age: 27, 'socio-professional category': 'employé', 'if student, specify university': '', 'if student, specify the specialty': '', 'e-mail': 'mehdi.benali@example.com', 'Phone Number': '0623456789' },
  { Name: 'Salma', 'Last name': 'Bouzidi', Gender: 'F', Age: 19, 'socio-professional category': 'étudiant', 'if student, specify university': 'ENSA Agadir', 'if student, specify the specialty': 'Génie Logiciel', 'e-mail': 'salma.bouzidi@example.com', 'Phone Number': '0634567890' },
  { Name: 'Omar', 'Last name': 'Tazi', Gender: 'H', Age: 31, 'socio-professional category': 'chercheur d\'emploi', 'if student, specify university': '', 'if student, specify the specialty': '', 'e-mail': 'omar.tazi@example.com', 'Phone Number': '0645678901' },
  { Name: 'Imane', 'Last name': 'Cherkaoui', Gender: 'F', Age: 24, 'socio-professional category': 'étudiant', 'if student, specify university': 'FST Settat', 'if student, specify the specialty': 'Data Science', 'e-mail': 'imane.cherkaoui@example.com', 'Phone Number': '0656789012' },
  { Name: 'Anas', 'Last name': 'El Idrissi', Gender: 'H', Age: 20, 'socio-professional category': 'étudiant', 'if student, specify university': 'Université Hassan II', 'if student, specify the specialty': 'Réseaux', 'e-mail': 'anas.elidrissi@example.com', 'Phone Number': '0667890123' },
  { Name: 'Nada', 'Last name': 'Berrada', Gender: 'F', Age: 29, 'socio-professional category': 'employé', 'if student, specify university': '', 'if student, specify the specialty': '', 'e-mail': 'nada.berrada@example.com', 'Phone Number': '0678901234' },
  { Name: 'Youssef', 'Last name': 'Alaoui', Gender: 'H', Age: 23, 'socio-professional category': 'étudiant', 'if student, specify university': 'INPT Rabat', 'if student, specify the specialty': 'Cybersécurité', 'e-mail': 'youssef.alaoui@example.com', 'Phone Number': '0689012345' },
  { Name: 'Hiba', 'Last name': 'Naciri', Gender: 'F', Age: 26, 'socio-professional category': 'chercheur d\'emploi', 'if student, specify university': '', 'if student, specify the specialty': '', 'e-mail': 'hiba.naciri@example.com', 'Phone Number': '0690123456' },
  { Name: 'Karim', 'Last name': 'Saidi', Gender: 'H', Age: 34, 'socio-professional category': 'employé', 'if student, specify university': '', 'if student, specify the specialty': '', 'e-mail': 'karim.saidi@example.com', 'Phone Number': '0601234567' },
];

const data = rows.map((r) => ({
  ...r,
  'Lieu / Place': LIEU,
  'Training Date': DATE,
  'Training Duration (number of days)': DURATION,
  'Name of Training conducted': TRAINING,
  Formateur: TRAINER,
}));

const ws = XLSX.utils.json_to_sheet(data);
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, 'Learners Database');

const outFile = path.join(outDir, 'demo-participants-import.xlsx');
XLSX.writeFile(wb, outFile);

console.log(`Fichier de démo créé : ${outFile}`);
console.log(`${data.length} participants — Formateur: ${TRAINER} — Formation: ${TRAINING}`);
