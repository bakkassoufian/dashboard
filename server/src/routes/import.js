import express from 'express';
import multer from 'multer';
import mongoose from 'mongoose';
import XLSX from 'xlsx';
import Participant from '../models/Participant.js';
import Attendance from '../models/Attendance.js';
import Formation from '../models/Formation.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';
import { managerReadOnly } from '../middleware/rbac.js';

async function syncFormationStats(formationId) {
  const f = await Formation.findById(formationId).select('skipStatsOnImport').lean();
  if (f?.skipStatsOnImport) return;
  const id = new mongoose.Types.ObjectId(formationId);
  const inscrits = await Attendance.countDocuments({ formationId: id, status: 'inscrit' });
  const confirmes = await Attendance.countDocuments({
    formationId: id,
    status: { $in: ['confirme', 'confirme_present'] },
  });
  const valides = await Attendance.countDocuments({ formationId: id, status: 'valide' });
  await Formation.findByIdAndUpdate(formationId, {
    inscritsCount: inscrits,
    confirmesCount: confirmes,
    validesCount: valides,
  });
}

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });
const router = express.Router();
router.use(authenticate);
router.use(managerReadOnly);
router.use(authorize('super_admin', 'coordinator', 'member', 'member-odc-hybrid'));

function normGender(v) {
  if (!v) return '';
  const s = String(v).trim().toLowerCase();
  if (['h', 'homme', 'male', 'm'].includes(s)) return 'male';
  if (['f', 'femme', 'female', 'femme'].includes(s)) return 'female';
  return 'other';
}

function normNum(v) {
  if (v == null || v === '' || String(v).toLowerCase() === '#error!') return null;
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
}

function extractTrainerName(row) {
  return (
    row['Formateur'] ||
    row['formateur'] ||
    row['Trainer'] ||
    row['Trainer Name'] ||
    row['Nom du formateur'] ||
    ''
  ).toString().trim();
}

function normAge(v) {
  if (!v) return '';
  const s = String(v).trim().toLowerCase();
  if (s.includes('< 15') || s === '<15') return '< 15 years';
  if (s.includes('15 - 24') || s.includes('15-24')) return '15 - 24 years';
  if (s.includes('25 - 34') || s.includes('25-34')) return '25 - 34 years';
  if (s.includes('>= 35') || s.includes('>=35') || s.includes('> 35') || s.includes('>35') || s.includes('35+') || s.includes('plus de 35')) return '>= 35 years';
  
  const n = parseInt(s, 10);
  if (!isNaN(n)) {
    if (n < 15) return '< 15 years';
    if (n <= 24) return '15 - 24 years';
    if (n <= 34) return '25 - 34 years';
    return '>= 35 years';
  }
  return '';
}

function normProfession(v) {
  if (!v) return 'other';
  const s = String(v).trim().toLowerCase();
  if (s.includes('employé') || s.includes('salarie') || s.includes('employee') || s.includes('travail') || s.includes('work')) return 'employee';
  if (s.includes('étudiant') || s.includes('eleve') || s.includes('student') || s.includes('pupil') || s.includes('scolaire')) return 'student / pupil';
  if (s.includes('retraité') || s.includes('retired')) return 'retired';
  if (s.includes('chercheur d') || s.includes('job seeker') || s.includes('recherche')) return 'job seeker';
  if (s.includes('chômeur') || s.includes('unemployed') || s.includes('sans emploi')) return 'unemployed';
  return 'other';
}

function normLieu(v) {
  if (!v) return '';
  const s = String(v).trim().toLowerCase();
  
  if (s.includes('coding school') && s.includes('rabat')) return 'Coding School Rabat';
  if (s.includes('fablab') && s.includes('rabat')) return 'FabLab Rabat';
  if (s.includes('orange fab') && s.includes('rabat')) return 'Orange Fab Rabat';
  
  if (s.includes('coding school') && s.includes('agadir')) return 'Coding School Agadir';
  if (s.includes('fablab') && s.includes('agadir')) return 'FabLab Agadir';
  if (s.includes('orange fab') && s.includes('agadir')) return 'Orange Fab Agadir';
  
  if (s.includes('universit')) return 'University';
  if (s.includes('club') || s.includes('odc club')) return 'ODC Club';
  if (s.includes('online') || s.includes('ligne') || s.includes('distanciel')) return 'Online';
  
  // Fuzzy fallback
  if (s.includes('rabat')) {
    if (s.includes('code')) return 'Coding School Rabat';
    if (s.includes('fab')) return 'Orange Fab Rabat';
    return 'Coding School Rabat'; // Default Rabat
  }
  if (s.includes('agadir')) {
    if (s.includes('code')) return 'Coding School Agadir';
    if (s.includes('fab')) return 'Orange Fab Agadir';
    return 'Coding School Agadir'; // Default Agadir
  }
  
  return '';
}

router.post('/participants-excel', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) throw new AppError('Fichier manquant', 400);
    const wb = XLSX.read(req.file.buffer, { type: 'buffer', cellDates: true });

    const rawFormationId = (req.body?.formationId || req.query?.formationId || '').toString().trim();
    let targetFormation = null;
    if (rawFormationId) {
      if (!mongoose.Types.ObjectId.isValid(rawFormationId)) {
        throw new AppError('formationId invalide', 400);
      }
      targetFormation = await Formation.findById(rawFormationId);
      if (!targetFormation) throw new AppError('Formation / activité introuvable', 404);
      const scoped =
        ['member', 'member-odc-hybrid'].includes(req.user.role) && req.user.entityId;
      if (scoped && String(targetFormation.entityId) !== String(req.user.entityId._id)) {
        throw new AppError('Accès refusé à cette activité', 403);
      }
    }

    // Feuilles type "Learners Database", "Recap data", ou première feuille
    let sheetsToProcess = wb.SheetNames.filter(
      (name) => name.includes('Learners Database') || name === 'Recap data',
    );
    if (sheetsToProcess.length === 0 && wb.SheetNames.length > 0) {
      sheetsToProcess = [wb.SheetNames[0]];
    }
    if (sheetsToProcess.length === 0) {
      throw new AppError('Le fichier ne contient aucun onglet', 400);
    }

    let totalImported = 0;
    const errors = [];

    // Validation bloquante: le champ formateur est obligatoire dans le fichier importé.
    const missingTrainerRows = [];
    for (const sheetName of sheetsToProcess) {
      const sh = wb.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json(sh, { defval: '' });
      rows.forEach((row, idx) => {
        const firstName = row['Name'] || row['First Name'] || row['Prénom'] || '';
        const lastName = row['Last name'] || row['Last Name'] || row['Nom'] || '';
        const email = (row['e-mail'] || row['Email'] || row['email'] || '').toString().trim().toLowerCase();
        if (!email && !firstName && !lastName) return;
        if (!extractTrainerName(row)) {
          missingTrainerRows.push(`${sheetName} (ligne ${idx + 2})`);
        }
      });
    }
    if (missingTrainerRows.length > 0) {
      throw new AppError(
        `Import bloqué: le champ Formateur est vide dans ${missingTrainerRows.length} ligne(s): ${missingTrainerRows.slice(0, 10).join(', ')}${missingTrainerRows.length > 10 ? ', ...' : ''}`,
        400,
      );
    }

    for (const sheetName of sheetsToProcess) {
      const sh = wb.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json(sh, { defval: '' });
      
      for (const row of rows) {
        try {
          // Flexible mapping for various Excel headers
          const firstName = row['Name'] || row['First Name'] || row['Prénom'] || '';
          const lastName = row['Last name'] || row['Last Name'] || row['Nom'] || '';
          const email = (row['e-mail'] || row['Email'] || row['email'] || '').toString().trim().toLowerCase();
          
          if (!email && !firstName && !lastName) continue;

          const gender = normGender(row['Gender '] || row['Gender'] || row['Genre'] || row['Sexe']);
          const rawAge = (row['Age'] || row['age'] || '').toString().trim();
          const ageCategory = normAge(rawAge);
          
          const rawSocioCategory = (row['socio-professional category '] || row['socio-professional category'] || row['Profession'] || '').toString().trim();
          const socioProfessionalCategory = normProfession(rawSocioCategory);

          const institution = (row['if student,specify university '] || row['if student, specify university'] || row['Établissement'] || '').toString().trim();
          const specialty = (row['if student, specify the specialty '] || row['if student, specify the specialty'] || row['Spécialité'] || '').toString().trim();
          const phone = (row['Phone Number'] || row['Téléphone'] || row['phone'] || '').toString().trim();
          
          const rawLieu = (row['Lieu'] || row['Place'] || '').toString().trim();
          const lieu = normLieu(rawLieu);

          const trainingDate = row['Training Date'] || row['Date'] || null;
          const trainingDuration = normNum(row['Training Duration (number of days)'] || row['Training Duration'] || null);
          const trainingName = (row['Name of Training conducted'] || row['Formation'] || '').toString().trim();

          // Update or Create Participant
          const sourceFormationLabel = targetFormation
            ? (trainingName || targetFormation.title || '')
            : trainingName;
          const participantData = {
            firstName: String(firstName).trim(),
            lastName: String(lastName).trim(),
            email: email || undefined,
            gender,
            age: rawAge,
            ageCategory,
            socioProfessionalCategory,
            institution,
            specialty,
            phone,
            lieu,
            trainingDate: trainingDate instanceof Date ? trainingDate : null,
            trainingDuration,
            sourceFormation: sourceFormationLabel,
            sourceYear: trainingDate instanceof Date ? trainingDate.getFullYear() : new Date().getFullYear(),
          };

          let participant;
          if (email) {
            participant = await Participant.findOneAndUpdate({ email }, participantData, { upsert: true, new: true });
          } else {
            participant = await Participant.create(participantData);
          }

          if (targetFormation) {
            await Attendance.findOneAndUpdate(
              { participantId: participant._id, formationId: targetFormation._id },
              { status: 'valide' },
              { upsert: true },
            );
          } else if (trainingName) {
            const formationQuery = { title: new RegExp(trainingName, 'i') };
            if (req.user.role !== 'super_admin' && req.user.entityId) {
              formationQuery.entityId = req.user.entityId;
            }
            const formation = await Formation.findOne(formationQuery);
            if (formation) {
              await Attendance.findOneAndUpdate(
                { participantId: participant._id, formationId: formation._id },
                { status: 'confirme_present' },
                { upsert: true },
              );
            }
          }

          totalImported++;
        } catch (err) {
          errors.push(`Error in sheet ${sheetName} for row ${JSON.stringify(row)}: ${err.message}`);
        }
      }
    }

    if (targetFormation) {
      await syncFormationStats(targetFormation._id);
    }

    res.json({ success: true, data: { imported: totalImported, errors: errors.length > 0 ? errors : undefined, formationId: targetFormation?._id } });
  } catch (e) { next(e); }
});

export default router;
