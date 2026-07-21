import mongoose from 'mongoose';
import Formation from '../src/models/Formation.js';
import Entity from '../src/models/Entity.js';
import xlsx from 'xlsx';
import path from 'path';
import 'dotenv/config';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/odc-platform';
const EXCEL_PATH = path.resolve('../Brief RSE 2026.xlsx');

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

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
        // Handle merged cells for Locations
        const location = row['Locations'] || lastLocation;
        if (row['Locations']) lastLocation = row['Locations'];

        const trainer = row['Formateur'] || '';
        const title = row['Nom de la formation / Activité'];
        if (!title) return null;

        const description = row['Description de la formation / activité'] || '';
        const dateStr = String(row['Date de la formation'] || '');
        const time = row['Heure'] || '';
        const status = row['Statut publication'] || 'draft';
        const link = row["Lien d'inscription"] || '';
        const sponsoring = row['Sponsoring'] || '';

        // Map to entity
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

        // Parse activity type
        let activityType = 'formation';
        if (lowTitle.includes('workshop') || lowTitle.includes('atelier')) activityType = 'workshop';
        if (lowTitle.includes('super codeur')) activityType = 'super_codeur';
        if (lowTitle.includes('pfe') || lowTitle.includes('soutenance')) activityType = 'pfe';

        // Attempt basic date parsing
        let dateStart = null;
        let dateEnd = null;
        
        // Match 15/01/2026 or 15-20/01/2026 or 15 & 16/01/2026
        const dateMatch = dateStr.match(/(\d{2})[\/-](\d{2})[\/-](\d{4})/);
        if (dateMatch) {
          dateStart = new Date(`${dateMatch[3]}-${dateMatch[2]}-${dateMatch[1]}`);
        } else {
          // Fallback for serial numbers if Excel read as number
          if (typeof row['Date de la formation'] === 'number') {
            dateStart = new Date((row['Date de la formation'] - 25569) * 86400 * 1000);
          }
        }

        return {
          title,
          description,
          trainerName: trainer,
          activityType,
          entityId: entityId || entities[0]._id,
          location,
          dateStart,
          dateEnd: dateEnd || dateStart,
          timeSlot: time,
          status: status.toLowerCase().includes('publi') ? 'publie' : 'draft',
          registrationLink: link,
          sponsoring: sponsoring ? String(sponsoring) : ''
        };
      }).filter(f => f !== null);

      if (formationsToInsert.length > 0) {
        await Formation.insertMany(formationsToInsert);
        totalCreated += formationsToInsert.length;
        console.log(`Seeded ${formationsToInsert.length} events from sheet: ${sheetName}`);
      }
    }

    console.log(`\nSuccessfully seeded ${totalCreated} total events from Brief RSE 2026.xlsx!`);
    process.exit();
  } catch (error) {
    console.error('Full seeding error:', error);
    process.exit(1);
  }
}

seed();
