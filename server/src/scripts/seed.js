import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Entity from '../models/Entity.js';
import Formation from '../models/Formation.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/odc-platform';

async function seed() {
  await mongoose.connect(MONGODB_URI);
  await User.deleteMany({});
  await Entity.deleteMany({});
  await Formation.deleteMany({});

  const entities = await Entity.insertMany([
    // Agadir — Orange Digital Center (même trio que Rabat)
    {
      name: 'Ecole du Code Agadir',
      type: 'Ecole du Code',
      location: 'Agadir',
      description: 'Orange Digital Center — Agadir',
    },
    {
      name: 'FabLab Solidaire Agadir',
      type: 'FabLab Solidaire',
      location: 'Agadir',
      description: 'Orange Digital Center — Agadir',
    },
    {
      name: 'Orange Fab Agadir',
      type: 'Orange Fab',
      location: 'Agadir',
      description: 'Orange Digital Center — Agadir',
    },
    // Rabat — Orange Digital Center (École du Code, Orange Fab, FabLab Solidaire)
    {
      name: 'Ecole du Code Rabat',
      type: 'Ecole du Code',
      location: 'Rabat',
      description: 'Orange Digital Center — Rabat',
    },
    {
      name: 'FabLab Solidaire Rabat',
      type: 'FabLab Solidaire',
      location: 'Rabat',
      description: 'Orange Digital Center — Rabat',
    },
    {
      name: 'Orange Fab Rabat',
      type: 'Orange Fab',
      location: 'Rabat',
      description: 'Orange Digital Center — Rabat',
    },
    // Casablanca — ODC Club : uniquement École du Code (pas de trio Fab / Orange Fab sur site)
    {
      name: 'Orange Digital Center Club Sidi Maarouf',
      type: 'Ecole du Code',
      location: 'Casablanca',
      description: 'ODC Club Casablanca — offre limitée à l’École du Code',
    },
    {
      name: 'Orange Digital Center Club Ben M\'Sik',
      type: 'Ecole du Code',
      location: 'Casablanca',
      description: 'ODC Club Casablanca — offre limitée à l’École du Code',
    },
  ]);

  // Use create() so pre('save') hashes passwords; insertMany() bypasses save middleware
  await User.create([
    { email: 'admin@odc.ma', password: 'Admin123!', firstName: 'Super', lastName: 'Admin', role: 'super_admin' },
    { email: 'manager@odc.ma', password: 'Manager123!', firstName: 'Senior', lastName: 'Manager', role: 'manager' },
    { email: 'coordinator@odc.ma', password: 'Coord123!', firstName: 'Global', lastName: 'Coordinator', role: 'coordinator' },
    { email: 'member_edc@odc.ma', password: 'Member123!', firstName: 'Edc', lastName: 'Trainer', role: 'member', entityId: entities[0]._id },
    { email: 'member_fablab@odc.ma', password: 'Member123!', firstName: 'Fablab', lastName: 'Maker', role: 'member', entityId: entities[1]._id },
    { email: 'member_orangefab@odc.ma', password: 'Member123!', firstName: 'Orange', lastName: 'Fab', role: 'member', entityId: entities[2]._id },
  ]);

  await Formation.insertMany([
    { title: 'Fundamentals of Relational Data SQL', trainerName: 'Hamza LAMBARA', entityId: entities[0]._id, location: 'Agadir', dateStart: new Date('2026-03-24'), dateEnd: new Date('2026-03-25'), timeSlot: '09h30 - 16h00', status: 'publie', registrationLink: 'https://forms.gle/YjBDYib75pD64FmSA' },
    { title: 'Modern NoSQL Data Systems', trainerName: 'Hamza LAMBARA', entityId: entities[0]._id, location: 'Agadir', dateStart: new Date('2026-03-31'), timeSlot: '09h30 - 16h00', status: 'en_cours_production', registrationLink: 'https://forms.gle/3hpKB13Ctf3NThZE6' },
    { title: 'Manipulation des données avec SQL', trainerName: 'Hamza EL GHIBARI', entityId: entities[2]._id, location: 'Rabat', dateStart: new Date('2026-03-12'), dateEnd: new Date('2026-03-13'), timeSlot: '09h30 - 15h00', status: 'publie', registrationLink: 'https://forms.gle/Vgj6KyhNVYs8q9wDA' },
  ]);

  console.log('Seed done: entities, users (admin, manager, coordinator, member_edc, member_fablab, member_orangefab), formations');
  await mongoose.disconnect();
}

seed().catch((e) => { console.error(e); process.exit(1); });
