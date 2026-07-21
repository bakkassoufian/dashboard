import mongoose from 'mongoose';
import Formation from '../src/models/Formation.js';
import Entity from '../src/models/Entity.js';
import xlsx from 'xlsx';
import path from 'path';
import 'dotenv/config';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/odc-platform';
const EXCEL_PATH = path.resolve('../Brief RSE 2026.xlsx');

const MONTH_MAP = {
  'janvier': 0, 'fevrier': 1, 'février': 1, 'mars': 2, 'avril': 3, 'mai': 4, 'juin': 5,
  'juillet': 6, 'aout': 7, 'août': 7, 'septembre': 8, 'octobre': 9, 'novembre': 10, 'decembre': 11, 'décembre': 11
};

function parseDateRange(dateStr, defaultYear = 2026) {
  if (!dateStr || typeof dateStr !== 'string') return { start: null, end: null };
  
  const clean = dateStr.toLowerCase().trim().replace(/\s+/g, ' ');
  let start = null;
  let end = null;

  // Pattern: "18 au 20 mai" or "du 18 au 20 mai"
  const auMatch = clean.match(/(?:du\s+)?(\d{1,2})\s+au\s+(\d{1,2})\s+([a-zéû]+)/);
  if (auMatch) {
    const month = MONTH_MAP[auMatch[3]] || 0;
    start = new Date(defaultYear, month, parseInt(auMatch[1]));
    end = new Date(defaultYear, month, parseInt(auMatch[2]));
    return { start, end };
  }

  // Pattern: "12 & 13 janvier"
  const andWordMatch = clean.match(/(\d{1,2})\s*&\s*(\d{1,2})\s+([a-zéû]+)/);
  if (andWordMatch) {
    const month = MONTH_MAP[andWordMatch[3]] || 0;
    start = new Date(defaultYear, month, parseInt(andWordMatch[1]));
    end = new Date(defaultYear, month, parseInt(andWordMatch[2]));
    return { start, end };
  }

  // Pattern: "18-20/02/2026" or "18-20 /02"
  const dashMatch = clean.match(/(\d{1,2})\s*-\s*(\d{1,2})\s*[\/]\s*(\d{1,2})(?:\s*[\/]\s*(\d{4}))?/);
  if (dashMatch) {
    const year = dashMatch[4] ? parseInt(dashMatch[4]) : defaultYear;
    const month = parseInt(dashMatch[3]) - 1;
    start = new Date(year, month, parseInt(dashMatch[1]));
    end = new Date(year, month, parseInt(dashMatch[2]));
    return { start, end };
  }

  // Pattern: "11 & 12/02"
  const andSlashMatch = clean.match(/(\d{1,2})\s*&\s*(\d{1,2})\s*[\/]\s*(\d{1,2})/);
  if (andSlashMatch) {
    const month = parseInt(andSlashMatch[3]) - 1;
    start = new Date(defaultYear, month, parseInt(andSlashMatch[1]));
    end = new Date(defaultYear, month, parseInt(andSlashMatch[2]));
    return { start, end };
  }

  // Pattern: "23/02 > 24/02"
  const arrowMatch = clean.match(/(\d{1,2})\/(\d{1,2})\s*>\s*(\d{1,2})\/(\d{1,2})/);
  if (arrowMatch) {
    start = new Date(defaultYear, parseInt(arrowMatch[2]) - 1, parseInt(arrowMatch[1]));
    end = new Date(defaultYear, parseInt(arrowMatch[4]) - 1, parseInt(arrowMatch[3]));
    return { start, end };
  }

  // Standard: "15/01/2026"
  const stdMatch = clean.match(/(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})/);
  if (stdMatch) {
    start = new Date(parseInt(stdMatch[3]), parseInt(stdMatch[2]) - 1, parseInt(stdMatch[1]));
    return { start, end: start };
  }
  
  // Month string only: "15 janvier"
  const monthOnlyMatch = clean.match(/(\d{1,2})\s+([a-zéû]+)/);
  if (monthOnlyMatch && MONTH_MAP[monthOnlyMatch[2]] !== undefined) {
    start = new Date(defaultYear, MONTH_MAP[monthOnlyMatch[2]], parseInt(monthOnlyMatch[1]));
    return { start, end: start };
  }

  return { start: null, end: null };
}

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clean up previously seeded 2026 data to avoid duplicates with wrong dates
    await Formation.deleteMany({ dateStart: { $gte: new Date('2026-01-01') } });
    console.log('Cleaned up existing 2026 data');

    const workbook = xlsx.readFile(EXCEL_PATH);
    const entities = await Entity.find();
    
    const edc = entities.find(e => e.name.includes('Code'))?._id;
    const fab = entities.find(e => e.name.includes('FabLab'))?._id;
    const ofab = entities.find(e => e.name.includes('Fab'))?._id;

    let totalCreated = 0;

    for (const sheetName of workbook.SheetNames) {
      const sheet = workbook.Sheets[sheetName];
      const rows = xlsx.utils.sheet_to_json(sheet);
      
      let lastLocation = '';
      
      const formationsToInsert = rows.map(row => {
        const location = row['Locations'] || lastLocation;
        if (row['Locations']) lastLocation = row['Locations'];

        const trainer = row['Formateur'] || '';
        const title = row['Nom de la formation / Activité'];
        if (!title) return null;

        const description = row['Description de la formation / activité'] || '';
        const dateStr = String(row['Date de la formation'] || '');
        const clean = dateStr.toLowerCase().trim().replace(/\s+/g, ' ');
        const defaultYear = 2026;

        const time = row['Heure'] || '';
        const status = row['Statut publication'] || 'draft';
        const link = row["Lien d'inscription"] || '';
        const sponsoring = row['Sponsoring'] || '';

        let entityId = edc;
        const lowTrainer = trainer.toLowerCase();
        const lowTitle = title.toLowerCase();
        const lowLoc = location.toLowerCase();

        if (lowLoc.includes('fablab') || lowTrainer.includes('fablab') || lowTitle.includes('repair') || lowTitle.includes('3d') || lowTitle.includes('laser')) {
          entityId = fab;
        }
        if (lowLoc.includes('orange fab') || lowTrainer.includes('orange fab')) {
          entityId = ofab;
        }

        // MULTI-SESSION LOGIC FOR SUPER CODEURS
        const isSuperCodeur = lowTitle.includes('super codeur');
        
        if (isSuperCodeur) {
          // Pattern: "22 et 29 Avril" or "22-29/04" or "08-15 /04"
          const multiMatch = clean.match(/(\d{1,2})\s*(?:et|-)\s*(\d{1,2})\s*([\/a-zéû ]+)/);
          if (multiMatch) {
            const d1 = parseInt(multiMatch[1]);
            const d2 = parseInt(multiMatch[2]);
            const monthPart = multiMatch[3].trim();
            let month = 0;
            
            if (monthPart.includes('/')) {
              month = parseInt(monthPart.replace('/', '')) - 1;
            } else {
              month = MONTH_MAP[monthPart.split(' ')[0]] || 0;
            }

            // Create two separate sessions
            const sessions = [
              { d: d1, month },
              { d: d2, month }
            ].map(s => {
              const dStart = new Date(defaultYear, s.month, s.d);
              if (isNaN(dStart.getTime())) {
                console.warn(`[SKIP] Invalid Date for Super Codeur: ${title} (${s.d} / ${s.month})`);
                return null;
              }
              return {
                title,
                description,
                trainerName: trainer,
                activityType: 'super_codeur',
                entityId: entityId || entities[0]._id,
                location,
                dateStart: dStart,
                dateEnd: dStart,
                timeSlot: time,
                status: status.toLowerCase().includes('publi') ? 'publie' : 'draft',
                registrationLink: link,
                sponsoring: sponsoring ? String(sponsoring) : ''
              };
            }).filter(s => s !== null);
            return sessions;
          }
        }

        // IMPROVED DATE PARSING FOR RANGES
        const { start, end } = parseDateRange(dateStr);
        let dateStart = start;
        let dateEnd = end || start;

        if (!dateStart && typeof row['Date de la formation'] === 'number') {
          dateStart = new Date((row['Date de la formation'] - 25569) * 86400 * 1000);
          dateEnd = dateStart;
        }

        if (!dateStart || isNaN(dateStart.getTime())) {
           // console.warn(`[SKIP] Could not parse date for: ${title} - "${dateStr}"`);
           return null;
        }

        let activityType = 'formation';
        if (lowTitle.includes('workshop') || lowTitle.includes('atelier')) activityType = 'workshop';
        if (lowTitle.includes('super codeur')) activityType = 'super_codeur';

        return {
          title,
          description,
          trainerName: trainer,
          activityType,
          entityId: entityId || entities[0]._id,
          location,
          dateStart,
          dateEnd,
          timeSlot: time,
          status: status.toLowerCase().includes('publi') ? 'publie' : 'draft',
          registrationLink: link,
          sponsoring: sponsoring ? String(sponsoring) : ''
        };
      }).flat().filter(f => f !== null);

      if (formationsToInsert.length > 0) {
        await Formation.insertMany(formationsToInsert);
        totalCreated += formationsToInsert.length;
        console.log(`Seeded ${formationsToInsert.length} events from sheet: ${sheetName}`);
      }
    }

    console.log(`\nSuccessfully seeded ${totalCreated} total events with FIXED Date Ranges!`);
    process.exit();
  } catch (error) {
    console.error('Full seeding error:', error);
    process.exit(1);
  }
}

seed();
